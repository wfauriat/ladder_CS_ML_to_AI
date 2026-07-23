#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "$0")"

# No built SPA: fall back to the Vite dev server
if [ ! -d dist ]; then
  if command -v npm >/dev/null 2>&1; then
    npm install
    exec npm run dev
  else
    echo "No dist/ directory and npm is not available — cannot start." >&2
    exit 1
  fi
fi

cd server

for venv in venv .venv; do
  if [ -f "$venv/bin/activate" ]; then
    source "$venv/bin/activate"
    break
  fi
done

if command -v uvicorn >/dev/null 2>&1; then
  exec uvicorn app_vapi:app --host 0.0.0.0 --port 8080
else
  # Static-only fallback: serves the built SPA, no API endpoints
  PY=$(command -v python3 || command -v python)
  exec "$PY" -m http.server 8080 --directory ../dist
fi
