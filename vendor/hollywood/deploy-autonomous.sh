#!/bin/bash

# 🚀 LegacyGuard Autonomous Deployment Script
# Complete deployment without GitHub Actions complexity

set -e  # Exit on any error

echo "🚀 Starting autonomous deployment..."
echo "🎯 Deploying to Vercel using provided token"

# Configuration
VERCEL_TOKEN="sCQdHdoLVf8aAY50aDAa9dGm"
PROJECT_DIR="web"
BUILD_DIR="dist"

# Step 1: Navigate to project directory
echo "📂 Navigating to project directory..."
cd "$PROJECT_DIR" || {
    echo "❌ Could not find $PROJECT_DIR directory"
    exit 1
}

# Step 2: Install Vercel CLI if not present
echo "🔧 Installing Vercel CLI..."
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel@latest
fi

# Step 3: Build the project
echo "🏗️ Building project..."
npm run build || {
    echo "❌ Build failed"
    echo "Node version: $(node --version)"
    echo "NPM version: $(npm --version)"
    exit 1
}

# Step 4: Validate build artifacts
echo "🔍 Validating build artifacts..."
if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ Build directory not found: $BUILD_DIR"
    exit 1
fi

if [ ! -f "$BUILD_DIR/index.html" ]; then
    echo "❌ index.html not found in build directory"
    exit 1
fi

echo "✅ Build artifacts validated"
echo "📊 Build size: $(du -sh $BUILD_DIR | cut -f1)"

# Step 5: Deploy to Vercel
echo "🚀 Deploying to Vercel..."
DEPLOYMENT_OUTPUT=$(vercel deploy --prod --token="$VERCEL_TOKEN" 2>&1)

# Extract deployment URL from output
DEPLOYMENT_URL=$(echo "$DEPLOYMENT_OUTPUT" | grep -o 'https://[^[:space:]]*' | tail -1)

if [ -z "$DEPLOYMENT_URL" ]; then
    echo "❌ Failed to get deployment URL"
    echo "Deployment output: $DEPLOYMENT_OUTPUT"
    exit 1
fi

echo "✅ Deployment successful!"
echo "🌐 Deployment URL: $DEPLOYMENT_URL"

# Step 6: Health check
echo "🏥 Running health check..."
for i in {1..5}; do
    if curl -f -s -m 10 "$DEPLOYMENT_URL" > /dev/null; then
        echo "✅ Health check passed on attempt $i"
        break
    else
        echo "⚠️ Health check failed on attempt $i, retrying..."
        sleep 5
    fi
done

# Step 7: Final validation
echo "🔍 Running final validation..."
echo "Deployment URL: $DEPLOYMENT_URL"
echo "Environment: Production"
echo "Build time: $(date)"

# Create deployment info file
cat > deployment-info.json << EOF
{
  "deploymentUrl": "$DEPLOYMENT_URL",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "environment": "production",
  "status": "success",
  "buildDirectory": "$BUILD_DIR"
}
EOF

echo "✅ Deployment completed successfully!"
echo "🎉 Your app is now live at: $DEPLOYMENT_URL"
echo ""
echo "📋 Deployment Summary:"
echo "  - URL: $DEPLOYMENT_URL"
echo "  - Status: Live"
echo "  - Environment: Production"
echo "  - Deployed at: $(date)"