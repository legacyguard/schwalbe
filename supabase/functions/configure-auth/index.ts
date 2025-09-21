import { serve } from 'std/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return json({ error: 'missing_supabase_admin_env' }, 500)
    }

    // OAuth provider secrets are expected via env; do not log them
    const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')
    const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')

    const APPLE_CLIENT_ID = Deno.env.get('APPLE_CLIENT_ID') // Services ID
    const APPLE_TEAM_ID = Deno.env.get('APPLE_TEAM_ID')
    const APPLE_KEY_ID = Deno.env.get('APPLE_KEY_ID')
    const APPLE_PRIVATE_KEY = Deno.env.get('APPLE_PRIVATE_KEY')

    const SITE_URL = Deno.env.get('SITE_URL') || 'https://legacyguard.cz'

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Build settings payload; only include providers that have credentials
    const external: Record<string, unknown> = {}

    if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
      external['google'] = {
        enabled: true,
        client_id: GOOGLE_CLIENT_ID,
        secret: GOOGLE_CLIENT_SECRET,
      }
    }

    if (APPLE_CLIENT_ID && APPLE_TEAM_ID && APPLE_KEY_ID && APPLE_PRIVATE_KEY) {
      external['apple'] = {
        enabled: true,
        client_id: APPLE_CLIENT_ID,
        team_id: APPLE_TEAM_ID,
        key_id: APPLE_KEY_ID,
        private_key: APPLE_PRIVATE_KEY,
      }
    }

    if (Object.keys(external).length === 0) {
      return json({ error: 'no_providers_configured', hint: 'Set GOOGLE_* or APPLE_* envs and re-run' }, 400)
    }

    // Update auth settings via admin API
    const { error } = await supabase.auth.admin.updateSettings({
      external: external as any,
      site_url: SITE_URL,
    } as any)

    if (error) {
      return json({ error: 'update_failed', message: error.message }, 500)
    }

    return json({ ok: true, providers: Object.keys(external), site_url: SITE_URL })
  } catch (e) {
    return json({ error: 'unexpected_error', message: String((e as any)?.message || e) }, 500)
  }
})
