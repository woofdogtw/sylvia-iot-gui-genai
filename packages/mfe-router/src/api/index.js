import { api, routerUrl } from '@sylvia-iot/shared'

const BASE = '/api/v1'

export const versionApi = {
  get() {
    return api.get(routerUrl('/version'))
  },
}

export const sysApi = {
  getUsage() {
    return api.get(routerUrl(`${BASE}/sys/usage`))
  },
  getTime() {
    return api.get(routerUrl(`${BASE}/sys/time`))
  },
}

export const wanApi = {
  list() {
    return api.get(routerUrl(`${BASE}/net/wan`))
  },
  update(wanId, data) {
    return api.put(routerUrl(`${BASE}/net/wan/${wanId}`), { data })
  },
}

export const lanApi = {
  get() {
    return api.get(routerUrl(`${BASE}/net/lan`))
  },
  update(data) {
    return api.put(routerUrl(`${BASE}/net/lan`), { data })
  },
  getLeases() {
    return api.get(routerUrl(`${BASE}/net/lan/leases`))
  },
}

export const wlanApi = {
  get() {
    return api.get(routerUrl(`${BASE}/net/wlan`))
  },
  update(data) {
    return api.put(routerUrl(`${BASE}/net/wlan`), { data })
  },
}

export const wwanApi = {
  get() {
    return api.get(routerUrl(`${BASE}/net/wwan`))
  },
  update(data) {
    return api.put(routerUrl(`${BASE}/net/wwan`), { data })
  },
  scan() {
    return api.get(routerUrl(`${BASE}/net/wwan/list`))
  },
}
