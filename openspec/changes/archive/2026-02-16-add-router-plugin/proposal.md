# Change: Add Router Plugin (mfe-router)

## Why
Sylvia-IoT includes a router service (`sylvia-router`) that manages WAN/LAN/WLAN/WWAN network interfaces and provides system resource monitoring. The GUI currently has no way to view or configure these router settings. Additionally, the router's system time API can power a real-time clock widget in the shell header.

## What Changes
- New `packages/mfe-router/` micro-frontend package (category: `router`)
- **Dashboard page**: system resource usage (CPU per-core bar chart, memory/disk gauges) with auto-refresh
- **WAN page**: list all WAN interfaces with current connection status; configure each as disabled/ethernet(static|dhcp)/PPPoE
- **LAN page**: view/edit LAN bridge IPv4 settings (address, DHCP range, lease time); view DHCP lease table
- **Wireless LAN page**: enable/disable WiFi AP; configure SSID, channel (1–11), WPA2 password
- **Wireless WAN page**: enable/disable WiFi client; scan available APs; select and connect with optional password; show connection status
- **Header widgets** (2 widgets, registered via the existing `headerWidgets` plugin mechanism):
  - **System clock**: two-line display — `YYYY/MM/DD` on top, `HH:MM` below — polled from `GET /router/api/v1/sys/time`; smart sleep aligns polls to minute boundaries based on response ms offset
  - **Service info**: two-line display — service name on top, version below — fetched once from `GET /version`
- Runtime config: new `router.baseUrl` in `config.js`
- i18n: en-US + zh-TW translations

## Impact
- Affected specs: new `router` spec
- Affected code: `packages/mfe-router/` (new), `packages/shell/src/boot/plugins.js`, `packages/shell/src/i18n/index.js`, `packages/shell/public/js/config.js`, `packages/shared/src/api/` (new `routerUrl` helper)
