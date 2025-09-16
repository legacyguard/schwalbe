import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Simple rate-limit: 1 export per 15 minutes per user
const EXPORT_COOLDOWN_MINUTES = parseInt(Deno.env.get('EXPORT_COOLDOWN_MINUTES') ?? '15', 10)
// Signed URL TTL for emailed exports (default 24h)
const EXPORT_SIGNED_URL_TTL_SECONDS = parseInt(Deno.env.get('EXPORT_SIGNED_URL_TTL_SECONDS') ?? '86400', 10)

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
      }
    })
  }

  try {
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.get('Authorization') || '' } }
    })
    const { data: authData } = await userClient.auth.getUser()
    const userId = authData.user?.id
    if (!userId) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Parse optional body for delivery preferences
    let delivery: 'email' | 'inline' | undefined
    try {
      const body = await req.json()
      if (body && (body.delivery === 'email' || body.delivery === 'inline')) {
        delivery = body.delivery
      }
    } catch (_) {
      // ignore - allow GET/POST without body
    }

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
      return new Response(
        JSON.stringify({ error: 'rate_limited', retry_after_minutes: EXPORT_COOLDOWN_MINUTES }),
        { status: 429, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      )
    }

    // Insert request log (best effort)
    try {
      await admin
        .from('export_requests')
        .insert({ user_id: userId, requested_at: new Date().toISOString(), status: 'started' })
    } catch (_) {
      // ignore
    }

    // Pull key entities (redact sensitive fields where appropriate)
    const [profiles, assets, documents, reminders, subscriptions] = await Promise.all([
      admin
        .from('profiles')
        .select('id, created_at, updated_at, full_name, email, company_name, vat_id, billing_address')
        .eq('id', userId)
        .maybeSingle(),
      admin.from('assets').select('*').eq('user_id', userId),
      admin
        .from('documents')
        .select(
          'id, user_id, file_name, file_type, file_size, category, title, description, tags, created_at, updated_at'
        )
        .eq('user_id', userId),
      admin.from('reminder_rule').select('*').eq('user_id', userId),
      admin.from('user_subscriptions').select('*').eq('user_id', userId)
    ])

    // Build bundle
    const bundle = {
      meta: {
        generated_at: new Date().toISOString(),
        version: 1,
        user_id: userId
      },
      profile: profiles.data || null,
      assets: assets.data || [],
      documents: documents.data || [],
      reminders: reminders.data || [],
      subscriptions: subscriptions.data || []
    }

    // If delivery=email, store in storage, create signed URL, and send via send-email function
    if (delivery === 'email') {
      const json = JSON.stringify(bundle, null, 2)
      const fileName = `export-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
      const filePath = `${userId}/exports/${fileName}`

      // Upload to existing private bucket (user_documents) under user's folder
      const uploadRes = await admin.storage
        .from('user_documents')
        .upload(filePath, new Blob([json], { type: 'application/json' }), {
          contentType: 'application/json',
          upsert: true
        })

      if (uploadRes.error) {
        // Mark as failed best-effort
        try {
          await admin
            .from('export_requests')
            .update({ status: 'failed', error: 'upload_failed', completed_at: new Date().toISOString() })
            .eq('user_id', userId)
            .order('requested_at', { ascending: false })
            .limit(1)
        } catch (_) {}
        return new Response(JSON.stringify({ error: 'upload_failed' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        })
      }

      const { data: signed, error: signErr } = await admin.storage
        .from('user_documents')
        .createSignedUrl(filePath, EXPORT_SIGNED_URL_TTL_SECONDS)

      if (signErr || !signed?.signedUrl) {
        try {
          await admin
            .from('export_requests')
            .update({ status: 'failed', error: 'sign_url_failed', completed_at: new Date().toISOString() })
            .eq('user_id', userId)
            .order('requested_at', { ascending: false })
            .limit(1)
        } catch (_) {}
        return new Response(JSON.stringify({ error: 'sign_url_failed' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        })
      }

      const toAddress = authData.user?.email || profiles.data?.email
      if (!toAddress) {
        return new Response(JSON.stringify({ error: 'no_email_on_account' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        })
      }

      const subject = 'Your LegacyGuard data export link'
      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color:#0f172a;">
          <h2 style="margin:0 0 12px;">Your data export is ready</h2>
          <p>You can download your data export using the link below. The link expires in ${Math.floor(
            EXPORT_SIGNED_URL_TTL_SECONDS / 3600
          )} hour(s).</p>
          <p style="margin:20px 0;"><a href="${signed.signedUrl}" style="display:inline-block;padding:12px 18px;background:#0ea5e9;color:#fff;text-decoration:none;border-radius:6px;">Download export</a></p>
          <p style="font-size:12px;color:#64748b">If the button doesn't work, copy and paste this URL into your browser:<br/><span style="word-break:break-all;">${signed.signedUrl}</span></p>
        </div>
      `
      const text = `Your data export is ready. Download link (expires in ${Math.floor(
        EXPORT_SIGNED_URL_TTL_SECONDS / 3600
      )} hour(s)): ${signed.signedUrl}`

      const emailResp = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({ to: toAddress, subject, html, text })
      })

      if (!emailResp.ok) {
        try {
          await admin
            .from('export_requests')
            .update({ status: 'failed', error: 'email_send_failed', completed_at: new Date().toISOString() })
            .eq('user_id', userId)
            .order('requested_at', { ascending: false })
            .limit(1)
        } catch (_) {}
        return new Response(JSON.stringify({ error: 'email_send_failed' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        })
      }

      // Update request log (best effort)
      try {
        await admin
          .from('export_requests')
          .update({ status: 'emailed', completed_at: new Date().toISOString(), delivery: 'email', object_path: filePath })
          .eq('user_id', userId)
          .order('requested_at', { ascending: false })
          .limit(1)
      } catch (_) {}

      return new Response(
        JSON.stringify({ success: true, delivery: 'email', expires_in_seconds: EXPORT_SIGNED_URL_TTL_SECONDS }),
        { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      )
    }

    // Default: inline JSON response
    try {
      await admin
        .from('export_requests')
        .update({ status: 'completed', completed_at: new Date().toISOString(), delivery: 'inline' })
        .eq('user_id', userId)
        .order('requested_at', { ascending: false })
        .limit(1)
    } catch (_) {}

    return new Response(JSON.stringify({ success: true, bundle }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  } catch (_e) {
    return new Response(JSON.stringify({ error: 'internal_error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
})
