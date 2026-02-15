import { boot } from 'quasar/wrappers'
import { usePluginStore } from 'stores/plugin-store.js'
import mfeCore from '@sylvia-iot/mfe-core'
import mfeExample from '@sylvia-iot/mfe-example'

/**
 * Builtin plugins (statically imported).
 * To add a new builtin plugin, import it and add to this array.
 */
const builtinPlugins = [
  mfeCore,
  mfeExample,
]

/**
 * Register a single plugin: add to plugin store and register routes.
 */
export function registerWithRoutes(pluginStore, router, plugin) {
  const registered = pluginStore.registerPlugin(plugin)
  if (registered && plugin.routes?.length) {
    for (const route of plugin.routes) {
      router.addRoute('root', {
        ...route,
        path: route.path.replace(/^\//, ''),
        meta: { ...route.meta, requiresAuth: true },
      })
    }
  }
}

/**
 * Load external plugins defined in window.config.plugins.
 * Each entry is a URL to an ES module with a default plugin export.
 */
export async function loadExternalPlugins() {
  const urls = window.config?.plugins
  if (!Array.isArray(urls) || urls.length === 0) {
    return []
  }

  const results = await Promise.allSettled(
    urls.map((url) => import(/* @vite-ignore */ url)),
  )

  const plugins = []
  for (let i = 0; i < results.length; i++) {
    const result = results[i]
    const url = urls[i]

    if (result.status === 'rejected') {
      console.error(`[Plugins] Failed to load external plugin from "${url}":`, result.reason)
      continue
    }

    const plugin = result.value.default
    if (!plugin || typeof plugin !== 'object') {
      console.error(`[Plugins] External plugin from "${url}" does not have a valid default export.`)
      continue
    }

    plugins.push(plugin)
  }

  return plugins
}

export default boot(async ({ store, router }) => {
  const pluginStore = usePluginStore(store)

  // Register builtin plugins
  for (const plugin of builtinPlugins) {
    registerWithRoutes(pluginStore, router, plugin)
  }

  // Load and register external plugins
  const externalPlugins = await loadExternalPlugins()
  for (const plugin of externalPlugins) {
    registerWithRoutes(pluginStore, router, plugin)
  }
})
