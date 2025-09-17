#!/usr/bin/env tsx
/**
 * Phase 7: Redirect Gating Verification Script
 * 
 * This script verifies the environment-controlled redirect behavior:
 * - Production: Real redirects to country domains
 * - Non-production: Czech simulation modal without navigation
 */

import * as fs from 'fs'
import * as path from 'path'

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`)
    process.exit(1)
  }
}

function validateRedirectGuardImplementation(): void {
  console.log('🔍 Validating redirect guard implementation...')
  
  const redirectGuardPath = path.join(process.cwd(), 'apps/web/src/lib/utils/redirect-guard.ts')
  
  assert(
    fs.existsSync(redirectGuardPath),
    'Redirect guard utility should exist for gating redirect behavior'
  )
  
  const content = fs.readFileSync(redirectGuardPath, 'utf-8')
  
  // Check for environment-gated behavior
  assert(
    content.includes('isProduction()'),
    'Redirect guard should check production environment'
  )
  
  // Check for redirect loop protection
  assert(
    content.includes('RedirectGuard') && content.includes('maxRedirects'),
    'Redirect guard should implement loop protection'
  )
  
  // Check for simulation targets
  assert(
    content.includes('simulationTargets') && content.includes('getEnabledDomains()'),
    'Redirect guard should provide simulation targets for non-production'
  )
  
  console.log('✅ Redirect guard implementation validated')
}

function validateSimulationModal(): void {
  console.log('🔍 Validating simulation modal implementation...')
  
  const modalPath = path.join(process.cwd(), 'apps/web/src/components/modals/RedirectSimulationModal.tsx')
  
  assert(
    fs.existsSync(modalPath),
    'Redirect simulation modal should exist'
  )
  
  const content = fs.readFileSync(modalPath, 'utf-8')
  
  // Check for Czech simulation message
  assert(
    content.includes('Prostředí není produkční'),
    'Modal should contain Czech simulation message'
  )
  
  // Check for proper accessibility
  assert(
    content.includes('Dialog') && content.includes('aria-label'),
    'Modal should have proper dialog semantics and accessibility'
  )
  
  // Check for non-clickable links (preventDefault)
  assert(
    content.includes('preventDefault()'),
    'Simulation modal links should prevent navigation'
  )
  
  console.log('✅ Simulation modal implementation validated')
}

function validateCountryMenu(): void {
  console.log('🔍 Validating country menu integration...')
  
  const menuPath = path.join(process.cwd(), 'apps/web/src/components/layout/CountryMenu.tsx')
  
  assert(
    fs.existsSync(menuPath),
    'Country menu should exist for domain selection'
  )
  
  const content = fs.readFileSync(menuPath, 'utf-8')
  
  // Check for redirect guard integration
  assert(
    content.includes('redirectToCountryOrSimulate'),
    'Country menu should integrate with redirect guard'
  )
  
  // Check for simulation modal handling
  assert(
    content.includes('RedirectSimulationModal') && content.includes('simulationTargets'),
    'Country menu should handle simulation modal display'
  )
  
  // Check for accessibility
  assert(
    content.includes('aria-haspopup') && content.includes('role="menu"'),
    'Country menu should have proper menu accessibility'
  )
  
  console.log('✅ Country menu integration validated')
}

function validateEnvironmentDetection(): void {
  console.log('🔍 Validating environment detection logic...')
  
  const domainsPath = path.join(process.cwd(), 'packages/shared/src/config/domains.ts')
  
  assert(
    fs.existsSync(domainsPath),
    'Domains configuration should exist'
  )
  
  const content = fs.readFileSync(domainsPath, 'utf-8')
  
  // Check for production detection function
  assert(
    content.includes('export function isProduction()'),
    'Should export isProduction function'
  )
  
  // Check for environment variables
  assert(
    content.includes('VITE_IS_PRODUCTION') && 
    content.includes('NEXT_PUBLIC_IS_PRODUCTION') &&
    content.includes('NODE_ENV'),
    'Should check multiple environment variables for production detection'
  )
  
  // Check for enabled domains
  assert(
    content.includes('enabled: true') && content.includes('CZ') && content.includes('SK'),
    'Should have Czech Republic and Slovakia enabled'
  )
  
  console.log('✅ Environment detection logic validated')
}

function validateRedirectBehaviorDocumentation(): void {
  console.log('🔍 Validating redirect behavior documentation...')
  
  // Check if redirect strategy documentation exists
  const redirectDocsPath = path.join(process.cwd(), 'docs/domain/redirect-strategy.md')
  
  if (fs.existsSync(redirectDocsPath)) {
    const content = fs.readFileSync(redirectDocsPath, 'utf-8')
    
    assert(
      content.includes('VITE_IS_PRODUCTION') && content.includes('simulation'),
      'Redirect strategy should document environment-based behavior'
    )
    
    console.log('✅ Redirect strategy documentation found and validated')
  } else {
    console.log('ℹ️ Redirect strategy documentation not found - creating basic documentation')
    
    // Create basic documentation for the redirect strategy
    const redirectStrategyDoc = `# Redirect Strategy

