# Project Context

## Purpose
This project provides micro-frontend applications for the Sylvia-IoT platform, an IoT (Internet of Things) backend system. The goal is to develop modular, maintainable frontend interfaces that connect to Sylvia-IoT services, enabling users to manage IoT devices, monitor data, and interact with the platform.

## Tech Stack
- **Language**: JavaScript (ES6+, no TypeScript)
- **Framework**: Quasar Framework (Vue.js based)
- **UI/UX**: Quasar components for responsive Material Design interface
- **Architecture**: Micro-frontend approach for modular development

## Project Conventions

### Code Style
- Follow Vue.js 3 style guide and best practices
- Adhere to Quasar Framework conventions and component patterns
- Use ESLint with Vue.js and Quasar recommended rules
- Prefer Composition API for new components
- Use consistent naming: kebab-case for component files, camelCase for JavaScript variables
- **All code and comments MUST be written in English**

### Architecture Patterns
- **Micro-frontend structure**: Each major feature/module is developed as a separate Quasar application
- **API communication**: Centralized API client using Axios or Fetch API with OAuth2 token management
- **State management**: Use Pinia (Vue 3 recommended) for complex state, Composition API for simple local state
- **Routing**: Vue Router for SPA navigation within each micro-frontend
- **Component organization**: Feature-based folder structure following Quasar conventions

### Testing Strategy
- **Unit tests**: Use Quasar's built-in testing capabilities (Vitest/Jest)
  - Test business logic and composables in isolation
  - Test UI components using Vue Test Utils
- **Integration tests**: Run actual Sylvia-IoT microservices for realistic testing
  - Prefer real service integration over API mocking
  - Use skills/scripts to start/stop Sylvia-IoT services consistently
  - Test OAuth2 flow and API communication with real backends
  - Ensure tests can run in CI/CD with service containers
- **E2E tests**: Test critical user flows end-to-end (optional, as needed)
  - Use Playwright or Cypress for browser automation
- **Test data management**: Provide scripts to reset/seed test data between test runs

### Git Workflow
**CRITICAL CONSTRAINTS FOR AI AGENTS:**
- AI agents MAY use `git add` to stage files (for convenience in reviewing diffs)
- AI agents MUST NEVER execute `git commit` under any circumstances
- All commit decisions must remain with the human developer
- Agents should present changes and let developers review before committing
- Branch management and commit messages are developer responsibilities

**FILE ACCESS CONSTRAINTS FOR AI AGENTS:**
- AI agents MUST ONLY create, modify, or delete files within this project directory
- AI agents MUST NEVER access or modify files outside the project root
- AI agents MUST NEVER access `/mnt/*` paths (WSL Windows filesystem access)
- Agents should validate file paths before any write operation to ensure they are within project root
- Read-only access to external documentation (web URLs) is permitted

## Domain Context
Sylvia-IoT is an open-source IoT platform composed of multiple microservices. The platform provides comprehensive IoT device management, data collection, and control capabilities. Frontend applications need to understand:
- Microservices architecture: Each service exposes its own HTTP API
- OAuth2 authentication flow for accessing protected resources
- RESTful API patterns used across services
- Device management concepts and data models

## Important Constraints
- Must use OAuth2 access tokens for all authenticated API calls
- Must implement token refresh logic for long-lived sessions
- API endpoints vary by microservice deployment
- Pure JavaScript implementation (no TypeScript)

## External Dependencies
- **Sylvia-IoT Core Platform**: https://github.com/woofdogtw/sylvia-iot-core
  - Microservices-based IoT backend platform
  - Each microservice provides API documentation in `doc/api.md`
  - OAuth2 authentication endpoints for token management
- **Documentation**: https://woofdogtw.github.io/sylvia-iot-core
  - OAuth2 token acquisition guide
  - Platform overview and architecture
