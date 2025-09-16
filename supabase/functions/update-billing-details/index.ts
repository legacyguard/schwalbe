import { serve } from 'std/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Env
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })

function buildInvoiceFooter(locale: 'en'|'cs'|'sk'): string {
  const site = Deno.env.get('SITE_URL') || 'https://legacyguard.app'
  const company = 'LegacyGuard s.r.o.'
  const address = 'Prague, Czech Republic'
  const terms = `${site}/terms-of-service`
  const privacy = `${site}/privacy-policy`
  const base = `${company} • ${address}`
  if (locale === 'cs') {
    return `${base}\nObchodní podmínky: ${terms}\nZásady ochrany soukromí: ${privacy}`
  }
  if (locale === 'sk') {
    return `${base}\nObchodné podmienky: ${terms}\nZásady ochrany súkromia: ${privacy}`
  }
  return `${base}\nTerms: ${terms}\nPrivacy: ${privacy}`
}

serve(async (req) => {
  try {
    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } })
    const { data: auth } = await supabaseUser.auth.getUser()
    const userId = auth.user?.id
    if (!userId) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })

    const payload = await req.json()
    const { company_name, vat_id, billing_address } = payload || {}

    // Admin client
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Resolve or create Stripe customer
    let stripeCustomerId: string | null = null
    {
      const { data } = await admin.from('profiles').select('stripe_customer_id,email,full_name').eq('id', userId).maybeSingle()
      stripeCustomerId = (data as any)?.stripe_customer_id || null
      const email = (data as any)?.email as string | undefined
      const fullName = (data as any)?.full_name as string | undefined
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email,
          name: company_name || fullName,
          metadata: { supabase_user_id: userId },
        })
        stripeCustomerId = customer.id
        await admin.from('profiles').update({ stripe_customer_id: stripeCustomerId }).eq('id', userId)
        await admin.from('user_subscriptions').upsert({ user_id: userId, stripe_customer_id: stripeCustomerId }, { onConflict: 'user_id' })
      }
    }

    // Update Stripe customer address + invoice footer
    const country = (billing_address?.country as string | undefined)?.toUpperCase() || ''
    const locale: 'en'|'cs'|'sk' = country === 'CZ' ? 'cs' : country === 'SK' ? 'sk' : 'en'

    await stripe.customers.update(stripeCustomerId!, {
      name: company_name || undefined,
      address: {
        line1: billing_address?.line1 || undefined,
        line2: billing_address?.line2 || undefined,
        city: billing_address?.city || undefined,
        postal_code: billing_address?.postal_code || undefined,
        country: country || undefined,
      },
      invoice_settings: {
        footer: buildInvoiceFooter(locale),
      },
    } as any)

    // Create tax ID if provided (EU VAT/DIČ)
    if (typeof vat_id === 'string' && vat_id.trim().length > 0) {
      try {
        await stripe.customers.createTaxId(stripeCustomerId!, {
          type: 'eu_vat',
          value: vat_id.trim(),
        })
      } catch (_e) {
        // Ignore if already exists or invalid; user can correct later
      }
    }

    // Persist locally (no PII logs)
    await admin
      .from('profiles')
      .update({
        company_name: company_name ?? null,
        vat_id: vat_id ?? null,
        billing_address: billing_address ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (_e) {
    return new Response(JSON.stringify({ error: 'internal_error' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
})