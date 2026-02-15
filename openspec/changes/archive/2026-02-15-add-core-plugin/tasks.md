# Implementation Tasks: Core Management Plugin

## 1. Package Setup

- [x] 1.1 Create `packages/mfe-core/` directory with package.json
- [x] 1.2 Configure package as `@sylvia-iot/mfe-core` with dependency on `@sylvia-iot/shared`
- [x] 1.3 Create `src/index.js` default export with plugin registration (id: `mfe-core`, name: `Core`, category: `core`)
- [x] 1.4 Define menu items matching simple-ui order: User, Client, Unit, Application, Network, Device, Device Route, Network Route, DL Data Buffer
- [x] 1.5 Define routes for all 9 management pages
- [x] 1.6 Register as builtin plugin in `packages/shell/src/boot/plugins.js`

## 2. API Integration Layer

- [x] 2.1 Create API helper module (`src/api/`) for coremgr API calls
- [x] 2.2 Implement base URL resolution from `window.config.coremgr.baseUrl` with `/coremgr/api/v1/` prefix
- [x] 2.3 Implement user API functions (list, get, create, update, delete, count)
- [x] 2.4 Implement client API functions (list, get, create, update, delete, count)
- [x] 2.5 Implement unit API functions (list, get, create, update, delete, count)
- [x] 2.6 Implement application API functions (list, get, create, update, delete, count, stats, send-dldata)
- [x] 2.7 Implement network API functions (list, get, create, update, delete, count, stats, send-uldata)
- [x] 2.8 Implement device API functions (list, get, create, update, delete, count)
- [x] 2.9 Implement device-route API functions (list, create, delete, count)
- [x] 2.10 Implement network-route API functions (list, create, delete, count)
- [x] 2.11 Implement dldata-buffer API functions (list, delete, count)
- [x] 2.12 Use shared axios instance with Authorization Bearer header (401 auto-retry handled by shell)

## 3. Common Page Components

- [x] 3.1 Create reusable toolbar component (filter controls, search input with Enter key and search icon button, action buttons: refresh, add, CSV export)
- [x] 3.2 Create reusable paginated data table component using QTable
- [x] 3.3 Implement pagination with default page size of 20 and count API integration
- [x] 3.4 Create reusable add/edit dialog component with form validation, whitespace trimming (non-password inputs), JSON object validation (empty → `{}`), Enter → OK, Escape → Cancel
- [x] 3.5 Create reusable detail dialog component (read-only, full item details including Info JSON/timestamps/IDs, Escape to close)
- [x] 3.6 Create reusable delete confirmation dialog component (show item identifier, Enter → confirm, Escape → Cancel)
- [x] 3.7 Implement CSV export: fetch with `format=csv` + Bearer token; Chromium uses File System Access API (`showSaveFilePicker`) for streaming with progress (downloaded bytes); fallback to Blob download (`URL.createObjectURL`); UTF-8 encoding
- [x] 3.8 Implement error display using Quasar notifications with shared apiError i18n messages
- [x] 3.9 Implement responsive column visibility (essential columns always visible, secondary hide on small screens)
- [x] 3.10 Implement role-based access control: read roles from `/auth/api/v1/auth/tokeninfo`, hide menu items and restrict page access based on roles
- [x] 3.11 Use `info` icon for detail button, `edit` for edit, `delete` for delete (left to right order)
- [x] 3.12 Unify date/time display to `YYYY/MM/DD hh:mm:ss` local time via shared `formatTime()` in `utils/format.js`

## 4. User Management Page (admin or manager role required)

- [x] 4.1 Create UserPage component with toolbar and table
- [x] 4.2 Display columns: Account, Name, Roles, Created, Modified
- [x] 4.3 Implement search by account name
- [x] 4.4 Create user add dialog (admin only, hidden for manager): Account (required, pattern `[A-Za-z0-9][A-Za-z0-9-_]*`), Password (required), Name, Info (JSON)
- [x] 4.5 Create user edit dialog (admin): Password, Name, Roles (checkboxes: admin, manager, service, dev), Info (JSON), Disable toggle
- [x] 4.6 Create user edit dialog (manager): Password, Name, Info (JSON), Disable toggle (only for users with service or user roles, not admin or manager)
- [x] 4.7 Create user delete confirmation dialog (admin only, hidden for manager)
- [x] 4.8 Create user detail dialog
- [x] 4.9 Implement CSV export for user list

## 5. Client Management Page (admin or dev role required)

