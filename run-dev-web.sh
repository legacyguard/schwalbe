#!/bin/bash

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "next\|turbo" 2>/dev/null || true

# Start the shared packages in watch mode
echo "📦 Building shared packages..."
cd packages/shared && npm run dev &
cd ../logic && npm run dev &
cd ../ui && npm run dev &

# Wait a bit for packages to build
sleep 2

# Start the Vite web app
echo "🚀 Starting web application..."
cd ../../apps/web && npm run dev

echo "✅ Web development server is running at http://localhost:3000"
echo "📱 To run the mobile app separately, use: cd apps/mobile && npm run dev"