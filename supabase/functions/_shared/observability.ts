import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

export type Severity = 'low' | 'medium' | 'high' | 'critical'
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical'
export type LogContext =
  | 'auth'
  | 'database'
  | 'billing'
  | 'storage'
  | 'sharing'
  | 'search'
  | 'rls'
  | 'edge'
  | 'client'
  | 'ai'
  | 'documents'
  | 'subscriptions'
  | 'reminders'
  | 'alerts'

export interface LogErrorInput {
  error_type: string
  message: string
  stack?: string
  context?: LogContext
  http_status?: number
  url?: string
  user_agent?: string
  session_id?: string
  unhandled?: boolean
  severity?: Severity
  user_id?: string | null
}

export const BASELINE_CONFIG = {
  // Which contexts are considered more sensitive and should escalate more aggressively
  criticalContexts: new Set<LogContext>(['auth', 'database', 'rls']),
  // Error types that are always considered critical
  criticalTypes: new Set<string>(['security', 'database', 'rls_violation']),
  // Treat any 5xx as at least high severity
  httpCriticalFloor: 500,
  // Burst threshold (documented; optional to enforce)
  burst: { windowMinutes: 10, countToCritical: 5 },
  // Default rate limit for alert emails
  alertRateLimitMinutes: parseInt(Deno.env.get('ALERT_RATE_LIMIT_MINUTES') ?? '30', 10),
  // Recipient(s) for alerts
  alertRecipients: (Deno.env.get('MONITORING_ALERT_EMAIL') ?? 'staging-alerts@documentsafe.app')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  alertFrom: Deno.env.get('MONITORING_ALERT_FROM') ?? 'Schwalbe Alerts <alerts@documentsafe.app>',
  environment: Deno.env.get('MONITORING_ENVIRONMENT') ?? Deno.env.get('NODE_ENV') ?? 'development',
}

export function determineSeverity(input: LogErrorInput): Severity {
  if (input.severity) return input.severity

  // Always critical for certain error types
  if (BASELINE_CONFIG.criticalTypes.has(input.error_type)) {
    return 'critical'
  }

  // 5xx HTTPs are high; escalate to critical for critical contexts
  if (typeof input.http_status === 'number' && input.http_status >= BASELINE_CONFIG.httpCriticalFloor) {
    return BASELINE_CONFIG.criticalContexts.has(input.context ?? 'client') ? 'critical' : 'high'
  }

  // Unhandled exceptions should be at least high severity
  if (input.unhandled) {
    return BASELINE_CONFIG.criticalContexts.has(input.context ?? 'client') ? 'critical' : 'high'
  }

  // Default medium
  return 'medium'
}

