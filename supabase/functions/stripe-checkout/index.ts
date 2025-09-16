import { serve } from 'std/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { insertErrorAndMaybeAlert } from '../_shared/observability.ts'

// Env
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase admin env vars')
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
const stripe = new Stripe(STRIPE_SECRET_KEY ?? '', { apiVersion: '2023-10-16' })

// Resolve plan -> price ID using env, per currency (CZK/EUR)
function resolvePriceId(plan: string, currency: string): string | null {
  const key = `${plan.toUpperCase()}_${currency.toUpperCase()}` // e.g., PREMIUM_EUR
  const envKey = `STRIPE_PRICE_${key}`
  return Deno.env.get(envKey) ?? null
}

function getOrigin(req: Request): string | null {
  return req.headers.get('origin') || req.headers.get('referer') || null
}

function inferCurrencyFromOrigin(origin: string | null): 'CZK' | 'EUR' {
  const o = origin ?? ''
  if (o.includes('.cz')) return 'CZK'
  if (o.includes('.sk')) return 'EUR'
  // Default MVP: EUR
  return 'EUR'
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { ...corsHeaders } })
  }

  try {
    if (!STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret not configured')
    }

    const { plan, priceId: priceIdInput, userId, successUrl, cancelUrl } = await req.json()

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing userId' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
    }

    // Determine currency from origin
    const origin = getOrigin(req)
    const currency = inferCurrencyFromOrigin(origin)

    // Resolve priceId from plan + currency if not provided
    const priceId = (priceIdInput as string | undefined) ?? resolvePriceId((plan as string) || 'premium', currency)
    if (!priceId) {
      return new Response(JSON.stringify({ error: 'Price not configured for requested plan/currency' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
    }

    // Ensure we have a customer id (store on profiles, fallback to user_subscriptions)
    let stripeCustomerId: string | null = null
    {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('stripe_customer_id, email')
        .eq('id', userId)
        .maybeSingle()

      stripeCustomerId = (profile as any)?.stripe_customer_id ?? null

      if (!stripeCustomerId) {
        // Fetch auth user email via admin API for customer creation
        const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId)
        const email = (user?.user?.email as string | undefined) ?? undefined

        const customer = await stripe.customers.create({
          email,
          metadata: { supabase_user_id: userId },
        })
        stripeCustomerId = customer.id

        // Persist on profiles and ensure a subscription row exists
        await supabaseAdmin.from('profiles').update({ stripe_customer_id: stripeCustomerId }).eq('id', userId)
        await supabaseAdmin
          .from('user_subscriptions')
          .upsert({ user_id: userId, stripe_customer_id: stripeCustomerId }, { onConflict: 'user_id' })
      }
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl || `${origin ?? ''}/?checkout=success`,
      cancel_url: cancelUrl || `${origin ?? ''}/?checkout=cancel`,
      metadata: {
        user_id: userId,
        plan: (plan as string) || 'premium',
      },
      subscription_data: {
        metadata: {
          user_id: userId,
          plan: (plan as string) || 'premium',
        },
      },
      billing_address_collection: 'auto',
      allow_promotion_codes: true,
      locale: 'auto',
    })

    return new Response(JSON.stringify({ sessionId: session.id, url: session.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (err: any) {
    // Minimal logging, no PII, alert on critical billing errors
    console.error('stripe-checkout error')
    try {
      await insertErrorAndMaybeAlert(supabaseAdmin, {
        error_type: 'billing',
        message: `checkout_failed: ${String(err?.message ?? err)}`,
        context: 'billing',
        http_status: 500,
        unhandled: true,
      })
    } catch {}

    return new Response(JSON.stringify({ error: 'Unable to create checkout session' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})