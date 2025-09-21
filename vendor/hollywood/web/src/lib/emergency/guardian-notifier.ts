
import { createClient } from '@supabase/supabase-js';
import type {
  EmergencyActivation,
  EmergencyPriority,
  GuardianNotification,
} from '@/types/emergency';
import type { Guardian } from '@/types/guardian';

interface EmailTemplateData {
  activationReason: string;
  emergencyInstructions: string[];
  expiresAt: string;
  guardianName: string;
  userName: string;
  verificationUrl: string;
}

// Unused: interface _NotificationChannel {
//   config?: Record<string, any>;
//   enabled: boolean;
//   type: 'email' | 'push' | 'sms';
// }

export class GuardianNotificationService {
  private supabaseUrl: string;
  private supabaseServiceKey: string;
  private baseUrl: string;
  private ___emailService: any; // This would be configured based on your email provider
  private ___smsService: any; // This would be configured based on your SMS provider

  constructor(
    supabaseUrl: string,
    supabaseServiceKey: string,
    baseUrl: string,
    emailConfig?: any,
    smsConfig?: any
  ) {
    this.supabaseUrl = supabaseUrl;
    this.supabaseServiceKey = supabaseServiceKey;
    this.baseUrl = baseUrl;
    this.___emailService = emailConfig;
    this.___smsService = smsConfig;
  }

