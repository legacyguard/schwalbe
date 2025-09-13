
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FamilyShieldActivation {
  user_id: string;
  activation_type: string;
  status: string;
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

    console.log('Checking for Family Shield activations that should trigger Time Capsules...');

    // Get confirmed Family Shield activations that haven't processed Time Capsules yet
    const { data: activations, error: activationsError } = await supabaseClient
      .from('family_shield_activation_log')
      .select('user_id, activation_type, status, confirmed_at')
      .eq('status', 'confirmed')
      .not('confirmed_at', 'is', null);

    if (activationsError) {
      throw activationsError;
    }

    if (!activations || activations.length === 0) {
      console.log('No confirmed Family Shield activations found');
      return new Response(
        JSON.stringify({ message: 'No activations to process', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${activations.length} confirmed Family Shield activations`);

    let processedCount = 0;
    let capsuleCount = 0;

    // Process each activation
    for (const activation of activations as FamilyShieldActivation[]) {
      try {
        console.log(`Processing Family Shield activation for user ${activation.user_id}`);

        // Get Time Capsules for this user that are set for ON_DEATH delivery and not yet delivered
        const { data: timeCapsules, error: capsulesError } = await supabaseClient
          .from('time_capsules')
          .select('*')
          .eq('user_id', activation.user_id)
          .eq('delivery_condition', 'ON_DEATH')
          .eq('is_delivered', false)
          .eq('status', 'PENDING');

        if (capsulesError) {
          throw capsulesError;
        }

        if (!timeCapsules || timeCapsules.length === 0) {
          console.log(`No ON_DEATH Time Capsules found for user ${activation.user_id}`);
          continue;
        }

        console.log(`Found ${timeCapsules.length} Time Capsules to deliver for user ${activation.user_id}`);

        // Trigger delivery for each Time Capsule
        for (const capsule of timeCapsules) {
          try {
            // Call the time-capsule-delivery function to process this specific capsule
            const deliveryResponse = await fetch(
              `${Deno.env.get('SUPABASE_URL')}/functions/v1/time-capsule-delivery`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  capsule_id: capsule.id,
                  trigger_type: 'FAMILY_SHIELD_ACTIVATION'
                })
              }
            );

            if (!deliveryResponse.ok) {
              console.error(`Failed to trigger delivery for capsule ${capsule.id}`);
              continue;
            }

            console.log(`Successfully triggered delivery for Time Capsule ${capsule.id}`);
            capsuleCount++;

          } catch (error) {
            console.error(`Error processing Time Capsule ${capsule.id}:`, error);
          }
        }

        processedCount++;

      } catch (error) {
        console.error(`Error processing Family Shield activation for user ${activation.user_id}:`, error);
      }
    }

    // Also call the general delivery function to handle any date-based capsules
    try {
      const generalDeliveryResponse = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/time-capsule-delivery`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (generalDeliveryResponse.ok) {
        const result = await generalDeliveryResponse.json();
        console.log(`General delivery check completed: ${result.processed || 0} capsules processed`);
      }
    } catch (error) {
      console.error('Error triggering general Time Capsule delivery:', error);
    }

    console.log(`Family Shield Time Capsule processing complete: ${processedCount} activations processed, ${capsuleCount} capsules triggered`);

    return new Response(
      JSON.stringify({
        message: 'Family Shield Time Capsule processing completed',
        activations_processed: processedCount,
        capsules_triggered: capsuleCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Family Shield Time Capsule trigger error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});