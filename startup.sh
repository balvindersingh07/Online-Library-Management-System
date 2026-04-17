#!/bin/bash
set -euo pipefail
cd /home/site/wwwroot/backend
if [ -f /home/site/wwwroot/antenv/bin/activate ]; then
  # shellcheck source=/dev/null
  source /home/site/wwwroot/antenv/bin/activate
  exec python -m uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
else
  exec python3 -m uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
fi
