import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePluginStore } from 'stores/plugin-store.js'

describe('pluginStore', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = usePluginStore()
  })

  describe('registerPlugin()', () => {
    it('should register a valid plugin', () => {
      const plugin = {
        id: 'test-plugin',
        name: 'Test Plugin',
        category: 'applications',
      }

      const result = store.registerPlugin(plugin)

      expect(result).toBe(true)
      expect(store.plugins).toHaveLength(1)
      expect(store.plugins[0].id).toBe('test-plugin')
    })

    it('should reject plugin without id', () => {
      const result = store.registerPlugin({ name: 'Bad', category: 'core' })
      expect(result).toBe(false)
      expect(store.plugins).toHaveLength(0)
    })

    it('should reject plugin without name', () => {
      const result = store.registerPlugin({ id: 'bad', category: 'core' })
      expect(result).toBe(false)
    })

    it('should reject plugin without category', () => {
      const result = store.registerPlugin({ id: 'bad', name: 'Bad' })
      expect(result).toBe(false)
    })

    it('should reject plugin with invalid category', () => {
      const result = store.registerPlugin({
        id: 'bad',
        name: 'Bad',
        category: 'invalid',
      })
      expect(result).toBe(false)
    })

    it('should reject duplicate plugin id', () => {
      store.registerPlugin({ id: 'dup', name: 'First', category: 'core' })
      const result = store.registerPlugin({ id: 'dup', name: 'Second', category: 'core' })

      expect(result).toBe(false)
      expect(store.plugins).toHaveLength(1)
    })

    it('should accept all valid categories', () => {
      const categories = ['core', 'data', 'router', 'applications', 'networks']
      for (const category of categories) {
        const result = store.registerPlugin({
          id: `plugin-${category}`,
          name: `Plugin ${category}`,
          category,
        })
        expect(result).toBe(true)
      }
      expect(store.plugins).toHaveLength(5)
    })
  })

  describe('menuByCategory', () => {
    it('should group menu items by category', () => {
      store.registerPlugin({
        id: 'p1',
        name: 'Plugin 1',
        category: 'core',
        menuItems: [{ label: 'Item 1', route: '/item1', order: 1 }],
      })
      store.registerPlugin({
        id: 'p2',
        name: 'Plugin 2',
        category: 'core',
        menuItems: [{ label: 'Item 2', route: '/item2', order: 0 }],
      })
      store.registerPlugin({
        id: 'p3',
        name: 'Plugin 3',
        category: 'data',
        menuItems: [{ label: 'Item 3', route: '/item3' }],
      })

      const menu = store.menuByCategory

      expect(menu.core).toHaveLength(2)
      // Item 2 should come first (order: 0 < 1)
      expect(menu.core[0].label).toBe('Item 2')
      expect(menu.core[1].label).toBe('Item 1')
      expect(menu.data).toHaveLength(1)
      expect(menu.applications).toHaveLength(0)
    })
  })

  describe('headerWidgets', () => {
    it('should collect header widgets from all plugins', () => {
      const widget1 = { name: 'widget1' }
      const widget2 = { name: 'widget2' }

      store.registerPlugin({
        id: 'p1',
        name: 'P1',
        category: 'core',
        headerWidgets: [widget1],
      })
      store.registerPlugin({
        id: 'p2',
        name: 'P2',
        category: 'data',
        headerWidgets: [widget2],
      })

      expect(store.headerWidgets).toHaveLength(2)
      expect(store.headerWidgets).toContainEqual(widget1)
      expect(store.headerWidgets).toContainEqual(widget2)
    })
  })

  describe('getPluginRoutes()', () => {
    it('should collect routes from all plugins', () => {
      store.registerPlugin({
        id: 'p1',
        name: 'P1',
        category: 'core',
        routes: [{ path: '/route1' }, { path: '/route2' }],
      })
      store.registerPlugin({
        id: 'p2',
        name: 'P2',
        category: 'data',
        routes: [{ path: '/route3' }],
      })

      const routes = store.getPluginRoutes()
      expect(routes).toHaveLength(3)
    })
  })
})
