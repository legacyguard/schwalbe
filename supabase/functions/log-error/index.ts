// Minimal log-error function that writes to error_logs and sends rate-limited alert emails on critical severity
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { 
  insertErrorAndMaybeAlert,
  determineSeverity,
  BASELINE_CONFIG,
  type LogContext,
  type Severity,
} from '../_shared/observability.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LogErrorRequest {
  error_type: string
  message: string
  stack?: string
  context?: LogContext
  http_status?: number
  url?: string
  user_agent?: string
  session_id?: string
  unhandled?: boolean
  severity?: Severity
  user_id?: string | null
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Basic auth presence check (do not leak details)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    const body: LogErrorRequest = await req.json()

    if (!body || !body.error_type || !body.message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: error_type, message' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const result = await insertErrorAndMaybeAlert(supabaseAdmin, body)

    return new Response(
      JSON.stringify({
        success: true,
        severity: result.severity,
        alerted: result.alerted,
        environment: BASELINE_CONFIG.environment,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('log-error exception:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})