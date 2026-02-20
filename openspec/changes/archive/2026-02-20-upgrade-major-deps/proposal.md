## Why

Three core runtime dependencies — pinia, vue-router, and vue-i18n — have released new major versions
with breaking API changes. Upgrading keeps the project aligned with the Vue 3 ecosystem,
brings performance improvements, and avoids accumulating technical debt.

## What Changes

- **BREAKING** Upgrade `pinia` from `^2.3.1` to `^3.0.4`: store definition and plugin API changes
- **BREAKING** Upgrade `vue-router` from `^4.6.4` to `^5.0.3`: routing API and navigation guard changes
- **BREAKING** Upgrade `vue-i18n` from `^9.14.5` to `^11.2.8` (latest release version): composition API and message format changes
- Migrate all usages across `packages/shell` and `packages/shared` to the new APIs
- Update unit tests and E2E tests as needed to reflect API changes

## Capabilities

### New Capabilities

None. This is a maintenance upgrade; no new user-facing capabilities are introduced.

### Modified Capabilities

None. User-visible behavior and all spec-level requirements remain unchanged.

## Impact

- `packages/shell/src/` — stores (pinia), router setup (vue-router), i18n setup (vue-i18n), boot files, layouts, pages
- `packages/shared/src/` — any pinia/vue-router composables or API clients
- `packages/shell/src/__tests__/` — unit tests referencing pinia stores or router
- `packages/shell/e2e/` — E2E tests (behavioral, likely unaffected unless router API changes routing behavior)
- `package-lock.json` — lock file update
