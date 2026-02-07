/**
 * API client for the coremgr service.
 * coremgr is the management entry point that wraps auth/broker APIs.
 */

/**
 * Get the coremgr base URL from runtime config.
 */
function getBaseUrl() {
  return window.config?.coremgr?.baseUrl || ''
}

/**
 * Build a full API URL for the coremgr service.
 * @param {string} path - API path (e.g. '/api/v1/user/list')
 * @returns {string}
 */
export function coremgrUrl(path) {
  return `${getBaseUrl()}${path}`
}

export default {
  coremgrUrl,
}
