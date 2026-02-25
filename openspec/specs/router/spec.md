# router Specification

## Purpose
TBD - created by archiving change add-router-plugin. Update Purpose after archive.
## Requirements
### Requirement: Plugin Registration
The mfe-router package SHALL register as a builtin plugin with id `mfe-router`, category `router`, order `0`. It SHALL export routes, menuItems, and headerWidgets.

#### Scenario: Plugin loads on startup
- **WHEN** the shell application boots
- **THEN** the router plugin is registered with 5 routes (dashboard, wan, lan, wlan, wwan), 5 menu items, and 2 header widgets (system clock, service info)

### Requirement: Router API Integration
The shared package SHALL export a `routerUrl(path)` helper that reads `window.config.router.baseUrl`. The router plugin SHALL use this helper for all API calls to `/api/v1/...` endpoints (the baseUrl already includes the `/router` path prefix, same pattern as coremgrUrl).

#### Scenario: API base URL from config
- **WHEN** `window.config.router.baseUrl` is set to `http://localhost:1080/router`
- **THEN** `routerUrl('/api/v1/sys/time')` returns `http://localhost:1080/router/api/v1/sys/time`

### Requirement: Dashboard Page
The dashboard page SHALL display system resource usage fetched from `GET /router/api/v1/sys/usage`. It SHALL show CPU usage per core as horizontal bar charts (0–100%) with a toggle to switch between per-core view and an overall average view (frontend computes the average by summing all core percentages, dividing by core count, and rounding to the nearest integer). It SHALL show memory usage as a gauge or progress bar (used/total) and disk usage as a gauge or progress bar (used/total). The page SHALL auto-refresh every 5 seconds.

#### Scenario: Dashboard displays resource usage
- **WHEN** the user navigates to `/router/dashboard`
- **THEN** CPU bars, memory gauge, and disk gauge are displayed with current values

#### Scenario: Auto-refresh updates values
- **WHEN** 5 seconds elapse
- **THEN** the dashboard fetches new usage data and updates all displays

### Requirement: WAN Configuration Page
The WAN page SHALL display all WAN interfaces from `GET /router/api/v1/net/wan` as cards, each showing the interface ID, current configuration type (disable/ethernet/pppoe), and active IPv4 connection info (address, gateway, DNS). Each card SHALL have an edit button that opens a configuration form. The form SHALL support switching between disable, ethernet (static or DHCP), and PPPoE modes with appropriate fields. When the type is PPPoE, both username and password fields SHALL be required (non-empty). Saving SHALL call `PUT /router/api/v1/net/wan/{wanId}`.

#### Scenario: Display multiple WAN interfaces
- **WHEN** the router has wan1 (ethernet/static) and wan2 (pppoe)
- **THEN** two cards are shown with their respective configurations and connection info

#### Scenario: Edit WAN to static ethernet
- **WHEN** the user selects ethernet > static and fills address/gateway/DNS
- **THEN** a PUT request is sent and the card refreshes with new settings

#### Scenario: Disable a WAN interface
- **WHEN** the user selects "disable" for a WAN interface
- **THEN** a PUT with `{ "data": { "type": "disable" } }` is sent

#### Scenario: PPPoE fields required
- **WHEN** the user selects PPPoE type and leaves username or password empty
- **THEN** an inline error is shown and the Save button is disabled until both fields are non-empty

#### Scenario: WAN edit form validation
- **WHEN** the user opens the WAN edit dialog
- **THEN** form validation SHALL run immediately on open
- **AND** the Save button SHALL be disabled until all visible validation rules pass
- **AND** when type is `ethernet/static`, the address (CIDR), gateway (IPv4), and DNS fields SHALL each be validated; the Save button SHALL be disabled if any rule fails
- **AND** when type is `disable`, `ethernet/dhcp`, or `pppoe`, no format validation rules apply and the Save button SHALL be enabled

### Requirement: LAN Configuration Page
The LAN page SHALL display the current LAN bridge configuration from `GET /router/api/v1/net/lan` showing IPv4 address (CIDR), DHCP start/end, and lease time. An edit form SHALL allow modifying these values, calling `PUT /router/api/v1/net/lan`. Below the configuration, a DHCP lease table SHALL display active leases from `GET /router/api/v1/net/lan/leases` showing IP, MAC address, hostname, and lease start/end times.

