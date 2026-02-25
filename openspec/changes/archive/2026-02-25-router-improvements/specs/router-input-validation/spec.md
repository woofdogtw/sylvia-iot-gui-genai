## ADDED Requirements

### Requirement: Validate Utility Module
The mfe-router package SHALL provide a `packages/mfe-router/src/utils/validate.js` module exporting reusable pure validator functions. Each function SHALL return `true` when the value is valid, or a localized error message string when invalid. All validators SHALL accept the value as the first argument and the vue-i18n `t` function as the second argument.

The module SHALL export the following functions:
- `isValidIPv4(val, t)` — returns `true` if `val` is a well-formed IPv4 address (four decimal octets 0–255 separated by dots); otherwise returns the i18n message for `router.validate.invalidIp`
- `isValidCIDR(val, t)` — returns `true` if `val` is a well-formed IPv4 CIDR string (e.g. `192.168.1.1/24`, prefix 0–32); otherwise returns the i18n message for `router.validate.invalidCidr`
- `isNonEmpty(val, t)` — returns `true` if `val` is a non-empty, non-whitespace string; otherwise returns the i18n message for `router.validate.required`
- `isMinLength(min)` — returns a validator function `(val, t) => true | string` that checks `val.length >= min`; when invalid returns the i18n message for `router.validate.minLength` (interpolated with the `min` value)
- `isMaxLength(max)` — returns a validator function `(val, t) => true | string` that checks `val.length <= max`; when invalid returns the i18n message for `router.validate.maxLength` (interpolated with the `max` value)
- `isIntegerInRange(min, max)` — returns a validator function `(val, t) => true | string` that checks `val` is an integer with `min <= val <= max`; when invalid returns the i18n message for `router.validate.outOfRange` (interpolated with `min` and `max`)
- `isIPInRange(ip, start, end, t)` — returns `true` if the IPv4 address `ip` (without prefix) falls within the inclusive range `[start, end]`; returns `false` if any argument is not a valid IPv4 address; used for cross-field LAN validation
- `isIPNotGreaterThan(a, b, t)` — returns `true` if IPv4 address `a` is numerically less than or equal to `b`; otherwise returns the i18n message for `router.validate.dhcpStartAfterEnd`

#### Scenario: isValidIPv4 accepts valid address
- **WHEN** `isValidIPv4('192.168.1.1', t)` is called
- **THEN** it returns `true`

#### Scenario: isValidIPv4 rejects invalid address
- **WHEN** `isValidIPv4('999.0.0.1', t)` is called
- **THEN** it returns the error message string for `router.validate.invalidIp`

#### Scenario: isValidCIDR accepts valid CIDR
- **WHEN** `isValidCIDR('10.0.0.0/24', t)` is called
- **THEN** it returns `true`

#### Scenario: isValidCIDR rejects bare IP
- **WHEN** `isValidCIDR('10.0.0.1', t)` is called
- **THEN** it returns the error message string for `router.validate.invalidCidr`

#### Scenario: isValidCIDR rejects prefix out of range
- **WHEN** `isValidCIDR('10.0.0.0/33', t)` is called
- **THEN** it returns the error message string for `router.validate.invalidCidr`

#### Scenario: isValidCIDR rejects trailing slash with no prefix
- **WHEN** `isValidCIDR('192.168.1.1/', t)` is called
- **THEN** it returns the error message string for `router.validate.invalidCidr`

#### Scenario: isNonEmpty rejects empty string
- **WHEN** `isNonEmpty('', t)` is called
- **THEN** it returns the error message string for `router.validate.required`

#### Scenario: isNonEmpty rejects whitespace-only string
- **WHEN** `isNonEmpty('   ', t)` is called
- **THEN** it returns the error message string for `router.validate.required`

#### Scenario: isMinLength returns a validator that passes for sufficient length
- **WHEN** `isMinLength(8)('password1', t)` is called
- **THEN** it returns `true`