- [x] 5.1 Create ClientPage component with toolbar and table
- [x] 5.2 Display columns: Client ID, Name, Type (Public/Private), Created
- [x] 5.3 Implement visibility: admin sees all clients; dev sees only their own
- [x] 5.4 Create client add dialog: Name (required), Redirect URIs (comma-separated, required), Scopes (comma-separated), Image URL, Credentials toggle (public/private)
- [x] 5.5 Display generated client secret when credentials enabled
- [x] 5.6 Create client edit dialog: Name, Redirect URIs, Scopes, Image URL, Regenerate Secret button (private clients only)
- [x] 5.7 Create client delete confirmation dialog (client cannot delete itself)
- [x] 5.8 Create client detail dialog
- [x] 5.9 Implement CSV export for client list

## 6. Unit Management Page

- [x] 6.1 Create UnitPage component with toolbar and table
- [x] 6.2 Display columns: Code, Name, Owner, Created
- [x] 6.3 Implement search/filter by code
- [x] 6.4 Create unit add dialog: Code (required, pattern `[A-Za-z0-9][A-Za-z0-9-_]*`), Name, Owner (admin/manager only), Info (JSON)
- [x] 6.5 Create unit edit dialog: Name, Owner (admin/manager only), Members, Info (JSON)
- [x] 6.6 Create unit delete confirmation dialog with cascade warning (devices, routes, buffers)
- [x] 6.7 Create unit detail dialog
- [x] 6.8 Implement CSV export for unit list

## 7. Application Management Page

- [x] 7.1 Create ApplicationPage component with toolbar and table
- [x] 7.2 Display columns: Code, Name, Unit, Protocol, Created
- [x] 7.3 Implement unit filter: admin/manager see all; normal users must select a unit
- [x] 7.4 Create application add dialog: Code (required, pattern `[A-Za-z0-9][A-Za-z0-9-_]*`, lowercase-transformed), Unit (required, dropdown), Host URI (required, validate scheme: amqp/amqps/mqtt/mqtts), Name, TTL (ms, AMQP only, non-negative integer), Queue Length (AMQP only, non-negative integer), Info (JSON)
- [x] 7.5 Display one-time password on create success: masked by default (dots), eye icon toggle to reveal, copy-to-clipboard button
- [x] 7.6 Create application edit dialog: Host URI (validate scheme), Name, TTL (AMQP only), Queue Length (AMQP only), Password (required when changing Host URI), Info (JSON)
- [x] 7.7 Create queue stats dialog: three queues (uldata, dldataResp, dldataResult) with consumers, message count, publish rate, delivery rate; auto-refresh every second via timer; timer starts on dialog open, stops on close
- [x] 7.8 Create send downlink data dialog: Device (required, dropdown showing network address), Payload (required), Payload Type (dropdown: hex or text, default hex); convert text to hex before sending to API
- [x] 7.9 Create application delete confirmation dialog
- [x] 7.10 Create application detail dialog
- [x] 7.11 Implement CSV export for application list

## 8. Network Management Page

- [x] 8.1 Create NetworkPage component with toolbar and table
- [x] 8.2 Display columns: Code, Name, Unit, Protocol, Created
- [x] 8.3 Implement unit filter: admin/manager see all (including public networks); normal users must select a unit
- [x] 8.4 Create network add dialog: Code (required, pattern `[A-Za-z0-9][A-Za-z0-9-_]*`, lowercase-transformed), Unit (dropdown; admin/manager can leave empty for public network; normal users must select), Host URI (required, validate scheme: amqp/amqps/mqtt/mqtts), Name, TTL (ms, AMQP only, non-negative integer), Queue Length (AMQP only, non-negative integer), Info (JSON)
- [x] 8.5 Display one-time password on create success: masked by default (dots), eye icon toggle, copy-to-clipboard button
- [x] 8.6 Create network edit dialog: Host URI (validate scheme), Name, TTL (AMQP only), Queue Length (AMQP only), Password (required when changing Host URI), Info (JSON)
- [x] 8.7 Create queue stats dialog: dldata queue with consumers, message count, publish rate, delivery rate; auto-refresh every second via timer; timer starts on dialog open, stops on close
- [x] 8.8 Create send uplink data dialog: Device (required, dropdown showing network address), Payload (required), Payload Type (dropdown: hex or text, default hex); convert text to hex before sending to API
- [x] 8.9 Create network delete confirmation dialog
- [x] 8.10 Create network detail dialog
- [x] 8.11 Implement CSV export for network list

