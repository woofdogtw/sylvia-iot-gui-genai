## Why

External plugins loaded via `window.config.plugins` fail in production builds because bare specifiers (`import 'vue'`, `import 'quasar'`) cannot be resolved by the browser without an import map. The shell's current build produces hashed chunk filenames that external plugins cannot reference predictably.

## What Changes

- Extract `vue` and `quasar` into fixed-name chunks (`assets/vue.js`, `assets/quasar.js`) via Vite `manualChunks` in `quasar.config.js`
- Inject an import map into the built `index.html` mapping bare specifiers to these fixed paths
- Document the bare-specifier contract in the `external-plugin-api` spec

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `external-plugin-api`: Add requirement that the shell exposes `vue` and `quasar` as shared modules via import map, so external plugins can use bare specifiers without bundling their own copies

## Impact

- `packages/shell/quasar.config.js`: `manualChunks` config + Vite plugin to inject import map into `index.html`
- `openspec/specs/external-plugin-api/spec.md`: new requirement for import map / shared module contract
- No API or auth changes; no breaking changes to existing plugins
