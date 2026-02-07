import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * Menu categories for the hamburger menu.
 * Plugins register their menu items under one of these categories.
 */
const CATEGORIES = ['core', 'data', 'router', 'applications', 'networks']

export const usePluginStore = defineStore('plugin', () => {
  const plugins = ref([])

  /**
   * Get all menu items grouped by category.
   */
  const menuByCategory = computed(() => {
    const grouped = {}
    for (const cat of CATEGORIES) {
      grouped[cat] = []
    }
    for (const plugin of plugins.value) {
      const cat = plugin.category
      if (grouped[cat]) {
        grouped[cat].push(...(plugin.menuItems || []))
      }
    }
    // Sort items by order within each category
    for (const cat of CATEGORIES) {
      grouped[cat].sort((a, b) => (a.order || 0) - (b.order || 0))
    }
    return grouped
  })

  /**
   * Get all header widgets from registered plugins.
   */
  const headerWidgets = computed(() => {
    return plugins.value.flatMap((p) => p.headerWidgets || [])
  })

  /**
   * Register a plugin. Validates required fields.
   * Returns true if registration succeeded.
   */
  function registerPlugin(plugin) {
    if (!plugin.id || !plugin.name || !plugin.category) {
      console.error(
        `[PluginStore] Plugin registration failed: missing required fields (id, name, category).`,
        plugin,
      )
      return false
    }

    if (!CATEGORIES.includes(plugin.category)) {
      console.error(
        `[PluginStore] Plugin "${plugin.id}" has invalid category "${plugin.category}". ` +
        `Valid categories: ${CATEGORIES.join(', ')}`,
      )
      return false
    }

    if (plugins.value.some((p) => p.id === plugin.id)) {
      console.warn(`[PluginStore] Plugin "${plugin.id}" is already registered. Skipping.`)
      return false
    }

    plugins.value.push(plugin)
    return true
  }

  /**
   * Get all routes from registered plugins.
   */
  function getPluginRoutes() {
    return plugins.value.flatMap((p) => p.routes || [])
  }

  return {
    plugins,
    menuByCategory,
    headerWidgets,
    registerPlugin,
    getPluginRoutes,
    CATEGORIES,
  }
})
