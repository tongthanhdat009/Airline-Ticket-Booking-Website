#!/bin/bash
set -e

# ==========================================
# PRODUCTION DEPLOY SCRIPT
# ==========================================
# Script này KHÔNG build - chỉ nhận artifacts đã upload bởi CI/CD:
#   JAR đã nằm sẵn tại : /opt/airline-prod/backend/app.jar
#   Frontend tar tại   : /tmp/frontend-dist.tar.gz
# ==========================================

DEPLOY_DIR="/opt/airline-prod"
BACKEND_DIR="$DEPLOY_DIR/backend"
FRONTEND_DIR="$DEPLOY_DIR/frontend"
FRONTEND_TAR="/tmp/frontend-dist.tar.gz"
BACKEND_PORT=8080

echo "=========================================="
echo "  Deploying PRODUCTION (pre-built)"
echo "  Time: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "=========================================="

# Kiểm tra artifacts có tồn tại
if [ ! -f "$BACKEND_DIR/app.jar" ]; then
    echo "❌ ERROR: JAR not found at $BACKEND_DIR/app.jar"
    exit 1
fi

if [ ! -f "$FRONTEND_TAR" ]; then
    echo "❌ ERROR: Frontend tar not found at $FRONTEND_TAR"
    exit 1
fi

# ==================== DEPLOY FRONTEND ====================
echo ""
echo "🎨 Deploying frontend..."

mkdir -p "$FRONTEND_DIR" "$DEPLOY_DIR/logs"
rm -rf "${FRONTEND_DIR:?}"/*
tar -xzf "$FRONTEND_TAR" -C "$FRONTEND_DIR"
echo "  ✅ Frontend extracted to $FRONTEND_DIR"

# ==================== STOP BACKEND ====================
echo ""
echo "🛑 Stopping backend..."

if [ -f "$BACKEND_DIR/app.pid" ]; then
    PID=$(cat "$BACKEND_DIR/app.pid")
    if ps -p "$PID" > /dev/null 2>&1; then
        echo "  Stopping PID: $PID"
        kill "$PID"
        sleep 5
    fi
    rm -f "$BACKEND_DIR/app.pid"
fi

# Kill process còn sót trên port
fuser -k ${BACKEND_PORT}/tcp 2>/dev/null || true
sleep 2

# ==================== START BACKEND ====================
echo ""
echo "🚀 Starting backend..."

cd "$BACKEND_DIR"

# Load environment variables từ .env
if [ -f "$DEPLOY_DIR/.env" ]; then
    set -a
    source "$DEPLOY_DIR/.env"
    set +a
    echo "  .env loaded from $DEPLOY_DIR/.env"
fi

nohup java -jar \
    -Dserver.port=$BACKEND_PORT \
    -Xms512m -Xmx1024m \
    app.jar > "$DEPLOY_DIR/logs/backend.log" 2>&1 &

echo $! > "$BACKEND_DIR/app.pid"
echo "  Backend started on port $BACKEND_PORT (PID: $(cat "$BACKEND_DIR/app.pid"))"

# Chờ backend khởi động
echo "  Waiting for backend to start..."
sleep 10

# Kiểm tra backend
if ps -p "$(cat "$BACKEND_DIR/app.pid")" > /dev/null; then
    echo "  ✅ Backend is running!"
else
    echo "  ❌ ERROR: Backend failed to start!"
    tail -50 "$DEPLOY_DIR/logs/backend.log"
    exit 1
fi

# ==================== RELOAD NGINX ====================
echo ""
echo "🔄 Reloading Nginx..."
nginx -t && systemctl reload nginx || echo "⚠️ Nginx reload skipped (not installed or config error)"

# ==================== CLEANUP ====================
rm -f "$FRONTEND_TAR"

echo ""
echo "=========================================="
echo "  ✅ PRODUCTION deploy completed!"
echo "  Backend: http://localhost:$BACKEND_PORT/api"
echo "  Frontend: served by Nginx"
echo "=========================================="
