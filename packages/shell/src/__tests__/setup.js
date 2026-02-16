// Global test setup
// Mock window.config for tests
window.config = {
  auth: {
    baseUrl: 'http://localhost:1080/auth',
    clientId: 'public',
    redirectUri: 'http://localhost:9000/#/auth/callback',
    scopes: [],
  },
  coremgr: {
    baseUrl: 'http://localhost:1080/coremgr',
  },
  data: {
    baseUrl: 'http://localhost:1080/data',
  },
  router: {
    baseUrl: 'http://localhost:1080/router',
  },
}
