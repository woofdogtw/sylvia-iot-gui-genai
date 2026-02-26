## ADDED Requirements

### Requirement: Shared framework modules via import map

The shell build SHALL produce an `index.html` containing an import map that maps the bare specifiers `vue` and `quasar` to their fixed-path chunk files, enabling external plugins to use these frameworks without bundling their own copies.

#### Scenario: Import map present in production build

- **WHEN** the shell is built for production
- **THEN** `dist/index.html` SHALL contain a `<script type="importmap">` block in `<head>`
- **AND** the import map SHALL include entries: `"vue": "/assets/vue.js"` and `"quasar": "/assets/quasar.js"`
- **AND** the import map block SHALL appear before any `<script type="module">` tag

#### Scenario: Fixed-name chunks produced for vue and quasar

- **WHEN** the shell is built for production
- **THEN** `dist/assets/vue.js` SHALL exist as a stable, non-hashed filename
- **AND** `dist/assets/quasar.js` SHALL exist as a stable, non-hashed filename

#### Scenario: External plugin uses bare specifiers

- **WHEN** an external plugin module contains `import { ref } from 'vue'` or `import { Dark } from 'quasar'`
- **AND** the plugin is loaded via `window.config.plugins` in a production shell
- **THEN** the browser SHALL resolve the bare specifiers using the import map
- **AND** the plugin SHALL NOT need to bundle its own copy of `vue` or `quasar`

#### Scenario: Vue is a singleton shared between shell and plugins

- **WHEN** an external plugin imports `vue` via the import map
- **THEN** `vue` SHALL resolve to the same module instance used by the shell
- **AND** Vue reactivity (refs, watchers, provide/inject) SHALL work correctly across shell and plugin boundaries
