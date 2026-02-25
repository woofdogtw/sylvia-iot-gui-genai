---
name: sylvia-router
description: Manages Sylvia-Router backend services (RabbitMQ, EMQX, sylvia-router) for mfe-router E2E testing. Use when running router E2E tests or managing Sylvia-Router services. Cannot run simultaneously with sylvia-iot-core (same port 1080).
---

# Sylvia-Router Services Management

Sylvia-Router bundles all Sylvia-IoT-Core services (auth, broker, coremgr, data) plus the IP router service.

> **Note**: sylvia-router and sylvia-iot-core both listen on port 1080. `start.sh` automatically stops sylvia-iot-core if running.

## Available commands

### Start services

**Command**: `/sylvia-router start`

Stops sylvia-iot-core if running, then starts RabbitMQ, EMQX (fresh), and sylvia-router. Auto-detects the primary network interface (falls back to `eth0`). Downloads the binary on first run.

Services available at:
- RabbitMQ: http://localhost:15672 (guest/guest)
- EMQX Dashboard: http://localhost:18083
- Sylvia-Router: http://localhost:1080 (auth/broker/coremgr/data/router)

Test credentials: admin / admin

### Stop services

**Command**: `/sylvia-router stop`

Stops sylvia-router, RabbitMQ, and EMQX. Containers are stopped but not removed.

### Reset database

**Command**: `/sylvia-router reset-db`

Backs up and recreates the SQLite test database with default data: admin/admin user and two OAuth2 clients.

### Check status

**Command**: `/sylvia-router status`

Shows running status of sylvia-router, RabbitMQ, and EMQX, plus service URLs and credentials.

## Implementation

Determine which command was requested (start, stop, reset-db, status) and run the corresponding script from `skills/sylvia-router/scripts/`:

```bash
./start.sh
./stop.sh
./reset-db.sh
./status.sh
```

Requirements: Docker must be running; sqlite3 must be installed.
