import { serve } from 'std/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { insertErrorAndMaybeAlert, redactSensitiveData } from '../_shared/observability.ts'

// CORS (Stripe doesn't need it, but keep OPTIONS for safety)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}

// Env
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') ?? ''
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')

// Alerting window and threshold (persistent failures)
const FAILURE_WINDOW_MINUTES = parseInt(Deno.env.get('WEBHOOK_ALERT_WINDOW_MINUTES') ?? '10', 10)
const FAILURE_THRESHOLD = parseInt(Deno.env.get('WEBHOOK_ALERT_THRESHOLD') ?? '3', 10)

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })

// Structured logging helper (no PII)
function log(level: 'info' | 'warn' | 'error', msg: string, fields: Record<string, unknown> = {}) {
  const base = { level, msg, ts: new Date().toISOString(), ...fields }
  // Avoid dumping large payloads or secrets
  console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](JSON.stringify(base))
}

// Idempotency helpers using webhook_logs (webhook_id UNIQUE)
async function upsertWebhookReceive(
  webhookId: string,
  eventType: string
): Promise<{ exists: boolean; status: 'received' | 'processing' | 'processed' | 'failed' | null; attempts: number }> {
  // Try to insert; if conflict, fetch existing
  const { error: insertErr } = await supabase
    .from('webhook_logs')
    .insert({ webhook_id: webhookId, event_type: eventType, status: 'received', attempts: 1 })

  if (insertErr) {
    if ((insertErr as any).code === '23505') {
      // Duplicate; fetch current row and increment attempts
      const { data: row } = await supabase
        .from('webhook_logs')
        .select('status, attempts')
        .eq('webhook_id', webhookId)
        .maybeSingle()
      if (row) {
        await supabase
          .from('webhook_logs')
          .update({ attempts: (row.attempts ?? 1) + 1 })
          .eq('webhook_id', webhookId)
        return { exists: true, status: row.status ?? null, attempts: (row.attempts ?? 1) + 1 }
      }
      return { exists: true, status: null, attempts: 1 }
    }
    // Other insert errors
    throw insertErr
  }
  return { exists: false, status: 'received', attempts: 1 }
}

async function markWebhookStatus(webhookId: string, status: 'processing' | 'processed' | 'failed', error?: unknown) {
  const sanitizedError = error ? redactSensitiveData(String((error as any)?.message ?? error)) : null
  await supabase
    .from('webhook_logs')
    .update({ status, error: sanitizedError ?? undefined, processed_at: status === 'processed' ? new Date().toISOString() : null })
    .eq('webhook_id', webhookId)
}

// Attempt to acquire a processing lock by transitioning from 'received' -> 'processing'.
// Returns true if lock acquired by this invocation; otherwise returns current status.
async function acquireProcessingLock(webhookId: string): Promise<{ acquired: boolean; status: 'received' | 'processing' | 'processed' | 'failed' | null }> {
  // Conditional update; only succeed if currently 'received'
  const { data: updated, error: updErr } = await supabase
    .from('webhook_logs')
    .update({ status: 'processing' })
    .eq('webhook_id', webhookId)
    .eq('status', 'received')
    .select('webhook_id')

  if (updErr) {
    // If this fails, we can't safely acquire
    return { acquired: false, status: null }
  }
  if (updated && updated.length > 0) {
    return { acquired: true, status: 'processing' }
  }
  // Fetch current status to decide behavior
  const { data: row } = await supabase
    .from('webhook_logs')
    .select('status')
    .eq('webhook_id', webhookId)
    .maybeSingle()
  return { acquired: false, status: (row?.status as any) ?? null }
}

