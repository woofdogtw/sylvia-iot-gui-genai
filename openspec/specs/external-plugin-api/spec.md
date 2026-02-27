# external-plugin-api Specification

## Purpose

Defines the public SDK that the shell exposes to external plugins via `window.sylviaShell`, enabling third-party micro-frontend plugins to make authenticated API calls without depending on the shell's internal monorepo packages.

## Requirements

### Requirement: Shell global API for external plugins

The shell SHALL expose a `window.sylviaShell` global object after boot, providing external plugins with a pre-configured HTTP client that handles authentication automatically.

#### Scenario: httpClient is available after shell boots

- **WHEN** the shell application has finished booting
- **THEN** `window.sylviaShell` SHALL be a non-null object
- **AND** `window.sylviaShell.httpClient` SHALL be an axios instance

#### Scenario: httpClient injects Bearer token on every request

- **WHEN** an external plugin calls `window.sylviaShell.httpClient.get(url)` while the user is authenticated
- **THEN** the request SHALL include an `Authorization: Bearer <access_token>` header automatically
- **AND** the plugin SHALL NOT need to set the header manually

#### Scenario: httpClient retries on 401 with refreshed token

- **WHEN** an API call made via `window.sylviaShell.httpClient` returns HTTP 401
- **AND** the endpoint is not an OAuth2 or auth endpoint
- **THEN** the client SHALL attempt to refresh the access token
- **AND** if refresh succeeds, the original request SHALL be retried once with the new token
- **AND** if refresh fails, the user SHALL be redirected to the login page

#### Scenario: External plugin documentation in README

- **WHEN** a developer wants to create an external plugin
- **THEN** the root README SHALL document `window.sylviaShell.httpClient` usage with a code example
- **AND** the documentation SHALL explain that plugins should NOT bundle their own axios instance

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

### Requirement: Locale change notification event

The shell SHALL dispatch a `sylvia-locale-change` CustomEvent on `window` whenever the active locale changes, allowing external plugins to react to language switches without depending on the shell's internal store.

#### Scenario: Event dispatched on locale change

- **WHEN** the user changes the application locale
- **THEN** the shell SHALL dispatch `new CustomEvent('sylvia-locale-change', { detail: { locale: val } })` on `window`
- **AND** `detail.locale` SHALL be the newly selected locale string (e.g. `'en-US'`, `'zh-TW'`)

#### Scenario: External plugin listens for locale change

- **WHEN** an external plugin registers `window.addEventListener('sylvia-locale-change', handler)`
- **THEN** `handler` SHALL be called with the event whenever the shell locale changes
- **AND** the plugin SHALL be able to read `event.detail.locale` to update its own i18n state
