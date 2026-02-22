import { boot } from 'quasar/wrappers'
import { api } from '@sylvia-iot/shared'
import { useAuthStore } from 'stores/auth-store.js'

/**
 * Check if a URL is an OAuth2 or auth API endpoint.
 * These endpoints should NOT trigger automatic token refresh retry.
 */
function isAuthEndpoint(url) {
  return url.includes('/oauth2') || url.includes('/api/v1/auth')
}

export default boot(({ store, router }) => {
  const authStore = useAuthStore(store)

  // Restore user info from existing tokens on app start
  authStore.init()

  // Request interceptor: add Authorization header
  api.interceptors.request.use((config) => {
    if (authStore.accessToken) {
      config.headers.Authorization = `Bearer ${authStore.accessToken}`
    }
    return config
  })

  // Response interceptor: handle 401 with automatic token refresh and retry
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config

      // Only retry once and skip auth endpoints
      if (
        error.response?.status === 401 &&
        !originalRequest._retried &&
        !isAuthEndpoint(originalRequest.url)
      ) {
        originalRequest._retried = true

        const refreshed = await authStore.refreshAccessToken()
        if (refreshed) {
          // Retry with new token
          originalRequest.headers.Authorization = `Bearer ${authStore.accessToken}`
          return api(originalRequest)
        }

        // Refresh failed, redirect to login
        authStore.logout()
        router.push({ name: 'welcome' })
      }

      return Promise.reject(error)
    },
  )

  // Expose the configured HTTP client for external plugins
  window.sylviaShell = { httpClient: api }
})

export { api }
