## MODIFIED Requirements

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
- **AND** validation SHALL be triggered immediately when the dialog opens, without waiting for user interaction
- **AND** the OK/Submit button SHALL be disabled until all validation rules pass; it SHALL re-enable as soon as the form becomes valid
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
