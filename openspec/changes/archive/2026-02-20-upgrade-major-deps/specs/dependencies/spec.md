## ADDED Requirements

### Requirement: Runtime dependencies at stable major versions
The shell application SHALL use stable major versions of its core runtime dependencies:
pinia `^3.0.4`, vue-router `^5.0.3`, and vue-i18n `^11.2.8`.
All existing user-facing behaviors — authentication, routing, i18n, plugin loading — SHALL remain
unchanged after the upgrade.

#### Scenario: Application loads with upgraded dependencies
- **WHEN** the shell SPA is built and served
- **THEN** the application SHALL initialize successfully with no console errors from pinia, vue-router, or vue-i18n

#### Scenario: Locale switching works after vue-i18n upgrade
- **WHEN** the user changes the language in Settings
- **THEN** the UI SHALL immediately switch to the selected language with no errors

#### Scenario: Route navigation works after vue-router upgrade
- **WHEN** the user navigates between pages (Home, About, Settings, plugin pages)
- **THEN** all routes SHALL resolve correctly and auth guards SHALL enforce login as before

#### Scenario: Plugin registration works after pinia upgrade
- **WHEN** the shell boots and registers built-in and external plugins
- **THEN** all plugins SHALL appear in the sidebar menu under their respective categories
