## 1. Install packages

- [x] 1.1 Run `npm install -w packages/shell pinia@^3.0.4 vue-router@^5.0.3 vue-i18n@^11.1.10` to upgrade the three dependencies

## 2. Verify build

- [x] 2.1 Run `npm run build` and confirm it succeeds with no errors from pinia, vue-router, or vue-i18n

## 3. Fix unit test failures

- [x] 3.1 Run `npm run test` and record all failing tests
- [x] 3.2 Fix any pinia-related test failures (store initialization, `setActivePinia`, cross-store references)
- [x] 3.3 Fix any vue-router-related test failures (router mock, `addRoute`, guard behavior)
- [x] 3.4 Fix any vue-i18n-related test failures (i18n setup, `useI18n`, locale mutation)
- [x] 3.5 Confirm all 118 unit tests pass

## 4. Fix lint errors

- [x] 4.1 Run `npm run lint` and fix any errors introduced by the upgrade

## 5. Verify E2E tests

- [x] 5.1 Start sylvia-iot-core (`skills/sylvia-iot-services/scripts/start.sh`)
- [x] 5.2 Build and serve the SPA (`npm run build && npx serve packages/shell/dist/spa -l 9000`)
- [x] 5.3 Run core E2E tests and confirm all pass
- [x] 5.4 Run data E2E tests and confirm all pass
- [x] 5.5 Start sylvia-router (`skills/sylvia-router/scripts/start.sh`) and run router E2E tests

## 6. Apply and verify remaining minor upgrades

- [x] 6.1 Run `npm install -w packages/shell quasar@^2.18.6 @quasar/extras@^1.17.0 axios@^1.13.5 @vue/test-utils@^2.4.6` to upgrade previously missed minor packages
- [x] 6.2 Confirm `packages/shell/package.json` also includes the earlier minor/patch upgrades (`@playwright/test`, `@quasar/app-vite`, `jsdom`, `vue`) and major devDependency upgrades (`eslint`, `eslint-plugin-vue`, `vitest`, `@vitest/coverage-v8`)
- [x] 6.3 Run `npm run lint` and `npm run test` to confirm all still pass
- [x] 6.4 Start sylvia-iot-core and re-run full core + data E2E suite
- [x] 6.5 Start sylvia-router and re-run router E2E suite

## 7. Upgrade vue-i18n to latest release version

- [x] 7.1 Run `npm install -w packages/shell vue-i18n@^11.2.8` and confirm root `package.json` is also updated to `^11.2.8`
- [x] 7.2 Run `npm run build`, `npm run lint`, and `npm run test` to confirm all pass
- [x] 7.3 Run core + data E2E tests and confirm all pass
- [x] 7.4 Run router E2E tests and confirm all pass

## 8. Stage changes

- [x] 8.1 `git add packages/shell/package.json package.json package-lock.json openspec/changes/upgrade-major-deps/ .github/workflows/release.yaml`

