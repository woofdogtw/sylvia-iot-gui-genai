# Shell Framework Specification

This specification defines the core shell framework that serves as the main container for all Sylvia-IoT micro-frontend applications.

## ADDED Requirements

### Requirement: Main Layout Structure

The shell SHALL provide a responsive main layout with a title bar, navigation menu, and content area.

#### Scenario: Layout displays correctly on desktop

- **WHEN** user opens the application on a desktop browser
- **THEN** the layout SHALL display a title bar at the top
- **AND** a hamburger menu icon SHALL be visible in the title bar
- **AND** a content area SHALL occupy the remaining space
- **AND** user information or login button SHALL appear in the top-right corner

#### Scenario: Layout adapts to mobile devices

- **WHEN** user opens the application on a mobile device
- **THEN** the layout SHALL adapt to the smaller screen size
- **AND** the hamburger menu SHALL be accessible
- **AND** the content area SHALL be scrollable

### Requirement: Plugin System

The shell SHALL provide a plugin registry and loader for dynamically mounting and managing micro-frontend applications.

#### Scenario: Plugin registers successfully

- **WHEN** a micro-frontend plugin is loaded
- **THEN** the shell SHALL accept plugin registration with id, name, category, routes, and menuItems
- **AND** the plugin SHALL be added to the plugin registry
- **AND** the plugin routes SHALL be registered with Vue Router

#### Scenario: Plugin menu items appear in navigation

- **WHEN** a plugin registers with category 'core' and provides menuItems
- **THEN** the menu items SHALL appear under the 'Core' expandable section in the hamburger menu
- **AND** clicking a menu item SHALL navigate to the plugin's route

#### Scenario: Multiple plugins in same category

- **WHEN** multiple plugins register with the same category
- **THEN** all their menu items SHALL appear under that category
- **AND** menu items SHALL be sorted by the order property if provided

### Requirement: Hamburger Menu Navigation

The shell SHALL provide a hamburger menu with predefined categories and dynamic plugin entries.

#### Scenario: Menu shows default structure

- **WHEN** user opens the hamburger menu
- **THEN** the menu SHALL display 'Home' as the first item
- **AND** the menu SHALL display expandable categories: Core, Data, Router, Applications, Networks
- **AND** the menu SHALL display 'Settings' as the last item

#### Scenario: Expandable category shows plugin items

- **WHEN** user clicks on the 'Core' category
- **THEN** the category SHALL expand
- **AND** all registered plugins with category='core' SHALL display their menu items

#### Scenario: Navigation to selected page

- **WHEN** user clicks a menu item
- **THEN** the application SHALL navigate to the corresponding route
- **AND** the hamburger menu SHALL close (on mobile)
- **AND** the current page title SHALL update in the title bar

### Requirement: Authentication Integration

The shell SHALL integrate with Sylvia-IoT OAuth2 authentication and display user session state.

#### Scenario: Unauthenticated user sees login button

- **WHEN** user accesses the shell without authentication
- **THEN** a 'Login' button SHALL appear in the top-right corner of the title bar
- **AND** clicking the button SHALL redirect to the OAuth2 authorization endpoint

#### Scenario: OAuth2 callback handling

- **WHEN** user is redirected back from OAuth2 authorization with an authorization code
- **THEN** the shell SHALL exchange the code for access and refresh tokens
- **AND** tokens SHALL be stored securely in localStorage
- **AND** user SHALL be redirected to the home page

#### Scenario: Authenticated user sees user info

- **WHEN** user is authenticated with valid tokens
- **THEN** the shell SHALL call /auth/api/v1/auth/tokeninfo to retrieve user data (account, name, roles)
- **AND** the user's display name (or account if name is empty) SHALL display in the top-right corner
- **AND** clicking the user name SHALL show a dropdown with a logout option

#### Scenario: Session restoration on app start

- **WHEN** the application initializes
- **AND** valid tokens exist in localStorage
- **THEN** the shell SHALL call /auth/api/v1/auth/tokeninfo to restore the user session
- **AND** the header SHALL display the user info without requiring a new login

