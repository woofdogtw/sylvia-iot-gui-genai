## Why

The current `assets/quasar.js` shared chunk is produced by Rollup `manualChunks` and contains only the Quasar components and plugins that the shell itself uses after tree-shaking. External plugins that rely on Quasar components not used by the shell (e.g. `QTabs`, `QCard`, `QTabPanels`) receive `undefined` at runtime and fail to render, and have no Quasar component CSS either. Rebuilding the shell every time a new plugin needs an additional component is not sustainable.

## What Changes

### JS — full Quasar ESM build

- Remove the `manualChunks: { quasar: ['quasar'] }` Rollup option from `quasar.config.js`; the shell no longer needs to produce a Quasar chunk.
- In `scripts/inject-import-map.mjs`: read `quasar/dist/quasar.client.js` (Quasar's official full ESM build; imports `"vue"` as a bare specifier, compatible with the import map), minify it with esbuild (already available via Vite), and write the result to `dist/spa/assets/quasar.js` (~507 KB minified, down from ~1 MB). No new npm dependencies required.

### CSS — full Quasar stylesheet

- The shell's built CSS only includes Quasar component styles that the shell itself uses (tree-shaken by `@quasar/app-vite`). External plugins using other components would render unstyled.
- In `scripts/inject-import-map.mjs`: copy `quasar/dist/quasar.prod.css` to `dist/spa/assets/quasar.css` (~199 KB, gzip ~25 KB).
- Inject `<link rel="stylesheet" href="/assets/quasar.css">` into `index.html` `<head>` (before the shell's own CSS so the shell can override if needed).

### Quasar Plugins (Dark, Dialog, etc.)

- Quasar plugins must be installed into the Vue app at startup to be functional. The code for all 18 plugins is already present in `quasar.client.js`, so installing them adds no bundle size — only negligible runtime initialization cost (< 50 KB heap total).
- Expand `framework.plugins` in `quasar.config.js` to install all 18 Quasar plugins: `AddressbarColor`, `AppFullscreen`, `AppVisibility`, `BottomSheet`, `Cookies`, `Dark`, `Dialog`, `IconSet`, `Lang`, `Loading`, `LoadingBar`, `Meta`, `Notify`, `Platform`, `Screen`, `LocalStorage`, `SessionStorage`.
- Because `quasar.js` is a singleton (resolved via import map), all installed plugins are immediately available to any external plugin that imports them — no extra work required from the plugin author.

### Documentation

- Update README "Using Vue and Quasar in Your Plugin" section to document: full JS build, full CSS (auto-loaded), and all Quasar service plugins pre-installed and usable.
- Update `external-plugin-api` spec to reflect the new guarantees.

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `external-plugin-api`: The guarantee for `quasar.js` changes from "components used by the shell" to "all Quasar components and plugins"; `quasar.css` (full Quasar stylesheet) is now injected into `index.html`; and all 18 Quasar service plugins are pre-installed and available via the singleton — so external plugins can use any Quasar capability without coordination with the shell.

## Impact

- **`packages/shell/quasar.config.js`**: remove `manualChunks` for quasar and the associated `chunkFileNames` override; keep `external: ['vue']`; expand `framework.plugins` to all 18 Quasar plugins.
- **`packages/shell/scripts/inject-import-map.mjs`**: add esbuild minify of `quasar/dist/quasar.client.js` → `dist/spa/assets/quasar.js`; add copy of `quasar/dist/quasar.prod.css` → `dist/spa/assets/quasar.css`; inject `<link rel="stylesheet">` for `quasar.css` into `index.html`.
- **`openspec/specs/external-plugin-api/spec.md`**: update scenarios for `quasar.js` (full build) and add scenario for `quasar.css`.
- **`README.md`**: update "Using Vue and Quasar in Your Plugin" section.
- No API, routing, or authentication changes. No new npm dependencies.
