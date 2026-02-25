## Context

The mfe-router plugin was built with functional API integration but no defensive input validation. The four network configuration pages (WAN, LAN, WLAN, WWAN) accept user text input and pass it directly to API calls without client-side checking. This has two consequences:

1. API calls with malformed payloads (e.g. bare IPs where CIDR is expected, empty SSIDs) produce confusing error responses or silent failures.
2. The WLAN and WWAN UX does not match how these interfaces are actually used. WLAN settings are stable after initial setup; users want to see current settings at a glance rather than always landing in edit mode. WWAN is more dynamic; users browse available APs and connect/disconnect — a manual single-scan flow does not fit this use case.

Current file state:
- `WanPage.vue` (196 lines): card list + edit dialog, no validation
- `LanPage.vue` (155 lines): inline form, no validation
- `WlanPage.vue` (104 lines): single card with toggle and inline fields, no validation
- `WwanPage.vue` (164 lines): inline form + manual scan button + AP table, no validation
- No `validate.js` utility exists

## Goals / Non-Goals

**Goals:**

- Provide a single `validate.js` module with composable, unit-testable validators for IPv4 address, CIDR notation, string min/max length, integer range, IP range containment, and IP ordering
- Wire field-level `:rules` arrays into all four pages so the user gets inline error messages before submission
- Add cross-field validation on the LAN form (host IP not inside DHCP range; dhcpStart <= dhcpEnd)
- Update WlanPage.vue: show current config with password masked by default + show/hide toggle; enable/disable toggle; SSID/channel/password fields hidden when disabled; validation on save (SSID non-empty, password ≥8 chars)
- Redesign WwanPage.vue: replace manual scan with setInterval polling of both `GET /router/api/v1/net/wwan` and `GET /router/api/v1/net/wwan/list`; per-row CONNECT button with conditional password prompt; DISCONNECT button when connected; display current connection info (SSID, Host IPv4, Gateway IPv4, DNS IPv4)

**Non-Goals:**

- Server-side validation changes (API is unchanged)
- New API endpoints or changes to `packages/mfe-router/src/api/index.js`
- Changes to shell, shared, or any other mfe-* package
- E2E tests for the new validation (unit tests for validate.js are sufficient; E2E scope is unchanged)
- Debouncing or throttling of polling intervals
- IPv6 support

## Decisions

### Decision: Shared validate.js utility module

**Rationale**: Each page needs overlapping validators (e.g. all three IP-related pages need IPv4 checking). Centralizing in one file avoids duplication, enables unit testing in isolation, and keeps page components focused on UI logic.

**Alternatives considered**: Inline validation functions per page — rejected because it duplicates code and makes consistency fixes harder.

The module exports plain functions that return `true` on success or an error-message string on failure, matching the format expected by Quasar `q-input :rules` arrays: `[(v) => validator(v, t) || errorMessage]`.

### Decision: Quasar :rules for field-level validation, q-form with greedy for cross-field

**Rationale**: Quasar's `q-input :rules` prop provides inline error display without additional state. The `greedy` prop on `q-form` forces all fields to validate simultaneously so cross-field errors are visible at once. `formRef.value.validate()` returns a Promise so `submitEdit` can await it and abort early if invalid.

**Alternatives considered**: Manual state variables (e.g. `addressError: ref('')`) — rejected as verbose and duplicates what Quasar already provides.

### Decision: WLAN — show current config with show/hide password toggle

**Rationale**: WLAN passwords are sensitive; masking by default with an explicit toggle is the right default. Validation is added at save time to catch empty SSIDs and short passwords before the PUT is sent. The existing inline form layout is preserved as it already fits the page structure.

### Decision: WWAN redesign — periodic polling instead of manual scan

**Rationale**: WWAN is dynamic: nearby APs appear and disappear; the connected state changes asynchronously. Polling both status and the AP list every 5 seconds (same interval as the Dashboard) removes the need for a manual Scan button and keeps the AP list fresh. setInterval / clearInterval on mount/unmount is the simplest lifecycle-correct approach without introducing a new dependency.

**Alternatives considered**: Keep manual scan button — rejected because the UX requirement mandates polling. WebSocket — overkill and the backend does not expose one.

**Interval choice**: 5 seconds matches the dashboard refresh interval established in the existing spec.

### Decision: CONNECT button with conditional password dialog

**Rationale**: When the user clicks CONNECT on a secured AP, they need to supply a password. A small q-dialog is the least disruptive way to collect a single field without navigating away. If the AP security is 'none' or 'open', the dialog is skipped and connection is attempted immediately.

**Alternatives considered**: Always show a password field in the AP table row — clutters the list. Redirect to a separate connect page — breaks the fast-connect flow.

### Decision: DISCONNECT button visible when connected

**Rationale**: When the WWAN is connected, the user needs a quick way to disconnect. The DISCONNECT button is shown wherever the current connection info is displayed. DISCONNECT in the AP table row alone does not work if the connected AP is no longer in the scan list.

## Risks / Trade-offs

- [Polling creates extra API load] → Mitigation: 5-second interval is the same rate as the existing dashboard; clearInterval on unmount prevents leaks when navigating away.
- [Cross-field LAN validation is evaluated on every keystroke via :rules] → Mitigation: The validators are pure functions with no side effects, so this is cheap. The cross-field check only runs when dhcpEnabled is true.
- [q-form greedy mode causes all errors to show immediately on first load if form is pre-populated with invalid data from API] → Mitigation: Do not call `formRef.value.validate()` on mount; only call it on submit, so errors appear only after the user tries to save.
- [Show/hide password toggle exposes the WLAN password in plain text] → Accepted trade-off; the toggle is explicit and user-initiated.

## Migration Plan

No data migration is required. Changes are purely in Vue component files and one new utility file. The changes are backwards-compatible: the same API calls are made, with valid data being required before submission instead of after.

Deployment steps:
1. Create `packages/mfe-router/src/utils/validate.js`
2. Update i18n files with new validation message keys
3. Update WanPage.vue, LanPage.vue with field-level rules
4. Replace WlanPage.vue, WwanPage.vue with redesigned versions
5. Run unit tests (`npm test -w packages/mfe-router`)
6. Run router E2E tests to confirm no regression

Rollback: revert the four page files and remove validate.js; no schema or API changes to undo.

## Open Questions

None — all decisions above have been resolved based on the explicit requirements in the proposal.
