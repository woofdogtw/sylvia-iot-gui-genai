# Sylvia-Router Services Management

Use this skill to manage Sylvia-Router backend services for integration testing and development.
Sylvia-Router bundles all Sylvia-IoT-Core services (auth, broker, coremgr, data) plus the
IP router service.

## What this skill does

This skill provides commands to start, stop, and reset the Sylvia-Router services including:
- RabbitMQ (message broker)
- EMQX (MQTT broker)
- sylvia-router (auth, broker, coremgr, data, **router** services)

The `start` command automatically detects the primary network interface (e.g. `eth0` on WSL2,
or whatever the default route interface is on GitHub Actions). If no interface is found, it falls
back to `eth0`.

## When to use this skill

Use this skill when:
- Running E2E tests for the router micro-frontend plugin (mfe-router)
- Setting up the full development environment including router management features
- Resetting test data between test runs
- Stopping services after testing

> **Note**: sylvia-router and sylvia-iot-core both listen on port 1080 and cannot run
> simultaneously. `start.sh` will automatically stop sylvia-iot-core if it is running.

## Available commands

### Start services
Starts all services including RabbitMQ, EMQX, and sylvia-router.

**Command**: `/sylvia-router start`

**What it does**:
1. Checks if Docker is running
2. Stops sylvia-iot-core if running (port 1080 conflict)
3. Starts RabbitMQ container (if not already running)
4. Starts EMQX container (fresh, with clean state)
5. Sets up EMQX API key
6. Auto-detects primary network interface
7. Downloads sylvia-router binary (if not present)
8. Creates SQLite test database (if not exists)
9. Generates runtime config with detected interface and EMQX credentials
10. Starts sylvia-router with test configuration
11. Waits for services to be ready

**Services will be available at**:
- RabbitMQ: http://localhost:15672 (guest/guest)
- EMQX Dashboard: http://localhost:18083
- Sylvia-Router: http://localhost:1080
  - Auth:    http://localhost:1080/auth
  - Broker:  http://localhost:1080/broker
  - Coremgr: http://localhost:1080/coremgr
  - Data:    http://localhost:1080/data
  - Router:  http://localhost:1080/router

**Test credentials**:
- Username: admin
- Password: admin

### Stop services
Stops all running services.

**Command**: `/sylvia-router stop`

**What it does**:
1. Stops sylvia-router process
2. Stops RabbitMQ container
3. Stops EMQX container

**Note**: Docker containers are stopped but not removed. To remove them completely, use:
```bash
docker rm sylvia-rabbitmq sylvia-emqx
```

### Reset database
Resets the test database to its initial state with default test data.

**Command**: `/sylvia-router reset-db`

**What it does**:
1. Creates a backup of the current database
2. Deletes the existing test database
3. Recreates the database with initial test data

**Warning**: This will reset all data including users, clients, devices, and applications.

**Default test data**:
- Admin user (username: admin, password: admin)
- Two OAuth2 clients (public and private)

### Check status
Shows the current status of all services.

**Command**: `/sylvia-router status`

**What it shows**:
- Whether sylvia-router is running
- Whether RabbitMQ container is running
- Whether EMQX container is running
- Service URLs and test credentials

## Implementation

When a user invokes this skill:

1. Determine which command was requested (start, stop, reset-db, status)
2. Execute the appropriate shell script from `skills/sylvia-router/scripts/`
3. Report the results to the user

## How to execute scripts

From the project root:
```bash
cd skills/sylvia-router/scripts
./start.sh
./stop.sh
./reset-db.sh
./status.sh
```

## Scripts location

All scripts are located in: `skills/sylvia-router/scripts/`

- `start.sh` - Start all services
- `stop.sh` - Stop all services
- `reset-db.sh` - Reset database
- `status.sh` - Check service status
- `config.json5` - Sylvia-Router configuration template
- `test.db.sql` - Database schema and test data
- `emqx.conf` - EMQX broker configuration

## Important notes

- Docker must be running before starting services
- sqlite3 must be installed on the system
- The sylvia-router binary is downloaded automatically on first run
- Network interface is auto-detected from the default route; falls back to `eth0`
- All services run in the background; use `stop` command to clean up
- sylvia-router and sylvia-iot-core cannot run simultaneously (same port 1080)

## Example usage

User: "Start the Sylvia-Router services for router E2E testing"
Agent: *Invokes `/sylvia-router start`*
Agent: "Services started successfully. Router API available at http://localhost:1080/router"

User: "Reset the test database"
Agent: *Invokes `/sylvia-router reset-db`*
Agent: "Database reset to initial state with admin/admin credentials."

User: "Stop all services"
Agent: *Invokes `/sylvia-router stop`*
Agent: "All services stopped. Docker containers are stopped but not removed."
