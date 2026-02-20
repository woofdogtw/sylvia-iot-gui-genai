# Change: Add About Page

## Why

The GUI provides no way to verify which version of the frontend or backend services is running. An About page gives operators and developers immediate access to version information without inspecting deployment manifests or backend logs.

## What Changes

- **New About page in the shell** (not a plugin): displays frontend name/version and backend service version(s)
  - Frontend name and version injected at build time from `packages/shell/package.json` via `quasar.config.js` env
  - Core service version fetched from `GET /version` on the coremgr base URL at page load
- **New "About" menu item** added to the hamburger menu, positioned after "Home" and before the plugin category sections
- **New route `/about`** registered in the shell router (not a plugin route), requires authentication
- **i18n**: en-US and zh-TW labels for all About page text

## Capabilities

### New Capabilities

_(none — the About page is a built-in shell feature, not a standalone plugin capability)_

### Modified Capabilities

- `shell`: Hamburger Menu Navigation gains an "About" entry after "Home"; shell adds a new `/about` route and page component

## Impact

- Affected code: `packages/shell/src/` (new AboutPage component, router config, layout menu, i18n strings, `quasar.config.js` build env)
- APIs consumed: `GET /version` on coremgr base URL (public, no auth)
- Dependencies: none new
- Breaking changes: none
