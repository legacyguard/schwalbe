
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface EmergencyAccessRequest {
  token: string
  verification_code?: string
}

interface GuardianPermissions {
  can_access_health_docs: boolean
  can_access_financial_docs: boolean
  is_child_guardian: boolean
  is_will_executor: boolean
}

interface EmergencyAccessData {
  user_name: string
  guardian_name: string
  guardian_permissions: GuardianPermissions
  activation_date: string
  expires_at: string
  survivor_manual: {
    html_content: string
    entries_count: number
    generated_at: string
  }
  documents: Array<{
    id: string
    title: string
    type: string
    category: string
    created_at: string
    encrypted_url?: string
  }>
  emergency_contacts: Array<{
    name: string
    relationship: string
    email: string
    phone?: string
    can_help_with: string[]
  }>
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { token, verification_code }: EmergencyAccessRequest = await req.json()

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
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
        activation_date,
        verification_code,
        requires_verification,
        permissions,
        users!user_id(id, full_name),
        guardians!guardian_id(id, full_name, email, phone, relationship)
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
    if (tokenData.requires_verification) {
      if (!verification_code) {
        return new Response(
          JSON.stringify({ 
            error: 'Verification code required',
            needs_verification: true 
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      if (verification_code !== tokenData.verification_code) {
        return new Response(
          JSON.stringify({ error: 'Invalid verification code' }),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

    // 4. Log access attempt for audit trail
    await supabaseClient.from('emergency_access_logs').insert({
      token_id: tokenData.id,
      user_id: tokenData.user_id,
      guardian_id: tokenData.guardian_id,
      access_type: 'token_verification',
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
      metadata: {
        verification_required: tokenData.requires_verification,
        verification_provided: !!verification_code
      }
    })

    const permissions = tokenData.permissions as GuardianPermissions

    // 5. Fetch survivor manual if guardian has access
    let survivorManual = null
    if (permissions.can_access_health_docs || permissions.is_will_executor) {
      const { data: manualData } = await supabaseClient
        .from('survivor_manuals')
        .select('html_content, entries_count, generated_at')
        .eq('user_id', tokenData.user_id)
        .order('generated_at', { ascending: false })
        .limit(1)
        .single()

      if (manualData) {
        survivorManual = {
          html_content: manualData.html_content,
          entries_count: manualData.entries_count,
          generated_at: manualData.generated_at
        }
      }
    }

    // 6. Fetch accessible documents based on permissions
    let documentsQuery = supabaseClient
      .from('documents')
      .select('id, title, file_type, category, created_at, encrypted_file_url')
      .eq('user_id', tokenData.user_id)

    // Apply category filters based on permissions
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

    if (allowedCategories.length > 0) {
      documentsQuery = documentsQuery.in('category', allowedCategories)
    }

    const { data: documents } = await documentsQuery

    // 7. Fetch emergency contacts
    const { data: contacts } = await supabaseClient
      .from('emergency_contacts')
      .select('name, relationship, email, phone, can_help_with')
      .eq('user_id', tokenData.user_id)
      .eq('is_active', true)

    // 8. Build response data
    const responseData: EmergencyAccessData = {
      user_name: tokenData.users.full_name,
      guardian_name: tokenData.guardians.full_name,
      guardian_permissions: permissions,
      activation_date: tokenData.activation_date,
      expires_at: tokenData.expires_at,
      survivor_manual: survivorManual || {
        html_content: '',
        entries_count: 0,
        generated_at: new Date().toISOString()
      },
      documents: (documents || []).map(doc => ({
        id: doc.id,
        title: doc.title,
        type: doc.file_type,
        category: doc.category,
        created_at: doc.created_at,
        encrypted_url: doc.encrypted_file_url
      })),
      emergency_contacts: (contacts || []).map(contact => ({
        name: contact.name,
        relationship: contact.relationship,
        email: contact.email,
        phone: contact.phone,
        can_help_with: contact.can_help_with || []
      }))
    }

    return new Response(
      JSON.stringify({ data: responseData }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Emergency access verification error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})