# Implementation Tasks: router-e2e

## Prerequisites
- `sylvia-router` skill available (`skills/sylvia-router/scripts/start.sh`)
- Dev server at `http://localhost:9000` (`npm run dev` in `packages/shell`)

---

## 1. Baseline Run

- [x] 1.1 Start `sylvia-router` via skill, start dev server, run existing `e2e/router.spec.js` and record failures

---

## 2. Debug & Fix Widget Non-Display

- [x] 2.1 Inspect network requests from `SystemClockWidget` (`GET /router/api/v1/sys/time`) and `ServiceInfoWidget` (`GET /router/version`) in Playwright `--headed` mode or browser DevTools
- [x] 2.2 Identify root cause (API response format mismatch, auth token not attached, URL construction error, etc.)
- [x] 2.3 Fix the root cause in widget source or shared API config
- [x] 2.4 Manually verify both widgets appear in browser header after login

---

## 3. Widget E2E Tests

- [x] 3.1 Add test to `e2e/router.spec.js`: **ServiceInfoWidget visible in toolbar** — locate `.q-toolbar div.text-center` filtered by version pattern (`/\d+\.\d+/`), assert visible within 5 s
- [x] 3.2 Add test to `e2e/router.spec.js`: **SystemClockWidget visible in toolbar** — locate `.q-toolbar div.text-center` filtered by date pattern (`/\d{4}\/\d{2}\/\d{2}/`), assert visible within 5 s

---

## 4. Dashboard E2E Test

- [x] 4.1 Add test: navigate to `/router/dashboard`, wait 2 s, assert 3 `.q-card` elements visible (CPU / memory / disk)
- [x] 4.2 Assert memory card's `.q-linear-progress` is visible (non-zero data from `GET /api/v1/sys/usage`)
- [x] 4.3 Assert disk card's `.q-linear-progress` is visible

---

## 5. WAN & LAN E2E Tests

- [x] 5.1 Add test: navigate to `/router/wan`, wait 2 s, assert title matches `/WAN Configuration|WAN 設定/`, assert no `.q-notification--negative` (tolerates empty interface list or 404)
- [x] 5.2 Add test: navigate to `/router/lan`, wait 2 s, assert title matches `/LAN Configuration|LAN 設定/`, assert no `.q-notification--negative`

---

## 6. Validation

- [x] 6.1 Run full router E2E suite (`npm run test:e2e -- --grep "Router Plugin"`) — all tests green
- [x] 6.2 Run unit tests (`npm run test:unit`) — no regressions
- [x] 6.3 Verify ESLint passes
