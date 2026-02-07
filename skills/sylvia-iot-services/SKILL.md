# Sylvia-IoT Services Management

Use this skill to manage Sylvia-IoT backend services for integration testing and development.

## What this skill does

This skill provides commands to start, stop, and reset the Sylvia-IoT backend services including:
- RabbitMQ (message broker)
- EMQX (MQTT broker)
- sylvia-iot-core (auth, broker, coremgr, data services)

## When to use this skill

Use this skill when:
- Setting up the development environment
- Running integration tests that need real backend services
- Resetting test data between test runs
- Stopping services after testing

## Available commands

### Start services
Starts all Sylvia-IoT services including RabbitMQ, EMQX, and sylvia-iot-core.

**Command**: `/sylvia-iot-services start`

**What it does**:
1. Checks if Docker is running
2. Starts RabbitMQ container (if not already running)
3. Starts EMQX container (if not already running)
4. Downloads sylvia-iot-core binary (if not present)
5. Creates SQLite test database (if not exists)
6. Starts sylvia-iot-core with test configuration
7. Waits for services to be ready

**Services will be available at**:
- RabbitMQ: http://localhost:15672 (guest/guest)
- EMQX Dashboard: http://localhost:18083
- Sylvia-IoT Core: http://localhost:1080
  - Auth: http://localhost:1080/auth
  - Broker: http://localhost:1080/broker
  - Coremgr: http://localhost:1080/coremgr
  - Data: http://localhost:1080/data

**Test credentials**:
- Username: admin
- Password: admin

### Stop services
Stops all running Sylvia-IoT services.

**Command**: `/sylvia-iot-services stop`

**What it does**:
1. Stops sylvia-iot-core process
2. Stops RabbitMQ container
3. Stops EMQX container

**Note**: Docker containers are stopped but not removed. To remove them completely, use:
```bash
docker rm sylvia-rabbitmq sylvia-emqx
```

### Reset database
Resets the test database to its initial state with default test data.

**Command**: `/sylvia-iot-services reset-db`

**What it does**:
1. Creates a backup of the current database
2. Deletes the existing test database
3. Recreates the database with initial test data

**Warning**: This will reset all data including users, clients, devices, and applications to the default test state.

**Default test data**:
- Admin user (username: admin, password: admin)
- Two OAuth2 clients (public and private)

### Check status
Shows the current status of Sylvia-IoT services.

**Command**: `/sylvia-iot-services status`

**What it shows**:
- Whether sylvia-iot-core is running
- Whether RabbitMQ container is running
- Whether EMQX container is running
- Service URLs and test credentials

## Implementation

When a user invokes this skill:

1. Determine which command was requested (start, stop, reset-db, status)
2. Execute the appropriate shell script from `skills/sylvia-iot-services/scripts/`
3. Report the results to the user

## How to execute scripts

From the project root:
```bash
cd skills/sylvia-iot-services/scripts
./start.sh
./stop.sh
./reset-db.sh
./status.sh
```

## Scripts location

All scripts are located in: `skills/sylvia-iot-services/scripts/`

- `start.sh` - Start all services
- `stop.sh` - Stop all services
- `reset-db.sh` - Reset database
- `status.sh` - Check service status
- `config.json5` - Sylvia-IoT configuration
- `test.db.sql` - Database schema and test data
- `README.md` - Detailed documentation

## Important notes

- Docker must be running before starting services
- sqlite3 must be installed on the system
- Scripts use localhost:1080 for all services
- The sylvia-iot-core binary is downloaded automatically on first run
- All services run in the background; use `stop` command to clean up

## Example usage

User: "Start the Sylvia-IoT services for testing"
Agent: *Invokes `/sylvia-iot-services start`*
Agent: "Services started successfully. You can now run integration tests."

User: "Reset the test database"
Agent: *Invokes `/sylvia-iot-services reset-db`*
Agent: "Database reset to initial state with admin/admin credentials."

User: "Stop all services"
Agent: *Invokes `/sylvia-iot-services stop`*
Agent: "All services stopped. Docker containers are stopped but not removed."
