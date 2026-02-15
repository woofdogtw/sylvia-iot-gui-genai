## ADDED Requirements

### Requirement: Core Plugin Registration

The core plugin SHALL register with the shell as a builtin plugin under the `core` category.

#### Scenario: Plugin registers at boot

- **WHEN** the shell application initializes
- **THEN** the core plugin SHALL register with id `mfe-core`, name `Core`, category `core`
- **AND** the plugin SHALL provide routes for all 9 management pages
- **AND** the plugin SHALL provide menu items matching the simple-ui menu structure

#### Scenario: Menu items in Core category

- **WHEN** user opens the hamburger menu and expands the Core category
- **THEN** the following menu items SHALL appear in order: User, Client, Unit, Application, Network, Device, Device Route, Network Route, DL Data Buffer

### Requirement: Common Page Layout

All core management pages SHALL follow a consistent layout pattern.

#### Scenario: Standard list page layout

- **WHEN** user navigates to any core management page
- **THEN** a toolbar SHALL display at the top with filter controls, search input, and action buttons (refresh, add, CSV export)
- **AND** the search input SHALL submit on Enter key press or by clicking a search icon button
- **AND** a paginated data table SHALL display below the toolbar
- **AND** each row SHALL have action buttons in order from left to right: delete (delete icon), edit (edit icon), detail (info icon)
- **AND** all date/time values SHALL be displayed in `YYYY/MM/DD hh:mm:ss` format using local time

#### Scenario: Responsive table display

- **WHEN** user views the data table on different screen sizes
- **THEN** the table SHALL adapt column visibility based on screen width
- **AND** essential columns (identifier, name) SHALL always be visible
- **AND** secondary columns SHALL hide on smaller screens

#### Scenario: Pagination

- **WHEN** the data table displays results
- **THEN** pagination controls SHALL appear below the table
- **AND** the default page size SHALL be 20 items
- **AND** the total count SHALL be fetched from the count API endpoint

#### Scenario: Add/Edit dialog

- **WHEN** user clicks the add or edit button
- **THEN** a modal dialog SHALL open with form fields
- **AND** required fields SHALL be validated before submission
- **AND** validation errors SHALL display inline
- **AND** all text inputs except password fields SHALL be trimmed of leading/trailing whitespace
- **AND** JSON fields (e.g., Info) SHALL validate that input is a valid JSON object; empty input SHALL be submitted as `{}`
- **AND** pressing Enter SHALL trigger the OK/Submit action
- **AND** pressing Escape SHALL close the dialog (Cancel)
- **AND** for pages with a unit filter, the add dialog SHALL pre-fill the unit field with the currently selected unit from the toolbar (user may still change it)

#### Scenario: Detail dialog

- **WHEN** user clicks on a row or a detail button
- **THEN** a read-only dialog SHALL display the full details of the item, including fields not shown in the table (e.g., Info JSON, full timestamps, IDs)
- **AND** for client detail: admin SHALL see the owner's account name (resolved via user API); private clients SHALL display the client secret masked by default with a visibility toggle and copy-to-clipboard button
- **AND** pressing Escape SHALL close the dialog

#### Scenario: Delete confirmation

- **WHEN** user clicks the delete button on a row
- **THEN** a confirmation dialog SHALL appear showing the item identifier
- **AND** the item SHALL only be deleted after user confirms
- **AND** pressing Enter SHALL trigger the confirm action
- **AND** pressing Escape SHALL close the dialog (Cancel)

#### Scenario: CSV export

- **WHEN** user clicks the CSV export button
- **THEN** the CSV SHALL be fetched from the server using the `format=csv` query parameter with Bearer token authentication
- **AND** on supported browsers (Chromium), the File System Access API (`showSaveFilePicker`) SHALL be used to stream the response directly to disk with a progress indicator showing downloaded bytes
- **AND** on unsupported browsers, the response SHALL fallback to Blob download (`URL.createObjectURL`)
- **AND** the exported file SHALL use UTF-8 encoding

#### Scenario: Error display

- **WHEN** an API call fails
- **THEN** the error message SHALL be displayed using the localized apiError translations from the shared package
- **AND** the error SHALL be shown as a Quasar notification

### Requirement: Role-Based Access Control

The core plugin SHALL restrict page access and operations based on the current user's roles obtained from the `/auth/api/v1/auth/tokeninfo` API. The roles object contains boolean fields: `admin`, `manager`, `service`, `dev`.

