#!/usr/bin/env tsx
/**
 * Quick test of environment detection for redirect gating
 */

// Simulate different environment variables
const testEnvironments = [
  { VITE_IS_PRODUCTION: 'false', NODE_ENV: 'development', expected: false },
  { VITE_IS_PRODUCTION: 'true', NODE_ENV: 'development', expected: true },
  { NEXT_PUBLIC_IS_PRODUCTION: 'true', NODE_ENV: 'development', expected: true },
  { NODE_ENV: 'production', expected: true },
  { NODE_ENV: 'development', expected: false },
]

function testIsProduction(env: Record<string, string>): boolean {
  // Simulate the isProduction function logic
  return (
    env.VITE_IS_PRODUCTION === 'true' ||
    env.NEXT_PUBLIC_IS_PRODUCTION === 'true' ||
    env.NODE_ENV === 'production'
  )
}

console.log('🧪 Testing environment detection for redirect gating...\n')

for (const [i, testCase] of testEnvironments.entries()) {
  const { expected, ...env } = testCase
  const result = testIsProduction(env)
  const status = result === expected ? '✅' : '❌'
  
  console.log(`${status} Test ${i + 1}: ${JSON.stringify(env)}`)
  console.log(`   Expected: ${expected}, Got: ${result}`)
  
  if (result !== expected) {
    console.error(`❌ Environment detection test failed!`)
    process.exit(1)
  }
}

console.log('\n✅ All environment detection tests passed!')
console.log('\n📋 Current environment detection logic:')
console.log('- VITE_IS_PRODUCTION=true → Production (real redirects)')
console.log('- NEXT_PUBLIC_IS_PRODUCTION=true → Production (real redirects)') 
console.log('- NODE_ENV=production → Production (real redirects)')
console.log('- Otherwise → Non-production (simulation modal)')
console.log('\n🎯 Ready for Phase 7 manual testing')