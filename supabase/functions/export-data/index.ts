import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Simple rate-limit: 1 export per 15 minutes per user
const EXPORT_COOLDOWN_MINUTES = parseInt(Deno.env.get('EXPORT_COOLDOWN_MINUTES') ?? '15', 10)

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
    } })
  }

  try {
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: req.headers.get('Authorization') || '' } } })
    const { data: authData } = await userClient.auth.getUser()
    const userId = authData.user?.id
    if (!userId) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Rate limit by export_requests table (best effort; degrade gracefully if table not present)
    let rateLimited = false
    try {
      const sinceISO = new Date(Date.now() - EXPORT_COOLDOWN_MINUTES * 60_000).toISOString()
      const { count, error: rlErr } = await admin
        .from('export_requests')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('requested_at', sinceISO)
      if (!rlErr && (count || 0) > 0) {
        rateLimited = true
      }
    } catch (_) {
      // ignore
    }
    if (rateLimited) {
      return new Response(JSON.stringify({ error: 'rate_limited', retry_after_minutes: EXPORT_COOLDOWN_MINUTES }), { status: 429, headers: { 'Content-Type': 'application/json' } })
    }

    // Insert request log (best effort)
    try {
      await admin.from('export_requests').insert({ user_id: userId, requested_at: new Date().toISOString(), status: 'started' })
    } catch (_) {
      // ignore
    }

    // Pull key entities (redact sensitive fields where appropriate)
    const [profiles, assets, documents, reminders, subscriptions] = await Promise.all([
      admin.from('profiles').select('id, created_at, updated_at, full_name, email, company_name, vat_id, billing_address').eq('id', userId).maybeSingle(),
      admin.from('assets').select('*').eq('user_id', userId),
      admin.from('documents').select('id, user_id, file_name, file_type, file_size, category, title, description, tags, created_at, updated_at').eq('user_id', userId),
      admin.from('reminder_rule').select('*').eq('user_id', userId),
      admin.from('user_subscriptions').select('*').eq('user_id', userId),
    ])

    // Build bundle
    const bundle = {
      meta: {
        generated_at: new Date().toISOString(),
        version: 1,
        user_id: userId,
      },
      profile: profiles.data || null,
      assets: assets.data || [],
      documents: documents.data || [],
      reminders: reminders.data || [],
      subscriptions: subscriptions.data || [],
    }

// Update request log (best effort)
    try {
      await admin
        .from('export_requests')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('user_id', userId)
        .order('requested_at', { ascending: false })
        .limit(1)
    } catch (_) {
      // ignore
    }

    return new Response(JSON.stringify({ success: true, bundle }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (_e) {
    return new Response(JSON.stringify({ error: 'internal_error' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
})