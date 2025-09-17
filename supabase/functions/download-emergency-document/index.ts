
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface DocumentAccessRequest {
  token: string
  document_id: string
  verification_code?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { token, document_id, verification_code }: DocumentAccessRequest = await req.json()

    if (!token || !document_id) {
      return new Response(
        JSON.stringify({ error: 'Token and document ID are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Validate emergency access token
    const { data: tokenData, error: tokenError } = await supabaseClient
      .from('emergency_access_tokens')
      .select(`
        id,
        user_id,
        guardian_id,
        expires_at,
        is_active,
        verification_code,
        requires_verification,
        permissions
      `)
      .eq('token', token)
      .eq('is_active', true)
      .single()

    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired access token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 2. Check if token has expired
    const now = new Date()
    const expiresAt = new Date(tokenData.expires_at)
    if (expiresAt < now) {
      return new Response(
        JSON.stringify({ error: 'Access token has expired' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 3. Verify additional verification code if required
    if (tokenData.requires_verification && tokenData.verification_code !== verification_code) {
      return new Response(
        JSON.stringify({ error: 'Invalid verification code' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 4. Get document information and verify access permissions
    const { data: document, error: docError } = await supabaseClient
      .from('documents')
      .select('id, title, category, file_type, encrypted_file_url, user_id')
      .eq('id', document_id)
      .eq('user_id', tokenData.user_id)
      .single()

    if (docError || !document) {
      return new Response(
        JSON.stringify({ error: 'Document not found or access denied' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 5. Check if guardian has permission to access this document category
    const permissions = tokenData.permissions as any
    const allowedCategories = []

    if (permissions.can_access_health_docs) {
      allowedCategories.push('health', 'medical', 'insurance')
    }
    if (permissions.can_access_financial_docs) {
      allowedCategories.push('financial', 'bank', 'investment', 'tax')
    }
    if (permissions.is_will_executor) {
      allowedCategories.push('legal', 'will', 'estate', 'property')
    }
    if (permissions.is_child_guardian) {
      allowedCategories.push('family', 'children', 'education')
    }

    if (!allowedCategories.includes(document.category)) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions to access this document category' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 6. Log document access for audit trail
    await supabaseClient.from('emergency_access_logs').insert({
      token_id: tokenData.id,
      user_id: tokenData.user_id,
      guardian_id: tokenData.guardian_id,
      access_type: 'document_download',
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
      metadata: {
        document_id: document.id,
        document_title: document.title,
        document_category: document.category,
        verification_required: tokenData.requires_verification,
        verification_provided: !!verification_code
      }
    })

    // 7. Generate signed URL for document download
    if (!document.encrypted_file_url) {
      return new Response(
        JSON.stringify({ error: 'Document file not available' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Extract file path from the encrypted_file_url
    const filePath = document.encrypted_file_url.split('/').pop()
    if (!filePath) {
      return new Response(
        JSON.stringify({ error: 'Invalid document file path' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Generate signed URL valid for 1 hour
    const { data: signedUrl, error: urlError } = await supabaseClient.storage
      .from('user_documents')
      .createSignedUrl(`${tokenData.user_id}/${filePath}`, 3600)

    if (urlError || !signedUrl) {
      console.error('Signed URL generation error:', urlError)
      return new Response(
        JSON.stringify({ error: 'Failed to generate download URL' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        data: {
          document_id: document.id,
          document_title: document.title,
          document_category: document.category,
          file_type: document.file_type,
          download_url: signedUrl.signedUrl,
          expires_in: 3600, // 1 hour in seconds
          access_logged: true
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Emergency document access error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})