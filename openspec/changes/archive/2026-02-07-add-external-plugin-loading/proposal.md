# Change: Add External Plugin Loading Support

## Why

The current plugin system requires all plugins to be statically imported at build time, meaning third-party developers must fork the monorepo to contribute plugins. This mirrors the Sylvia-IoT backend architecture where microservices can either be statically linked into a single binary or run independently. Adding external plugin loading enables third-party plugins to be built and deployed separately, then loaded via runtime configuration.

## What Changes

- **Modify plugin loader** to support both builtin (static import) and external (dynamic import from URL) plugins
- **Add `plugins` config option** to `window.config` for specifying external plugin URLs
- **Add error handling** so a failing external plugin does not crash the shell

## Impact

- Affected specs: `shell` (Plugin System, Runtime Configuration)
- Affected code: `packages/shell/src/boot/plugins.js`, `packages/shell/public/js/config.js`
- Breaking changes: None (existing plugins continue to work unchanged)
