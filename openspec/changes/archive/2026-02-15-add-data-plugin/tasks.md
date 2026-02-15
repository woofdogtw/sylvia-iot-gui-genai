# Implementation Tasks: Data Plugin

## 1. Package Setup

- [x] 1.1 Create `packages/mfe-data/` with `package.json` (same pattern as mfe-core)
- [x] 1.2 Create `src/index.js` with plugin registration (id: `mfe-data`, category: `data`, 5 routes, 5 menu items)
- [x] 1.3 Create `src/api/index.js` with data API helper functions (list/count for all 5 endpoints)
- [x] 1.4 Register mfe-data as a builtin plugin in `packages/shell/src/boot/plugins.js`

## 2. i18n

- [x] 2.1 Create `src/i18n/en-US.js` with all translations (menu, columns, dialogs, filters, status labels)
- [x] 2.2 Create `src/i18n/zh-TW.js` with all translations
- [x] 2.3 Register i18n messages in the plugin boot (same pattern as mfe-core)

## 3. Common Components

- [x] 3.1 Create time range filter component or composable (start/end datetime pickers using Quasar `q-date` + `q-time` or `q-input` with date mask)
- [x] 3.2 Create payload display toggle composable (hex ↔ text)

## 4. Data Pages

- [x] 4.1 Create `ApplicationUlDataPage.vue` — unit filter, time range, table (proc, pub, time, device, data), detail dialog, CSV export
- [x] 4.2 Create `ApplicationDlDataPage.vue` — unit filter, time range, table (proc, resp, status, device, data), detail dialog, CSV export
- [x] 4.3 Create `NetworkUlDataPage.vue` — unit filter, time range, table (proc, time, device, data), detail dialog, CSV export
- [x] 4.4 Create `NetworkDlDataPage.vue` — unit filter, time range, table (proc, pub, resp, status, device, data), detail dialog, CSV export
- [x] 4.5 Create `OperationDataPage.vue` — time range, table (reqTime, latency, status, method, path), detail dialog, CSV export; admin/manager see user filter dropdown, normal users see only their own logs

## 5. Testing & Validation

- [x] 5.1 Verify ESLint passes
- [x] 5.2 Verify production build succeeds
- [x] 5.3 Write E2E tests for data pages (navigate, verify table renders, detail dialog opens)
- [x] 5.4 Run full E2E suite to verify no regressions