#### Scenario: View and edit LAN settings
- **WHEN** the user views the LAN page
- **THEN** the current LAN config is displayed with an edit form, and DHCP leases are listed in a table below

#### Scenario: Update LAN DHCP range
- **WHEN** the user changes dhcpStart/dhcpEnd and saves
- **THEN** a PUT request is sent with the updated conf4 object

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
The WWAN page SHALL periodically poll both `GET /router/api/v1/net/wwan` (current status) and `GET /router/api/v1/net/wwan/list` (AP scan list) every 5 seconds using recursive setTimeout when the page is mounted. The timers SHALL be cleared when the page is unmounted. If the initial GET returns 404, the page SHALL show a "not supported" message and stop polling.

The page SHALL display the current connection info: SSID, Host IPv4, Gateway IPv4, and DNS IPv4 (from the conn4 object). When the WWAN is connected (conn4.address is present), a DISCONNECT button SHALL be visible. Clicking DISCONNECT SHALL call `PUT /router/api/v1/net/wwan` with `{ enable: false, conf: { ssid: <current_ssid> } }` to clear the connection.

The page SHALL display the AP list with columns: SSID, security, channel, signal, and a CONNECT button per row. Clicking CONNECT on an AP where security is not 'none' or 'open' SHALL prompt for a password. The password field SHALL be non-empty. Clicking CONNECT on an AP with security 'none' or 'open' SHALL connect directly without a password prompt. Connecting SHALL call `PUT /router/api/v1/net/wwan` with `{ enable: true, conf: { ssid, password } }` (omitting password for open APs). Polling SHALL continue after connecting or disconnecting.

#### Scenario: WWAN page polls on mount
- **WHEN** the user navigates to the WWAN page
- **THEN** both GET /router/api/v1/net/wwan and GET /router/api/v1/net/wwan/list are called immediately and every 5 seconds

#### Scenario: WWAN page stops polling on unmount
- **WHEN** the user navigates away from the WWAN page
- **THEN** the polling timers are cleared and no further API calls are made

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

#### Scenario: WWAN password dialog validation
- **WHEN** the user opens the password dialog to connect to a secured AP
- **THEN** form validation SHALL run immediately on open
- **AND** the Connect button SHALL be disabled until the password field is non-empty
- **AND** the Connect button SHALL become enabled as soon as the user enters any character

#### Scenario: Password prompt rejects empty password
- **WHEN** the user is prompted for a password for a secured AP and confirms with an empty field
- **THEN** an inline error is shown and the PUT request is NOT made

#### Scenario: Polling continues after connecting
- **WHEN** the user connects to an AP
- **THEN** the 5-second polling continues and the connection info updates with the new status

#### Scenario: Router does not support WWAN
- **WHEN** GET /router/api/v1/net/wwan returns 404
- **THEN** a "wireless WAN not supported" message is displayed and polling stops

### Requirement: System Clock Header Widget
The router plugin SHALL register a header widget that displays the router's system time in two lines: `YYYY/MM/DD` on top and `HH:MM` below. The time SHALL be fetched from `GET /router/api/v1/sys/time`. The polling SHALL use smart sleep: after receiving a response, compute the ms offset until the next minute boundary and sleep accordingly, so the display updates precisely when the minute changes. If the router API is unreachable, the widget SHALL hide gracefully.

#### Scenario: Clock displays router time
- **WHEN** the router plugin is loaded and the API is reachable
- **THEN** a two-line clock (date + time) appears in the header toolbar, updating at each minute boundary

#### Scenario: Router unreachable
- **WHEN** the sys/time API call fails
- **THEN** the clock widget is hidden (no error shown)

#### Scenario: Clock widget visible after login
- **WHEN** the user logs in and the `sylvia-router` backend is running
- **THEN** a `div.text-center` containing text matching `YYYY/MM/DD` is visible inside `.q-toolbar`

### Requirement: Service Info Header Widget
The router plugin SHALL register a header widget that displays the router service name and version in two lines, fetched once from `GET /version` on mount. If the API is unreachable, the widget SHALL hide gracefully.

#### Scenario: Service info displays name and version
- **WHEN** the router plugin is loaded and the version API is reachable
- **THEN** a two-line display showing service name (top) and version (bottom) appears in the header toolbar

#### Scenario: Version API unreachable
- **WHEN** GET /version fails
- **THEN** the service info widget is hidden (no error shown)

