## MODIFIED Requirements

### Requirement: Plugin System

The shell SHALL provide a plugin registry and loader for dynamically mounting and managing micro-frontend applications.

#### Scenario: Plugin registers successfully

- **WHEN** a micro-frontend plugin is loaded
- **THEN** the shell SHALL accept plugin registration with id, name, category, routes, and menuItems
- **AND** the plugin SHALL be added to the plugin registry
- **AND** the plugin routes SHALL be registered with Vue Router

#### Scenario: External plugin loaded from URL

- **WHEN** the `plugins` array in `window.config` contains one or more URLs
- **THEN** the shell SHALL dynamically import each URL as an ES module
- **AND** the default export SHALL be registered as a plugin using the same validation as builtin plugins
- **AND** external plugins SHALL be loaded in parallel for performance

#### Scenario: External plugin loading failure

- **WHEN** an external plugin URL fails to load (network error, invalid module, missing default export)
- **THEN** the shell SHALL log an error with the URL and reason
- **AND** the shell SHALL continue loading remaining plugins
- **AND** the application SHALL remain functional

#### Scenario: Plugin menu items appear in navigation

- **WHEN** a plugin registers with category 'core' and provides menuItems
- **THEN** the menu items SHALL appear under the 'Core' expandable section in the hamburger menu
- **AND** clicking a menu item SHALL navigate to the plugin's route

#### Scenario: Multiple plugins in same category

- **WHEN** multiple plugins register with the same category
- **THEN** all their menu items SHALL appear under that category
- **AND** menu items SHALL be sorted by the order property if provided

### Requirement: Runtime Configuration

The shell SHALL provide a configuration file for runtime settings including backend service URLs and OAuth2 parameters.

#### Scenario: Configuration file loaded on startup

- **WHEN** the application initializes
- **THEN** a configuration file SHALL be loaded from public/js/config.js
- **AND** the configuration SHALL define backend service base URLs
- **AND** the configuration SHALL define OAuth2 parameters (client ID, redirect URI, scopes)

#### Scenario: Configuration contains external plugin URLs

- **WHEN** deployers want to load third-party plugins
- **THEN** config SHALL support an optional `plugins` array of URL strings
- **AND** each URL SHALL point to an ES module JS file with a default plugin export
- **AND** URLs MAY be relative paths (e.g. `/js/plugins/my-plugin.js`) or absolute URLs

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
