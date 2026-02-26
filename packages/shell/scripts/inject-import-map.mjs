/**
 * Post-build script:
 * 1. Copy vue's full browser ESM build to dist/spa/assets/vue.js so that all
 *    vue exports (including compiler runtime helpers) are available to external plugins.
 * 2. Inject an import map into dist/spa/index.html mapping bare specifiers
 *    'vue' and 'quasar' to their fixed paths, enabling external plugins to use
 *    import 'vue' and import 'quasar' without bundling their own copies.
 *
 * The import map must appear before any <script type="module"> tag per the HTML spec.
 * vue is marked as external in the Rollup build, so the shell bundle itself also
 * resolves 'vue' via the import map at runtime — guaranteeing a single vue instance.
 */
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

// Use the runtime-only production browser build (smaller; templates are pre-compiled)
const vueSrcPath = require.resolve('vue/dist/vue.runtime.esm-browser.prod.js')
copyFileSync(vueSrcPath, 'dist/spa/assets/vue.js')
console.log('[inject-import-map] Copied vue browser build to dist/spa/assets/vue.js')

const htmlPath = 'dist/spa/index.html'
const importMap =
  '<script type="importmap">{"imports":{"vue":"/assets/vue.js","quasar":"/assets/quasar.js"}}</script>'
const html = readFileSync(htmlPath, 'utf8')
writeFileSync(htmlPath, html.replace('<head>', `<head>${importMap}`))
console.log('[inject-import-map] Import map injected into', htmlPath)