#### Scenario: Service info widget visible after login
- **WHEN** the user logs in and the `sylvia-router` backend is running
- **THEN** a `div.text-center` containing a version string is visible inside `.q-toolbar`

### Requirement: API Error Display

When an API call from any router configuration page fails, the error SHALL be presented as a persistent modal dialog rather than a transient notification, so users can read the full error detail before continuing.

#### Scenario: Error dialog on API failure

- **WHEN** an API call from a router page (Dashboard, WAN, LAN, WLAN, or WWAN) fails
- **THEN** a Quasar dialog SHALL appear with a title showing the localized error code label from the `apiError.*` i18n translations in the shared package (or a generic error title if the code is unknown)
- **AND** the dialog body SHALL display the raw `message` string from the API error response (`error.response.data.message`), falling back to `HTTP {status}: {statusText}` when no message is present, or to `error.message` when there is no response
- **AND** the dialog SHALL persist until the user explicitly dismisses it by clicking OK

#### Scenario: Clock and service-info widget errors remain silent

- **WHEN** the System Clock header widget or Service Info header widget API call fails
- **THEN** the widget SHALL hide gracefully with no dialog or notification shown (these are non-critical background polls)

### Requirement: Validate Utility Module
The mfe-router package SHALL provide a `packages/mfe-router/src/utils/validate.js` module exporting reusable pure validator functions. Each function SHALL return `true` when the value is valid, or a localized error message string when invalid. All validators SHALL accept the value as the first argument and the vue-i18n `t` function as the second argument.

The module SHALL export the following functions:
- `isValidIPv4(val, t)` — returns `true` if `val` is a well-formed IPv4 address (four decimal octets 0–255 separated by dots); otherwise returns the i18n message for `router.validate.invalidIp`
- `isValidCIDR(val, t)` — returns `true` if `val` is a well-formed IPv4 CIDR string (e.g. `192.168.1.1/24`, prefix 0–32); otherwise returns the i18n message for `router.validate.invalidCidr`
- `isNonEmpty(val, t)` — returns `true` if `val` is a non-empty, non-whitespace string; otherwise returns the i18n message for `router.validate.required`
- `isMinLength(min)` — returns a validator function `(val, t) => true | string` that checks `val.length >= min`; when invalid returns the i18n message for `router.validate.minLength` (interpolated with the `min` value)
- `isMaxLength(max)` — returns a validator function `(val, t) => true | string` that checks `val.length <= max`; when invalid returns the i18n message for `router.validate.maxLength` (interpolated with the `max` value)
- `isIntegerInRange(min, max)` — returns a validator function `(val, t) => true | string` that checks `val` is an integer with `min <= val <= max`; when invalid returns the i18n message for `router.validate.outOfRange` (interpolated with `min` and `max`)
- `isIPInRange(ip, start, end, t)` — returns `true` if the IPv4 address `ip` (without prefix) falls within the inclusive range `[start, end]`; returns `false` if any argument is not a valid IPv4 address; used for cross-field LAN validation
- `isIPNotGreaterThan(a, b, t)` — returns `true` if IPv4 address `a` is numerically less than or equal to `b`; otherwise returns the i18n message for `router.validate.dhcpStartAfterEnd`

#### Scenario: isValidIPv4 accepts valid address
- **WHEN** `isValidIPv4('192.168.1.1', t)` is called
- **THEN** it returns `true`

#### Scenario: isValidIPv4 rejects invalid address
- **WHEN** `isValidIPv4('999.0.0.1', t)` is called
- **THEN** it returns the error message string for `router.validate.invalidIp`

#### Scenario: isValidCIDR accepts valid CIDR
- **WHEN** `isValidCIDR('10.0.0.0/24', t)` is called
- **THEN** it returns `true`

#### Scenario: isValidCIDR rejects bare IP
- **WHEN** `isValidCIDR('10.0.0.1', t)` is called
- **THEN** it returns the error message string for `router.validate.invalidCidr`

#### Scenario: isValidCIDR rejects prefix out of range
- **WHEN** `isValidCIDR('10.0.0.0/33', t)` is called
- **THEN** it returns the error message string for `router.validate.invalidCidr`

#### Scenario: isValidCIDR rejects trailing slash with no prefix
- **WHEN** `isValidCIDR('192.168.1.1/', t)` is called
- **THEN** it returns the error message string for `router.validate.invalidCidr`

