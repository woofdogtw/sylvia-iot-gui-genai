## Context

The shell loads external plugins as ES modules via dynamic `import()`. These plugins are authored against Vue + Quasar and naturally use bare specifiers (`import 'vue'`, `import 'quasar'`). In a browser ESM context, bare specifiers are only resolvable via an import map — without one, the browser throws `TypeError: Failed to resolve module specifier "vue"`.

Vite's production build hashes all chunk filenames by default (e.g., `vue-BKztE-Kk.js`), making it impossible for the import map to reference them with static paths. Dev mode is unaffected because Vite's dev server handles module resolution transparently.

Current `quasar.config.js` has no `rollupOptions` and uses default Vite chunking.

## Goals / Non-Goals

**Goals:**
- External plugins can use `import 'vue'` and `import 'quasar'` as bare specifiers without bundling their own copies
- Vue and Quasar are guaranteed to be singletons (one instance shared by shell + all plugins)
- All of vue's public exports are available to external plugins (including compiler runtime helpers like `createBlock`)

**Non-Goals:**
- Exposing other dependencies (e.g., `pinia`, `vue-router`, `axios`) via import map — plugins should bundle these or use `window.sylviaShell`
- Supporting React or other non-Vue frameworks via import map
- Cache-busting for vue/quasar chunks on every build

## Decisions

### 1. `vue` as Rollup external + copy pre-built browser bundle

Mark `vue` as `external` in Rollup so the shell bundle emits `import { ... } from 'vue'` statements. The browser resolves these via the import map at runtime.

In `postbuild`, copy `vue/dist/vue.runtime.esm-browser.prod.js` (ships with the vue npm package) to `dist/spa/assets/vue.js`. This file:
- Contains ALL of vue's runtime exports (including `createBlock`, `createElementBlock`, etc.)
- Is the official pre-built browser-optimized production build
- Guarantees singleton: both shell and external plugins resolve to the same `/assets/vue.js`

**Why not `manualChunks: { vue: ['vue'] }`?** That approach creates a Rollup code-split chunk which is tree-shaken to only include exports used by the shell build. External plugins compiled with older Vue template compilers use `createBlock`, which is absent from the shell's bundle. Using `external` + the pre-built dist file avoids tree-shaking entirely.

### 2. `quasar` via `manualChunks` with fixed name

Quasar cannot be marked as external (it has deep integration with Vite and the Quasar CLI build process). Instead, use `manualChunks: { quasar: ['quasar'] }` with `chunkFileNames` returning `assets/quasar.js` (no hash). Applied via `build.extendViteConf` since Quasar's `build.rollupOptions` key does not get passed through to Vite correctly.

### 3. Import map injected via `postbuild` npm script

Quasar's HTML minifier strips `<script type="importmap">` tags (unrecognized script type). `transformIndexHtml` Vite plugin hooks also do not survive Quasar's post-processing pipeline. The reliable solution: use npm's `postbuild` lifecycle hook to run `scripts/inject-import-map.mjs` after `quasar build` completes, which both copies the vue dist file and patches `dist/spa/index.html` with the import map.

**Why `<head>` prepend?** The import map `<script>` must appear before any `<script type="module">` tag per the HTML spec.

### 4. No import map in dev mode

In dev mode, Vite resolves all module specifiers through its own dev server — the import map in `index.html` is not present. Vite's module graph handles `vue` imports transparently, and marking `vue` as external only affects production builds.

## Risks / Trade-offs

- **`vue` external in shell bundle** → `dist/spa/assets/vue.js` must be served correctly; if missing, the entire app fails. Mitigation: `postbuild` script copies the file and would fail loudly if `require.resolve` cannot find the dist file.
- **No hash for vue/quasar** → stale cache risk. Mitigation: deployers should set `no-cache` on `assets/vue.js` and `assets/quasar.js`, or redeploy with cache invalidation on version bumps.
- **Import map browser support** → all target browsers (Chrome 115+, Firefox 115+, Safari 14+) support import maps natively. No polyfill needed.

## Open Questions

_(none)_
