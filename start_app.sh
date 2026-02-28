#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/AssetFlowApi"
FRONTEND_DIR="$ROOT_DIR/client/asset-flow"

if ! command -v mvn >/dev/null 2>&1; then
  if [ ! -f "$BACKEND_DIR/mvnw" ]; then
    echo "mvn not found and $BACKEND_DIR/mvnw is missing. Please install Maven." >&2
    exit 1
  fi
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm not found. Please install Node.js." >&2
  exit 1
fi

echo "Starting backend from $BACKEND_DIR"
(
  cd "$BACKEND_DIR"
  if command -v mvn >/dev/null 2>&1; then
    mvn spring-boot:run
  else
    ./mvnw spring-boot:run
  fi
) &
BACKEND_PID=$!

echo "Starting frontend from $FRONTEND_DIR"
(
  cd "$FRONTEND_DIR"
  npm run dev
) &
FRONTEND_PID=$!

cleanup() {
  echo "Shutting down..."
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

wait "$BACKEND_PID" "$FRONTEND_PID"
