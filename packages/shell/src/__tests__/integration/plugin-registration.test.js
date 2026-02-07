import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePluginStore } from 'stores/plugin-store.js'
import { validatePlugin } from '@sylvia-iot/shared'
import mfeExample from '@sylvia-iot/mfe-example'

describe('Plugin registration integration', () => {
  let pluginStore

  beforeEach(() => {
    setActivePinia(createPinia())
    pluginStore = usePluginStore()
  })

  it('should validate and register the example plugin', () => {
    const { valid, errors } = validatePlugin(mfeExample)
    expect(valid).toBe(true)
    expect(errors).toHaveLength(0)

    const registered = pluginStore.registerPlugin(mfeExample)
    expect(registered).toBe(true)
  })

  it('should add example plugin menu items to applications category', () => {
    pluginStore.registerPlugin(mfeExample)

    const menu = pluginStore.menuByCategory
    expect(menu.applications).toHaveLength(1)
    expect(menu.applications[0].label).toBe('Example')
    expect(menu.applications[0].icon).toBe('science')
  })

  it('should provide routes from example plugin', () => {
    pluginStore.registerPlugin(mfeExample)

    const routes = pluginStore.getPluginRoutes()
    expect(routes).toHaveLength(1)
    expect(routes[0].path).toBe('/example')
  })

  it('should validate an invalid plugin', () => {
    const badPlugin = { id: 123, category: 'wrong' }
    const { valid, errors } = validatePlugin(badPlugin)

    expect(valid).toBe(false)
    expect(errors.length).toBeGreaterThan(0)
  })

  it('should register multiple plugins across categories', () => {
    pluginStore.registerPlugin(mfeExample)
    pluginStore.registerPlugin({
      id: 'core-mgmt',
      name: 'Core Management',
      category: 'core',
      menuItems: [{ label: 'Users', route: '/core/users', order: 0 }],
    })
    pluginStore.registerPlugin({
      id: 'data-viewer',
      name: 'Data Viewer',
      category: 'data',
      menuItems: [{ label: 'Data', route: '/data/view', order: 0 }],
    })

    expect(pluginStore.plugins).toHaveLength(3)
    expect(pluginStore.menuByCategory.core).toHaveLength(1)
    expect(pluginStore.menuByCategory.data).toHaveLength(1)
    expect(pluginStore.menuByCategory.applications).toHaveLength(1)
  })
})