#### Scenario: isMinLength returns a validator that fails for insufficient length
- **WHEN** `isMinLength(8)('short', t)` is called
- **THEN** it returns the error message string for `router.validate.minLength`

#### Scenario: isMaxLength returns a validator that passes within limit
- **WHEN** `isMaxLength(63)('validpassword', t)` is called
- **THEN** it returns `true`

#### Scenario: isMaxLength returns a validator that fails when too long
- **WHEN** `isMaxLength(63)` is called with a 64-character string
- **THEN** it returns the error message string for `router.validate.maxLength`

#### Scenario: isIntegerInRange returns a validator that passes within range
- **WHEN** `isIntegerInRange(60, 604800)(86400, t)` is called
- **THEN** it returns `true`

#### Scenario: isIntegerInRange returns a validator that fails below minimum
- **WHEN** `isIntegerInRange(60, 604800)(10, t)` is called
- **THEN** it returns the error message string for `router.validate.outOfRange`

#### Scenario: isIntegerInRange returns a validator that fails above maximum
- **WHEN** `isIntegerInRange(60, 604800)(999999, t)` is called
- **THEN** it returns the error message string for `router.validate.outOfRange`

#### Scenario: isIPInRange detects IP inside range
- **WHEN** `isIPInRange('192.168.1.100', '192.168.1.50', '192.168.1.200', t)` is called
- **THEN** it returns `true`

#### Scenario: isIPInRange detects IP outside range
- **WHEN** `isIPInRange('192.168.1.10', '192.168.1.50', '192.168.1.200', t)` is called
- **THEN** it returns `false`

#### Scenario: isIPNotGreaterThan passes when start equals end
- **WHEN** `isIPNotGreaterThan('192.168.1.100', '192.168.1.100', t)` is called
- **THEN** it returns `true`

#### Scenario: isIPNotGreaterThan fails when start is after end
- **WHEN** `isIPNotGreaterThan('192.168.1.200', '192.168.1.100', t)` is called
- **THEN** it returns the error message string for `router.validate.dhcpStartAfterEnd`

### Requirement: WAN Page Input Validation
The WAN page edit dialog SHALL validate fields before calling the API. When the connection type4 is `static`, the address field SHALL validate as a CIDR string, the gateway field SHALL validate as an IPv4 address, and each comma-separated entry in the DNS field SHALL validate as an IPv4 address. Each DNS entry SHALL be trimmed of leading/trailing whitespace before validation so that `8.8.8.8, 8.8.4.4` (with spaces) is accepted. The Save button SHALL call `formRef.value.validate()` and abort if validation fails.

#### Scenario: WAN static fields pass with valid input
- **WHEN** the user enters `192.168.100.1/24` for address, `192.168.100.254` for gateway, `8.8.8.8, 8.8.4.4` for DNS, and clicks Save
- **THEN** the form validates successfully and the PUT API call is made

#### Scenario: WAN static address rejects bare IP
- **WHEN** the user enters `192.168.1.1` (no prefix) for the address field
- **THEN** an inline error message is shown and the PUT API call is NOT made

#### Scenario: WAN DNS rejects non-IP entry
- **WHEN** the user enters `8.8.8.8, notanip` for the DNS field
- **THEN** an inline error message is shown and the PUT API call is NOT made

#### Scenario: WAN non-static types skip IP validation
- **WHEN** the type is `dhcp` or `pppoe`
- **THEN** no IP validation rules are applied and Save proceeds with those fields ignored

### Requirement: LAN Page Input Validation
The LAN page form SHALL validate all fields before calling the API. The address field SHALL validate as a CIDR string. When DHCP is enabled, dhcpStart and dhcpEnd SHALL each validate as IPv4 addresses, leaseTime SHALL validate as an integer between 60 and 604800 (seconds), dhcpStart SHALL be numerically less than or equal to dhcpEnd, and the host IP extracted from the address CIDR SHALL NOT fall within the dhcpStart–dhcpEnd range. The Save button SHALL be disabled until all visible validation rules pass; it SHALL re-enable in real time as the user corrects errors. Validation SHALL re-run reactively whenever any field value changes.

