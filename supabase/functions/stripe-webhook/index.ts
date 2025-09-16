
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
