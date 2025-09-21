
import { supabase } from '../supabase/client';

import { logger } from '../lib/logger';
export interface EmailTemplate {
  html: string;
  subject: string;
  text?: string;
  to: string;
}

export interface EmailNotification {
  auto_will_update_proposal?: {
    changeSummary: string;
  };
  auto_will_update_applied?: {
    changeSummary: string;
  };
  payment_failed: {
    planName: string;
    retryDate: string;
    updatePaymentUrl: string;
    userName: string;
  };
  payment_successful: {
    amount: string;
    invoiceUrl?: string;
    planName: string;
    userName: string;
  };
  subscription_cancelled: {
    expiryDate: string;
    planName: string;
    userName: string;
  };
  subscription_welcome: {
    billingCycle: string;
    nextBillingDate: string;
    planName: string;
    userName: string;
  };
  subscription_expiry_reminder: {
    planName: string;
    renewDate: string;
    daysBefore: number;
    renewUrl?: string;
    userName: string;
  };
  upgrade_suggestion: {
    benefits: string[];
    currentPlan: string;
    suggestedPlan: string;
    upgradeUrl: string;
    userName: string;
  };
  usage_warning: {
    currentUsage: string;
    limit: string;
    percentage: number;
    upgradeUrl: string;
    usageType: string;
    userName: string;
  };
}

class EmailService {
  private readonly fromEmail = 'noreply@documentsafe.app';
  private readonly appName = 'Document Safe';

  async sendWillUpdateProposal(
    email: string,
    data: NonNullable<EmailNotification['auto_will_update_proposal']>
  ): Promise<boolean> {
    if (!email) return true; // No-op if email missing; avoid PII leaks
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3182ce; color: white; padding: 24px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 24px; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Automatic Will Update Proposal</h2>
            </div>
            <div class="content">
              <p>We detected changes related to your will. A proposal is ready for your review.</p>
              <p><strong>Summary:</strong> ${data.changeSummary}</p>
              <p>Open your dashboard to review and approve the proposed updates.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    return this.sendEmail({ to: email, subject: 'Your will has an update proposal', html, text: `Proposal summary: ${data.changeSummary}` });
  }

  async sendWillUpdateApplied(
    email: string,
    data: NonNullable<EmailNotification['auto_will_update_applied']>
  ): Promise<boolean> {
    if (!email) return true;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #38a169; color: white; padding: 24px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 24px; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Will Update Applied</h2>
            </div>
            <div class="content">
              <p>Your approved changes have been applied.</p>
              <p><strong>Summary:</strong> ${data.changeSummary}</p>
            </div>
          </div>
        </body>
      </html>
    `;
    return this.sendEmail({ to: email, subject: 'Your will was updated', html, text: `Applied: ${data.changeSummary}` });
  }

  /**
   * Send email via Supabase Edge Function
   */
  private async sendEmail(template: EmailTemplate): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: template.to,
          subject: template.subject,
          html: template.html,
          text: template.text,
          from: this.fromEmail,
        },
      });

      if (error) {
        logger.error('Error sending email:', {
          metadata: { error: error instanceof Error ? error.message : String(error) }
        });
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Failed to send email', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
      return false;
    }
  }

  /**
   * Send subscription welcome email
   */
  async sendSubscriptionWelcome(
    email: string,
    data: EmailNotification['subscription_welcome']
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .plan-box { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to ${this.appName} Pro! 🎉</h1>
            </div>
            <div class="content">
              <p>Hi ${data.userName},</p>
              
              <p>Thank you for subscribing to <strong>${data.planName}</strong> plan! Your documents are now protected with enhanced features and increased limits.</p>
              
              <div class="plan-box">
                <h3>Your Subscription Details:</h3>
                <ul>
                  <li><strong>Plan:</strong> ${data.planName}</li>
                  <li><strong>Billing Cycle:</strong> ${data.billingCycle}</li>
                  <li><strong>Next Billing Date:</strong> ${data.nextBillingDate}</li>
                </ul>
              </div>
              
              <p>You now have access to:</p>
              <ul>
                <li>✅ Increased storage capacity</li>
                <li>✅ More document slots</li>
                <li>✅ Advanced features</li>
                <li>✅ Priority support</li>
              </ul>
              
              <center>
                <a href="https://documentsafe.app/dashboard" class="button">Go to Dashboard</a>
              </center>
              
              <div class="footer">
                <p>If you have any questions, feel free to contact our support team.</p>
                <p>&copy; 2025 ${this.appName}. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Welcome to ${this.appName} Pro!

Hi ${data.userName},

Thank you for subscribing to ${data.planName} plan!

Your Subscription Details:
- Plan: ${data.planName}
- Billing Cycle: ${data.billingCycle}
- Next Billing Date: ${data.nextBillingDate}

You now have access to enhanced features and increased limits.

Visit your dashboard: https://documentsafe.app/dashboard

Best regards,
The ${this.appName} Team
    `;

    return this.sendEmail({
      to: email,
      subject: `Welcome to ${this.appName} ${data.planName}! 🎉`,
      html,
      text,
  })
}

