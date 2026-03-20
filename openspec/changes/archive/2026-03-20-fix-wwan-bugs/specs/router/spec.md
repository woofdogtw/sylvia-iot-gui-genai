## MODIFIED Requirements

### Requirement: Wireless WAN Configuration Page
The WWAN page SHALL periodically poll both `GET /router/api/v1/net/wwan` (current status) and `GET /router/api/v1/net/wwan/list` (AP scan list) every 5 seconds using recursive setTimeout when the page is mounted. The timers SHALL be cleared when the page is unmounted. If the initial GET returns 404, the page SHALL show a "not supported" message and stop polling. Before applying each poll result, the AP scan list SHALL be cleared to prevent stale or duplicate entries.

The page SHALL display the current connection info: SSID, Host IPv4, Gateway IPv4, and DNS IPv4 (from the conn4 object). When the WWAN is connected (the SSID field is non-empty in the status response), the connection info section and a DISCONNECT button SHALL be visible, regardless of whether conn4 contains address data. Clicking DISCONNECT SHALL call `PUT /router/api/v1/net/wwan` with `{ enable: false, conf: { ssid: <current_ssid> } }` to clear the connection.

The page SHALL display the AP list with columns: SSID, security, channel, signal, and a CONNECT button per row. The currently connected AP (matching SSID) SHALL be pinned to the top of the list and its CONNECT button SHALL be hidden. Clicking CONNECT on an AP where security is not 'none' or 'open' SHALL prompt for a password. The password field SHALL be non-empty. Clicking CONNECT on an AP with security 'none' or 'open' SHALL connect directly without a password prompt. Connecting SHALL call `PUT /router/api/v1/net/wwan` with `{ enable: true, conf: { ssid, password } }` (omitting password for open APs). Polling SHALL continue after connecting or disconnecting.

#### Scenario: WWAN page polls on mount
- **WHEN** the user navigates to the WWAN page
- **THEN** both GET /router/api/v1/net/wwan and GET /router/api/v1/net/wwan/list are called immediately and every 5 seconds

#### Scenario: WWAN page stops polling on unmount
- **WHEN** the user navigates away from the WWAN page
- **THEN** the polling timers are cleared and no further API calls are made

#### Scenario: AP list is cleared before each poll update
- **WHEN** a new poll result arrives from GET /router/api/v1/net/wwan/list
- **THEN** the previous AP list is discarded before the new results are applied, so no stale or duplicate entries appear

#### Scenario: Connection info shows current status
- **WHEN** the WWAN is connected with SSID "HomeNet", Host IPv4 "10.0.0.5/24", Gateway "10.0.0.1", DNS "8.8.8.8"
- **THEN** all four values are displayed on the page

#### Scenario: DISCONNECT button appears when SSID is non-empty
- **WHEN** the WWAN status response contains a non-empty SSID field
- **THEN** the connection info section and DISCONNECT button are visible, even if conn4 contains no address data

#### Scenario: DISCONNECT button hidden when not connected
- **WHEN** the WWAN status response contains an empty or absent SSID field
- **THEN** the connection info section and DISCONNECT button are not shown

#### Scenario: Clicking DISCONNECT sends disconnect request
- **WHEN** the user clicks the DISCONNECT button
- **THEN** a PUT request with `{ enable: false, conf: { ssid: <current_ssid> } }` is sent to /router/api/v1/net/wwan

#### Scenario: AP list shows all columns
- **WHEN** the AP list polling returns results
- **THEN** the AP table displays SSID, security, channel, signal, and a CONNECT button for each row

#### Scenario: Connected AP is pinned to top of list
- **WHEN** the AP list contains the currently connected SSID
- **THEN** that AP entry is displayed at the top of the list and its CONNECT button is hidden

#### Scenario: Connect to secured AP prompts for password
- **WHEN** the user clicks CONNECT on an AP with security type 'wpa2'
- **THEN** a password prompt is shown; submitting with a non-empty password sends PUT with the SSID and password

#### Scenario: Connect to open AP skips password prompt
- **WHEN** the user clicks CONNECT on an AP with security type 'none'
- **THEN** no password prompt is shown and PUT is sent immediately with enable=true and the SSID (no password field)

#### Scenario: WWAN password dialog validation
- **WHEN** the user opens the password dialog to connect to a secured AP
- **THEN** form validation SHALL run immediately on open
- **AND** the Connect button SHALL be disabled until the password field is non-empty
- **AND** the Connect button SHALL become enabled as soon as the user enters any character

#### Scenario: Password prompt rejects empty password
- **WHEN** the user is prompted for a password for a secured AP and confirms with an empty field
- **THEN** an inline error is shown and the PUT request is NOT made

#### Scenario: Password dialog submits on Enter when valid
- **WHEN** the password field is non-empty and the user presses Enter
- **THEN** the dialog submits as if the Connect button were clicked

#### Scenario: Polling continues after connecting
- **WHEN** the user connects to an AP
- **THEN** the 5-second polling continues and the connection info updates with the new status

#### Scenario: Router does not support WWAN
- **WHEN** GET /router/api/v1/net/wwan returns 404
- **THEN** a "wireless WAN not supported" message is displayed and polling stops

### Requirement: System Clock Header Widget
The router plugin SHALL register a header widget that displays the router's system time in two lines: `YYYY/MM/DD` on top and `HH:MM` below. The time SHALL be fetched from `GET /router/api/v1/sys/time`. The polling SHALL use smart sleep: after receiving a response, compute the ms offset until the next minute boundary and sleep accordingly, so the display updates precisely when the minute changes. If the router API is unreachable, the widget SHALL fall back to local device time and continue polling; once the backend responds again, the widget SHALL resume using backend time.

#### Scenario: Clock displays router time
- **WHEN** the router plugin is loaded and the API is reachable
- **THEN** a two-line clock (date + time) appears in the header toolbar, updating at each minute boundary

#### Scenario: Router unreachable — widget falls back to local time
- **WHEN** the sys/time API call fails
- **THEN** the clock widget remains visible using local device time (no error shown) and the next poll is still scheduled

#### Scenario: Clock resumes backend time after recovery
- **WHEN** a subsequent poll to GET /router/api/v1/sys/time succeeds after previous failures
- **THEN** the widget switches back to displaying backend time

#### Scenario: Clock widget visible after login
- **WHEN** the user logs in and the `sylvia-router` backend is running
- **THEN** a `div.text-center` containing text matching `YYYY/MM/DD` is visible inside `.q-toolbar`

### Requirement: Service Info Header Widget
The router plugin SHALL register a header widget that displays the router service name and version in two lines, fetched once from `GET /version` on mount. If the API is unreachable, the widget SHALL hide gracefully with no retry.

## MODIFIED Requirements

### Requirement: WWAN Page Input Validation
The WWAN page connect password dialog SHALL validate that the SSID is non-empty and the password is non-empty before submitting a connection request. Validation SHALL run when the user confirms the dialog. When validation passes, pressing Enter in the password field SHALL submit the dialog.

#### Scenario: WWAN connect dialog rejects empty password for secured AP
- **WHEN** the user clicks CONNECT on an AP with security type `wpa2` and leaves the password field empty
- **THEN** an inline error is shown and the PUT API call is NOT made

#### Scenario: WWAN connects directly for open AP
- **WHEN** the user clicks CONNECT on an AP with security type `none`
- **THEN** no password dialog is shown and the PUT API call is made immediately

#### Scenario: Enter key submits password dialog when valid
- **WHEN** the password field contains a non-empty value and the user presses Enter
- **THEN** the dialog submits and the PUT API call is made
