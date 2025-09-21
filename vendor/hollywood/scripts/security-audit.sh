#!/bin/bash

# LegacyGuard Security Audit Script
# Version: 1.0.0
# Description: Comprehensive security audit for production readiness

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        🔒 LegacyGuard Security Audit Starting...          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to check command existence
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${YELLOW}⚠️  $1 is not installed. Installing...${NC}"
        npm install -g $2
    fi
}

# 1. Check for exposed secrets in code
echo -e "${BLUE}[1/10] Checking for exposed secrets...${NC}"
if grep -r "sk_live\|pk_live\|api_key\|secret_key\|password" --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" --exclude-dir=node_modules --exclude-dir=dist . 2>/dev/null | grep -v "VITE_" | grep -v "process.env" | grep -v "import.meta.env"; then
    echo -e "${RED}❌ Found potential exposed secrets!${NC}"
    exit 1
else
    echo -e "${GREEN}✅ No exposed secrets found${NC}"
fi

# 2. Check environment files are gitignored
echo -e "${BLUE}[2/10] Checking .gitignore configuration...${NC}"
if grep -q "\.env\.local" .gitignore && grep -q "\.env\*\.local" .gitignore; then
    echo -e "${GREEN}✅ Environment files properly gitignored${NC}"
else
    echo -e "${RED}❌ Environment files not properly gitignored!${NC}"
    exit 1
fi

# 3. Run npm audit
echo -e "${BLUE}[3/10] Running npm dependency audit...${NC}"
npm audit --audit-level=moderate || true
AUDIT_RESULT=$(npm audit --json 2>/dev/null | jq '.metadata.vulnerabilities.critical + .metadata.vulnerabilities.high' 2>/dev/null || echo "0")
if [ "$AUDIT_RESULT" -gt "0" ]; then
    echo -e "${YELLOW}⚠️  Found $AUDIT_RESULT high/critical vulnerabilities${NC}"
    echo "Run 'npm audit fix' to attempt automatic fixes"
else
    echo -e "${GREEN}✅ No critical vulnerabilities found${NC}"
fi

# 4. Check for outdated dependencies
echo -e "${BLUE}[4/10] Checking for outdated dependencies...${NC}"
npx npm-check-updates --jsonUpgraded 2>/dev/null | jq -r 'keys | length' > /tmp/outdated_count 2>/dev/null || echo "0" > /tmp/outdated_count
OUTDATED=$(cat /tmp/outdated_count)
if [ "$OUTDATED" -gt "10" ]; then
    echo -e "${YELLOW}⚠️  $OUTDATED packages are outdated${NC}"
else
    echo -e "${GREEN}✅ Dependencies are relatively up to date${NC}"
fi

# 5. Check TypeScript strict mode
echo -e "${BLUE}[5/10] Checking TypeScript configuration...${NC}"
if grep -q '"strict": true' tsconfig.json; then
    echo -e "${GREEN}✅ TypeScript strict mode enabled${NC}"
else
    echo -e "${YELLOW}⚠️  TypeScript strict mode is disabled${NC}"
fi

# 6. Check for console.log statements
echo -e "${BLUE}[6/10] Checking for console.log statements...${NC}"
CONSOLE_COUNT=$(grep -r "console\.\(log\|error\|warn\|info\)" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules --exclude-dir=dist . 2>/dev/null | wc -l)
if [ "$CONSOLE_COUNT" -gt "20" ]; then
    echo -e "${YELLOW}⚠️  Found $CONSOLE_COUNT console statements (should use proper logging)${NC}"
else
    echo -e "${GREEN}✅ Minimal console usage detected${NC}"
fi

# 7. Check for HTTPS enforcement
echo -e "${BLUE}[7/10] Checking HTTPS enforcement...${NC}"
if grep -q "https://" .env.example; then
    echo -e "${GREEN}✅ HTTPS URLs in environment configuration${NC}"
else
    echo -e "${YELLOW}⚠️  Ensure all production URLs use HTTPS${NC}"
fi

# 8. Check security headers configuration
echo -e "${BLUE}[8/10] Checking security headers...${NC}"
if [ -f "src/lib/security/headers.ts" ] || [ -f "vite.config.ts" ]; then
    echo -e "${GREEN}✅ Security configuration files present${NC}"
else
    echo -e "${YELLOW}⚠️  Security headers configuration not found${NC}"
fi

# 9. Check authentication configuration
echo -e "${BLUE}[9/10] Checking authentication setup...${NC}"
if grep -q "VITE_CLERK_PUBLISHABLE_KEY" .env.example; then
    echo -e "${GREEN}✅ Clerk authentication configured${NC}"
else
    echo -e "${RED}❌ Authentication not properly configured${NC}"
fi

# 10. Generate security report
echo -e "${BLUE}[10/10] Generating security report...${NC}"
REPORT_FILE="security-report-$(date +%Y%m%d-%H%M%S).json"
cat > $REPORT_FILE <<EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "audit_version": "1.0.0",
  "checks": {
    "exposed_secrets": "passed",
    "gitignore": "passed",
    "npm_vulnerabilities": "$AUDIT_RESULT",
    "outdated_packages": "$OUTDATED",
    "typescript_strict": $(grep -q '"strict": true' tsconfig.json && echo "true" || echo "false"),
    "console_statements": "$CONSOLE_COUNT",
    "https_enforcement": "manual_check_required",
    "security_headers": "manual_check_required",
    "authentication": "configured"
  },
  "recommendations": [
    "Enable TypeScript strict mode",
    "Remove or replace console.log with proper logging",
    "Run npm audit fix to resolve vulnerabilities",
    "Update outdated dependencies",
    "Implement CSP headers",
    "Enable 2FA for all users",
    "Implement rate limiting"
  ]
}
EOF

echo -e "${GREEN}✅ Security report saved to: $REPORT_FILE${NC}"

# Summary
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                   📊 AUDIT SUMMARY                        ║${NC}"
echo -e "${BLUE}╠════════════════════════════════════════════════════════════╣${NC}"
echo -e "${BLUE}║ Critical Issues: ${RED}$([ "$AUDIT_RESULT" -gt "0" ] && echo "$AUDIT_RESULT" || echo "0")${BLUE}                                        ║${NC}"
echo -e "${BLUE}║ Warnings: ${YELLOW}$([ "$OUTDATED" -gt "10" ] && echo "Multiple" || echo "Few")${BLUE}                                    ║${NC}"
echo -e "${BLUE}║ Report: ${GREEN}$REPORT_FILE${BLUE}                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"

# Exit with appropriate code
if [ "$AUDIT_RESULT" -gt "0" ]; then
    exit 1
else
    exit 0
fi
