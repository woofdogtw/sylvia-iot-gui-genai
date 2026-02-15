/**
 * Format a date/time value to YYYY/MM/DD hh:mm:ss in local time.
 * @param {string|number} val - ISO string or timestamp
 * @returns {string} Formatted local time string, or '-' if falsy
 */
export function formatTime(val) {
  if (!val) return '-'
  const d = new Date(val)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/**
 * Convert a hex string to decoded text. Returns the original string on failure.
 * @param {string} hex - Hex-encoded string
 * @returns {string} Decoded UTF-8 text
 */
export function hexToText(hex) {
  if (!hex) return ''
  try {
    const bytes = new Uint8Array(hex.match(/.{1,2}/g).map((b) => parseInt(b, 16)))
    return new TextDecoder().decode(bytes)
  } catch {
    return hex
  }
}