#### Scenario: Token refresh

- **WHEN** access token expires during a session
- **THEN** the shell SHALL automatically attempt to refresh using the refresh token
- **AND** if refresh succeeds, the new access token SHALL be stored
- **AND** if refresh fails, the user SHALL be prompted to log in again

#### Scenario: API call with automatic token refresh and retry

- **WHEN** an API call (except OAuth2 endpoints) returns 401 Unauthorized
- **AND** a refresh token is available
- **THEN** the shell SHALL perform the refresh token flow to obtain a new access token
- **AND** if refresh succeeds, the original API call SHALL be retried once with the new token
- **AND** if refresh fails, the user SHALL be prompted to log in again
- **AND** the API call SHALL not retry more than once to prevent infinite loops

#### Scenario: Logout

- **WHEN** user clicks the logout button
- **THEN** tokens SHALL be cleared from localStorage
- **AND** user SHALL be redirected to the welcome/login screen

### Requirement: Welcome Screen

The shell SHALL provide a welcome/home screen as the default landing page.

#### Scenario: Unauthenticated user sees welcome screen

- **WHEN** an unauthenticated user visits the root URL
- **THEN** a welcome screen SHALL be displayed
- **AND** the screen SHALL provide a brief introduction to Sylvia-IoT
- **AND** a prominent 'Login' button SHALL be available

#### Scenario: Authenticated user sees dashboard

- **WHEN** an authenticated user visits the root URL or clicks 'Home' in the menu
- **THEN** a home/dashboard screen SHALL be displayed
- **AND** the screen MAY show quick links to common tasks or recent activities

### Requirement: Settings Page

The shell SHALL provide a settings page for user preferences including language and theme selection.

#### Scenario: Access settings page

- **WHEN** user clicks 'Settings' in the hamburger menu
- **THEN** the settings page SHALL be displayed
- **AND** language selection SHALL be available
- **AND** theme (light/dark) selection SHALL be available

#### Scenario: Change language

- **WHEN** user selects a different language from the settings
- **THEN** the entire application UI SHALL update to the selected language
- **AND** the selection SHALL be persisted in localStorage
- **AND** all loaded micro-frontend plugins SHALL reflect the language change (via Quasar i18n)

#### Scenario: Change theme

- **WHEN** user toggles between light and dark theme
- **THEN** the application SHALL switch to the selected theme immediately
- **AND** all Quasar components SHALL adapt to the new theme
- **AND** the selection SHALL be persisted in localStorage

### Requirement: Internationalization (i18n)

The shell SHALL support multiple languages using Quasar's i18n system.

#### Scenario: Default language selection

- **WHEN** user first accesses the application
- **AND** no language preference is saved in localStorage
- **THEN** the default language SHALL be determined from browser settings or default to English
- **AND** all UI text SHALL display in the detected language
- **AND** the language selector SHALL reflect the same detected language

#### Scenario: Language packs loaded

- **WHEN** the application initializes
- **THEN** language packs for supported languages SHALL be available
- **AND** at minimum, English (en-US) SHALL be supported

#### Scenario: Shared API error messages

- **WHEN** the backend returns an error response with an error code
- **THEN** the shared package SHALL provide localized human-readable messages for known Sylvia-IoT API error codes
- **AND** translations SHALL be available in all supported locales (en-US, zh-TW)
- **AND** the error code keys SHALL match the backend error codes (e.g. err_param, err_perm, err_broker_unit_not_exist)
- **Reference**: https://github.com/woofdogtw/sylvia-iot-simple-ui/blob/main/src/i18n/en-us.json (apiError section)
- **Reference**: https://github.com/woofdogtw/sylvia-iot-simple-ui/blob/main/src/i18n/zh-tw.json (apiError section)

### Requirement: Theming System

The shell SHALL support light and dark themes using Quasar's dark mode.

#### Scenario: Default theme on desktop

- **WHEN** user first accesses the application on a desktop browser
- **AND** no theme preference is saved in localStorage
- **THEN** the theme SHALL default to light mode

