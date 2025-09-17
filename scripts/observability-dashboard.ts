#!/usr/bin/env npx tsx

/**
 * Observability Dashboard
 * 
 * This script provides a comprehensive view of system observability including:
 * - Alert rate limiting status
 * - Metrics summary and trends
 * - Error rates and patterns
 * - System health indicators
 * 
 * Usage:
 *   npx tsx scripts/observability-dashboard.ts [--json] [--hours 24] [--environment prod]
 */

import { createClient } from '@supabase/supabase-js'

interface DashboardOptions {
  json: boolean
  hours: number
  environment?: string
  showAlerts: boolean
  showMetrics: boolean
  showErrors: boolean
}

interface AlertSummary {
  rule_name: string
  fingerprint: string
  current_count: number
  max_alerts: number
  window_minutes: number
  window_progress_percent: number
  escalation_level: number
  is_rate_limited: boolean
  next_window_at: string
}

interface MetricSummary {
  metric_name: string
  metric_type: string
  environment: string
  count: number
  min_value: number
  max_value: number
  avg_value: number
  sum_value: number
  latest_value: number
  latest_timestamp: string
}

interface ErrorSummary {
  error_type: string
  severity: string
  count: number
  latest_occurrence: string
  context_breakdown: Record<string, number>
}

class ObservabilityDashboard {
  private supabase: ReturnType<typeof createClient>
  private options: DashboardOptions

  constructor(options: DashboardOptions) {
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
    }

