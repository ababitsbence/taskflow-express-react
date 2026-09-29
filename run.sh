#!/usr/bin/env bash
set -e

if [ ! -f .env ]; then
    echo "No .env file found. Copy .env.example to .env and fill in your values first."
    exit 1
fi

echo "Starting Taskflow..."
docker compose up --build