#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "$0")/server"

PY=$(command -v python3 || command -v python)

if [ ! -d venv ]; then
  "$PY" -m venv venv
fi

source venv/bin/activate
pip install --upgrade pip
pip install -r requirements-vapi.txt
