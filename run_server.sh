#!/usr/bin/env bash

set -euo pipefail

cd server
# source venv/bin/activate
uvicorn app_vapi:app --host 0.0.0.0 --port 8080