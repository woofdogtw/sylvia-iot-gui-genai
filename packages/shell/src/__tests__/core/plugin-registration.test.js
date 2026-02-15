import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePluginStore } from 'stores/plugin-store.js'
import { useAuthStore } from 'stores/auth-store.js'
import { validatePlugin } from '@sylvia-iot/shared'
import mfeCore from '@sylvia-iot/mfe-core'

describe('Core plugin registration', () => {
  let pluginStore

  beforeEach(() => {
    setActivePinia(createPinia())
    pluginStore = usePluginStore()
    // Set admin role so role-filtered menu items (User, Client) are visible
    const authStore = useAuthStore()
    authStore.user = { roles: { admin: true } }
  })

  it('should validate the core plugin interface', () => {
    const { valid, errors } = validatePlugin(mfeCore)
    expect(valid).toBe(true)
    expect(errors).toHaveLength(0)
  })

  it('should register as a core category plugin', () => {
    const registered = pluginStore.registerPlugin(mfeCore)
    expect(registered).toBe(true)
    expect(pluginStore.plugins).toHaveLength(1)
    expect(pluginStore.plugins[0].id).toBe('mfe-core')
    expect(pluginStore.plugins[0].category).toBe('core')
  })

  it('should provide 9 menu items in correct order', () => {
    pluginStore.registerPlugin(mfeCore)
    const menu = pluginStore.menuByCategory.core
    expect(menu).toHaveLength(9)
    expect(menu[0].label).toBe('core.menu.user')
    expect(menu[1].label).toBe('core.menu.client')
    expect(menu[2].label).toBe('core.menu.unit')
    expect(menu[3].label).toBe('core.menu.application')
    expect(menu[4].label).toBe('core.menu.network')
    expect(menu[5].label).toBe('core.menu.device')
    expect(menu[6].label).toBe('core.menu.deviceRoute')
    expect(menu[7].label).toBe('core.menu.networkRoute')
    expect(menu[8].label).toBe('core.menu.dlDataBuffer')
  })

  it('should provide 9 routes for management pages', () => {
    pluginStore.registerPlugin(mfeCore)
    const routes = pluginStore.getPluginRoutes()
    expect(routes).toHaveLength(9)

    const paths = routes.map((r) => r.path)
    expect(paths).toContain('/core/user')
    expect(paths).toContain('/core/client')
    expect(paths).toContain('/core/unit')
    expect(paths).toContain('/core/application')
    expect(paths).toContain('/core/network')
    expect(paths).toContain('/core/device')
    expect(paths).toContain('/core/device-route')
    expect(paths).toContain('/core/network-route')
    expect(paths).toContain('/core/dldata-buffer')
  })

  it('should have unique route names', () => {
    pluginStore.registerPlugin(mfeCore)
    const routes = pluginStore.getPluginRoutes()
    const names = routes.map((r) => r.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('should have icons for all menu items', () => {
    pluginStore.registerPlugin(mfeCore)
    const menu = pluginStore.menuByCategory.core
    for (const item of menu) {
      expect(item.icon).toBeTruthy()
    }
  })
})
