import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

export type Severity = 'low' | 'medium' | 'high' | 'critical'
export type MetricType = 'counter' | 'gauge' | 'histogram' | 'summary'
export type NotificationChannel = 'email' | 'slack' | 'pagerduty' | 'webhook'

export interface EnhancedLogErrorInput {
  error_type: string
  message: string
  stack?: string
  context?: string
  http_status?: number
  url?: string
  user_agent?: string
  session_id?: string
  unhandled?: boolean
  severity?: Severity
  user_id?: string | null
  labels?: Record<string, string>
  override_rate_limit?: boolean
}

export interface MetricInput {
  name: string
  type: MetricType
  value: number
  labels?: Record<string, string | number>
  environment?: string
}

export interface RateLimitStatus {
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

export interface AlertResult {
  alert_id: string | null
  rate_limited: boolean
  escalation_level: number
  next_allowed_at: string | null
}

export class EnhancedObservability {
  private supabase: ReturnType<typeof createClient>
  private environment: string
  private alertRecipients: string[]
  private alertFrom: string

  constructor(supabaseAdmin: ReturnType<typeof createClient>) {
    this.supabase = supabaseAdmin
    this.environment = Deno.env.get('MONITORING_ENVIRONMENT') ?? 
                     Deno.env.get('NODE_ENV') ?? 'development'
    this.alertRecipients = (Deno.env.get('MONITORING_ALERT_EMAIL') ?? 
                           'staging-alerts@documentsafe.app')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
    this.alertFrom = Deno.env.get('MONITORING_ALERT_FROM') ?? 
                    'Schwalbe Alerts <alerts@documentsafe.app>'
  }

  // Record a metric for observability
  async recordMetric(input: MetricInput): Promise<string | null> {
    try {
      const { data, error } = await this.supabase.rpc('record_metric', {
        p_metric_name: input.name,
        p_metric_type: input.type,
        p_value: input.value,
        p_labels: input.labels || {},
        p_environment: input.environment || this.environment
      })

      if (error) {
        console.error('Failed to record metric:', error)
        return null
      }

      return data
    } catch (err) {
      console.error('Error recording metric:', err)
      return null
    }
  }

  // Record multiple metrics in batch
  async recordMetrics(metrics: MetricInput[]): Promise<void> {
    await Promise.all(metrics.map(metric => this.recordMetric(metric)))
  }

  // Get rate limiting status for alerts
  async getRateLimitStatus(ruleName?: string, fingerprint?: string): Promise<RateLimitStatus[]> {
    try {
      const { data, error } = await this.supabase.rpc('get_alert_rate_limit_status', {
        p_rule_name: ruleName || null,
        p_fingerprint: fingerprint || null
      })

      if (error) {
        console.error('Failed to get rate limit status:', error)
        return []
      }

      return data || []
    } catch (err) {
      console.error('Error getting rate limit status:', err)
      return []
    }
  }

  // Enhanced alert triggering with sophisticated rate limiting
  async triggerAlert(
    ruleName: string,
    title: string,
    message: string,
    data: Record<string, any> = {},
    fingerprint?: string,
    overrideRateLimit = false
  ): Promise<AlertResult | null> {
    try {
      const { data: result, error } = await this.supabase.rpc('trigger_alert_with_rate_limiting', {
        p_rule_name: ruleName,
        p_title: title,
        p_message: message,
        p_triggered_data: data,
        p_fingerprint: fingerprint,
        p_override_rate_limit: overrideRateLimit
      })

      if (error) {
        console.error('Failed to trigger alert:', error)
        return null
      }

      return result?.[0] || null
    } catch (err) {
      console.error('Error triggering alert:', err)
      return null
    }
  }