#### Scenario: User page requires admin or manager role

- **WHEN** a user without `admin: true` or `manager: true` attempts to access the User page
- **THEN** the page SHALL NOT be accessible and the menu item SHALL be hidden

#### Scenario: Client page requires admin or dev role

- **WHEN** a user without `admin: true` or `dev: true` attempts to access the Client page
- **THEN** the page SHALL NOT be accessible and the menu item SHALL be hidden

#### Scenario: Menu visibility matches role

- **WHEN** the Core category menu renders
- **THEN** menu items SHALL only appear for pages the current user has permission to access based on their tokeninfo roles

### Requirement: User Management Page

The core plugin SHALL provide a user management page for administering user accounts. This page requires the `admin` or `manager` role.

#### Scenario: User list display

- **WHEN** admin or manager navigates to the User page
- **THEN** the table SHALL display columns: Account, Name, Roles, Created, Modified
- **AND** users SHALL be searchable by account name

#### Scenario: Create user (admin only)

- **WHEN** admin clicks the add button
- **THEN** a dialog SHALL display with fields: Account (required), Password (required), Name, Info (JSON)
- **AND** account SHALL validate against pattern `[A-Za-z0-9][A-Za-z0-9-_]*`
- **AND** the add button SHALL be hidden for manager role

#### Scenario: Edit user (admin)

- **WHEN** admin clicks the edit button on a user row
- **THEN** a dialog SHALL display with fields: Password, Name, Roles (checkboxes), Info (JSON), Disable toggle
- **AND** role checkboxes SHALL include: admin, manager, service, dev

#### Scenario: Edit user (manager)

- **WHEN** manager clicks the edit button on a user row
- **THEN** a dialog SHALL display with fields: Password, Name, Info (JSON), Disable toggle only
- **AND** roles checkboxes SHALL NOT be shown
- **AND** the disable toggle SHALL only be available for users with service or user roles (not admin or manager)

#### Scenario: Delete user (admin only)

- **WHEN** admin clicks the delete button on a user row
- **THEN** a confirmation dialog SHALL show the user account
- **AND** upon confirmation the user SHALL be deleted via API
- **AND** the delete button SHALL be hidden for manager role

### Requirement: Client Management Page

The core plugin SHALL provide a client management page for OAuth2 client administration. This page requires the `admin` or `dev` role.

#### Scenario: Client list display

- **WHEN** admin or dev navigates to the Client page
- **THEN** the table SHALL display columns: Client ID, Name, Type (Public/Private), Created
- **AND** admin SHALL see clients from all users; dev SHALL see only their own

#### Scenario: Create client

- **WHEN** admin or dev clicks the add button
- **THEN** a dialog SHALL display with fields: Name (required), Redirect URIs (required, comma-separated), Scopes (comma-separated), Image URL, Credentials toggle (public/private)
- **AND** admin SHALL see an additional User field with autocomplete search (debounce 500ms, user list API with `contains` parameter, limit 10 results) to specify which user owns the client
- **AND** the `userId` SHALL be sent inside the `data` object of the POST request body
- **AND** if credentials is enabled, a client secret SHALL be generated and displayed

#### Scenario: Edit client

- **WHEN** admin or dev clicks the edit button on a client row
- **THEN** a dialog SHALL display with fields: Name, Redirect URIs, Scopes, Image URL
- **AND** admin SHALL see a read-only User field displaying the owner's account name (resolved via user API)
- **AND** for private clients, a "Regenerate Secret" button SHALL be available

#### Scenario: Delete client

- **WHEN** admin or dev clicks the delete button on a client row
- **THEN** a confirmation dialog SHALL show the client as `Name (ID)` format (or just ID if name is empty)
- **AND** upon confirmation the client SHALL be deleted via API
- **AND** a client SHALL NOT be able to delete itself

### Requirement: Unit Management Page

The core plugin SHALL provide a unit management page for organizational unit administration. A unit represents an organizational entity (company, department, team). All broker resources (applications, networks, devices, routes, buffers) are managed per unit. Admin/manager can see all units; normal users see only units they own or are members of.

#### Scenario: Unit list display

- **WHEN** user navigates to the Unit page
- **THEN** the table SHALL display columns: Code, Name, Owner (admin/manager only, resolved to account name via user API with caching), Created
- **AND** the Owner column SHALL only be visible to admin/manager roles
- **AND** units SHALL be searchable/filterable by code

