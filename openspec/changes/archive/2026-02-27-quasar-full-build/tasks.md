## 1. quasar.config.js — remove manualChunks, install all plugins

- [x] 1.1 Remove `manualChunks: { quasar: ['quasar'] }` from `extendViteConf` in `packages/shell/quasar.config.js`
- [x] 1.2 Remove the `chunkFileNames` override from `extendViteConf` (no longer needed without the quasar chunk)
- [x] 1.3 Expand `framework.plugins` to the full list of all 18 Quasar plugins: `AddressbarColor`, `AppFullscreen`, `AppVisibility`, `BottomSheet`, `Cookies`, `Dark`, `Dialog`, `IconSet`, `Lang`, `Loading`, `LoadingBar`, `Meta`, `Notify`, `Platform`, `Screen`, `LocalStorage`, `SessionStorage`

## 2. inject-import-map.mjs — add quasar JS and CSS

- [x] 2.1 Add esbuild `transform` call to read `quasar/dist/quasar.client.js`, minify it, and write to `dist/spa/assets/quasar.js`
- [x] 2.2 Add `copyFileSync` to copy `quasar/dist/quasar.prod.css` to `dist/spa/assets/quasar.css`
- [x] 2.3 Inject `<link rel="stylesheet" href="/assets/quasar.css">` into `index.html` immediately after the import map `<script>` tag (before the shell's own CSS)
- [x] 2.4 Update the script's header comment to document all three operations (vue.js, quasar.js, quasar.css)

## 3. README — update external plugin documentation

- [x] 3.1 Update the "Using Vue and Quasar in Your Plugin" section to state that `quasar.js` contains the full Quasar build (all components available)
- [x] 3.2 Add a note that `quasar.css` is automatically loaded — plugin authors do not need to include any additional stylesheet
- [x] 3.3 Add a note listing that all Quasar service plugins are pre-installed and accessible via the shared singleton

## 4. Verify

- [x] 4.1 Run `npm run build` in `packages/shell` and confirm `dist/spa/assets/quasar.js`, `dist/spa/assets/quasar.css`, and `dist/spa/assets/vue.js` all exist
- [x] 4.2 Confirm `dist/spa/index.html` contains the import map and `<link rel="stylesheet" href="/assets/quasar.css">`
- [x] 4.3 Confirm `dist/spa/assets/quasar.js` does NOT exist as a Rollup chunk (no hash-named quasar chunk in dist)
- [x] 4.4 Run `npm test` in `packages/shell` and confirm all unit tests pass
