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
The WAN page SHALL display all WAN interfaces from `GET /router/api/v1/net/wan` as cards, each showing the interface ID, current configuration type (disable/ethernet/pppoe), and active IPv4 connection info (address, gateway, DNS). Each card SHALL have an edit button that opens a configuration form. The form SHALL support switching between disable, ethernet (static or DHCP), and PPPoE modes with appropriate fields. Saving SHALL call `PUT /router/api/v1/net/wan/{wanId}`.

#### Scenario: Display multiple WAN interfaces
- **WHEN** the router has wan1 (ethernet/static) and wan2 (pppoe)
- **THEN** two cards are shown with their respective configurations and connection info

#### Scenario: Edit WAN to static ethernet
- **WHEN** the user selects ethernet > static and fills address/gateway/DNS
- **THEN** a PUT request is sent and the card refreshes with new settings

#### Scenario: Disable a WAN interface
- **WHEN** the user selects "disable" for a WAN interface
- **THEN** a PUT with `{ "data": { "type": "disable" } }` is sent

### Requirement: LAN Configuration Page
The LAN page SHALL display the current LAN bridge configuration from `GET /router/api/v1/net/lan` showing IPv4 address (CIDR), DHCP start/end, and lease time. An edit form SHALL allow modifying these values, calling `PUT /router/api/v1/net/lan`. Below the configuration, a DHCP lease table SHALL display active leases from `GET /router/api/v1/net/lan/leases` showing IP, MAC address, hostname, and lease start/end times.

#### Scenario: View and edit LAN settings
- **WHEN** the user views the LAN page
- **THEN** the current LAN config is displayed with an edit form, and DHCP leases are listed in a table below

#### Scenario: Update LAN DHCP range
- **WHEN** the user changes dhcpStart/dhcpEnd and saves
- **THEN** a PUT request is sent with the updated conf4 object

### Requirement: Wireless LAN Configuration Page
The WLAN page SHALL display the current wireless LAN config from `GET /router/api/v1/net/wlan`. If supported (not 404), it SHALL show enable/disable toggle, SSID, channel (1–11), and WPA2 password fields. Saving SHALL call `PUT /router/api/v1/net/wlan`. If the router responds with 404, the page SHALL show a "not supported" message.

#### Scenario: Configure wireless AP
- **WHEN** the user enables WLAN and sets SSID/channel/password
- **THEN** a PUT request is sent with the configuration

#### Scenario: Router does not support WLAN
- **WHEN** GET /router/api/v1/net/wlan returns 404
- **THEN** a "wireless LAN not supported" message is displayed

### Requirement: Wireless WAN Configuration Page
The WWAN page SHALL display the current wireless WAN config from `GET /router/api/v1/net/wwan`. If supported (not 404), it SHALL show enable/disable toggle, connected SSID, and IPv4 connection info. A "Scan" button SHALL call `GET /router/api/v1/net/wwan/list` and display available APs in a table with SSID, security, channel, and signal strength. Clicking an AP SHALL populate the SSID field; if the AP has security, a password field SHALL be shown. Saving SHALL call `PUT /router/api/v1/net/wwan`.

#### Scenario: Scan and connect to AP
- **WHEN** the user clicks Scan, selects an AP, enters a password, and saves
- **THEN** a PUT request is sent with enable=true and the selected SSID/password

#### Scenario: Router does not support WWAN
- **WHEN** GET /router/api/v1/net/wwan returns 404
- **THEN** a "wireless WAN not supported" message is displayed

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

### Requirement: i18n Support
The router plugin SHALL provide i18n messages for en-US and zh-TW covering all menu labels, page titles, field labels, status messages, and validation messages.

#### Scenario: Language switch
- **WHEN** the user switches language to zh-TW
- **THEN** all router page labels display in Traditional Chinese