  private getServiceClient() {
    return createClient(this.supabaseUrl, this.supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  async sendActivationNotification(
    activation: EmergencyActivation,
    guardian: Guardian,
    userName: string
  ): Promise<{ error?: string; success: boolean }> {
    const supabase = this.getServiceClient();

    try {
      // Create verification URL
      const verificationUrl = `${this.baseUrl}/emergency/verify/${activation.verification_token}`;

      // Prepare email template data
      const templateData: EmailTemplateData = {
        guardianName: guardian.name,
        userName: userName,
        activationReason: this.getActivationReasonText(activation.trigger_type),
        verificationUrl,
        expiresAt: new Date(activation.token_expires_at).toLocaleString(),
        emergencyInstructions: await this.getEmergencyInstructions(
          activation.user_id
        ),
      };

      // Create notification record
      const notification: Partial<GuardianNotification> = {
        guardian_id: guardian.id,
        user_id: activation.user_id,
        notification_type: 'activation_request',
        title: 'Emergency Activation Request - Action Required',
        message: this.generateNotificationMessage(templateData),
        action_required: true,
        action_url: verificationUrl,
        verification_token: activation.verification_token,
        priority: this.getPriorityFromTriggerType(activation.trigger_type),
        delivery_method: 'email',
        expires_at: activation.token_expires_at,
      };

      // Insert notification into database
      const { data: notificationRecord, error: notificationError } =
        await supabase
          .from('guardian_notifications')
          .insert(notification)
          .select()
          .single();

      if (notificationError) {
        throw new Error(
          `Failed to create notification record: ${notificationError.message}`
        );
      }

      // Send email notification
      const emailResult = await this.sendEmailNotification(
        guardian.email,
        templateData,
        activation.trigger_type
      );

      if (!emailResult.success) {
        // Update notification with error status
        await supabase
          .from('guardian_notifications')
          .update({
            delivery_error: emailResult.error,
            attempted_at: new Date().toISOString(),
          })
          .eq('id', notificationRecord.id);

        return { success: false, error: emailResult.error };
      }

      // Update notification with successful delivery
      await supabase
        .from('guardian_notifications')
        .update({
          sent_at: new Date().toISOString(),
          delivery_status: 'sent',
        })
        .eq('id', notificationRecord.id);

      // Send SMS if phone number is available and activation is urgent
      if (guardian.phone && this.isPriorityUrgent(activation.trigger_type)) {
        await this.sendSMSNotification(guardian.phone, templateData);
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending activation notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async sendReminderNotification(
    activationId: string,
    reminderType: 'final_warning' | 'first_reminder' | 'urgent_reminder'
  ): Promise<{
    errors: string[];
    notificationsSent: number;
    success: boolean;
  }> {
    const supabase = this.getServiceClient();
    const errors: string[] = [];
    let notificationsSent = 0;

    try {
      // Get activation details
      const { data: activation } = await supabase
        .from('family_shield_activation_log')
        .select(
          `
          *,
          guardians!inner (*)
        `
        )
        .eq('id', activationId)
        .eq('status', 'pending')
        .single();

      if (!activation) {
        return {
          success: false,
          notificationsSent: 0,
          errors: ['Activation not found or not pending'],
        };
      }

      // Get user info
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', activation.user_id)
        .single();

      const userName = profile?.full_name || 'User';

      // Send reminders to all guardians who haven't responded
      const { data: unrespondedNotifications } = await supabase
        .from('guardian_notifications')
        .select(
          `
          *,
          guardians!inner (*)
        `
        )
        .eq('user_id', activation.user_id)
        .eq('verification_token', activation.verification_token)
        .is('responded_at', null);

      if (!unrespondedNotifications || unrespondedNotifications.length === 0) {
        return { success: true, notificationsSent: 0, errors: [] };
      }

      // Send reminder to each unresponded guardian
      for (const notification of unrespondedNotifications) {
        try {
          const guardian = notification.guardians;
          const reminderMessage = this.generateReminderMessage(reminderType, {
            guardianName: guardian.name,
            userName,
            activationReason: this.getActivationReasonText(
              activation.trigger_type
            ),
            verificationUrl: `${this.baseUrl}/emergency/verify/${activation.verification_token}`,
            expiresAt: new Date(activation.token_expires_at).toLocaleString(),
            emergencyInstructions: await this.getEmergencyInstructions(
              activation.user_id
            ),
          });

          const emailResult = await this.sendEmailNotification(
            guardian.email,
            {
              guardianName: guardian.name,
              userName,
              activationReason: this.getActivationReasonText(
                activation.trigger_type
              ),
              verificationUrl: `${this.baseUrl}/emergency/verify/${activation.verification_token}`,
              expiresAt: new Date(activation.token_expires_at).toLocaleString(),
              emergencyInstructions: await this.getEmergencyInstructions(
                activation.user_id
              ),
            },
            activation.trigger_type,
            reminderType
          );

          if (emailResult.success) {
            notificationsSent++;

            // Create new notification record for the reminder
            await (supabase as any).from('guardian_notifications').insert({
              guardian_id: guardian.id,
              user_id: activation.user_id,
              notification_type: 'verification_needed',
              title: `Reminder: Emergency Activation Request (${reminderType.replace('_', ' ').toUpperCase()})`,
              message: reminderMessage,
              action_required: true,
              action_url: `${this.baseUrl}/emergency/verify/${activation.verification_token}`,
              verification_token: activation.verification_token,
              priority: reminderType === 'final_warning' ? 'urgent' : 'high',
              delivery_method: 'email',
              sent_at: new Date().toISOString(),
              expires_at: activation.token_expires_at,
            });
          } else {
            errors.push(
              `Failed to send to ${guardian.email}: ${emailResult.error}`
            );
          }
        } catch (error) {
          errors.push(
            `Error processing guardian ${notification.guardian_id}: ${error}`
          );
        }
      }

      return {
        success: errors.length === 0,
        notificationsSent,
        errors,
      };
    } catch (error) {
      console.error('Error sending reminder notifications:', error);
      return {
        success: false,
        notificationsSent: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  private async sendEmailNotification(
    email: string,
    templateData: EmailTemplateData,
    _triggerType: string,
    reminderType?: string
  ): Promise<{ error?: string; success: boolean }> {
    try {
      // This would integrate with your email service (SendGrid, AWS SES, etc.)
      // For now, this is a placeholder implementation

      const subject = reminderType
        ? `REMINDER: Emergency Activation Request - ${templateData.userName}`
        : `Emergency Activation Request - ${templateData.userName}`;

  // const __emailBody = this.generateEmailTemplate( // Unused
      // templateData,
      // triggerType,
      // reminderType
      // ); // Unused

      // Placeholder for actual email sending
      // await this._emailService.send({
      //   to: email,
      //   subject,
      //   html: emailBody,
      // });

      console.warn(`Email notification sent to ${email}:`, subject);

      return { success: true };
    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email',
      };
    }
  }

  private async sendSMSNotification(
    phoneNumber: string,
    templateData: EmailTemplateData
  ): Promise<{ error?: string; success: boolean }> {
    try {
      const message = `URGENT: Emergency activation request for ${templateData.userName}. Please check your email and respond within ${templateData.expiresAt}. Visit: ${templateData.verificationUrl}`;

      // Placeholder for actual SMS sending
      // await this._smsService.send({
      //   to: phoneNumber,
      //   message,
      // });

      console.warn(`SMS notification sent to ${phoneNumber}:`, message);

      return { success: true };
    } catch (error) {
      console.error('Error sending SMS:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send SMS',
      };
    }
  }

  private __generateEmailTemplate(
    data: EmailTemplateData,
    _triggerType: string,
    reminderType?: string
  ): string {
    const reminderText = reminderType
      ? `<div style="background: #fee2e2; padding: 16px; margin: 16px 0; border-radius: 8px; color: #991b1b;">
          <strong>REMINDER:</strong> This is a ${reminderType.replace('_', ' ')} regarding the emergency activation request below.
         </div>`
      : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Emergency Activation Request</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
          .footer { background: #374151; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
          .btn { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0; }
          .instructions { background: #fef3c7; padding: 16px; margin: 16px 0; border-left: 4px solid #f59e0b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 Emergency Activation Request</h1>
            <p>Immediate Action Required</p>
          </div>

          ${reminderText}

          <div class="content">
            <h2>Hello ${data.guardianName},</h2>

            <p>This is an urgent notification regarding <strong>${data.userName}</strong>.</p>

            <p><strong>Activation Reason:</strong> ${data.activationReason}</p>

            <p>As a designated emergency guardian, your immediate verification is required to activate the emergency protocol.</p>

            <div style="text-align: center; margin: 24px 0;">
              <a href="${data.verificationUrl}" class="btn">VERIFY EMERGENCY ACTIVATION</a>
            </div>

            <p><strong>⏰ This request expires on:</strong> ${data.expiresAt}</p>

            <div class="instructions">
              <h3>Emergency Instructions:</h3>
              <ul>
                ${data.emergencyInstructions.map(instruction => `<li>${instruction}</li>`).join('')}
              </ul>
            </div>

            <p><strong>Important:</strong></p>
            <ul>
              <li>Click the verification link above to review the emergency activation request</li>
              <li>You will be able to confirm or reject the activation</li>
              <li>If multiple guardians are configured, consensus may be required</li>
              <li>This is a secure, time-limited link that expires automatically</li>
            </ul>
          </div>

          <div class="footer">
            <p>LegacyGuard Emergency Protocol System</p>
            <p><small>This is an automated message. Do not reply to this email.</small></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateNotificationMessage(data: EmailTemplateData): string {
    return `Emergency activation requested for ${data.userName}. Reason: ${data.activationReason}. Your verification is required by ${data.expiresAt}. Please check your email for detailed instructions.`;
  }

  private generateReminderMessage(
    reminderType: string,
    data: EmailTemplateData
  ): string {
    const urgencyText =
      {
        first_reminder: 'REMINDER',
        urgent_reminder: 'URGENT REMINDER',
        final_warning: 'FINAL WARNING',
      }[reminderType] || 'REMINDER';

    return `${urgencyText}: Emergency activation for ${data.userName} still pending your verification. This request expires ${data.expiresAt}. Please respond immediately.`;
  }

  private getActivationReasonText(triggerType: string): string {
    const reasons: Record<string, string> = {
      inactivity_detected: 'Extended period of inactivity detected',
      manual_guardian: 'Manual activation requested by guardian',
      admin_override: 'Administrative emergency activation',
      health_check_failure: 'Multiple missed health check responses',
    };
    return reasons[triggerType] || 'Emergency activation requested';
  }

  private getPriorityFromTriggerType(triggerType: string): EmergencyPriority {
    const priorityMap: Record<string, EmergencyPriority> = {
      inactivity_detected: 'high',
      manual_guardian: 'urgent',
      admin_override: 'urgent',
      health_check_failure: 'medium',
    };
    return priorityMap[triggerType] || 'medium';
  }

  private isPriorityUrgent(triggerType: string): boolean {
    return this.getPriorityFromTriggerType(triggerType) === 'urgent';
  }

  private async getEmergencyInstructions(userId: string): Promise<string[]> {
    const supabase = this.getServiceClient();

    // Get user's emergency guidance entries
    const { data: guidanceEntries } = await supabase
      .from('family_guidance_entries')
      .select('title, content')
      .eq('user_id', userId)
      .eq('entry_type', 'emergency_procedure')
      .eq('is_completed', true)
      .order('priority', { ascending: true })
      .limit(5);

    const defaultInstructions = [
      'Review and verify the emergency activation request',
      'Contact other guardians to coordinate response',
      'Follow established emergency protocols',
      'Document all actions taken',
    ];

    if (!guidanceEntries || guidanceEntries.length === 0) {
      return defaultInstructions;
    }

    return guidanceEntries
      .map(entry => entry.title)
      .concat(defaultInstructions);
  }

  async markNotificationAsRead(
    notificationId: string,
    guardianId: string
  ): Promise<{ error?: string; success: boolean }> {
    const supabase = this.getServiceClient();

    try {
      const { error } = await supabase
        .from('guardian_notifications')
        .update({
          read_at: new Date().toISOString(),
        })
        .eq('id', notificationId)
        .eq('guardian_id', guardianId);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async recordGuardianResponse(
    verificationToken: string,
    guardianId: string,
    response: 'confirmed' | 'rejected',
    notes?: string
  ): Promise<{ error?: string; success: boolean }> {
    const supabase = this.getServiceClient();

    try {
      // Update the activation log
      const { error: activationError } = await supabase
        .from('family_shield_activation_log')
        .update({
          status: response,
          confirmed_at: new Date().toISOString(),
          notes: notes || null,
        })
        .eq('verification_token', verificationToken)
        .eq('guardian_id', guardianId);

      if (activationError) {
        throw activationError;
      }

      // Update related notifications
      const { error: notificationError } = await supabase
        .from('guardian_notifications')
        .update({
          responded_at: new Date().toISOString(),
        })
        .eq('verification_token', verificationToken)
        .eq('guardian_id', guardianId);

      if (notificationError) {
        throw notificationError;
      }

      return { success: true };
    } catch (error) {
      console.error('Error recording guardian response:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export default GuardianNotificationService;
