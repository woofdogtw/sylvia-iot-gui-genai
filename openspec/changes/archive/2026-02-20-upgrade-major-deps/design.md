## Context

Three major runtime dependencies are being upgraded:

- `pinia` 2.x → 3.x
- `vue-router` 4.x → 5.x
- `vue-i18n` 9.x → 11.2.8 (latest release version)

All stores already use Composition API. i18n already uses `legacy: false`. The codebase is JS-only
(no TypeScript), so typed-route features in vue-router 5 are irrelevant.

## Goals / Non-Goals

**Goals:**
- Upgrade all three packages to their target stable versions
- Ensure all 118 unit tests and 172 E2E tests pass after upgrade
- Keep the same Quasar boot wrapper pattern

**Non-Goals:**
- Adopting TypeScript or typed routes (vue-router 5 feature)
- Refactoring store or router architecture beyond what migration requires

## Decisions

### Decision 1: Upgrade all three at once

**Options considered:**
- A) Upgrade one library at a time, committing after each
- B) Upgrade all three in a single change

**Decision: B — all at once.**

The three libraries are tightly coupled through the boot sequence (`i18n` → `axios` → `plugins`)
and the router guard accesses the Pinia auth store. Testing them together surfaces any
cross-library regression in a single test run. There is no meaningful isolation benefit to
upgrading separately.

### Decision 2: Keep `locale.value` direct mutation for vue-i18n

vue-i18n 11.x with `legacy: false` still exposes `locale` as a writable ref. The current pattern
in `SettingsPage.vue` (`i18nLocale.value = val`) remains valid. No change needed.

### Decision 3: No changes to `createI18n` options

`createI18n({ legacy: false, locale, fallbackLocale, messages })` signature is unchanged in 11.x.
The monorepo message-merging spread pattern (`...coreMessages['en-US']`) continues to work.

### Decision 4: No changes to `addRoute('root', route)` usage

vue-router 5 retains the `router.addRoute(parentName, route)` signature. The plugin boot file
(`boot/plugins.js`) needs no changes.

### Decision 5: No changes to navigation guard in `router/index.js`

The `beforeEach((to) => { ... })` guard return convention (return route object to redirect,
return nothing to proceed) is unchanged in vue-router 5.

## Risks / Trade-offs

- **[Risk] Quasar boot wrapper compatibility** — `quasar/wrappers` `store()`, `route()`, and `boot()`
  helpers must support pinia 3 and vue-router 5. `@quasar/app-vite` was already upgraded to 2.4.1
  (patch/minor step), which should include support. → **Mitigation**: Run `npm run build` after
  `npm install` to catch any Quasar incompatibility before running tests.

- **[Risk] vue-i18n 9 → 11 skips version 10** — Two major versions of breaking changes.
  The key risk is deprecated APIs that were removed in 10 and then 11.
  Since the project uses only `createI18n`, `useI18n`, and `t()`, exposure is minimal.
  → **Mitigation**: If build or unit tests fail, consult the vue-i18n 10 and 11 migration guides
  for the specific error.

- **[Risk] Pinia 3 removes `$reset()`** — Not used in this codebase; no impact.

## Migration Plan

1. Run `npm install` to upgrade the three packages to target versions
2. Run `npm run build` — catches Quasar boot/wrapper incompatibilities early
3. Run `npm run lint` — catches any API surface changes detected statically
4. Run `npm run test` — 118 unit tests; fix any failures
5. Run E2E tests locally against sylvia-iot-core — 172 tests; fix any failures
6. Stage changes and open PR; CI runs full suite

**Rollback**: `git revert` the package.json and package-lock.json changes if CI fails and the
root cause cannot be resolved quickly.

## Open Questions

None. All migration paths are low-risk given the existing Composition API usage.
