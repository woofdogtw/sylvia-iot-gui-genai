import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePluginStore } from 'stores/plugin-store.js'
import { validatePlugin } from '@sylvia-iot/shared'
import mfeRouter from '@sylvia-iot/mfe-router'

describe('Router plugin registration', () => {
  let pluginStore

  beforeEach(() => {
    setActivePinia(createPinia())
    pluginStore = usePluginStore()
  })

  it('should validate the router plugin interface', () => {
    const { valid, errors } = validatePlugin(mfeRouter)
    expect(valid).toBe(true)
    expect(errors).toHaveLength(0)
  })

  it('should register as a router category plugin', () => {
    const registered = pluginStore.registerPlugin(mfeRouter)
    expect(registered).toBe(true)
    expect(pluginStore.plugins).toHaveLength(1)
    expect(pluginStore.plugins[0].id).toBe('mfe-router')
    expect(pluginStore.plugins[0].category).toBe('router')
  })

  it('should provide 5 menu items in correct order', () => {
    pluginStore.registerPlugin(mfeRouter)
    const menu = pluginStore.menuByCategory.router
    expect(menu).toHaveLength(5)
    expect(menu[0].label).toBe('router.menu.dashboard')
    expect(menu[1].label).toBe('router.menu.wan')
    expect(menu[2].label).toBe('router.menu.lan')
    expect(menu[3].label).toBe('router.menu.wlan')
    expect(menu[4].label).toBe('router.menu.wwan')
  })

  it('should provide 5 routes for router pages', () => {
    pluginStore.registerPlugin(mfeRouter)
    const routes = pluginStore.getPluginRoutes()
    expect(routes).toHaveLength(5)

    const paths = routes.map((r) => r.path)
    expect(paths).toContain('/router/dashboard')
    expect(paths).toContain('/router/wan')
    expect(paths).toContain('/router/lan')
    expect(paths).toContain('/router/wlan')
    expect(paths).toContain('/router/wwan')
  })

  it('should have unique route names', () => {
    pluginStore.registerPlugin(mfeRouter)
    const routes = pluginStore.getPluginRoutes()
    const names = routes.map((r) => r.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('should have icons for all menu items', () => {
    pluginStore.registerPlugin(mfeRouter)
    const menu = pluginStore.menuByCategory.router
    for (const item of menu) {
      expect(item.icon).toBeTruthy()
    }
  })

  it('should provide 2 header widgets', () => {
    pluginStore.registerPlugin(mfeRouter)
    const widgets = pluginStore.headerWidgets
    expect(widgets).toHaveLength(2)
    expect(widgets[0].id).toBe('router-clock')
    expect(widgets[1].id).toBe('router-version')
  })

  it('should have Vue components for all header widgets', () => {
    pluginStore.registerPlugin(mfeRouter)
    const widgets = pluginStore.headerWidgets
    for (const widget of widgets) {
      expect(widget.component).toBeTruthy()
      expect(typeof widget.component).toBe('object')
    }
  })
})
