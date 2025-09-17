
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TimeCapsuleDelivery {
  capsule_id: string;
  user_id: string;
  recipient_name: string;
  recipient_email: string;
  message_title: string;
  access_token: string;
  delivery_condition: 'ON_DATE' | 'ON_DEATH';
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

    console.log('Starting Time Capsule delivery check...');

    // Get capsules ready for delivery
    const { data: readyCapsules, error: capsulesError } = await supabaseClient
      .rpc('get_time_capsules_ready_for_delivery');

    if (capsulesError) {
      throw capsulesError;
    }

    if (!readyCapsules || readyCapsules.length === 0) {
      console.log('No Time Capsules ready for delivery');
      return new Response(
        JSON.stringify({ message: 'No capsules ready for delivery', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${readyCapsules.length} Time Capsules ready for delivery`);

    let successCount = 0;
    let failureCount = 0;

    // Process each capsule
    for (const capsule of readyCapsules as TimeCapsuleDelivery[]) {
      try {
        console.log(`Processing capsule ${capsule.capsule_id} for recipient ${capsule.recipient_id || 'unknown'}`);

        // Generate viewing URL
        const baseUrl = Deno.env.get('SITE_URL') ?? 'https://legacyguard.app';
        const viewingUrl = `${baseUrl}/time-capsule-view/${capsule.access_token}`;

        // Send email notification using Resend
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Time Capsule <time-capsule@legacyguard.app>',
            to: [capsule.recipient_email],
            subject: `A Time Capsule has been delivered for you: ${capsule.message_title}`,
            html: generateEmailTemplate(capsule, viewingUrl),
          }),
        });

        if (!emailResponse.ok) {
          const errorData = await emailResponse.text();
          throw new Error(`Email delivery failed: ${errorData}`);
        }

        // Mark capsule as delivered
        const { error: updateError } = await supabaseClient
          .rpc('mark_capsule_delivered', { capsule_uuid: capsule.capsule_id });

        if (updateError) {
          throw updateError;
        }

        console.log(`Successfully delivered Time Capsule ${capsule.capsule_id}`);
        successCount++;

      } catch (error) {
        console.error(`Failed to deliver Time Capsule ${capsule.capsule_id}:`, error);
        
        // Increment delivery attempt and mark as failed if too many attempts
        await supabaseClient.rpc('increment_delivery_attempt', {
          capsule_uuid: capsule.capsule_id,
          error_message: error.message
        });
        
        failureCount++;
      }
    }

    console.log(`Delivery complete: ${successCount} successful, ${failureCount} failed`);

    return new Response(
      JSON.stringify({
        message: 'Time Capsule delivery process completed',
        processed: readyCapsules.length,
        successful: successCount,
        failed: failureCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Time Capsule delivery error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function generateEmailTemplate(capsule: TimeCapsuleDelivery, viewingUrl: string): string {
  const isDateBased = capsule.delivery_condition === 'ON_DATE';
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Time Capsule Delivered</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8fafc;
        }
        .container {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .header {
          padding: 40px 30px;
          text-align: center;
          color: white;
        }
        .heart-icon {
          width: 60px;
          height: 60px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-size: 24px;
        }
        .content {
          background: white;
          padding: 40px 30px;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 50px;
          font-weight: bold;
          text-align: center;
          margin: 20px 0;
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
          transition: all 0.3s ease;
        }
        .metadata {
          background: #f8fafc;
          padding: 20px;
          border-radius: 10px;
          margin: 20px 0;
          border-left: 4px solid #667eea;
        }
        .footer {
          text-align: center;
          padding: 30px;
          color: #666;
          font-size: 14px;
          background: #f8fafc;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="heart-icon">💜</div>
          <h1 style="margin: 0; font-size: 28px;">A Time Capsule Awaits You</h1>
          <p style="margin: 10px 0 0; opacity: 0.9; font-size: 18px;">
            ${capsule.message_title}
          </p>
        </div>
        
        <div class="content">
          <p style="font-size: 18px; margin-bottom: 20px;">
            Dear ${capsule.recipient_name},
          </p>
          
          <p style="font-size: 16px; line-height: 1.8;">
            ${isDateBased 
              ? 'Someone special has prepared a Time Capsule message just for you, scheduled to be delivered today.'
              : 'As part of a Family Shield activation, a precious message has been prepared for you.'
            }
          </p>
          
          <div class="metadata">
            <p style="margin: 0; font-weight: bold; color: #667eea;">Message Details:</p>
            <p style="margin: 5px 0;"><strong>Title:</strong> ${capsule.message_title}</p>
            <p style="margin: 5px 0;"><strong>Delivery Type:</strong> ${isDateBased ? 'Scheduled Delivery' : 'Family Shield Activation'}</p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.8;">
            This personal message was created with love and sealed until this moment. 
            It's waiting for you to open and experience whenever you're ready.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${viewingUrl}" class="cta-button">
              Open Your Time Capsule 💜
            </a>
          </div>
          
          <div style="background: #fef3cd; border: 1px solid #fbbf24; border-radius: 10px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #92400e;">
              <strong>Private & Secure:</strong> This Time Capsule is encrypted and only accessible with your unique link. 
              It will remain available for 30 days from delivery.
            </p>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            If you didn't expect this Time Capsule or believe you received it in error, 
            please contact our support team.
          </p>
        </div>
        
        <div class="footer">
          <p style="margin: 0;">
            Delivered with ❤️ by Family Shield Technology
          </p>
          <p style="margin: 5px 0 0; font-size: 12px;">
            This message was securely stored and delivered at exactly the right moment.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}