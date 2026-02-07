# Shell Framework Design

## Context

The Sylvia-IoT platform consists of multiple backend microservices (auth, broker, coremgr, data, etc.) that currently lack a unified frontend interface. This design establishes the foundational shell framework that will serve as the main UI container, providing core infrastructure for authentication, navigation, and hosting micro-frontend applications.

Target users include IoT platform administrators, device managers, and third-party developers who want to extend the platform with custom UI modules.

## Goals

- Create a production-ready shell application using Quasar Framework
- Establish a plugin system for dynamically loading micro-frontend applications
- Integrate OAuth2 authentication with Sylvia-IoT backend
- Provide internationalization and theming capabilities
- Design a clear plugin interface for future extensibility
- Keep the architecture simple and pragmatic for Phase 1

## Non-Goals (Phase 1)

- Framework-agnostic plugin API (defer to Phase 2)
- Support for React/Angular/other framework micro-frontends (future consideration)
- Advanced state synchronization between plugins
- Server-side rendering (SSR)
- Offline/PWA capabilities (may add later)

## Decisions

### 1. Technology Stack

**Decision**: Use Quasar Framework v2 with Vue 3, Composition API, and JavaScript (no TypeScript)

**Rationale**:
- Quasar provides comprehensive Material Design components out of the box
- Built-in support for responsive layouts, i18n, and dark mode
- Vue 3 Composition API offers better code organization and reusability
- JavaScript-only keeps the codebase accessible and reduces complexity as specified in project conventions
- Large ecosystem and active community support

**Alternatives considered**:
- Plain Vue 3 + custom components: More work to build responsive layouts and theming
- React + Material-UI: Different tech stack, team is more familiar with Vue
- Backstage: Over-engineered for this use case, React/TypeScript-only

### 2. Monorepo Structure

**Decision**: Use a monorepo with npm/pnpm workspaces, organizing code under packages/

**Structure**:
```
packages/
├── shell/              # Main shell application (Quasar project)
├── shared/             # Shared utilities, API clients, components
├── mfe-core/           # Core management micro-frontend
├── mfe-data/           # Data management micro-frontend
└── ...                 # Additional micro-frontends
```

**Rationale**:
- Clear separation of concerns between shell and plugins
- Easier dependency management across packages
- Shared code can be consumed via workspace references
- Industry-standard approach for micro-frontend architectures
- Enables independent development and deployment of micro-frontends

**Alternatives considered**:
- Flat directory structure: Less organized as project grows
- Separate repositories: More complex CI/CD and dependency management

### 3. Plugin System Design

**Decision**: Implement a Quasar/Vue-specific plugin system with a clear interface contract

**Plugin Interface**:
```javascript
{
  id: string,              // Required: unique identifier
  name: string,            // Required: display name
  category: string,        // Required: menu category
  routes: Array,           // Optional: Vue Router routes
  menuItems: Array,        // Optional: menu item configurations
  headerWidgets: Array,    // Optional: header widget components
  order: number            // Optional: display order within category
}
```

**Rationale**:
- Simple and pragmatic for Phase 1
- All official micro-frontends will use Quasar/Vue, so this interface is natural
- Clear contract enables future framework-agnostic abstraction (Phase 2)
- Documented as public API to guide third-party developers
- Avoids over-engineering before actual multi-framework need arises

**Plugin Loading Mechanism**:
- Static imports for official micro-frontends (bundled)
- Dynamic imports possible for future remote plugins
- Plugin registry validates interface on registration

**Alternatives considered**:
- Framework-agnostic API from the start: More complex, premature optimization
- Web Components: More isolation but complex state sharing
- Module Federation: Adds complexity, can be added in Phase 2 if needed

### 4. State Management

**Decision**: Use Pinia for global state (auth, settings), Composition API for local state

**Stores**:
- `authStore`: Authentication state (tokens, user info, isAuthenticated)
- `appStore`: Application settings (locale, theme, user preferences)
- `pluginStore`: Plugin registry and loaded plugins

