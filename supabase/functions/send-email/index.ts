
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

interface EmailRequest {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
  replyTo?: string
  cc?: string[]
  bcc?: string[]
  attachments?: Array<{
    filename: string
    content: string
    contentType?: string
  }>
}

serve(async (req) => {
  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Parse request body
    const emailRequest: EmailRequest = await req.json()
    
    // Validate required fields
    if (!emailRequest.to || !emailRequest.subject || (!emailRequest.html && !emailRequest.text)) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, and either html or text' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Set default from address
    const fromAddress = emailRequest.from || 'Document Safe <noreply@documentsafe.app>'

    // Send email using Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: emailRequest.to,
        subject: emailRequest.subject,
        html: emailRequest.html,
        text: emailRequest.text,
        reply_to: emailRequest.replyTo,
        cc: emailRequest.cc,
        bcc: emailRequest.bcc,
        attachments: emailRequest.attachments,
      }),
    })

    if (!resendResponse.ok) {
      const error = await resendResponse.text()
      console.error('Resend API error:', error)
      
      // Log failed email attempt
      await supabase
        .from('email_logs')
        .insert({
          to: Array.isArray(emailRequest.to) ? emailRequest.to.join(', ') : emailRequest.to,
          subject: emailRequest.subject,
          status: 'failed',
          error: error,
          sent_at: new Date().toISOString(),
        })

      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: error }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const result = await resendResponse.json()
    
    // Log successful email
    await supabase
      .from('email_logs')
      .insert({
        to: Array.isArray(emailRequest.to) ? emailRequest.to.join(', ') : emailRequest.to,
        subject: emailRequest.subject,
        status: 'sent',
        message_id: result.id,
        sent_at: new Date().toISOString(),
      })

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Email function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

