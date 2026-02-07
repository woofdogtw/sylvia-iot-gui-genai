// Runtime configuration for Sylvia-IoT GUI
// Modify this file for different deployment environments.
// No rebuild is required after changes.
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
}
