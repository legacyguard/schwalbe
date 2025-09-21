
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FamilyShieldSettings {
  id: string;
  user_id: string;
  inactivity_period_months: number;
  required_guardians_for_activation: number;
  is_shield_enabled: boolean;
  last_activity_check: string;
  shield_status: 'inactive' | 'pending_verification' | 'active';
}

interface Guardian {
  id: string;
  user_id: string;
  name: string;
  email: string;
  can_trigger_emergency: boolean;
  emergency_contact_priority: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting inactivity check process...');

    // Get all users with enabled Family Shields
    const { data: shieldUsers, error: shieldError } = await supabaseClient
      .from('family_shield_settings')
      .select(`
        *,
        auth.users!inner(id, last_sign_in_at, email)
      `)
      .eq('is_shield_enabled', true)
      .eq('shield_status', 'inactive');

    if (protocolError) {
      console.error('Error fetching protocol users:', protocolError);
      throw protocolError;
    }

    if (!protocolUsers || protocolUsers.length === 0) {
      console.log('No active protocols to check');
      return new Response(
        JSON.stringify({ message: 'No active protocols to check', checked: 0 }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    let processedUsers = 0;
    let triggeredProtocols = 0;

    for (const settings of protocolUsers) {
      try {
        console.log(`Checking user ${settings.user_id}...`);
        
        const user = settings.auth?.users;
        if (!user) {
          console.log(`No user data found for ${settings.user_id}`);
          continue;
        }

        // Calculate inactivity period
        const lastSignIn = new Date(user.last_sign_in_at || user.created_at || new Date());
        const currentDate = new Date();
        const monthsSinceLastActivity = Math.floor(
          (currentDate.getTime() - lastSignIn.getTime()) / (1000 * 60 * 60 * 24 * 30)
        );

        console.log(`User ${settings.user_id}: ${monthsSinceLastActivity} months inactive (threshold: ${settings.inactivity_period_months})`);

        if (monthsSinceLastActivity >= settings.inactivity_period_months) {
          console.log(`User ${settings.user_id} exceeds inactivity threshold, starting verification...`);
          
          // Update protocol status to pending verification
          const { error: updateError } = await supabaseClient
            .from('user_protocol_settings')
            .update({
              protocol_status: 'pending_verification',
              last_activity_check: new Date().toISOString()
            })
            .eq('id', settings.id);

          if (updateError) {
            console.error('Error updating protocol status:', updateError);
            continue;
          }

          // Create activation log entry
          const { error: logError } = await supabaseClient
            .from('emergency_activation_log')
            .insert({
              user_id: settings.user_id,
              activation_type: 'inactivity_detected',
              status: 'pending',
              guardian_email: null,
              guardian_name: null,
              notes: `User inactive for ${monthsSinceLastActivity} months (threshold: ${settings.inactivity_period_months} months)`,
              ip_address: null,
              user_agent: 'System/Protocol-Checker'
            });

          if (logError) {
            console.error('Error creating activation log:', logError);
            continue;
          }

          // Send verification emails to user
          await sendVerificationEmail(supabaseClient, user, settings);

          triggeredProtocols++;
        } else {
          // Update last activity check
          await supabaseClient
            .from('user_protocol_settings')
            .update({ last_activity_check: new Date().toISOString() })
            .eq('id', settings.id);
        }

        processedUsers++;
      } catch (userError) {
        console.error(`Error processing user ${settings.user_id}:`, userError);
      }
    }

    console.log(`Processed ${processedUsers} users, triggered ${triggeredProtocols} protocols`);

    return new Response(
      JSON.stringify({
        message: 'Inactivity check completed',
        processed: processedUsers,
        triggered: triggeredProtocols
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in inactivity checker:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function sendVerificationEmail(supabaseClient: any, user: any, settings: ProtocolSettings) {
  try {
    console.log(`Sending verification email to ${user.email}...`);
    
    // In a real implementation, you would integrate with your email service here
    // For now, we'll just log that the email would be sent
    
    const verificationToken = crypto.randomUUID();
    const verificationLink = `${Deno.env.get('SITE_URL')}/verify-activity/${verificationToken}`;
    
    // Store verification token (you would implement this)
    console.log(`Verification link for ${user.email}: ${verificationLink}`);
    
    // TODO: Integrate with email service (SendGrid, Resend, etc.)
    /*
    await sendEmail({
      to: user.email,
      subject: 'LegacyGuard - Please confirm you\'re okay',
      html: `
        <h2>Family Shield Protocol Check-In</h2>
        <p>Hi there,</p>
        <p>We noticed you haven't signed into LegacyGuard in ${settings.inactivity_period_months} months. 
        We just want to make sure you're okay!</p>
        <p>If you're safe and well, please click the link below to let us know:</p>
        <a href="${verificationLink}">Yes, I'm okay - Cancel Protocol</a>
        <p>If you don't respond within 7 days, we'll notify your emergency guardians 
        to make sure your family has the support they need.</p>
        <p>Stay safe,<br>The LegacyGuard Team</p>
      `
    });
    */
    
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
}