# CHANGELOG

## 0.1.0 - 2026-02-20

### Added

- **shell**: Main shell application built with Quasar Framework v2 + Vue 3 Composition API
  - OAuth2 authorization code flow with token refresh and 401 auto-retry
  - Hash-mode routing with `meta.requiresAuth` route guards
  - Hamburger menu with plugin category sections (core, data, router, applications, networks)
  - Dark mode toggle via Quasar Dark plugin
  - Settings page (language, theme)
  - About page displaying frontend name/version and core service version
  - i18n support: en-US (default) and zh-TW
  - Runtime configuration via `public/js/config.js` (modifiable post-build without rebuild)
- **shell**: External plugin loading via `window.config.plugins` URL array
  - ES module dynamic import with `Promise.allSettled` (failed loads are logged and skipped)
- **shell**: `window.sylviaShell.httpClient` global — pre-configured Axios instance exposed to external plugins (Bearer token injection + 401 auto-retry with refresh)
- **mfe-core**: Core management micro-frontend plugin
  - User, client, unit, application, network, device, device route, network route, and DL data buffer management pages
- **mfe-data**: Data micro-frontend plugin
  - Application uplink/downlink, network uplink/downlink, operation data, and data export pages
- **mfe-router**: Router micro-frontend plugin
  - Dashboard, WAN, LAN, WLAN, and WWAN management pages
  - Service info header widget showing router name and version
- **shared**: Shared package providing plugin interface contract, API clients, composables, and components
  - `validatePlugin()` for plugin registration validation
  - `api` Axios instance with auth interceptor and 401 retry logic
  - `coremgrUrl()`, `dataUrl()`, `routerUrl()` URL builders
  - `useAuth`, `useConfig` composables
- CI: GitHub Actions workflows for PR testing (lint, unit, E2E) and release (GitHub Releases + Docker Hub + GHCR)
  - Docker release produces semver tags: `x.y.z`, `x.y`, `x`, and `latest`
- Docker: multi-arch image (`linux/amd64`, `linux/arm64`) with router plugin excluded for container deployments (`VITE_INCLUDE_ROUTER=false`)
