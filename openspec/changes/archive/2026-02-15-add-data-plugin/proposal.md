# add-data-plugin

## Why

The shell has a "Data" category in the hamburger menu but no plugin provides pages for it. Users need to browse application uplink/downlink data, network uplink/downlink data, and coremgr operation logs through the GUI, matching the capabilities of the simple-ui reference implementation.

## What Changes

Add a new `mfe-data` package that registers as a builtin plugin under the `data` category, providing 5 read-only list pages:

1. **Application Uplink Data** — browse uplink messages from devices to applications
2. **Application Downlink Data** — browse downlink messages from applications to devices
3. **Network Uplink Data** — browse network-level uplink data
4. **Network Downlink Data** — browse network-level downlink data
5. **Coremgr Operation Data** — browse system operation logs (all users see own logs; admin/manager can filter by user)

All pages are read-only (no add/edit/delete) with:
- Unit filter dropdown (same pattern as core pages)
- Time range filter (start/end datetime pickers)
- Paginated data table with detail dialog
- CSV export
- Hex/text toggle for payload data columns

API endpoints are served by the `sylvia-iot-data` service, proxied through coremgr at `/api/v1/...` paths.

### Spec deltas

- **NEW `data` spec** — plugin registration, page layouts, 5 data pages, i18n
