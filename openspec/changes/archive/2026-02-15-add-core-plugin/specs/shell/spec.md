## MODIFIED Requirements

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
- **AND** the OAuth2 query parameters (`?code=...&state=...`) SHALL be removed from the browser URL
- **AND** user SHALL be redirected to the home page

#### Scenario: Authenticated user sees user info

- **WHEN** user is authenticated with valid tokens
- **THEN** the shell SHALL call /auth/api/v1/auth/tokeninfo to retrieve user data (account, name, roles)
- **AND** the user's display name (or account if name is empty) SHALL display in the top-right corner
- **AND** clicking the user name SHALL show a dropdown with a logout option

#### Scenario: Session restoration on app start

- **WHEN** the application initializes
- **AND** valid tokens exist in localStorage
- **THEN** if the access token is expired, the shell SHALL attempt to refresh it using the refresh token before calling tokeninfo
- **AND** if tokeninfo fails (e.g. server revoked the token), the shell SHALL attempt one refresh and retry
- **AND** the shell SHALL call /auth/api/v1/auth/tokeninfo to restore the user session
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

#### Scenario: Role-based menu item filtering

- **WHEN** a menu item specifies a `roles` array (e.g. `['admin', 'manager']`)
- **THEN** the menu item SHALL only be visible if the current user has at least one of the specified roles
- **AND** if the user navigates directly to a role-restricted route via URL, the router SHALL redirect to the home page

#### Scenario: Plugin route role restriction

- **WHEN** a plugin route specifies `meta.roles` (e.g. `['admin', 'dev']`)
- **THEN** the router guard SHALL check the current user's roles from the auth store
- **AND** users without a matching role SHALL be redirected to the home page
