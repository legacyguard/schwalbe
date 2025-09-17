
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface FamilyShieldActivationRequest {
  user_id: string
  guardian_id: string
  activation_reason: 'manual' | 'inactivity' | 'health_check' | 'emergency'
  personality_mode?: 'empathetic' | 'pragmatic' | 'adaptive'
  custom_message?: string
}

interface GuardianPermissions {
  can_access_health_docs: boolean
  can_access_financial_docs: boolean
  is_child_guardian: boolean
  is_will_executor: boolean
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      user_id, 
      guardian_id, 
      activation_reason, 
      personality_mode = 'adaptive',
      custom_message 
    }: FamilyShieldActivationRequest = await req.json()

    if (!user_id || !guardian_id || !activation_reason) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
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

    // 1. Validate user and guardian exist
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('id, full_name, email')
      .eq('id', user_id)
      .single()

    if (userError || !userData) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { data: guardianData, error: guardianError } = await supabaseClient
      .from('guardians')
      .select('*')
      .eq('id', guardian_id)
      .eq('user_id', user_id)
      .single()

    if (guardianError || !guardianData) {
      return new Response(
        JSON.stringify({ error: 'Guardian not found or not authorized' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 2. Generate secure emergency access token
    const token = crypto.randomUUID() + '-' + Date.now().toString(36)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Token expires in 30 days for emergency access
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    // 3. Create guardian permissions based on their role
    const permissions: GuardianPermissions = {
      can_access_health_docs: guardianData.can_access_health_docs || false,
      can_access_financial_docs: guardianData.can_access_financial_docs || false,
      is_child_guardian: guardianData.is_child_guardian || false,
      is_will_executor: guardianData.is_will_executor || false
    }

    // 4. Create emergency access token
    const { data: tokenData, error: tokenError } = await supabaseClient
      .from('emergency_access_tokens')
      .insert({
        user_id,
        guardian_id,
        token,
        verification_code,
        expires_at: expiresAt.toISOString(),
        activation_date: new Date().toISOString(),
        activation_reason,
        permissions,
        requires_verification: true,
        is_active: true,
        metadata: {
          personality_mode,
          custom_message,
          ip_address: req.headers.get('x-forwarded-for') || 'unknown'
        }
      })
      .select()
      .single()

    if (tokenError) {
      console.error('Token creation error:', tokenError)
      return new Response(
        JSON.stringify({ error: 'Failed to create access token' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 5. Log the activation for audit trail
    await supabaseClient.from('emergency_access_logs').insert({
      token_id: tokenData.id,
      user_id,
      guardian_id,
      access_type: 'family_shield_activation',
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
      metadata: {
        activation_reason,
        personality_mode,
        custom_message: !!custom_message
      }
    })

    // 6. Generate personality-aware emergency message
    const getEmergencyMessage = (mode: string, guardianName: string, userName: string) => {
      const templates = {
        empathetic: {
          subject: `💔 ${guardianName}, ${userName}'s Family Needs Your Loving Support`,
          message: `Dear ${guardianName},

I'm reaching out to you during what may be a very difficult time. ${userName} has designated you as a trusted guardian, and our Family Shield system has been activated.

This means ${userName} may need help, and your caring support could make all the difference right now. 

You've been granted secure access to important information that ${userName} prepared specifically for you. This includes guidance, contacts, and documents to help you support the family during this challenging time.

Your access link: ${Deno.env.get('SITE_URL')}/emergency-access/${token}
Verification code: ${verificationCode}

Please know that ${userName} chose you because they trust your loving heart. Take your time, and remember - you're not alone in this.

With love and support,
The LegacyGuard Family Shield System 💚`
        },
        pragmatic: {
          subject: `🚨 EMERGENCY ACTIVATION: Family Shield Access for ${guardianName}`,
          message: `Guardian ${guardianName},

Family Shield Protocol has been activated for ${userName}. You are required to take immediate action.

ACTIVATION REASON: ${activation_reason.toUpperCase()}
ACCESS EXPIRES: ${expiresAt.toLocaleDateString()}

Your secured access credentials:
- Access URL: ${Deno.env.get('SITE_URL')}/emergency-access/${token}  
- Verification Code: ${verificationCode}
- Permission Level: ${Object.entries(permissions).filter(([_, v]) => v).map(([k, _]) => k).join(', ')}

This system contains:
- Emergency contact directory
- Critical document access  
- Family guidance manual
- Step-by-step protocols

Time-sensitive response required. All access is monitored and logged for security.

LegacyGuard Emergency System`
        },
        adaptive: {
          subject: `⚠️ Family Shield Activated: ${guardianName}, Your Help is Needed`,
          message: `Hi ${guardianName},

I hope this message finds you well. I'm writing because ${userName} has activated their Family Shield emergency system, and you've been designated as a trusted guardian.

This activation means ${userName} may need support, and they've prepared important information specifically for you to help during this time.

You now have secure access to:
• Emergency contacts and guidance
• Important documents ${userName} wanted you to have
• A detailed family manual with step-by-step instructions
• All the resources you need to help coordinate support

Access your guardian portal here:
${Deno.env.get('SITE_URL')}/emergency-access/${token}

Use verification code: ${verificationCode}

${userName} chose you because they trust you completely. Take things one step at a time, and don't hesitate to reach out to the other contacts for help.

Thank you for being such an important part of ${userName}'s support network.

Warm regards,
LegacyGuard Family Shield System`
        }
      }

      return templates[mode as keyof typeof templates] || templates.adaptive
    }

    const message = getEmergencyMessage(personality_mode, guardianData.full_name, userData.full_name)

    // 7. Send notification to guardian (this would typically be sent via email service)
    const { error: notificationError } = await supabaseClient
      .from('guardian_notifications')
      .insert({
        user_id,
        guardian_id,
        notification_type: 'family_shield_activation',
        title: message.subject,
        message: message.message,
        priority: activation_reason === 'emergency' ? 'urgent' : 'high',
        delivery_method: 'email',
        personality_mode,
        metadata: {
          token_id: tokenData.id,
          activation_reason,
          verification_code: verificationCode,
          access_url: `${Deno.env.get('SITE_URL')}/emergency-access/${token}`
        }
      })

    if (notificationError) {
      console.error('Notification creation error:', notificationError)
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        data: {
          token_id: tokenData.id,
          access_token: token,
          verification_code: verificationCode,
          expires_at: expiresAt.toISOString(),
          guardian_name: guardianData.full_name,
          guardian_email: guardianData.email,
          permissions,
          message: custom_message || `Family Shield activated for ${guardianData.full_name}`
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Family Shield activation error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})