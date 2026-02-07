# Change: Shell Framework for Sylvia-IoT GUI

## Why

The Sylvia-IoT platform currently lacks a unified frontend interface for managing its microservices. Users need a cohesive, extensible web application that provides a centralized entry point for interacting with IoT devices, data, and platform services.

This proposal introduces the main shell framework - the foundation that will host all micro-frontend applications for Sylvia-IoT, providing core infrastructure including layout, authentication, navigation, plugin system, internationalization, and theming.

## What Changes

- **Create main shell application** - A Quasar-based web application serving as the primary UI container
- **Implement plugin system** - A registry and loader for dynamically mounting micro-frontend applications
- **Add core layouts** - Main layout with title bar, hamburger menu, and content area
- **Build authentication UI** - Login/logout interface integrating with Sylvia-IoT OAuth2
- **Create welcome screen** - Default landing page for first-time and authenticated users
- **Add settings page** - User preferences including language selection and theme switching
- **Establish menu structure** - Categorized navigation for Core, Data, Router, Applications, and Networks
- **Setup i18n and theming** - Multi-language support and light/dark theme switching using Quasar's built-in features
- **Define monorepo structure** - Organize code in packages/ directory for shell, micro-frontends, and shared utilities

## Impact

**Affected specs:**
- New capability: `shell` (main framework specification)

**Affected code:**
- New directory: `packages/shell/` - Main shell application
- New directory: `packages/shared/` - Shared utilities and components
- Root `package.json` and workspace configuration

**Breaking changes:**
- None (new functionality)

**Dependencies:**
- Quasar Framework v2.x
- Vue 3
- Vue Router
- Pinia (state management)
- Axios (HTTP client for OAuth2 and API calls)

**Future extensibility:**
- Plugin interface designed as a clear contract for potential framework-agnostic support in Phase 2
- Modular architecture enables future enhancements without major refactoring
