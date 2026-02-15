## MODIFIED Requirements

### Requirement: Authentication Integration

The shell SHALL integrate with Sylvia-IoT OAuth2 authentication and display user session state.

#### Scenario: Authenticated user sees user info

- **WHEN** user is authenticated with valid tokens
- **THEN** the shell SHALL call /auth/api/v1/auth/tokeninfo to retrieve user data (account, name, roles)
- **AND** the user's display name (or account if name is empty) SHALL display in the top-right corner
- **AND** clicking the user name SHALL show a dropdown with a "Profile" option and a "Logout" option

#### Scenario: User profile dialog

- **WHEN** user clicks the "Profile" option in the user dropdown menu
- **THEN** a dialog SHALL open displaying the current user's account (read-only) and editable fields: Name, Password, Info (JSON)
- **AND** the account field SHALL be displayed as read-only text (not an input field)
- **AND** the Password field SHALL be optional; if left empty it SHALL NOT be included in the API request
- **AND** the Info field SHALL validate as a valid JSON object; empty input SHALL be submitted as `{}`
- **AND** pressing Enter SHALL trigger the save action
- **AND** pressing Escape SHALL close the dialog
- **AND** upon successful save, the dialog SHALL close and the shell SHALL refresh tokeninfo to update the displayed user name in the header
- **AND** the profile SHALL be updated via coremgr `PATCH /api/v1/user/{userId}` using the current user's userId from tokeninfo
