## 1. Build-time version injection

- [x] 1.1 In `packages/shell/quasar.config.js`, import `readFileSync` from `node:fs`, read `package.json`, and add `build.env` with `VITE_APP_NAME` (from `productName || name`) and `VITE_APP_VERSION` (from `version`)

## 2. Route and navigation

- [x] 2.1 Add route `{ path: 'about', name: 'about', meta: { requiresAuth: true }, component: () => import('pages/AboutPage.vue') }` to the `root` children in `packages/shell/src/router/routes.js`
- [x] 2.2 Add "About" `q-item` (icon: `info`, route: `{ name: 'about' }`) to `MainLayout.vue` after the "Home" item and before the first `q-separator`

## 3. AboutPage component

- [x] 3.1 Create `packages/shell/src/pages/AboutPage.vue` with a `q-page` layout
- [x] 3.2 Display frontend name (`import.meta.env.VITE_APP_NAME`) and version (`import.meta.env.VITE_APP_VERSION`) in the page
- [x] 3.3 On `onMounted`, derive coremgr origin from `window.config?.coremgr?.baseUrl` using `new URL(...).origin`, then call `api.get(\`\${origin}/version\`)` using the shared `api` from `@sylvia-iot/shared`
- [x] 3.4 Display the core service `name` and `version` from `res.data?.data`; hide the service section silently if the fetch fails or data is missing

## 4. Internationalization

- [x] 4.1 Add `about` section to `packages/shell/src/i18n/en-US.js`: keys `title` ("About"), `frontend` ("Frontend"), `service` ("Service"), `name` ("Name"), `version` ("Version")
- [x] 4.2 Add corresponding `about` section to `packages/shell/src/i18n/zh-TW.js`
- [x] 4.3 Use `t('about.*')` keys for all static labels in `AboutPage.vue`
- [x] 4.4 Add `about` to the menu i18n key in both locale files: `menu.about` ("About" / "關於")

## 5. Testing

- [x] 5.1 Add E2E test in `packages/shell/e2e/` verifying "About" appears in the hamburger menu and navigates to the About page
- [x] 5.2 Add E2E test verifying the About page displays the frontend name and version strings
- [x] 5.3 Add E2E test verifying the About page displays the core service name and version (fetched from the live backend)
- [x] 5.4 Run `npm test` (unit) and `npm run test:e2e` (E2E against sylvia-iot-core) and confirm all pass
- [x] 5.5 Run `npm run lint` and fix any issues
