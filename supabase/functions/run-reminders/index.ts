import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Environment
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

type ReminderRule = {
  id: string
  user_id: string
  title: string
  description: string | null
  scheduled_at: string // ISO
  recurrence_rule: string | null
  recurrence_end_at: string | null
  channels: unknown
  status: 'active' | 'paused' | 'completed' | 'cancelled'
  next_execution_at: string | null
  last_executed_at: string | null
  execution_count: number
  max_executions: number | null
}

function parseRRule(rrule: string | null): { freq?: 'DAILY'|'WEEKLY'|'MONTHLY', interval: number } {
  if (!rrule) return { interval: 0 }
  const parts = rrule.split(';').reduce((acc, kv) => {
    const [k, v] = kv.split('=');
    acc[k?.toUpperCase?.() || ''] = v
    return acc
  }, {} as Record<string, string | undefined>)
  const freq = (parts['FREQ'] as any) as 'DAILY'|'WEEKLY'|'MONTHLY'|undefined
  const interval = Math.max(1, parseInt(parts['INTERVAL'] || '1', 10))
  return { freq, interval }
}

function addDays(date: Date, days: number) { const d = new Date(date); d.setUTCDate(d.getUTCDate() + days); return d }
function addWeeks(date: Date, weeks: number) { return addDays(date, weeks * 7) }
function addMonths(date: Date, months: number) { const d = new Date(date); d.setUTCMonth(d.getUTCMonth() + months); return d }

function computeNextExecution(rule: ReminderRule, now = new Date()): Date | null {
  // If no recurrence, single-shot: no next after first fire
  const rrule = parseRRule(rule.recurrence_rule)
  if (!rrule.freq) return null

  const base = rule.last_executed_at ? new Date(rule.last_executed_at) : new Date(rule.scheduled_at)
  let next = new Date(base)
  const limit = 1000
  for (let i = 0; i < limit; i++) {
    if (rrule.freq === 'DAILY') next = addDays(next, rrule.interval)
    else if (rrule.freq === 'WEEKLY') next = addWeeks(next, rrule.interval)
    else if (rrule.freq === 'MONTHLY') next = addMonths(next, rrule.interval)
    if (next.getTime() > now.getTime()) break
  }

  if (rule.recurrence_end_at) {
    const end = new Date(rule.recurrence_end_at)
    if (next.getTime() > end.getTime()) return null
  }
  if (rule.max_executions != null && rule.execution_count + 1 >= rule.max_executions) {
    // This execution will be the last, so no next
    return null
  }
  return next
}

async function sendEmail(to: string, subject: string, html?: string, text?: string): Promise<{ ok: boolean, error?: string }> {
  try {
    const { error } = await supabase.functions.invoke('send-email', {
      body: { to, subject, html, text },
    })
    if (error) return { ok: false, error: String(error) }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

async function trackAnalytics(userId: string | null, type: string, data?: Record<string, unknown>) {
  try {
    await supabase.from('analytics_events').insert({
      user_id: userId,
      event_type: type,
      event_data: data ?? {},
      session_id: crypto.randomUUID(),
      device_info: {},
    })
  } catch (_) {
    // best-effort only
  }
}

async function processDueReminders() {
  const { data: rules, error } = await supabase
    .from('reminder_rule')
    .select('*')
    .eq('status', 'active')
    .lte('next_execution_at', new Date().toISOString())
    .order('next_execution_at', { ascending: true })
    .limit(200)

  if (error) throw error

  // Also include single-shot where next_execution_at is null but scheduled_at <= now and never executed
  const { data: singleShot, error: e2 } = await supabase
    .from('reminder_rule')
    .select('*')
    .eq('status', 'active')
    .is('next_execution_at', null)
    .lte('scheduled_at', new Date().toISOString())
    .lte('execution_count', 0)
    .limit(200)

  if (e2) throw e2

  const due: ReminderRule[] = [...(rules || []), ...(singleShot || [])]

  let processed = 0
  for (const r of due) {
    try {
      const channels = Array.isArray(r.channels) ? (r.channels as string[]) : JSON.parse(String(r.channels || '[]'))

      // Resolve recipient email (profiles preferred)
      let recipientEmail: string | null = null
      {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', r.user_id)
          .maybeSingle()
        recipientEmail = (profile?.email as string) || null
      }

      const now = new Date()
      // Deliver per channel
      for (const ch of channels) {
        if (ch === 'email' && recipientEmail) {
          const subject = `Reminder: ${r.title}`
          const plain = r.description ? `${r.description}` : 'You have a scheduled reminder.'
          const html = `<!doctype html><html><body><p>${plain}</p></body></html>`
          const res = await sendEmail(recipientEmail, subject, html, plain)

          await supabase.from('notification_log').insert({
            reminder_rule_id: r.id,
            channel: 'email',
            recipient: recipientEmail,
            status: res.ok ? 'sent' : 'failed',
            provider_response: res.ok ? null : { error: res.error },
            sent_at: new Date().toISOString(),
            error_message: res.ok ? null : res.error,
          })

          await trackAnalytics(r.user_id, 'reminder_sent', { channel: 'email', reminder_id: r.id })
        }
        if (ch === 'in_app') {
          await supabase.from('notification_log').insert({
            reminder_rule_id: r.id,
            channel: 'in_app',
            recipient: r.user_id,
            status: 'sent',
            sent_at: new Date().toISOString(),
          })
          await trackAnalytics(r.user_id, 'reminder_sent', { channel: 'in_app', reminder_id: r.id })
        }
      }

      // Update rule counters and next
      const next = computeNextExecution(r, now)
      const updates: Partial<ReminderRule> = {
        last_executed_at: now.toISOString(),
        execution_count: (r.execution_count || 0) + 1,
        next_execution_at: next ? next.toISOString() : null,
        status: next ? r.status : 'completed',
      } as any

      const { error: updErr } = await supabase.from('reminder_rule').update(updates).eq('id', r.id)
      if (updErr) throw updErr

      processed++
    } catch (e) {
      // best-effort logging
      await trackAnalytics(r.user_id, 'reminder_error', { reminder_id: r.id, error: (e as Error).message })
    }
  }

  return { processed }
}

serve(async (req) => {
  try {
    // Simple auth: require any Authorization header; in production, add secret or restrict via Supabase Access Controls
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401 })
    }

    const result = await processDueReminders()
    return new Response(JSON.stringify({ ok: true, ...result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: (e as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