#### Scenario: Create unit

- **WHEN** user clicks the add button
- **THEN** a dialog SHALL display with fields: Code (required), Name, Owner (admin/manager only, autocomplete search with debounce 500ms, user list API with `contains` parameter, limit 10 results), Info (JSON)
- **AND** code SHALL validate against pattern `[A-Za-z0-9][A-Za-z0-9-_]*`

#### Scenario: Edit unit

- **WHEN** user clicks the edit button on a unit row
- **THEN** a dialog SHALL display with fields: Name, Owner (admin/manager only, autocomplete search same as add dialog), Members, Info (JSON)

#### Scenario: Delete unit

- **WHEN** user clicks the delete button on a unit row
- **THEN** a confirmation dialog SHALL warn that all associated devices, routes, and buffers will be deleted
- **AND** upon confirmation the unit SHALL be deleted via API

### Requirement: Application Management Page

The core plugin SHALL provide an application management page. Admin/manager can see all applications; normal users must select a unit and can only see their own unit's applications.

#### Scenario: Application list display

- **WHEN** user navigates to the Application page
- **THEN** the table SHALL display columns: Code, Name, Unit, Protocol, Created
- **AND** a unit filter dropdown SHALL be visible for ALL roles
- **AND** admin/manager SHALL have an "All Units" option (default) to see all applications across units
- **AND** normal users SHALL have their first unit auto-selected and see only their unit's applications

#### Scenario: Create application

- **WHEN** user clicks the add button
- **THEN** a dialog SHALL display with fields: Code (required), Unit (required, dropdown), Host URI (required), Name, TTL (ms, AMQP only), Queue Length (AMQP only), Info (JSON)
- **AND** code SHALL validate against pattern `[A-Za-z0-9][A-Za-z0-9-_]*` and be lowercase-transformed
- **AND** Host URI SHALL validate as a valid URI with `amqp://`, `amqps://`, `mqtt://`, or `mqtts://` scheme
- **AND** TTL and Queue Length SHALL validate as non-negative integers (0 = unlimited)
- **AND** upon success the generated one-time password SHALL be displayed in a result dialog
- **AND** the password SHALL be masked by default (dots) with a visibility toggle (eye icon) to reveal
- **AND** a copy-to-clipboard button SHALL be provided for the password

#### Scenario: Edit application

- **WHEN** user clicks the edit button on an application row
- **THEN** a dialog SHALL display with fields: Host URI, Name, TTL (AMQP only), Queue Length (AMQP only), Password, Info (JSON)
- **AND** the Password field SHALL always be visible
- **AND** the Password field SHALL be optional when Host URI is not changed, and required when Host URI is changed
- **AND** if Password is empty on submit, it SHALL NOT be included in the PATCH API request body
- **AND** Host URI SHALL validate as a valid URI with `amqp://`, `amqps://`, `mqtt://`, or `mqtts://` scheme
- **AND** TTL and Queue Length SHALL validate as non-negative integers (0 = unlimited)

#### Scenario: Application queue stats

- **WHEN** user clicks the stats button on an application row
- **THEN** a dialog SHALL display queue statistics for three queues (uldata, dldataResp, dldataResult): consumers, message count, publish rate, delivery rate
- **AND** the statistics SHALL auto-refresh every second via a timer
- **AND** the timer SHALL start when the dialog opens and stop when the dialog closes (using the dialog `@hide` event to ensure cleanup regardless of how the dialog is dismissed)

#### Scenario: Send downlink data

- **WHEN** user clicks the send data button on an application row
- **THEN** a dialog SHALL display with fields: Device (required, dropdown showing network address), Payload (optional, may be empty), Payload Type (dropdown: hex or text, default hex)
- **AND** when Payload Type is hex, the Payload SHALL validate as hexadecimal characters only (0-9, A-F, a-f) with even length
- **AND** when Payload Type is text, the frontend SHALL convert the text to hexadecimal encoding before sending to the API

#### Scenario: Delete application

- **WHEN** user clicks the delete button on an application row
- **THEN** a confirmation dialog SHALL show the application code
- **AND** upon confirmation the application SHALL be deleted via API

### Requirement: Network Management Page

The core plugin SHALL provide a network management page. Admin/manager can see all networks (including public networks with `unitId: null`); normal users must select a unit and can only see their own unit's networks.

