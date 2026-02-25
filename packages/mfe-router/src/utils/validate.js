/**
 * Pure validator functions for mfe-router form fields.
 * Each function returns `true` when valid, or a localized error string when invalid.
 * Direct validators: (val, t) => true | string
 * Factory validators: (param) => (val, t) => true | string
 */

const IPV4_RE = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/

function parseIPv4(val) {
  const m = IPV4_RE.exec(val)
  if (!m) return null
  const octets = [m[1], m[2], m[3], m[4]].map(Number)
  if (octets.some((o) => o > 255)) return null
  return octets
}

function ipToNumber(val) {
  const octets = parseIPv4(val)
  if (!octets) return null
  return (octets[0] << 24) + (octets[1] << 16) + (octets[2] << 8) + octets[3]
}

export function isValidIPv4(val, t) {
  return parseIPv4(val) !== null || t('router.validate.invalidIp')
}

export function isValidCIDR(val, t) {
  const parts = (val || '').split('/')
  if (parts.length !== 2) return t('router.validate.invalidCidr')
  if (parseIPv4(parts[0]) === null) return t('router.validate.invalidCidr')
  if (parts[1] === '') return t('router.validate.invalidCidr')
  const prefix = Number(parts[1])
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) return t('router.validate.invalidCidr')
  return true
}

export function isNonEmpty(val, t) {
  return (typeof val === 'string' && val.trim().length > 0) || t('router.validate.required')
}

export function isMinLength(min) {
  return (val, t) => (typeof val === 'string' && val.length >= min) || t('router.validate.minLength', { min })
}

export function isMaxLength(max) {
  return (val, t) => (typeof val === 'string' && val.length <= max) || t('router.validate.maxLength', { max })
}

export function isIntegerInRange(min, max) {
  return (val, t) =>
    (Number.isInteger(val) && val >= min && val <= max) || t('router.validate.outOfRange', { min, max })
}

export function isIPInRange(ip, start, end) {
  const ipNum = ipToNumber(ip)
  const startNum = ipToNumber(start)
  const endNum = ipToNumber(end)
  if (ipNum === null || startNum === null || endNum === null) return false
  return ipNum >= startNum && ipNum <= endNum
}

export function isIPNotGreaterThan(a, b, t) {
  const aNum = ipToNumber(a)
  const bNum = ipToNumber(b)
  if (aNum === null || bNum === null) return true
  return aNum <= bNum || t('router.validate.dhcpStartAfterEnd')
}