## 9. Device Management Page

- [x] 9.1 Create DevicePage component with toolbar and table
- [x] 9.2 Display columns: Network, Address, Name, Profile, Created
- [x] 9.3 Implement unit filter (admin/manager see all; normal users must select a unit) and search by name
- [x] 9.4 Create device add dialog: Unit (required, dropdown), Network (required, dropdown filtered by unit), Network Address (required), Profile, Name, Info (JSON)
- [x] 9.5 Create device edit dialog: Network, Network Address, Profile, Name, Info (JSON)
- [x] 9.6 Create device delete confirmation dialog with cascade warning (routes, buffers)
- [x] 9.7 Create device detail dialog
- [x] 9.8 Implement CSV export for device list

## 10. Device Route Management Page

- [x] 10.1 Create DeviceRoutePage component with toolbar and table
- [x] 10.2 Display columns: Application Code, Network Code, Network Address, Created
- [x] 10.3 Implement unit filter (admin/manager see all; normal users must select a unit)
- [x] 10.4 Create device route add dialog: Unit (dropdown), Application (required, dropdown filtered by unit), Device (required, dropdown filtered by unit)
- [x] 10.5 Create device route delete confirmation dialog (no edit — immutable)
- [x] 10.6 Create device route detail dialog
- [x] 10.7 Implement CSV export for device route list

## 11. Network Route Management Page

- [x] 11.1 Create NetworkRoutePage component with toolbar and table
- [x] 11.2 Display columns: Application Code, Network Code, Created
- [x] 11.3 Implement unit filter (admin/manager see all; normal users must select a unit)
- [x] 11.4 Create network route add dialog: Unit (dropdown), Application (required, dropdown filtered by unit), Network (required, dropdown filtered by unit)
- [x] 11.5 Create network route delete confirmation dialog (no edit — immutable)
- [x] 11.6 Create network route detail dialog
- [x] 11.7 Implement CSV export for network route list

## 12. DL Data Buffer Management Page

- [x] 12.1 Create DlDataBufferPage component with toolbar and table
- [x] 12.2 Display columns: Application Code, Device (Network Address), Created, Expired
- [x] 12.3 Implement unit filter (admin/manager see all; normal users must select a unit)
- [x] 12.4 Create buffer delete confirmation dialog (no add/edit — read-only entries)
- [x] 12.5 Create buffer detail dialog
- [x] 12.6 Implement CSV export for buffer list

## 13. Internationalization

- [x] 13.1 Create `src/i18n/en-US.js` with all English translations (page titles, column headers, form labels, buttons, messages)
- [x] 13.2 Create `src/i18n/zh-TW.js` with all Traditional Chinese translations (reference: simple-ui zh-tw.json)
- [x] 13.3 Create `src/i18n/index.js` to export locale messages
- [x] 13.4 Merge core plugin i18n messages into shell's i18n system
- [x] 13.5 Use `$t()` for all UI text in all components

## 14. Testing

- [x] 14.1 Write unit tests for API helper functions
- [x] 14.2 Write unit tests for plugin registration (menu items, routes)
- [ ] 14.3 Write unit tests for CSV export utility
- [x] 14.4 Write unit tests for form validation logic (code pattern, Host URI scheme, TTL/Queue Length, JSON object)
- [x] 14.5 Write E2E tests for User management page (list, add, edit, delete) — 7/7 pass
- [x] 14.6 Write E2E tests for Client management page — 7/7 pass
- [x] 14.7 Write E2E tests for Unit management page — 7/7 pass
- [x] 14.8 Write E2E tests for Application management page — 7/7 pass (AMQP only)
- [x] 14.9 Write E2E tests for Network management page — 7/7 pass (MQTT via EMQX)
- [x] 14.10 Write E2E tests for Device management page — 6/6 pass
- [x] 14.11 Write E2E tests for Device Route management page — 6/6 pass
- [x] 14.12 Write E2E tests for Network Route management page — 5/5 pass
- [x] 14.13 Write E2E tests for DL Data Buffer management page — 4/4 pass
- [x] 14.14 Verify ESLint passes with no errors
- [x] 14.15 Verify production build succeeds

## 15. Shell Bug Fixes (discovered during core plugin development)

