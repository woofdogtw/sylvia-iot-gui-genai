import { describe, it, expect } from 'vitest'

describe('Test framework', () => {
  it('should work', () => {
    expect(1 + 1).toBe(2)
  })

  it('should have window.config available', () => {
    expect(window.config).toBeDefined()
    expect(window.config.auth.clientId).toBe('public')
  })
})
