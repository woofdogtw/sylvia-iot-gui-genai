## MODIFIED Requirements

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

#### Scenario: Error display

- **WHEN** an API call fails
- **THEN** a Quasar dialog SHALL appear with a title showing the localized error code label from the `apiError.*` i18n translations in the shared package (or a generic error title if the code is unknown)
- **AND** the dialog body SHALL display the raw `message` string from the API error response (`error.response.data.message`), falling back to `HTTP {status}: {statusText}` when no message is present, or to `error.message` when there is no response
- **AND** the dialog SHALL persist until the user explicitly dismisses it by clicking OK
