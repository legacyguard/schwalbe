import { serve } from 'std/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const TRIAL_NOTICE_DAYS = parseInt(Deno.env.get('BILLING_TRIAL_NOTICE_DAYS') ?? '3', 10)

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

function daysUntil(iso?: string | null): number | null {
  if (!iso) return null
  const end = new Date(iso)
  const now = new Date()
  const diffMs = end.getTime() - now.getTime()
  const d = Math.ceil(diffMs / (1000*60*60*24))
  return d >= 0 ? d : 0
}

async function sendEmail(to: string, subject: string, html: string, text?: string) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, html, text }),
  })
  if (!res.ok) {
    console.error('notify-trial-ending email_failed', res.status)
  }
}

function localizeTrialEmail(locale: 'en'|'cs'|'sk', name: string | undefined, daysLeft: number) {
  const subj = locale === 'cs'
    ? `Zkušební období končí za ${daysLeft} den${daysLeft===1?'':'í'}`
    : locale === 'sk'
      ? `Skúšobné obdobie končí o ${daysLeft} deň${daysLeft===1?'':'ov'}`
      : `Your trial ends in ${daysLeft} day${daysLeft===1?'':'s'}`
  const line = locale === 'cs'
    ? `Vaše zkušební období končí za ${daysLeft} dní. Chcete-li zachovat přístup k prémiovým funkcím, přidejte platební metodu.`
    : locale === 'sk'
      ? `Vaše skúšobné obdobie končí o ${daysLeft} dní. Ak chcete zachovať prístup k prémiovým funkciám, pridajte platobnú metódu.`
      : `Your trial ends in ${daysLeft} days. To keep access to premium features, add a payment method.`
  const billing = 'https://legacyguard.app/account/billing'
  const html = `<!doctype html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#0f172a;max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:#f59e0b;color:white;padding:16px;border-radius:8px 8px 0 0;">
      <h1 style="margin:0;font-size:20px;">${locale==='cs'?'Blíží se konec zkušebního období': locale==='sk'?'Blíži sa koniec skúšobného obdobia':'Trial ending soon'}</h1>
    </div>
    <div style="border:1px solid #e2e8f0;border-top:none;padding:16px;border-radius:0 0 8px 8px;background:#fff;">
      <p>${locale==='cs'?'Dobrý den':'Hi'} ${name ?? ''},</p>
      <p>${line}</p>
      <p><a href="${billing}" style="color:#0ea5e9;">${locale==='cs'?'Otevřít fakturaci': locale==='sk'?'Otvoriť fakturáciu':'Open Billing'}</a></p>
      <p style="font-size:12px;color:#64748b;">© 2025 LegacyGuard</p>
    </div>
  </body></html>`
  const text = line + `\n\n${billing}`
  return { subject: subj, html, text }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok')
  try {
    // Find trialing subscriptions
    const { data: subs, error } = await supabase
      .from('user_subscriptions')
      .select('user_id, current_period_end, status')
      .eq('status', 'trialing')
    if (error) throw error

    let sent = 0
    for (const s of (subs ?? []) as any[]) {
      const userId = s.user_id as string
      const endISO = s.current_period_end as string | null
      const d = daysUntil(endISO)
      if (d === null) continue
      // Only send on the exact configured day window
      if (d !== TRIAL_NOTICE_DAYS) continue

      // De-dupe with notification_log
      const { data: existing } = await supabase
        .from('notification_log')
        .select('id')
        .eq('recipient', userId)
        .eq('channel', 'email')
        .eq('reminder_rule_id', 'trial_ending_notice')
        .gte('sent_at', new Date(Date.now() - 7*24*60*60*1000).toISOString())
        .limit(1)
      if (existing && existing.length > 0) continue

      // Resolve profile and locale
      const { data: prof } = await supabase
        .from('profiles')
        .select('email, full_name, billing_address')
        .eq('id', userId)
        .maybeSingle()
      const to = (prof as any)?.email as string | undefined
      if (!to) continue
      const fullName = (prof as any)?.full_name as string | undefined
      const country = (((prof as any)?.billing_address)?.country as string | undefined)?.toUpperCase() || ''
      const locale: 'en'|'cs'|'sk' = country === 'CZ' ? 'cs' : country === 'SK' ? 'sk' : 'en'

      const { subject, html, text } = localizeTrialEmail(locale, fullName, d)
      await sendEmail(to, subject, html, text)

      await supabase.from('notification_log').insert({
        reminder_rule_id: 'trial_ending_notice',
        channel: 'email',
        recipient: userId,
        status: 'sent',
        sent_at: new Date().toISOString(),
        provider_response: { subject },
      })
      sent++
    }

    return new Response(JSON.stringify({ ok: true, sent }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (e) {
    console.error('notify-trial-ending error', e)
    return new Response(JSON.stringify({ error: 'internal_error' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
})
