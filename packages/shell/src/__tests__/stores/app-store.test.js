import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAppStore } from 'stores/app-store.js'

// Mock Quasar Dark module
vi.mock('quasar', () => ({
  Dark: {
    set: vi.fn(),
  },
}))

describe('appStore', () => {
  let store

  beforeEach(() => {
    localStorage.clear()
    // Default: desktop (pointer: fine)
    window.matchMedia = vi.fn().mockReturnValue({ matches: false })
    setActivePinia(createPinia())
    store = useAppStore()
  })

  describe('initial state', () => {
    it('should default to en-US locale', () => {
      expect(store.locale).toBe('en-US')
    })

    it('should default to light mode on desktop', () => {
      expect(store.isDark).toBe(false)
    })

    it('should default to dark mode on mobile (pointer: coarse)', () => {
      localStorage.clear()
      window.matchMedia = vi.fn().mockReturnValue({ matches: true })
      setActivePinia(createPinia())
      const mobileStore = useAppStore()
      expect(mobileStore.isDark).toBe(true)
    })

    it('should restore locale from localStorage', () => {
      localStorage.setItem('locale', 'zh-TW')
      setActivePinia(createPinia())
      const restored = useAppStore()
      expect(restored.locale).toBe('zh-TW')
    })

    it('should restore dark mode from localStorage', () => {
      localStorage.setItem('isDark', 'true')
      setActivePinia(createPinia())
      const restored = useAppStore()
      expect(restored.isDark).toBe(true)
    })

    it('should respect saved light mode on mobile', () => {
      localStorage.setItem('isDark', 'false')
      window.matchMedia = vi.fn().mockReturnValue({ matches: true })
      setActivePinia(createPinia())
      const restored = useAppStore()
      expect(restored.isDark).toBe(false)
    })

    it('should detect Chinese browser locale', () => {
      localStorage.clear()
      const origLang = navigator.language
      Object.defineProperty(navigator, 'language', { value: 'zh-TW', configurable: true })
      setActivePinia(createPinia())
      const zhStore = useAppStore()
      expect(zhStore.locale).toBe('zh-TW')
      Object.defineProperty(navigator, 'language', { value: origLang, configurable: true })
    })
  })

  describe('setLocale()', () => {
    it('should change locale', () => {
      store.setLocale('zh-TW')
      expect(store.locale).toBe('zh-TW')
    })

    it('should persist locale to localStorage', async () => {
      store.setLocale('zh-TW')
      // Watch is async, wait a tick
      await new Promise((r) => setTimeout(r, 0))
      expect(localStorage.getItem('locale')).toBe('zh-TW')
    })
  })

  describe('toggleDark()', () => {
    it('should toggle dark mode', () => {
      expect(store.isDark).toBe(false)
      store.toggleDark()
      expect(store.isDark).toBe(true)
      store.toggleDark()
      expect(store.isDark).toBe(false)
    })
  })

  describe('setDark()', () => {
    it('should set dark mode directly', () => {
      store.setDark(true)
      expect(store.isDark).toBe(true)
      store.setDark(false)
      expect(store.isDark).toBe(false)
    })
  })
})
