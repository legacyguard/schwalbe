import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') // not used
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// We will call Stripe API without official SDK to keep edge bundle small
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!

serve(async (req) => {
  try {
    // Create a client scoped to the caller so we can resolve the user
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY ?? '', {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    })

    const { data: auth } = await supabaseClient.auth.getUser()
    const userId = auth.user?.id || null
    if (!userId) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
    }

    // Use service role for DB lookup
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: sub } = await admin
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .maybeSingle()

    const customerId = (sub?.stripe_customer_id as string) || null
    if (!customerId) {
      return new Response(JSON.stringify({ error: 'No Stripe customer' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    const returnUrl = (Deno.env.get('SITE_URL') || 'https://legacyguard.app') + '/account/billing'

    const resp = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ customer: customerId, return_url: returnUrl }).toString(),
    })

    if (!resp.ok) {
      const msg = await resp.text()
      console.error('create-billing-portal-session: Stripe error', { status: resp.status, msg })
      return new Response(JSON.stringify({ error: 'stripe_error' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }

    const json = await resp.json()
    return new Response(JSON.stringify({ url: json.url }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (e) {
    console.error('create-billing-portal-session error', { message: (e as Error).message })
    return new Response(JSON.stringify({ error: 'internal_error' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
})