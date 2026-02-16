# Implementation Tasks: Router Plugin

## 1. Shared API Helper

- [x] 1.1 Add `routerUrl(path)` to `packages/shared/src/api/` and export from shared package
- [x] 1.2 Add `router.baseUrl` to `packages/shell/public/js/config.js`

## 2. Package Setup

- [x] 2.1 Create `packages/mfe-router/` with `package.json` (same pattern as mfe-core/mfe-data)
- [x] 2.2 Create `src/api/index.js` with API functions for version, sys/usage, sys/time, net/wan, net/lan, net/lan/leases, net/wlan, net/wwan, net/wwan/list
- [x] 2.3 Create `src/index.js` with plugin registration (id: `mfe-router`, category: `router`, 5 routes, 5 menu items, 2 header widgets)
- [x] 2.4 Register mfe-router as a builtin plugin in `packages/shell/src/boot/plugins.js`

## 3. i18n

- [x] 3.1 Create `src/i18n/en-US.js` with all translations (menu, pages, fields, status, validation)
- [x] 3.2 Create `src/i18n/zh-TW.js` with all translations
- [x] 3.3 Register i18n messages in `packages/shell/src/i18n/index.js`

## 4. Header Widgets

- [x] 4.1 Create `src/components/SystemClockWidget.vue` — two-line display (YYYY/MM/DD + HH:MM); smart sleep to poll at minute boundaries; hides on error
- [x] 4.2 Create `src/components/ServiceInfoWidget.vue` — two-line display (service name + version); fetched once from GET /version; hides on error

## 5. Pages

- [x] 5.1 Create `DashboardPage.vue` — CPU bars with per-core/overall-average toggle, memory/disk gauges, auto-refresh every 5s
- [x] 5.2 Create `WanPage.vue` — WAN interface cards with connection status; edit dialog for disable/ethernet(static|dhcp)/pppoe configuration
- [x] 5.3 Create `LanPage.vue` — LAN config form (address, DHCP range, lease time) + DHCP leases table
- [x] 5.4 Create `WlanPage.vue` — enable/disable toggle, SSID/channel/password config; "not supported" fallback on 404
- [x] 5.5 Create `WwanPage.vue` — enable/disable toggle, AP scan table, SSID/password connect form, connection status; "not supported" fallback on 404

## 6. Testing & Validation

- [x] 6.1 Verify ESLint passes
- [x] 6.2 Verify production build succeeds
- [x] 6.3 Write mock unit tests for network pages (WAN, LAN, WLAN, WWAN — no physical interfaces available for E2E)
- [x] 6.4 Write E2E tests for system pages (dashboard, header widgets)
- [ ] 6.5 Run full test suite (unit + E2E) to verify no regressions
