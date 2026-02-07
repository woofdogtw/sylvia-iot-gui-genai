import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from 'stores/auth-store.js'
import axios from 'axios'

vi.mock('axios')

describe('authStore', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useAuthStore()
    localStorage.clear()
    sessionStorage.clear()
    vi.restoreAllMocks()
  })

  describe('initial state', () => {
    it('should start unauthenticated', () => {
      expect(store.isAuthenticated).toBe(false)
      expect(store.accessToken).toBe('')
      expect(store.refreshToken).toBe('')
      expect(store.user).toBeNull()
    })

    it('should restore tokens from localStorage', () => {
      localStorage.setItem('access_token', 'saved-token')
      localStorage.setItem('refresh_token', 'saved-refresh')
      localStorage.setItem('token_expires_at', '9999999999999')

      setActivePinia(createPinia())
      const restored = useAuthStore()

      expect(restored.accessToken).toBe('saved-token')
      expect(restored.refreshToken).toBe('saved-refresh')
      expect(restored.isAuthenticated).toBe(true)
    })
  })

  describe('login()', () => {
    it('should save state to sessionStorage and redirect', () => {
      const hrefSetter = vi.fn()
      Object.defineProperty(window, 'location', {
        value: { href: '' },
        writable: true,
      })

      // Use a spy on the setter
      const originalLocation = window.location
      delete window.location
      window.location = { set href(val) { hrefSetter(val) }, get href() { return '' } }

      store.login()

      expect(sessionStorage.getItem('oauth_state')).toBeTruthy()

      // Restore
      window.location = originalLocation
    })
  })

  describe('handleCallback()', () => {
    it('should exchange code for tokens', async () => {
      sessionStorage.setItem('oauth_state', 'test-state')

      axios.post.mockResolvedValueOnce({
        data: {
          access_token: 'new-access',
          refresh_token: 'new-refresh',
          expires_in: 3600,
        },
      })
      axios.get.mockResolvedValueOnce({
        data: { data: { account: 'admin' } },
      })

      await store.handleCallback('auth-code', 'test-state')

      expect(store.accessToken).toBe('new-access')
      expect(store.refreshToken).toBe('new-refresh')
      expect(store.isAuthenticated).toBe(true)
      expect(store.user).toEqual({ account: 'admin' })
      expect(localStorage.getItem('access_token')).toBe('new-access')
    })

    it('should reject invalid state', async () => {
      sessionStorage.setItem('oauth_state', 'valid-state')

      await expect(
        store.handleCallback('auth-code', 'wrong-state'),
      ).rejects.toThrow('Invalid OAuth state')
    })
  })

  describe('refreshAccessToken()', () => {
    it('should refresh tokens successfully', async () => {
      store.refreshToken = 'existing-refresh'

      axios.post.mockResolvedValueOnce({
        data: {
          access_token: 'refreshed-access',
          refresh_token: 'refreshed-refresh',
          expires_in: 3600,
        },
      })

      const result = await store.refreshAccessToken()

      expect(result).toBe(true)
      expect(store.accessToken).toBe('refreshed-access')
    })

    it('should return false when no refresh token exists', async () => {
      const result = await store.refreshAccessToken()
      expect(result).toBe(false)
    })

    it('should clear tokens on refresh failure', async () => {
      store.refreshToken = 'bad-refresh'
      store.accessToken = 'old-access'

      axios.post.mockRejectedValueOnce(new Error('Refresh failed'))

      const result = await store.refreshAccessToken()

      expect(result).toBe(false)
      expect(store.accessToken).toBe('')
      expect(store.refreshToken).toBe('')
    })
  })

  describe('logout()', () => {
    it('should clear all tokens', async () => {
      store.accessToken = 'token'
      store.refreshToken = 'refresh'
      store.user = { account: 'admin' }
      localStorage.setItem('access_token', 'token')

      axios.post.mockResolvedValueOnce({})

      await store.logout()

      expect(store.accessToken).toBe('')
      expect(store.refreshToken).toBe('')
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(localStorage.getItem('access_token')).toBeNull()
    })

    it('should clear tokens even if logout API fails', async () => {
      store.accessToken = 'token'
      axios.post.mockRejectedValueOnce(new Error('Network error'))

      await store.logout()

      expect(store.accessToken).toBe('')
      expect(store.isAuthenticated).toBe(false)
    })
  })

  describe('fetchTokenInfo()', () => {
    it('should set user on success', async () => {
      store.accessToken = 'valid-token'

      axios.get.mockResolvedValueOnce({
        data: { data: { account: 'admin', name: 'Admin User' } },
      })

      await store.fetchTokenInfo()

      expect(store.user).toEqual({ account: 'admin', name: 'Admin User' })
    })

    it('should set user to null on failure', async () => {
      store.accessToken = 'bad-token'
      store.user = { account: 'old' }

      axios.get.mockRejectedValueOnce(new Error('Unauthorized'))

      await store.fetchTokenInfo()

      expect(store.user).toBeNull()
    })
  })
})
