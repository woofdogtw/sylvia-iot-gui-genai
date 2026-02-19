## MODIFIED Requirements

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
