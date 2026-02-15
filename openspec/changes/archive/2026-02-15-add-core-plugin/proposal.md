# Change: Add Core Management Plugin

## Why

The shell framework is complete but has no management pages. The core plugin provides the primary administration UI for Sylvia-IoT, covering user/client management (auth) and unit/application/network/device/routing management (broker) — all accessed through the coremgr API. This is the first functional plugin that makes the GUI actually useful.

## What Changes

- **Create `packages/mfe-core/` plugin** with 9 management pages:
  - User, Client, Unit, Application, Network, Device, Device Route, Network Route, DL Data Buffer
- **Common UI pattern**: toolbar (filter/search/actions) + paginated table + dialog forms (add/edit/delete)
- **API integration**: All pages call coremgr API endpoints with auth token
- **i18n**: Full en-US + zh-TW translations for all pages
- **Role-based UI**: Admin/manager see additional fields (owner selection, role assignment)
- **Register as builtin plugin** in shell's `boot/plugins.js` under `core` category

## Impact

- Affected specs: New capability `core`
- Affected code: New `packages/mfe-core/`, modified `packages/shell/src/boot/plugins.js`
- Breaking changes: None
- Dependencies: Existing `@sylvia-iot/shared` (API clients, i18n, plugin interface)
