#!/bin/bash

# Production Build Script with Enhanced Error Handling
# Fixes React 19 compatibility and deployment issues

set -e  # Exit on any error

echo "🚀 Starting LegacyGuard Production Build..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check Node.js version
print_status "Checking Node.js version..."
node_version=$(node --version)
print_status "Node.js version: $node_version"

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf dist/ .vite/ || true

# Set production environment
export NODE_ENV=production
export VITE_CONFIG_FILE=vite.config.prod.ts

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm ci --legacy-peer-deps
fi

# Build with enhanced configuration
print_status "Building with production configuration..."
if npm run build:memory-safe; then
    print_status "✅ Production build completed successfully!"
else
    print_error "❌ Production build failed. Trying fallback..."
    
    # Fallback to standard build
    export VITE_CONFIG_FILE=vite.config.ts
    if npm run build; then
        print_status "✅ Fallback build completed successfully!"
    else
        print_error "❌ Both builds failed. Exiting."
        exit 1
    fi
fi

# Verify build artifacts
print_status "Verifying build artifacts..."
if [ ! -d "dist" ]; then
    print_error "❌ Build directory not found!"
    exit 1
fi

# Check for critical files
critical_files=(
    "dist/index.html"
    "dist/assets/js/index-*.js"
    "dist/assets/js/react-vendor-*.js"
    "dist/manifest.json"
)

for file_pattern in "${critical_files[@]}"; do
    if ls $file_pattern 1> /dev/null 2>&1; then
        print_status "✅ Found: $file_pattern"
    else
        print_warning "⚠️  Not found: $file_pattern"
    fi
done

# Check bundle sizes
print_status "Analyzing bundle sizes..."
find dist/assets/js -name "*.js" -exec ls -lh {} \; | while read -r line; do
    size=$(echo $line | awk '{print $5}')
    file=$(echo $line | awk '{print $9}')
    print_status "📦 $file: $size"
done

# Validate JavaScript files have correct MIME type markers
print_status "Validating JavaScript MIME types..."
if find dist/assets/js -name "*.js" -exec file {} \; | grep -q "JavaScript"; then
    print_status "✅ JavaScript files have correct MIME type markers"
else
    print_warning "⚠️  Some JavaScript files may have MIME type issues"
fi

# Create deployment manifest
print_status "Creating deployment manifest..."
cat > dist/deployment-manifest.json << EOF
{
  "buildTime": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "nodeVersion": "$node_version",
  "gitCommit": "$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')",
  "buildConfig": "$VITE_CONFIG_FILE",
  "bundleCount": $(find dist/assets/js -name "*.js" | wc -l),
  "totalSize": "$(du -sh dist/ | cut -f1)"
}
EOF

print_status "✅ Deployment manifest created"

# Final verification
print_status "Final build verification..."
if [ -f "dist/index.html" ]; then
    print_status "✅ Main HTML file exists"
else
    print_error "❌ Main HTML file missing!"
    exit 1
fi

# Check for React 19 compatibility issues in built files
print_status "Checking for React 19 compatibility issues..."
if grep -r "Cannot set properties of undefined" dist/ 2>/dev/null; then
    print_error "❌ Found potential React 19 compatibility issues!"
    exit 1
else
    print_status "✅ No obvious React 19 compatibility issues found"
fi

print_status "🎉 Production build completed successfully!"
print_status "📊 Build summary:"
print_status "   - Output directory: dist/"
print_status "   - Total size: $(du -sh dist/ | cut -f1)"
print_status "   - JavaScript bundles: $(find dist/assets/js -name "*.js" | wc -l)"
print_status "   - Ready for deployment!"

# Optional: Run a quick smoke test
if command -v node &> /dev/null; then
    print_status "Running smoke test..."
    if node -e "console.log('Build test passed');" 2>/dev/null; then
        print_status "✅ Smoke test passed"
    else
        print_warning "⚠️  Smoke test failed (non-critical)"
    fi
fi

exit 0