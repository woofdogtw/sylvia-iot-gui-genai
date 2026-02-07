# Sylvia-IoT GUI

Micro-frontend applications for the [Sylvia-IoT](https://github.com/woofdogtw/sylvia-iot-core) IoT platform.

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

## Tech Stack

- [Quasar Framework](https://quasar.dev/) v2 - Vue.js UI framework
- [Vue.js](https://vuejs.org/) 3 - Composition API
- [Pinia](https://pinia.vuejs.org/) - State management
- [Vue Router](https://router.vuejs.org/) - Client-side routing
- [Axios](https://axios-http.com/) - HTTP client

## License

TBD
