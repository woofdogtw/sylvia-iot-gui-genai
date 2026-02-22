## Why

External plugins loaded via `window.config.plugins` need to make authenticated API calls, but the shell's shared axios instance (with Bearer token injection and 401 auto-retry) is only accessible to internal monorepo packages via `@sylvia-iot/shared`. Third-party plugin developers have no clean way to get an HTTP client that handles token refresh automatically.

## What Changes

- The shell exposes `window.sylviaShell.httpClient` — the shared axios instance after all auth interceptors are applied — so external plugins can make authenticated requests without duplicating token-refresh logic.
- The root `README.md` is updated with a section documenting how external plugin developers use `window.sylviaShell.httpClient`.

## Capabilities

### New Capabilities

- `external-plugin-api`: A `window.sylviaShell` global object that the shell populates at boot time, providing external plugins with a pre-configured HTTP client (Bearer auth header + 401 auto-retry with token refresh).

### Modified Capabilities

_(none — no existing spec requirements are changing)_

## Impact

- `packages/shell/src/boot/axios.js`: one line added to assign `window.sylviaShell = { httpClient: api }` after interceptors are set up.
- `README.md` (root): new "External Plugin Development" section.
- No breaking changes; no new dependencies.
