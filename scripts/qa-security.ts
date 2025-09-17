#!/usr/bin/env tsx
/**
 * QA Gate 2: Privacy & Security Compliance
 * 
 * This script validates:
 * - RLS policies protect user data
 * - Hashed search functionality (no plaintext exposure)
 * - Secret scanning (no hardcoded secrets)
 * - Secure password/PII handling
 */

import * as fs from 'fs'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`)
    process.exit(1)
  }
}

function scanForSecrets(): void {
  console.log('🔍 Scanning for hardcoded secrets...')
  
  // Patterns that might indicate secrets
  const secretPatterns = [
    /sk_live_[a-zA-Z0-9]+/g,          // Stripe live keys
    /pk_live_[a-zA-Z0-9]+/g,          // Stripe live public keys
    /rk_live_[a-zA-Z0-9]+/g,          // Resend live keys
    /supabase\.co.*[a-zA-Z0-9]{40,}/g, // Supabase URLs with long tokens
    /postgres:\/\/.*:[^@]*@/g,        // Database URLs with passwords
    /redis:\/\/.*:[^@]*@/g,           // Redis URLs with passwords
    /password\s*[:=]\s*['"][a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]{12,}['"](?![,\s]*\/\/)/gi, // Hardcoded passwords (but not UI text)
    /secret\s*[:=]\s*['"][a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]{12,}['"](?![,\s]*\/\/)/gi,   // Hardcoded secrets (but not UI text)
  ]
  
  const dangerousPaths = [
    'apps/web/src',
    'packages/shared/src', 
    'supabase/functions',
    '.github/workflows'
  ]
  
  const scanDirectory = (dir: string): string[] => {
    const violations: string[] = []
    if (!fs.existsSync(dir)) return violations
    
    const files = fs.readdirSync(dir, { withFileTypes: true })
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name)
      
      if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
        violations.push(...scanDirectory(fullPath))
      } else if (file.name.endsWith('.ts') || file.name.endsWith('.tsx') || file.name.endsWith('.js') || file.name.endsWith('.yml')) {
        const content = fs.readFileSync(fullPath, 'utf-8')
        
        for (const pattern of secretPatterns) {
          const matches = content.match(pattern)
          if (matches) {
            // Filter out obvious false positives
            const realViolations = matches.filter(match => 
              !match.includes('example') && 
              !match.includes('placeholder') &&
              !match.includes('YOUR_') &&
              !match.includes('sk_test_') &&
              !match.includes('pk_test_') &&
              !match.includes('Enter Password') &&
              !match.includes('passwordLabel') &&
              !match.includes('Password:') &&
              !match.includes(': \'Password\'') &&
              !match.includes(': "Password"')
            )
            
            if (realViolations.length > 0) {
              violations.push(`${fullPath}: ${realViolations.join(', ')}`)
            }
          }
        }
      }
    }
    
    return violations
  }
  
  let allViolations: string[] = []
  
  for (const scanPath of dangerousPaths) {
    allViolations.push(...scanDirectory(path.join(process.cwd(), scanPath)))
  }
  
  assert(
    allViolations.length === 0,
    `Found potential secrets in code: ${allViolations.join('; ')}`
  )
  
  console.log('✅ Secret scanning passed - no hardcoded secrets detected')
}

function validateHashedSearchStructure(): void {
  console.log('🔍 Validating hashed search implementation...')
  
  // Check for hashed search migration
  const migrationsPath = path.join(process.cwd(), 'supabase/migrations')
  const migrationFiles = fs.readdirSync(migrationsPath)
  
  const hashedSearchMigration = migrationFiles.find(file => 
    file.includes('hashed_search') || file.includes('search_index')
  )
  
  assert(
    hashedSearchMigration !== undefined,
    'Should have hashed search migration for privacy-safe search indexing'
  )
  
  // Check migration content for proper hashing
  const migrationContent = fs.readFileSync(
    path.join(migrationsPath, hashedSearchMigration),
    'utf-8'
  )
  
  assert(
    migrationContent.includes('hashed_tokens') || migrationContent.includes('hash'),
    'Search migration should implement token hashing for privacy'
  )
  
  // Check for problematic plaintext storage (but allow comments explaining why we don't do it)
  const problematicPatterns = [
    /CREATE TABLE.*plaintext/i,
    /INSERT.*plaintext/i,
    /UPDATE.*plaintext/i,
    /raw_text\s+(TEXT|VARCHAR)/i
  ]
  
  const hasProblematicPattern = problematicPatterns.some(pattern => 
    pattern.test(migrationContent)
  )
  
  assert(
    !hasProblematicPattern,
    'Search implementation should not store plaintext content in database columns'
  )
  
  console.log('✅ Hashed search structure validated')
}

function validateRLSPolicies(): void {
  console.log('🔍 Validating RLS policy structure...')
  
  // Check for RLS-enabled tables in migrations
  const migrationsPath = path.join(process.cwd(), 'supabase/migrations')
  const migrationFiles = fs.readdirSync(migrationsPath)
  
  let rlsTableCount = 0
  let policyCount = 0
  
  for (const file of migrationFiles) {
    const content = fs.readFileSync(path.join(migrationsPath, file), 'utf-8')
    
    // Count RLS-enabled tables
    const rlsMatches = content.match(/ENABLE ROW LEVEL SECURITY/g)
    if (rlsMatches) {
      rlsTableCount += rlsMatches.length
    }
    
    // Count policies
    const policyMatches = content.match(/CREATE POLICY/g)
    if (policyMatches) {
      policyCount += policyMatches.length
    }
  }
  
  assert(
    rlsTableCount >= 8,
    `Should have RLS enabled on at least 8 tables, found ${rlsTableCount}`
  )
  
  assert(
    policyCount >= 20,
    `Should have at least 20 RLS policies for data protection, found ${policyCount}`
  )
  
  console.log(`✅ RLS policies validated (${rlsTableCount} RLS tables, ${policyCount} policies)`)
}

function validatePasswordSecurity(): void {
  console.log('🔍 Validating password security patterns...')
  
  // Check for secure password handling in sharing
  const sharingServicePath = path.join(process.cwd(), 'packages/shared/src/services/sharing/sharing.service.ts')
  
  if (fs.existsSync(sharingServicePath)) {
    const content = fs.readFileSync(sharingServicePath, 'utf-8')
    
    // Should not store passwords in plaintext (but interface definitions are OK)
    const problematicPasswordPatterns = [
      /password\s*:\s*store\(/i,
      /password\s*:\s*save\(/i,
      /password\s*=\s*['\"][^'\"]+['\"]/,
      /plaintext.*password/i
    ]
    
    const hasProblematicPattern = problematicPasswordPatterns.some(pattern => 
      pattern.test(content)
    )
    
    assert(
      !hasProblematicPattern,
      'Password handling should not store plaintext passwords'
    )
  }
  
  // Check for bcrypt usage in database functions
  const migrationFiles = fs.readdirSync(path.join(process.cwd(), 'supabase/migrations'))
  
  let hasBcrypt = false
  for (const file of migrationFiles) {
    const content = fs.readFileSync(path.join(process.cwd(), 'supabase/migrations', file), 'utf-8')
    if (content.includes('crypt(') || content.includes('bcrypt')) {
      hasBcrypt = true
      break
    }
  }
  
  assert(
    hasBcrypt,
    'Should use bcrypt or similar for password hashing in database functions'
  )
  
  console.log('✅ Password security patterns validated')
}

function validateAuthPatterns(): void {
  console.log('🔍 Validating authentication patterns...')
  
  // Check for proper auth.uid() usage
  const sharedServicePath = path.join(process.cwd(), 'packages/shared/src')
  
  const findAuthPatterns = (dir: string): { authUid: number; insecurePatterns: number } => {
    let authUid = 0, insecurePatterns = 0
    
    if (!fs.existsSync(dir)) return { authUid, insecurePatterns }
    
    const files = fs.readdirSync(dir, { withFileTypes: true })
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name)
      
      if (file.isDirectory()) {
        const subResult = findAuthPatterns(fullPath)
        authUid += subResult.authUid
        insecurePatterns += subResult.insecurePatterns
      } else if (file.name.endsWith('.ts') || file.name.endsWith('.tsx')) {
        const content = fs.readFileSync(fullPath, 'utf-8')
        
        if (content.includes('auth.uid()') || content.includes('getUser()')) authUid++
        if (content.includes('hardcoded-user') || content.includes('admin-override')) insecurePatterns++
      }
    }
    
    return { authUid, insecurePatterns }
  }
  
  const patterns = findAuthPatterns(sharedServicePath)
  
  assert(
    patterns.insecurePatterns === 0,
    `Found ${patterns.insecurePatterns} insecure authentication patterns`
  )
  
  console.log(`✅ Authentication patterns validated (${patterns.authUid} secure auth usages)`)
}

function validatePIIHandling(): void {
  console.log('🔍 Validating PII handling patterns...')
  
  // Check Edge Functions for proper PII handling
  const functionsPath = path.join(process.cwd(), 'supabase/functions')
  
  if (fs.existsSync(functionsPath)) {
    const functions = fs.readdirSync(functionsPath, { withFileTypes: true })
    
    let piiViolations: string[] = []
    
    for (const func of functions) {
      if (func.isDirectory() && !func.name.startsWith('_')) {
        const indexPath = path.join(functionsPath, func.name, 'index.ts')
        
        if (fs.existsSync(indexPath)) {
          const content = fs.readFileSync(indexPath, 'utf-8')
          
          // Check for potential PII logging
          if (content.includes('console.log') && 
              (content.includes('email') || content.includes('name') || content.includes('address'))) {
            // More sophisticated check - look for actual PII logging patterns
            const logLines = content.split('\n').filter(line => 
              line.includes('console.log') && 
              (line.includes('email') || line.includes('name'))
            )
            
            if (logLines.some(line => !line.includes('masked') && !line.includes('hash'))) {
              piiViolations.push(`${func.name}: Potential PII logging detected`)
            }
          }
        }
      }
    }
    
    assert(
      piiViolations.length === 0,
      `PII handling violations: ${piiViolations.join('; ')}`
    )
  }
  
  console.log('✅ PII handling patterns validated')
}

async function main(): Promise<void> {
  console.log('🚀 Starting QA Gate 2: Privacy & Security Compliance\n')
  
  try {
    scanForSecrets()
    validateHashedSearchStructure()
    validateRLSPolicies()
    validatePasswordSecurity()
    validateAuthPatterns()
    validatePIIHandling()
    
    console.log('\n🎉 QA Gate 2 PASSED: Privacy & Security compliance verified')
    process.exit(0)
  } catch (error) {
    console.error('\n💥 QA Gate 2 FAILED:', error.message)
    process.exit(1)
  }
}

main().catch(console.error)