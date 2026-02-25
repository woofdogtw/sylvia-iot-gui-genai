## ADDED Requirements

### Requirement: API Error Display

When an API call from any router configuration page fails, the error SHALL be presented as a persistent modal dialog rather than a transient notification, so users can read the full error detail before continuing.

#### Scenario: Error dialog on API failure

- **WHEN** an API call from a router page (Dashboard, WAN, LAN, WLAN, or WWAN) fails
- **THEN** a Quasar dialog SHALL appear with a title showing the localized error code label from the `apiError.*` i18n translations in the shared package (or a generic error title if the code is unknown)
- **AND** the dialog body SHALL display the raw `message` string from the API error response (`error.response.data.message`), falling back to `HTTP {status}: {statusText}` when no message is present, or to `error.message` when there is no response
- **AND** the dialog SHALL persist until the user explicitly dismisses it by clicking OK

#### Scenario: Clock and service-info widget errors remain silent

- **WHEN** the System Clock header widget or Service Info header widget API call fails
- **THEN** the widget SHALL hide gracefully with no dialog or notification shown (these are non-critical background polls)
