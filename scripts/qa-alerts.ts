#!/usr/bin/env tsx
/**
 * QA Gate 3: Alerts & Observability Compliance
 * 
 * This script validates:
 * - Critical alerts via log-error Edge Function
 * - Alert deduplication via alert_instances table
 * - Monitoring infrastructure health
 * - Error logging without PII exposure
 */

import * as fs from 'fs'
import * as path from 'path'

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`)
    process.exit(1)
  }
}

function validateLogErrorFunction(): void {
  console.log('🔍 Validating log-error Edge Function...')
  
  const logErrorPath = path.join(process.cwd(), 'supabase/functions/log-error/index.ts')
  
  assert(
    fs.existsSync(logErrorPath),
    'log-error Edge Function should exist for critical error logging'
  )
  
  const content = fs.readFileSync(logErrorPath, 'utf-8')
  
  // Should handle critical error logging
  assert(
    content.includes('critical') || content.includes('error'),
    'log-error function should handle critical error levels'
  )
  
  // Should not expose PII
  assert(
    !content.includes('user_email') && !content.includes('password'),
    'log-error function should not expose PII in logs'
  )
  
  // Should have proper error handling
  assert(
    content.includes('try') && content.includes('catch'),
    'log-error function should have proper error handling'
  )
  
  console.log('✅ log-error Edge Function validated')
}

function validateAlertTables(): void {
  console.log('🔍 Validating alert system database structure...')
  
  // Check for alert tables migration
  const migrationsPath = path.join(process.cwd(), 'supabase/migrations')
  const migrationFiles = fs.readdirSync(migrationsPath)
  
  const alertMigration = migrationFiles.find(file => 
    file.includes('alert') && file.includes('create')
  )
  
  assert(
    alertMigration !== undefined,
    'Should have alert tables migration for observability infrastructure'
  )
  
  const migrationContent = fs.readFileSync(
    path.join(migrationsPath, alertMigration),
    'utf-8'
  )
  
  // Check for required tables
  assert(
    migrationContent.includes('alert_rules'),
    'Should have alert_rules table for alert configuration'
  )
  
  assert(
    migrationContent.includes('alert_instances'),
    'Should have alert_instances table for alert tracking and deduplication'
  )
  
  // Check for deduplication features
  assert(
    migrationContent.includes('fingerprint') || migrationContent.includes('dedup'),
    'Alert system should support deduplication via fingerprinting'
  )
  
  // Check for proper RLS
  assert(
    migrationContent.includes('ROW LEVEL SECURITY'),
    'Alert tables should have Row Level Security enabled'
  )
  
  console.log('✅ Alert system database structure validated')
}

function validateAlertFunctions(): void {
  console.log('🔍 Validating alert helper functions...')
  
  const migrationsPath = path.join(process.cwd(), 'supabase/migrations')
  const migrationFiles = fs.readdirSync(migrationsPath)
  
  let hasAlertFunctions = false
  
  for (const file of migrationFiles) {
    const content = fs.readFileSync(path.join(migrationsPath, file), 'utf-8')
    
    if (content.includes('trigger_alert') || 
        content.includes('resolve_alert') || 
        content.includes('suppress_alert')) {
      hasAlertFunctions = true
      break
    }
  }
  
  assert(
    hasAlertFunctions,
    'Should have alert management functions (trigger_alert, resolve_alert, suppress_alert)'
  )
  
  console.log('✅ Alert helper functions validated')
}

function validateMonitoringStructure(): void {
  console.log('🔍 Validating monitoring infrastructure...')
  
  // Check for observability shared utilities
  const observabilityPath = path.join(process.cwd(), 'supabase/functions/_shared/observability.ts')
  
  if (fs.existsSync(observabilityPath)) {
    const content = fs.readFileSync(observabilityPath, 'utf-8')
    
    assert(
      content.includes('metric') || content.includes('log') || content.includes('trace'),
      'Observability utilities should support metrics, logging, or tracing'
    )
  }
  
  // Check for error handling patterns in Edge Functions
  const functionsPath = path.join(process.cwd(), 'supabase/functions')
  
  if (fs.existsSync(functionsPath)) {
    const functions = fs.readdirSync(functionsPath, { withFileTypes: true })
    let functionsWithErrorHandling = 0
    
    for (const func of functions) {
      if (func.isDirectory() && !func.name.startsWith('_')) {
        const indexPath = path.join(functionsPath, func.name, 'index.ts')
        
        if (fs.existsSync(indexPath)) {
          const content = fs.readFileSync(indexPath, 'utf-8')
          
          if (content.includes('try') && content.includes('catch')) {
            functionsWithErrorHandling++
          }
        }
      }
    }
    
    assert(
      functionsWithErrorHandling >= 5,
      `Should have proper error handling in Edge Functions, found ${functionsWithErrorHandling} functions with try/catch`
    )
  }
  
  console.log('✅ Monitoring infrastructure validated')
}

function validateSmokeTests(): void {
  console.log('🔍 Validating alert system smoke tests...')
  
  const testsPath = path.join(process.cwd(), 'supabase/tests')
  
  if (fs.existsSync(testsPath)) {
    const testFiles = fs.readdirSync(testsPath)
    
    const alertTests = testFiles.filter(file => 
      file.includes('alert') && file.endsWith('.sql')
    )
    
    assert(
      alertTests.length >= 1,
      `Should have alert system smoke tests, found ${alertTests.length}`
    )
    
    // Check test content for deduplication validation
    let hasDeduplicationTest = false
    
    for (const testFile of alertTests) {
      const content = fs.readFileSync(path.join(testsPath, testFile), 'utf-8')
      
      if (content.includes('dedup') || content.includes('fingerprint') || content.includes('suppress')) {
        hasDeduplicationTest = true
        break
      }
    }
    
    assert(
      hasDeduplicationTest,
      'Should have smoke tests that validate alert deduplication functionality'
    )
  }
  
  console.log('✅ Alert system smoke tests validated')
}

function validateCIIntegration(): void {
  console.log('🔍 Validating CI integration for alerts...')
  
  const ciPath = path.join(process.cwd(), '.github/workflows/ci.yml')
  
  if (fs.existsSync(ciPath)) {
    const content = fs.readFileSync(ciPath, 'utf-8')
    
    // Should have alert-related CI checks
    assert(
      content.includes('alert') || content.includes('observability') || content.includes('qa'),
      'CI should include alert/observability validation steps'
    )
    
    // Should run database tests
    assert(
      content.includes('supabase test') || content.includes('sql'),
      'CI should run database/SQL tests including alert system'
    )
  }
  
  console.log('✅ CI integration for alerts validated')
}

function validateErrorLoggingPatterns(): void {
  console.log('🔍 Validating error logging patterns...')
  
  // Check Edge Functions for proper error logging
  const functionsPath = path.join(process.cwd(), 'supabase/functions')
  
  if (fs.existsSync(functionsPath)) {
    const functions = fs.readdirSync(functionsPath, { withFileTypes: true })
    let functionsWithLogging = 0
    let piiViolations: string[] = []
    
    for (const func of functions) {
      if (func.isDirectory() && !func.name.startsWith('_')) {
        const indexPath = path.join(functionsPath, func.name, 'index.ts')
        
        if (fs.existsSync(indexPath)) {
          const content = fs.readFileSync(indexPath, 'utf-8')
          
          if (content.includes('console.error') || content.includes('console.log')) {
            functionsWithLogging++
            
            // Check for actual PII exposure in logs (not just variable names)
            const logLines = content.split('\n').filter(line => {
              const hasConsole = line.includes('console.')
              if (!hasConsole) return false
              
              // Look for actual PII values being logged, not just references
              const hasPiiLogging = (
                /console\.[^(]*\([^)]*\$\{[^}]*\.email[^}]*\}/i.test(line) ||
                /console\.[^(]*\([^)]*\$\{[^}]*password[^}]*\}/i.test(line) ||
                /console\.[^(]*\([^)]*email\s*:/i.test(line) ||
                /console\.[^(]*\([^)]*password\s*:/i.test(line)
              )
              
              return hasPiiLogging
            })
            
            if (logLines.length > 0) {
              piiViolations.push(`${func.name}: Potential PII in logs`)
            }
          }
        }
      }
    }
    
    assert(
      functionsWithLogging >= 3,
      `Should have error logging in Edge Functions, found ${functionsWithLogging} functions with logging`
    )
    
    assert(
      piiViolations.length === 0,
      `Error logging should not expose PII: ${piiViolations.join('; ')}`
    )
  }
  
  console.log('✅ Error logging patterns validated')
}

async function main(): Promise<void> {
  console.log('🚀 Starting QA Gate 3: Alerts & Observability Compliance\n')
  
  try {
    validateLogErrorFunction()
    validateAlertTables()
    validateAlertFunctions()
    validateMonitoringStructure()
    validateSmokeTests()
    validateCIIntegration()
    validateErrorLoggingPatterns()
    
    console.log('\n🎉 QA Gate 3 PASSED: Alerts & Observability compliance verified')
    process.exit(0)
  } catch (error) {
    console.error('\n💥 QA Gate 3 FAILED:', error.message)
    process.exit(1)
  }
}

main().catch(console.error)