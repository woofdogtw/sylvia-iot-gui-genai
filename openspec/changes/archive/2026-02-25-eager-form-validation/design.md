## Context

All dialog forms in mfe-core and mfe-router currently use Quasar `q-form` with `greedy` validation. Validation is triggered only when `formRef.value.validate()` is called inside the submit handler, so the confirm button is always enabled and errors only appear after the user clicks OK. The change adds eager validation (run on dialog open) and a reactive disabled state on the confirm button.

## Goals / Non-Goals

**Goals:**
- Show validation errors immediately when a dialog opens (without any user interaction)
- Disable the confirm/save/connect button when the form is invalid
- Re-enable the button in real-time as the user fills in fields correctly

**Non-Goals:**
- Inline page forms (LanPage, WlanPage) — not dialogs, different UX context
- Edit dialogs with no required fields (UserPage, ClientPage, UnitPage, DevicePage edit) — always valid, button already always enabled
- No new composable or shared utility — inlined per file to keep changes self-contained

## Decisions

**D1: Validity tracking — `ref` + `watch` + `@show` handler**

Each form dialog gets:
- `const isXxxFormValid = ref(false)` — tracks form validity
- `async function onXxxDialogShow() { await nextTick(); isXxxFormValid.value = await xxxFormRef.value?.validate() ?? false }` — triggers initial validation when dialog opens
- `watch(xxxForm, async () => { if (!xxxFormRef.value) return; await nextTick(); isXxxFormValid.value = await xxxFormRef.value.validate() ?? false }, { deep: true })` — re-validates on every field change

The `await nextTick()` in both places ensures the DOM has updated before `validate()` runs (critical for WanPage where fields are conditionally rendered via `v-if`).

The `@validation-success` / `@validation-error` events on `q-form` were considered but NOT used — they only fire when `validate()` is called explicitly, and don't update when fields change via user input. The `watch` approach triggers full form re-validation on every change, which is more reliable.

**D2: Keep existing validate() check in submit handlers**

The submit functions already call `await formRef.value?.validate(); if (!valid) return`. These are kept as a safety net (e.g., keyboard shortcuts bypassing the disabled button). No behavior change when the form is valid.

**D3: WanPage — conditional fields handled by nextTick**

WanPage edit dialog has CIDR/IPv4/DNS fields inside `v-if` blocks. When type changes from `static` to `dhcp`, those fields disappear from the DOM. Using `await nextTick()` before `validate()` ensures removed fields are no longer registered with the form, so the form correctly becomes valid.

## Risks / Trade-offs

- [Verbosity] Each dialog adds ~8 lines of boilerplate. 14 dialogs across 10 files → ~80 lines added. Acceptable given no shared utility is needed and each file stays self-contained.
- [Eager errors on add dialogs] When opening an add dialog, all required fields are empty, so all required-field errors are shown immediately. This is intentional per the requirement but may feel aggressive to some users.
- [watch + validate() on every keystroke] Calling `formRef.value.validate()` on every form value change runs all rules synchronously. For the small forms in this project this has no measurable performance impact.
