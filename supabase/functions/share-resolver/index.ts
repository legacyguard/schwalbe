import { serve } from 'std/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

interface VerifyShareRequest {
  shareId: string
  password?: string
}

interface ResourceContent {
  title?: string
  content?: string
  type?: string
  metadata?: Record<string, any>
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { shareId, password }: VerifyShareRequest = await req.json()

    if (!shareId) {
      return new Response(JSON.stringify({ error: 'share_id_required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Extract IP from headers (Supabase Edge Functions provide this)
    const forwardedFor = req.headers.get('x-forwarded-for')
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : null
    const userAgent = req.headers.get('user-agent')

    // Verify share access via RPC
    const { data: verifyResult, error: verifyError } = await supabase.rpc('verify_share_access', {
      p_share_id: shareId,
      p_password: password || null,
      p_user_agent: userAgent || null,
      p_ip: ip
    })

    if (verifyError) {
      console.error('share-resolver verify_share_access error:', verifyError)
      return new Response(JSON.stringify({ error: 'verification_failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const result = Array.isArray(verifyResult) ? verifyResult[0] : verifyResult

    // If verification failed, return status without content
    if (result.status !== 'ok') {
      return new Response(JSON.stringify({
        status: result.status,
        reason: result.reason,
        expiresAt: result.expires_at,
        hasPassword: result.has_password
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Verification succeeded - fetch the actual resource content
    let resourceContent: ResourceContent = {}

    try {
      if (result.resource_type === 'document') {
        const { data: docData } = await supabase
          .from('documents')
          .select('title, content_type, created_at, updated_at')
          .eq('id', result.resource_id)
          .single()
        
        if (docData) {
          resourceContent = {
            title: docData.title,
            type: docData.content_type,
            metadata: {
              created_at: docData.created_at,
              updated_at: docData.updated_at
            }
          }
        }
      } else if (result.resource_type === 'will') {
        const { data: willData } = await supabase
          .from('wills')
          .select('title, jurisdiction, form_type, created_at, updated_at')
          .eq('id', result.resource_id)
          .single()
        
        if (willData) {
          resourceContent = {
            title: willData.title,
            type: 'will',
            metadata: {
              jurisdiction: willData.jurisdiction,
              form_type: willData.form_type,
              created_at: willData.created_at,
              updated_at: willData.updated_at
            }
          }
        }
      }
      // Add more resource types as needed (vault, family)
    } catch (resourceError) {
      console.error('share-resolver resource fetch error:', resourceError)
      // Continue without content - access was granted but resource might be missing
    }

    return new Response(JSON.stringify({
      status: result.status,
      resourceType: result.resource_type,
      resourceId: result.resource_id,
      permissions: result.permissions,
      expiresAt: result.expires_at,
      content: resourceContent
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('share-resolver error:', error)
    return new Response(JSON.stringify({ error: 'internal_error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})