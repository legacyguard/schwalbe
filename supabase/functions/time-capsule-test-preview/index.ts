
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TimeCapsule {
  id: string;
  user_id: string;
  recipient_name: string;
  recipient_email: string;
  message_title: string;
  access_token: string;
  delivery_condition: 'ON_DATE' | 'ON_DEATH';
  delivery_date?: string;
  created_at: string;
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

    const { capsule_id } = await req.json();

    if (!capsule_id) {
      throw new Error('Capsule ID is required');
    }

    // Get the capsule and user information
    const { data: capsule, error: capsuleError } = await supabaseClient
      .from('time_capsules')
      .select(`
        *,
        user:auth.users!user_id(email)
      `)
      .eq('id', capsule_id)
      .single();

    if (capsuleError || !capsule) {
      throw new Error('Time Capsule not found');
    }

    // Get user email from auth.users
    const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(capsule.user_id);
    
    if (userError || !userData.user) {
      throw new Error('User not found');
    }

    const userEmail = userData.user.email;
    
    if (!userEmail) {
      throw new Error('User email not found');
    }

    console.log(`Sending test preview for capsule ${capsule_id} to ${userEmail}`);

    // Generate viewing URL (same as real delivery)
    const baseUrl = Deno.env.get('SITE_URL') ?? 'https://legacyguard.app';
    const viewingUrl = `${baseUrl}/time-capsule-view/${capsule.access_token}`;

    // Send test preview email using Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Time Capsule Preview <time-capsule@legacyguard.app>',
        to: [userEmail],
        subject: `TEST PREVIEW: Time Capsule "${capsule.message_title}"`,
        html: generateTestPreviewEmailTemplate(capsule as TimeCapsule, viewingUrl),
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      throw new Error(`Email delivery failed: ${errorData}`);
    }

    console.log(`Successfully sent test preview for Time Capsule ${capsule_id}`);

    return new Response(
      JSON.stringify({
        message: 'Test preview email sent successfully',
        capsule_id: capsule_id,
        sent_to: userEmail
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Test preview error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function generateTestPreviewEmailTemplate(capsule: TimeCapsule, viewingUrl: string): string {
  const isDateBased = capsule.delivery_condition === 'ON_DATE';
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Test Preview - Time Capsule</title>
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
        .test-banner {
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
          color: white;
          padding: 15px 30px;
          text-align: center;
          font-weight: bold;
          font-size: 14px;
          letter-spacing: 0.5px;
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
        .test-warning {
          background: #fff3cd;
          border: 1px solid #fbbf24;
          border-radius: 10px;
          padding: 15px;
          margin: 20px 0;
          color: #92400e;
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
        <div class="test-banner">
          🧪 THIS IS A TEST PREVIEW - Your Time Capsule has NOT been delivered
        </div>
        
        <div class="header">
          <div class="heart-icon">💜</div>
          <h1 style="margin: 0; font-size: 28px;">Preview: A Time Capsule Awaits</h1>
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
              ? 'Someone special has prepared a Time Capsule message just for you, scheduled to be delivered on a future date.'
              : 'As part of a Family Shield activation, a precious message has been prepared for you.'
            }
          </p>
          
          <div class="metadata">
            <p style="margin: 0; font-weight: bold; color: #667eea;">Message Details:</p>
            <p style="margin: 5px 0;"><strong>Title:</strong> ${capsule.message_title}</p>
            <p style="margin: 5px 0;"><strong>Delivery Type:</strong> ${isDateBased ? 'Scheduled Delivery' : 'Family Shield Activation'}</p>
            <p style="margin: 5px 0;"><strong>Created:</strong> ${new Date(capsule.created_at).toLocaleDateString('en-US', { 
              year: 'numeric', month: 'long', day: 'numeric' 
            })}</p>
          </div>
          
          <div class="test-warning">
            <p style="margin: 0; font-size: 14px;">
              <strong>Test Preview Notice:</strong> This is exactly how the email will look when your Time Capsule is actually delivered. 
              You can click the button below to see the complete viewing experience your recipient will have.
            </p>
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
          
          <div style="background: #e0f2fe; border: 1px solid #0ea5e9; border-radius: 10px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #0369a1;">
              <strong>Private & Secure:</strong> This Time Capsule is encrypted and only accessible with your unique link. 
              Secure ID: <code style="background: white; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${capsule.access_token.slice(0, 8)}...${capsule.access_token.slice(-4)}</code>
            </p>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            This is a test preview of your Time Capsule delivery email. When your capsule is actually delivered, 
            it will look exactly like this message.
          </p>
        </div>
        
        <div class="footer">
          <p style="margin: 0;">
            Test Preview from Family Shield Technology
          </p>
          <p style="margin: 5px 0 0; font-size: 12px;">
            This message was securely generated for preview purposes only.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}