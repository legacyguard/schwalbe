import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Stripe types are referenced loosely to avoid bundling Stripe SDK in Edge Function.
// We only read selected fields from the event payload.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}

// Basic signer using Stripe's constructEvent is preferred, but to avoid SDK we validate timestamp window
// and rely on Stripe to re-deliver on 4xx/5xx. In production, consider adding official Stripe signature validation.
// For now, we accept requests only from configured environment with a secret gate header to reduce risk.
const WEBHOOK_GATE = Deno.env.get('STRIPE_WEBHOOK_GATE')
const SIGNING_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Helpers for Stripe signature verification (HMAC-SHA256)
const enc = new TextEncoder()

function toHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let hex = ''
  for (let i = 0; i < bytes.length; i++) {
    const h = bytes[i].toString(16).padStart(2, '0')
    hex += h
  }
  return hex
}

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let out = 0
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return out === 0
}

async function hmacSHA256Hex(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload))
  return toHex(sig)
}

async function verifyStripeSignature(rawBody: string, signatureHeader: string, secret: string, toleranceSec = 300): Promise<boolean> {
  try {
    const parts = signatureHeader.split(',')
    let tStr: string | null = null
    const v1: string[] = []
    for (const part of parts) {
      const [k, v] = part.split('=')
      if (k === 't') tStr = v
      if (k === 'v1') v1.push(v)
    }
    if (!tStr || v1.length === 0) return false
    const t = Number(tStr)
    if (!Number.isFinite(t)) return false

    const nowSec = Math.floor(Date.now() / 1000)
    if (Math.abs(nowSec - t) > toleranceSec) return false

    const expected = await hmacSHA256Hex(secret, `${t}.${rawBody}`)
    for (const candidate of v1) {
      if (timingSafeEqualStr(expected, candidate)) return true
    }
    return false
  } catch {
    return false
  }
}

// Helper: fetch user profile email
async function getUserEmail(userId: string): Promise<string | null> {
  const { data } = await supabase.from('profiles').select('email').eq('id', userId).maybeSingle()
  return (data?.email as string) || null
}

// Helper: mark subscription status and banner
async function setSubscriptionStatus(userId: string, status: 'past_due' | 'active') {
  const { error } = await supabase
    .from('user_subscriptions')
    .update({ status })
    .eq('user_id', userId)
  if (error) {
    console.error('stripe-webhook: update subscription status failed', { userId, status, code: error.code })
  }
}

// Helper: insert in-app banner via notification_log (leveraging reminders channel/table for simple banners)
async function upsertDunningBanner(userId: string, title: string, body: string) {
  // Ensure only one active banner exists per user
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
    reminder_rule_id: 'stripe_dunning', // sentinel
    channel: 'in_app',
    recipient: userId,
    status: 'sent',
    sent_at: new Date().toISOString(),
    provider_response: { title, body },
  })
  if (error) {
    console.error('stripe-webhook: failed to enqueue in-app banner', { userId, code: error.code })
  }
}

// Helper: clear banners for this user (best-effort)
async function clearDunningBanners(userId: string) {
  await supabase
    .from('notification_log')
    .update({ status: 'delivered', delivered_at: new Date().toISOString() })
    .eq('recipient', userId)
    .eq('channel', 'in_app')
    .eq('reminder_rule_id', 'stripe_dunning')
}