// Email Templates
export const templates = {
  welcomeEmail: (userName: string, planName: string) => ({
    subject: `Welcome to LegacyGuard ${planName}! 🎉`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to LegacyGuard</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Welcome to LegacyGuard Pro!</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px;">Hi ${userName},</p>
            <p style="font-size: 16px;">Thank you for upgrading to <strong>${planName}</strong>! Your documents are now protected with our most advanced features.</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #667eea; margin-top: 0;">What's included in your plan:</h3>
              <ul style="list-style: none; padding: 0;">
                <li style="padding: 8px 0;">✅ Enhanced storage capacity</li>
                <li style="padding: 8px 0;">✅ Priority document processing</li>
                <li style="padding: 8px 0;">✅ Advanced security features</li>
                <li style="padding: 8px 0;">✅ 24/7 priority support</li>
              </ul>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://legacyguard.app/dashboard" style="display: inline-block; padding: 14px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">Go to Dashboard</a>
            </div>
            <p style="font-size: 14px; color: #666; text-align: center;">
              Need help? Reply to this email or visit our <a href="https://legacyguard.app/help" style="color: #667eea;">help center</a>.
            </p>
          </div>
          <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
            © 2025 LegacyGuard. All rights reserved.<br>
            <a href="https://legacyguard.app/unsubscribe" style="color: #999;">Unsubscribe</a> |
            <a href="https://legacyguard.app/privacy" style="color: #999;">Privacy Policy</a>
          </div>
        </body>
      </html>
    `,
    text: `
      Welcome to LegacyGuard Pro!
      
      Hi ${userName},
      
      Thank you for upgrading to ${planName}! Your documents are now protected with our most advanced features.
      
      What's included in your plan:
      ✅ Enhanced storage capacity
      ✅ Priority document processing
      ✅ Advanced security features
      ✅ 24/7 priority support
      
      Go to Dashboard: https://legacyguard.app/dashboard
      
      Need help? Reply to this email or visit our help center at https://legacyguard.app/help
      
      © 2025 LegacyGuard. All rights reserved.
    `
  }),

  cancellationConfirmation: (
    userName: string,
    mode: 'end_of_period' | 'immediate',
    currentPeriodEnd?: string | null
  ) => ({
    subject: mode === 'end_of_period' ? 'Your subscription will end at period end' : 'Your subscription has been cancelled',
    html: `
      <!doctype html><html><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color:#0f172a; max-width:600px; margin:0 auto; padding:20px;">
        <div style="background:${mode==='end_of_period' ? '#f59e0b' : '#ef4444'}; color:white; padding:16px; border-radius:8px 8px 0 0;">
          <h1 style="margin:0; font-size:20px;">${mode==='end_of_period' ? 'Cancellation Scheduled' : 'Subscription Cancelled'}</h1>
        </div>
        <div style="border:1px solid #e2e8f0; border-top:none; padding:16px; border-radius:0 0 8px 8px; background:#fff;">
          <p>Hi ${userName || ''},</p>
          ${mode==='end_of_period'
            ? `<p>Your subscription will remain active until the end of your current billing period${currentPeriodEnd ? ` on <strong>${new Date(currentPeriodEnd).toLocaleDateString('en-US')}</strong>` : ''}. You may restart at any time.</p>`
            : `<p>Your subscription has been cancelled immediately. You no longer have access to paid features. You may subscribe again at any time.</p>`}
          <p style="font-size:12px; color:#64748b;">© 2025 LegacyGuard</p>
        </div>
      </body></html>
    `,
    text: mode==='end_of_period'
      ? `Your subscription will end at the current period end${currentPeriodEnd ? ` on ${new Date(currentPeriodEnd).toLocaleDateString('en-US')}`:''}.`
      : 'Your subscription has been cancelled.'
  }),

  trialEndingSoon: (userName: string, daysLeft: number) => ({
    subject: `Your trial ends in ${daysLeft} day${daysLeft===1?'':'s'}`,
    html: `
      <!doctype html><html><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color:#0f172a; max-width:600px; margin:0 auto; padding:20px;">
        <div style="background:#f59e0b; color:white; padding:16px; border-radius:8px 8px 0 0;">
          <h1 style="margin:0; font-size:20px;">Trial ending soon</h1>
        </div>
        <div style="border:1px solid #e2e8f0; border-top:none; padding:16px; border-radius:0 0 8px 8px; background:#fff;">
          <p>Hi ${userName || ''},</p>
          <p>Your trial ends in ${daysLeft} day${daysLeft===1?'':'s'}. To keep access to premium features, add a payment method.</p>
          <p><a href="https://legacyguard.app/account/billing" style="color:#0ea5e9;">Open Billing</a></p>
          <p style="font-size:12px; color:#64748b;">© 2025 LegacyGuard</p>
        </div>
      </body></html>
    `,
    text: `Your trial ends in ${daysLeft} day${daysLeft===1?'':'s'}. Open Billing: https://legacyguard.app/account/billing`
  })
}
  paymentFailedEmail: (userName: string, amount: string, retryDate: string, billingUrl: string) => ({
    subject: 'Action Required: Payment Failed - LegacyGuard',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Failed</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #0f172a; max-width: 600px; margin: 0 auto; padding: 20px; background:#f8fafc;">
          <div style="background: #ef4444; color: white; padding: 28px 24px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 22px;">Payment Failed</h1>
          </div>
          <div style="background: #ffffff; padding: 24px; border-radius: 0 0 10px 10px; border:1px solid #e2e8f0;">
            <p style="font-size: 16px;">Hi ${userName},</p>
            <p style="font-size: 16px;">We were unable to process your recent payment of <strong>${amount}</strong>.</p>
            <div style="background: #fff7ed; border-left: 4px solid #f97316; padding: 12px 16px; margin: 16px 0;">
              <p style="margin: 0; color: #7c2d12;"><strong>Next step:</strong> We'll retry the payment on ${retryDate}. To avoid any interruption, please update your payment method.</p>
            </div>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${billingUrl}" style="display: inline-block; padding: 12px 22px; background: #0ea5e9; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">Open Billing Portal</a>
            </div>
            <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 16px;">If you recently updated your card, you can ignore this message.</p>
          </div>
          <div style="text-align: center; padding: 14px; font-size: 12px; color: #94a3b8;">
            © 2025 LegacyGuard. All rights reserved. | <a href="https://legacyguard.app/privacy" style="color:#94a3b8;">Privacy</a>
          </div>
        </body>
      </html>
    `,
    text: `Payment Failed - Action Required\n\nHi ${userName},\n\nWe were unable to process your payment of ${amount}. We'll retry on ${retryDate}.\n\nOpen Billing Portal: ${billingUrl}\n\n© 2025 LegacyGuard.`
  }),

  paymentRecoveredEmail: (userName: string, amount: string) => ({
    subject: 'Payment Confirmed - LegacyGuard',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Confirmed</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #0f172a; max-width: 600px; margin: 0 auto; padding: 20px; background:#f8fafc;">
          <div style="background: #10b981; color: white; padding: 28px 24px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 22px;">Payment Confirmed</h1>
          </div>
          <div style="background: #ffffff; padding: 24px; border-radius: 0 0 10px 10px; border:1px solid #e2e8f0;">
            <p style="font-size: 16px;">Hi ${userName},</p>
            <p style="font-size: 16px;">Great news—your recent payment of <strong>${amount}</strong> has been processed successfully and your subscription is active again.</p>
            <p style="font-size: 14px; color:#475569;">No further action is needed.</p>
          </div>
          <div style="text-align: center; padding: 14px; font-size: 12px; color: #94a3b8;">
            © 2025 LegacyGuard. All rights reserved. | <a href="https://legacyguard.app/privacy" style="color:#94a3b8;">Privacy</a>
          </div>
        </body>
      </html>
    `,
    text: `Payment Confirmed\n\nHi ${userName},\n\nYour payment of ${amount} was processed successfully and your subscription is active again.\n\n© 2025 LegacyGuard.`
  }),

  usageWarningEmail: (userName: string, usageType: string, percentage: number, upgradeUrl: string) => ({
    subject: `Usage Warning: ${percentage}% of ${usageType} limit reached`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: ${percentage >= 90 ? '#f56565' : '#ed8936'}; color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">${percentage}% of ${usageType} Used</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px;">Hi ${userName},</p>
            <p style="font-size: 16px;">You're approaching your ${usageType} limit.</p>
            <div style="background: #e2e8f0; border-radius: 10px; overflow: hidden; height: 30px; margin: 20px 0;">
              <div style="background: ${percentage >= 90 ? '#f56565' : '#ed8936'}; height: 100%; width: ${percentage}%; transition: width 0.3s;"></div>
            </div>
            <p style="text-align: center; font-size: 18px; font-weight: bold;">${percentage}% Used</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${upgradeUrl}" style="display: inline-block; padding: 14px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">Upgrade Now</a>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Usage Warning\n\nHi ${userName},\n\nYou've used ${percentage}% of your ${usageType} limit.\n\nUpgrade your plan at: ${upgradeUrl}`
  })
}
