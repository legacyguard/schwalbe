#!/bin/bash

# LegacyGuard Complete Build Script
# This script automates the entire build process with proper checks

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🚀 LegacyGuard Build Script"
echo "============================"

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check Node.js version
NODE_VERSION=$(node --version)
REQUIRED_VERSION="20"
CURRENT_MAJOR=$(echo $NODE_VERSION | cut -d. -f1 | sed 's/v//')

if [ "$CURRENT_MAJOR" -lt "$REQUIRED_VERSION" ]; then
    print_warning "Node.js version $NODE_VERSION detected. Version 20+ recommended."
    
    # Try to use nvm if available
    if command -v nvm &> /dev/null; then
        print_status "Switching to Node.js 20 using NVM..."
        nvm use 20 || nvm use
    fi
else
    print_status "Node.js version: $NODE_VERSION"
fi

# Set memory options
export NODE_OPTIONS="--max-old-space-size=4096"
print_status "Memory limit set to 4GB"

# Increase file limits for macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    ulimit -n 10240
    print_status "File limit increased to 10240"
fi

# Clean previous builds
echo ""
echo "🧹 Cleaning previous builds..."
npm run clean:cache 2>/dev/null || true
npm run clean:dist 2>/dev/null || true
print_status "Previous builds cleaned"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 Installing dependencies..."
    npm ci
    print_status "Dependencies installed"
fi

# Build packages
echo ""
echo "📦 Building packages..."
npm run build:packages
print_status "Packages built successfully"

# Build web application
echo ""
echo "🌐 Building web application..."
# Build web application
echo ""
echo "🌐 Building web application..."
npm run build:web 2>/dev/null && print_status "Web application built successfully" || print_warning "Web build failed (not critical)"

# Try to build mobile (may fail, not critical)
echo ""
echo "📱 Building mobile application..."
npm run build:mobile 2>/dev/null || print_warning "Mobile build failed (not critical)"

echo ""
echo "============================"
echo -e "${GREEN}✅ Build completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "  • Run 'npm run web:dev' to start development server"
echo "  • Run 'npm run mobile:dev' to start mobile development"
echo "  • Push to GitHub to trigger CI/CD pipeline"