async function maybeAlertPersistentFailures(eventType: string) {
  // Count failed events of this type within window
  const sinceISO = new Date(Date.now() - FAILURE_WINDOW_MINUTES * 60_000).toISOString()
  const { count } = await supabase
    .from('webhook_logs')
    .select('id', { count: 'exact', head: true })
    .eq('event_type', eventType)
    .eq('status', 'failed')
    .gte('created_at', sinceISO)

  if ((count ?? 0) >= FAILURE_THRESHOLD) {
    // Use central alerting helper (sends via Resend and rate-limits by fingerprint)
    try {
      await insertErrorAndMaybeAlert(createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY), {
        error_type: 'stripe_webhook_failures',
        message: `${count} failures for ${eventType} in last ${FAILURE_WINDOW_MINUTES} minutes`,
        context: 'billing',
        http_status: 500,
        unhandled: true,
        severity: 'critical',
      })
    } catch (e) {
      log('error', 'alert_insert_failed', { event_type: eventType, err: String(e) })
      // Fallback: send a minimal alert email via Resend directly
      try {
        const recipients = (Deno.env.get('MONITORING_ALERT_EMAIL') ?? '').split(',').map((s) => s.trim()).filter(Boolean)
        const from = Deno.env.get('MONITORING_ALERT_FROM') ?? 'Schwalbe Alerts <alerts@documentsafe.app>'
        const resendKey = Deno.env.get('RESEND_API_KEY')
        if (resendKey && recipients.length > 0) {
          const subject = `[webhook] Persistent failures for ${eventType}`
          const html = `<p>${count} failures for <b>${eventType}</b> in last ${FAILURE_WINDOW_MINUTES} minutes.</p><p>Automated fallback alert.</p>`
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ from, to: recipients, subject, html, text: `${count} failures for ${eventType} in last ${FAILURE_WINDOW_MINUTES} minutes.` }),
          })
        }
      } catch (mailErr) {
        log('error', 'alert_fallback_failed', { err: String(mailErr) })
      }
    }
  }
}

async function incrementWebhookMetric(eventType: string) {
  // Use RPC if available, otherwise naive upsert
  try {
    const { error: rpcErr } = await supabase.rpc('increment_webhook_metric', { p_event_type: eventType })
    if (rpcErr) throw rpcErr
  } catch {
    const today = new Date().toISOString().slice(0, 10)
    const { data: existing } = await supabase
      .from('webhook_metrics')
      .select('count')
      .eq('date', today)
      .eq('event_type', eventType)
      .maybeSingle()
    if (existing) {
      await supabase
        .from('webhook_metrics')
        .update({ count: (existing.count ?? 0) + 1 })
        .eq('date', today)
        .eq('event_type', eventType)
    } else {
      await supabase.from('webhook_metrics').insert({ date: today, event_type: eventType, count: 1 })
    }
  }
}

// Dunning helpers (email + in-app banner), no PII in logs
async function getUserEmail(userId: string): Promise<string | null> {
  const { data } = await supabase.from('profiles').select('email').eq('id', userId).maybeSingle()
  return (data?.email as string) || null
}

async function setSubscriptionStatus(userId: string, status: 'past_due' | 'active') {
  const { error } = await supabase
    .from('user_subscriptions')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
  if (error) log('error', 'set_subscription_status_failed', { user_id: userId, code: error.code })
}

async function upsertDunningBanner(userId: string, title: string, body: string) {
  const { data: existing } = await supabase
    .from('notification_log')
    .select('id')
    .eq('recipient', userId)
    .eq('channel', 'in_app')
    .eq('reminder_rule_id', 'stripe_dunning')
    .eq('status', 'sent')
    .limit(1)
  if (existing && existing.length > 0) return

  const { error } = await supabase.from('notification_log').insert({
    reminder_rule_id: 'stripe_dunning',
    channel: 'in_app',
    recipient: userId,
    status: 'sent',
    sent_at: new Date().toISOString(),
    provider_response: { title, body },
  })
  if (error) log('error', 'enqueue_banner_failed', { user_id: userId, code: error.code })
}

