## 1. Version Bump

- [x] 1.1 Update `version` to `0.1.2` in `package.json` (root)
- [x] 1.2 Update `version` to `0.1.2` in `packages/shell/package.json`
- [x] 1.3 Update `version` to `0.1.2` in `packages/shared/package.json`
- [x] 1.4 Update `version` to `0.1.2` in `packages/mfe-example/package.json`
- [x] 1.5 Add `0.1.2` section to `CHANGELOG.md`

## 2. Root `package.json`

- [x] 2.1 Update `engines.node` from `>= 18.0.0` to `>= 22.0.0`
- [x] 2.2 Update `vue-i18n` from `^11.2.8` to `^11.3.0`

## 3. `packages/shell/package.json` Dependencies

- [x] 3.1 Update `quasar` from `^2.18.6` to `^2.18.7`
- [x] 3.2 Update `vue` from `^3.5.29` to `^3.5.30`
- [x] 3.3 Update `vue-i18n` from `^11.2.8` to `^11.3.0`
- [x] 3.4 Update `vue-router` from `^5.0.3` to `^5.0.4`
- [x] 3.5 Update `@quasar/app-vite` from `^2.4.1` to `^2.5.2`
- [x] 3.6 Update `@vitejs/plugin-vue` from `^6.0.4` to `^6.0.5`
- [x] 3.7 Update `@vitest/coverage-v8` from `^4.0.18` to `^4.1.0`
- [x] 3.8 Update `eslint` from `^10.0.2` to `^10.0.3`
- [x] 3.9 Update `jsdom` from `^28.1.0` to `^29.0.1`
- [x] 3.10 Update `vitest` from `^4.0.18` to `^4.1.0`
- [x] 3.11 Run `npm install` to update `package-lock.json`

## 4. Dockerfile

- [x] 4.1 Update nginx base image from `nginx:1.29.5-alpine-slim` to `nginx:1.29.6-alpine-slim`

## 5. CI: `build-test.yaml`

- [x] 5.1 Update `node-version` from `'22'` to `'24'` in all 4 jobs
- [x] 5.2 Update `actions/checkout` from `v4` to `v6` in all 4 jobs
- [x] 5.3 Update `actions/setup-node` from `v4` to `v6` in all 4 jobs
- [x] 5.4 Update `actions/upload-artifact` from `v4` to `v7` in both upload steps

## 6. CI: `release.yaml`

- [x] 6.1 Update `node-version` from `'22'` to `'24'`
- [x] 6.2 Update `actions/checkout` from `v4` to `v6`
- [x] 6.3 Update `actions/setup-node` from `v4` to `v6`
- [x] 6.4 Update `docker/setup-qemu-action` from `v3` to `v4`
- [x] 6.5 Update `docker/setup-buildx-action` from `v3` to `v4`
- [x] 6.6 Update `docker/login-action` from `v3` to `v4` (both steps)
- [x] 6.7 Update `docker/metadata-action` from `v5` to `v6`
- [x] 6.8 Update `docker/build-push-action` from `v6` to `v7`
- [x] 6.9 Update `GHR_VER` from `v0.17.0` to `v0.18.0`
- [x] 6.10 Rename release archive from `sylvia-iot-gui-$TAG.tar` to `sylvia-iot-gui.tar` (and corresponding `.tar.xz`)

## 7. E2E Test Fix

- [x] 7.1 Confirm `packages/shell/e2e/about.spec.js` reads version dynamically from `../package.json` (already done — verify only)

## 8. Verification

- [x] 8.1 Run `npm run lint` — no errors
- [x] 8.2 Run `npm run test` — all unit tests pass (119/119)
