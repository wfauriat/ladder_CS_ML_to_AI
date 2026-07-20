#!/usr/bin/env bash

set -euo pipefall

cd server
source venv/bin/activate
uvicorn app:app --host 0.0.0.0 --port 8080