# Implementation Tasks: Shell Framework

## 1. Project Setup

- [x] 1.1 Initialize monorepo structure with packages/ directory
- [x] 1.2 Create root package.json with workspace configuration (npm or pnpm)
- [x] 1.3 Setup .gitignore for node_modules and build artifacts
- [x] 1.4 Create packages/shell/ using Quasar CLI
- [x] 1.5 Create packages/shared/ for shared utilities
- [x] 1.6 Configure ESLint for Vue.js and Quasar conventions
- [x] 1.7 Setup Vitest for testing

## 2. Configuration System

- [x] 2.1 Create public/js/config.js with default configuration
- [x] 2.2 Define config structure: auth (baseUrl, clientId, redirectUri, scopes)
- [x] 2.3 Define service endpoints: coremgr, data, router base URLs
- [x] 2.4 Create config loader utility in shared package
- [x] 2.5 Make config accessible globally (window.config)
- [x] 2.6 Document configuration parameters in README
- [x] 2.7 Create example config file (config.example.js)

## 3. Shell Core Structure

- [x] 3.1 Setup Quasar project configuration (quasar.config.js)
- [x] 3.2 Configure Vue Router with base routes
- [x] 3.3 Setup Pinia stores (auth, app, plugin)
- [x] 3.4 Create main App.vue with router-view
- [x] 3.5 Configure Quasar i18n with English and Traditional Chinese language packs
- [x] 3.6 Setup Quasar Dark Mode
- [x] 3.7 Create boot files for initialization (config, axios, auth, plugins)

## 4. Main Layout

- [x] 4.1 Create MainLayout component with QLayout, QHeader, QDrawer
- [x] 4.2 Implement title bar with app title and user info area
- [x] 4.3 Implement hamburger menu button
- [x] 4.4 Create drawer component for navigation menu
- [x] 4.5 Add header widgets area in title bar
- [x] 4.6 Ensure responsive behavior for mobile and desktop
- [x] 4.7 Style layout with Quasar components and CSS

## 5. Authentication System

- [x] 5.1 Create authStore (Pinia) with state: isAuthenticated, user, tokens
- [x] 5.2 Read OAuth2 parameters from window.config
- [x] 5.3 Implement OAuth2 authorization redirect logic using config values
- [x] 5.4 Create OAuthCallback page to handle redirect with authorization code
- [x] 5.5 Implement token exchange (authorization code → access + refresh tokens)
- [x] 5.6 Store tokens in localStorage
- [x] 5.7 Create axios instance using service URLs from config
- [x] 5.8 Add Authorization header interceptor to axios
- [x] 5.9 Implement automatic token refresh on 401 responses
- [x] 5.10 Create Login button component
- [x] 5.11 Create user info dropdown with logout option
- [x] 5.12 Implement logout functionality (clear tokens, redirect)
- [x] 5.13 Add route guards for protected pages

## 6. Plugin System

- [x] 6.1 Create pluginStore (Pinia) for plugin registry
- [x] 6.2 Define plugin interface contract in shared/plugin-interface.js
- [x] 6.3 Implement plugin registration function with validation
- [x] 6.4 Implement dynamic route registration for plugin routes
- [x] 6.5 Create plugin loader boot file
- [x] 6.6 Document plugin interface in packages/shared/README.md
- [x] 6.7 Create example plugin in packages/mfe-example/ for testing

## 7. Navigation Menu

- [x] 7.1 Create MenuDrawer component with QList
- [x] 7.2 Implement menu structure with categories (Home, Core, Data, Router, Applications, Networks, Settings)
- [x] 7.3 Create expandable category components using QExpansionItem
- [x] 7.4 Implement dynamic menu item rendering from plugin registry
- [x] 7.5 Add menu item click handlers for navigation
- [x] 7.6 Add current route highlighting
- [x] 7.7 Implement menu close behavior on navigation (mobile)
- [x] 7.8 Add icons for menu items

## 8. Welcome Screen

- [x] 8.1 Create WelcomeScreen page component
- [x] 8.2 Add introductory content about Sylvia-IoT
- [x] 8.3 Display Login button for unauthenticated users
- [x] 8.4 Create HomeScreen page for authenticated users
- [x] 8.5 Configure routes for / and /home

## 9. Settings Page

