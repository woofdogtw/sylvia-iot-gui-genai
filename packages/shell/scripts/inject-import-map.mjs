/**
 * Post-build script:
 * 1. Copy vue's full browser ESM build to dist/spa/assets/vue.js so that all
 *    vue exports (including compiler runtime helpers) are available to external plugins.
 * 2. Minify quasar's full ESM build (quasar/dist/quasar.client.js) and write to
 *    dist/spa/assets/quasar.js. The full build exports every Quasar component and
 *    plugin so external plugins can use any Quasar API without coordinating with the shell.
 * 3. Copy quasar's production CSS to dist/spa/assets/quasar.css and inject a
 *    <link rel="stylesheet"> into index.html so all Quasar component styles are
 *    available to external plugins without additional CSS bundling.
 * 4. Inject an import map into dist/spa/index.html mapping bare specifiers
 *    'vue' and 'quasar' to their fixed paths, enabling external plugins to use
 *    `import { ref } from 'vue'` and `import { Dark } from 'quasar'` natively.
 *
 * The import map must appear before any <script type="module"> tag per the HTML spec.
 * vue is marked as external in the Rollup build, so the shell bundle itself also
 * resolves 'vue' via the import map at runtime — guaranteeing a single vue instance.
 */
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { transform } from 'esbuild'

const require = createRequire(import.meta.url)

// 1. Copy full vue runtime browser build (pre-minified production build)
const vueSrcPath = require.resolve('vue/dist/vue.runtime.esm-browser.prod.js')
copyFileSync(vueSrcPath, 'dist/spa/assets/vue.js')
console.log('[inject-import-map] Copied vue browser build to dist/spa/assets/vue.js')

// 2. Minify full Quasar ESM build (quasar.client.js contains all components and plugins)
const quasarSrcPath = require.resolve('quasar/dist/quasar.client.js')
const quasarSrc = readFileSync(quasarSrcPath, 'utf8')
const { code: quasarMinified } = await transform(quasarSrc, { minify: true })
writeFileSync('dist/spa/assets/quasar.js', quasarMinified)
console.log('[inject-import-map] Minified Quasar full build to dist/spa/assets/quasar.js')

// 3. Copy full Quasar production CSS (already minified)
const quasarCssSrcPath = require.resolve('quasar/dist/quasar.prod.css')
copyFileSync(quasarCssSrcPath, 'dist/spa/assets/quasar.css')
console.log('[inject-import-map] Copied Quasar CSS to dist/spa/assets/quasar.css')

// 4. Inject import map and quasar.css link into index.html
const htmlPath = 'dist/spa/index.html'
const importMap =
  '<script type="importmap">{"imports":{"vue":"/assets/vue.js","quasar":"/assets/quasar.js"}}</script>'
const cssLink = '<link rel="stylesheet" href="/assets/quasar.css">'
const html = readFileSync(htmlPath, 'utf8')
writeFileSync(htmlPath, html.replace('<head>', `<head>${importMap}${cssLink}`))
console.log('[inject-import-map] Import map and quasar.css link injected into', htmlPath)
