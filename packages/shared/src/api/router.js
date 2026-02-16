/**
 * API client for the router service.
 */

/**
 * Get the router service base URL from runtime config.
 */
function getBaseUrl() {
  return window.config?.router?.baseUrl || ''
}

/**
 * Build a full API URL for the router service.
 * @param {string} path - API path (e.g. '/api/v1/sys/usage')
 * @returns {string}
 */
export function routerUrl(path) {
  return `${getBaseUrl()}${path}`
}

export default {
  routerUrl,
}
