#!/bin/bash

# Merge mobile repository into monorepo
# This script preserves git history from both repositories

echo "🚀 Starting monorepo merge process..."
echo "==========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "/Users/luborfedak/Documents/Github/hollywood" ]; then
  echo -e "${RED}Error: Hollywood directory not found${NC}"
  exit 1
fi

cd /Users/luborfedak/Documents/Github/hollywood

echo -e "${YELLOW}Step 1: Adding mobile repo as a remote${NC}"
git remote add mobile-repo /Users/luborfedak/Documents/Github/mobile

echo -e "${YELLOW}Step 2: Fetching mobile repo history${NC}"
git fetch mobile-repo --tags

echo -e "${YELLOW}Step 3: Merging mobile repo with history preservation${NC}"
# Use --allow-unrelated-histories since these are separate repos
git merge mobile-repo/main --allow-unrelated-histories -m "feat: Merge mobile repository into monorepo structure"

echo -e "${YELLOW}Step 4: Cleaning up file structure${NC}"
# The mobile repo files should already be in the /mobile directory
# But let's verify and clean up any duplicates

# Remove the mobile remote as it's no longer needed
git remote remove mobile-repo

echo -e "${YELLOW}Step 5: Updating package.json for monorepo${NC}"
# Update root package.json workspaces if needed
cat > package.json << 'EOF'
{
  "name": "hollywood-monorepo",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "hollywood",
    "mobile",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "clean": "turbo run clean",
    "web:dev": "npm run dev --workspace=hollywood",
    "mobile:dev": "npm run dev --workspace=mobile",
    "shared:build": "npm run build --workspace=@hollywood/shared"
  },
  "devDependencies": {
    "turbo": "^1.11.2",
    "@types/node": "^20.10.5",
    "typescript": "^5.3.3"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
EOF

echo -e "${YELLOW}Step 6: Creating turbo.json configuration${NC}"
cat > turbo.json << 'EOF'
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**"],
      "env": [
        "VITE_SUPABASE_URL",
        "VITE_SUPABASE_ANON_KEY",
        "EXPO_PUBLIC_SUPABASE_URL",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY"
      ]
    },
    "dev": {
      "persistent": true,
      "cache": false
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"],
      "cache": false
    },
    "lint": {
      "outputs": []
    },
    "clean": {
      "cache": false
    }
  }
}
EOF

echo -e "${YELLOW}Step 7: Creating root .gitignore${NC}"
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
*.lcov
.nyc_output

# Production
build/
dist/
out/
.next/
*.production

# Misc
.DS_Store
*.pem
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
*.swn
*.bak

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Turbo
.turbo/

# Expo
.expo/
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*
web-build/

# Metro
.metro-health-check*

# Debug
npm-debug.*
yarn-debug.*
yarn-error.*

# macOS
.DS_Store
.AppleDouble
.LSOverride

# Windows
Thumbs.db
Thumbs.db:encryptable
ehthumbs.db
ehthumbs_vista.db
Desktop.ini

# Logs
logs/
*.log

# Supabase
**/supabase/.branches
**/supabase/.temp
EOF

echo -e "${YELLOW}Step 8: Installing dependencies${NC}"
npm install

echo -e "${GREEN}✅ Monorepo merge completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Review the merged files for any conflicts"
echo "2. Test both web and mobile apps:"
echo "   - npm run web:dev"
echo "   - npm run mobile:dev"
echo "3. Push to GitHub:"
echo "   - git push origin main"
echo ""
echo -e "${GREEN}The repositories have been successfully merged!${NC}"
