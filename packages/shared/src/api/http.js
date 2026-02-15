import axios from 'axios'

/**
 * Shared axios instance. The shell boot file sets up auth interceptors on this
 * instance so that all API calls (from shell and plugins) share the same
 * authentication and 401 auto-retry behavior.
 */
const api = axios.create()

export { api }