#### Scenario: isNonEmpty rejects empty string
- **WHEN** `isNonEmpty('', t)` is called
- **THEN** it returns the error message string for `router.validate.required`

#### Scenario: isNonEmpty rejects whitespace-only string
- **WHEN** `isNonEmpty('   ', t)` is called
- **THEN** it returns the error message string for `router.validate.required`

#### Scenario: isMinLength returns a validator that passes for sufficient length
- **WHEN** `isMinLength(8)('password1', t)` is called
- **THEN** it returns `true`

#### Scenario: isMinLength returns a validator that fails for insufficient length
- **WHEN** `isMinLength(8)('short', t)` is called
- **THEN** it returns the error message string for `router.validate.minLength`

#### Scenario: isMaxLength returns a validator that passes within limit
- **WHEN** `isMaxLength(63)('validpassword', t)` is called
- **THEN** it returns `true`

#### Scenario: isMaxLength returns a validator that fails when too long
- **WHEN** `isMaxLength(63)` is called with a 64-character string
- **THEN** it returns the error message string for `router.validate.maxLength`

#### Scenario: isIntegerInRange returns a validator that passes within range
- **WHEN** `isIntegerInRange(60, 604800)(86400, t)` is called
- **THEN** it returns `true`

#### Scenario: isIntegerInRange returns a validator that fails below minimum
- **WHEN** `isIntegerInRange(60, 604800)(10, t)` is called
- **THEN** it returns the error message string for `router.validate.outOfRange`

#### Scenario: isIntegerInRange returns a validator that fails above maximum
- **WHEN** `isIntegerInRange(60, 604800)(999999, t)` is called
- **THEN** it returns the error message string for `router.validate.outOfRange`

#### Scenario: isIPInRange detects IP inside range
- **WHEN** `isIPInRange('192.168.1.100', '192.168.1.50', '192.168.1.200', t)` is called
- **THEN** it returns `true`

#### Scenario: isIPInRange detects IP outside range
- **WHEN** `isIPInRange('192.168.1.10', '192.168.1.50', '192.168.1.200', t)` is called
- **THEN** it returns `false`

#### Scenario: isIPNotGreaterThan passes when start equals end
- **WHEN** `isIPNotGreaterThan('192.168.1.100', '192.168.1.100', t)` is called
- **THEN** it returns `true`

#### Scenario: isIPNotGreaterThan fails when start is after end
- **WHEN** `isIPNotGreaterThan('192.168.1.200', '192.168.1.100', t)` is called
- **THEN** it returns the error message string for `router.validate.dhcpStartAfterEnd`

### Requirement: WAN Page Input Validation
The WAN page edit dialog SHALL validate fields before calling the API. When the connection type4 is `static`, the address field SHALL validate as a CIDR string, the gateway field SHALL validate as an IPv4 address, and each comma-separated entry in the DNS field SHALL validate as an IPv4 address. Each DNS entry SHALL be trimmed of leading/trailing whitespace before validation so that `8.8.8.8, 8.8.4.4` (with spaces) is accepted. The Save button SHALL call `formRef.value.validate()` and abort if validation fails.

#### Scenario: WAN static fields pass with valid input
- **WHEN** the user enters `192.168.100.1/24` for address, `192.168.100.254` for gateway, `8.8.8.8, 8.8.4.4` for DNS, and clicks Save
- **THEN** the form validates successfully and the PUT API call is made

#### Scenario: WAN static address rejects bare IP
- **WHEN** the user enters `192.168.1.1` (no prefix) for the address field
- **THEN** an inline error message is shown and the PUT API call is NOT made

#### Scenario: WAN DNS rejects non-IP entry
- **WHEN** the user enters `8.8.8.8, notanip` for the DNS field
- **THEN** an inline error message is shown and the PUT API call is NOT made

#### Scenario: WAN non-static types skip IP validation
- **WHEN** the type is `dhcp` or `pppoe`
- **THEN** no IP validation rules are applied and Save proceeds with those fields ignored

