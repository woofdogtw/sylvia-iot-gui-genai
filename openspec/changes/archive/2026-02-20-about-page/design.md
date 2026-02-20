# Design: About Page

## Context

The shell currently has no way to surface version information. Operators and developers must inspect deployment artifacts or backend logs to know which versions are running. The About page is a shell-level concern because it aggregates information from both the frontend itself and the backend services configured in `public/js/config.js`.

Relevant existing patterns:
- `packages/mfe-router/src/api/index.js` — `versionApi.get()` fetches `GET {routerOrigin}/version`, deriving the origin from `window.config.router.baseUrl`
- `packages/mfe-router/src/components/ServiceInfoWidget.vue` — displays `name` + `version` from the response `data.data` object, handles fetch failure gracefully
- `packages/shell/src/router/routes.js` — defines shell-level routes (home, settings) as children of the `root` layout route
- `packages/shell/src/layouts/MainLayout.vue` — hamburger menu renders Home, separator, plugin categories, separator, Settings

## Goals / Non-Goals

**Goals:**
- Display frontend name and version (from `package.json`, injected at build time)
- Display core service name and version (fetched from `GET /version` at the coremgr server origin)
- Provide i18n labels for all About page text (en-US + zh-TW)
- Add "About" entry to the hamburger menu, positioned after "Home"

**Non-Goals:**
- Showing versions of the router service or other future services (not in scope now; can be extended later)
- Displaying detailed dependency/package versions
- Refreshing version data automatically (on-mount fetch is sufficient)
- Admin-only access control (the About page is visible to all authenticated users)

## Decisions

### 1. Frontend version: `quasar.config.js` build-time env injection

**Decision**: Read `name`/`productName` and `version` from `packages/shell/package.json` in `quasar.config.js` using Node `readFileSync`, then expose via `build.env` as `VITE_APP_NAME` and `VITE_APP_VERSION`. Accessed in the component via `import.meta.env.VITE_APP_NAME` / `import.meta.env.VITE_APP_VERSION`.

**Rationale**: This is the idiomatic Vite/Quasar approach. The values are baked into the bundle at build time — no runtime overhead and no separate fetch. Vite replaces `import.meta.env.*` with literal strings at compile time.

**Alternative considered**: Runtime fetch of `/package.json` — rejected because it adds a network round-trip and requires serving the file, and the version is fixed at build time anyway.

### 2. Core service version endpoint: derive origin from `window.config.coremgr.baseUrl`

**Decision**: The `/version` endpoint for the core server lives at the origin of the coremgr base URL (e.g. `http://localhost:8080/coremgr` → origin `http://localhost:8080`, call `GET http://localhost:8080/version`). Use `api.get()` from `@sylvia-iot/shared` with the constructed URL. The same URL-derivation pattern used by `mfe-router/src/api/index.js`.

**Rationale**: Mirrors the already-established `routerOrigin()` pattern. Consistent across both services. The `/version` endpoint is public (no auth required) but using the shared `api` instance is harmless and keeps code uniform.

**Alternative considered**: Using `fetch()` directly to avoid the auth interceptor — not needed because the interceptor adds `Authorization` but `/version` simply ignores extra headers; it doesn't block unauthenticated calls.

### 3. About page is a shell-level route, not a plugin

**Decision**: `AboutPage.vue` lives in `packages/shell/src/pages/`. The route `/about` (name `about`) is added to `packages/shell/src/router/routes.js` as a child of the `root` layout route with `meta.requiresAuth: true`. The menu item is added directly in `MainLayout.vue`.

**Rationale**: The About page aggregates shell-level information (frontend version, configured service endpoints). Making it a plugin would add unnecessary indirection and bypass the shell's built-in i18n and layout.

### 4. Menu placement: after Home, before plugin categories

**Decision**: Insert the "About" `q-item` after the "Home" item, within the same separator group (before the plugin category `q-separator`).

**Rationale**: About is a global, fixed item like Home and Settings. Placing it near Home groups the two non-category shell pages together. Settings remains last as a conventional bottom-of-menu item.

## Risks / Trade-offs

- **`/version` returns `{ data: { name, version } }` — assumed shape**: If the coremgr `/version` response differs from the router's shape, the about page shows nothing. Mitigation: guard with optional chaining (`res.data?.data?.name`); fail silently.
- **Build env values are static strings**: Changing the version in `package.json` requires a rebuild. This is expected and desirable — About always reflects the actual deployed build.

## Migration Plan

No migration needed. Adding a route and menu item is non-breaking. The build-time env addition is additive to `quasar.config.js`.

## Open Questions

_(none)_