    this.supabase = createClient(url, key)
    this.options = options
  }

  private log(message: string, level: 'info' | 'warn' | 'error' = 'info') {
    if (this.options.json) return

    const colors = {
      info: '\x1b[34m',
      warn: '\x1b[33m',
      error: '\x1b[31m',
    }
    const reset = '\x1b[0m'
    
    console.log(`${colors[level]}${message}${reset}`)
  }

  async getAlertRateLimitStatus(): Promise<AlertSummary[]> {
    try {
      const { data, error } = await this.supabase.rpc('get_alert_rate_limit_status')
      
      if (error) {
        console.error('Failed to get alert rate limit status:', error)
        return []
      }

      return data || []
    } catch (err) {
      console.error('Error getting alert rate limit status:', err)
      return []
    }
  }

  async getMetricsSummary(): Promise<MetricSummary[]> {
    try {
      const { data, error } = await this.supabase.rpc('get_metrics_summary', {
        p_metric_name: null,
        p_environment: this.options.environment || null,
        p_hours_back: this.options.hours
      })
      
      if (error) {
        console.error('Failed to get metrics summary:', error)
        return []
      }

      return data || []
    } catch (err) {
      console.error('Error getting metrics summary:', err)
      return []
    }
  }

  async getErrorSummary(): Promise<ErrorSummary[]> {
    try {
      const { data, error } = await this.supabase
        .from('error_logs')
        .select(`
          error_type,
          severity,
          context,
          created_at
        `)
        .gte('created_at', new Date(Date.now() - this.options.hours * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to get error summary:', error)
        return []
      }

      // Group errors by type and severity
      const errorMap = new Map<string, {
        severity: string
        count: number
        latest_occurrence: string
        contexts: Map<string, number>
      }>()

      for (const err of data || []) {
        const key = `${err.error_type}:${err.severity}`
        const existing = errorMap.get(key)
        const context = err.context?.area || 'unknown'

        if (existing) {
          existing.count++
          if (err.created_at > existing.latest_occurrence) {
            existing.latest_occurrence = err.created_at
          }
          existing.contexts.set(context, (existing.contexts.get(context) || 0) + 1)
        } else {
          const contexts = new Map<string, number>()
          contexts.set(context, 1)
          errorMap.set(key, {
            severity: err.severity,
            count: 1,
            latest_occurrence: err.created_at,
            contexts
          })
        }
      }

      // Convert to array format
      return Array.from(errorMap.entries()).map(([key, value]) => {
        const [error_type] = key.split(':')
        return {
          error_type,
          severity: value.severity,
          count: value.count,
          latest_occurrence: value.latest_occurrence,
          context_breakdown: Object.fromEntries(value.contexts)
        }
      }).sort((a, b) => b.count - a.count)

    } catch (err) {
      console.error('Error getting error summary:', err)
      return []
    }
  }

  async getSystemHealth(): Promise<{
    total_alerts: number
    active_rate_limits: number
    critical_errors_24h: number
    avg_response_time?: number
    uptime_percentage?: number
  }> {
    try {
      // Get alert counts
      const { data: alertData } = await this.supabase
        .from('alert_instances')
        .select('id', { count: 'exact' })
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

      // Get active rate limits
      const { data: rateLimitData } = await this.supabase
        .from('alert_rate_limits')
        .select('id', { count: 'exact' })
        .gte('current_count', 1)

      // Get critical errors in last 24h
      const { data: criticalErrorData } = await this.supabase
        .from('error_logs')
        .select('id', { count: 'exact' })
        .eq('severity', 'critical')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

      return {
        total_alerts: alertData?.length || 0,
        active_rate_limits: rateLimitData?.length || 0,
        critical_errors_24h: criticalErrorData?.length || 0
      }
    } catch (err) {
      console.error('Error getting system health:', err)
      return {
        total_alerts: 0,
        active_rate_limits: 0,
        critical_errors_24h: 0
      }
    }
  }

  displayAlertStatus(alerts: AlertSummary[]) {
    if (this.options.json) return

    console.log('\n📊 Alert Rate Limiting Status')
    console.log('================================')

    if (alerts.length === 0) {
      console.log('✅ No active rate limits')
      return
    }

    for (const alert of alerts) {
      const status = alert.is_rate_limited ? '🚫 RATE LIMITED' : '✅ Active'
      const escalation = alert.escalation_level > 0 ? ` (Escalation: Level ${alert.escalation_level})` : ''
      
      console.log(`\n${status} ${alert.rule_name}${escalation}`)
      console.log(`  Fingerprint: ${alert.fingerprint.substring(0, 12)}...`)
      console.log(`  Count: ${alert.current_count}/${alert.max_alerts} in ${alert.window_minutes}min window`)
      console.log(`  Window Progress: ${alert.window_progress_percent.toFixed(1)}%`)
      
      if (alert.is_rate_limited) {
        console.log(`  Next Window: ${new Date(alert.next_window_at).toLocaleString()}`)
      }
    }
  }

  displayMetricsSummary(metrics: MetricSummary[]) {
    if (this.options.json) return

    console.log('\n📈 Metrics Summary')
    console.log('==================')

    if (metrics.length === 0) {
      console.log('No metrics found for the specified time period')
      return
    }

    // Group by metric type
    const metricsByType = metrics.reduce((acc, metric) => {
      if (!acc[metric.metric_type]) acc[metric.metric_type] = []
      acc[metric.metric_type].push(metric)
      return acc
    }, {} as Record<string, MetricSummary[]>)

    for (const [type, typeMetrics] of Object.entries(metricsByType)) {
      console.log(`\n${type.toUpperCase()} Metrics:`)
      
      for (const metric of typeMetrics.slice(0, 10)) { // Show top 10
        console.log(`  ${metric.metric_name}:`)
        console.log(`    Count: ${metric.count}`)
        console.log(`    Latest: ${metric.latest_value} (${new Date(metric.latest_timestamp).toLocaleString()})`)
        
        if (metric.metric_type === 'counter') {
          console.log(`    Total: ${metric.sum_value}`)
        } else {
          console.log(`    Range: ${metric.min_value} - ${metric.max_value}`)
          console.log(`    Average: ${metric.avg_value.toFixed(2)}`)
        }
      }
    }
  }

  displayErrorSummary(errors: ErrorSummary[]) {
    if (this.options.json) return

    console.log('\n🚨 Error Summary')
    console.log('=================')

    if (errors.length === 0) {
      console.log('✅ No errors in the specified time period')
      return
    }

    const severityOrder = ['critical', 'high', 'medium', 'low']
    const sortedErrors = errors.sort((a, b) => {
      const severityDiff = severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity)
      if (severityDiff !== 0) return severityDiff
      return b.count - a.count
    })

    for (const error of sortedErrors.slice(0, 15)) { // Show top 15
      const severityIcon = {
        critical: '🔥',
        high: '⚠️',
        medium: '⚡',
        low: 'ℹ️'
      }[error.severity] || '❓'

      console.log(`\n${severityIcon} ${error.error_type} (${error.severity.toUpperCase()})`)
      console.log(`  Count: ${error.count}`)
      console.log(`  Latest: ${new Date(error.latest_occurrence).toLocaleString()}`)
      
      const contexts = Object.entries(error.context_breakdown)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([ctx, count]) => `${ctx}:${count}`)
        .join(', ')
      
      if (contexts) {
        console.log(`  Contexts: ${contexts}`)
      }
    }
  }

  displaySystemHealth(health: any) {
    if (this.options.json) return

    console.log('\n🏥 System Health Overview')
    console.log('==========================')
    
    console.log(`Alerts (24h): ${health.total_alerts}`)
    console.log(`Active Rate Limits: ${health.active_rate_limits}`)
    console.log(`Critical Errors (24h): ${health.critical_errors_24h}`)
    
    // Health score calculation
    let healthScore = 100
    if (health.critical_errors_24h > 0) healthScore -= health.critical_errors_24h * 10
    if (health.active_rate_limits > 3) healthScore -= (health.active_rate_limits - 3) * 5
    if (health.total_alerts > 10) healthScore -= (health.total_alerts - 10) * 2
    
    healthScore = Math.max(0, Math.min(100, healthScore))
    
    const healthEmoji = healthScore >= 90 ? '🟢' : 
                       healthScore >= 70 ? '🟡' : 
                       healthScore >= 50 ? '🟠' : '🔴'
    
    console.log(`Health Score: ${healthEmoji} ${healthScore}/100`)
  }

  async generateDashboard() {
    this.log('Loading observability dashboard...')

    const [alertStatus, metrics, errors, health] = await Promise.all([
      this.options.showAlerts ? this.getAlertRateLimitStatus() : Promise.resolve([]),
      this.options.showMetrics ? this.getMetricsSummary() : Promise.resolve([]),
      this.options.showErrors ? this.getErrorSummary() : Promise.resolve([]),
      this.getSystemHealth()
    ])

    if (this.options.json) {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        environment: this.options.environment || 'all',
        hours_back: this.options.hours,
        system_health: health,
        alert_rate_limits: alertStatus,
        metrics_summary: metrics,
        error_summary: errors
      }, null, 2))
      return
    }

    console.log('\n' + '='.repeat(60))
    console.log('🔍 LegacyGuard Observability Dashboard')
    console.log('='.repeat(60))
    console.log(`Environment: ${this.options.environment || 'All'}`)
    console.log(`Time Range: Last ${this.options.hours} hours`)
    console.log(`Generated: ${new Date().toLocaleString()}`)

    this.displaySystemHealth(health)
    
    if (this.options.showAlerts) {
      this.displayAlertStatus(alertStatus)
    }
    
    if (this.options.showMetrics) {
      this.displayMetricsSummary(metrics)
    }
    
    if (this.options.showErrors) {
      this.displayErrorSummary(errors)
    }

    console.log('\n' + '='.repeat(60))
    console.log('Dashboard complete. Run with --json for machine-readable output.')
  }
}

