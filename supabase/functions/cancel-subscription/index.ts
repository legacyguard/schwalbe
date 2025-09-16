import { serve } from 'std/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Env
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!

// Policy: immediate vs end_of_period (default end_of_period)
const CANCELLATION_POLICY = (Deno.env.get('BILLING_CANCELLATION_POLICY') ?? 'end_of_period').toLowerCase() === 'immediate' ? 'immediate' : 'end_of_period'

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function sendEmail(to: string, subject: string, html: string, text?: string) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, html, text }),
  })
  if (!res.ok) {
    // minimal log, no PII
    console.error('cancel-subscription email_failed', res.status)
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok')
  try {
    const auth = req.headers.get('Authorization')
    if (!auth) return json({ error: 'unauthorized' }, 401)

    const { userId, cancelAtPeriodEnd } = await req.json()
    if (!userId) return json({ error: 'missing_user' }, 400)

    // Lookup subscription id for user
    const { data: row, error: qErr } = await supabase
      .from('user_subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', userId)
      .maybeSingle()
    if (qErr) return json({ error: 'query_failed' }, 500)
    const subscriptionId = (row?.stripe_subscription_id as string | null) ?? null
    if (!subscriptionId) return json({ error: 'no_active_subscription' }, 400)

    // Decide policy based on global policy + optional UI override flag (only allow override towards end_of_period)
    const useEndOfPeriod = (CANCELLATION_POLICY === 'end_of_period') || (cancelAtPeriodEnd === true)

    if (useEndOfPeriod) {
      // Set cancel_at_period_end = true on Stripe
      const sub = await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true } as any)
      const currentPeriodEndISO = new Date((sub.current_period_end ?? 0) * 1000).toISOString()
      // Update local row (keep active until period end)
      await supabase
        .from('user_subscriptions')
        .update({ status: 'active', current_period_end: currentPeriodEndISO, updated_at: new Date().toISOString() })
        .eq('stripe_subscription_id', subscriptionId)
      // Email confirmation (localized)
      const { data: prof } = await supabase.from('profiles').select('email, full_name, billing_address').eq('id', userId).maybeSingle()
      const email = (prof as any)?.email as string | undefined
      const fullName = (prof as any)?.full_name as string | undefined
      const country = (((prof as any)?.billing_address)?.country as string | undefined)?.toUpperCase() || ''
      const locale: 'en'|'cs'|'sk' = country === 'CZ' ? 'cs' : country === 'SK' ? 'sk' : 'en'
      if (email) {
        const subj = locale === 'cs' ? 'Zrušení na konci období' : locale === 'sk' ? 'Zrušenie na konci obdobia' : 'Your subscription will end at period end'
        const line = locale === 'cs'
          ? `Vaše předplatné zůstane aktivní do konce aktuálního období (${new Date(currentPeriodEndISO).toLocaleDateString('en-US')}).`
          : locale === 'sk'
            ? `Vaše predplatné zostane aktívne do konca aktuálneho obdobia (${new Date(currentPeriodEndISO).toLocaleDateString('en-US')}).`
            : `Your subscription will remain active until the end of your current billing period on ${new Date(currentPeriodEndISO).toLocaleDateString('en-US')}.`
        const html = `<!doctype html><html><body>
          <p>${locale==='cs'?'Dobrý den':'Hi'} ${fullName ?? ''},</p>
          <p>${line}</p>
          <p style=\"font-size:12px;color:#64748b\">© 2025 LegacyGuard</p>
        </body></html>`
        await sendEmail(email, subj, html, line)
      }
      return json({ ok: true, mode: 'end_of_period' })
    }

    // Immediate cancellation
    await stripe.subscriptions.cancel(subscriptionId)
    await supabase
      .from('user_subscriptions')
      .update({ plan: 'free', status: 'cancelled', stripe_subscription_id: null, updated_at: new Date().toISOString(), expires_at: new Date().toISOString(), current_period_end: new Date().toISOString() })
      .eq('stripe_subscription_id', subscriptionId)

    // Email confirmation (localized)
    const { data: prof2 } = await supabase.from('profiles').select('email, full_name, billing_address').eq('id', userId).maybeSingle()
    const email2 = (prof2 as any)?.email as string | undefined
    const fullName2 = (prof2 as any)?.full_name as string | undefined
    const country2 = (((prof2 as any)?.billing_address)?.country as string | undefined)?.toUpperCase() || ''
    const locale2: 'en'|'cs'|'sk' = country2 === 'CZ' ? 'cs' : country2 === 'SK' ? 'sk' : 'en'
    if (email2) {
      const subj2 = locale2 === 'cs' ? 'Předplatné bylo zrušeno' : locale2 === 'sk' ? 'Predplatné bolo zrušené' : 'Your subscription has been cancelled'
      const line2 = locale2 === 'cs'
        ? 'Vaše předplatné bylo okamžitě zrušeno. Přístup k placeným funkcím byl ukončen.'
        : locale2 === 'sk'
          ? 'Vaše predplatné bolo okamžite zrušené. Prístup k plateným funkciám bol ukončený.'
          : 'Your subscription has been cancelled immediately. You no longer have access to paid features.'
      const html2 = `<!doctype html><html><body>
        <p>${locale2==='cs'?'Dobrý den':'Hi'} ${fullName2 ?? ''},</p>
        <p>${line2}</p>
        <p style=\"font-size:12px;color:#64748b\">© 2025 LegacyGuard</p>
      </body></html>`
      await sendEmail(email2, subj2, html2, line2)
    }

    return json({ ok: true, mode: 'immediate' })
  } catch (e) {
    console.error('cancel-subscription error', e)
    return json({ error: 'internal_error' }, 500)
  }
})
