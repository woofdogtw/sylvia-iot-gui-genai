# @sylvia-iot/shell

Main shell framework for Sylvia-IoT management console. Provides the layout, authentication, navigation, plugin system, internationalization, and theming.

## Prerequisites

- Node.js >= 18
- npm >= 9

## Setup

From the repository root:

```bash
npm install
```

## Development

```bash
# Start dev server (from root)
npm run dev

# Or from this directory
npx quasar dev
```

The dev server starts at http://localhost:9000.

## Build

```bash
npm run build
```

Output is in `dist/spa/`. The `js/config.js` file can be modified post-build for different deployment environments without rebuilding.

## Configuration

Edit `public/js/config.js` (dev) or `dist/spa/js/config.js` (production):

```javascript
window.config = {
  auth: {
    baseUrl: 'http://localhost:1080/auth',  // Auth service URL
    clientId: 'public',                      // OAuth2 client ID
    redirectUri: 'http://localhost:9000/#/auth/callback',
    scopes: [],
  },
  coremgr: {
    baseUrl: 'http://localhost:1080/coremgr', // Core manager service URL
  },
  data: {
    baseUrl: 'http://localhost:1080/data',    // Data service URL
  },
}
```

## Lint

```bash
npm run lint
```

## Test

```bash
npm run test          # Run tests once
npm run test:watch    # Watch mode
```

## Registering Plugins

Add plugins to `src/boot/plugins.js`:

```javascript
import myPlugin from '@sylvia-iot/my-plugin'

const plugins = [
  myPlugin,
]
```

See `@sylvia-iot/shared` README for the plugin interface contract.
