# Contributing to Sylvia-IoT GUI

## Prerequisites

- Node.js >= 18
- npm >= 9

## Getting Started

```bash
# Clone the repository
git clone <repository-url>
cd sylvia-iot-gui

# Install dependencies (all workspaces)
npm install

# Start the development server
npm run dev
```

The dev server runs at http://localhost:9000.

## Project Structure

```
packages/
├── shell/          # Main shell application (Quasar Framework)
├── shared/         # Shared utilities, API clients, plugin interface
├── mfe-example/    # Example micro-frontend plugin
└── ...             # Additional micro-frontends
```

This is an npm workspaces monorepo. All packages are linked automatically when you run `npm install` from the root.

## Code Conventions

- **Language**: All code and comments must be in English.
- **Framework**: Quasar Framework v2 with Vue 3 Composition API.
- **JavaScript**: Pure JavaScript (no TypeScript). Use ES modules (`import`/`export`).
- **Components**: Use `<script setup>` syntax in Vue single-file components.
- **State management**: Pinia stores in `src/stores/`.
- **Routing**: Vue Router with hash mode (`/#/`).

## Available Scripts

From the repository root:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests (Vitest) |

From `packages/shell/`:

| Command | Description |
|---------|-------------|
| `npx quasar dev` | Start dev server |
| `npx quasar build` | Production build |
| `npm run test:e2e` | Run E2E tests (Playwright) |
| `npm run test:watch` | Unit tests in watch mode |

## Linting

ESLint v9 flat config is used with `eslint-plugin-vue` recommended rules. Run:

```bash
npm run lint
```

All code must pass linting before submission.

## Testing

### Unit Tests (Vitest)

Unit tests are in `packages/shell/src/__tests__/`. Run with:

```bash
npm run test
```

- Test setup file: `src/__tests__/setup.js`
- Use `jsdom` environment for DOM-related tests
- Use `toContainEqual` (not `toContain`) when checking object equality in arrays

### E2E Tests (Playwright)

E2E tests are in `packages/shell/e2e/` and require a running Sylvia-IoT backend. To set up the backend:

```bash
skills/sylvia-iot-services/scripts/start.sh
```

Then run E2E tests:

```bash
cd packages/shell
npm run test:e2e
```

## Configuration

Runtime configuration lives in `packages/shell/public/js/config.js`. This file is **not** bundled by Vite and can be modified post-build without rebuilding. See [packages/shell/README.md](packages/shell/README.md) for configuration details.

## Creating a Plugin

Plugins are micro-frontend packages that register with the shell. See [packages/shared/README.md](packages/shared/README.md) for the full plugin interface.

Quick summary:

1. Create a new package under `packages/`.
2. Export a plugin object with `id`, `name`, `category`, and optionally `routes`, `menuItems`, `headerWidgets`.
3. Register it in `packages/shell/src/boot/plugins.js`.

Valid categories: `core`, `data`, `router`, `applications`, `networks`.

## Internationalization (i18n)

- Supported locales: `en-US` (default), `zh-TW`.
- Shell translations: `packages/shell/src/i18n/`.
- Use `$t('key')` or the `useI18n()` composable for all user-facing text.
- Plugin translations should be namespaced by plugin ID to avoid key conflicts.

## Theming

Quasar Dark Mode is supported. All Quasar components adapt automatically.

For custom styles, use `body.body--dark` CSS selector for dark mode overrides. See [packages/shared/README.md](packages/shared/README.md) for theming guidance.

## Spec-Driven Development (OpenSpec)

This project uses OpenSpec for planning changes. Before implementing new features, breaking changes, or architecture shifts:

1. Read `openspec/AGENTS.md` for the full workflow.
2. Create a change proposal under `openspec/changes/<change-id>/`.
3. Get the proposal approved before starting implementation.
4. Track progress in `tasks.md` and archive when complete.
