## 1. Validation Utility

- [x] 1.1 Create `packages/mfe-router/src/utils/validate.js` with exported functions: `isValidIPv4`, `isValidCIDR`, `isNonEmpty`, `isMinLength`, `isMaxLength`, `isIntegerInRange`, `isIPInRange`, `isIPNotGreaterThan`
- [x] 1.2 Add i18n keys for validation messages to `packages/mfe-router/src/i18n/en-US.js`: `router.validate.invalidIp`, `router.validate.invalidCidr`, `router.validate.required`, `router.validate.minLength`, `router.validate.maxLength`, `router.validate.outOfRange`, `router.validate.dhcpStartAfterEnd`, `router.validate.ipInDhcpRange`
- [x] 1.3 Add corresponding i18n keys to `packages/mfe-router/src/i18n/zh-TW.js` (Traditional Chinese translations)
- [x] 1.4 Write unit tests for all exported validators in `packages/mfe-router/src/utils/validate.test.js` covering valid inputs, invalid inputs, and edge cases (octet boundary values, prefix 0/32, start == end, IP on range boundary)

## 2. WAN Page Validation

- [x] 2.1 Import `isValidCIDR`, `isValidIPv4` from validate.js into `WanPage.vue`
- [x] 2.2 Add a `q-form` wrapper (with `ref="editFormRef"` and `greedy`) around the dialog fields
- [x] 2.3 Add `:rules` to the address `q-input` using `isValidCIDR` (only active when `type === 'ethernet'` and `type4 === 'static'`)
- [x] 2.4 Add `:rules` to the gateway `q-input` using `isValidIPv4` (same condition)
- [x] 2.5 Add `:rules` to the DNS `q-input` that splits on commas and validates each trimmed entry with `isValidIPv4` (same condition)
- [x] 2.6 Update `submitEdit` to call `await editFormRef.value.validate()` and return early if `false`

## 3. LAN Page Validation

- [x] 3.1 Import `isValidCIDR`, `isValidIPv4`, `isIPInRange`, `isIPNotGreaterThan`, `isIntegerInRange` from validate.js into `LanPage.vue`
- [x] 3.2 Ensure the existing `q-form` has `ref="formRef"` and `greedy` prop (already has formRef; confirm greedy is set)
- [x] 3.3 Add `:rules` to the address `q-input` using `isValidCIDR`
- [x] 3.4 Add `:rules` to the dhcpStart `q-input` using `isValidIPv4` and a cross-field rule that checks `isIPNotGreaterThan(dhcpStart, dhcpEnd)`
- [x] 3.5 Add `:rules` to the dhcpEnd `q-input` using `isValidIPv4`
- [x] 3.6 Add `:rules` to the leaseTime `q-input` using `isIntegerInRange(60, 604800)`
- [x] 3.7 Add a cross-field rule on the address field (or dhcpStart) that checks the host IP (extracted from CIDR) is NOT inside the dhcpStart–dhcpEnd range using `isIPInRange`
- [x] 3.8 Update `submitLan` to call `await formRef.value.validate()` and return early if `false`

## 4. WLAN Page Updates

- [x] 4.1 Add i18n keys for WLAN show/hide password to en-US.js and zh-TW.js: `router.wlan.showPassword`, `router.wlan.hidePassword`
- [x] 4.2 Add `showPassword` ref to `WlanPage.vue`; bind the password `q-input` `:type` to `showPassword ? 'text' : 'password'`; add a show/hide toggle button next to the password field
- [x] 4.3 Wrap the card in a `q-form` (ref `formRef`, greedy); import `isNonEmpty`, `isMinLength`, `isMaxLength` from validate.js; add `:rules` for SSID (`isNonEmpty`, active when enabled) and password (`isMinLength(8)` + `isMaxLength(63)`, active when enabled)
- [x] 4.4 Update `submitConfig` to call `await formRef.value.validate()` and return early if `false`

## 5. WWAN Page Redesign

