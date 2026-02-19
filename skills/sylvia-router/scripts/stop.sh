#!/bin/bash

# Sylvia-Router Services Stop Script
# This script stops sylvia-router, RabbitMQ, and EMQX

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$SCRIPT_DIR/sylvia-router.pid"

echo "======================================"
echo "Stopping Sylvia-Router Services"
echo "======================================"

# Stop sylvia-router
echo ""
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
        echo "🔄 Stopping sylvia-router (PID: $PID)..."
        kill "$PID"

        # Wait for process to stop (max 10 seconds)
        for i in {1..10}; do
            if ! kill -0 "$PID" 2>/dev/null; then
                echo "✅ sylvia-router stopped"
                rm "$PID_FILE"
                break
            fi
            if [ $i -eq 10 ]; then
                echo "⚠️  Process did not stop gracefully, force killing..."
                kill -9 "$PID" 2>/dev/null
                rm "$PID_FILE"
                echo "✅ sylvia-router force stopped"
            fi
            sleep 1
        done
    else
        echo "ℹ️  sylvia-router PID file exists but process is not running"
        rm "$PID_FILE"
    fi
else
    echo "ℹ️  sylvia-router is not running (no PID file)"
fi

# Stop Docker containers
echo ""
echo "🔄 Stopping Docker containers..."

# Stop RabbitMQ
if docker ps --format '{{.Names}}' | grep -q '^sylvia-rabbitmq$'; then
    echo "  Stopping RabbitMQ..."
    docker stop sylvia-rabbitmq > /dev/null
    echo "  ✅ RabbitMQ stopped"
else
    echo "  ℹ️  RabbitMQ is not running"
fi

# Stop EMQX
if docker ps --format '{{.Names}}' | grep -q '^sylvia-emqx$'; then
    echo "  Stopping EMQX..."
    docker stop sylvia-emqx > /dev/null
    echo "  ✅ EMQX stopped"
else
    echo "  ℹ️  EMQX is not running"
fi

echo ""
echo "======================================"
echo "✅ All Services Stopped"
echo "======================================"
echo ""
echo "Note: Docker containers are stopped but not removed."
echo "To remove containers: docker rm sylvia-rabbitmq sylvia-emqx"
echo "To start services again: ./start.sh"
echo ""