  // Enhanced error logging with metrics and alerts
  async logErrorWithObservability(input: EnhancedLogErrorInput): Promise<{
    severity: Severity
    alerted: boolean
    alertId?: string
    rateLimited: boolean
    escalationLevel: number
  }> {
    const severity = this.determineSeverity(input)
    const redactedMessage = this.redactSensitiveData(input.message) ?? ''
    const redactedStack = this.redactSensitiveData(input.stack)

    // Record error metric
    await this.recordMetric({
      name: 'error_count',
      type: 'counter',
      value: 1,
      labels: {
        error_type: input.error_type,
        severity,
        context: input.context || 'unknown',
        environment: this.environment
      }
    })

    // Record HTTP status metric if available
    if (input.http_status) {
      await this.recordMetric({
        name: 'http_status_count',
        type: 'counter',
        value: 1,
        labels: {
          status_code: input.http_status.toString(),
          status_class: this.getHttpStatusClass(input.http_status),
          environment: this.environment
        }
      })
    }

    // Insert into error_logs
    const { data: errRow, error: insertErr } = await this.supabase
      .from('error_logs')
      .insert({
        user_id: input.user_id ?? null,
        error_type: input.error_type,
        error_message: redactedMessage,
        error_stack: redactedStack,
        severity,
        context: input.context ? { area: input.context } : null,
        user_agent: input.user_agent,
        url: input.url,
        session_id: input.session_id,
      })
      .select('id')
      .single()

    if (insertErr) {
      console.error('Failed to insert error_logs:', insertErr)
      throw insertErr
    }

    // Only alert on high and critical errors
    if (severity !== 'critical' && severity !== 'high') {
      return { severity, alerted: false, rateLimited: false, escalationLevel: 0 }
    }

    // Trigger alert with rate limiting
    const fp = await this.fingerprint(input)
    const alertResult = await this.triggerAlert(
      `${severity}_errors`,
      `${severity.toUpperCase()} ${input.error_type} error`,
      redactedMessage,
      {
        fingerprint: fp,
        environment: this.environment,
        url: input.url,
        user_agent: input.user_agent ? '[present]' : undefined,
        error_id: errRow?.id,
        labels: input.labels || {}
      },
      fp,
      input.override_rate_limit
    )

    if (!alertResult) {
      return { severity, alerted: false, rateLimited: false, escalationLevel: 0 }
    }

    const { alert_id, rate_limited, escalation_level } = alertResult

    // Send notification if alert was created and not rate limited
    if (alert_id && !rate_limited) {
      await this.sendNotification(alert_id, {
        title: `[${this.environment}] ${severity.toUpperCase()} ${input.error_type}`,
        message: redactedMessage,
        severity,
        environment: this.environment,
        context: input.context,
        url: input.url,
        escalationLevel: escalation_level
      })
    }

    return {
      severity,
      alerted: !!alert_id,
      alertId: alert_id || undefined,
      rateLimited: rate_limited,
      escalationLevel: escalation_level
    }
  }

  // Send notification with multiple channels
  private async sendNotification(alertId: string, details: {
    title: string
    message: string
    severity: Severity
    environment: string
    context?: string
    url?: string
    escalationLevel: number
  }): Promise<void> {
    const { title, message, severity, environment, context, url, escalationLevel } = details

    // Determine channels based on severity and escalation
    const channels: NotificationChannel[] = ['email']
    
    if (severity === 'critical' || escalationLevel >= 2) {
      channels.push('slack')
    }
    
    if (severity === 'critical' && escalationLevel >= 3) {
      channels.push('pagerduty')
    }

    // Send to each channel
    for (const channel of channels) {
      try {
        let success = false
        let errorMessage = ''

        switch (channel) {
          case 'email':
            success = await this.sendEmailNotification(title, message, severity, environment, context, url)
            break
          case 'slack':
            success = await this.sendSlackNotification(title, message, severity, environment, context, url)
            break
          case 'pagerduty':
            success = await this.sendPagerDutyNotification(title, message, severity, environment)
            break
        }

        // Record notification attempt
        await this.supabase.from('alert_notifications').insert({
          alert_instance_id: alertId,
          channel,
          recipient: this.getChannelRecipient(channel),
          status: success ? 'sent' : 'failed',
          error_message: success ? null : errorMessage
        })

      } catch (err) {
        console.error(`Failed to send ${channel} notification:`, err)
        
        // Record failed notification
        await this.supabase.from('alert_notifications').insert({
          alert_instance_id: alertId,
          channel,
          recipient: this.getChannelRecipient(channel),
          status: 'failed',
          error_message: err.message
        })
      }
    }
  }