- [x] 5.1 Add i18n keys for new WWAN UI labels to en-US.js and zh-TW.js: `router.wwan.currentStatus`, `router.wwan.hostIp`, `router.wwan.gateway`, `router.wwan.dns`, `router.wwan.connect`, `router.wwan.disconnect`, `router.wwan.enterPassword`, `router.wwan.connecting`
- [x] 5.2 Rewrite `WwanPage.vue` script: remove `scanning`, `scanned`, `selectedAp`; add `pollingTimer` ref; add separate `status` reactive object (ssid, hostIp, gateway, dns, connected); keep `apList`
- [x] 5.3 Implement `pollStatus()` that calls `wwanApi.get()` and updates the `status` reactive object (ssid from `data.conf?.ssid`, hostIp from `data.conn4?.address`, gateway from `data.conn4?.gateway`, dns from `data.conn4?.dns`)
- [x] 5.4 Implement `pollApList()` that calls `wwanApi.scan()` and updates `apList`
- [x] 5.5 In `onMounted`: call both `pollStatus()` and `pollApList()` immediately, then set `pollingTimer = setInterval(() => { pollStatus(); pollApList() }, 5000)`; skip interval setup if 404 (set `supported = false`)
- [x] 5.6 Add `onUnmounted` lifecycle hook that calls `clearInterval(pollingTimer)`
- [x] 5.7 Replace the Current Status card template: remove toggle and inline form; show status fields (SSID, Host IPv4, Gateway IPv4, DNS IPv4) as a `q-list` similar to WAN card; show DISCONNECT button when `status.connected` is true
- [x] 5.8 Implement `disconnectWwan()` function that calls `wwanApi.update({ enable: true, conf: { ssid: '' } })` then immediately calls `pollStatus()`
- [x] 5.9 Replace the AP table: remove `selection` and `v-model:selected`; add a `connect` column with a `q-btn` per row; remove the Scan button section
- [x] 5.10 Add `connectTarget` ref (holds the AP row being connected to); add `showPasswordDialog` ref; add `connectPassword` ref
- [x] 5.11 Implement `onConnectClick(ap)`: if `ap.security` is 'none' or 'open', call `doConnect(ap.ssid, '')` directly; otherwise set `connectTarget = ap`, clear `connectPassword`, open `showPasswordDialog`
- [x] 5.12 Add a `q-dialog` (v-model `showPasswordDialog`) with a `q-form` (ref `pwFormRef`, greedy), a password `q-input` bound to `connectPassword` with `:rules` using `isNonEmpty`, and Confirm/Cancel buttons
- [x] 5.13 Implement `doConnect(ssid, password)`: builds body `{ enable: true, conf: { ssid } }` (adds `conf.password` only when password is non-empty), calls `wwanApi.update(body)`, shows success notification, calls `pollStatus()` immediately
- [x] 5.14 Confirm dialog Confirm button calls `await pwFormRef.value.validate()` then `doConnect(connectTarget.ssid, connectPassword)` and closes dialog on success
- [x] 5.15 Import `isNonEmpty` from validate.js for the password dialog rule

## 6. Verification

- [x] 6.1 Run `npm run lint -w packages/mfe-router` and fix any ESLint errors (mfe-router has no standalone ESLint config; shell tests confirm no regression)
- [x] 6.2 Run unit tests (`npm test -w packages/mfe-router`) and confirm all validate.js tests pass
- [x] 6.3 Start sylvia-router (`skills/sylvia-router/scripts/start.sh`) and manually verify WAN, LAN, WLAN, WWAN pages in the browser
- [x] 6.4 Confirm: WAN static fields show inline errors for invalid CIDR/IP inputs before Save
- [x] 6.5 Confirm: LAN form blocks save when host IP is inside DHCP range
- [x] 6.6 Confirm: WLAN page shows password masked by default; show/hide toggle works; save validates SSID and password length
- [x] 6.7 Confirm: WWAN page auto-refreshes AP list; CONNECT on secured AP shows password dialog; open AP connects directly; DISCONNECT appears and works when connected

## 7. Bug Fixes (found during manual verification)

- [x] 7.1 Fix `isValidCIDR` to reject trailing slash with no prefix (e.g. `192.168.1.1/` was incorrectly treated as prefix `/0`)
- [x] 7.2 Add unit test for `isValidCIDR` trailing slash case to validate.test.js
- [x] 7.3 Fix LAN and WLAN pages: add reactive watch + `isFormValid` ref so Save button is disabled in real time when any field is invalid
- [x] 7.4 Fix LAN leaseTime and WLAN password rules: factory validators (`isIntegerInRange`, `isMinLength`, `isMaxLength`) must be wrapped as `v => factory()(v, t)` in `:rules` array (Quasar only passes `val`, not `t`)
- [x] 7.5 Add WAN PPPoE username/password required validation (`isNonEmpty` rules on both fields)
- [x] 7.6 Fix WWAN page freeze: replace `setInterval` with recursive `setTimeout` (next poll only scheduled after previous completes); use `shallowRef` for `apList` to avoid deep reactive proxy on AP scan results
- [x] 7.7 Fix WWAN disconnect: API rejects `ssid: ''`; change body to `{ enable: false, conf: { ssid: <current_ssid> } }`
