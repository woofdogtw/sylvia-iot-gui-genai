# Sylvia-IoT GUI

[![CI](https://github.com/woofdogtw/sylvia-iot-gui-genai/actions/workflows/build-test.yaml/badge.svg)](https://github.com/woofdogtw/sylvia-iot-gui-genai/actions/workflows/build-test.yaml)
[![Docker](https://img.shields.io/docker/v/woofdogtw/sylvia-iot-gui?label=docker&logo=docker)](https://hub.docker.com/r/woofdogtw/sylvia-iot-gui)
[![Coverage](https://woofdogtw.github.io/sylvia-iot-gui-genai/docs/coverage/shell/badge.svg)](https://woofdogtw.github.io/sylvia-iot-gui-genai/docs/coverage/shell/html/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Micro-frontend applications for the [Sylvia-IoT](https://github.com/woofdogtw/sylvia-iot-core) IoT platform.

> **Note:** This project is also a practice ground for AI-assisted development using [Claude Code](https://claude.ai/claude-code) with a spec-driven workflow powered by [OpenSpec](https://github.com/Fission-AI/OpenSpec).

## Architecture

This project uses a monorepo structure with a shell framework and plugin-based micro-frontends:

```
packages/
├── shell/          # Main shell application (Quasar Framework)
├── shared/         # Shared utilities, API clients, plugin interface
├── mfe-example/    # Example micro-frontend plugin
└── ...             # Additional micro-frontends
```

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Configuration

Runtime configuration is in `packages/shell/public/js/config.js`. This file can be modified after build without rebuilding.

See [packages/shell/README.md](packages/shell/README.md) for details.

## Creating Plugins

See [packages/shared/README.md](packages/shared/README.md) for the plugin interface and development guide.

## External Plugin Development

External plugins are standalone ES modules loaded at runtime via `window.config.plugins`. No dependency on this monorepo is required.

### Plugin Interface

A plugin is a plain JavaScript object with a default export:

```js
// my-plugin.js
export default {
  id: 'my-app',              // Required: unique identifier
  name: 'My Application',   // Required: display name
  category: 'applications', // Required: 'core' | 'data' | 'router' | 'applications' | 'networks'
  order: 0,                  // Optional: display order within category
  routes: [                  // Optional: Vue Router route definitions
    {
      path: '/my-app',
      name: 'my-app',
      component: () => import('./pages/MyPage.vue'),
    },
  ],
  menuItems: [               // Optional: sidebar menu entries
    {
      label: 'My Application',
      icon: 'apps',          // Material icon name
      route: '/my-app',
      order: 0,
    },
  ],
}
```

### Accessing Runtime Configuration

The shell exposes its runtime configuration via `window.config`. Use this to build API URLs without hardcoding endpoints:

```js
const coremgrBase = window.config?.coremgr?.baseUrl  // e.g. 'http://localhost:1080/coremgr'
const dataBase    = window.config?.data?.baseUrl
const routerBase  = window.config?.router?.baseUrl
```

### Making Authenticated API Calls

The shell exposes a pre-configured [Axios](https://axios-http.com/) instance via `window.sylviaShell.httpClient`. This instance automatically:

- Injects the `Authorization: Bearer <token>` header on every request.
- Retries once with a refreshed token on HTTP 401 responses (for non-auth endpoints).
- Redirects to the login page if the token refresh fails.

Use it instead of creating your own axios instance:

```js
// In a Vue component or composable inside your external plugin
const http = window.sylviaShell.httpClient
const coremgrBase = window.config?.coremgr?.baseUrl

async function fetchDevices() {
  const { data } = await http.get(`${coremgrBase}/api/v1/unit/list`)
  return data.data
}
```

> **Note:** Do not bundle your own axios copy in the plugin. Using `window.sylviaShell.httpClient` ensures you share the same interceptor chain (and avoid version mismatches) with the shell.

### Using Vue and Quasar in Your Plugin

If your plugin is built with Vue or Quasar, declare them as external dependencies (do not bundle them). The shell provides both via an [import map](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap) so the browser resolves `vue` and `quasar` bare specifiers automatically:

```js
// These bare specifiers resolve via the shell's import map — no bundling needed
import { ref, computed } from 'vue'
import { Dark, QTabs, Loading } from 'quasar'
```

The shell serves `quasar.js` as the **complete Quasar build** — every component (`QBtn`, `QCard`, `QTabs`, `QTabPanels`, etc.) and every service plugin (`Dark`, `Dialog`, `Loading`, `Notify`, etc.) is available. You do not need to coordinate with the shell about which Quasar APIs your plugin uses.

Configure your bundler to treat them as external:

```js
// vite.config.js (or rollup.config.js)
export default {
  build: {
    rollupOptions: {
      external: ['vue', 'quasar'],
    },
  },
}
```

**CSS is loaded automatically.** The shell injects the full Quasar stylesheet into every page — your plugin components will render with correct styles without any additional CSS configuration.

**All Quasar service plugins are pre-installed.** The shell installs all 18 Quasar service plugins at startup: `AddressbarColor`, `AppFullscreen`, `AppVisibility`, `BottomSheet`, `Cookies`, `Dark`, `Dialog`, `IconSet`, `Lang`, `Loading`, `LoadingBar`, `Meta`, `Notify`, `Platform`, `Screen`, `LocalStorage`, `SessionStorage`. Because `quasar` resolves to a single shared instance via the import map, these plugins are immediately available to your plugin code.

> **Note:** Do not bundle your own copy of `vue` or `quasar`. The shell guarantees a single shared instance; a second copy breaks Vue reactivity and Quasar's global state.

### Using Other Frameworks (React, Svelte, etc.)

Plugins built with frameworks other than Vue+Quasar can bundle their own UI library freely — React, Svelte, and similar frameworks do not have singleton requirements.

The plugin must still export the standard interface and provide Vue Router-compatible route components. The simplest approach is to wrap your framework's root component in a thin Vue component that mounts and unmounts it:

```js
// React example: wrap React app in a Vue component
import { defineComponent, h } from 'vue'
import { createRoot } from 'react-dom/client'
import { createElement } from 'react'  // use React's createElement, NOT Vue's h
import App from './App.jsx'

const ReactWrapper = defineComponent({
  setup() {
    let root = null
    return {
      _mount(el)  { root = createRoot(el); root.render(createElement(App)) },
      _unmount()  { root?.unmount(); root = null },
    }
  },
  mounted()   { this._mount(this.$el) },  // use this.$el to avoid ID conflicts
  unmounted() { this._unmount() },
  render()    { return h('div', { style: 'height: 100%' }) },
})

export default {
  id: 'my-react-app',
  name: 'My React App',
  category: 'applications',
  routes: [{ path: '/my-react-app', name: 'my-react-app', component: ReactWrapper }],
  menuItems: [{ label: 'My React App', icon: 'apps', route: '/my-react-app' }],
}
```

Key points for non-Vue plugins:
- Bundle your UI framework inside the plugin — no import map coordination needed.
- Use `window.sylviaShell.httpClient` for API calls (works the same regardless of framework).
- Use `window.config` for runtime configuration URLs.
- Listen to `sylvia-locale-change` on `window` to react to language changes.

### Reacting to Locale Changes

The shell dispatches a `sylvia-locale-change` event on `window` whenever the user switches the application language. Listen to this event to keep your plugin's i18n in sync:

```js
window.addEventListener('sylvia-locale-change', (event) => {
  const locale = event.detail.locale  // e.g. 'en-US' or 'zh-TW'
  // update your plugin's i18n state here
})
```

### Loading an External Plugin

Serve the plugin JS file from any static file server, then add its URL to `window.config.plugins` in `config.js`:

```js
window.config = {
  // ...existing config...
  plugins: [
    '/js/plugins/my-plugin.js',          // served alongside the shell
    'https://cdn.example.com/plugin.js', // or from an external host (requires CORS)
  ],
}
```

The shell loads all plugin URLs in parallel on startup. A failed load is logged and skipped; the rest continue normally.

#### Deployment alongside the shell

Place the plugin JS file under the shell's static file directory using the convention `/js/plugins/<plugin-id>/plugin.js`:

```
www/                          # shell dist root
├── index.html
├── js/
│   └── plugins/
│       └── my-app/
│           └── plugin.js     # your built plugin
└── config.js
```

#### Deployment on a separate server

Host the plugin file on any origin and reference it by absolute URL. The server must include CORS headers so the browser can load it as an ES module:

```
Access-Control-Allow-Origin: *
```

## Tech Stack

- [Quasar Framework](https://quasar.dev/) v2 - Vue.js UI framework
- [Vue.js](https://vuejs.org/) 3 - Composition API
- [Pinia](https://pinia.vuejs.org/) - State management
- [Vue Router](https://router.vuejs.org/) - Client-side routing
- [Axios](https://axios-http.com/) - HTTP client

## License

This project is licensed under the [MIT License](LICENSE).
