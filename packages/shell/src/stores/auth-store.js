import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(localStorage.getItem('access_token') || '')
  const refreshToken = ref(localStorage.getItem('refresh_token') || '')
  const tokenExpiresAt = ref(Number(localStorage.getItem('token_expires_at')) || 0)
  const user = ref(null)

  const isAuthenticated = computed(() => !!accessToken.value)

  function getConfig() {
    return window.config?.auth || {}
  }

  /**
   * Redirect to OAuth2 authorization endpoint.
   */
  function login() {
    const config = getConfig()
    const state = Math.random().toString(36).substring(2)
    sessionStorage.setItem('oauth_state', state)

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      state,
    })
    if (config.scopes?.length) {
      params.set('scope', config.scopes.join(' '))
    }

    window.location.href = `${config.baseUrl}/oauth2/auth?${params.toString()}`
  }

  /**
   * Exchange authorization code for tokens.
   */
  async function handleCallback(code, state) {
    const savedState = sessionStorage.getItem('oauth_state')
    if (state && state !== savedState) {
      throw new Error('Invalid OAuth state')
    }
    sessionStorage.removeItem('oauth_state')

    const config = getConfig()
    const response = await axios.post(
      `${config.baseUrl}/oauth2/token`,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: config.redirectUri,
        client_id: config.clientId,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    )

    setTokens(response.data)
    await fetchTokenInfo()
  }

  /**
   * Refresh the access token using the refresh token.
   * Returns true if refresh succeeded, false otherwise.
   */
  async function refreshAccessToken() {
    if (!refreshToken.value) {
      return false
    }

    const config = getConfig()
    try {
      const response = await axios.post(
        `${config.baseUrl}/oauth2/refresh`,
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken.value,
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      )
      setTokens(response.data)
      return true
    } catch {
      clearTokens()
      return false
    }
  }

  /**
   * Fetch token info to get user data.
   */
  async function fetchTokenInfo() {
    const config = getConfig()
    try {
      const response = await axios.get(
        `${config.baseUrl}/api/v1/auth/tokeninfo`,
        { headers: { Authorization: `Bearer ${accessToken.value}` } },
      )
      user.value = response.data.data
    } catch {
      user.value = null
    }
  }

  /**
   * Logout: call API and clear tokens.
   */
  async function logout() {
    const config = getConfig()
    try {
      await axios.post(
        `${config.baseUrl}/api/v1/auth/logout`,
        null,
        { headers: { Authorization: `Bearer ${accessToken.value}` } },
      )
    } catch {
      // Ignore logout API errors
    }
    clearTokens()
  }

  function setTokens(data) {
    accessToken.value = data.access_token
    refreshToken.value = data.refresh_token || refreshToken.value
    const expiresAt = Date.now() + (data.expires_in || 3600) * 1000
    tokenExpiresAt.value = expiresAt

    localStorage.setItem('access_token', data.access_token)
    if (data.refresh_token) {
      localStorage.setItem('refresh_token', data.refresh_token)
    }
    localStorage.setItem('token_expires_at', String(expiresAt))
  }

  function clearTokens() {
    accessToken.value = ''
    refreshToken.value = ''
    tokenExpiresAt.value = 0
    user.value = null

    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('token_expires_at')
  }

  /**
   * Initialize auth state from localStorage on app start.
   * If the access token is expired, try refreshing before fetching user info.
   */
  async function init() {
    if (!accessToken.value) {
      return
    }

    // If access token is expired, try refresh first
    if (Date.now() >= tokenExpiresAt.value) {
      const refreshed = await refreshAccessToken()
      if (!refreshed) {
        return
      }
    }

    await fetchTokenInfo()

    // If tokeninfo failed (e.g. server revoked the token), try refresh once
    if (!user.value && refreshToken.value) {
      const refreshed = await refreshAccessToken()
      if (refreshed) {
        await fetchTokenInfo()
      }
    }
  }

  return {
    accessToken,
    refreshToken,
    tokenExpiresAt,
    user,
    isAuthenticated,
    login,
    handleCallback,
    refreshAccessToken,
    fetchTokenInfo,
    logout,
    init,
  }
})
