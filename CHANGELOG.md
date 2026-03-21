# CHANGELOG

## 0.1.2 - 2026-03-21

### Changed

- **CI**: Upgrade Node.js from 22 to 24 (Active LTS) across all CI jobs
- **CI**: Upgrade GitHub Actions — `actions/checkout` v4→v6, `actions/setup-node` v4→v6, `actions/upload-artifact` v4→v7
- **CI**: Upgrade Docker Actions — `setup-qemu-action` v3→v4, `setup-buildx-action` v3→v4, `login-action` v3→v4, `metadata-action` v5→v6, `build-push-action` v6→v7
- **CI**: Upgrade `ghr` from v0.17.0 to v0.18.0
- **CI**: Release archive renamed from `sylvia-iot-gui-<version>.tar.xz` to `sylvia-iot-gui.tar.xz` (fixed filename; version available in `VERSION` asset)
- **Docker**: nginx base image updated from `1.29.5-alpine-slim` to `1.29.6-alpine-slim`
- **engines**: Minimum Node.js requirement updated from `>= 18.0.0` to `>= 22.0.0`
- **deps**: `quasar` ^2.18.6→^2.18.7, `vue` ^3.5.29→^3.5.30, `vue-i18n` ^11.2.8→^11.3.0, `vue-router` ^5.0.3→^5.0.4
- **deps**: `@quasar/app-vite` ^2.4.1→^2.5.2, `@vitejs/plugin-vue` ^6.0.4→^6.0.5, `@vitest/coverage-v8` ^4.0.18→^4.1.0, `eslint` ^10.0.2→^10.0.3, `jsdom` ^28.1.0→^29.0.1, `vitest` ^4.0.18→^4.1.0
- **test**: E2E about page version assertion now reads dynamically from `package.json`

### Fixed

- **wwan**: Disconnect button and IP info now shown whenever SSID is non-empty (previously hidden when `conn4` had no address)
- **wwan**: AP scan list cleared before each poll update to prevent stale/duplicate entries
- **wwan**: Password dialog now submits on Enter when validation passes
- **wwan**: Connected AP is pinned to top of AP list and its Connect button is hidden
- **wwan**: System clock widget falls back to local device time when backend is unreachable, resuming backend time on recovery

## 0.1.1 - 2026-03-05

### Changed

- **Docker**: nginx base image updated from `1.27-alpine` to `1.29.5-alpine-slim`
- **deps**: `axios` ^1.13.5 → ^1.13.6, `eslint` ^10.0.0 → ^10.0.2, `vue` ^3.5.28 → ^3.5.29

## 0.1.0 - 2026-02-27

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
- **shell**: `vue` and `quasar` exposed as shared modules via import map — external plugins can use bare specifiers without bundling their own copies
- **shell**: `sylvia-locale-change` window event dispatched on locale switch — external plugins can listen to stay in sync with the shell's language setting
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
