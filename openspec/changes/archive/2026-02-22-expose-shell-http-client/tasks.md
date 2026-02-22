## 1. Implementation

- [x] 1.1 In `packages/shell/src/boot/axios.js`, add `window.sylviaShell = { httpClient: api }` after both interceptors are registered

## 2. Documentation

- [x] 2.1 Add "External Plugin Development" section to root `README.md` documenting `window.sylviaShell.httpClient` with a usage example

## 3. Tests

- [x] 3.1 Add unit test to `packages/shell/src/__tests__/boot/axios.test.js` verifying `window.sylviaShell.httpClient` is set after the boot function runs

## 4. Verify & Stage

- [x] 4.1 Run `npm run lint` — must be clean
- [x] 4.2 Run unit tests — all 118+ must pass
- [x] 4.3 `git add` all modified files
