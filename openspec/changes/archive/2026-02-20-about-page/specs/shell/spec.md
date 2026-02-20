## MODIFIED Requirements

### Requirement: Hamburger Menu Navigation

The shell SHALL provide a hamburger menu with predefined categories and dynamic plugin entries.

#### Scenario: Menu shows default structure

- **WHEN** user opens the hamburger menu
- **THEN** the menu SHALL display 'Home' as the first item
- **AND** the menu SHALL display 'About' as the second item (after 'Home')
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

## ADDED Requirements

### Requirement: About Page

The shell SHALL provide an About page displaying the frontend name and version, and the core backend service name and version.

#### Scenario: Authenticated user navigates to About

- **WHEN** an authenticated user clicks 'About' in the hamburger menu
- **THEN** the shell SHALL navigate to the `/about` route
- **AND** the About page SHALL display the frontend application name
- **AND** the About page SHALL display the frontend application version (injected at build time from package.json)

#### Scenario: Core service version displayed

- **WHEN** the About page loads
- **THEN** the shell SHALL fetch `GET /version` at the coremgr server origin
- **AND** the About page SHALL display the core service name and version from the response
- **AND** if the fetch fails or returns unexpected data, the service version section SHALL be hidden without displaying an error

#### Scenario: Unauthenticated user cannot access About

- **WHEN** an unauthenticated user navigates to the `/about` route directly
- **THEN** the router guard SHALL redirect them away from the About page

#### Scenario: About page text is localized

- **WHEN** the user has selected a language (en-US or zh-TW)
- **THEN** all static labels on the About page SHALL display in the selected language
