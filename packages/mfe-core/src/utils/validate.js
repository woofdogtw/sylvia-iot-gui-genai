/**
 * Validate a code field: must match [A-Za-z0-9][A-Za-z0-9-_]*
 * @param {string} val
 * @returns {boolean|string} true if valid, or error message key
 */
export function validateCode(val) {
  if (!val) return 'core.validate.required'
  if (!/^[A-Za-z0-9][A-Za-z0-9\-_]*$/.test(val)) return 'core.validate.codePattern'
  return true
}

/**
 * Validate a Host URI: must start with amqp://, amqps://, mqtt://, or mqtts://
 * @param {string} val
 * @returns {boolean|string}
 */
export function validateHostUri(val) {
  if (!val) return 'core.validate.required'
  if (!/^(amqps?|mqtts?):\/\/.+/.test(val)) return 'core.validate.hostUri'
  return true
}

/**
 * Validate a non-negative integer (0 = unlimited).
 * @param {string|number} val
 * @returns {boolean|string}
 */
export function validateNonNegativeInt(val) {
  if (val === '' || val === null || val === undefined) return true
  const n = Number(val)
  if (!Number.isInteger(n) || n < 0) return 'core.validate.nonNegativeInt'
  return true
}

/**
 * Validate a JSON object string. Empty string is valid (treated as {}).
 * @param {string} val
 * @returns {boolean|string}
 */
export function validateJsonObject(val) {
  if (!val || val.trim() === '') return true
  try {
    const parsed = JSON.parse(val)
    if (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null) {
      return 'core.validate.jsonObject'
    }
    return true
  } catch {
    return 'core.validate.jsonObject'
  }
}

/**
 * Parse a JSON info field: empty string → {}, otherwise parse.
 * @param {string} val
 * @returns {object}
 */
export function parseJsonInfo(val) {
  if (!val || val.trim() === '') return {}
  return JSON.parse(val)
}

/**
 * Trim a value unless it's a password field.
 * @param {string} val
 * @returns {string}
 */
export function trimValue(val) {
  return typeof val === 'string' ? val.trim() : val
}

/**
 * Validate a hex payload: must be even length and only contain 0-9, A-F, a-f.
 * @param {string} val
 * @returns {boolean|string}
 */
export function validateHexPayload(val) {
  if (!val) return true
  if (!/^[0-9A-Fa-f]*$/.test(val)) return 'core.validate.hexChars'
  if (val.length % 2 !== 0) return 'core.validate.hexEvenLength'
  return true
}

/**
 * Convert text to hexadecimal string.
 * @param {string} text
 * @returns {string}
 */
export function textToHex(text) {
  return Array.from(new TextEncoder().encode(text))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