#### Scenario: LAN form passes with valid non-overlapping config
- **WHEN** address is `192.168.1.1/24`, dhcpStart is `192.168.1.100`, dhcpEnd is `192.168.1.200`, leaseTime is `86400`
- **THEN** validation passes and the PUT API call is made

#### Scenario: LAN address rejects bare IP
- **WHEN** the address field contains `192.168.1.1` without a prefix
- **THEN** an inline error is shown and Save is blocked

#### Scenario: LAN host IP inside DHCP range is rejected
- **WHEN** address is `192.168.1.100/24`, dhcpStart is `192.168.1.50`, dhcpEnd is `192.168.1.200`
- **THEN** an inline error is shown indicating the host IP is within the DHCP range and Save is blocked

#### Scenario: LAN dhcpStart after dhcpEnd is rejected
- **WHEN** dhcpStart is `192.168.1.200` and dhcpEnd is `192.168.1.100`
- **THEN** an inline error is shown on the dhcpStart field and Save is blocked

#### Scenario: LAN leaseTime below minimum is rejected
- **WHEN** leaseTime is `10` (below the minimum of 60)
- **THEN** an inline error is shown and Save is blocked

#### Scenario: LAN leaseTime above maximum is rejected
- **WHEN** leaseTime is `999999` (above the maximum of 604800)
- **THEN** an inline error is shown and Save is blocked

#### Scenario: LAN Save button is disabled when form is invalid
- **WHEN** any field contains an invalid value
- **THEN** the Save button is disabled and cannot be clicked
- **AND** when all fields are corrected to valid values the Save button re-enables automatically

### Requirement: WLAN Page Input Validation
The WLAN page SHALL validate SSID and password fields before calling the API. The SSID field SHALL not be empty when WLAN is enabled. The password field SHALL be 8–63 characters (WPA-PSK requirement per the API) when WLAN is enabled. The Save button SHALL be disabled until all visible validation rules pass; it SHALL re-enable in real time as the user corrects errors. Validation SHALL re-run reactively whenever any field value changes.

#### Scenario: WLAN save passes with valid SSID and password
- **WHEN** SSID is `MyNetwork` and password is `securepass`
- **THEN** validation passes and the PUT API call is made

#### Scenario: WLAN save rejects empty SSID
- **WHEN** the SSID field is empty and Save is clicked
- **THEN** an inline error is shown and the PUT API call is NOT made

#### Scenario: WLAN save rejects short password
- **WHEN** the password is `short` (fewer than 8 characters) and Save is clicked
- **THEN** an inline error is shown and the PUT API call is NOT made

#### Scenario: WLAN save rejects password over 63 characters
- **WHEN** the password is 64 characters long and Save is clicked
- **THEN** an inline error is shown and the PUT API call is NOT made

#### Scenario: WLAN Save button is disabled when form is invalid
- **WHEN** SSID is empty or password length is out of range while WLAN is enabled
- **THEN** the Save button is disabled and cannot be clicked
- **AND** when all fields are corrected to valid values the Save button re-enables automatically

### Requirement: WWAN Page Input Validation
The WWAN page connect password dialog SHALL validate that the SSID is non-empty and the password is non-empty before submitting a connection request. Validation SHALL run when the user confirms the dialog.

#### Scenario: WWAN connect dialog rejects empty password for secured AP
- **WHEN** the user clicks CONNECT on an AP with security type `wpa2` and leaves the password field empty
- **THEN** an inline error is shown and the PUT API call is NOT made

#### Scenario: WWAN connects directly for open AP
- **WHEN** the user clicks CONNECT on an AP with security type `none`
- **THEN** no password dialog is shown and the PUT API call is made immediately