// Redact obvious secret-looking substrings from any alert content
export function redactSensitiveData(text?: string): string | undefined {
  if (!text) return text
  let t = text
  // Common token patterns (not exhaustive)
  const patterns: RegExp[] = [
    /(sk_live_|sk_test_)[A-Za-z0-9]{10,}/g, // Stripe-like keys
    /(re_|resend_)[A-Za-z0-9]{10,}/gi, // Resend-like keys
    /eyJ[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+/g, // JWT
    /api[_-]?key\s*[:=]\s*['\"]?[A-Za-z0-9_\-]{16,}['\"]?/gi,
    /secret\s*[:=]\s*['\"]?[A-Za-z0-9_\-]{12,}['\"]?/gi,
  ]
  for (const re of patterns) {
    t = t.replace(re, '[redacted]')
  }
  return t
}

// Produce a stable fingerprint for de-duplication and rate-limiting
export async function fingerprint(input: LogErrorInput): Promise<string> {
  const base = [
    BASELINE_CONFIG.environment,
    (input.context ?? 'client').toString(),
    input.error_type,
    normalizeMessage(input.message),
  ].join('|')
  const data = new TextEncoder().encode(base)
  const digest = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(digest))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

function normalizeMessage(message: string): string {
  // Remove volatile numbers/ids to make grouping more stable
  return message
    .toLowerCase()
    .replace(/[0-9a-f]{8,}/g, '*') // ids/hashes
    .replace(/\b\d+\b/g, '*')
    .slice(0, 240)
}

export async function insertErrorAndMaybeAlert(
  supabaseAdmin: ReturnType<typeof createClient>,
  input: LogErrorInput
): Promise<{ severity: Severity; alerted: boolean; alertId?: string }> {
  const severity = determineSeverity(input)
  const redactedMessage = redactSensitiveData(input.message) ?? ''
  const redactedStack = redactSensitiveData(input.stack)

  // Insert into error_logs
  const { data: errRow, error: insertErr } = await supabaseAdmin
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

  // Only alert on critical
  if (severity !== 'critical') {
    return { severity, alerted: false }
  }

  // Rate limit using alert_instances fingerprint in the last N minutes
  const fp = await fingerprint(input)
  const sinceISO = new Date(Date.now() - BASELINE_CONFIG.alertRateLimitMinutes * 60_000).toISOString()
  const { data: recentAlerts, error: raErr } = await supabaseAdmin
    .from('alert_instances')
    .select('id, created_at, triggered_data')
    .gte('created_at', sinceISO)
    .contains('triggered_data', { fingerprint: fp })
    .limit(1)

  if (raErr) {
    console.error('Failed to check recent alerts:', raErr)
  }

  if (recentAlerts && recentAlerts.length > 0) {
    // Suppress due to rate limiting
    return { severity, alerted: false }
  }

  // Ensure we have an alert rule to reference (create if missing)
  const ruleName = 'Baseline Critical Error'
  const { data: existingRule } = await supabaseAdmin
    .from('alert_rules')
    .select('id')
    .eq('name', ruleName)
    .limit(1)
    .single()

  let ruleId = existingRule?.id as string | undefined
  if (!ruleId) {
    const { data: newRule, error: ruleErr } = await supabaseAdmin
      .from('alert_rules')
      .insert({
        name: ruleName,
        description: 'Auto-generated baseline rule for critical errors',
        condition_type: 'error_severity',
        condition_config: { severity: 'critical' },
        severity: 'critical',
        enabled: true,
        notification_channels: ['email'],
        cooldown_minutes: BASELINE_CONFIG.alertRateLimitMinutes,
      })
      .select('id')
      .single()
    if (ruleErr) {
      console.error('Failed to create alert rule:', ruleErr)
    } else {
      ruleId = newRule?.id
    }
  }

  // Create alert instance
  const title = `Critical ${input.error_type} error`
  const message = `${redactedMessage}`
  const { data: alertInstance, error: aiErr } = await supabaseAdmin
    .from('alert_instances')
    .insert({
      alert_rule_id: ruleId ?? null,
      title,
      message,
      severity: 'critical',
      triggered_data: {
        fingerprint: fp,
        environment: BASELINE_CONFIG.environment,
        url: input.url,
        user_agent: input.user_agent ? '[present]' : undefined,
        error_id: errRow?.id,
      },
    })
    .select('id')
    .single()

  if (aiErr) {
    console.error('Failed to insert alert_instances:', aiErr)
  }

  // Send email alert via Resend (directly, to avoid chaining functions)
  try {
    const subject = `[${BASELINE_CONFIG.environment}] Critical ${input.error_type}`
    const html = `
      <h2>Critical Error Detected</h2>
      <p><strong>Environment:</strong> ${BASELINE_CONFIG.environment}</p>
      <p><strong>Type:</strong> ${escapeHtml(input.error_type)}</p>
      <p><strong>Context:</strong> ${escapeHtml(String(input.context ?? 'n/a'))}</p>
      <p><strong>Message:</strong> ${escapeHtml(redactedMessage)}</p>
      ${input.url ? `<p><strong>URL:</strong> ${escapeHtml(input.url)}</p>` : ''}
      <p><small>Note: Sensitive values are redacted. See logs for full details.</small></p>
    `

    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (!resendKey) {
      console.error('RESEND_API_KEY not configured; cannot send alert email')
    } else {
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: BASELINE_CONFIG.alertFrom,
          to: BASELINE_CONFIG.alertRecipients,
          subject,
          html,
          text: `Critical error in ${BASELINE_CONFIG.environment} - ${input.error_type}: ${redactedMessage}`,
        }),
      })
      if (!resp.ok) {
        const errText = await resp.text()
        console.error('Failed to send alert email via Resend:', errText)
      }
    }
  } catch (mailErr) {
    console.error('Alert email exception:', mailErr)
  }

  return { severity, alerted: true, alertId: alertInstance?.id }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}