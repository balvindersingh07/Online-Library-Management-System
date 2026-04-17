#!/bin/bash
set -euo pipefail
# Dependencies should be installed at deploy time (Oryx / GitHub Actions).
# Avoiding `pip install` here prevents cold-start timeouts on Free (F1) App Service.
cd /home/site/wwwroot/backend
exec python3 -m uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
