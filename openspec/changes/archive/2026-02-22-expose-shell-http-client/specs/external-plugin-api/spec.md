## ADDED Requirements

### Requirement: Shell global API for external plugins

The shell SHALL expose a `window.sylviaShell` global object after boot, providing external plugins with a pre-configured HTTP client that handles authentication automatically.

#### Scenario: httpClient is available after shell boots

- **WHEN** the shell application has finished booting
- **THEN** `window.sylviaShell` SHALL be a non-null object
- **AND** `window.sylviaShell.httpClient` SHALL be an axios instance

#### Scenario: httpClient injects Bearer token on every request

- **WHEN** an external plugin calls `window.sylviaShell.httpClient.get(url)` while the user is authenticated
- **THEN** the request SHALL include an `Authorization: Bearer <access_token>` header automatically
- **AND** the plugin SHALL NOT need to set the header manually

#### Scenario: httpClient retries on 401 with refreshed token

- **WHEN** an API call made via `window.sylviaShell.httpClient` returns HTTP 401
- **AND** the endpoint is not an OAuth2 or auth endpoint
- **THEN** the client SHALL attempt to refresh the access token
- **AND** if refresh succeeds, the original request SHALL be retried once with the new token
- **AND** if refresh fails, the user SHALL be redirected to the login page

#### Scenario: External plugin documentation in README

- **WHEN** a developer wants to create an external plugin
- **THEN** the root README SHALL document `window.sylviaShell.httpClient` usage with a code example
- **AND** the documentation SHALL explain that plugins should NOT bundle their own axios instance
