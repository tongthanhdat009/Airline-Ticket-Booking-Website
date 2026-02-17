#!/bin/bash
set -e

# ==========================================
# PRODUCTION DEPLOY SCRIPT
# ==========================================

# Cấu hình
ENV="production"
DEPLOY_DIR="/opt/airline-prod"
BACKEND_DIR="$DEPLOY_DIR/backend"
FRONTEND_DIR="$DEPLOY_DIR/frontend"
# Use REPO_URL from workflow, or fallback to default
GIT_REPO_URL="${REPO_URL:-https://github.com/tongthanhdat009/Airline-Ticket-Booking-Website.git}"
GIT_BRANCH="main"
BACKEND_PORT=8080
DB_NAME="airline_prod_db"
DB_USER="${DB_USERNAME:-airline_user}"
SPRING_PROFILE="prod"

echo "=========================================="
echo "  Deploying PRODUCTION to $DEPLOY_DIR"
echo "  Branch: $GIT_BRANCH"
echo "=========================================="

# Tạo thư mục tạm để clone code
TEMP_DIR=$(mktemp -d)
cd $TEMP_DIR

echo "📥 Cloning repository..."

# Clone repo (git credentials already configured by workflow)
git clone -b $GIT_BRANCH --depth 1 $GIT_REPO_URL temp-repo

cd temp-repo

# ==================== BACKEND DEPLOY ====================
echo ""
echo "🚀 Deploying Backend..."

# Dừng application hiện tại
if [ -f "$BACKEND_DIR/app.pid" ]; then
    PID=$(cat $BACKEND_DIR/app.pid)
    if ps -p $PID > /dev/null 2>&1; then
        echo "🛑 Stopping backend (PID: $PID)..."
        kill $PID
        sleep 5
    fi
fi

# Kill all processes on backend port
fuser -k ${BACKEND_PORT}/tcp 2>/dev/null || true
sleep 2

# Backup version cũ (nếu có)
if [ -d "$BACKEND_DIR" ] && [ "$(ls -A $BACKEND_DIR 2>/dev/null)" ]; then
    echo "💾 Backing up old backend..."
    cp -r $BACKEND_DIR ${BACKEND_DIR}_backup_$(date +%Y%m%d_%H%M%S) || true
fi

# Build backend
echo "🔨 Building Spring Boot backend..."
cd J2EE-Backend

# Setup Maven wrapper permissions
chmod +x mvnw 2>/dev/null || true

# Build
./mvnw clean package -DskipTests -q

# Copy jar file
mkdir -p $BACKEND_DIR
cp target/*.jar $BACKEND_DIR/app.jar

# Copy application properties (nếu có)
if [ -f "src/main/resources/application-${ENV}.properties" ]; then
    cp src/main/resources/application-${ENV}.properties $BACKEND_DIR/
fi

# Create log directory
mkdir -p $DEPLOY_DIR/logs

# ==================== FRONTEND DEPLOY ====================
echo ""
echo "🎨 Deploying Frontend..."

cd ../J2EE-Frontend

# Check pnpm or npm
if command -v pnpm &> /dev/null; then
    echo "📦 Installing dependencies with pnpm..."
    pnpm install --frozen-lockfile --silent

    echo "🔨 Building React frontend..."
    pnpm build --silent
elif command -v npm &> /dev/null; then
    echo "📦 Installing dependencies with npm..."
    npm install --silent

    echo "🔨 Building React frontend..."
    npm run build --silent
else
    echo "❌ ERROR: Neither pnpm nor npm found!"
    exit 1
fi

# Copy build to production directory
mkdir -p $FRONTEND_DIR
rm -rf $FRONTEND_DIR/*
cp -r dist/* $FRONTEND_DIR/

# ==================== START SERVICES ====================
echo ""
echo "🚀 Starting services..."

# Start backend với production profile
cd $BACKEND_DIR

# Load environment variables if .env exists
if [ -f "/opt/airline-prod/.env" ]; then
    export $(cat /opt/airline-prod/.env | grep -v '^#' | xargs)
fi

nohup java -jar -Dspring.profiles.active=$SPRING_PROFILE \
    -Dserver.port=$BACKEND_PORT \
    -Xms512m -Xmx1024m \
    app.jar > $DEPLOY_DIR/logs/backend.log 2>&1 &

echo $! > $BACKEND_DIR/app.pid
echo "✅ Backend started on port $BACKEND_PORT (PID: $(cat $BACKEND_DIR/app.pid))"

# Wait for backend to start
sleep 10

# Check if backend is running
if ps -p $(cat $BACKEND_DIR/app.pid) > /dev/null; then
    echo "✅ Backend is running!"
else
    echo "❌ ERROR: Backend failed to start! Check logs at $DEPLOY_DIR/logs/backend.log"
    tail -50 $DEPLOY_DIR/logs/backend.log
    exit 1
fi

# Cleanup
rm -rf $TEMP_DIR

echo ""
echo "=========================================="
echo "  ✅ PRODUCTION deploy completed!"
echo "  Backend: http://43.255.120.80:$BACKEND_PORT/api"
echo "  Frontend: http://43.255.120.80"
echo "=========================================="