// Helper: call email function
async function sendEmail(to: string, subject: string, html: string, text?: string) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ to, subject, html, text }),
  })
  if (!res.ok) {
    const msg = await res.text()
    console.error('stripe-webhook: send-email failed', { status: res.status, msg })
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // Read raw body first for signature verification
    const rawBody = await req.text()
    const sigHeader = req.headers.get('stripe-signature') || req.headers.get('Stripe-Signature')

    if (SIGNING_SECRET) {
      if (!sigHeader) {
        return jsonResponse({ error: 'missing_signature' }, 400)
      }
      const ok = await verifyStripeSignature(rawBody, sigHeader, SIGNING_SECRET)
      if (!ok) {
        return jsonResponse({ error: 'invalid_signature' }, 400)
      }
    } else if (WEBHOOK_GATE) {
      const gate = req.headers.get('x-webhook-gate')
      if (gate !== WEBHOOK_GATE) {
        return jsonResponse({ error: 'forbidden' }, 403)
      }
    }

    // Parse after verification
    let event: any
    try {
      event = JSON.parse(rawBody)
    } catch {
      return jsonResponse({ error: 'invalid_json' }, 400)
    }
    const type = event?.type as string

    // Idempotency: insert event id, skip if already processed
    const eventId = event?.id as string | undefined
    if (eventId) {
      const { error: insErr } = await supabase
        .from('processed_webhooks')
        .insert({ event_id: eventId })
      if (insErr && insErr.code === '23505') {
        // duplicate primary key -> already processed
        return jsonResponse({ received: true, duplicate: true })
      }
    }

    // We expect our integration to include our user_id in subscription metadata or invoice lines metadata.
    // MVP: try invoice.customer and look up mapping via user_subscriptions by stripe_customer_id.
    const obj = event?.data?.object || {}

    // Resolve user_id by stripe customer id
    let userId: string | null = null
    const stripeCustomerId = obj?.customer as string | undefined
    if (stripeCustomerId) {
      const { data } = await supabase
        .from('user_subscriptions')
        .select('user_id')
        .eq('stripe_customer_id', stripeCustomerId)
        .maybeSingle()
      userId = (data?.user_id as string) || null
    }

    // Process events
    switch (type) {
      case 'invoice.payment_failed': {
        if (!userId) break
        await setSubscriptionStatus(userId, 'past_due')

        const email = await getUserEmail(userId)
        // Derive amount and retry date from invoice if available
        const amountCents = obj?.amount_due ?? obj?.amount_remaining ?? 0
        const currency = (obj?.currency || 'usd').toUpperCase()
        const nextAttemptTs = obj?.next_payment_attempt ? new Date(obj.next_payment_attempt * 1000) : null
        const retryDate = nextAttemptTs ? nextAttemptTs.toLocaleDateString('en-US') : 'soon'

        // Get Billing Portal link from app route (we will add a portal function and UI)
        const siteUrl = Deno.env.get('SITE_URL') || 'https://legacyguard.app'
        const billingUrl = `${siteUrl}/account/billing`

        // Compose email via local minimal template
        if (email) {
          const amountFmt = amountCents ? `${(amountCents / 100).toFixed(2)} ${currency}` : 'your subscription'
          const html = `<!doctype html><html><body>
            <p>Hi,</p>
            <p>We were unable to process your recent payment for ${amountFmt}. We will retry on ${retryDate}.</p>
            <p><a href="${billingUrl}">Open Billing Portal</a> to update your payment method.</p>
            <p style="font-size:12px;color:#64748b">© 2025 LegacyGuard</p>
          </body></html>`
          await sendEmail(email, 'Action Required: Payment Failed - LegacyGuard', html, `Payment failed. Retry on ${retryDate}. Update here: ${billingUrl}`)
        }

        // In-app banner
        await upsertDunningBanner(
          userId,
          'Payment issue',
          'We could not process your payment. Please open the Billing Portal to update your payment method.'
        )
        break
      }
      case 'invoice.payment_succeeded': {
        if (!userId) break
        // If previously past_due, set active and clear banners
        await setSubscriptionStatus(userId, 'active')
        await clearDunningBanners(userId)

        // Send recovery email
        const email = await getUserEmail(userId)
        const amountCents = obj?.amount_paid ?? obj?.amount_due ?? 0
        const currency = (obj?.currency || 'usd').toUpperCase()
        if (email) {
          const amountFmt = amountCents ? `${(amountCents / 100).toFixed(2)} ${currency}` : 'your subscription'
          const html = `<!doctype html><html><body>
            <p>Hi,</p>
            <p>Your payment of ${amountFmt} has been processed successfully and your subscription is active again.</p>
            <p style="font-size:12px;color:#64748b">© 2025 LegacyGuard</p>
          </body></html>`
          await sendEmail(email, 'Payment Confirmed - LegacyGuard', html, `Payment confirmed ${amountFmt}`)
        }
        break
      }
      default: {
        // Ignore other events for MVP
        break
      }
    }

    return jsonResponse({ received: true })
  } catch (e) {
    console.error('stripe-webhook error', { message: (e as Error).message })
    return jsonResponse({ error: 'internal_error' }, 500)
  }
})


