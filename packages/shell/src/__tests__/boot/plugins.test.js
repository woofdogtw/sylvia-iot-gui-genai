import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePluginStore } from 'stores/plugin-store.js'
import { registerWithRoutes, loadExternalPlugins } from 'boot/plugins.js'

// Mock Quasar Dark module (needed by app-store which plugin-store may reference)
vi.mock('quasar', () => ({
  Dark: { set: vi.fn() },
}))

describe('plugins boot', () => {
  let pluginStore
  let mockRouter

  beforeEach(() => {
    setActivePinia(createPinia())
    pluginStore = usePluginStore()
    mockRouter = { addRoute: vi.fn() }
  })

  describe('registerWithRoutes', () => {
    it('should register plugin and add routes to router', () => {
      const plugin = {
        id: 'test',
        name: 'Test',
        category: 'core',
        routes: [
          { path: '/test-page', name: 'test-page', component: { template: '<div>Test</div>' } },
        ],
      }

      registerWithRoutes(pluginStore, mockRouter, plugin)

      expect(pluginStore.plugins).toHaveLength(1)
      expect(mockRouter.addRoute).toHaveBeenCalledOnce()
    })

    it('should strip leading slash from route paths', () => {
      const plugin = {
        id: 'slash',
        name: 'Slash',
        category: 'core',
        routes: [
          { path: '/my-page', name: 'my-page', component: { template: '<div />' } },
        ],
      }

      registerWithRoutes(pluginStore, mockRouter, plugin)

      const addedRoute = mockRouter.addRoute.mock.calls[0][1]
      expect(addedRoute.path).toBe('my-page')
    })

    it('should add requiresAuth meta to routes', () => {
      const plugin = {
        id: 'auth-test',
        name: 'Auth Test',
        category: 'data',
        routes: [
          { path: '/secure', name: 'secure', component: { template: '<div />' } },
        ],
      }

      registerWithRoutes(pluginStore, mockRouter, plugin)

      const addedRoute = mockRouter.addRoute.mock.calls[0][1]
      expect(addedRoute.meta.requiresAuth).toBe(true)
    })

    it('should register plugin without routes', () => {
      const plugin = {
        id: 'no-routes',
        name: 'No Routes',
        category: 'applications',
        menuItems: [{ label: 'Link', route: 'https://example.com' }],
      }

      registerWithRoutes(pluginStore, mockRouter, plugin)

      expect(pluginStore.plugins).toHaveLength(1)
      expect(mockRouter.addRoute).not.toHaveBeenCalled()
    })
  })

  describe('loadExternalPlugins', () => {
    it('should return empty array when config.plugins is undefined', async () => {
      delete window.config.plugins
      const result = await loadExternalPlugins()
      expect(result).toEqual([])
    })

    it('should return empty array when config.plugins is empty array', async () => {
      window.config.plugins = []
      const result = await loadExternalPlugins()
      expect(result).toEqual([])
    })
  })
})
