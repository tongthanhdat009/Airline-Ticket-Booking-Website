#!/bin/bash
set -e

# ==========================================
# PRODUCTION DEPLOY SCRIPT
# ==========================================
# Script này KHÔNG build - chỉ nhận artifacts đã build sẵn
# từ CI/CD pipeline và deploy lên VPS.
#
# Artifacts được upload vào /tmp/airline-deploy/:
#   /tmp/airline-deploy/backend/*.jar   (Spring Boot JAR)
#   /tmp/airline-deploy/frontend/*      (React build)
# ==========================================

DEPLOY_DIR="/opt/airline-prod"
BACKEND_DIR="$DEPLOY_DIR/backend"
FRONTEND_DIR="$DEPLOY_DIR/frontend"
STAGING_DIR="/tmp/airline-deploy"
BACKEND_PORT=8080

echo "=========================================="
echo "  Deploying PRODUCTION (pre-built)"
echo "  Time: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "=========================================="

# Kiểm tra artifacts có tồn tại
if [ ! -d "$STAGING_DIR/backend" ] || [ -z "$(ls -A $STAGING_DIR/backend/*.jar 2>/dev/null)" ]; then
    echo "❌ ERROR: No backend JAR found in $STAGING_DIR/backend/"
    exit 1
fi

if [ ! -d "$STAGING_DIR/frontend" ] || [ -z "$(ls -A $STAGING_DIR/frontend/ 2>/dev/null)" ]; then
    echo "❌ ERROR: No frontend files found in $STAGING_DIR/frontend/"
    exit 1
fi

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
fi

# Kill process trên backend port (phòng trường hợp PID file sai)
fuser -k ${BACKEND_PORT}/tcp 2>/dev/null || true
sleep 2

# ==================== BACKUP ====================
echo ""
echo "💾 Backing up current version..."

if [ -f "$BACKEND_DIR/app.jar" ]; then
    cp "$BACKEND_DIR/app.jar" "$BACKEND_DIR/app.jar.bak"
    echo "  Backend JAR backed up"
fi

# ==================== DEPLOY FILES ====================
echo ""
echo "📦 Deploying new files..."

mkdir -p "$BACKEND_DIR" "$FRONTEND_DIR" "$DEPLOY_DIR/logs"

# Copy JAR
cp "$STAGING_DIR/backend/"*.jar "$BACKEND_DIR/app.jar"
echo "  ✅ Backend JAR deployed"

# Copy frontend (xóa cũ, copy mới)
rm -rf "${FRONTEND_DIR:?}"/*
cp -r "$STAGING_DIR/frontend/"* "$FRONTEND_DIR/"
echo "  ✅ Frontend deployed"

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
rm -rf "$STAGING_DIR"

echo ""
echo "=========================================="
echo "  ✅ PRODUCTION deploy completed!"
echo "  Backend: http://localhost:$BACKEND_PORT/api"
echo "  Frontend: served by Nginx"
echo "=========================================="
