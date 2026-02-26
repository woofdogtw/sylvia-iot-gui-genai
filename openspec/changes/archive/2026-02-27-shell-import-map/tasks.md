## 1. Build Configuration

- [x] 1.1 In `packages/shell/quasar.config.js`, add `build.extendViteConf`: mark `vue` as Rollup `external` and add `manualChunks: { quasar: ['quasar'] }`
- [x] 1.2 Add `build.rollupOptions.output.chunkFileNames` function: return `assets/[name].js` (no hash) when `chunk.name` is `vue` or `quasar`, otherwise return `assets/[name]-[hash].js`

## 2. Import Map Injection

- [x] 2.1 Add `postbuild` npm script in `packages/shell/package.json` that runs `node scripts/inject-import-map.mjs`
- [x] 2.2 Create `packages/shell/scripts/inject-import-map.mjs`: copy `vue/dist/vue.runtime.esm-browser.prod.js` to `dist/spa/assets/vue.js` and patch `dist/spa/index.html` to prepend `<script type="importmap">` after `<head>`

## 3. Verification

- [x] 3.1 Run `npm run build` in `packages/shell` and confirm `dist/assets/vue.js` and `dist/assets/quasar.js` exist with fixed names
- [x] 3.2 Inspect `dist/index.html` and confirm the import map `<script>` block appears before any `<script type="module">` tag
- [x] 3.3 Confirm existing unit tests still pass (`npm test` in `packages/shell`)