#### Scenario: Network list display

- **WHEN** user navigates to the Network page
- **THEN** the table SHALL display columns: Code, Name, Unit, Protocol, Created
- **AND** a unit filter dropdown SHALL be visible for ALL roles
- **AND** admin/manager SHALL have an "All Units" option (default) to see all networks across units (including public networks)
- **AND** normal users SHALL have their first unit auto-selected and see only their unit's networks

#### Scenario: Create network

- **WHEN** user clicks the add button
- **THEN** a dialog SHALL display with fields: Code (required), Unit (dropdown), Host URI (required), Name, TTL (ms, AMQP only), Queue Length (AMQP only), Info (JSON)
- **AND** code SHALL validate against pattern `[A-Za-z0-9][A-Za-z0-9-_]*` and be lowercase-transformed
- **AND** Host URI SHALL validate as a valid URI with `amqp://`, `amqps://`, `mqtt://`, or `mqtts://` scheme
- **AND** TTL and Queue Length SHALL validate as non-negative integers (0 = unlimited)
- **AND** admin/manager SHALL be able to set Unit to empty to create a public network
- **AND** normal users SHALL be required to select a unit
- **AND** upon success the generated one-time password SHALL be displayed in a result dialog
- **AND** the password SHALL be masked by default (dots) with a visibility toggle (eye icon) to reveal
- **AND** a copy-to-clipboard button SHALL be provided for the password

#### Scenario: Edit network

- **WHEN** user clicks the edit button on a network row
- **THEN** a dialog SHALL display with fields: Host URI, Name, TTL (AMQP only), Queue Length (AMQP only), Password, Info (JSON)
- **AND** the Password field SHALL always be visible
- **AND** the Password field SHALL be optional when Host URI is not changed, and required when Host URI is changed
- **AND** if Password is empty on submit, it SHALL NOT be included in the PATCH API request body
- **AND** Host URI SHALL validate as a valid URI with `amqp://`, `amqps://`, `mqtt://`, or `mqtts://` scheme
- **AND** TTL and Queue Length SHALL validate as non-negative integers (0 = unlimited)

#### Scenario: Network queue stats

- **WHEN** user clicks the stats button on a network row
- **THEN** a dialog SHALL display queue statistics for the dldata queue: consumers, message count, publish rate, delivery rate
- **AND** the statistics SHALL auto-refresh every second via a timer
- **AND** the timer SHALL start when the dialog opens and stop when the dialog closes (using the dialog `@hide` event to ensure cleanup regardless of how the dialog is dismissed)

#### Scenario: Send uplink data

- **WHEN** user clicks the send data button on a network row
- **THEN** a dialog SHALL display with fields: Device (required, dropdown showing network address), Payload (optional, may be empty), Payload Type (dropdown: hex or text, default hex)
- **AND** when Payload Type is hex, the Payload SHALL validate as hexadecimal characters only (0-9, A-F, a-f) with even length
- **AND** when Payload Type is text, the frontend SHALL convert the text to hexadecimal encoding before sending to the API

#### Scenario: Delete network

- **WHEN** user clicks the delete button on a network row
- **THEN** a confirmation dialog SHALL show the network code
- **AND** upon confirmation the network SHALL be deleted via API

### Requirement: Device Management Page

The core plugin SHALL provide a device management page. Admin/manager can see all devices; normal users must select a unit first to see their unit's devices.

#### Scenario: Device list display

- **WHEN** user navigates to the Device page
- **THEN** the table SHALL display columns: Network, Address, Name, Profile, Created
- **AND** a unit filter dropdown SHALL be visible for ALL roles
- **AND** admin/manager SHALL have an "All Units" option (default) to see all devices across units
- **AND** normal users SHALL have their first unit auto-selected and see only their unit's devices
- **AND** devices SHALL be searchable by name

#### Scenario: Create device

- **WHEN** user clicks the add button
- **THEN** a dialog SHALL display with fields: Unit (required, dropdown), Network (required, dropdown), Network Address (required), Profile, Name, Info (JSON)
- **AND** network dropdown SHALL update based on selected unit

#### Scenario: Edit device

- **WHEN** user clicks the edit button on a device row
- **THEN** a dialog SHALL display with fields: Network, Network Address, Profile, Name, Info (JSON)

#### Scenario: Delete device

