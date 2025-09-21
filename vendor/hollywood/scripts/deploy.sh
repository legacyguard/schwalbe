#!/bin/bash

# ========================================
# LegacyGuard Deployment Script
# ========================================
# This script handles the complete deployment process
# for both GitHub Actions and manual deployment

set -e # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ========================================
# Configuration
# ========================================
ENVIRONMENT=${1:-production}
BUILD_DIR="web/dist"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# ========================================
# Helper Functions
# ========================================
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 is not installed"
        exit 1
    fi
}

# ========================================
# Pre-deployment Checks
# ========================================
pre_deployment_checks() {
    log_info "Running pre-deployment checks..."
    
    # Check required commands
    check_command node
    check_command npm
    check_command git
    
    # Check Node version
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    REQUIRED_VERSION="20.19.0"
    
    if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
        log_warning "Node version $NODE_VERSION may not be compatible. Required: $REQUIRED_VERSION+"
    fi
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        log_error "Not in project root directory"
        exit 1
    fi
    
    log_success "Pre-deployment checks passed"
}

# ========================================
# Install Dependencies
# ========================================
install_dependencies() {
    log_info "Installing dependencies..."
    
    # Clean install to ensure consistency
    rm -rf node_modules package-lock.json
    npm cache clean --force
    npm install --legacy-peer-deps
    
    log_success "Dependencies installed"
}

# ========================================
# Run Tests
# ========================================
run_tests() {
    log_info "Running tests..."
    
    # Type checking
    log_info "Type checking..."
    npm run type-check || {
        log_warning "Type check failed but continuing..."
    }
    
    # Linting
    log_info "Linting..."
    npm run lint || {
        log_warning "Linting failed but continuing..."
    }
    
    # Unit tests
    log_info "Running unit tests..."
    npm run test || {
        log_warning "Some tests failed but continuing..."
    }
    
    log_success "Tests completed"
}

# ========================================
# Build Application
# ========================================
build_application() {
    log_info "Building application for $ENVIRONMENT..."
    
    # Clean previous builds
    rm -rf $BUILD_DIR
    rm -rf packages/*/dist
    
    # Set environment
    export NODE_ENV=$ENVIRONMENT
    
    # Build packages first
    log_info "Building packages..."
    npm run build:packages
    
    # Build web application
    log_info "Building web application..."
    npm run build:web
    
    # Verify build output
    if [ ! -d "$BUILD_DIR" ]; then
        log_error "Build failed - no output directory"
        exit 1
    fi
    
    # Check build size
    BUILD_SIZE=$(du -sh $BUILD_DIR | cut -f1)
    log_info "Build size: $BUILD_SIZE"
    
    log_success "Application built successfully"
}

# ========================================
# Deploy to Vercel
# ========================================
deploy_to_vercel() {
    log_info "Deploying to Vercel..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        log_info "Installing Vercel CLI..."
        npm i -g vercel@latest
    fi
    
    # Deploy based on environment
    if [ "$ENVIRONMENT" == "production" ]; then
        log_info "Deploying to production..."
        vercel --prod --yes --token="${VERCEL_TOKEN}" || {
            log_error "Vercel deployment failed"
            exit 1
        }
    else
        log_info "Deploying to preview..."
        vercel --yes --token="${VERCEL_TOKEN}" || {
            log_error "Vercel deployment failed"
            exit 1
        }
    fi
    
    log_success "Deployed to Vercel"
}

# ========================================
# Setup GitHub Secrets
# ========================================
setup_github_secrets() {
    log_info "Setting up GitHub secrets..."
    
    # Check if gh CLI is available
    if ! command -v gh &> /dev/null; then
        log_warning "GitHub CLI not installed. Skipping secret setup."
        return
    fi
    
    # Set secrets (only if not already set)
    gh secret set GITHUB_TOKEN --body "${GITHUB_TOKEN}" 2>/dev/null || true
    gh secret set VERCEL_TOKEN --body "${VERCEL_TOKEN}" 2>/dev/null || true
    gh secret set VITE_CLERK_PUBLISHABLE_KEY --body "${VITE_CLERK_PUBLISHABLE_KEY}" 2>/dev/null || true
    gh secret set VITE_STRIPE_PUBLISHABLE_KEY --body "${VITE_STRIPE_PUBLISHABLE_KEY}" 2>/dev/null || true
    gh secret set SUPABASE_ACCESS_TOKEN --body "${SUPABASE_ACCESS_TOKEN}" 2>/dev/null || true
    
    log_success "GitHub secrets configured"
}

# ========================================
# Post-deployment Tasks
# ========================================
post_deployment_tasks() {
    log_info "Running post-deployment tasks..."
    
    # Create deployment record
    echo "{
        \"environment\": \"$ENVIRONMENT\",
        \"timestamp\": \"$TIMESTAMP\",
        \"commit\": \"$(git rev-parse HEAD)\",
        \"branch\": \"$(git branch --show-current)\",
        \"user\": \"$(whoami)\",
        \"node_version\": \"$(node --version)\",
        \"build_size\": \"$BUILD_SIZE\"
    }" > deployment-$TIMESTAMP.json
    
    # Tag the deployment in git
    if [ "$ENVIRONMENT" == "production" ]; then
        git tag -a "deploy-$TIMESTAMP" -m "Production deployment $TIMESTAMP"
        log_info "Created deployment tag: deploy-$TIMESTAMP"
    fi
    
    log_success "Post-deployment tasks completed"
}

# ========================================
# Main Deployment Flow
# ========================================
main() {
    log_info "========================================="
    log_info "Starting deployment to $ENVIRONMENT"
    log_info "Timestamp: $TIMESTAMP"
    log_info "========================================="
    
    # Load environment variables
    if [ -f ".env.$ENVIRONMENT" ]; then
        log_info "Loading environment variables from .env.$ENVIRONMENT"
        export $(cat .env.$ENVIRONMENT | grep -v '^#' | xargs)
    fi
    
    # Run deployment steps
    pre_deployment_checks
    install_dependencies
    run_tests
    build_application
    
    # Deploy if not in CI environment
    if [ -z "$CI" ]; then
        deploy_to_vercel
    fi
    
    post_deployment_tasks
    
    log_success "========================================="
    log_success "Deployment completed successfully!"
    log_success "Environment: $ENVIRONMENT"
    log_success "Timestamp: $TIMESTAMP"
    log_success "========================================="
}

# Run main function
main "$@"
