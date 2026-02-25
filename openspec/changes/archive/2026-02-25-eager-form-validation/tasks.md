# Implementation Tasks: Eager Form Validation

## 1. mfe-core pages

For each page below: add `nextTick` to imports, add `isXxxFormValid = ref(false)`, add `onXxxDialogShow` function, add `watch(xxxForm, ...)`, add `@show="onXxxDialogShow"` to the q-dialog, add `:disable="!isXxxFormValid"` to the confirm button.

- [x] 1.1 Update `packages/mfe-core/src/pages/UserPage.vue`: add dialog (`isAddFormValid`, watch `addForm`)
- [x] 1.2 Update `packages/mfe-core/src/pages/ClientPage.vue`: add dialog (`isAddFormValid`, watch `addForm`)
- [x] 1.3 Update `packages/mfe-core/src/pages/UnitPage.vue`: add dialog (`isAddFormValid`, watch `addForm`)
- [x] 1.4 Update `packages/mfe-core/src/pages/ApplicationPage.vue`: add dialog (`isAddFormValid`, watch `addForm`), edit dialog (`isEditFormValid`, watch `editForm`), send dialog (`isSendFormValid`, watch `sendForm`)
- [x] 1.5 Update `packages/mfe-core/src/pages/NetworkPage.vue`: add dialog (`isAddFormValid`, watch `addForm`), edit dialog (`isEditFormValid`, watch `editForm`), send dialog (`isSendFormValid`, watch `sendForm`)
- [x] 1.6 Update `packages/mfe-core/src/pages/DevicePage.vue`: add dialog (`isAddFormValid`, watch `addForm`)
- [x] 1.7 Update `packages/mfe-core/src/pages/DeviceRoutePage.vue`: add dialog (`isAddFormValid`, watch `addForm`)
- [x] 1.8 Update `packages/mfe-core/src/pages/NetworkRoutePage.vue`: add dialog (`isAddFormValid`, watch `addForm`)

## 2. mfe-router pages

- [x] 2.1 Update `packages/mfe-router/src/pages/WanPage.vue`: edit dialog (`isEditFormValid`, watch `editForm`)
- [x] 2.2 Update `packages/mfe-router/src/pages/WwanPage.vue`: password dialog (`isPwFormValid`, watch `connectPassword`)

## 3. Verification

- [x] 3.1 Run ESLint (`npm run lint`) and confirm no errors
- [x] 3.2 Run unit tests (`npm run test`) and confirm all 119 tests pass
- [x] 3.3 Manual browser verification: open any add dialog → required-field errors visible immediately, OK button disabled; fill all fields → OK button enables
- [x] 3.4 Manual browser verification: open an edit dialog with pre-populated data → OK button enabled immediately
- [x] 3.5 Manual browser verification (requires sylvia-router): open WAN edit dialog and WWAN password dialog; verify button disable/enable behavior