- **WHEN** user clicks the delete button on a device row
- **THEN** a confirmation dialog SHALL warn that associated routes and buffers will be deleted
- **AND** upon confirmation the device SHALL be deleted via API

### Requirement: Device Route Management Page

The core plugin SHALL provide a device route management page. Admin/manager can see all device routes; normal users must select a unit first.

#### Scenario: Device route list display

- **WHEN** user navigates to the Device Route page
- **THEN** the table SHALL display columns: Application Code, Network Code, Network Address, Created
- **AND** a unit filter dropdown SHALL be visible for ALL roles
- **AND** admin/manager SHALL have an "All Units" option (default) to see all device routes across units
- **AND** normal users SHALL have their first unit auto-selected and see only their unit's device routes

#### Scenario: Create device route

- **WHEN** user clicks the add button
- **THEN** a dialog SHALL display with fields: Unit (dropdown), Application (required, dropdown), Device (required, dropdown)
- **AND** application and device dropdowns SHALL filter based on selected unit

#### Scenario: Delete device route

- **WHEN** user clicks the delete button on a device route row
- **THEN** a confirmation dialog SHALL show the route details
- **AND** upon confirmation the route SHALL be deleted via API
- **Note**: Device routes are immutable; there is no edit operation

### Requirement: Network Route Management Page

The core plugin SHALL provide a network route management page. Admin/manager can see all network routes; normal users must select a unit first.

#### Scenario: Network route list display

- **WHEN** user navigates to the Network Route page
- **THEN** the table SHALL display columns: Application Code, Network Code, Created
- **AND** a unit filter dropdown SHALL be visible for ALL roles
- **AND** admin/manager SHALL have an "All Units" option (default) to see all network routes across units
- **AND** normal users SHALL have their first unit auto-selected and see only their unit's network routes

#### Scenario: Create network route

- **WHEN** user clicks the add button
- **THEN** a dialog SHALL display with fields: Unit (dropdown), Application (required, dropdown), Network (required, dropdown)
- **AND** application and network dropdowns SHALL filter based on selected unit

#### Scenario: Delete network route

- **WHEN** user clicks the delete button on a network route row
- **THEN** a confirmation dialog SHALL show the route details
- **AND** upon confirmation the route SHALL be deleted via API
- **Note**: Network routes are immutable; there is no edit operation

### Requirement: DL Data Buffer Management Page

The core plugin SHALL provide a downlink data buffer management page. Admin/manager can see all buffer entries; normal users must select a unit first.

#### Scenario: DL data buffer list display

- **WHEN** user navigates to the DL Data Buffer page
- **THEN** the table SHALL display columns: Application Code, Device (Network Address), Created, Expired
- **AND** a unit filter dropdown SHALL be visible for ALL roles
- **AND** admin/manager SHALL have an "All Units" option (default) to see all buffer entries across units
- **AND** normal users SHALL have their first unit auto-selected and see only their unit's buffer entries

#### Scenario: Delete buffer entry

- **WHEN** user clicks the delete button on a buffer row
- **THEN** a confirmation dialog SHALL show the buffer details
- **AND** upon confirmation the buffer entry SHALL be deleted via API
- **Note**: Buffer entries are read-only (created by application downlink); there is no add or edit operation

### Requirement: Core Plugin i18n

The core plugin SHALL provide translations for all UI text in supported locales.

#### Scenario: English translations

- **WHEN** the locale is set to en-US
- **THEN** all core plugin labels, buttons, form fields, and messages SHALL display in English

#### Scenario: Traditional Chinese translations

- **WHEN** the locale is set to zh-TW
- **THEN** all core plugin labels, buttons, form fields, and messages SHALL display in Traditional Chinese
- **Reference**: https://github.com/woofdogtw/sylvia-iot-simple-ui/blob/main/src/i18n/zh-tw.json (for translation reference)

### Requirement: API Integration

The core plugin SHALL communicate with the Sylvia-IoT coremgr API for all data operations.

#### Scenario: API base URL from config

- **WHEN** the core plugin makes API calls
- **THEN** the base URL SHALL be read from `window.config.coremgr.baseUrl`
- **AND** all endpoints SHALL use the `/coremgr/api/v1/` prefix

#### Scenario: Authentication header

- **WHEN** the core plugin makes API calls
- **THEN** the Authorization header SHALL include the Bearer token from the auth store
- **AND** 401 responses SHALL trigger the shell's automatic token refresh and retry mechanism