async function clearDunningBanners(userId: string) {
  await supabase
    .from('notification_log')
    .update({ status: 'delivered', delivered_at: new Date().toISOString() })
    .eq('recipient', userId)
    .eq('channel', 'in_app')
    .eq('reminder_rule_id', 'stripe_dunning')
}

async function sendEmail(to: string, subject: string, html: string, text?: string) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ to, subject, html, text }),
  })
  if (!res.ok) {
    const msg = await res.text()
    log('error', 'send_email_failed', { status: res.status, msg })
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const signature = req.headers.get('stripe-signature')

  // Critical security check - ensure webhook secret is configured
  if (!STRIPE_WEBHOOK_SECRET) {
    log('error', 'webhook_secret_not_configured', {})
    return jsonResponse({ error: 'service_unavailable' }, 503)
  }

  if (!signature) {
    log('warn', 'webhook_missing_signature', {
      headers: Object.fromEntries(req.headers.entries())
    })
    return jsonResponse({ error: 'missing_signature' }, 400)
  }

  // Validate signature format
  if (!signature.includes('t=') || !signature.includes('v1=')) {
    log('warn', 'webhook_invalid_signature_format', { signature: signature.substring(0, 20) })
    return jsonResponse({ error: 'invalid_signature_format' }, 400)
  }

  // Read raw body to verify signature
  const body = await req.text()

  let event: Stripe.Event
  try {
    // Construct event with default tolerance (5 minutes)
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)

    // Additional timestamp validation for replay attack prevention
    const webhookTimestamp = event.created
    const currentTimestamp = Math.floor(Date.now() / 1000)
    const maxAge = 10 * 60 // 10 minutes in seconds

    if (currentTimestamp - webhookTimestamp > maxAge) {
      log('warn', 'webhook_too_old', {
        event_id: event.id,
        webhook_timestamp: webhookTimestamp,
        current_timestamp: currentTimestamp,
        age_seconds: currentTimestamp - webhookTimestamp
      })
      return jsonResponse({ error: 'webhook_too_old' }, 400)
    }

  } catch (err: any) {
    log('warn', 'invalid_signature', {
      reason: String(err?.message ?? err),
      error_type: err?.constructor?.name
    })
    return jsonResponse({ error: 'invalid_signature' }, 400)
  }

  const eventId = event.id
  const eventType = event.type
  const obj: any = (event as any).data?.object ?? {}
  const customerId: string | undefined = obj?.customer ?? undefined
  const subscriptionId: string | undefined = obj?.subscription ?? obj?.id // subscription events carry id directly

  log('info', 'webhook_received', { event_type: eventType, event_id: eventId, customer_id: customerId ?? null, subscription_id: subscriptionId ?? null })

  // Idempotency guard
  try {
    const { exists, status } = await upsertWebhookReceive(eventId, eventType)
    if (exists && status === 'processed') {
      log('info', 'duplicate_skipped', { event_id: eventId, event_type: eventType })
      return jsonResponse({ received: true, duplicate: true }, 200)
    }
  } catch (e) {
    // If logging fails, still proceed but record later
    log('warn', 'webhook_log_insert_failed', { event_id: eventId, err: String(e) })
  }

// Attempt to acquire processing lock
const lock = await acquireProcessingLock(eventId)
if (!lock.acquired) {
  // If already processed, skip; if processing, acknowledge to avoid duplicate work
  if (lock.status === 'processed' || lock.status === 'processing') {
    log('info', 'duplicate_or_in_progress', { event_id: eventId, status: lock.status })
    return jsonResponse({ received: true, duplicate: true }, 200)
  }
  // If failed or unknown, proceed (let Stripe retry if we error)
}

