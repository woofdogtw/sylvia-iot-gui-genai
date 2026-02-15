## ADDED Requirements

### Requirement: Data Plugin Registration

The data plugin SHALL register with the shell as a builtin plugin under the `data` category.

#### Scenario: Plugin registers at boot

- **WHEN** the shell application initializes
- **THEN** the data plugin SHALL register with id `mfe-data`, name `Data`, category `data`
- **AND** the plugin SHALL provide routes for 5 data pages
- **AND** the plugin SHALL provide menu items for navigating to each page

#### Scenario: Menu items in Data category

- **WHEN** user opens the hamburger menu and expands the Data category
- **THEN** the following menu items SHALL appear in order: Application Uplink, Application Downlink, Network Uplink, Network Downlink, Operation
- **AND** the Operation menu item SHALL be visible to all authenticated users

### Requirement: Common Data Page Layout

All data pages SHALL follow a consistent read-only list layout pattern.

#### Scenario: Standard data list page layout

- **WHEN** user navigates to any data page
- **THEN** a toolbar SHALL display at the top with: unit filter dropdown, time range filter (start/end datetime pickers), refresh button, CSV export button
- **AND** a paginated data table SHALL display below the toolbar
- **AND** each row SHALL have a detail button (info icon) to view full record
- **AND** there SHALL be no add, edit, or delete functionality
- **AND** all date/time values SHALL be displayed in `YYYY/MM/DD hh:mm:ss` format using local time

#### Scenario: Unit filter

- **WHEN** user is an admin or manager
- **THEN** the unit filter dropdown SHALL show "All Units" as default plus all available units
- **WHEN** user is a normal user
- **THEN** the unit filter SHALL show only their assigned units and auto-select the first one

#### Scenario: Time range filter

- **WHEN** user sets a start and/or end time using the datetime pickers
- **THEN** the data list SHALL be filtered to show only records within the specified time range
- **AND** the time filter SHALL use the `tfield`, `tstart`, and `tend` query parameters
- **AND** the default time field (`tfield`) SHALL be `proc` (processing time)

#### Scenario: Pagination

- **WHEN** the data table displays results
- **THEN** pagination controls SHALL appear below the table
- **AND** the default page size SHALL be 20 items
- **AND** the total count SHALL be fetched from the corresponding count API endpoint

#### Scenario: Detail dialog

- **WHEN** user clicks the detail (info) button on a row
- **THEN** a read-only dialog SHALL display the full details of the record including all fields
- **AND** payload data SHALL be displayed as hex string
- **AND** extension fields SHALL be displayed as formatted JSON
- **AND** pressing Escape SHALL close the dialog

#### Scenario: CSV export

- **WHEN** user clicks the CSV export button
- **THEN** the CSV SHALL be fetched from the server using the `format=csv&limit=0` query parameters with Bearer token authentication
- **AND** on supported browsers (Chromium), the File System Access API (`showSaveFilePicker`) SHALL be used to stream the response directly to disk

#### Scenario: Payload display toggle

- **WHEN** the data table contains a payload (data) column
- **THEN** a toggle button SHALL be available to switch between hex and decoded text display
- **AND** the default display SHALL be hex

### Requirement: Application Uplink Data Page

The application uplink data page SHALL display uplink messages from devices to applications.

#### Scenario: Table columns

- **WHEN** user views the application uplink data page
- **THEN** the table SHALL display columns: Processing Time, Publish Time, Device Time, Device (networkCode/networkAddr), Data (payload)
- **AND** data SHALL be fetched from `GET /data/api/v1/application-uldata/list`
- **AND** count SHALL be fetched from `GET /data/api/v1/application-uldata/count`
- **AND** default sort SHALL be `proc:desc`

#### Scenario: Detail dialog fields

- **WHEN** user opens the detail dialog for an uplink record
- **THEN** the dialog SHALL show: Data ID, Processing Time, Publish Time, Device Time, Unit Code, Network Code, Network Address, Unit ID, Device ID, Profile, Data (hex), Extension (JSON)

### Requirement: Application Downlink Data Page

The application downlink data page SHALL display downlink messages from applications to devices.

#### Scenario: Table columns

