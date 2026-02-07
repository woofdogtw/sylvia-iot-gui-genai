# @sylvia-iot/shared

Shared utilities, API clients, composables, and components for Sylvia-IoT GUI micro-frontends.

## Installation

This package is part of the monorepo and available via workspace reference:

```json
{
  "dependencies": {
    "@sylvia-iot/shared": "*"
  }
}
```

## Plugin Interface

All micro-frontend plugins must implement the plugin interface to register with the shell.

```javascript
import { validatePlugin } from '@sylvia-iot/shared'

const myPlugin = {
  id: 'my-plugin',           // Required: unique identifier
  name: 'My Plugin',         // Required: display name
  category: 'applications',  // Required: 'core' | 'data' | 'router' | 'applications' | 'networks'
  order: 0,                  // Optional: display order within category (default 0)
  routes: [                  // Optional: Vue Router route definitions
    {
      path: '/my-plugin',
      name: 'my-plugin',
      component: () => import('./pages/MyPage.vue'),
    },
  ],
  menuItems: [               // Optional: menu item configurations
    {
      label: 'My Plugin',
      icon: 'extension',     // Material icon name
      route: '/my-plugin',
      order: 0,
    },
  ],
  headerWidgets: [],         // Optional: Vue components for the header area
}

// Validate before registration
const { valid, errors } = validatePlugin(myPlugin)
```

### Valid Categories

- `core` - Core management (auth, users, clients)
- `data` - Data management
- `router` - Router management
- `applications` - Application management
- `networks` - Network management

## API Clients

### coremgr

```javascript
import { coremgrUrl } from '@sylvia-iot/shared/api/coremgr.js'

// Build API URL using runtime config
const url = coremgrUrl('/api/v1/user/list')
// => 'http://localhost:1080/coremgr/api/v1/user/list'
```

### data

```javascript
import { dataUrl } from '@sylvia-iot/shared/api/data.js'

const url = dataUrl('/api/v1/application-dldata/list')
// => 'http://localhost:1080/data/api/v1/application-dldata/list'
```

## Composables

### useAuth

Access authentication state without direct Pinia store access.

```javascript
import { useAuth } from '@sylvia-iot/shared/composables/useAuth.js'

const { isAuthenticated, accessToken } = useAuth()
```

### useConfig

Access runtime configuration reactively.

```javascript
import { useConfig } from '@sylvia-iot/shared/composables/useConfig.js'

const { config, authConfig, coremgrConfig, dataConfig } = useConfig()
```

## i18n Conventions

Each micro-frontend should provide its own translation files following the shell's structure:

```
src/i18n/
├── en-US.js    # English translations
├── zh-TW.js    # Traditional Chinese translations
└── index.js    # Exports all locales
```

Translation keys should be namespaced by plugin ID to avoid conflicts:

```javascript
// en-US.js
export default {
  myPlugin: {
    title: 'My Plugin',
    description: 'Plugin description',
  },
}
```

Supported locales:
- `en-US` - English (default)
- `zh-TW` - Traditional Chinese (正體中文)

## Theming

The shell uses Quasar's Dark Mode API. All Quasar components adapt automatically.

For custom styling in plugins, use Quasar's CSS classes:
- `bg-dark` / `bg-light` for backgrounds
- `text-dark` / `text-light` for text colors
- Use `$q.dark.isActive` in scripts or the `body.body--dark` CSS selector

```vue
<style>
.my-custom-element {
  background: var(--q-primary);
}
body.body--dark .my-custom-element {
  border-color: rgba(255, 255, 255, 0.12);
}
</style>
```