  /**
   * Notify user that their will draft is ready for review
   */
  async sendWillReadyForReview(
    email: string,
    data: { title: string; summary: string }
  ): Promise<boolean> {
    if (!email) return true;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4f46e5; color: white; padding: 24px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 24px; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>${data.title}</h2>
            </div>
            <div class="content">
              <p>Your will draft is ready for review.</p>
              <p><strong>Summary:</strong> ${data.summary}</p>
              <p>You can review and finalize it in your dashboard.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    return this.sendEmail({ to: email, subject: `${this.appName}: Your will draft is ready`, html, text: data.summary });
  }

  /**
   * Send subscription expiry reminder
   */
  async sendSubscriptionExpiryReminder(
    email: string,
    data: NonNullable<EmailNotification['subscription_expiry_reminder']>
  ): Promise<boolean> {
    if (!email) return true;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3182ce; color: white; padding: 24px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 24px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #3182ce; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Subscription Renewal Reminder</h2>
            </div>
            <div class="content">
              <p>Hi ${data.userName},</p>
              <p>Your <strong>${data.planName}</strong> plan renews on <strong>${data.renewDate}</strong>.</p>
              <p>This reminder is sent ${data.daysBefore} day(s) in advance.</p>
              ${data.renewUrl ? `<center><a href="${data.renewUrl}" class="button">Manage Subscription</a></center>` : ''}
            </div>
          </div>
        </body>
      </html>
    `;
    const text = `Your ${data.planName} plan renews on ${data.renewDate}. This reminder is ${data.daysBefore} day(s) in advance.`;
    return this.sendEmail({ to: email, subject: 'Subscription Renewal Reminder', html, text });
  }

  /**
   * Send payment successful email
   */
  async sendPaymentSuccessful(
    email: string,
    data: EmailNotification['payment_successful']
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #48bb78; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .receipt { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Successful ✅</h1>
            </div>
            <div class="content">
              <p>Hi ${data.userName},</p>
              
              <p>Your payment has been successfully processed.</p>
              
              <div class="receipt">
                <h3>Payment Details:</h3>
                <ul>
                  <li><strong>Amount:</strong> ${data.amount}</li>
                  <li><strong>Plan:</strong> ${data.planName}</li>
                  <li><strong>Status:</strong> Paid</li>
                </ul>
              </div>
              
              ${
                data.invoiceUrl
                  ? `
                <p>You can download your invoice here:</p>
                <center>
                  <a href="${data.invoiceUrl}" class="button">Download Invoice</a>
                </center>
              `
                  : ''
              }
              
              <div class="footer">
                <p>Thank you for your continued support!</p>
                <p>&copy; 2025 ${this.appName}. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `Payment Successful - ${this.appName}`,
      html,
      text: `Payment successful for ${data.planName} plan. Amount: ${data.amount}`,
    });
  }

  /**
   * Send payment failed email
   */
  async sendPaymentFailed(
    email: string,
    data: EmailNotification['payment_failed']
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f56565; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .alert { background: #fff5f5; border: 1px solid #feb2b2; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 30px; background: #f56565; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Failed ⚠️</h1>
            </div>
            <div class="content">
              <p>Hi ${data.userName},</p>
              
              <p>We were unable to process your payment for the <strong>${data.planName}</strong> plan.</p>
              
              <div class="alert">
                <h3>What happens next?</h3>
                <ul>
                  <li>We'll retry the payment on <strong>${data.retryDate}</strong></li>
                  <li>Your subscription remains active until then</li>
                  <li>Please update your payment method to avoid service interruption</li>
                </ul>
              </div>
              
              <center>
                <a href="${data.updatePaymentUrl}" class="button">Update Payment Method</a>
              </center>
              
              <div class="footer">
                <p>If you need assistance, please contact our support team.</p>
                <p>&copy; 2025 ${this.appName}. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `Action Required: Payment Failed - ${this.appName}`,
      html,
      text: `Payment failed for ${data.planName} plan. Please update your payment method at: ${data.updatePaymentUrl}`,
    });
  }

  /**
   * Send emergency alert email (MVP placeholder via Resend Edge Function)
   */
  async sendEmergencyAlert(
    email: string,
    data: { severity: 'low' | 'medium' | 'high' | 'critical'; message: string }
  ): Promise<boolean> {
    if (!email) return true; // No-op if email missing to avoid PII issues in logs
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${data.severity === 'critical' ? '#DC2626' : data.severity === 'high' ? '#F97316' : data.severity === 'medium' ? '#EAB308' : '#3B82F6'}; color: white; padding: 24px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 24px; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Emergency Alert (${data.severity.toUpperCase()})</h2>
            </div>
            <div class="content">
              <p>${data.message}</p>
            </div>
          </div>
        </body>
      </html>
    `;
    return this.sendEmail({ to: email, subject: `Emergency Alert (${data.severity})`, html, text: data.message });
  }

