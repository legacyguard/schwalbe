
/**
 * Email Notification Service for Professional Reviews
 * Handles email notifications for review requests, assignments, and completions
 */

import type {
  DocumentReview,
  ProfessionalReviewer,
  ReviewRequest,
  ReviewResult,
} from '@/types/professional';

export interface EmailTemplate {
  htmlBody: string;
  subject: string;
  textBody: string;
}

export interface EmailNotification {
  bcc?: string[];
  cc?: string[];
  data: Record<string, any>;
  template: EmailTemplate;
  to: string[];
}

export class ProfessionalEmailNotificationService {
  private ___apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = 'https://api.legacyguard.com') {
    if (!apiKey || apiKey.trim().length === 0) {
      throw new Error('API key is required for EmailNotificationService');
    }
    this.___apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Send email notification to professional reviewer about new review request
   */
  async notifyReviewerNewRequest(
    reviewer: ProfessionalReviewer,
    request: ReviewRequest,
    documentName: string
  ): Promise<void> {
    const template = this.generateNewRequestTemplate(
      reviewer,
      request,
      documentName
    );

    const notification: EmailNotification = {
      to: [reviewer.email],
      template,
      data: {
        reviewerId: reviewer.id,
        requestId: request.id,
        reviewerName: reviewer.fullName,
        documentName,
        reviewType: request.review_type,
        priority: request.priority,
        priorityClass:
          request.priority === 'urgent'
            ? 'priority-urgent'
            : request.priority === 'high'
              ? 'priority-high'
              : '',
        estimatedFee: this.calculateEstimatedFee(request),
        dueDate: request.deadline
          ? new Date(request.deadline).toLocaleDateString()
          : 'Flexible',
        responseDeadline: new Date(
          Date.now() + 48 * 60 * 60 * 1000
        ).toLocaleString(),
        familyMembersCount: 'multiple',
      },
    };

    await this.sendEmail(notification);
  }

  /**
   * Send confirmation email to client when review is requested
   */
  async notifyClientReviewRequested(
    clientEmail: string,
    clientName: string,
    request: ReviewRequest,
    documentName: string
  ): Promise<void> {
    const template = this.generateClientConfirmationTemplate(
      clientName,
      request,
      documentName
    );

    const notification: EmailNotification = {
      to: [clientEmail],
      template,
      data: {
        clientName,
        documentName,
        reviewType: request.review_type,
        estimatedCost: this.calculateEstimatedFee(request),
        expectedTimeframe: this.getExpectedTimeframe(request.review_type),
        requestId: request.id,
        supportEmail: 'support@legacyguard.com',
      },
    };

    await this.sendEmail(notification);
  }

  /**
   * Send notification when review is assigned to attorney
   */
  async notifyReviewAssigned(
    reviewer: ProfessionalReviewer,
    review: DocumentReview,
    documentName: string,
    clientName: string
  ): Promise<void> {
    const template = this.generateAssignmentTemplate(
      reviewer,
      review,
      documentName,
      clientName
    );

    const notification: EmailNotification = {
      to: [reviewer.email],
      template,
      data: {
        reviewerName: reviewer.fullName,
        clientName,
        documentName,
        reviewType: review.review_type,
        priority: review.priority,
        dueDate: review.due_date
          ? new Date(review.due_date).toLocaleDateString()
          : 'No specific deadline',
        reviewFee: review.review_fee || 0,
        reviewId: review.id,
        dashboardUrl: `${this.baseUrl}/professional/dashboard`,
        documentUrl: `${this.baseUrl}/professional/review/${review.id}`,
      },
    };

    await this.sendEmail(notification);
  }

  /**
   * Send notification to client when review is completed
   */
  async notifyClientReviewCompleted(
    clientEmail: string,
    clientName: string,
    review: DocumentReview,
    result: ReviewResult,
    reviewerName: string,
    documentName: string
  ): Promise<void> {
    const template = this.generateCompletionTemplate(
      clientName,
      review,
      result,
      reviewerName,
      documentName
    );

    const notification: EmailNotification = {
      to: [clientEmail],
      template,
      data: {
        clientName,
        reviewerName,
        documentName,
        overallStatus: result.overall_status,
        trustScoreImpact: result.trust_score_impact,
        recommendationsCount: result.recommendations.length,
        issuesCount: result.issues_found.length,
        reviewUrl: `${this.baseUrl}/reviews/${review.id}`,
        dashboardUrl: `${this.baseUrl}/dashboard`,
      },
    };

    await this.sendEmail(notification);
  }

  /**
   * Send reminder to attorney about pending review
   */
  async sendReviewReminder(
    reviewer: ProfessionalReviewer,
    review: DocumentReview,
    documentName: string,
    daysOverdue: number = 0
  ): Promise<void> {
    const template = this.generateReminderTemplate(
      reviewer,
      review,
      documentName,
      daysOverdue
    );

    const notification: EmailNotification = {
      to: [reviewer.email],
      template,
      data: {
        reviewerName: reviewer.fullName,
        documentName,
        reviewType: review.review_type,
        assignedDate: review.assigned_at
          ? new Date(review.assigned_at).toLocaleDateString()
          : 'Not assigned',
        daysOverdue,
        isOverdue: daysOverdue > 0,
        reviewId: review.id,
        dashboardUrl: `${this.baseUrl}/professional/dashboard`,
      },
    };

    await this.sendEmail(notification);
  }

  private generateNewRequestTemplate(
    reviewer: ProfessionalReviewer,
    request: ReviewRequest,
    documentName: string
  ): EmailTemplate {
    const subject = `New ${request.review_type} Review Request - ${documentName}`;

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Review Request</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #E5E7EB; border-top: none; }
          .footer { background: #F9FAFB; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #E5E7EB; border-top: none; }
          .button { display: inline-block; background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 5px; }
          .button.secondary { background: #6B7280; }
          .info-box { background: #F0F9FF; border-left: 4px solid #3B82F6; padding: 16px; margin: 20px 0; }
          .priority-urgent { background: #FEF2F2; border-left-color: #EF4444; }
          .priority-high { background: #FFFBEB; border-left-color: #F59E0B; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚖️ New Review Request</h1>
            <p>A new document review has been assigned to you</p>
          </div>

          <div class="content">
            <h2>Hello {reviewerName},</h2>

            <p>You have received a new {reviewType} review request for a family protection document.</p>

            <div class="info-box {priorityClass}">
              <h3>📄 Review Details</h3>
              <ul>
                <li><strong>Document:</strong> {documentName}</li>
                <li><strong>Review Type:</strong> {reviewType}</li>
                <li><strong>Priority:</strong> {priority}</li>
                <li><strong>Review Fee:</strong> \${estimatedFee}</li>
                <li><strong>Due Date:</strong> {dueDate}</li>
              </ul>
            </div>

            <div class="info-box">
              <h3>👨‍👩‍👧‍👦 Family Context</h3>
              <p>This review will help protect {familyMembersCount} family members. The client has specifically requested your expertise to ensure their family's legacy is properly secured.</p>
            </div>

            <div class="info-box">
              <h3>⏰ Response Required</h3>
              <p><strong>Please accept or decline this request by {responseDeadline}.</strong></p>
              <p>If you do not respond within 48 hours, this request will be reassigned to another reviewer.</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${this.baseUrl}/professional/review/{requestId}/accept" class="button">Accept Request</a>
              <a href="${this.baseUrl}/professional/review/{requestId}/decline" class="button secondary">Decline Request</a>
            </div>

            <p>If you have any questions or need additional information, please contact our support team.</p>
          </div>

          <div class="footer">
            <p style="margin: 0; color: #6B7280; font-size: 14px;">
              This is an automated message from LegacyGuard Professional Review Network
            </p>
            <p style="margin: 5px 0 0 0; color: #6B7280; font-size: 12px;">
              © 2024 LegacyGuard. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textBody = `
New Review Request - ${documentName}

Hello ${reviewer.fullName},

You have received a new ${request.review_type} review request for a family protection document.

Review Details:
- Document: ${documentName}
- Review Type: ${request.review_type}
- Priority: ${request.priority}
- Estimated Fee: $${this.calculateEstimatedFee(request)}
- Deadline: ${request.deadline ? new Date(request.deadline).toLocaleDateString() : 'Flexible'}

Please accept or decline this request within 48 hours.

To respond, visit: ${this.baseUrl}/professional/review/${request.id}

Best regards,
LegacyGuard Professional Review Network
    `;

    return { subject, htmlBody, textBody };
  }

  private generateClientConfirmationTemplate(
    clientName: string,
    request: ReviewRequest,
    documentName: string
  ): EmailTemplate {
    const subject = `Your Professional Review Request Has Been Submitted`;

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Review Request Confirmation</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #E5E7EB; border-top: none; }
          .footer { background: #F9FAFB; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #E5E7EB; border-top: none; }
          .info-box { background: #F0FDF4; border-left: 4px solid #10B981; padding: 16px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Review Request Submitted</h1>
            <p>Your document is being matched with the perfect legal professional</p>
          </div>

          <div class="content">
            <h2>Hello {clientName},</h2>

            <p>Thank you for trusting LegacyGuard with your {documentName} review. We've received your request and are now matching you with the most qualified legal professional.</p>

            <div class="info-box">
              <h3>📋 Request Summary</h3>
              <ul>
                <li><strong>Document:</strong> {documentName}</li>
                <li><strong>Review Type:</strong> {reviewType}</li>
                <li><strong>Estimated Cost:</strong> {estimatedCost}</li>
                <li><strong>Expected Timeframe:</strong> {expectedTimeframe}</li>
                <li><strong>Request ID:</strong> {requestId}</li>
              </ul>
            </div>

            <div class="info-box">
              <h3>🔄 What Happens Next?</h3>
              <ol>
                <li>We're matching your request with qualified attorneys (24-48 hours)</li>
                <li>Once matched, you'll receive confirmation with reviewer details</li>
                <li>The attorney will review your document and provide detailed feedback</li>
                <li>You'll receive the completed review in your dashboard</li>
              </ol>
            </div>

            <p style="text-align: center; margin: 30px 0;">
              <a href="{dashboardUrl}" style="display: inline-block; background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                Track Your Review
              </a>
            </p>

            <p>If you have any questions, our support team is here to help at {supportEmail}.</p>
          </div>

          <div class="footer">
            <p style="margin: 0; color: #6B7280; font-size: 14px;">
              You're receiving this because you requested a professional review
            </p>
            <p style="margin: 5px 0 0 0; color: #6B7280; font-size: 12px;">
              © 2024 LegacyGuard. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textBody = `
Your Professional Review Request Has Been Submitted

Hello ${clientName},

Thank you for trusting LegacyGuard with your ${documentName} review. We've received your request and are now matching you with the most qualified legal professional.

Request Summary:
- Document: ${documentName}
- Review Type: ${request.review_type}
- Estimated Cost: ${this.calculateEstimatedFee(request)}
- Expected Timeframe: ${this.getExpectedTimeframe(request.review_type)}
- Request ID: ${request.id}

What Happens Next:
1. We're matching your request with qualified attorneys (24-48 hours)
2. Once matched, you'll receive confirmation with reviewer details
3. The attorney will review your document and provide detailed feedback
4. You'll receive the completed review in your dashboard

Track your review at: ${this.baseUrl}/dashboard

If you have any questions, contact us at support@legacyguard.com

Best regards,
The LegacyGuard Team
    `;

    return { subject, htmlBody, textBody };
  }

  private generateAssignmentTemplate(
    reviewer: ProfessionalReviewer,
    review: DocumentReview,
    documentName: string,
    clientName: string
  ): EmailTemplate {
    const subject = `Review Assignment Confirmed - ${documentName}`;

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Review Assignment</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366F1, #4F46E5); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #E5E7EB; border-top: none; }
          .footer { background: #F9FAFB; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #E5E7EB; border-top: none; }
          .info-box { background: #F5F3FF; border-left: 4px solid #6366F1; padding: 16px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📝 Review Assignment Confirmed</h1>
            <p>You have been assigned to review a document</p>
          </div>

          <div class="content">
            <h2>Hello {reviewerName},</h2>

            <p>Thank you for accepting this review request. The document is now available for your review.</p>

            <div class="info-box">
              <h3>📄 Assignment Details</h3>
              <ul>
                <li><strong>Client:</strong> {clientName}</li>
                <li><strong>Document:</strong> {documentName}</li>
                <li><strong>Review Type:</strong> {reviewType}</li>
                <li><strong>Priority:</strong> {priority}</li>
                <li><strong>Due Date:</strong> {dueDate}</li>
                <li><strong>Review Fee:</strong> \${reviewFee}</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="{documentUrl}" style="display: inline-block; background: #6366F1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                Start Review
              </a>
            </div>

            <p>The document is available in your professional dashboard. Please complete the review by the due date.</p>

            <p>Access your dashboard: <a href="{dashboardUrl}">{dashboardUrl}</a></p>
          </div>

          <div class="footer">
            <p style="margin: 0; color: #6B7280; font-size: 14px;">
              LegacyGuard Professional Review Network
            </p>
            <p style="margin: 5px 0 0 0; color: #6B7280; font-size: 12px;">
              © 2024 LegacyGuard. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textBody = `
Review Assignment Confirmed - ${documentName}

Hello ${reviewer.full_name},

Thank you for accepting this review request. The document is now available for your review.

Assignment Details:
- Client: ${clientName}
- Document: ${documentName}
- Review Type: ${review.review_type}
- Priority: ${review.priority}
- Due Date: ${review.due_date ? new Date(review.due_date).toLocaleDateString() : 'No specific deadline'}
- Review Fee: $${review.review_fee || 0}

Start your review at: ${this.baseUrl}/professional/review/${review.id}

The document is available in your professional dashboard. Please complete the review by the due date.

Best regards,
LegacyGuard Professional Review Network
    `;

    return { subject, htmlBody, textBody };
  }

  private generateCompletionTemplate(
    clientName: string,
    review: DocumentReview,
    result: ReviewResult,
    reviewerName: string,
    documentName: string
  ): EmailTemplate {
    const subject = `Your Professional Review is Complete - ${documentName}`;

    const statusEmoji =
      result.overall_status === 'approved'
        ? '✅'
        : result.overall_status === 'requires_revision'
          ? '⚠️'
          : '❌';

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Review Complete</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #E5E7EB; border-top: none; }
          .footer { background: #F9FAFB; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #E5E7EB; border-top: none; }
          .info-box { background: #F0FDF4; border-left: 4px solid #10B981; padding: 16px; margin: 20px 0; }
          .warning-box { background: #FFFBEB; border-left: 4px solid #F59E0B; padding: 16px; margin: 20px 0; }
          .error-box { background: #FEF2F2; border-left: 4px solid #EF4444; padding: 16px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${statusEmoji} Your Review is Complete!</h1>
            <p>Your document has been professionally reviewed</p>
          </div>

          <div class="content">
            <h2>Hello {clientName},</h2>

            <p>Good news! {reviewerName} has completed the professional review of your {documentName}.</p>

            <div class="${result.overall_status === 'approved' ? 'info-box' : result.overall_status === 'requires_revision' ? 'warning-box' : 'error-box'}">
              <h3>📊 Review Summary</h3>
              <ul>
                <li><strong>Overall Status:</strong> {overallStatus}</li>
                <li><strong>Trust Score Impact:</strong> {trustScoreImpact}</li>
                <li><strong>Recommendations:</strong> {recommendationsCount}</li>
                <li><strong>Issues Found:</strong> {issuesCount}</li>
              </ul>
            </div>

            ${
              result.overall_status === 'requires_revision'
                ? `
            <div class="warning-box">
              <h3>⚠️ Action Required</h3>
              <p>Your document needs some revisions. The reviewer has provided specific recommendations to strengthen your document.</p>
            </div>
            `
                : ''
            }

            <div style="text-align: center; margin: 30px 0;">
              <a href="{reviewUrl}" style="display: inline-block; background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                View Full Review
              </a>
            </div>

            <p>The complete review with detailed feedback and recommendations is now available in your dashboard.</p>
          </div>

          <div class="footer">
            <p style="margin: 0; color: #6B7280; font-size: 14px;">
              You're receiving this because you requested a professional review
            </p>
            <p style="margin: 5px 0 0 0; color: #6B7280; font-size: 12px;">
              © 2024 LegacyGuard. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textBody = `
Your Professional Review is Complete - ${documentName}

Hello ${clientName},

Good news! ${reviewerName} has completed the professional review of your ${documentName}.

Review Summary:
- Overall Status: ${result.overall_status}
- Trust Score Impact: ${result.trust_score_impact}
- Recommendations: ${result.recommendations.length}
- Issues Found: ${result.issues_found.length}

${
  result.overall_status === 'requires_revision'
    ? 'Your document needs some revisions. The reviewer has provided specific recommendations to strengthen your document.\n\n'
    : ''
}

View the full review at: ${this.baseUrl}/reviews/${review.id}

The complete review with detailed feedback and recommendations is now available in your dashboard.

Best regards,
The LegacyGuard Team
    `;

    return { subject, htmlBody, textBody };
  }

  private generateReminderTemplate(
    reviewer: ProfessionalReviewer,
    review: DocumentReview,
    documentName: string,
    daysOverdue: number
  ): EmailTemplate {
    const subject =
      daysOverdue > 0
        ? `⚠️ Overdue Review Reminder - ${documentName}`
        : `Reminder: Review Due Soon - ${documentName}`;

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Review Reminder</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${daysOverdue > 0 ? 'linear-gradient(135deg, #EF4444, #DC2626)' : 'linear-gradient(135deg, #F59E0B, #D97706)'}; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #E5E7EB; border-top: none; }
          .footer { background: #F9FAFB; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #E5E7EB; border-top: none; }
          .info-box { background: ${daysOverdue > 0 ? '#FEF2F2' : '#FFFBEB'}; border-left: 4px solid ${daysOverdue > 0 ? '#EF4444' : '#F59E0B'}; padding: 16px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${daysOverdue > 0 ? '⚠️ Review Overdue' : '⏰ Review Due Soon'}</h1>
            <p>${daysOverdue > 0 ? `This review is ${daysOverdue} days overdue` : 'Please complete your review soon'}</p>
          </div>

          <div class="content">
            <h2>Hello {reviewerName},</h2>

            <p>${
              daysOverdue > 0
                ? `This is a reminder that your review for {documentName} is now {daysOverdue} days overdue.`
                : `This is a friendly reminder that you have a pending review for {documentName}.`
            }
            </p>

            <div class="info-box">
              <h3>📄 Review Details</h3>
              <ul>
                <li><strong>Document:</strong> {documentName}</li>
                <li><strong>Review Type:</strong> {reviewType}</li>
                <li><strong>Assigned Date:</strong> {assignedDate}</li>
                ${daysOverdue > 0 ? '<li><strong style="color: #EF4444;">Days Overdue:</strong> {daysOverdue}</li>' : ''}
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="{dashboardUrl}" style="display: inline-block; background: ${daysOverdue > 0 ? '#EF4444' : '#F59E0B'}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                Complete Review Now
              </a>
            </div>

            <p>${
              daysOverdue > 0
                ? 'Please complete this review as soon as possible to avoid reassignment.'
                : 'Please complete this review at your earliest convenience.'
            }</p>
          </div>

          <div class="footer">
            <p style="margin: 0; color: #6B7280; font-size: 14px;">
              LegacyGuard Professional Review Network
            </p>
            <p style="margin: 5px 0 0 0; color: #6B7280; font-size: 12px;">
              © 2024 LegacyGuard. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textBody = `
${daysOverdue > 0 ? 'Overdue Review Reminder' : 'Review Reminder'} - ${documentName}

Hello ${reviewer.full_name},

${
  daysOverdue > 0
    ? `This is a reminder that your review for ${documentName} is now ${daysOverdue} days overdue.`
    : `This is a friendly reminder that you have a pending review for ${documentName}.`
}

Review Details:
- Document: ${documentName}
- Review Type: ${review.review_type}
- Assigned Date: ${review.assigned_at ? new Date(review.assigned_at).toLocaleDateString() : 'Recently'}

Complete your review at: ${this.baseUrl}/professional/dashboard

${
  daysOverdue > 0
    ? 'Please complete this review as soon as possible to avoid reassignment.'
    : 'Please complete this review at your earliest convenience.'
}

Best regards,
LegacyGuard Professional Review Network
    `;

    return { subject, htmlBody, textBody };
  }

  private calculateEstimatedFee(request: ReviewRequest): number {
    // Base fees by review type
    const baseFees: Record<string, number> = {
      basic: 150,
      comprehensive: 300,
      expert: 500,
    };

    let fee = baseFees[request.review_type] ?? baseFees['basic'];

    // Priority multipliers
    if (request.priority === 'urgent') {
      fee *= 1.5;
    } else if (request.priority === 'high') {
      fee *= 1.25;
    }

    // Rush deadline multiplier
    if (request.deadline) {
      const daysUntilDeadline = Math.floor(
        (new Date(request.deadline).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      );

      if (daysUntilDeadline <= 2) {
        fee *= 1.5; // Rush fee for 2 days or less
      } else if (daysUntilDeadline <= 5) {
        fee *= 1.25; // Expedited fee for 5 days or less
      }
    }

    return Math.round(fee);
  }

  private getExpectedTimeframe(reviewType: string): string {
    const timeframes: Record<string, string> = {
      basic: '3-5 business days',
      comprehensive: '5-7 business days',
      expert: '7-10 business days',
    };

    return timeframes[reviewType] || '5-7 business days';
  }

  private async sendEmail(notification: EmailNotification): Promise<void> {
    // This would integrate with your actual email service (SendGrid, AWS SES, etc.)
    // For now, we'll just log the email for development purposes

    console.log('Sending email:', {
      to: notification.to,
      cc: notification.cc,
      bcc: notification.bcc,
      subject: this.interpolateTemplate(
        notification.template.subject,
        notification.data
      ),
      htmlBody: this.interpolateTemplate(
        notification.template.htmlBody,
        notification.data
      ),
      textBody: this.interpolateTemplate(
        notification.template.textBody,
        notification.data
      ),
      data: notification.data,
    });

    // Example integration with SendGrid:
    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(this._apiKey);

    const msg = {
      to: notification.to,
      cc: notification.cc,
      bcc: notification.bcc,
      from: 'noreply@legacyguard.com',
      subject: this.interpolateTemplate(notification.template.subject, notification.data),
      text: this.interpolateTemplate(notification.template.textBody, notification.data),
      html: this.interpolateTemplate(notification.template.htmlBody, notification.data)
    };

    await sgMail.send(msg);
    */
  }

  private interpolateTemplate(
    template: string,
    data: Record<string, any>
  ): string {
    let result = template;

    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{${key}}`, 'g');
      result = result.replace(regex, String(data[key]));
    });

    return result;
  }
}
