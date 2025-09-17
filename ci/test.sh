#!/bin/bash
set -e

# CI Test Script for Hollywood Monorepo
# This script is used by GitHub Actions to run tests

echo "🔍 Starting CI Test Suite..."

# Install dependencies with frozen lockfile to ensure consistency
echo "📦 Installing dependencies..."
if [ -f "yarn.lock" ]; then
    yarn install --frozen-lockfile
else
    npm ci --legacy-peer-deps
fi

# Run the test command from the root package.json
echo "🧪 Running tests..."
if [ -f "yarn.lock" ]; then
    yarn test
else
    npm test
fi

echo "✅ CI tests completed successfully!"
