#!/bin/bash

# LegacyGuard Staging Deployment Script
# This script deploys the application to the staging environment

set -e  # Exit on error

echo "🚀 Starting LegacyGuard Staging Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're on the staging branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "staging" ] && [ "$CURRENT_BRANCH" != "production-preparation-phase" ]; then
    echo -e "${YELLOW}Warning: Not on staging branch. Current branch: $CURRENT_BRANCH${NC}"
    read -p "Do you want to continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Ensure we have the latest code
echo "📥 Pulling latest changes..."
git pull origin $CURRENT_BRANCH

# Run tests
echo "🧪 Running tests..."
npm run test -- --run || {
    echo -e "${RED}Tests failed! Aborting deployment.${NC}"
    exit 1
}

# Build the application
echo "🔨 Building application..."
npm run build || {
    echo -e "${RED}Build failed! Aborting deployment.${NC}"
    exit 1
}

# Create staging environment variables file
echo "🔐 Setting up staging environment variables..."
cat > .env.staging << EOF
VITE_APP_ENV=staging
VITE_CLERK_PUBLISHABLE_KEY=${VITE_CLERK_STAGING_KEY:-$VITE_CLERK_PUBLISHABLE_KEY}
VITE_SUPABASE_URL=${VITE_SUPABASE_STAGING_URL:-$VITE_SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_STAGING_ANON_KEY:-$VITE_SUPABASE_ANON_KEY}
VITE_ENABLE_DEBUG=true
EOF

# Deploy to Vercel staging
echo "☁️  Deploying to Vercel staging..."
if [ -n "$VERCEL_TOKEN" ]; then
    npx vercel --prod \
        --token=$VERCEL_TOKEN \
        --scope=legacyguards-projects \
        --env-file=.env.staging \
        --build-env VITE_APP_ENV=staging \
        --name=legacyguard-staging \
        --yes || {
        echo -e "${RED}Vercel deployment failed!${NC}"
        exit 1
    }
else
    echo -e "${YELLOW}VERCEL_TOKEN not set. Running interactive deployment...${NC}"
    npx vercel --prod \
        --scope=legacyguards-projects \
        --env-file=.env.staging \
        --build-env VITE_APP_ENV=staging \
        --name=legacyguard-staging || {
        echo -e "${RED}Vercel deployment failed!${NC}"
        exit 1
    }
fi

# Clean up
rm -f .env.staging

# Tag the deployment
echo "🏷️  Tagging deployment..."
TAG="staging-$(date +%Y%m%d-%H%M%S)"
git tag -a $TAG -m "Staging deployment $TAG"
git push origin $TAG

echo -e "${GREEN}✅ Staging deployment completed successfully!${NC}"
echo "📍 Staging URL: https://legacyguard-staging.vercel.app"
echo "🏷️  Deployment tagged as: $TAG"

# Post-deployment checks
echo ""
echo "📋 Post-deployment checklist:"
echo "  [ ] Check staging site is accessible"
echo "  [ ] Verify environment variables are set correctly"
echo "  [ ] Test critical user flows"
echo "  [ ] Check monitoring dashboard for errors"
echo "  [ ] Review performance metrics"
