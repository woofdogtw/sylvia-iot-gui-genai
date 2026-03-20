## Why

Several bugs in the WWAN configuration page degrade usability: the password dialog cannot be submitted via Enter, the Disconnect button is hidden when `conn4` is empty despite the device being connected, and the AP scan list displays duplicate entries due to stale polling data. A UX improvement is also added to surface the connected AP at the top of the list. Additionally, the system clock header widget permanently hides on first API failure instead of falling back to local time, leaving the toolbar empty for the rest of the session even when the backend recovers.

## What Changes

- **Bug fix**: Password connect dialog now submits on Enter when validation passes
- **Bug fix**: Disconnect button and IP info section are shown whenever SSID is non-empty (not gated on `conn4.address`)
- **Bug fix**: AP scan list is cleared before each poll update to prevent duplicate/stale entries
- **Feature**: Connected AP is pinned to the top of the AP list and its Connect button is hidden
- **Bug fix**: System clock widget falls back to local device time when backend is unreachable, resuming backend time once it recovers (service info widget retains hide-on-failure behaviour as version data does not change)

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `router`: WWAN page behavior changes — disconnect button visibility condition, password dialog Enter-to-submit, AP list deduplication, connected AP pinned to top; system clock falls back to local time on API failure instead of hiding permanently

## Impact

- `openspec/specs/router/spec.md`: delta updates to WWAN requirement scenarios
- Router micro-frontend plugin (WWAN page component)
