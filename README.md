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
