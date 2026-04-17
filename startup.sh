#!/bin/bash
set -e
cd /home/site/wwwroot
# Ensure deps exist in this runtime (zip deploy may not activate Oryx venv for custom startup)
python3 -m pip install --no-cache-dir -r requirements.txt
cd /home/site/wwwroot/backend
exec python3 -m uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
