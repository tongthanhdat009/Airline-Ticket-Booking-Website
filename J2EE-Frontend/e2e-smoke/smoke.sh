#!/usr/bin/env bash
# FE smoke: 5 SPA routes via vite preview (no e2e framework in repo).
# ponytail: curl asserts HTTP only, add playwright when UI asserts needed.
set -u
PORT=${1:-4173}
BASE="http://localhost:$PORT"
ROUTES=(/ /online-check-in /tra-cuu-chuyen-bay /admin/login /thanh-toan)
cd "$(dirname "$0")/.." || exit 1
pnpm preview --port "$PORT" --strictPort >/tmp/e2e-preview.log 2>&1 &
PID=$!
trap "kill $PID 2>/dev/null" EXIT
for _ in $(seq 1 30); do curl -sf -o /dev/null "$BASE/" && break || sleep 1; done
FAIL=0
for r in "${ROUTES[@]}"; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE$r")
  echo "$r -> $CODE"
  [ "$CODE" = 200 ] || FAIL=1
done
exit $FAIL
