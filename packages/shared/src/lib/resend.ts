/**
 * Resend email service for transactional emails
 * Handles all email communications including error alerts, dunning, and notifications
 */

import { Resend } from 'resend';
import { logger } from './logger';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@legacyguard.app';
const ALERT_EMAIL = process.env.RESEND_ALERT_EMAIL || 'alerts@legacyguard.app';
const SUPPORT_EMAIL = process.env.RESEND_SUPPORT_EMAIL || 'support@legacyguard.app';

// Email templates
export enum EmailTemplate {
  WELCOME = 'welcome',
  PASSWORD_RESET = 'password_reset',
  EMAIL_VERIFICATION = 'email_verification',
  PAYMENT_FAILED = 'payment_failed',
  PAYMENT_RETRY = 'payment_retry',
  SUBSCRIPTION_CANCELED = 'subscription_canceled',
  SUBSCRIPTION_RENEWED = 'subscription_renewed',
  CRITICAL_ERROR_ALERT = 'critical_error_alert',
  EMERGENCY_ACCESS_GRANTED = 'emergency_access_granted',
  DOCUMENT_SHARED = 'document_shared',
  REMINDER = 'reminder',
  WILL_UPDATE_AVAILABLE = 'will_update_available',
}

interface EmailOptions {
  to: string | string[];
  subject: string;
  template: EmailTemplate;
  data?: Record<string, any>;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
  }>;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class EmailService {
  private static instance: EmailService;

  private constructor() {}

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Send a transactional email
   */
  async send(options: EmailOptions): Promise<EmailResult> {
    try {
      // Validate API key exists
      if (!process.env.RESEND_API_KEY) {
        logger.error('Resend API key not configured', {
          action: 'email_send',
          metadata: { template: options.template },
        });
        return { success: false, error: 'Email service not configured' };
      }

      // Build HTML content based on template
      const html = this.buildEmailHtml(options.template, options.data);

      // Send email via Resend
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html,
        reply_to: options.replyTo || SUPPORT_EMAIL,
        attachments: options.attachments,
      });

      if (error) {
        logger.error('Failed to send email', {
          action: 'email_send_failed',
          metadata: {
            template: options.template,
            error: error.message,
          },
        });
        return { success: false, error: error.message };
      }

      logger.info('Email sent successfully', {
        action: 'email_sent',
        metadata: {
          template: options.template,
          messageId: data?.id,
        },
      });

      return { success: true, messageId: data?.id };
    } catch (error: any) {
      logger.error('Email service error', {
        action: 'email_service_error',
        metadata: {
          template: options.template,
          error: error.message,
        },
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Send critical error alert to admin
   */
  async sendCriticalAlert(error: string, context: Record<string, any>): Promise<void> {
    await this.send({
      to: ALERT_EMAIL,
      subject: `[CRITICAL] Error Alert - ${new Date().toISOString()}`,
      template: EmailTemplate.CRITICAL_ERROR_ALERT,
      data: {
        error,
        context,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      },
    });
  }

  /**
   * Send payment failure notification
   */
  async sendPaymentFailedEmail(
    email: string,
    data: {
      customerName?: string;
      amount: number;
      currency: string;
      retryDate?: string;
      updatePaymentUrl: string;
    }
  ): Promise<EmailResult> {
    return this.send({
      to: email,
      subject: 'Action Required: Payment Failed',
      template: EmailTemplate.PAYMENT_FAILED,
      data,
    });
  }

  /**
   * Send subscription cancellation confirmation
   */
  async sendSubscriptionCanceledEmail(
    email: string,
    data: {
      customerName?: string;
      endDate: string;
      reactivateUrl: string;
    }
  ): Promise<EmailResult> {
    return this.send({
      to: email,
      subject: 'Subscription Canceled',
      template: EmailTemplate.SUBSCRIPTION_CANCELED,
      data,
    });
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(
    email: string,
    data: {
      name?: string;
      loginUrl: string;
    }
  ): Promise<EmailResult> {
    return this.send({
      to: email,
      subject: 'Welcome to LegacyGuard',
      template: EmailTemplate.WELCOME,
      data,
    });
  }

  /**
   * Build HTML content for email templates
   */
  private buildEmailHtml(template: EmailTemplate, data?: Record<string, any>): string {
    // Base email layout
    const layout = (content: string) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${data?.subject || 'LegacyGuard'}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1e293b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 12px 24px; background: #0ea5e9; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #64748b; font-size: 14px; }
            .alert { background: #fee2e2; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .success { background: #dcfce7; border: 1px solid #bbf7d0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>LegacyGuard</h1>
            </div>
            <div class="content">
              ${content}
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} LegacyGuard. All rights reserved.</p>
              <p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/support">Support</a> |
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/privacy">Privacy</a> |
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/terms">Terms</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Template-specific content
    let content = '';

    switch (template) {
      case EmailTemplate.WELCOME:
        content = `
          <h2>Welcome to LegacyGuard, ${data?.name || 'there'}!</h2>
          <p>Thank you for joining LegacyGuard. We're excited to help you secure your family's future.</p>
          <p>Get started by:</p>
          <ul>
            <li>Uploading your important documents</li>
            <li>Setting up your emergency contacts</li>
            <li>Creating your digital will</li>
          </ul>
          <a href="${data?.loginUrl}" class="button">Get Started</a>
        `;
        break;

      case EmailTemplate.PAYMENT_FAILED:
        content = `
          <h2>Payment Failed</h2>
          <div class="alert">
            <p><strong>Action Required:</strong> Your payment of ${data?.currency} ${data?.amount / 100} could not be processed.</p>
          </div>
          <p>Hi ${data?.customerName || 'there'},</p>
          <p>We were unable to process your recent payment. To avoid any interruption to your service, please update your payment method.</p>
          ${data?.retryDate ? `<p>We'll automatically retry the payment on ${data.retryDate}.</p>` : ''}
          <a href="${data?.updatePaymentUrl}" class="button">Update Payment Method</a>
          <p>If you have any questions, please don't hesitate to contact our support team.</p>
        `;
        break;

      case EmailTemplate.SUBSCRIPTION_CANCELED:
        content = `
          <h2>Subscription Canceled</h2>
          <p>Hi ${data?.customerName || 'there'},</p>
          <p>Your subscription has been canceled and will end on <strong>${data?.endDate}</strong>.</p>
          <p>You'll continue to have access to all features until this date. After that, your account will be downgraded to the free tier.</p>
          <p>We're sorry to see you go! If you change your mind, you can reactivate your subscription at any time.</p>
          <a href="${data?.reactivateUrl}" class="button">Reactivate Subscription</a>
        `;
        break;

      case EmailTemplate.CRITICAL_ERROR_ALERT:
        content = `
          <h2 style="color: #dc2626;">Critical Error Alert</h2>
          <div class="alert">
            <p><strong>Environment:</strong> ${data?.environment}</p>
            <p><strong>Timestamp:</strong> ${data?.timestamp}</p>
          </div>
          <h3>Error Details:</h3>
          <pre style="background: #f1f5f9; padding: 15px; border-radius: 6px; overflow-x: auto;">
${data?.error}
          </pre>
          <h3>Context:</h3>
          <pre style="background: #f1f5f9; padding: 15px; border-radius: 6px; overflow-x: auto;">
${JSON.stringify(data?.context, null, 2)}
          </pre>
          <p>Please investigate this error immediately.</p>
        `;
        break;

      case EmailTemplate.EMERGENCY_ACCESS_GRANTED:
        content = `
          <h2>Emergency Access Granted</h2>
          <p>Hi ${data?.name || 'there'},</p>
          <p>You have been granted emergency access to ${data?.granterName}'s LegacyGuard account.</p>
          <p>This access was triggered according to the emergency protocol they set up.</p>
          <a href="${data?.accessUrl}" class="button">Access Account</a>
          <p>Please use this access responsibly and in accordance with their wishes.</p>
        `;
        break;

      case EmailTemplate.DOCUMENT_SHARED:
        content = `
          <h2>Document Shared With You</h2>
          <p>Hi ${data?.recipientName || 'there'},</p>
          <p>${data?.senderName} has shared a document with you on LegacyGuard.</p>
          <p><strong>Document:</strong> ${data?.documentName}</p>
          ${data?.message ? `<p><strong>Message:</strong> ${data.message}</p>` : ''}
          ${data?.expiresAt ? `<p><em>This link expires on ${data.expiresAt}</em></p>` : ''}
          <a href="${data?.viewUrl}" class="button">View Document</a>
        `;
        break;

      case EmailTemplate.REMINDER:
        content = `
          <h2>Reminder: ${data?.title}</h2>
          <p>Hi ${data?.name || 'there'},</p>
          <p>${data?.message}</p>
          ${data?.actionUrl ? `<a href="${data.actionUrl}" class="button">${data?.actionText || 'Take Action'}</a>` : ''}
        `;
        break;

      case EmailTemplate.WILL_UPDATE_AVAILABLE:
        content = `
          <h2>Will Update Available</h2>
          <p>Hi ${data?.name || 'there'},</p>
          <p>Based on recent changes to your profile, we recommend updating your will to ensure it reflects your current wishes.</p>
          <h3>Changes Detected:</h3>
          <ul>
            ${data?.changes?.map((change: string) => `<li>${change}</li>`).join('') || ''}
          </ul>
          <a href="${data?.updateUrl}" class="button">Review & Update Will</a>
        `;
        break;

      default:
        content = `<p>${data?.message || 'No content available for this template.'}</p>`;
    }

    return layout(content);
  }

  /**
   * Send batch emails (for notifications, reminders, etc.)
   */
  async sendBatch(emails: EmailOptions[]): Promise<EmailResult[]> {
    const results = await Promise.all(emails.map(email => this.send(email)));
    
    const failed = results.filter(r => !r.success);
    if (failed.length > 0) {
      logger.warn('Some batch emails failed', {
        action: 'batch_email_partial_failure',
        metadata: {
          total: emails.length,
          failed: failed.length,
        },
      });
    }

    return results;
  }

  /**
   * Verify email configuration
   */
  async verifyConfiguration(): Promise<boolean> {
    if (!process.env.RESEND_API_KEY) {
      logger.error('Resend API key not configured');
      return false;
    }

    try {
      // Send a test email to verify configuration
      const result = await this.send({
        to: ALERT_EMAIL,
        subject: 'Email Configuration Test',
        template: EmailTemplate.CRITICAL_ERROR_ALERT,
        data: {
          error: 'This is a test email to verify Resend configuration',
          context: { test: true },
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV,
        },
      });

      return result.success;
    } catch (error) {
      logger.error('Failed to verify email configuration', { metadata: { error } });
      return false;
    }
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance();

// Export convenience functions
export const sendEmail = (options: EmailOptions) => emailService.send(options);
export const sendCriticalAlert = (error: string, context: Record<string, any>) => 
  emailService.sendCriticalAlert(error, context);
export const sendPaymentFailedEmail = (email: string, data: any) => 
  emailService.sendPaymentFailedEmail(email, data);
export const sendWelcomeEmail = (email: string, data: any) => 
  emailService.sendWelcomeEmail(email, data);

export default emailService;