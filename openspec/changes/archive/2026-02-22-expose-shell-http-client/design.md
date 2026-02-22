## Context

The shell already has a shared axios instance (`api`) defined in `packages/shared/src/api/http.js`. The shell's boot file (`packages/shell/src/boot/axios.js`) attaches two interceptors to this instance:

1. **Request interceptor** — injects `Authorization: Bearer <access_token>` from Pinia auth store.
2. **Response interceptor** — on 401, calls `authStore.refreshAccessToken()`, updates the token, and retries the original request once. If refresh fails, redirects to the welcome/login page.

Internal plugins (mfe-core, mfe-data, mfe-router) import `api` directly from `@sylvia-iot/shared` and inherit these interceptors automatically. External plugins loaded from arbitrary URLs cannot import from private monorepo packages, so they currently have no access to this pre-configured client.

## Goals / Non-Goals

**Goals:**
- Expose the configured `api` axios instance on `window.sylviaShell.httpClient` after interceptors are attached.
- Document the API in README so external plugin developers know how to use it.

**Non-Goals:**
- Adding any other utilities to `window.sylviaShell` (future scope, separate change).
- Supporting multiple isolated HTTP clients per plugin.
- Changing how internal (monorepo) plugins access the shared instance.

## Decisions

### Decision: Expose via `window.sylviaShell` namespace

**Chosen:** A `window.sylviaShell` object acts as the shell's public SDK namespace. The first property is `httpClient`.

**Alternatives considered:**
- `window.sylviaHttpClient` (flat) — no namespace, collides more easily with other globals.
- Pass client through plugin `init(context)` callback — requires changing the plugin interface and boot sequence; adds complexity for a small gain.
- Re-export via CDN-hosted `@sylvia-iot/shared` build — complex build/versioning problem; overkill for a single instance reference.

`window.sylviaShell` is chosen because it is discoverable, namespaced, and easy to extend later without breaking changes.

### Decision: Assign after interceptors, inside the boot function

The assignment `window.sylviaShell = { httpClient: api }` is placed at the end of the `boot/axios.js` boot function, after both interceptors are registered. This guarantees external plugins that access `window.sylviaShell.httpClient` always receive the fully-configured instance.

External plugins are loaded in `boot/plugins.js`, which runs after `boot/axios.js` (Quasar boot files execute in declaration order). No timing issues arise.

## Risks / Trade-offs

- **Global namespace pollution** → Mitigated by using a single `sylviaShell` namespace; unlikely to conflict with other libraries.
- **Plugins bypassing auth** → External plugins could still create their own raw axios instance. `window.sylviaShell.httpClient` is a convenience, not a security boundary; the backend enforces auth.
- **Axios version mismatch** → If an external plugin bundles its own axios, it gets a different instance. Documenting that plugins should use `window.sylviaShell.httpClient` and not bundle axios avoids this.
