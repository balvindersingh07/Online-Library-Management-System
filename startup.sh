#!/bin/bash
set -eo pipefail
export PYTHONUNBUFFERED=1
ROOT=/home/site/wwwroot
cd "$ROOT/backend" || {
  echo "FATAL: missing $ROOT/backend" >&2
  ls -la "$ROOT" >&2 || true
  exit 1
}
if [ -f "$ROOT/antenv/bin/activate" ]; then
  # shellcheck source=/dev/null
  source "$ROOT/antenv/bin/activate"
  PY=python
else
  PY=python3
  echo "WARN: antenv missing; using $PY (set SCM_DO_BUILD_DURING_DEPLOYMENT=1)" >&2
fi
# Azure sets PORT; some stacks expose WEBSITES_PORT
if [ -z "${PORT:-}" ] && [ -n "${WEBSITES_PORT:-}" ]; then
  export PORT="$WEBSITES_PORT"
fi
PORT="${PORT:-8000}"
echo "STARTUP root=$ROOT port=$PORT py=$($PY -V 2>&1) pwd=$(pwd)" >&2
exec "$PY" -m uvicorn app.main:app \
  --host 0.0.0.0 \
  --port "$PORT" \
  --proxy-headers \
  --forwarded-allow-ips='*' \
  --log-level info
