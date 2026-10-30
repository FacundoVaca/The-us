#!/usr/bin/env bash
# Capture desktop and mobile screenshots of an already-running project.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

: "${CAPTURE_URL:?Set CAPTURE_URL to the running preview URL.}"
: "${CAPTURE_DIR:?Set CAPTURE_DIR to an output directory outside the source.}"

/usr/bin/time -p mkdir -p "$CAPTURE_DIR"
/usr/bin/time -p env CAPTURE_URL="$CAPTURE_URL" CAPTURE_DIR="$CAPTURE_DIR" node scripts/capture.mjs
