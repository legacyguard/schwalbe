#!/usr/bin/env tsx
/**
 * QA Master Gate Runner
 * 
 * Executes all three QA gates in sequence:
 * 1. Accessibility & i18n
 * 2. Privacy & Security  
 * 3. Alerts & Observability
 */

import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface QAGateResult {
  name: string
  passed: boolean
  duration: number
  error?: string
}

async function runQAGate(gateName: string, scriptPath: string): Promise<QAGateResult> {
  const startTime = Date.now()
  
  try {
    console.log(`\n🔄 Running ${gateName}...`)
    const { stdout, stderr } = await execAsync(`npx tsx ${scriptPath}`)
    
    const duration = Date.now() - startTime
    
    if (stderr && !stderr.includes('WARN')) {
      throw new Error(stderr)
    }
    
    console.log(stdout)
    return { name: gateName, passed: true, duration }
  } catch (error: any) {
    const duration = Date.now() - startTime
    return { 
      name: gateName, 
      passed: false, 
      duration, 
      error: error.message || error.stdout || 'Unknown error'
    }
  }
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function printResults(results: QAGateResult[]): void {
  console.log('\n📊 QA GATE RESULTS SUMMARY')
  console.log('=' .repeat(50))
  
  let allPassed = true
  
  for (const result of results) {
    const status = result.passed ? '✅ PASS' : '❌ FAIL'
    const duration = formatDuration(result.duration)
    
    console.log(`${status} | ${result.name.padEnd(25)} | ${duration}`)
    
    if (!result.passed) {
      allPassed = false
      console.log(`     Error: ${result.error}`)
    }
  }
  
  console.log('=' .repeat(50))
  
  if (allPassed) {
    console.log('🎉 ALL QA GATES PASSED - Ready for deployment!')
    console.log('\nNext steps:')
    console.log('  1. Execute staging dry-run')
    console.log('  2. Run manual smoke tests')
    console.log('  3. Proceed with production deployment')
  } else {
    console.log('💥 QA GATES FAILED - Deployment blocked!')
    console.log('\nAction required:')
    console.log('  1. Fix failing gate issues')
    console.log('  2. Re-run QA gates')
    console.log('  3. Only deploy after all gates pass')
  }
}

async function main(): Promise<void> {
  console.log('🚀 LegacyGuard QA Gate Validation')
  console.log('Running comprehensive pre-deployment checks...\n')
  
  const gates = [
    { name: 'QA Gate 1: Accessibility & i18n', script: './scripts/qa-accessibility.ts' },
    { name: 'QA Gate 2: Privacy & Security', script: './scripts/qa-security.ts' },
    { name: 'QA Gate 3: Alerts & Observability', script: './scripts/qa-alerts.ts' }
  ]
  
  const results: QAGateResult[] = []
  
  for (const gate of gates) {
    const result = await runQAGate(gate.name, gate.script)
    results.push(result)
    
    // Stop on first failure for faster feedback
    if (!result.passed) {
      break
    }
  }
  
  printResults(results)
  
  // Exit with appropriate code
  const allPassed = results.every(r => r.passed)
  process.exit(allPassed ? 0 : 1)
}

main().catch(console.error)