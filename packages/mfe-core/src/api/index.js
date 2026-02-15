import { api, coremgrUrl } from '@sylvia-iot/shared'

const BASE = '/api/v1'

/**
 * Create standard CRUD API functions for a given resource.
 * @param {string} resource - Resource name (e.g. 'user', 'unit')
 * @returns {object} API functions: list, count, get, create, update, delete
 */
function createCrudApi(resource) {
  return {
    list(params) {
      return api.get(coremgrUrl(`${BASE}/${resource}/list`), { params })
    },
    count(params) {
      return api.get(coremgrUrl(`${BASE}/${resource}/count`), { params })
    },
    get(id) {
      return api.get(coremgrUrl(`${BASE}/${resource}/${id}`))
    },
    create(data) {
      return api.post(coremgrUrl(`${BASE}/${resource}`), { data })
    },
    update(id, data) {
      return api.patch(coremgrUrl(`${BASE}/${resource}/${id}`), { data })
    },
    delete(id) {
      return api.delete(coremgrUrl(`${BASE}/${resource}/${id}`))
    },
  }
}

// User API — expiredAt (create) and disable (update) are root-level fields
const userBase = createCrudApi('user')
export const userApi = {
  ...userBase,
  create(data, { expiredAt } = {}) {
    const body = { data }
    if (expiredAt !== undefined) body.expiredAt = expiredAt
    return api.post(coremgrUrl(`${BASE}/user`), body)
  },
  update(id, data, { disable } = {}) {
    const body = { data }
    if (disable !== undefined) body.disable = disable
    return api.patch(coremgrUrl(`${BASE}/user/${id}`), body)
  },
}

// Client API — credentials (create) and regenSecret (update) are root-level fields
const clientBase = createCrudApi('client')
export const clientApi = {
  ...clientBase,
  create(data, { credentials } = {}) {
    const body = { data }
    if (credentials !== undefined) body.credentials = credentials
    return api.post(coremgrUrl(`${BASE}/client`), body)
  },
  update(id, data, { regenSecret } = {}) {
    const body = { data }
    if (regenSecret !== undefined) body.regenSecret = regenSecret
    return api.patch(coremgrUrl(`${BASE}/client/${id}`), body)
  },
}

// Unit API
export const unitApi = createCrudApi('unit')

// Application API
const appBase = createCrudApi('application')
export const applicationApi = {
  ...appBase,
  stats(applicationId) {
    return api.get(coremgrUrl(`${BASE}/application/${applicationId}/stats`))
  },
  sendDlData(applicationId, data) {
    return api.post(coremgrUrl(`${BASE}/application/${applicationId}/dldata`), { data })
  },
}

// Network API
const netBase = createCrudApi('network')
export const networkApi = {
  ...netBase,
  stats(networkId) {
    return api.get(coremgrUrl(`${BASE}/network/${networkId}/stats`))
  },
  sendUlData(networkId, data) {
    return api.post(coremgrUrl(`${BASE}/network/${networkId}/uldata`), { data })
  },
}

// Device API
export const deviceApi = createCrudApi('device')

// Device Route API (no get/update — immutable)
const drBase = createCrudApi('device-route')
export const deviceRouteApi = {
  list: drBase.list,
  count: drBase.count,
  create: drBase.create,
  delete: drBase.delete,
}

// Network Route API (no get/update — immutable)
const nrBase = createCrudApi('network-route')
export const networkRouteApi = {
  list: nrBase.list,
  count: nrBase.count,
  create: nrBase.create,
  delete: nrBase.delete,
}

// DL Data Buffer API (read-only — no create/update)
const dlBase = createCrudApi('dldata-buffer')
export const dlDataBufferApi = {
  list: dlBase.list,
  count: dlBase.count,
  delete: dlBase.delete,
}