  /**
   * Send usage warning email
   */
  async sendUsageWarning(
    email: string,
    data: EmailNotification['usage_warning']
  ): Promise<boolean> {
    const getWarningColor = (percentage: number) => {
      if (percentage >= 90) return '#f56565';
      if (percentage >= 80) return '#ed8936';
      return '#ecc94b';
    };

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${getWarningColor(data.percentage)}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .usage-bar { background: #e2e8f0; height: 30px; border-radius: 15px; overflow: hidden; margin: 20px 0; }
            .usage-fill { background: ${getWarningColor(data.percentage)}; height: 100%; width: ${data.percentage}%; transition: width 0.3s; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Usage Warning: ${data.percentage}% of Limit Reached</h1>
            </div>
            <div class="content">
              <p>Hi ${data.userName},</p>
              
              <p>You're approaching your ${data.usageType} limit.</p>
              
              <div>
                <h3>Current Usage:</h3>
                <div class="usage-bar">
                  <div class="usage-fill"></div>
                </div>
                <p><strong>${data.currentUsage}</strong> of <strong>${data.limit}</strong> used (${data.percentage}%)</p>
              </div>
              
              <p>Consider upgrading your plan for more capacity and features.</p>
              
              <center>
                <a href="${data.upgradeUrl}" class="button">Upgrade Now</a>
              </center>
              
              <div class="footer">
                <p>&copy; 2025 ${this.appName}. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `Usage Warning: ${data.percentage}% of ${data.usageType} limit reached`,
      html,
      text: `You've used ${data.percentage}% of your ${data.usageType} limit (${data.currentUsage} of ${data.limit}). Consider upgrading at: ${data.upgradeUrl}`,
    });
  }

  /**
   * Check and send usage warnings at different thresholds
   */
  async checkAndSendUsageWarnings(userId: string): Promise<void> {
    const usage = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .single();

    const subscription = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!usage.data || !subscription.data) return;

    const limits = await supabase
      .from('subscription_limits')
      .select('*')
      .eq('plan', subscription.data.plan)
      .single();

    if (!limits.data) return;

    // Check document usage
    if (limits.data.max_documents) {
      const percentage =
        (usage.data.document_count / limits.data.max_documents) * 100;
      if (percentage >= 80 && percentage < 90) {
        // Send 80% warning
      } else if (percentage >= 90) {
        // Send 90% warning
      }
    }

    // Similar checks for storage, time capsules, scans...
  }
}

export const emailService = new EmailService();
