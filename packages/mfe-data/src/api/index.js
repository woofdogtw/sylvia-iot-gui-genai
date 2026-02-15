import { api, coremgrUrl } from '@sylvia-iot/shared'

const BASE = '/data/api/v1'

/**
 * Create read-only list/count API functions for a data resource.
 * @param {string} resource - Resource name (e.g. 'application-uldata')
 * @returns {object} API functions: list, count
 */
function createDataApi(resource) {
  return {
    list(params) {
      return api.get(coremgrUrl(`${BASE}/${resource}/list`), { params })
    },
    count(params) {
      return api.get(coremgrUrl(`${BASE}/${resource}/count`), { params })
    },
  }
}

export const applicationUlDataApi = createDataApi('application-uldata')
export const applicationDlDataApi = createDataApi('application-dldata')
export const networkUlDataApi = createDataApi('network-uldata')
export const networkDlDataApi = createDataApi('network-dldata')
export const coremgrOpDataApi = createDataApi('coremgr-opdata')