async function main() {
  const args = process.argv.slice(2)
  
  const options: DashboardOptions = {
    json: args.includes('--json'),
    hours: parseInt(args.find(arg => arg.startsWith('--hours'))?.split('=')[1] || '24'),
    environment: args.find(arg => arg.startsWith('--environment'))?.split('=')[1],
    showAlerts: !args.includes('--no-alerts'),
    showMetrics: !args.includes('--no-metrics'),
    showErrors: !args.includes('--no-errors')
  }

  // Help
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Observability Dashboard

Usage: npx tsx scripts/observability-dashboard.ts [options]

Options:
  --json                    Output in JSON format
  --hours=N                 Hours of data to analyze (default: 24)
  --environment=ENV         Filter by environment
  --no-alerts              Skip alert rate limiting status
  --no-metrics             Skip metrics summary
  --no-errors              Skip error summary
  --help, -h               Show this help message

Examples:
  npx tsx scripts/observability-dashboard.ts
  npx tsx scripts/observability-dashboard.ts --json --hours=12
  npx tsx scripts/observability-dashboard.ts --environment=production
    `)
    process.exit(0)
  }

  try {
    const dashboard = new ObservabilityDashboard(options)
    await dashboard.generateDashboard()
  } catch (error) {
    if (options.json) {
      console.log(JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString()
      }))
    } else {
      console.error('Dashboard error:', error.message)
    }
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}