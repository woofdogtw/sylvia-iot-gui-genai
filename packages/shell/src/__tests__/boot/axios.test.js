import { describe, it, expect } from 'vitest'

/**
 * Test the auth endpoint detection logic used by the axios 401 interceptor.
 * This logic determines which endpoints should NOT trigger auto-retry.
 */
function isAuthEndpoint(url) {
  return url.includes('/oauth2') || url.includes('/api/v1/auth')
}

describe('axios auth endpoint detection', () => {
  it('should detect OAuth2 endpoints', () => {
    expect(isAuthEndpoint('/auth/oauth2/auth')).toBe(true)
    expect(isAuthEndpoint('/auth/oauth2/token')).toBe(true)
    expect(isAuthEndpoint('/auth/oauth2/refresh')).toBe(true)
    expect(isAuthEndpoint('http://localhost:1080/auth/oauth2/auth')).toBe(true)
  })

  it('should detect auth API endpoints', () => {
    expect(isAuthEndpoint('/auth/api/v1/auth/tokeninfo')).toBe(true)
    expect(isAuthEndpoint('/auth/api/v1/auth/logout')).toBe(true)
    expect(isAuthEndpoint('http://localhost:1080/auth/api/v1/auth/tokeninfo')).toBe(true)
  })

  it('should NOT detect coremgr endpoints as auth', () => {
    expect(isAuthEndpoint('/coremgr/api/v1/user/list')).toBe(false)
    expect(isAuthEndpoint('/coremgr/api/v1/unit/list')).toBe(false)
    expect(isAuthEndpoint('http://localhost:1080/coremgr/api/v1/application')).toBe(false)
  })

  it('should NOT detect data endpoints as auth', () => {
    expect(isAuthEndpoint('/data/api/v1/application-dldata/list')).toBe(false)
    expect(isAuthEndpoint('http://localhost:1080/data/api/v1/network-uldata/list')).toBe(false)
  })
})