### Requirement: LAN Page Input Validation
The LAN page form SHALL validate all fields before calling the API. The address field SHALL validate as a CIDR string. When DHCP is enabled, dhcpStart and dhcpEnd SHALL each validate as IPv4 addresses, leaseTime SHALL validate as an integer between 60 and 604800 (seconds), dhcpStart SHALL be numerically less than or equal to dhcpEnd, and the host IP extracted from the address CIDR SHALL NOT fall within the dhcpStart–dhcpEnd range. The Save button SHALL be disabled until all visible validation rules pass; it SHALL re-enable in real time as the user corrects errors. Validation SHALL re-run reactively whenever any field value changes.

#### Scenario: LAN form passes with valid non-overlapping config
- **WHEN** address is `192.168.1.1/24`, dhcpStart is `192.168.1.100`, dhcpEnd is `192.168.1.200`, leaseTime is `86400`
- **THEN** validation passes and the PUT API call is made

#### Scenario: LAN address rejects bare IP
- **WHEN** the address field contains `192.168.1.1` without a prefix
- **THEN** an inline error is shown and Save is blocked

#### Scenario: LAN host IP inside DHCP range is rejected
- **WHEN** address is `192.168.1.100/24`, dhcpStart is `192.168.1.50`, dhcpEnd is `192.168.1.200`
- **THEN** an inline error is shown indicating the host IP is within the DHCP range and Save is blocked

#### Scenario: LAN dhcpStart after dhcpEnd is rejected
- **WHEN** dhcpStart is `192.168.1.200` and dhcpEnd is `192.168.1.100`
- **THEN** an inline error is shown on the dhcpStart field and Save is blocked

#### Scenario: LAN leaseTime below minimum is rejected
- **WHEN** leaseTime is `10` (below the minimum of 60)
- **THEN** an inline error is shown and Save is blocked

#### Scenario: LAN leaseTime above maximum is rejected
- **WHEN** leaseTime is `999999` (above the maximum of 604800)
- **THEN** an inline error is shown and Save is blocked

#### Scenario: LAN Save button is disabled when form is invalid
- **WHEN** any field contains an invalid value
- **THEN** the Save button is disabled and cannot be clicked
- **AND** when all fields are corrected to valid values the Save button re-enables automatically

### Requirement: WLAN Page Input Validation
The WLAN page SHALL validate SSID and password fields before calling the API. The SSID field SHALL not be empty when WLAN is enabled. The password field SHALL be 8–63 characters (WPA-PSK requirement per the API) when WLAN is enabled. The Save button SHALL be disabled until all visible validation rules pass; it SHALL re-enable in real time as the user corrects errors. Validation SHALL re-run reactively whenever any field value changes.

#### Scenario: WLAN save passes with valid SSID and password
- **WHEN** SSID is `MyNetwork` and password is `securepass`
- **THEN** validation passes and the PUT API call is made

#### Scenario: WLAN save rejects empty SSID
- **WHEN** the SSID field is empty and Save is clicked
- **THEN** an inline error is shown and the PUT API call is NOT made

#### Scenario: WLAN save rejects short password
- **WHEN** the password is `short` (fewer than 8 characters) and Save is clicked
- **THEN** an inline error is shown and the PUT API call is NOT made

#### Scenario: WLAN save rejects password over 63 characters
- **WHEN** the password is 64 characters long and Save is clicked
- **THEN** an inline error is shown and the PUT API call is NOT made

#### Scenario: WLAN Save button is disabled when form is invalid
- **WHEN** SSID is empty or password length is out of range while WLAN is enabled
- **THEN** the Save button is disabled and cannot be clicked
- **AND** when all fields are corrected to valid values the Save button re-enables automatically

### Requirement: WWAN Page Input Validation
The WWAN page connect password dialog SHALL validate that the SSID is non-empty and the password is non-empty before submitting a connection request. Validation SHALL run when the user confirms the dialog.

#### Scenario: WWAN connect dialog rejects empty password for secured AP
- **WHEN** the user clicks CONNECT on an AP with security type `wpa2` and leaves the password field empty
- **THEN** an inline error is shown and the PUT API call is NOT made

#### Scenario: WWAN connects directly for open AP
- **WHEN** the user clicks CONNECT on an AP with security type `none`
- **THEN** no password dialog is shown and the PUT API call is made immediately

### Requirement: i18n Support
The router plugin SHALL provide i18n messages for en-US and zh-TW covering all menu labels, page titles, field labels, status messages, and validation messages.

#### Scenario: Language switch
- **WHEN** the user switches language to zh-TW
- **THEN** all router page labels display in Traditional Chinese

