## Context

The project CI uses GitHub Actions with Node.js 22 (now Maintenance LTS), several GitHub Actions at outdated major versions, and an nginx base image one patch behind. The `release.yaml` workflow uses `ghr` to publish releases with a versioned archive filename, which requires callers to know the version before downloading. The E2E about test hardcodes the version string, breaking on every version bump.

## Goals / Non-Goals

**Goals:**
- Upgrade Node.js runtime to 24 (Active LTS) in all CI jobs
- Bring all GitHub Actions to their latest major version
- Upgrade nginx to 1.29.6-alpine-slim
- Upgrade all npm dependencies to latest stable (excluding pre-releases)
- Remove version from release archive filename so scripts can use a fixed download URL
- Bump project version to 0.1.2 and update CHANGELOG
- Fix E2E about test to read version from `package.json` dynamically

**Non-Goals:**
- Upgrading to pre-release versions (`vue` 3.6.0-beta, `@playwright/test` 1.59.0-alpha)
- Changing the CI workflow structure or adding new jobs
- Changing the release process beyond the filename fix

## Decisions

### 1. Node.js 24 as target (not 22)
Node.js 22 entered Maintenance LTS in October 2025. Node.js 24 is now Active LTS and is the recommended version for production use. All jobs in both `build-test.yaml` and `release.yaml` are updated together.

### 2. Fixed release archive filename
**Decision**: Rename `sylvia-iot-gui-$TAG.tar.xz` → `sylvia-iot-gui.tar.xz`.

**Rationale**: GitHub's latest release API always points to the most recent release. With a fixed filename, a skill script can download `sylvia-iot-gui.tar.xz` from the latest release without needing to know the version in advance. The version is already available as a separate `VERSION` asset.

### 3. `engines.node` set to `>= 22.0.0`
Set to `>= 22.0.0` rather than `>= 24.0.0` to allow developers still on Node.js 22 LTS to run the project locally. CI enforces Node 24.

### 4. Dynamic version in E2E test
Use `createRequire(import.meta.url)` to load `../package.json` at test runtime. This is already supported by Node.js 18+ and requires no additional dependencies.

## Risks / Trade-offs

- **`jsdom` 28 → 29 (major bump)** → May contain breaking changes affecting unit tests. Mitigation: run unit tests after upgrading; revert to `^28` if failures are found.
- **`actions/upload-artifact` v4 → v7** → Inputs/outputs may have changed. Mitigation: verify CI passes; the step only uploads on failure so the impact is limited.
- **Docker actions major bumps** → All five Docker actions moved to Node 24 runtime simultaneously (released 2026-03-04/05). They are designed to be upgraded together. Mitigation: verify release workflow on next tag.
- **Fixed archive filename** → If someone has scripted against the versioned filename, their script will break. Mitigation: document in CHANGELOG.

## Migration Plan

1. Update all files in a single PR (no staged rollout needed — all changes are independent)
2. CI runs automatically on PR; verify all jobs pass
3. Merge and tag `v0.1.2` to trigger release workflow
4. Verify GitHub Release has `sylvia-iot-gui.tar.xz` (not versioned filename)

Rollback: revert the PR — no database migrations or external state changes involved.
