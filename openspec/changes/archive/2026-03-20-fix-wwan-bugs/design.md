## Context

The WWAN page in mfe-router has several defects discovered during real-device testing: the AP list accumulates stale entries across polls, the disconnect section is gated on `conn4.address` instead of SSID presence, the password dialog ignores the Enter key, and the connected AP is not visually distinguished in the list. The system clock widget also hides permanently on first API failure rather than gracefully degrading to local time.

All changes are confined to the mfe-router package (Vue 3 SFC + Quasar). No new dependencies or API contracts are introduced.

## Goals / Non-Goals

**Goals**
- Fix AP list duplication by replacing the list on each poll rather than appending
- Fix disconnect section visibility to depend on SSID presence
- Add Enter-key submit to the password dialog when validation passes
- Pin the connected AP to the top of the list and hide its Connect button
- Make the system clock fall back to local time on API failure and recover automatically

**Non-Goals**
- Changes to the sylvia-router backend API
- Changes to any package other than mfe-router
- Altering the Service Info widget (hide-on-failure behaviour is intentional)

## Decisions

### AP list replacement vs. append
Replace the reactive list array with a fresh array on each poll response (`list.value = newItems`) rather than pushing into the existing array. This is the minimal fix and avoids any need for deduplication logic.

### Disconnect visibility condition
Change the v-if condition from `conn4.address` to `wwan.conf?.ssid` (or equivalent non-empty SSID field from the status response). The SSID being present is the authoritative signal that the device is associated, regardless of whether IP negotiation has completed.

### Connected AP pinning
After receiving the list response, sort the array so the entry whose SSID matches the current connected SSID appears first. Apply `v-if="row.ssid !== connectedSsid"` (or equivalent) to the Connect button column cell to hide it for the connected row.

### Enter-key submit in password dialog
Attach a `@keyup.enter` handler on the password `q-input` that calls the same submit function used by the Connect button, guarded by the same validation check (password non-empty).

### System clock fallback
When the `GET /router/api/v1/sys/time` call fails, use `new Date()` for display instead of hiding. The smart-sleep polling loop continues unchanged; on the next successful response the backend time is used again. No additional state is needed — the existing time ref is simply set from local time on error.

## Risks / Trade-offs

- **SSID match for pinning is case-sensitive**: sylvia-router SSIDs are case-sensitive, so exact string match is correct. If the backend ever normalises casing this may need revisiting.
- **Local clock drift**: Falling back to local time means the displayed time may differ from the router's actual time. This is acceptable as a degraded-mode display; the widget label does not claim to show router time when offline.

## Open Questions

_(none)_
