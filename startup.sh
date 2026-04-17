#!/bin/bash
set -euo pipefail
# Oryx installs packages into antenv on the server; system python3 often has no deps.
cd /home/site/wwwroot/backend
if [ -x /home/site/wwwroot/antenv/bin/python ]; then
  PY=/home/site/wwwroot/antenv/bin/python
elif [ -x /home/site/wwwroot/antenv/bin/python3 ]; then
  PY=/home/site/wwwroot/antenv/bin/python3
else
  PY=python3
fi
exec "$PY" -m uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
