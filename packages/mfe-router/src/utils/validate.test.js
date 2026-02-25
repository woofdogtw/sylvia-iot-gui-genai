import { describe, it, expect } from 'vitest'
import {
  isValidIPv4,
  isValidCIDR,
  isNonEmpty,
  isMinLength,
  isMaxLength,
  isIntegerInRange,
  isIPInRange,
  isIPNotGreaterThan,
} from './validate.js'

// Mock t() to return the key so tests are readable without i18n setup
const t = (key) => key

describe('isValidIPv4', () => {
  it('accepts a valid address', () => {
    expect(isValidIPv4('192.168.1.1', t)).toBe(true)
  })

  it('accepts boundary octets (0.0.0.0 and 255.255.255.255)', () => {
    expect(isValidIPv4('0.0.0.0', t)).toBe(true)
    expect(isValidIPv4('255.255.255.255', t)).toBe(true)
  })

  it('rejects octet > 255', () => {
    expect(isValidIPv4('999.0.0.1', t)).toBe('router.validate.invalidIp')
  })

  it('rejects missing octets', () => {
    expect(isValidIPv4('192.168.1', t)).toBe('router.validate.invalidIp')
  })

  it('rejects non-numeric input', () => {
    expect(isValidIPv4('abc.def.ghi.jkl', t)).toBe('router.validate.invalidIp')
  })

  it('rejects empty string', () => {
    expect(isValidIPv4('', t)).toBe('router.validate.invalidIp')
  })
})

describe('isValidCIDR', () => {
  it('accepts a valid CIDR', () => {
    expect(isValidCIDR('10.0.0.0/24', t)).toBe(true)
  })

  it('accepts prefix 0', () => {
    expect(isValidCIDR('0.0.0.0/0', t)).toBe(true)
  })

  it('accepts prefix 32', () => {
    expect(isValidCIDR('192.168.1.1/32', t)).toBe(true)
  })

  it('rejects bare IP (no prefix)', () => {
    expect(isValidCIDR('10.0.0.1', t)).toBe('router.validate.invalidCidr')
  })

  it('rejects prefix 33', () => {
    expect(isValidCIDR('10.0.0.0/33', t)).toBe('router.validate.invalidCidr')
  })

  it('rejects invalid IP part', () => {
    expect(isValidCIDR('999.0.0.1/24', t)).toBe('router.validate.invalidCidr')
  })

  it('rejects empty string', () => {
    expect(isValidCIDR('', t)).toBe('router.validate.invalidCidr')
  })

  it('rejects trailing slash with no prefix (e.g. 192.168.1.1/)', () => {
    expect(isValidCIDR('192.168.1.1/', t)).toBe('router.validate.invalidCidr')
  })
})

describe('isNonEmpty', () => {
  it('accepts a non-empty string', () => {
    expect(isNonEmpty('hello', t)).toBe(true)
  })

  it('rejects empty string', () => {
    expect(isNonEmpty('', t)).toBe('router.validate.required')
  })

  it('rejects whitespace-only string', () => {
    expect(isNonEmpty('   ', t)).toBe('router.validate.required')
  })
})

describe('isMinLength', () => {
  it('passes when length equals min', () => {
    expect(isMinLength(8)('password1', t)).toBe(true)
  })

  it('passes when length is above min', () => {
    expect(isMinLength(8)('averylongpassword', t)).toBe(true)
  })

  it('fails when length is below min', () => {
    expect(isMinLength(8)('short', t)).toBe('router.validate.minLength')
  })
})

describe('isMaxLength', () => {
  it('passes when length is within limit', () => {
    expect(isMaxLength(63)('validpassword', t)).toBe(true)
  })

  it('passes when length equals max', () => {
    expect(isMaxLength(8)('exactly8', t)).toBe(true)
  })

  it('fails when length exceeds max', () => {
    const longStr = 'a'.repeat(64)
    expect(isMaxLength(63)(longStr, t)).toBe('router.validate.maxLength')
  })
})

describe('isIntegerInRange', () => {
  it('passes within range', () => {
    expect(isIntegerInRange(60, 604800)(86400, t)).toBe(true)
  })

  it('passes at minimum boundary', () => {
    expect(isIntegerInRange(60, 604800)(60, t)).toBe(true)
  })

  it('passes at maximum boundary', () => {
    expect(isIntegerInRange(60, 604800)(604800, t)).toBe(true)
  })

  it('fails below minimum', () => {
    expect(isIntegerInRange(60, 604800)(10, t)).toBe('router.validate.outOfRange')
  })

  it('fails above maximum', () => {
    expect(isIntegerInRange(60, 604800)(999999, t)).toBe('router.validate.outOfRange')
  })

  it('fails for non-integer', () => {
    expect(isIntegerInRange(60, 604800)(86400.5, t)).toBe('router.validate.outOfRange')
  })
})

describe('isIPInRange', () => {
  it('returns true when IP is inside range', () => {
    expect(isIPInRange('192.168.1.100', '192.168.1.50', '192.168.1.200')).toBe(true)
  })

  it('returns true when IP equals start boundary', () => {
    expect(isIPInRange('192.168.1.50', '192.168.1.50', '192.168.1.200')).toBe(true)
  })

  it('returns true when IP equals end boundary', () => {
    expect(isIPInRange('192.168.1.200', '192.168.1.50', '192.168.1.200')).toBe(true)
  })

  it('returns false when IP is outside range (below)', () => {
    expect(isIPInRange('192.168.1.10', '192.168.1.50', '192.168.1.200')).toBe(false)
  })

  it('returns false when IP is outside range (above)', () => {
    expect(isIPInRange('192.168.1.250', '192.168.1.50', '192.168.1.200')).toBe(false)
  })

  it('returns false for invalid IP', () => {
    expect(isIPInRange('notanip', '192.168.1.50', '192.168.1.200')).toBe(false)
  })
})

describe('isIPNotGreaterThan', () => {
  it('passes when a < b', () => {
    expect(isIPNotGreaterThan('192.168.1.50', '192.168.1.100', t)).toBe(true)
  })

  it('passes when a equals b', () => {
    expect(isIPNotGreaterThan('192.168.1.100', '192.168.1.100', t)).toBe(true)
  })

  it('fails when a > b', () => {
    expect(isIPNotGreaterThan('192.168.1.200', '192.168.1.100', t)).toBe('router.validate.dhcpStartAfterEnd')
  })

  it('returns true (no error) for invalid IPs', () => {
    // if IPs are invalid we cannot check, so no validation error is shown
    expect(isIPNotGreaterThan('notanip', '192.168.1.100', t)).toBe(true)
  })
})
