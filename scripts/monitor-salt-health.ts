#!/usr/bin/env npx tsx

/**
 * Salt Health Monitoring Script
 * 
 * This script monitors the health of salt-dependent systems:
 * - Search index integrity
 * - Salt rotation readiness
 * - Security metrics
 * 
 * Usage:
 *   npx tsx scripts/monitor-salt-health.ts [--alerts] [--json]
 */

import { createClient } from '@supabase/supabase-js'
import { hmacSha256Hex } from '@schwalbe/shared/search'

interface HealthCheck {
  name: string
  status: 'healthy' | 'warning' | 'critical'
  message: string
  metrics?: Record<string, number>
  details?: Record<string, any>
}

interface HealthReport {
  timestamp: string
  overall_status: 'healthy' | 'warning' | 'critical'
  checks: HealthCheck[]
  summary: {
    total_checks: number
    healthy_checks: number
    warning_checks: number
    critical_checks: number
  }
}

class SaltHealthMonitor {
  private supabase
  private enableAlerts: boolean
  private jsonOutput: boolean

  constructor(enableAlerts = false, jsonOutput = false) {
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
    }

    this.supabase = createClient(url, key)
    this.enableAlerts = enableAlerts
    this.jsonOutput = jsonOutput
  }

  private log(message: string, level: 'info' | 'warn' | 'error' = 'info') {
    if (this.jsonOutput) return

    const colors = {
      info: '\x1b[34m',  // Blue
      warn: '\x1b[33m',  // Yellow
      error: '\x1b[31m', // Red
    }
    const reset = '\x1b[0m'
    
    console.log(`${colors[level]}[${level.toUpperCase()}]${reset} ${message}`)
  }

  // Check if search salt is properly configured
  async checkSaltConfiguration(): Promise<HealthCheck> {
    const salt = process.env.SEARCH_INDEX_SALT
    
    if (!salt) {
      return {
        name: 'Salt Configuration',
        status: 'critical',
        message: 'SEARCH_INDEX_SALT environment variable is not set'
      }
    }

    if (salt.length < 32) {
      return {
        name: 'Salt Configuration',
        status: 'warning',
        message: 'Salt length is below recommended minimum (32 characters)',
        details: { salt_length: salt.length }
      }
    }

    // Test salt functionality
    try {
      const testHash = hmacSha256Hex('test_token', salt)
      if (testHash.length !== 64) {
        throw new Error('Invalid hash length')
      }

      return {
        name: 'Salt Configuration',
        status: 'healthy',
        message: 'Salt is properly configured and functional',
        details: { 
          salt_length: salt.length,
          test_hash_length: testHash.length
        }
      }
    } catch (error) {
      return {
        name: 'Salt Configuration',
        status: 'critical',
        message: `Salt functionality test failed: ${error.message}`
      }
    }
  }

  // Check search index integrity
  async checkSearchIndexIntegrity(): Promise<HealthCheck> {
    try {
      // Get document and index counts
      const { data: docStats, error: docError } = await this.supabase
        .from('documents')
        .select('id', { count: 'exact' })
        .not('ocr_text', 'is', null)

      if (docError) throw docError

      const { data: indexStats, error: indexError } = await this.supabase
        .from('hashed_tokens')
        .select('doc_id', { count: 'exact' })

      if (indexError) throw indexError

      const { data: uniqueDocs, error: uniqueError } = await this.supabase
        .rpc('count_unique_indexed_docs')

      if (uniqueError) {
        // Fallback query if RPC doesn't exist
        const { data: fallbackData, error: fallbackError } = await this.supabase
          .from('hashed_tokens')
          .select('doc_id')

        if (fallbackError) throw fallbackError

        const uniqueDocIds = new Set(fallbackData?.map(row => row.doc_id) || [])
        var uniqueCount = uniqueDocIds.size
      } else {
        var uniqueCount = uniqueDocs || 0
      }

      const totalSearchableDocs = docStats?.length || 0
      const totalIndexEntries = indexStats?.length || 0
      const indexedDocs = uniqueCount
      
      const indexCoverage = totalSearchableDocs > 0 ? (indexedDocs / totalSearchableDocs) * 100 : 0

      let status: 'healthy' | 'warning' | 'critical'
      let message: string

      if (indexCoverage >= 95) {
        status = 'healthy'
        message = `Search index is healthy (${indexCoverage.toFixed(1)}% coverage)`
      } else if (indexCoverage >= 80) {
        status = 'warning'
        message = `Search index coverage is low (${indexCoverage.toFixed(1)}%)`
      } else {
        status = 'critical'
        message = `Search index coverage is critically low (${indexCoverage.toFixed(1)}%)`
      }

      return {
        name: 'Search Index Integrity',
        status,
        message,
        metrics: {
          total_searchable_docs: totalSearchableDocs,
          indexed_docs: indexedDocs,
          total_index_entries: totalIndexEntries,
          coverage_percentage: Math.round(indexCoverage * 100) / 100
        }
      }
    } catch (error) {
      return {
        name: 'Search Index Integrity',
        status: 'critical',
        message: `Failed to check search index: ${error.message}`
      }
    }
  }

  // Check for stale search index entries
  async checkIndexFreshness(): Promise<HealthCheck> {
    try {
      // Check for index entries older than documents
      const { data: staleIndexes, error } = await this.supabase
        .from('hashed_tokens')
        .select(`
          doc_id,
          created_at,
          documents!inner(id, updated_at)
        `)
        .gte('documents.updated_at', 'hashed_tokens.created_at')

      if (error) throw error

      const staleCount = staleIndexes?.length || 0
      
      if (staleCount === 0) {
        return {
          name: 'Index Freshness',
          status: 'healthy',
          message: 'All search indexes are up to date',
          metrics: { stale_indexes: 0 }
        }
      } else if (staleCount < 10) {
        return {
          name: 'Index Freshness',
          status: 'warning',
          message: `${staleCount} documents have stale search indexes`,
          metrics: { stale_indexes: staleCount }
        }
      } else {
        return {
          name: 'Index Freshness',
          status: 'critical',
          message: `${staleCount} documents have stale search indexes (reindex recommended)`,
          metrics: { stale_indexes: staleCount }
        }
      }
    } catch (error) {
      return {
        name: 'Index Freshness',
        status: 'warning',
        message: `Could not check index freshness: ${error.message}`
      }
    }
  }

  // Check backup tables health
  async checkBackupHealth(): Promise<HealthCheck> {
    try {
      // Find backup tables
      const { data: tables, error } = await this.supabase
        .rpc('get_backup_tables')

      if (error) {
        // Fallback query
        const { data: fallbackTables, error: fallbackError } = await this.supabase
          .from('information_schema.tables')
          .select('table_name')
          .like('table_name', 'hashed_tokens_backup_%')

        if (fallbackError) throw fallbackError
        var backupTables = fallbackTables?.map(t => t.table_name) || []
      } else {
        var backupTables = tables || []
      }

      const now = new Date()
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      
      const oldBackups = backupTables.filter(tableName => {
        const match = tableName.match(/hashed_tokens_backup_(\d{8})/)
        if (!match) return false
        
        const dateStr = match[1]
        const backupDate = new Date(
          parseInt(dateStr.substring(0, 4)),
          parseInt(dateStr.substring(4, 6)) - 1,
          parseInt(dateStr.substring(6, 8))
        )
        
        return backupDate < sevenDaysAgo
      })

      if (oldBackups.length === 0) {
        return {
          name: 'Backup Health',
          status: 'healthy',
          message: `${backupTables.length} backup tables, none require cleanup`,
          metrics: { 
            total_backups: backupTables.length, 
            old_backups: 0 
          }
        }
      } else if (oldBackups.length < 5) {
        return {
          name: 'Backup Health',
          status: 'warning',
          message: `${oldBackups.length} old backup tables should be cleaned up`,
          metrics: { 
            total_backups: backupTables.length, 
            old_backups: oldBackups.length 
          }
        }
      } else {
        return {
          name: 'Backup Health',
          status: 'critical',
          message: `${oldBackups.length} old backup tables need immediate cleanup`,
          metrics: { 
            total_backups: backupTables.length, 
            old_backups: oldBackups.length 
          }
        }
      }
    } catch (error) {
      return {
        name: 'Backup Health',
        status: 'warning',
        message: `Could not check backup health: ${error.message}`
      }
    }
  }

  // Check salt rotation readiness
  async checkRotationReadiness(): Promise<HealthCheck> {
    try {
      // Check for any ongoing operations that would conflict with rotation
      const { data: activeShares, error: shareError } = await this.supabase
        .from('share_links')
        .select('count')
        .eq('is_active', true)

      if (shareError) throw shareError

      // Check database space
      const { data: dbSize, error: sizeError } = await this.supabase
        .rpc('get_database_size')

      if (sizeError) {
        // This is not critical for rotation readiness
        var spaceSufficient = true
        var dbSizeMB = 0
      } else {
        var dbSizeMB = dbSize || 0
        // Assume sufficient space if < 80% of some reasonable limit (e.g., 10GB)
        var spaceSufficient = dbSizeMB < 8192
      }

      const activeShareCount = activeShares?.length || 0
      
      let status: 'healthy' | 'warning' | 'critical' = 'healthy'
      let issues: string[] = []

      if (activeShareCount > 100) {
        status = 'warning'
        issues.push(`High number of active shares (${activeShareCount})`)
      }

      if (!spaceSufficient) {
        status = 'critical'
        issues.push('Insufficient database space for rotation')
      }

      const message = issues.length > 0 
        ? `Rotation readiness issues: ${issues.join(', ')}`
        : 'System is ready for salt rotation'

      return {
        name: 'Rotation Readiness',
        status,
        message,
        metrics: {
          active_shares: activeShareCount,
          db_size_mb: dbSizeMB,
          space_sufficient: spaceSufficient ? 1 : 0
        }
      }
    } catch (error) {
      return {
        name: 'Rotation Readiness',
        status: 'warning',
        message: `Could not assess rotation readiness: ${error.message}`
      }
    }
  }

  // Run all health checks
  async runAllChecks(): Promise<HealthReport> {
    this.log('Starting salt health monitoring...')

    const checks: HealthCheck[] = []

    // Run all checks
    checks.push(await this.checkSaltConfiguration())
    checks.push(await this.checkSearchIndexIntegrity())
    checks.push(await this.checkIndexFreshness())
    checks.push(await this.checkBackupHealth())
    checks.push(await this.checkRotationReadiness())

    // Calculate summary
    const summary = {
      total_checks: checks.length,
      healthy_checks: checks.filter(c => c.status === 'healthy').length,
      warning_checks: checks.filter(c => c.status === 'warning').length,
      critical_checks: checks.filter(c => c.status === 'critical').length
    }

    // Determine overall status
    let overall_status: 'healthy' | 'warning' | 'critical'
    if (summary.critical_checks > 0) {
      overall_status = 'critical'
    } else if (summary.warning_checks > 0) {
      overall_status = 'warning'
    } else {
      overall_status = 'healthy'
    }

    const report: HealthReport = {
      timestamp: new Date().toISOString(),
      overall_status,
      checks,
      summary
    }

    return report
  }

  // Send alerts if enabled
  async sendAlerts(report: HealthReport) {
    if (!this.enableAlerts) return
    if (report.overall_status === 'healthy') return

    // In a real implementation, this would send alerts via:
    // - Email
    // - Slack
    // - PagerDuty
    // - etc.
    
    this.log(`ALERT: Salt health status is ${report.overall_status}`, 'error')
    
    const criticalIssues = report.checks.filter(c => c.status === 'critical')
    const warningIssues = report.checks.filter(c => c.status === 'warning')

    if (criticalIssues.length > 0) {
      this.log('Critical issues:', 'error')
      criticalIssues.forEach(issue => {
        this.log(`  - ${issue.name}: ${issue.message}`, 'error')
      })
    }

    if (warningIssues.length > 0) {
      this.log('Warning issues:', 'warn')
      warningIssues.forEach(issue => {
        this.log(`  - ${issue.name}: ${issue.message}`, 'warn')
      })
    }
  }

  // Display results
  displayReport(report: HealthReport) {
    if (this.jsonOutput) {
      console.log(JSON.stringify(report, null, 2))
      return
    }

    console.log('\n=================================')
    console.log('Salt Health Monitoring Report')
    console.log('=================================')
    console.log(`Timestamp: ${report.timestamp}`)
    console.log(`Overall Status: ${report.overall_status.toUpperCase()}`)
    console.log('')

    console.log('Summary:')
    console.log(`  Total checks: ${report.summary.total_checks}`)
    console.log(`  ✅ Healthy: ${report.summary.healthy_checks}`)
    console.log(`  ⚠️  Warning: ${report.summary.warning_checks}`)
    console.log(`  ❌ Critical: ${report.summary.critical_checks}`)
    console.log('')

    console.log('Check Results:')
    report.checks.forEach(check => {
      const icon = check.status === 'healthy' ? '✅' : 
                  check.status === 'warning' ? '⚠️' : '❌'
      
      console.log(`  ${icon} ${check.name}: ${check.message}`)
      
      if (check.metrics) {
        Object.entries(check.metrics).forEach(([key, value]) => {
          console.log(`      ${key}: ${value}`)
        })
      }
    })
    console.log('')
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2)
  const enableAlerts = args.includes('--alerts')
  const jsonOutput = args.includes('--json')

  try {
    const monitor = new SaltHealthMonitor(enableAlerts, jsonOutput)
    const report = await monitor.runAllChecks()
    
    monitor.displayReport(report)
    await monitor.sendAlerts(report)

    // Exit with error code if there are critical issues
    if (report.overall_status === 'critical') {
      process.exit(1)
    } else if (report.overall_status === 'warning') {
      process.exit(2)
    }
    
    process.exit(0)
  } catch (error) {
    if (jsonOutput) {
      console.log(JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString()
      }))
    } else {
      console.error('Error running salt health monitoring:', error.message)
    }
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}