**Rationale**:
- Pinia is the recommended state management for Vue 3
- Lightweight and TypeScript-friendly (even though we use JavaScript)
- Clear separation between global and local state
- Easy to test and debug

**Alternatives considered**:
- Vuex: Older, more boilerplate
- Pure Composition API with provide/inject: Works but less structured for global state

### 5. Authentication Flow

**Decision**: Implement OAuth2 Authorization Code flow (standard, without PKCE)

**Sylvia-IoT OAuth2 and Auth Endpoints**:
- Authorization: `GET /auth/oauth2/auth`
- Token exchange: `POST /auth/oauth2/token`
- Token refresh: `POST /auth/oauth2/refresh`
- Logout: `POST /auth/api/v1/auth/logout`
- Token info: `GET /auth/api/v1/auth/tokeninfo`

**Authorization Flow**:
1. User clicks Login → redirect to authorization endpoint
   ```
   GET /auth/oauth2/auth
     ?response_type=code
     &client_id={config.auth.clientId}
     &redirect_uri={config.auth.redirectUri}
     &scope={config.auth.scopes}
     &state={randomState}
   ```

2. User authenticates and grants permissions → redirected back with authorization code (valid for 30 seconds)

3. Shell exchanges code for tokens
   ```
   POST /auth/oauth2/token
   Body: grant_type=authorization_code
         &code={code}
         &redirect_uri={config.auth.redirectUri}
         &client_id={config.auth.clientId}

   Response: {
     access_token: string,
     refresh_token: string,
     token_type: "bearer",
     expires_in: number,
     scope: string
   }
   ```

4. Tokens stored in localStorage

5. Axios interceptor adds Authorization header to all API requests
   ```
   Authorization: Bearer {access_token}
   ```

6. **Automatic token refresh with retry**: When non-OAuth2 API call returns 401
   - If refresh token exists: call refresh endpoint
     ```
     POST /auth/oauth2/refresh
     Body: grant_type=refresh_token
           &refresh_token={refresh_token}
     ```
   - If refresh succeeds: store new tokens and retry original API call once
   - If refresh fails: redirect to login
   - OAuth2 endpoints (`/oauth2`, `/v1/auth`) should NOT trigger retry logic

7. Logout: Call logout API and clear tokens
   ```
   POST /auth/api/v1/auth/logout
   Header: Authorization: Bearer {access_token}
   ```

**Implementation Details**:
- Authorization code expires after 30 seconds
- Session ID valid for 60 seconds
- Token expiration determined by `expires_in` field
- Retry logic: maximum 1 retry per API call to prevent loops
- Only non-OAuth2/auth endpoints trigger automatic retry with token refresh

**Rationale**:
- OAuth2 is the standard for Sylvia-IoT platform
- Sylvia-IoT does not require PKCE
- Automatic token refresh with retry provides seamless user experience
- localStorage is acceptable for this use case (not banking app)
- Retry mechanism ensures API calls succeed even when token expires mid-session

**Security considerations**:
- Use HTTPS in production to protect tokens in transit
- Authorization codes and session IDs have short expiration times
- Clear tokens on logout and session timeout
- Future enhancement: httpOnly cookies for additional security

**Alternatives considered**:
- Session-based auth: Less suitable for distributed microservices
- Store tokens in memory only: Lost on page refresh, poor UX
- PKCE: Not required by Sylvia-IoT, adds complexity

### 6. Internationalization (i18n)

**Decision**: Use Quasar's built-in i18n system with language packs

**Supported languages (Phase 1)**:
- English (en-US) - default
- Traditional Chinese (zh-TW) - planned

**Implementation**:
- Language files organized per package/micro-frontend
- Shell provides base translations for common UI elements
- Plugins provide their own translation files
- Language selection persists in localStorage
- Global language change propagated via Quasar's reactive i18n instance