- [x] 15.0 Fix OAuth2 callback to remove query parameters (`?code=&state=`) from URL after token exchange via `window.history.replaceState`
- [x] 15.1 Fix auth-store `init()` to check token expiry and attempt refresh before calling tokeninfo (overnight session restore)
- [x] 15.2 Add role-based menu item filtering in plugin-store (`hasRole()` function checks `authStore.user.roles`)
- [x] 15.3 Add `meta.roles` route guard in `router/index.js` to redirect unauthorized users to home page
- [x] 15.4 Add `roles` to core plugin menu items (User: admin/manager, Client: admin/dev) and `meta.roles` to routes

## 16. Client Page Enhancements

- [x] 16.0 Add admin-only user autocomplete field to add dialog (debounce 500ms, user list API with `contains`, limit 10)
- [x] 16.1 Fix `userId` placement: sent inside `data` object (not root level) in POST client request
- [x] 16.2 Add read-only user account field in edit dialog (admin only, resolved via user API)
- [x] 16.3 Add read-only user account field in detail dialog (admin only, resolved via user API)
- [x] 16.4 Add masked client secret with visibility toggle and copy button in detail dialog (private clients only)
- [x] 16.5 Update delete confirmation to show `Name (ID)` format instead of just ID

## 17. Unit Page Enhancements

- [x] 17.0 Replace Owner text input with user autocomplete select in add/edit dialogs (debounce 500ms, user list API with `contains`, limit 10)
- [x] 17.1 Show resolved owner account name in detail dialog (via user API)
- [x] 17.2 Owner column only visible for admin/manager roles in table
- [x] 17.3 Resolve ownerId to account name in table display (with caching to avoid duplicate API calls)

## 18. Application/Network Edit Password Field

- [x] 18.0 Make Password field always visible in Application edit dialog (remove `v-if="hostUriChanged"`)
- [x] 18.1 Make Password field always visible in Network edit dialog (remove `v-if="hostUriChanged"`)
- [x] 18.2 Password is optional: if empty on submit, exclude from PATCH API body
- [x] 18.3 Password is required when Host URI is changed: add conditional validation rule `hostUriChanged ? [ruleRequired] : []`

## 19. Unit Filter for All Roles

- [x] 19.0 Show unit filter dropdown for all roles on Application, Network, Device, Device Route, Network Route, DL Data Buffer pages (remove `v-if="isAdminOrManager"`)
- [x] 19.1 Admin/manager: show "All Units" as first option (value: null), default selected
- [x] 19.2 Normal users (dev/service/user): auto-select first unit, pre-set `filterParams.unit` before initial fetch

## 20. Stats Dialog Timer Cleanup

- [x] 20.0 Fix Application stats dialog: use `@hide` event instead of `@keyup.escape` to stop timer on any dialog close method (Escape, click outside, programmatic)
- [x] 20.1 Fix Network stats dialog: same `@hide` event fix

## 21. Add Dialog Unit Pre-fill

- [x] 21.0 Pre-fill unit field in add dialog from toolbar selection for Application, Network, Device, Device Route, Network Route pages
- [x] 21.1 For Device, Device Route, Network Route: also trigger `onAddUnitChange` to load dependent dropdowns

## 22. Send Data Hex Validation

- [x] 22.0 Add `validateHexPayload` to `utils/validate.js`: check hex characters (0-9, A-F, a-f) and even length
- [x] 22.1 Add hex validation i18n messages (en-US and zh-TW)
- [x] 22.2 Apply hex validation to Application send downlink dialog (only when payloadType is hex)
- [x] 22.3 Apply hex validation to Network send uplink dialog (only when payloadType is hex)
- [x] 22.4 Payload is optional (can be empty, no ruleRequired)

## 23. Device Route Dialog Fix

- [x] 23.0 Fix device field label in add dialog: `core.device.name` → `core.menu.device`

## 24. UI Consistency

- [x] 24.0 Unify action button order across all 9 pages: from left to right — delete, edit, info; extra buttons (send, stats) continue further left
- [x] 24.1 Fix axios vulnerability (upgrade to 1.13.5 via `npm audit fix`)
- [x] 24.2 Add `*.pid` to `.gitignore`

## 25. Final Review

- [x] 25.1 Verify all spec requirements are implemented
- [x] 25.2 Run full test suite (unit + E2E) — 56/56 E2E chromium pass
- [x] 25.3 Test both en-US and zh-TW translations on all pages
- [x] 25.4 Test responsive layout on different screen sizes
- [x] 25.5 Test role-based visibility (admin, manager, dev, normal user)
- [x] 25.6 Prepare for OpenSpec archive
