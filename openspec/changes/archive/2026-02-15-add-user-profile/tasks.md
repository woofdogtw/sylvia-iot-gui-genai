# Implementation Tasks: User Profile Dialog

## 1. Shell Changes

- [x] 1.1 Add "Profile" menu item to user dropdown in `MainLayout.vue` (icon: `account_circle`, i18n key: `auth.profile`)
- [x] 1.2 Add profile dialog template with fields: Account (read-only), Name, Password, Info (JSON textarea with autogrow)
- [x] 1.3 Add dialog open/close logic with Enter → save, Escape → cancel
- [x] 1.4 Add form validation: JSON object validation for Info field
- [x] 1.5 Add save logic: call coremgr `PATCH /api/v1/user/{userId}` with changed fields (skip empty password, empty info → `{}`)
- [x] 1.6 After successful save, call `authStore.fetchTokenInfo()` to refresh header display name
- [x] 1.7 Show success notification on save, error notification on failure

## 2. i18n

- [x] 2.1 Add en-US translations: `auth.profile` ("Profile"), `auth.profileSaved` ("Profile updated"), field labels
- [x] 2.2 Add zh-TW translations: `auth.profile` ("個人資料"), `auth.profileSaved` ("個人資料已更新"), field labels

## 3. Testing

- [x] 3.1 Write E2E test: open profile dialog, verify account is read-only, update name, verify header reflects change
- [x] 3.2 Verify ESLint passes
- [x] 3.3 Verify production build succeeds
