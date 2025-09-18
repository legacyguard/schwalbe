#!/bin/bash

# Mobile Emotional Sync Deployment Script
# Safe deployment with feature flag controls

set -e

echo "🚀 Starting Mobile Emotional Sync Deployment..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're on the correct branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "feat/mobile-emotional-sync" ]; then
    print_warning "Not on feat/mobile-emotional-sync branch. Current: $CURRENT_BRANCH"
    echo "Switch to correct branch? (y/n)"
    read -r response
    if [ "$response" = "y" ]; then
        git checkout feat/mobile-emotional-sync
        print_success "Switched to feat/mobile-emotional-sync branch"
    else
        print_error "Deployment cancelled"
        exit 1
    fi
fi

# Run comprehensive tests
print_status "Running comprehensive tests..."

print_status "1. TypeScript type checking..."
npm --workspace=@schwalbe/mobile run typecheck
print_success "TypeScript check passed ✅"

print_status "2. Running test suite..."
npm --workspace=@schwalbe/mobile run test
print_success "All tests passed ✅"

print_status "3. Testing production build..."
npm --workspace=@schwalbe/mobile run build
print_success "Production build successful ✅"

# Environment setup
print_status "Setting up deployment environments..."

# Check environment files
if [ ! -f ".env.production" ]; then
    print_error ".env.production not found!"
    exit 1
fi

if [ ! -f ".env.staging" ]; then
    print_error ".env.staging not found!"
    exit 1
fi

print_success "Environment files configured ✅"

# Feature flag verification
print_status "Verifying feature flag configuration..."

# Check production flags are disabled
PROD_MASTER_FLAG=$(grep "EXPO_PUBLIC_EMOTIONAL_SYNC_ENABLED" .env.production | cut -d'=' -f2)
if [ "$PROD_MASTER_FLAG" != "0" ]; then
    print_error "Production master flag should be disabled (0)!"
    exit 1
fi

print_success "Production flags safely disabled ✅"

# Deployment phase selection
echo ""
echo "Select deployment phase:"
echo "1. Stage 1: Deploy with all flags disabled (SAFE)"
echo "2. Stage 2: Enable Sofia Firefly only"
echo "3. Stage 3: Enable emotional messages"
echo "4. Stage 4: Enable achievements"
echo "5. Stage 5: Full emotional sync"
echo "6. Rollback: Disable all features"
echo ""
read -p "Enter phase (1-6): " phase

case $phase in
    1)
        print_status "Phase 1: Deploying with all flags disabled..."
        cp .env.production .env
        print_success "Safe deployment configuration active"
        ;;
    2)
        print_status "Phase 2: Enabling Sofia Firefly..."
        cp .env.production .env
        sed -i '' 's/EXPO_PUBLIC_EMOTIONAL_SYNC_ENABLED=0/EXPO_PUBLIC_EMOTIONAL_SYNC_ENABLED=1/' .env
        sed -i '' 's/EXPO_PUBLIC_SOFIA_FIREFLY_ENABLED=0/EXPO_PUBLIC_SOFIA_FIREFLY_ENABLED=1/' .env
        print_success "Sofia Firefly enabled for testing"
        ;;
    3)
        print_status "Phase 3: Enabling emotional messages..."
        cp .env.production .env
        sed -i '' 's/EXPO_PUBLIC_EMOTIONAL_SYNC_ENABLED=0/EXPO_PUBLIC_EMOTIONAL_SYNC_ENABLED=1/' .env
        sed -i '' 's/EXPO_PUBLIC_SOFIA_FIREFLY_ENABLED=0/EXPO_PUBLIC_SOFIA_FIREFLY_ENABLED=1/' .env
        sed -i '' 's/EXPO_PUBLIC_EMOTIONAL_MESSAGES_ENABLED=0/EXPO_PUBLIC_EMOTIONAL_MESSAGES_ENABLED=1/' .env
        print_success "Sofia Firefly + Emotional Messages enabled"
        ;;
    4)
        print_status "Phase 4: Enabling achievements..."
        cp .env.production .env
        sed -i '' 's/EXPO_PUBLIC_EMOTIONAL_SYNC_ENABLED=0/EXPO_PUBLIC_EMOTIONAL_SYNC_ENABLED=1/' .env
        sed -i '' 's/EXPO_PUBLIC_SOFIA_FIREFLY_ENABLED=0/EXPO_PUBLIC_SOFIA_FIREFLY_ENABLED=1/' .env
        sed -i '' 's/EXPO_PUBLIC_EMOTIONAL_MESSAGES_ENABLED=0/EXPO_PUBLIC_EMOTIONAL_MESSAGES_ENABLED=1/' .env
        sed -i '' 's/EXPO_PUBLIC_ACHIEVEMENTS_ENABLED=0/EXPO_PUBLIC_ACHIEVEMENTS_ENABLED=1/' .env
        print_success "Core emotional features enabled"
        ;;
    5)
        print_status "Phase 5: Full emotional sync..."
        cp .env.staging .env
        print_success "Full emotional sync enabled"
        ;;
    6)
        print_status "Rollback: Disabling all features..."
        cp .env.production .env
        print_success "All features disabled - rollback complete"
        ;;
    *)
        print_error "Invalid phase selected"
        exit 1
        ;;
esac

echo ""
print_status "Current feature flag status:"
echo "$(grep EXPO_PUBLIC_ .env)"

echo ""
print_status "Deployment summary:"
echo "✅ Code tested and validated"
echo "✅ Environment configured"
echo "✅ Feature flags set"
echo "✅ Ready for deployment"

echo ""
print_success "🎉 DEPLOYMENT PREPARATION COMPLETE!"
echo ""
echo "Next steps:"
echo "1. Review the current .env configuration above"
echo "2. Deploy to your mobile app platform (Expo, App Store, etc.)"
echo "3. Monitor user engagement and performance"
echo "4. Use this script to progress through phases"

echo ""
echo "Deployment monitoring:"
echo "- Check app performance metrics"
echo "- Monitor user engagement with new features"
echo "- Watch for any error reports"
echo "- Collect user feedback"

echo ""
print_warning "Remember: You can always rollback using phase 6!"

print_success "Mobile Emotional Sync deployment script completed successfully! 🚀"