
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GuardianActivationRequest {
  target_user_id: string;
  guardian_id: string;
  notes?: string;
  verification_method: 'guardian_portal' | 'email_link';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestBody: GuardianActivationRequest = await req.json();
    const { target_user_id, guardian_id, notes, verification_method } = requestBody;

    if (!target_user_id || !guardian_id) {
      return new Response(
        JSON.stringify({ error: 'target_user_id and guardian_id are required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log(`Guardian ${guardian_id} requesting activation for user ${target_user_id}`);

    // Verify guardian has permission to trigger emergency protocol
    const { data: guardian, error: guardianError } = await supabaseClient
      .from('guardians')
      .select('*')
      .eq('id', guardian_id)
      .eq('user_id', target_user_id)
      .eq('can_trigger_emergency', true)
      .eq('is_active', true)
      .single();

    if (guardianError || !guardian) {
      console.error('Guardian verification failed:', guardianError);
      return new Response(
        JSON.stringify({ error: 'Guardian not authorized for emergency activation' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        }
      );
    }

    // Get protocol settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('user_protocol_settings')
      .select('*')
      .eq('user_id', target_user_id)
      .eq('is_protocol_enabled', true)
      .single();

    if (settingsError || !settings) {
      console.error('Protocol settings not found or disabled:', settingsError);
      return new Response(
        JSON.stringify({ error: 'Family Shield Protocol not enabled for this user' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    // Create activation log entry
    const verificationToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Token expires in 7 days

    const { data: activationLog, error: logError } = await supabaseClient
      .from('emergency_activation_log')
      .insert({
        user_id: target_user_id,
        guardian_id: guardian_id,
        activation_type: 'manual_guardian',
        status: 'pending',
        verification_token: verificationToken,
        token_expires_at: expiresAt.toISOString(),
        guardian_email: guardian.email,
        guardian_name: guardian.name,
        notes: notes || `Emergency activation requested by ${guardian.name}`,
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        user_agent: req.headers.get('user-agent')
      })
      .select()
      .single();

    if (logError) {
      console.error('Error creating activation log:', logError);
      return new Response(
        JSON.stringify({ error: 'Failed to log activation request' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    // Check if we have enough guardian confirmations
    const { data: recentActivations, error: activationsError } = await supabaseClient
      .from('emergency_activation_log')
      .select('*')
      .eq('user_id', target_user_id)
      .eq('activation_type', 'manual_guardian')
      .eq('status', 'pending')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours

    if (activationsError) {
      console.error('Error checking recent activations:', activationsError);
    }

    const confirmedGuardians = new Set();
    if (recentActivations) {
      recentActivations.forEach(log => {
        if (log.guardian_id) {
          confirmedGuardians.add(log.guardian_id);
        }
      });
    }

    console.log(`Required confirmations: ${settings.required_guardians_for_activation}, Current: ${confirmedGuardians.size}`);

    let protocolActivated = false;

    // Check if we have enough confirmations to activate the protocol
    if (confirmedGuardians.size >= settings.required_guardians_for_activation) {
      console.log('Sufficient guardian confirmations received, activating protocol...');

      // Update protocol status to active
      const { error: protocolUpdateError } = await supabaseClient
        .from('user_protocol_settings')
        .update({
          protocol_status: 'active',
          last_activity_check: new Date().toISOString()
        })
        .eq('id', settings.id);

      if (protocolUpdateError) {
        console.error('Error activating protocol:', protocolUpdateError);
      } else {
        // Mark all pending activation logs as confirmed
        const { error: confirmError } = await supabaseClient
          .from('emergency_activation_log')
          .update({
            status: 'confirmed',
            confirmed_at: new Date().toISOString()
          })
          .eq('user_id', target_user_id)
          .eq('status', 'pending')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        if (confirmError) {
          console.error('Error confirming activation logs:', confirmError);
        }

        protocolActivated = true;

        // Notify all guardians that the protocol is now active
        await notifyGuardiansProtocolActive(supabaseClient, target_user_id, guardian.name);
      }
    }

    // Generate access tokens for guardians if protocol is active
    let accessTokens: any[] = [];
    if (protocolActivated) {
      accessTokens = await generateGuardianAccessTokens(supabaseClient, target_user_id);
    }

    return new Response(
      JSON.stringify({
        message: protocolActivated 
          ? 'Family Shield Protocol has been activated successfully'
          : 'Activation request recorded. Waiting for additional guardian confirmations.',
        protocol_activated: protocolActivated,
        confirmations_needed: Math.max(0, settings.required_guardians_for_activation - confirmedGuardians.size),
        current_confirmations: confirmedGuardians.size,
        required_confirmations: settings.required_guardians_for_activation,
        activation_log_id: activationLog.id,
        access_tokens: protocolActivated ? accessTokens : []
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in guardian activation:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function notifyGuardiansProtocolActive(supabaseClient: any, userId: string, triggeringGuardianName: string) {
  try {
    console.log(`Notifying all guardians that protocol is active for user ${userId}`);
    
    // Get all guardians
    const { data: guardians, error } = await supabaseClient
      .from('guardians')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('emergency_contact_priority', { ascending: true });

    if (error) {
      console.error('Error fetching guardians for notification:', error);
      return;
    }

    for (const guardian of guardians || []) {
      // TODO: Send notification email to each guardian
      console.log(`Would notify guardian ${guardian.id} that protocol is active`);
      
      /*
      await sendEmail({
        to: guardian.email,
        subject: 'Family Shield Protocol Activated',
        html: `
          <h2>Family Shield Protocol has been activated</h2>
          <p>Dear ${guardian.name},</p>
          <p>The Family Shield Protocol has been activated by ${triggeringGuardianName}.</p>
          <p>You now have access to the family's survival guide and emergency information.</p>
          <p><a href="${Deno.env.get('SITE_URL')}/emergency-access">Access Emergency Information</a></p>
        `
      });
      */
    }
  } catch (error) {
    console.error('Error notifying guardians:', error);
  }
}

async function generateGuardianAccessTokens(supabaseClient: any, userId: string) {
  try {
    // Get all authorized guardians
    const { data: guardians, error } = await supabaseClient
      .from('guardians')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching guardians for tokens:', error);
      return [];
    }

    const accessTokens = [];

    for (const guardian of guardians || []) {
      const accessToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // Token expires in 30 days

      // TODO: Store access tokens in a secure table
      // This would be implemented with a new table: guardian_access_tokens
      
      accessTokens.push({
        guardian_id: guardian.id,
        guardian_name: guardian.name,
        guardian_email: guardian.email,
        access_token: accessToken,
        expires_at: expiresAt.toISOString(),
        permissions: {
          can_access_health_docs: guardian.can_access_health_docs,
          can_access_financial_docs: guardian.can_access_financial_docs,
          is_child_guardian: guardian.is_child_guardian,
          is_will_executor: guardian.is_will_executor
        }
      });

      console.log(`Generated access token for guardian ${guardian.id}: [REDACTED]`);
    }

    return accessTokens;
  } catch (error) {
    console.error('Error generating access tokens:', error);
    return [];
  }
}