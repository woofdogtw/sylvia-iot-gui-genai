## MODIFIED Requirements

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

#### Scenario: WAN edit form validation

- **WHEN** the user opens the WAN edit dialog
- **THEN** form validation SHALL run immediately on open
- **AND** the Save button SHALL be disabled until all visible validation rules pass
- **AND** when type is `ethernet/static`, the address (CIDR), gateway (IPv4), and DNS fields SHALL each be validated; the Save button SHALL be disabled if any rule fails
- **AND** when type is `disable`, `ethernet/dhcp`, or `pppoe`, no format validation rules apply and the Save button SHALL be enabled

### Requirement: Wireless WAN Configuration Page

The WWAN page SHALL display the current wireless WAN connection status and available AP list, fetched by polling `GET /router/api/v1/net/wwan` and `GET /router/api/v1/net/wwan/list` every 5 seconds. If supported (not 404), it SHALL show current connection info (SSID, host IP, gateway, DNS) and a DISCONNECT button when connected. The AP list SHALL show SSID, security type, channel, and signal strength. Clicking CONNECT on an open AP SHALL connect directly; clicking CONNECT on a secured AP SHALL open a password dialog. Saving SHALL call `PUT /router/api/v1/net/wwan`. If the router responds with 404, the page SHALL show a "not supported" message.

#### Scenario: Scan and connect to AP

- **WHEN** the user clicks CONNECT on a secured AP and enters a password
- **THEN** a PUT request is sent with enable=true and the selected SSID/password

#### Scenario: Router does not support WWAN

- **WHEN** GET /router/api/v1/net/wwan returns 404
- **THEN** a "wireless WAN not supported" message is displayed

#### Scenario: WWAN password dialog validation

- **WHEN** the user opens the password dialog to connect to a secured AP
- **THEN** form validation SHALL run immediately on open
- **AND** the Connect button SHALL be disabled until the password field is non-empty
- **AND** the Connect button SHALL become enabled as soon as the user enters any character