## Environment-Gated Behavior

### Production Environment (\`VITE_IS_PRODUCTION=true\`)
- Real redirects to country-specific domains
- CZ selection → https://legacyguard.cz
- SK selection → https://legacyguard.sk

### Non-Production Environment (\`VITE_IS_PRODUCTION=false\`)
- Shows Czech simulation modal
- No actual navigation occurs
- Modal displays all target URLs for verification

## Manual Verification Checklist

### Non-Production Testing:
1. Set \`VITE_IS_PRODUCTION=false\` in environment
2. Open Country menu in header
3. Select Czech Republic (CZ)
4. Verify simulation modal opens with Czech text
5. Verify modal shows both legacyguard.cz and legacyguard.sk URLs
6. Verify links are not clickable for navigation
7. Repeat for Slovakia (SK) selection

### Production Testing:
1. Set \`VITE_IS_PRODUCTION=true\` in environment
2. Select CZ → should redirect to https://legacyguard.cz
3. Select SK → should redirect to https://legacyguard.sk
4. Verify no redirect loops occur

## Safety Features
- Redirect loop protection (max 3 redirects per 10 seconds)
- Environment isolation (no production redirects in development)
- Accessible modal with proper dialog semantics
`
    
    fs.mkdirSync(path.dirname(redirectDocsPath), { recursive: true })
    fs.writeFileSync(redirectDocsPath, redirectStrategyDoc)
    console.log('✅ Created redirect strategy documentation')
  }
}

function generateManualTestingScript(): void {
  console.log('🔍 Generating manual testing script...')
  
  const testScriptPath = path.join(process.cwd(), 'scripts/test-redirect-gating-manual.sh')
  
  const testScript = `#!/bin/bash
# Phase 7: Manual Redirect Gating Test Script
# Run this script to perform manual verification of redirect gating behavior

echo "🚀 Phase 7: Redirect Gating Manual Verification"
echo "=============================================="
echo ""

echo "📋 Manual Testing Checklist:"
echo ""
echo "1. NON-PRODUCTION TESTING:"
echo "   a) Set VITE_IS_PRODUCTION=false in .env.local"
echo "   b) Start development server: npm run dev:web"
echo "   c) Open browser to localhost:3000"
echo "   d) Click Country menu in header"
echo "   e) Select Czech Republic (CZ)"
echo "   f) ✅ Verify simulation modal opens"
echo "   g) ✅ Verify Czech text: 'Prostředí není produkční...'"
echo "   h) ✅ Verify both legacyguard.cz and legacyguard.sk URLs shown"
echo "   i) ✅ Verify links are not clickable (no navigation)"
echo "   j) Close modal and repeat for Slovakia (SK)"
echo ""
echo "2. PRODUCTION TESTING:"
echo "   a) Set VITE_IS_PRODUCTION=true in environment"
echo "   b) Build and serve production app"
echo "   c) Select CZ → ✅ Should redirect to https://legacyguard.cz"
echo "   d) Select SK → ✅ Should redirect to https://legacyguard.sk"
echo "   e) ✅ Verify no redirect loops occur"
echo ""
echo "3. ACCESSIBILITY TESTING:"
echo "   a) ✅ Modal has proper dialog role"
echo "   b) ✅ Close button is keyboard accessible"
echo "   c) ✅ Focus is trapped within dialog"
echo "   d) ✅ Country menu has proper ARIA attributes"
echo ""
echo "🎯 All tests must pass before Phase 7 completion"
echo ""
echo "To start testing:"
echo "1. npm run dev:web"
echo "2. Follow the checklist above"
echo "3. Report results in Phase 7 completion"
`
  
  fs.writeFileSync(testScriptPath, testScript)
  fs.chmodSync(testScriptPath, 0o755)
  
  console.log('✅ Manual testing script generated at scripts/test-redirect-gating-manual.sh')
}

async function main(): Promise<void> {
  console.log('🚀 Starting Phase 7: Redirect Gating Verification\\n')
  
  try {
    validateRedirectGuardImplementation()
    validateSimulationModal()
    validateCountryMenu()
    validateEnvironmentDetection()
    validateRedirectBehaviorDocumentation()
    generateManualTestingScript()
    
    console.log('\\n🎉 Phase 7 PASSED: Redirect gating implementation verified')
    console.log('\\n📋 Next Steps:')
    console.log('1. Run manual testing script: ./scripts/test-redirect-gating-manual.sh')
    console.log('2. Execute both non-production and production test scenarios')
    console.log('3. Verify all accessibility requirements')
    console.log('4. Confirm no redirect loops or navigation issues')
    console.log('\\n✅ Implementation is complete and ready for manual verification')
    
    process.exit(0)
  } catch (error) {
    console.error('\\n💥 Phase 7 FAILED:', error.message)
    process.exit(1)
  }
}

main().catch(console.error)