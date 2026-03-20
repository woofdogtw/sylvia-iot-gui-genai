## 1. WwanPage.vue — Bug fixes

- [x] 1.1 Fix disconnect visibility: change `v-if="status.connected"` on `q-card-actions` (line 52) to `v-if="status.ssid"`
- [x] 1.2 Fix AP list row key: change `row-key="ssid"` to `row-key="index"` on `q-table` to prevent duplicate rendering when multiple rows have empty SSID
- [x] 1.3 Fix Enter-to-submit: add `@keyup.enter="isPwFormValid && onPasswordConfirm()"` to the password `q-input`
- [x] 1.4 Remove `status.connected` from the `status` ref initialiser and from `pollStatus()` (no longer needed as visibility condition)

## 2. WwanPage.vue — Connected AP pinned to top

- [x] 2.1 After assigning `apList.value` in `pollApList()`, sort the array so the entry matching `status.value.ssid` appears first (when SSID is non-empty)
- [x] 2.2 In the Connect button cell template, add `v-if="props.row.ssid !== status.ssid"` to hide the button for the connected AP

## 3. SystemClockWidget.vue — Fallback to local time

- [x] 3.1 In the `catch` block of `fetchAndSchedule()`, replace `visible.value = false` with: format from `Date.now()`, set `visible.value = true`, and schedule next fetch after 60000ms

## 4. Verification

- [x] 4.1 Run `npm run lint` — no errors
- [x] 4.2 Run `npm run test` — all unit tests pass (119/119)
