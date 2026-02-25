## MODIFIED Requirements

### Requirement: WAN Configuration Page
The WAN page SHALL display all WAN interfaces from `GET /router/api/v1/net/wan` as cards, each showing the interface ID, current configuration type (disable/ethernet/pppoe), and active IPv4 connection info (address, gateway, DNS). Each card SHALL have an edit button that opens a configuration form. The form SHALL support switching between disable, ethernet (static or DHCP), and PPPoE modes with appropriate fields. When the type is PPPoE, both username and password fields SHALL be required (non-empty). Saving SHALL call `PUT /router/api/v1/net/wan/{wanId}`.

#### Scenario: Edit WAN to static ethernet
- **WHEN** the user selects ethernet > static and fills address/gateway/DNS
- **THEN** a PUT request is sent and the card refreshes with new settings

#### Scenario: Disable a WAN interface
- **WHEN** the user selects "disable" for a WAN interface
- **THEN** a PUT with `{ "data": { "type": "disable" } }` is sent

#### Scenario: PPPoE fields required
- **WHEN** the user selects PPPoE type and leaves username or password empty
- **THEN** an inline error is shown and the Save button is disabled until both fields are non-empty

### Requirement: Wireless LAN Configuration Page
The WLAN page SHALL display the current wireless LAN config from `GET /router/api/v1/net/wlan`. If supported (not 404), it SHALL show the current enable/disable status, SSID, channel, and password. The password SHALL be masked by default and a toggle SHALL reveal or hide it in plain text. The page SHALL allow the user to edit the config: an enable/disable toggle, SSID field, channel selector (1–11), and password field. When the enable toggle is turned off, SSID/channel/password fields SHALL be hidden. Saving SHALL call `PUT /router/api/v1/net/wlan` with the existing save logic. The SSID field SHALL not be empty when enabled, and the password field SHALL be at least 8 characters when enabled. If the router responds with 404, the page SHALL show a "not supported" message.

#### Scenario: WLAN page shows current config with masked password
- **WHEN** the user navigates to the WLAN page and the API returns data
- **THEN** the current status, SSID, channel, and masked password are displayed

#### Scenario: Show password toggle reveals password
- **WHEN** the user activates the show-password toggle
- **THEN** the password text is displayed in plain text; deactivating it masks the password again

#### Scenario: Configure wireless AP
- **WHEN** the user enables WLAN, sets SSID/channel/password, and clicks Save
- **THEN** a PUT request is sent with the configuration

#### Scenario: WLAN save validates SSID
- **WHEN** the user clears the SSID field and clicks Save
- **THEN** an inline error is shown and the PUT request is NOT made

#### Scenario: WLAN save validates password length
- **WHEN** the user enters a password shorter than 8 characters and clicks Save
- **THEN** an inline error is shown and the PUT request is NOT made

#### Scenario: Router does not support WLAN
- **WHEN** GET /router/api/v1/net/wlan returns 404
- **THEN** a "wireless LAN not supported" message is displayed

### Requirement: Wireless WAN Configuration Page
The WWAN page SHALL periodically poll both `GET /router/api/v1/net/wwan` (current status) and `GET /router/api/v1/net/wwan/list` (AP scan list) every 5 seconds using setInterval when the page is mounted. The interval SHALL be cleared with clearInterval when the page is unmounted. If the initial GET returns 404, the page SHALL show a "not supported" message and stop polling.

The page SHALL display the current connection info: SSID, Host IPv4, Gateway IPv4, and DNS IPv4 (from the conn4 object). When the WWAN is connected (conn4.address is present), a DISCONNECT button SHALL be visible. Clicking DISCONNECT SHALL call `PUT /router/api/v1/net/wwan` with `{ enable: true, conf: { ssid: '' } }` to clear the connection.

The page SHALL display the AP list with columns: SSID, security, channel, signal, and a CONNECT button per row. Clicking CONNECT on an AP where security is not 'none' or 'open' SHALL prompt for a password. The password field SHALL be non-empty. Clicking CONNECT on an AP with security 'none' or 'open' SHALL connect directly without a password prompt. Connecting SHALL call `PUT /router/api/v1/net/wwan` with `{ enable: true, conf: { ssid, password } }` (omitting password for open APs). Polling SHALL continue after connecting or disconnecting.

#### Scenario: WWAN page polls on mount
- **WHEN** the user navigates to the WWAN page
- **THEN** both GET /router/api/v1/net/wwan and GET /router/api/v1/net/wwan/list are called immediately and every 5 seconds

#### Scenario: WWAN page stops polling on unmount
- **WHEN** the user navigates away from the WWAN page
- **THEN** the polling interval is cleared and no further API calls are made

#### Scenario: Connection info shows current status
- **WHEN** the WWAN is connected with SSID "HomeNet", Host IPv4 "10.0.0.5/24", Gateway "10.0.0.1", DNS "8.8.8.8"
- **THEN** all four values are displayed on the page

#### Scenario: DISCONNECT button appears when connected
- **WHEN** conn4.address is present in the WWAN status response
- **THEN** a DISCONNECT button is visible

#### Scenario: Clicking DISCONNECT sends disconnect request
- **WHEN** the user clicks the DISCONNECT button
- **THEN** a PUT request with `{ enable: false, conf: { ssid: <current_ssid> } }` is sent to /router/api/v1/net/wwan

#### Scenario: AP list shows all columns
- **WHEN** the AP list polling returns results
- **THEN** the AP table displays SSID, security, channel, signal, and a CONNECT button for each row

#### Scenario: Connect to secured AP prompts for password
- **WHEN** the user clicks CONNECT on an AP with security type 'wpa2'
- **THEN** a password prompt is shown; submitting with a non-empty password sends PUT with the SSID and password

#### Scenario: Connect to open AP skips password prompt
- **WHEN** the user clicks CONNECT on an AP with security type 'none'
- **THEN** no password prompt is shown and PUT is sent immediately with enable=true and the SSID (no password field)

#### Scenario: Password prompt rejects empty password
- **WHEN** the user is prompted for a password for a secured AP and confirms with an empty field
- **THEN** an inline error is shown and the PUT request is NOT made

#### Scenario: Polling continues after connecting
- **WHEN** the user connects to an AP
- **THEN** the 5-second polling continues and the connection info updates with the new status

#### Scenario: Router does not support WWAN
- **WHEN** GET /router/api/v1/net/wwan returns 404
- **THEN** a "wireless WAN not supported" message is displayed and polling stops
