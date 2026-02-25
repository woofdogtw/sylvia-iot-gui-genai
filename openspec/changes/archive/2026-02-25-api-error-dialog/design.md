# Design: API Error Dialog

## Context

Currently every mfe package (mfe-core, mfe-data, mfe-router) has its own `src/utils/notify.js` with a `notifyApiError(error, t)` function that wraps `Quasar Notify.create()`. This emits a transient red toast at the top of the screen for 5 seconds showing a single localized message derived from the API error code.

The function signature and implementation are identical in all three packages — each package keeps a local copy because the shared package does not export a notify utility.

The raw server `message` field from `error.response.data.message` is currently discarded; only the translated error-code label is shown. For errors like `err_param` or `err_unknown` the raw message can contain actionable detail (e.g., which field failed validation) that the user never sees.

## Goals / Non-Goals

**Goals:**

- Replace `notifyApiError` with `showApiError` in all three mfe packages' `notify.js` utilities
- Show a persistent modal Quasar dialog (user must click OK to dismiss) with:
  - Title: the i18n-translated error code label, or a generic "Error" title when no known code is present
  - Body: the raw `message` string from `error.response.data.message`, with HTTP status line and `error.message` as fallbacks
- Register the Quasar `Dialog` plugin in `packages/shell/quasar.config.js` so that `Dialog.create()` works from non-component utility files

**Non-Goals:**

- Moving `notifyApiError` / `showApiError` into `packages/shared` — each mfe keeps its own local copy (no change to shared exports)
- Changing `notifySuccess` or any other notify helpers
- Adding a shared error-dialog component — the Quasar programmatic `Dialog.create()` API with a `message` string is sufficient; no custom component is needed

## Decisions

### Decision 1: Use Quasar programmatic `Dialog.create()` instead of inline `<q-dialog>` in each page

**Chosen**: Import `Dialog` from `quasar` in `notify.js` and call `Dialog.create({ title, message })`.

**Rationale**: The utility function is called from many pages. Programmatic creation means zero template changes — only the import line and function name in each page's `<script>` change. An inline dialog approach would require adding a reactive ref, a dialog component in the template, and wiring for every one of the 20 affected page files.

**Alternative considered**: Composable `useApiErrorDialog()` returning a `showApiError` function — rejected because it requires Vue's composition context (i.e., must be called inside `setup()`). The current pattern calls `notifyApiError` from async event handlers, not inside `setup()`, so a composable would force a large refactor.

### Decision 2: Register the `Dialog` Quasar plugin in `quasar.config.js`

**Chosen**: Add `'Dialog'` to the `framework.plugins` array in `packages/shell/quasar.config.js`.

**Rationale**: Without the plugin registered, `Dialog.create()` in a non-component utility file throws at runtime. The pages already have inline `<q-dialog>` components (which work without the plugin) — but programmatic creation requires the plugin. `Notify` is already registered this way.

**Alternative considered**: Use `$q.dialog()` from `useQuasar()` inside each page — rejected for the same reason as Decision 1 (requires composition context).

### Decision 3: Title resolution logic

**Chosen**:
1. If `error.response?.data?.code` is set, resolve `apiError.<code>` via `t()`. If the i18n key exists (translated value differs from the key string), use it as the title; otherwise fall back to the raw code string.
2. If no code is present, use `t('apiError.err_unknown')` (the generic "Unknown error" translation already in shared i18n) as the title.

**Rationale**: Matches the existing `notifyApiError` logic for the title portion. The i18n keys for all known Sylvia-IoT error codes already exist in `packages/shared/src/i18n/en-US.js` and `zh-TW.js`.

### Decision 4: Body content

**Chosen**: Use `error.response?.data?.message` as the primary body. Fall back to `HTTP {status}: {statusText}` when there is a response but no message, then to `error.message` when there is no response at all.

**Rationale**: This surfaces the server's human-readable diagnostic detail that is currently discarded. Network errors (no response object) still show a meaningful message via `error.message`.

## Risks / Trade-offs

- **Unit tests mock `Notify.create`** — tests that currently mock `notifyApiError` at module level or mock `Notify.create` must be updated to stub `Dialog.create` instead. This is a mechanical change but touches every test file that tests error paths.
- **E2E tests assert `.q-notification` selectors** — any existing E2E assertions on Quasar toast selectors will fail. They need to be updated to target `.q-dialog` and the OK button within it. A quick audit shows no E2E tests currently assert on error toasts (errors are covered only in unit tests), so this risk is low.
- **Dialog blocks the UI** — unlike a toast that auto-dismisses, the user must click OK to continue. This is intentional (the motivation) but means errors during loading states will block the page until dismissed. This is acceptable given the improved visibility.

## Migration Plan

1. Add `'Dialog'` to `quasar.config.js` `framework.plugins`
2. Update `notify.js` in each of the three mfe packages: rename `notifyApiError` → `showApiError`, replace `Notify` import with `Dialog`, update the implementation
3. Update all 20 page files: change the import (`notifyApiError` → `showApiError`), update all call-sites
4. Update unit tests that reference `notifyApiError` or mock `Notify.create`
5. No E2E changes expected (no E2E tests currently assert on error notifications)
6. Build and lint to confirm no remaining references to `notifyApiError`

Rollback: revert changes to `notify.js` files and page imports. No schema or data migration needed.

## Open Questions

- None.
