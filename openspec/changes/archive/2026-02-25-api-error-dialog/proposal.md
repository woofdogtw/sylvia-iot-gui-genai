# Change: API Error Dialog

## Why

Toast notifications for API errors are easy to miss — they auto-dismiss after 5 seconds, cannot be scrolled, and only show a single translated line without the raw server message body. Replacing them with modal dialogs gives users a persistent, readable view of both the localized error title and the full server-provided `message` string, making it easier to diagnose problems without losing context.

## What Changes

- **Remove `notifyApiError`** from `packages/mfe-core/src/utils/notify.js`, `packages/mfe-data/src/utils/notify.js`, and `packages/mfe-router/src/utils/notify.js`
- **Add `showApiError(error, t)`** to each of those same utility files, using `Quasar Dialog` instead of `Quasar Notify`
  - Dialog title: i18n-translated error code (e.g., `apiError.err_rsc`) — if no known code, show a generic "Error" title
  - Dialog body: the raw `message` string from `error.response.data.message` (or the HTTP status line, or `error.message` as fallbacks)
- **Update all call-sites** in `packages/mfe-core/src/pages/`, `packages/mfe-data/src/pages/`, and `packages/mfe-router/src/pages/` to import and call `showApiError` instead of `notifyApiError`
- The `notifySuccess` function and all other notification helpers remain unchanged

## Capabilities

### New Capabilities

- None — this is a replacement of an existing error-display mechanism, not a new functional capability

### Modified Capabilities

- `core`: The "Error display" scenario in the Core Plugin requirement changes from Quasar notification (toast) to Quasar dialog with a title (translated error code) and body (raw server message)
- `data`: The equivalent error display behavior for the Data plugin pages changes in the same way
- `router`: The equivalent error display behavior for the Router plugin pages changes in the same way

## Impact

- **Affected code**: `packages/mfe-core/src/utils/notify.js`, `packages/mfe-data/src/utils/notify.js`, `packages/mfe-router/src/utils/notify.js` (function rename + implementation swap); all 20 page files in those packages that call `notifyApiError`
- **APIs**: No backend API changes
- **Dependencies**: No new npm packages — Quasar's `Dialog` plugin is already registered in Quasar boot
- **Breaking changes**: None externally; `notifyApiError` is internal to each package and not exported from `packages/shared`
- **Testing**: Unit tests that mock `notifyApiError` must be updated to mock `showApiError`; E2E tests that assert on toast selectors (`.q-notification`) must be updated to assert on dialog selectors (`.q-dialog`)
