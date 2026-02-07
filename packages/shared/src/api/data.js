/**
 * API client for the data service.
 */

/**
 * Get the data service base URL from runtime config.
 */
function getBaseUrl() {
  return window.config?.data?.baseUrl || ''
}

/**
 * Build a full API URL for the data service.
 * @param {string} path - API path (e.g. '/api/v1/application-dldata/list')
 * @returns {string}
 */
export function dataUrl(path) {
  return `${getBaseUrl()}${path}`
}

export default {
  dataUrl,
}
