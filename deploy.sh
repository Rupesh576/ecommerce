#!/bin/bash
set -e

echo "🚀 Starting Deployment..."

# Navigate to project root directory
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$DIR"

echo "📥 Pulling latest code from GitHub..."
git pull origin main

echo "📦 Installing backend packages..."
cd "$DIR/backend"
npm install --omit=dev

echo "🔄 Restarting backend process (PM2)..."
pm2 restart ecommerce-backend || pm2 start server.js --name "ecommerce-backend"

echo "🏗️ Building frontend..."
cd "$DIR/frontend"
npm install
npm run build

echo "=========================================="
echo "🎉 Deployment Complete! Your site is live."
echo "=========================================="
