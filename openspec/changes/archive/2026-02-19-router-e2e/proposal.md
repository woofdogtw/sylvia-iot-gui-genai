# Proposal: router-e2e

## Summary

Add backend-integrated E2E tests for the router plugin's header widgets and network API pages,
and fix any bugs discovered when running those tests against a real `sylvia-router` backend.

## Background

The `add-router-plugin` implementation (archived 2026-02-16) introduced:
- Two header widgets: **ServiceInfoWidget** (version) and **SystemClockWidget** (time)
- Five pages: Dashboard, WAN, LAN, WLAN, WWAN

The existing `packages/shell/e2e/router.spec.js` tests page navigation and UI structure, but
were never run against a real `sylvia-router` backend (environment was missing).

Manual testing with a real `sylvia-router` instance showed that **both header widgets did not
appear**. The root cause has not been identified yet — candidates include wrong API response
format, auth token timing, or URL construction issues.

## Scope

1. **Targeted widget E2E tests** — assert that both header widgets are visible in the toolbar
   after login, using a real `sylvia-router` backend.
2. **Dashboard system-usage E2E tests** — assert that the Dashboard page displays non-zero CPU,
   memory, and disk data fetched from `GET /router/api/v1/sys/usage`. CPU, memory, and disk are
   present on all machines, so assertions are unconditional.
3. **WAN/LAN GET API E2E tests** — assert that the WAN and LAN pages render content (or handle
   empty/error responses gracefully) from the real backend. WWAN/WLAN and all PUT APIs are
   out of scope for this proposal.
4. **Bug investigation and fixes** — run the new tests, inspect failures, and patch the root
   cause of widget non-display.

## Out of Scope

- WWAN/WLAN pages (require physical wireless interfaces)
- All PUT/edit API flows
- GitHub CI integration (separate proposal)

## Approach

- Start `sylvia-router` with the `skills/sylvia-router start` skill.
- Add new tests inside `e2e/router.spec.js` using the same CSS-class locator style as the rest
  of the project (`.q-toolbar div.text-center`, text matching — no `data-testid`).
- After observing failures, trace through browser DevTools / Playwright traces and fix the
  relevant widget/API code.

## Risks

- Network interface availability affects WAN/LAN responses; tests must tolerate 404 (interface
  not found) as a valid success (page shows "not supported" or empty state).
- The `sylvia-router` binary must be running before Playwright launches; test setup note in
  README or skill docs.
