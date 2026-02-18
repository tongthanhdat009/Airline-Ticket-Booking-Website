#!/bin/bash
set -e

# ==========================================
# PRODUCTION DEPLOY SCRIPT (SYSTEMD MODE)
# ==========================================

DEPLOY_DIR="/opt/airline-prod"
BACKEND_DIR="$DEPLOY_DIR/backend"
SERVICE_NAME="airline"

echo "=========================================="
echo "  Deploying PRODUCTION"
echo "  Time: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "=========================================="

# ==================== CHECK BACKEND ====================
if [ ! -f "$BACKEND_DIR/app.jar" ]; then
    echo "❌ ERROR: JAR not found at $BACKEND_DIR/app.jar"
    exit 1
fi

echo "  ✅ Backend artifact found"

# ==================== RESTART BACKEND ====================
echo ""
echo "🚀 Restarting backend via systemd..."

sudo systemctl restart "$SERVICE_NAME"

sleep 5

# ==================== VERIFY BACKEND ====================
if sudo systemctl is-active --quiet "$SERVICE_NAME"; then
    echo "  ✅ Backend service is running!"
else
    echo "  ❌ ERROR: Backend service failed!"
    sudo systemctl status "$SERVICE_NAME"
    exit 1
fi

# ==================== RELOAD NGINX ====================
echo ""
echo "🔄 Reloading Nginx..."
sudo nginx -t
sudo systemctl reload nginx

echo ""
echo "=========================================="
echo "  ✅ PRODUCTION deploy completed!"
echo "=========================================="