  private async sendEmailNotification(
    title: string,
    message: string,
    severity: Severity,
    environment: string,
    context?: string,
    url?: string
  ): Promise<boolean> {
    try {
      const html = `
        <h2>🚨 ${title}</h2>
        <p><strong>Environment:</strong> ${environment}</p>
        <p><strong>Severity:</strong> ${severity.toUpperCase()}</p>
        ${context ? `<p><strong>Context:</strong> ${this.escapeHtml(context)}</p>` : ''}
        <p><strong>Message:</strong> ${this.escapeHtml(message)}</p>
        ${url ? `<p><strong>URL:</strong> ${this.escapeHtml(url)}</p>` : ''}
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <hr>
        <p><small>This is an automated alert from the LegacyGuard monitoring system.</small></p>
      `

      const resendKey = Deno.env.get('RESEND_API_KEY')
      if (!resendKey) {
        console.error('RESEND_API_KEY not configured; cannot send alert email')
        return false
      }

      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.alertFrom,
          to: this.alertRecipients,
          subject: title,
          html,
          text: `${title}\n\nEnvironment: ${environment}\nSeverity: ${severity}\nMessage: ${message}`,
        }),
      })

      return resp.ok
    } catch (err) {
      console.error('Email notification error:', err)
      return false
    }
  }

  private async sendSlackNotification(
    title: string,
    message: string,
    severity: Severity,
    environment: string,
    context?: string,
    url?: string
  ): Promise<boolean> {
    try {
      const webhookUrl = Deno.env.get('SLACK_WEBHOOK_URL')
      if (!webhookUrl) {
        console.warn('SLACK_WEBHOOK_URL not configured; skipping Slack notification')
        return false
      }

      const color = severity === 'critical' ? 'danger' : severity === 'high' ? 'warning' : 'good'
      
      const payload = {
        text: title,
        attachments: [{
          color,
          fields: [
            { title: 'Environment', value: environment, short: true },
            { title: 'Severity', value: severity.toUpperCase(), short: true },
            ...(context ? [{ title: 'Context', value: context, short: true }] : []),
            { title: 'Message', value: message, short: false },
            ...(url ? [{ title: 'URL', value: url, short: false }] : [])
          ],
          ts: Math.floor(Date.now() / 1000)
        }]
      }

      const resp = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      return resp.ok
    } catch (err) {
      console.error('Slack notification error:', err)
      return false
    }
  }

  private async sendPagerDutyNotification(
    title: string,
    message: string,
    severity: Severity,
    environment: string
  ): Promise<boolean> {
    try {
      const integrationKey = Deno.env.get('PAGERDUTY_INTEGRATION_KEY')
      if (!integrationKey) {
        console.warn('PAGERDUTY_INTEGRATION_KEY not configured; skipping PagerDuty notification')
        return false
      }

      const payload = {
        routing_key: integrationKey,
        event_action: 'trigger',
        payload: {
          summary: title,
          source: `LegacyGuard-${environment}`,
          severity: severity === 'critical' ? 'critical' : 'error',
          custom_details: {
            environment,
            message,
            timestamp: new Date().toISOString()
          }
        }
      }

      const resp = await fetch('https://events.pagerduty.com/v2/enqueue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      return resp.ok
    } catch (err) {
      console.error('PagerDuty notification error:', err)
      return false
    }
  }

  private getChannelRecipient(channel: NotificationChannel): string {
    switch (channel) {
      case 'email': return this.alertRecipients.join(',')
      case 'slack': return 'slack-channel'
      case 'pagerduty': return 'pagerduty-service'
      default: return 'unknown'
    }
  }

  private determineSeverity(input: EnhancedLogErrorInput): Severity {
    if (input.severity) return input.severity

    // Critical error types
    const criticalTypes = new Set(['security', 'database', 'rls_violation', 'auth_failure'])
    if (criticalTypes.has(input.error_type)) {
      return 'critical'
    }

    // Critical contexts
    const criticalContexts = new Set(['auth', 'database', 'rls'])
    
    // 5xx HTTP errors
    if (typeof input.http_status === 'number' && input.http_status >= 500) {
      return criticalContexts.has(input.context || '') ? 'critical' : 'high'
    }

    // Unhandled exceptions
    if (input.unhandled) {
      return criticalContexts.has(input.context || '') ? 'critical' : 'high'
    }

    // 4xx errors are medium by default
    if (typeof input.http_status === 'number' && input.http_status >= 400) {
      return 'medium'
    }

    return 'medium'
  }

  private getHttpStatusClass(status: number): string {
    if (status >= 500) return '5xx'
    if (status >= 400) return '4xx'
    if (status >= 300) return '3xx'
    if (status >= 200) return '2xx'
    return '1xx'
  }

  private redactSensitiveData(text?: string): string | undefined {
    if (!text) return text
    let t = text
    
    const patterns: RegExp[] = [
      /(sk_live_|sk_test_)[A-Za-z0-9]{10,}/g,
      /(re_|resend_)[A-Za-z0-9]{10,}/gi,
      /eyJ[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+/g,
      /api[_-]?key\s*[:=]\s*['\"]?[A-Za-z0-9_\-]{16,}['\"]?/gi,
      /secret\s*[:=]\s*['\"]?[A-Za-z0-9_\-]{12,}['\"]?/gi,
      /password\s*[:=]\s*['\"]?[^'\"]{6,}['\"]?/gi,
      /auth[_-]?token\s*[:=]\s*['\"]?[A-Za-z0-9_\-]{16,}['\"]?/gi
    ]
    
    for (const re of patterns) {
      t = t.replace(re, '[REDACTED]')
    }
    
    return t
  }

  private async fingerprint(input: EnhancedLogErrorInput): Promise<string> {
    const base = [
      this.environment,
      input.context || 'client',
      input.error_type,
      this.normalizeMessage(input.message),
    ].join('|')
    
    const data = new TextEncoder().encode(base)
    const digest = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(digest))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  private normalizeMessage(message: string): string {
    return message
      .toLowerCase()
      .replace(/[0-9a-f]{8,}/g, '*')
      .replace(/\b\d+\b/g, '*')
      .slice(0, 240)
  }

  private escapeHtml(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  // Get metrics summary for monitoring dashboards
  async getMetricsSummary(
    metricName?: string,
    environment?: string,
    hoursBack = 24
  ): Promise<any[]> {
    try {
      const { data, error } = await this.supabase.rpc('get_metrics_summary', {
        p_metric_name: metricName || null,
        p_environment: environment || this.environment,
        p_hours_back: hoursBack
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

  // Cleanup old observability data
  async cleanupOldData(
    metricsRetentionDays = 30,
    rateLimitsRetentionDays = 7
  ): Promise<{ metrics: number; rateLimits: number; notifications: number }> {
    try {
      const { data, error } = await this.supabase.rpc('cleanup_observability_data', {
        p_metrics_retention_days: metricsRetentionDays,
        p_rate_limits_retention_days: rateLimitsRetentionDays
      })

      if (error) {
        console.error('Failed to cleanup observability data:', error)
        return { metrics: 0, rateLimits: 0, notifications: 0 }
      }

      const result = data?.[0] || { cleaned_metrics: 0, cleaned_rate_limits: 0, cleaned_notifications: 0 }
      return {
        metrics: result.cleaned_metrics,
        rateLimits: result.cleaned_rate_limits,
        notifications: result.cleaned_notifications
      }
    } catch (err) {
      console.error('Error cleaning up observability data:', err)
      return { metrics: 0, rateLimits: 0, notifications: 0 }
    }
  }
}