- **WHEN** user views the application downlink data page
- **THEN** the table SHALL display columns: Processing Time, Response Time, Status, Device (networkCode/networkAddr), Data (payload)
- **AND** data SHALL be fetched from `GET /data/api/v1/application-dldata/list`
- **AND** count SHALL be fetched from `GET /data/api/v1/application-dldata/count`
- **AND** default sort SHALL be `proc:desc`
- **AND** status SHALL display as: 0 = success (green), negative = processing (grey), positive = error (red)

#### Scenario: Detail dialog fields

- **WHEN** user opens the detail dialog for a downlink record
- **THEN** the dialog SHALL show: Data ID, Processing Time, Response Time, Status, Unit ID, Device ID, Network Code, Network Address, Profile, Data (hex), Extension (JSON)

### Requirement: Network Uplink Data Page

The network uplink data page SHALL display network-level uplink data.

#### Scenario: Table columns

- **WHEN** user views the network uplink data page
- **THEN** the table SHALL display columns: Processing Time, Device Time, Device (networkCode/networkAddr), Data (payload)
- **AND** data SHALL be fetched from `GET /data/api/v1/network-uldata/list`
- **AND** count SHALL be fetched from `GET /data/api/v1/network-uldata/count`
- **AND** default sort SHALL be `proc:desc`

#### Scenario: Detail dialog fields

- **WHEN** user opens the detail dialog for a network uplink record
- **THEN** the dialog SHALL show: Data ID, Processing Time, Unit Code, Network Code, Network Address, Unit ID, Device ID, Device Time, Profile, Data (hex), Extension (JSON)

### Requirement: Network Downlink Data Page

The network downlink data page SHALL display network-level downlink data.

#### Scenario: Table columns

- **WHEN** user views the network downlink data page
- **THEN** the table SHALL display columns: Processing Time, Publish Time, Response Time, Status, Device (networkCode/networkAddr), Data (payload)
- **AND** data SHALL be fetched from `GET /data/api/v1/network-dldata/list`
- **AND** count SHALL be fetched from `GET /data/api/v1/network-dldata/count`
- **AND** default sort SHALL be `proc:desc`
- **AND** status display SHALL follow the same convention as application downlink

#### Scenario: Detail dialog fields

- **WHEN** user opens the detail dialog for a network downlink record
- **THEN** the dialog SHALL show: Data ID, Processing Time, Publish Time, Response Time, Status, Unit ID, Device ID, Network Code, Network Address, Profile, Data (hex), Extension (JSON)

### Requirement: Coremgr Operation Data Page

The operation data page SHALL display system operation logs accessible to all authenticated users.

#### Scenario: Default view

- **WHEN** any authenticated user navigates to the operation data page
- **THEN** the page SHALL show the current user's own operation logs
- **AND** no user filter SHALL be displayed

#### Scenario: Admin/manager user filter

- **WHEN** an admin or manager user views the operation data page
- **THEN** a user filter dropdown SHALL be available to query a specific user's operations
- **AND** the dropdown SHALL default to "All Users" showing all operation logs

#### Scenario: Table columns

- **WHEN** user views the operation data page
- **THEN** the table SHALL display columns: Request Time, Latency (ms), Status, Method, Path
- **AND** data SHALL be fetched from `GET /data/api/v1/coremgr-opdata/list`
- **AND** count SHALL be fetched from `GET /data/api/v1/coremgr-opdata/count`
- **AND** default sort SHALL be `req:desc`

#### Scenario: Detail dialog fields

- **WHEN** user opens the detail dialog for an operation record
- **THEN** the dialog SHALL show: Data ID, Request Time, Response Time, Latency (ms), Status, Source IP, Method, Path, Body (JSON, passwords redacted), User ID, Client ID, Error Code, Error Message

### Requirement: Data Plugin i18n

The data plugin SHALL provide translations for all UI text in en-US and zh-TW.

#### Scenario: Translation keys

- **WHEN** the data plugin loads
- **THEN** i18n messages SHALL be registered under the `data` namespace
- **AND** translations SHALL cover: menu items, table column headers, dialog labels, filter labels, status labels
- **AND** en-US and zh-TW translations SHALL be provided