import { serve } from 'std/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { insertErrorAndMaybeAlert } from '../_shared/observability.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
const stripe = new Stripe(STRIPE_SECRET_KEY ?? '', { apiVersion: '2023-10-16' })

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  if (!signature || !STRIPE_WEBHOOK_SECRET) {
    return new Response('Bad Request', { status: 400 })
  }

  try {
    const body = await req.text()
    const event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)

    // Minimal logging, no payload/PII
    console.log(`stripe-webhook event: ${event.type} ${event.id}`)

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as any)
        break
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as any)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as any)
        break
      case 'invoice.paid':
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as any)
        break
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as any)
        break
      default:
        // No-op for other events
        break
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err: any) {
    console.error('stripe-webhook error')
    try {
      await insertErrorAndMaybeAlert(supabaseAdmin, {
        error_type: 'billing',
        message: `webhook_failed: ${String(err?.message ?? err)}`,
        context: 'billing',
        http_status: 400,
        unhandled: true,
      })
    } catch {}
    return new Response(JSON.stringify({ error: 'Webhook Error' }), { status: 400 })
  }
})

async function handleCheckoutCompleted(session: any) {
  const userId: string | undefined = session?.metadata?.user_id
  const planFromMeta: string | undefined = session?.metadata?.plan
  const customerId: string | null = session?.customer ?? null
  const subscriptionId: string | null = session?.subscription ?? null

  if (!userId || !subscriptionId) {
    // Missing metadata; nothing to do
    return
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const price = subscription.items?.data?.[0]?.price
  const plan = planFromMeta || mapPlanFromPriceId(price?.id)
  const interval = price?.recurring?.interval || 'month'
  const periodStart = new Date((subscription.current_period_start ?? 0) * 1000).toISOString()
  const periodEnd = new Date((subscription.current_period_end ?? 0) * 1000).toISOString()

  // Persist customer id on profiles (if present)
  if (customerId) {
    await supabaseAdmin.from('profiles').update({ stripe_customer_id: customerId }).eq('id', userId)
  }

  await supabaseAdmin
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

  // Reset usage for new billing period (idempotent upsert)
  await supabaseAdmin
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
  const userId: string | undefined = subscription?.metadata?.user_id
  if (!userId) return

  const price = subscription.items?.data?.[0]?.price
  const plan = subscription?.metadata?.plan || mapPlanFromPriceId(price?.id)
  const interval = price?.recurring?.interval || 'month'
  const periodEnd = new Date((subscription.current_period_end ?? 0) * 1000).toISOString()

  await supabaseAdmin
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
  const userId: string | undefined = subscription?.metadata?.user_id
  if (!userId) return

  await supabaseAdmin
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

  await supabaseAdmin
    .from('user_subscriptions')
    .update({ status: 'active', updated_at: new Date().toISOString() })
    .eq('stripe_subscription_id', subscriptionId)
}

async function handlePaymentFailed(invoice: any) {
  const subscriptionId = invoice?.subscription
  if (!subscriptionId) return

  await supabaseAdmin
    .from('user_subscriptions')
    .update({ status: 'past_due', updated_at: new Date().toISOString() })
    .eq('stripe_subscription_id', subscriptionId)
}

function mapPlanFromPriceId(priceId?: string | null): 'free' | 'essential' | 'family' | 'premium' {
  // Fallback mapping when metadata.plan is not set
  const map: Record<string, 'essential' | 'family' | 'premium'> = {}
  // Optionally support env-based mapping: STRIPE_PRICE_PREMIUM_EUR => 'premium'
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
