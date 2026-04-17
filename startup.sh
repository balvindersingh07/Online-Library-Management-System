#!/bin/bash
set -eo pipefail
export PYTHONUNBUFFERED=1
cd /home/site/wwwroot/backend
PORT="${PORT:-8000}"
if [ -f /home/site/wwwroot/antenv/bin/activate ]; then
  # shellcheck source=/dev/null
  source /home/site/wwwroot/antenv/bin/activate
  PY=python
else
  PY=python3
fi
# Azure App Service sets PORT (often 8000 or 8080). Gunicorn + Uvicorn worker is the supported pattern on Linux.
exec "$PY" -m gunicorn app.main:app \
  -k uvicorn.workers.UvicornWorker \
  -w 1 \
  --bind "0.0.0.0:${PORT}" \
  --timeout 120 \
  --access-logfile - \
  --error-logfile -
