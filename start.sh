#!/usr/bin/env bash
# Build the static game and serve it in the foreground on PORT (default 3000).
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

PROJECT_DIR="$(pwd)"
export PROJECT_DIR
PORT="${PORT:-3000}"
export PORT
WEB_DIR="${OPENCODE_WEB_DIR:-$PROJECT_DIR/.opencode-web}"

/usr/bin/time -p mkdir -p "$WEB_DIR"

if [[ -f package.json ]]; then
  if [[ -f package-lock.json ]]; then
    /usr/bin/time -p npm ci --no-audit --no-fund
  else
    /usr/bin/time -p npm install --no-audit --no-fund
  fi
fi

/usr/bin/time -p node scripts/build.mjs

/usr/bin/time -p env \
  DEPLOYMENT_FILE="$WEB_DIR/deployment-output.json" \
  PROJECT_ROOT="$PROJECT_DIR" \
  BUILD_DIR="$PROJECT_DIR/dist" \
  node scripts/write-deployment.mjs

/usr/bin/time -p node scripts/server.mjs