#### Scenario: Default theme on mobile

- **WHEN** user first accesses the application on a mobile device (touch-primary)
- **AND** no theme preference is saved in localStorage
- **THEN** the theme SHALL default to dark mode

#### Scenario: Saved theme preference

- **WHEN** user accesses the application
- **AND** a theme preference exists in localStorage
- **THEN** the saved preference SHALL be applied regardless of device type

#### Scenario: Theme persistence

- **WHEN** user changes the theme
- **THEN** the selection SHALL persist across browser sessions
- **AND** reopening the application SHALL apply the saved theme

### Requirement: Header Widgets

The shell SHALL provide a header widget area for plugins to register small utility components.

#### Scenario: Plugin registers header widget

- **WHEN** a plugin provides a headerWidget configuration
- **THEN** the widget SHALL appear in the title bar to the left of the user info area
- **AND** multiple widgets SHALL be displayed in registration order

#### Scenario: Header widget displays current time

- **WHEN** a plugin registers a clock widget
- **THEN** the current time SHALL be visible in the header
- **AND** the time SHALL update automatically

### Requirement: Plugin Interface Contract

The shell SHALL define and document a clear plugin interface as a public API contract.

#### Scenario: Plugin interface documentation

- **WHEN** a developer wants to create a micro-frontend plugin
- **THEN** documentation SHALL clearly specify required and optional fields
- **AND** the interface SHALL include: id (required), name (required), category (required), routes (optional), menuItems (optional), headerWidgets (optional)

#### Scenario: Plugin interface validation

- **WHEN** a plugin attempts to register
- **THEN** the shell SHALL validate that required fields are present
- **AND** if validation fails, an error SHALL be logged
- **AND** the plugin SHALL not be registered

### Requirement: Global State Management

The shell SHALL provide a global Pinia store for authentication state and application settings.

#### Scenario: Authentication state available globally

- **WHEN** any component needs to check authentication status
- **THEN** the auth store SHALL provide reactive access to authentication state
- **AND** state SHALL include: isAuthenticated, user info, and token status

#### Scenario: Settings state available globally

- **WHEN** any component needs to access user settings
- **THEN** the app settings store SHALL provide reactive access
- **AND** state SHALL include: locale, theme (isDark), and user preferences

### Requirement: Runtime Configuration

The shell SHALL provide a configuration file for runtime settings including backend service URLs and OAuth2 parameters.

#### Scenario: Configuration file loaded on startup

- **WHEN** the application initializes
- **THEN** a configuration file SHALL be loaded from public/js/config.js
- **AND** the configuration SHALL define backend service base URLs
- **AND** the configuration SHALL define OAuth2 parameters (client ID, redirect URI, scopes)

#### Scenario: Configuration contains auth parameters

- **WHEN** developers need to configure OAuth2 authentication
- **THEN** config SHALL include: auth base URL, client ID, redirect URI, and scopes
- **AND** these parameters SHALL be used for OAuth2 authorization flow

#### Scenario: Configuration contains service endpoints

- **WHEN** developers need to configure backend services
- **THEN** config SHALL include base URLs for: coremgr, data, router services
- **AND** config MAY include optional service endpoints for third-party integrations
- **AND** these URLs SHALL be accessible throughout the application

#### Scenario: Easy deployment configuration

- **WHEN** deploying to different environments (dev, staging, production)
- **THEN** only the config.js file needs to be modified
- **AND** no code changes or rebuilds are required

### Requirement: Monorepo Structure

The shell SHALL be organized as part of a monorepo with clear separation between shell, shared code, and micro-frontends.

#### Scenario: Directory structure

- **WHEN** the project is set up
- **THEN** the root SHALL contain a packages/ directory
- **AND** packages/shell/ SHALL contain the main shell application
- **AND** packages/shared/ SHALL contain shared utilities and components
- **AND** packages/mfe-*/ SHALL contain individual micro-frontend applications
- **AND** root package.json SHALL configure workspaces