// Minimal metrics: count per event type (only once per unique event)
await incrementWebhookMetric(eventType)

  try {
    switch (eventType) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(obj)
        break
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(obj)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(obj)
        break
      case 'invoice.paid':
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(obj)
        break
      case 'invoice.payment_failed':
        await handlePaymentFailed(obj)
        break
      default:
        // No-op for other events
        break
    }

    await markWebhookStatus(eventId, 'processed')
    return jsonResponse({ received: true }, 200)
  } catch (err: any) {
    log('error', 'webhook_processing_failed', {
      event_id: eventId,
      event_type: eventType,
      customer_id: customerId ?? null,
      subscription_id: subscriptionId ?? null,
      err: redactSensitiveData(String(err?.message ?? err)),
    })
    await markWebhookStatus(eventId, 'failed', err)

    // Alert on persistent failures within window
    await maybeAlertPersistentFailures(eventType)

    // Signal failure to Stripe for retry
    return jsonResponse({ error: 'processing_failed' }, 500)
  }
})

async function handleCheckoutCompleted(session: any) {
  const userId: string | undefined = session?.metadata?.user_id
  const planFromMeta: string | undefined = session?.metadata?.plan
  const customerId: string | null = session?.customer ?? null
  const subscriptionId: string | null = session?.subscription ?? null

  if (!userId || !subscriptionId) {
    return
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const price = subscription.items?.data?.[0]?.price
  const plan = planFromMeta || mapPlanFromPriceId(price?.id)
  const interval = price?.recurring?.interval || 'month'
  const periodStart = new Date((subscription.current_period_start ?? 0) * 1000).toISOString()
  const periodEnd = new Date((subscription.current_period_end ?? 0) * 1000).toISOString()

  if (customerId) {
    await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', userId)
  }

  await supabase
    .from('user_subscriptions')
    .upsert(
      {
        user_id: userId,
        stripe_customer_id: customerId ?? undefined,
        stripe_subscription_id: subscriptionId,
        plan: (plan as any) || 'premium',
        status: 'active',
        billing_cycle: interval,
        started_at: periodStart,
        expires_at: periodEnd,
        current_period_end: periodEnd,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

  await supabase
    .from('user_usage')
    .upsert(
      {
        user_id: userId,
        document_count: 0,
        storage_used_mb: 0,
        time_capsule_count: 0,
        scans_this_month: 0,
        offline_document_count: 0,
        last_reset_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
}

async function handleSubscriptionUpdate(subscription: any) {
  const price = subscription.items?.data?.[0]?.price
  const plan = subscription?.metadata?.plan || mapPlanFromPriceId(price?.id)
  const interval = price?.recurring?.interval || 'month'
  const periodEnd = new Date((subscription.current_period_end ?? 0) * 1000).toISOString()

  await supabase
    .from('user_subscriptions')
    .update({
      plan: (plan as any) || 'premium',
      status: subscription.status,
      billing_cycle: interval,
      expires_at: periodEnd,
      current_period_end: periodEnd,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)
}

async function handleSubscriptionDeleted(subscription: any) {
  await supabase
    .from('user_subscriptions')
    .update({
      plan: 'free',
      status: 'cancelled',
      stripe_subscription_id: null,
      expires_at: new Date().toISOString(),
      current_period_end: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)
}

async function handlePaymentSucceeded(invoice: any) {
  const subscriptionId = invoice?.subscription
  if (!subscriptionId) return

  const amountCents = (invoice?.amount_paid ?? invoice?.amount_due ?? null) as number | null
  const currency = ((invoice?.currency as string | undefined) || undefined)?.toUpperCase()

  // Update subscription status
  await supabase
    .from('user_subscriptions')
    .update({
      status: 'active',
      updated_at: new Date().toISOString(),
      ...(amountCents !== null ? { price_amount_cents: amountCents } : {}),
      ...(currency ? { price_currency: currency } : {}),
    } as any)
    .eq('stripe_subscription_id', subscriptionId)

  // Clear dunning banner and send confirmation email if we can resolve user
  const { data: subRow } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscriptionId)
    .maybeSingle()
  const userId = subRow?.user_id as string | undefined
  if (userId) {
    await setSubscriptionStatus(userId, 'active')
    await clearDunningBanners(userId)
    const email = await getUserEmail(userId)
    if (email) {
      const amountFmt = amountCents ? `${(amountCents / 100).toFixed(2)} ${currency ?? ''}`.trim() : 'your subscription'
      const html = `<!doctype html><html><body>
        <p>Hi,</p>
        <p>Your payment of ${amountFmt} has been processed successfully and your subscription is active again.</p>
        <p style="font-size:12px;color:#64748b">© 2025 LegacyGuard</p>
      </body></html>`
      await sendEmail(email, 'Payment Confirmed - LegacyGuard', html, `Payment confirmed ${amountFmt}`)
    }
  }
}

async function handlePaymentFailed(invoice: any) {
  const subscriptionId = invoice?.subscription as string | undefined
  const customerId = invoice?.customer as string | undefined

  if (!subscriptionId && !customerId) return

  // Update status via subscription id if available
  if (subscriptionId) {
    await supabase
      .from('user_subscriptions')
      .update({ status: 'past_due', updated_at: new Date().toISOString() })
      .eq('stripe_subscription_id', subscriptionId)
  }

  // Resolve user via customer id (preferred for email/banner)
  let userId: string | null = null
  if (customerId) {
    const { data: sub } = await supabase
      .from('user_subscriptions')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .maybeSingle()
    userId = (sub?.user_id as string) || null
  } else if (subscriptionId) {
    const { data: sub } = await supabase
      .from('user_subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscriptionId)
      .maybeSingle()
    userId = (sub?.user_id as string) || null
  }

  if (userId) {
    await setSubscriptionStatus(userId, 'past_due')
    const email = await getUserEmail(userId)
    const amountCents = (invoice?.amount_due ?? invoice?.amount_remaining ?? null) as number | null
    const currency = ((invoice?.currency as string | undefined) || 'usd').toUpperCase()
    const nextAttemptTs = invoice?.next_payment_attempt ? new Date(invoice.next_payment_attempt * 1000) : null
    const retryDate = nextAttemptTs ? nextAttemptTs.toLocaleDateString('en-US') : 'soon'

    const siteUrl = Deno.env.get('SITE_URL') || 'https://legacyguard.app'
    const billingUrl = `${siteUrl}/account/billing`

    if (email) {
      const amountFmt = amountCents ? `${(amountCents / 100).toFixed(2)} ${currency}` : 'your subscription'
      const html = `<!doctype html><html><body>
        <p>Hi,</p>
        <p>We were unable to process your recent payment for ${amountFmt}. We will retry on ${retryDate}.</p>
        <p><a href="${billingUrl}">Open Billing Portal</a> to update your payment method.</p>
        <p style="font-size:12px;color:#64748b">© 2025 LegacyGuard</p>
      </body></html>`
      await sendEmail(
        email,
        'Action Required: Payment Failed - LegacyGuard',
        html,
        `Payment failed. Retry on ${retryDate}. Update here: ${billingUrl}`
      )
    }

    await upsertDunningBanner(
      userId,
      'Payment issue',
      'We could not process your payment. Please open the Billing Portal to update your payment method.'
    )
  }
}

function mapPlanFromPriceId(priceId?: string | null): 'free' | 'essential' | 'family' | 'premium' {
  const map: Record<string, 'essential' | 'family' | 'premium'> = {}
  for (const [k, v] of Object.entries(Deno.env.toObject())) {
    if (k.startsWith('STRIPE_PRICE_')) {
      const id = v
      if (typeof id === 'string') {
        if (k.includes('PREMIUM')) map[id] = 'premium'
        else if (k.includes('FAMILY')) map[id] = 'family'
        else if (k.includes('ESSENTIAL')) map[id] = 'essential'
      }
    }
  }
  if (priceId && map[priceId]) return map[priceId]
  return 'premium'
}
