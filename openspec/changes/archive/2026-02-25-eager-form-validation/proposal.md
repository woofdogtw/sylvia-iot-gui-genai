## Why

Dialog forms currently perform validation only when the user clicks the confirm button, allowing the button to be clicked on an empty/invalid form. This creates a poor UX where errors appear only after an attempted submit, and there is no visible cue that fields are required until that point.

## What Changes

- All dialog forms across mfe-core and mfe-router pages will trigger validation immediately when the dialog opens, making required-field errors visible from the start.
- The OK/Submit/Save/Connect button in each form dialog will be disabled until all validation rules pass, and will re-enable in real-time as the user fills in the fields.

## Capabilities

### New Capabilities

_(none — this change modifies existing capabilities)_

### Modified Capabilities

- `core`: Add eager validation and disabled-button requirements to the Add/Edit dialog scenario
- `router`: Add form validation behavior requirements to WAN edit and WWAN password dialog scenarios

## Impact

- **packages/mfe-core/src/pages/**: UserPage, ClientPage, UnitPage, ApplicationPage, NetworkPage, DevicePage, DeviceRoutePage, NetworkRoutePage — add dialog and, where applicable, edit/send dialogs
- **packages/mfe-router/src/pages/**: WanPage (edit dialog), WwanPage (password dialog)
- No API changes, no new dependencies, no breaking changes
