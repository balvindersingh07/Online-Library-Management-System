#!/bin/bash
set -euxo pipefail
cd /home/site/wwwroot
python3 -m pip install --upgrade pip
python3 -m pip install --no-cache-dir -r requirements.txt
cd /home/site/wwwroot/backend
exec python3 -m uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
