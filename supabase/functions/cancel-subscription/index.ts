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
      // Email confirmation
      const { data: prof } = await supabase.from('profiles').select('email, full_name').eq('id', userId).maybeSingle()
      const email = (prof as any)?.email as string | undefined
      const fullName = (prof as any)?.full_name as string | undefined
      if (email) {
        const html = `<!doctype html><html><body>
          <p>Hi ${fullName ?? ''},</p>
          <p>Your subscription will remain active until the end of your current billing period on <strong>${new Date(currentPeriodEndISO).toLocaleDateString('en-US')}</strong>. You may restart at any time.</p>
          <p style="font-size:12px;color:#64748b">© 2025 LegacyGuard</p>
        </body></html>`
        await sendEmail(email, 'Your subscription will end at period end', html, 'Your subscription will end at period end.')
      }
      return json({ ok: true, mode: 'end_of_period' })
    }

    // Immediate cancellation
    await stripe.subscriptions.cancel(subscriptionId)
    await supabase
      .from('user_subscriptions')
      .update({ plan: 'free', status: 'cancelled', stripe_subscription_id: null, updated_at: new Date().toISOString(), expires_at: new Date().toISOString(), current_period_end: new Date().toISOString() })
      .eq('stripe_subscription_id', subscriptionId)

    // Email confirmation
    const { data: prof2 } = await supabase.from('profiles').select('email, full_name').eq('id', userId).maybeSingle()
    const email2 = (prof2 as any)?.email as string | undefined
    const fullName2 = (prof2 as any)?.full_name as string | undefined
    if (email2) {
      const html2 = `<!doctype html><html><body>
        <p>Hi ${fullName2 ?? ''},</p>
        <p>Your subscription has been cancelled immediately. You no longer have access to paid features. You may subscribe again at any time.</p>
        <p style=\"font-size:12px;color:#64748b\">© 2025 LegacyGuard</p>
      </body></html>`
      await sendEmail(email2, 'Your subscription has been cancelled', html2, 'Your subscription has been cancelled.')
    }

    return json({ ok: true, mode: 'immediate' })
  } catch (e) {
    console.error('cancel-subscription error', e)
    return json({ error: 'internal_error' }, 500)
  }
})