- [x] 9.1 Create SettingsPage component
- [x] 9.2 Add language selector with supported languages (English, Traditional Chinese)
- [x] 9.3 Implement language change handler (Quasar i18n)
- [x] 9.4 Add theme toggle (light/dark) using QToggle
- [x] 9.5 Implement theme change handler ($q.dark.set)
- [x] 9.6 Persist language selection to localStorage
- [x] 9.7 Persist theme selection to localStorage
- [x] 9.8 Create settings store (appStore) for reactive state
- [x] 9.9 Add route for /settings

## 10. Internationalization

- [x] 10.1 Create language files structure in src/i18n/
- [x] 10.2 Add English (en-US) translations for shell UI
- [x] 10.3 Add Traditional Chinese (zh-TW) translations for shell UI
- [x] 10.4 Import Quasar language packs for en-US and zh-TW
- [x] 10.5 Configure Quasar i18n boot file
- [x] 10.6 Implement language detection from browser or localStorage
- [x] 10.7 Use $t() for all UI text in components
- [x] 10.8 Document i18n conventions in shared package

## 11. Theming

- [x] 11.1 Configure Quasar dark mode in quasar.config.js
- [x] 11.2 Define CSS custom properties for theme-specific colors
- [x] 11.3 Implement theme persistence (read from localStorage on init)
- [x] 11.4 Test all components in both light and dark modes
- [x] 11.5 Document theming approach for plugin developers

## 12. Shared Package

- [x] 12.1 Create shared/src/api/ for API client utilities
- [x] 12.2 Create OAuth2 API client using config.auth parameters
- [x] 12.3 Create API clients for each service (coremgr, data) using config URLs
- [x] 12.4 Create shared/src/composables/ for reusable Vue composables
- [x] 12.5 Create useAuth composable for authentication state
- [x] 12.6 Create useConfig composable for accessing configuration
- [x] 12.7 Create shared/src/components/ for reusable UI components
- [x] 12.8 Document shared package APIs

## 13. Testing

- [x] 13.1 Write unit tests for config loader (covered in smoke test)
- [x] 13.2 Write unit tests for authStore
- [x] 13.3 Write unit tests for pluginStore
- [x] 13.4 Write unit tests for appStore
- [x] 13.5 Write component tests for MainLayout (covered in E2E tests)
- [x] 13.6 Write component tests for SettingsPage (covered in E2E tests)
- [x] 13.7 Write integration test for plugin registration
- [x] 13.8 Write unit test for axios auth endpoint detection
- [x] 13.9 Setup E2E test framework (Playwright)
- [x] 13.10 Write E2E test for login flow (with real Sylvia-IoT backend)
- [x] 13.11 Write E2E test for navigation and routing

## 14. Documentation

- [x] 14.1 Write README.md for root with project overview
- [x] 14.2 Write README.md for packages/shell/ with setup instructions
- [x] 14.3 Write README.md for packages/shared/ with API documentation
- [x] 14.4 Document plugin interface with examples (in shared README)
- [x] 14.5 Create CONTRIBUTING.md with development guidelines
- [x] 14.6 Document configuration file format and parameters (in shell README)
- [x] 14.7 Provide examples for different deployment environments (config.js)
- [x] 14.8 Add inline code comments for complex logic

## 15. Build and Deployment

- [x] 15.1 Configure build scripts in package.json
- [x] 15.2 Ensure config.js is copied to build output
- [x] 15.3 Test production build (quasar build)
- [x] 15.4 Verify build output and bundle size
- [x] 15.5 Create development scripts (dev, build, test, lint)
- [x] 15.6 Document deployment requirements (in shell README)
- [x] 15.7 Test deployment in a local environment
- [x] 15.8 Verify config.js can be modified post-build without rebuild

## 16. Final Review

- [x] 16.1 Verify all requirements from spec.md are implemented
- [x] 16.2 Run full test suite and ensure all tests pass (41 unit + 10 E2E tests)
- [x] 16.3 Test on multiple browsers (Chrome, Firefox) via Playwright E2E
- [ ] 16.4 Test on mobile devices (responsive design) (manual)
- [x] 16.5 Test both English and Traditional Chinese translations
- [x] 16.6 Review code for adherence to project conventions
- [x] 16.7 Update todos and mark proposal as complete
- [x] 16.8 Prepare for OpenSpec archive process
