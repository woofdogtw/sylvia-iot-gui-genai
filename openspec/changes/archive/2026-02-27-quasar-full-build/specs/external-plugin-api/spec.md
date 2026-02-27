## MODIFIED Requirements

### Requirement: Shared framework modules via import map

The shell build SHALL produce an `index.html` containing an import map that maps the bare specifiers `vue` and `quasar` to their fixed-path files, enabling external plugins to use these frameworks without bundling their own copies.

#### Scenario: Import map present in production build

- **WHEN** the shell is built for production
- **THEN** `dist/index.html` SHALL contain a `<script type="importmap">` block in `<head>`
- **AND** the import map SHALL include entries: `"vue": "/assets/vue.js"` and `"quasar": "/assets/quasar.js"`
- **AND** the import map block SHALL appear before any `<script type="module">` tag

#### Scenario: Fixed-name files produced for vue and quasar

- **WHEN** the shell is built for production
- **THEN** `dist/assets/vue.js` SHALL exist as a stable, non-hashed filename containing the full Vue runtime browser build
- **AND** `dist/assets/quasar.js` SHALL exist as a stable, non-hashed filename containing the full Quasar ESM build with ALL components and plugins exported

#### Scenario: External plugin uses bare specifiers

- **WHEN** an external plugin module contains `import { ref } from 'vue'` or `import { Dark } from 'quasar'`
- **AND** the plugin is loaded via `window.config.plugins` in a production shell
- **THEN** the browser SHALL resolve the bare specifiers using the import map
- **AND** the plugin SHALL NOT need to bundle its own copy of `vue` or `quasar`

#### Scenario: Vue is a singleton shared between shell and plugins

- **WHEN** an external plugin imports `vue` via the import map
- **THEN** `vue` SHALL resolve to the same module instance used by the shell
- **AND** Vue reactivity (refs, watchers, provide/inject) SHALL work correctly across shell and plugin boundaries

#### Scenario: All Quasar components available to external plugins

- **WHEN** an external plugin imports any Quasar component (e.g. `QTabs`, `QCard`, `QTabPanels`) from `'quasar'`
- **THEN** the import SHALL resolve to a fully functional component
- **AND** the plugin SHALL NOT need to coordinate with the shell about which components are included

## ADDED Requirements

### Requirement: Quasar CSS auto-loaded for external plugins

The shell SHALL inject the full Quasar stylesheet into `index.html` so that external plugins using any Quasar component receive correct styling without bundling their own CSS.

#### Scenario: Quasar CSS injected in production build

- **WHEN** the shell is built for production
- **THEN** `dist/assets/quasar.css` SHALL exist containing the complete Quasar component stylesheet
- **AND** `dist/index.html` SHALL contain `<link rel="stylesheet" href="/assets/quasar.css">` in `<head>`
- **AND** the link tag SHALL appear before the shell's own CSS bundle so shell styles take precedence

#### Scenario: External plugin components render with correct styles

- **WHEN** an external plugin renders a Quasar component (e.g. `QTabs`, `QBtn`) not used by the shell itself
- **THEN** the component SHALL render with correct Quasar styles
- **AND** the plugin SHALL NOT need to load any additional CSS

### Requirement: All Quasar service plugins pre-installed

The shell SHALL install all 18 Quasar service plugins into the Vue app at startup so that external plugins can use any Quasar service plugin via the shared singleton without additional configuration.

#### Scenario: All Quasar service plugins available

- **WHEN** the shell application has finished booting
- **THEN** all Quasar service plugins SHALL be installed and functional: `AddressbarColor`, `AppFullscreen`, `AppVisibility`, `BottomSheet`, `Cookies`, `Dark`, `Dialog`, `IconSet`, `Lang`, `Loading`, `LoadingBar`, `Meta`, `Notify`, `Platform`, `Screen`, `LocalStorage`, `SessionStorage`

#### Scenario: External plugin uses Quasar service plugin

- **WHEN** an external plugin imports a Quasar service plugin (e.g. `import { Loading } from 'quasar'`) and calls its methods (e.g. `Loading.show()`)
- **THEN** the service plugin SHALL function correctly
- **AND** the plugin SHALL NOT need to install the service plugin itself
