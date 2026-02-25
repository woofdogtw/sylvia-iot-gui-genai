# Implementation Tasks: API Error Dialog

## 1. Shell Configuration

- [x] 1.1 Add `'Dialog'` to the `framework.plugins` array in `packages/shell/quasar.config.js` (required for programmatic `Dialog.create()` in non-component utility files)

## 2. mfe-core: Replace notifyApiError with showApiError

- [x] 2.1 In `packages/mfe-core/src/utils/notify.js`: replace the `import { Notify }` with `import { Dialog }`, rename `notifyApiError` to `showApiError`, and rewrite the implementation to call `Dialog.create({ title, message })` — title from `t('apiError.<code>')` (falling back to `t('apiError.err_unknown')` when no code), body from `error.response?.data?.message` (falling back to `HTTP {status}: {statusText}`, then `error.message`)
- [x] 2.2 Update `packages/mfe-core/src/pages/UserPage.vue`: change import from `notifyApiError` to `showApiError` and update all 4 call-sites
- [x] 2.3 Update `packages/mfe-core/src/pages/ClientPage.vue`: change import and update all call-sites
- [x] 2.4 Update `packages/mfe-core/src/pages/UnitPage.vue`: change import and update all call-sites
- [x] 2.5 Update `packages/mfe-core/src/pages/ApplicationPage.vue`: change import and update all call-sites
- [x] 2.6 Update `packages/mfe-core/src/pages/NetworkPage.vue`: change import and update all call-sites
- [x] 2.7 Update `packages/mfe-core/src/pages/DevicePage.vue`: change import and update all call-sites
- [x] 2.8 Update `packages/mfe-core/src/pages/DeviceRoutePage.vue`: change import and update all call-sites
- [x] 2.9 Update `packages/mfe-core/src/pages/NetworkRoutePage.vue`: change import and update all call-sites
- [x] 2.10 Update `packages/mfe-core/src/pages/DlDataBufferPage.vue`: change import and update all call-sites

## 3. mfe-data: Replace notifyApiError with showApiError

- [x] 3.1 In `packages/mfe-data/src/utils/notify.js`: apply the same rename and reimplementation as step 2.1
- [x] 3.2 Update `packages/mfe-data/src/pages/ApplicationUlDataPage.vue`: change import and update all call-sites
- [x] 3.3 Update `packages/mfe-data/src/pages/ApplicationDlDataPage.vue`: change import and update all call-sites
- [x] 3.4 Update `packages/mfe-data/src/pages/NetworkUlDataPage.vue`: change import and update all call-sites
- [x] 3.5 Update `packages/mfe-data/src/pages/NetworkDlDataPage.vue`: change import and update all call-sites
- [x] 3.6 Update `packages/mfe-data/src/pages/OperationDataPage.vue`: change import and update all call-sites

## 4. mfe-router: Replace notifyApiError with showApiError

- [x] 4.1 In `packages/mfe-router/src/utils/notify.js`: apply the same rename and reimplementation as step 2.1
- [x] 4.2 Update `packages/mfe-router/src/pages/DashboardPage.vue`: change import and update all call-sites
- [x] 4.3 Update `packages/mfe-router/src/pages/WanPage.vue`: change import and update all call-sites
- [x] 4.4 Update `packages/mfe-router/src/pages/LanPage.vue`: change import and update all call-sites
- [x] 4.5 Update `packages/mfe-router/src/pages/WlanPage.vue`: change import and update all call-sites
- [x] 4.6 Update `packages/mfe-router/src/pages/WwanPage.vue`: change import and update all call-sites

## 5. Verification

- [x] 5.1 Search the entire codebase for remaining `notifyApiError` references and confirm zero results
- [x] 5.2 Run ESLint across all three mfe packages and confirm no lint errors
- [x] 5.3 Run unit tests (`npm run test` from repo root) and confirm all tests still pass
- [x] 5.4 Start the dev server and manually trigger an API error (e.g., disconnect backend) to confirm a Quasar dialog appears with title and message body instead of a toast
