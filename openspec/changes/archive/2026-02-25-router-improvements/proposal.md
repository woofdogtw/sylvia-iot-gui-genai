## Why

The mfe-router plugin pages lack input validation and provide a suboptimal UX for WLAN and WWAN configuration. Without validation, users can submit malformed IP addresses or empty required fields, causing silent API errors. The WLAN and WWAN pages currently expose raw edit forms where a read-only status view and streamlined connect workflow would better match how these interfaces are actually used.

## What Changes

- Add input validation to WAN page: validate IP address (CIDR format), gateway IP, and DNS IPs (comma-separated) when type4 is static
- Add input validation to LAN page: validate IP address (CIDR), DHCP start/end IPs, lease time (positive integer), plus cross-field rules (host IP not in DHCP range; dhcpStart <= dhcpEnd)
- Add input validation to WLAN page: SSID (non-empty), password (min 8 chars for WPA)
- Add input validation to WWAN page: SSID (non-empty), password (non-empty when connecting to a secured AP)
- Create `packages/mfe-router/src/utils/validate.js` with reusable validators (IPv4, CIDR, IP range checks)
- Redesign WLAN page: replace inline edit form with a read-only "Current Settings" card plus an edit dialog; add show/hide password toggle in the read-only view
- Redesign WWAN page: replace manual scan button with periodic polling (setInterval on mount, clearInterval on unmount) of both current status and AP list; add per-AP CONNECT button with conditional password dialog; add DISCONNECT button when connected; Current Status card shows SSID, Host IPv4, Gateway IPv4, DNS IPv4

## Capabilities

### New Capabilities

- `router-input-validation`: Reusable validators and field-level rules for mfe-router form inputs (IPv4, CIDR, IP range, SSID, password)

### Modified Capabilities

- `router`: WLAN and WWAN page requirements change significantly — WLAN gains a read-only card view with edit dialog; WWAN gains periodic polling, per-AP CONNECT button, password dialog, and DISCONNECT button; all pages gain input validation requirements

## Impact

- `packages/mfe-router/src/utils/validate.js`: new file
- `packages/mfe-router/src/pages/WanPage.vue`: add field-level validation rules
- `packages/mfe-router/src/pages/LanPage.vue`: add field-level and cross-field validation rules
- `packages/mfe-router/src/pages/WlanPage.vue`: full redesign (read-only card + edit dialog + validation)
- `packages/mfe-router/src/pages/WwanPage.vue`: full redesign (polling, CONNECT/DISCONNECT, password dialog + validation)
- `packages/mfe-router/src/i18n/en-US.js` and `zh-TW.js`: new keys for validation messages and new UI labels
- No API changes; no dependency changes; no shell or shared package changes
