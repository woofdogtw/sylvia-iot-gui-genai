import { describe, it, expect } from 'vitest'
import { routerUrl } from '@sylvia-iot/shared'

describe('routerUrl helper', () => {
  it('should build full URL from config baseUrl + path', () => {
    const url = routerUrl('/api/v1/sys/time')
    expect(url).toBe('http://localhost:1080/router/api/v1/sys/time')
  })

  it('should work with /version path', () => {
    const url = routerUrl('/version')
    expect(url).toBe('http://localhost:1080/router/version')
  })

  it('should work with net paths', () => {
    expect(routerUrl('/api/v1/net/wan')).toBe('http://localhost:1080/router/api/v1/net/wan')
    expect(routerUrl('/api/v1/net/lan')).toBe('http://localhost:1080/router/api/v1/net/lan')
    expect(routerUrl('/api/v1/net/wlan')).toBe('http://localhost:1080/router/api/v1/net/wlan')
    expect(routerUrl('/api/v1/net/wwan')).toBe('http://localhost:1080/router/api/v1/net/wwan')
  })
})