**Rationale**:
- Quasar i18n is simple and effective
- No need for additional libraries (vue-i18n already included)
- All micro-frontends automatically get language updates

### 7. Theming

**Decision**: Use Quasar's Dark Mode API with CSS custom properties

**Implementation**:
- Toggle via Settings page
- `$q.dark.set(true/false)` controls theme globally
- Preference stored in localStorage
- All Quasar components automatically adapt
- Custom components use CSS variables for theme-aware styling

**Rationale**:
- Quasar handles most of the work automatically
- Consistent theming across all micro-frontends
- Simple to implement and maintain

### 8. Routing Strategy

**Decision**: Use Vue Router with nested routes for plugins

**Structure**:
```javascript
routes = [
  { path: '/', component: WelcomeScreen },
  { path: '/home', component: HomeScreen },
  { path: '/settings', component: SettingsPage },
  { path: '/auth/callback', component: OAuthCallback },
  // Plugin routes dynamically registered
  { path: '/core/auth', component: () => import('@mfe-core/AuthManagement') },
  { path: '/core/broker', component: () => import('@mfe-core/BrokerManagement') },
  ...
]
```

**Rationale**:
- Vue Router is standard for Vue apps
- Dynamic route registration enables plugin flexibility
- Lazy loading improves initial load time
- Nested routes maintain clean URL structure

## Risks / Trade-offs

### Risk: Plugin Interface Change Requires Updates

**Mitigation**:
- Document plugin interface as public API contract
- Use semantic versioning for breaking changes
- Provide migration guides for interface updates
- Design interface to be extensible (Phase 2 can add optional fields)

### Risk: Third-party Wants Non-Vue Framework

**Current State**: Phase 1 only supports Quasar/Vue plugins

**Mitigation**:
- Clearly document current limitation in README
- Include future support in roadmap (Phase 2)
- Plugin interface designed to enable future abstraction
- Accept community feedback and feature requests

**Future Path**: Phase 2 proposal can introduce framework-agnostic adapters without breaking existing plugins

### Risk: OAuth2 Token Storage in localStorage

**Trade-off**: Convenience vs. security

**Mitigation**:
- Document security considerations
- Implement automatic token expiration and refresh
- Clear tokens on logout
- Future: Consider httpOnly cookies (requires backend support)

### Risk: Monorepo Complexity for New Contributors

**Trade-off**: Better organization vs. initial complexity

**Mitigation**:
- Provide clear README with setup instructions
- Use standard npm/pnpm workspaces (well-documented)
- Include development scripts for common tasks
- Good directory structure makes navigation easier

## Migration Plan

Not applicable - this is a new implementation with no existing system to migrate from.

## Testing Strategy

- **Unit tests**: Test individual components, stores, and utility functions using Vitest
- **Component tests**: Test Vue components with Vue Test Utils
- **Integration tests**: Test plugin registration and routing with actual Sylvia-IoT services
- **E2E tests**: Test complete user flows (login, navigation, settings) with Playwright

## Open Questions

None at this time. Design decisions are clear and ready for implementation.

## Future Considerations (Phase 2+)

### Framework-Agnostic Plugin Support

If community demand arises for React/Angular/other framework plugins:
1. Create new proposal: `add-framework-agnostic-plugin-api`
2. Design abstraction layer with mount/unmount lifecycle
3. Provide adapter libraries (@sylvia/plugin-adapter-react, etc.)
4. Maintain backward compatibility with existing Quasar plugins
5. Document migration path for third-party developers

**Key Design Principle**: Current plugin interface is designed to enable this evolution without breaking changes. The interface focuses on data contracts (routes, menuItems) rather than implementation details, making it adaptable to future abstraction layers.

### Other Future Enhancements

- Progressive Web App (PWA) capabilities
- Server-side rendering for improved SEO and initial load
- Advanced plugin communication (event bus, shared state)
- Plugin marketplace/registry
- Role-based access control for plugins
- WebSocket support for real-time updates
