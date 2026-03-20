## Why

Node.js 22 has entered Maintenance LTS while Node.js 24 is now Active LTS. The CI workflows should track the current Active LTS version. Several GitHub Actions and tools used in the workflows also have new major versions available. Additionally, the E2E about page test hardcodes a version string that breaks on every version bump.

## What Changes

### `build-test.yaml`
- Upgrade Node.js from 22 to 24 (Active LTS) across all CI jobs
- Upgrade `actions/checkout` from v4 to v6
- Upgrade `actions/setup-node` from v4 to v6
- Upgrade `actions/upload-artifact` from v4 to v7
- `JamesIves/github-pages-deploy-action` stays at v4 (latest is v4.8.0)
- `LCOV_BADGE_VER` stays at v0.2.0 (already latest)

### `release.yaml`
- Remove version tag from release archive filename: `sylvia-iot-gui-$TAG.tar.xz` → `sylvia-iot-gui.tar.xz` (version is already available in the `VERSION` asset; fixed filename allows scripts to download latest release without knowing the version in advance)
- Upgrade Node.js from 22 to 24
- Upgrade `actions/checkout` from v4 to v6
- Upgrade `actions/setup-node` from v4 to v6
- Upgrade `docker/setup-qemu-action` from v3 to v4
- Upgrade `docker/setup-buildx-action` from v3 to v4
- Upgrade `docker/login-action` from v3 to v4
- Upgrade `docker/metadata-action` from v5 to v6
- Upgrade `docker/build-push-action` from v6 to v7
- Upgrade `GHR_VER` from v0.17.0 to v0.18.0

### Version bump
- Bump version from 0.1.1 to 0.1.2 across all packages

### `package.json` (root)
- Upgrade `engines.node` from `>= 18.0.0` to `>= 22.0.0`
- `vue-i18n`: ^11.2.8 → ^11.3.0

### npm dependencies (`packages/shell/package.json`)
- `quasar`: ^2.18.6 → ^2.18.7
- `vue-i18n`: ^11.2.8 → ^11.3.0
- `vue`: ^3.5.29 → ^3.5.30
- `vue-router`: ^5.0.3 → ^5.0.4
- `@quasar/app-vite`: ^2.4.1 → ^2.5.2
- `@vitejs/plugin-vue`: ^6.0.4 → ^6.0.5
- `@vitest/coverage-v8`: ^4.0.18 → ^4.1.0
- `eslint`: ^10.0.2 → ^10.0.3
- `vitest`: ^4.0.18 → ^4.1.0
- `jsdom`: ^28.1.0 → ^29.0.1 (major bump)
- Skip: `@playwright/test` 1.59.0-alpha (pre-release)

### `Dockerfile`
- Upgrade nginx from `1.29.5-alpine-slim` to `1.29.6-alpine-slim`

### E2E test
- Refactor `packages/shell/e2e/about.spec.js` to read version dynamically from `package.json` instead of hardcoding it

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

_(none — these are CI/test infrastructure changes with no spec-level behavior impact)_

## Impact

- **CI workflows**: `.github/workflows/build-test.yaml` and `.github/workflows/release.yaml`
- All `package.json` files: version bump to 0.1.2
- `CHANGELOG.md`: add 0.1.2 section
- **`package.json`** (root): `engines.node` constraint
- **`packages/shell/package.json`**: multiple dependency version bumps
- **Dockerfile**: nginx base image upgrade
- **E2E test**: `packages/shell/e2e/about.spec.js` — version assertion
- **Risk**: Low. Node 24 LTS should be compatible. GitHub Actions major bumps may have breaking changes in inputs/outputs that need verification. Docker actions all moved to Node 24 runtime together.
