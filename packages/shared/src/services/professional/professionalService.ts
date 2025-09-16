/**
 * Professional Network Service
 * Handles attorney applications, verification, and marketplace operations
 */

import { supabase } from '../../supabase/client';

// Temporary implementations until they're properly defined
const cacheInvalidation = {
  invalidateProfessionalReviewCaches: (_reviewId?: string) => {}
};
const professionalReviewCache = {
  get: (_key: string) => null as any,
  set: (_key: string, _value: any) => {},
  invalidate: (_key: string) => {},
};
type Database = any;

// Type definitions from database schema
type ProfessionalReviewer =
  Database['public']['Tables']['professional_reviewers']['Row'];
type ProfessionalReviewerInsert =
  Database['public']['Tables']['professional_reviewers']['Insert'];
type ProfessionalOnboarding =
  Database['public']['Tables']['professional_onboarding']['Row'];
type ProfessionalOnboardingInsert =
  Database['public']['Tables']['professional_onboarding']['Insert'];
type DocumentReview = Database['public']['Tables']['document_reviews']['Row'];
type DocumentReviewInsert =
  Database['public']['Tables']['document_reviews']['Insert'];
type ReviewRequest = Database['public']['Tables']['review_requests']['Row'];
type ReviewRequestInsert =
  Database['public']['Tables']['review_requests']['Insert'];
type ReviewResult = Database['public']['Tables']['review_results']['Row'];
type ReviewResultInsert =
  Database['public']['Tables']['review_results']['Insert'];
type ProfessionalSpecialization =
  Database['public']['Tables']['professional_specializations']['Row'];
type ProfessionalSpecializationInsert =
  Database['public']['Tables']['professional_specializations']['Insert'];
type Consultation = Database['public']['Tables']['consultations']['Row'];

// Type for credentials JSON structure
interface ProfessionalCredentials {
  bar_number?: string;
  email?: string;
  full_name?: string;
  licensed_states?: string[];
  professional_title?: string;
  specializations?: string[];
}

// Type for email data structure
interface EmailData {
  [key: string]: null | string | string[] | undefined;
  applicantName?: string;
  applicationDate?: string;
  applicationId?: string;
  assignmentDate?: string;
  barNumber?: string;
  completionDate?: null | string;
  dashboardUrl?: string;
  documentTitle?: string;
  documentType?: string;
  expectedCompletionDate?: string;
  licensedStates?: string[];
  nextSteps?: string;
  professionalTitle?: string;
  reviewerName?: string;
  reviewId?: string;
  reviewNotes?: string;
  reviewPortalUrl?: string;
  reviewStatus?: string;
  reviewType?: string;
  reviewUrl?: string;
  riskLevel?: string;
  specializations?: string[];
  status?: string;
  statusDisplay?: string;
  statusMessage?: string;
  supportEmail?: string;
  userName?: string;
}

export class ProfessionalService {
  private static instance: ProfessionalService;

  static getInstance(): ProfessionalService {
    if (!ProfessionalService.instance) {
      ProfessionalService.instance = new ProfessionalService();
    }
    return ProfessionalService.instance;
  }

  // Professional Applications
  async submitApplication(
    application: Omit<
      ProfessionalOnboardingInsert,
      'created_at' | 'id' | 'updated_at'
    >
  ): Promise<ProfessionalOnboarding> {
    const { data, error } = await supabase
      .from('professional_onboarding')
      .insert({
        ...application,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Send notification to admin team
    if (data) {
      await this.notifyAdminNewApplication(data);
    }

    return data;
  }

  async getApplication(id: string): Promise<null | ProfessionalOnboarding> {
    const { data, error } = await supabase
      .from('professional_onboarding')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getApplicationByUserId(
    userId: string
  ): Promise<null | ProfessionalOnboarding> {
    const { data, error } = await supabase
      .from('professional_onboarding')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async updateApplicationStatus(
    id: string,
    status: ProfessionalOnboarding['verification_status'],
    reviewNotes?: string
  ): Promise<ProfessionalOnboarding> {
    const updates: Partial<ProfessionalOnboarding> = {
      verification_status: status,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('professional_onboarding')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Send notification to applicant
    await this.notifyApplicantStatusChange(data, reviewNotes);

    return data;
  }

  // Professional Reviewers
  async createReviewerProfile(
    onboarding: ProfessionalOnboarding,
    _userId: string
  ): Promise<ProfessionalReviewer> {
    const credentials = onboarding.credentials as ProfessionalCredentials;

    const reviewer: Omit<
      ProfessionalReviewerInsert,
      'created_at' | 'id' | 'updated_at'
    > = {
      name: credentials?.full_name || 'Unknown',
      credentials: credentials?.professional_title || 'Professional',
      bar_number: credentials?.bar_number || null,
      jurisdiction: credentials?.licensed_states?.[0] || 'Unknown',
      specializations: credentials?.specializations || [],
      rating: 0,
      reviews_completed: 0,
      average_turnaround_hours: 48,
      profile_verified: onboarding.verification_status === 'verified',
      contact_email: credentials?.email || 'unknown@example.com',
    };

    const { data, error } = await supabase
      .from('professional_reviewers')
      .insert({
        ...reviewer,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async getReviewer(id: string): Promise<null | ProfessionalReviewer> {
    const { data, error } = await supabase
      .from('professional_reviewers')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async updateReviewer(
    id: string,
    updates: Partial<ProfessionalReviewer>
  ): Promise<ProfessionalReviewer> {
    const { data, error } = await supabase
      .from('professional_reviewers')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async searchReviewers(filters: {
    jurisdiction?: string;
    ratingMin?: number;
    specializations?: string[];
    verified?: boolean;
  }): Promise<ProfessionalReviewer[]> {
    let query = supabase.from('professional_reviewers').select('*');

    if (filters.specializations?.length) {
      query = query.overlaps('specializations', filters.specializations);
    }

    if (filters.jurisdiction) {
      query = query.eq('jurisdiction', filters.jurisdiction);
    }

    if (filters.ratingMin !== undefined) {
      query = query.gte('rating', filters.ratingMin);
    }

    if (filters.verified !== undefined) {
      query = query.eq('profile_verified', filters.verified);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  }

  // Review Requests and Assignments
  async createReviewRequest(
    request: Omit<ReviewRequestInsert, 'created_at' | 'id' | 'updated_at'>
  ): Promise<ReviewRequest> {
    const { data, error } = await supabase
      .from('review_requests')
      .insert({
        ...request,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async assignReviewRequest(
    requestId: string,
    reviewerId: string
  ): Promise<DocumentReview> {
    // Get the review request
    const { data: request, error: requestError } = await supabase
      .from('review_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (requestError || !request) {
      throw requestError || new Error('Review request not found');
    }

    // Create the document review record
    const review: Omit<
      DocumentReviewInsert,
      'created_at' | 'id' | 'updated_at'
    > = {
      document_id: request.document_id,
      reviewer_id: reviewerId,
      review_type: 'general', // Default to general since review_requests doesn't have review_type
      status: 'pending',
      risk_level: request.priority === 'urgent' ? 'high' : 'medium',
      review_date: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('document_reviews')
      .insert({
        ...review,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Update request status
    await supabase
      .from('review_requests')
      .update({
        status: 'assigned',
        reviewer_id: reviewerId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    return data;
  }

  // Update document review
  async updateDocumentReview(
    reviewId: string,
    status: DocumentReview['status'],
    result?: Partial<ReviewResultInsert>
  ): Promise<DocumentReview> {
    const updates: Partial<DocumentReview> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'completed') {
      updates.completion_date = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('document_reviews')
      .update(updates)
      .eq('id', reviewId)
      .select()
      .single();

    if (error) throw error;

    // Create review result if provided
    if (data && result && status === 'completed') {
      await this.createReviewResult(reviewId, result);
    }

    return data;
  }

  // Professional Network Directory
  async getNetworkDirectory(filters?: {
    jurisdiction?: string;
    rating?: number;
    specialization?: string;
  }): Promise<ProfessionalReviewer[]> {
    let query = supabase
      .from('professional_reviewers')
      .select('*')
      .eq('profile_verified', true);

    if (filters?.specialization) {
      query = query.contains('specializations', [filters.specialization]);
    }

    if (filters?.jurisdiction) {
      query = query.eq('jurisdiction', filters.jurisdiction);
    }

    if (filters?.rating !== undefined) {
      query = query.gte('rating', filters.rating);
    }

    const { data, error } = await query.order('rating', { ascending: false });
    if (error) throw error;

    return (data as any[]) || [];
  }

  // Pricing and Booking
  async getReviewPricing(): Promise<{
    basic: number;
    certified: number;
    comprehensive: number;
  }> {
    const pricing = {
      basic: 150,
      comprehensive: 350,
      certified: 750,
    };

    return pricing;
  }

  async bookConsultation(
    professionalId: string,
    userId: string,
    consultationType: Consultation['consultation_type'],
    scheduledTime: string,
    duration: number = 60
  ): Promise<Consultation> {
    const { data, error } = await supabase
      .from('consultations')
      .insert({
        user_id: userId,
        professional_id: professionalId,
        consultation_type: consultationType,
        scheduled_time: scheduledTime,
        duration_minutes: duration,
        status: 'scheduled',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  // Specializations
  async getSpecializations(): Promise<ProfessionalSpecialization[]> {
    const { data, error } = await supabase
      .from('professional_specializations')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  }

  async createSpecialization(
    specialization: Omit<
      ProfessionalSpecializationInsert,
      'created_at' | 'id' | 'updated_at'
    >
  ): Promise<ProfessionalSpecialization> {
    const { data, error } = await supabase
      .from('professional_specializations')
      .insert({
        ...specialization,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Review Results
  private async createReviewResult(
    reviewId: string,
    result: Partial<ReviewResultInsert>
  ): Promise<ReviewResult> {
    // Ensure required fields are present
    const reviewResult: ReviewResultInsert = {
      review_id: reviewId,
      result_type: result.result_type || 'approval',
      summary: result.summary || 'Review completed',
      detailed_findings: result.detailed_findings || {},
      action_items: result.action_items || {},
      legal_references: result.legal_references || null,
      next_steps: result.next_steps || null,
      validity_period: result.validity_period || null,
    };

    const { data, error } = await supabase
      .from('review_results')
      .insert(reviewResult)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Caching methods for performance optimization
  async getCachedReviews(userId: string): Promise<DocumentReview[]> {
    const cacheKey = `document_reviews_${userId}`;
    const cached = professionalReviewCache.get(cacheKey);

    if (Array.isArray(cached)) {
      return cached;
    }

    const { data, error } = await supabase
      .from('document_reviews')
      .select(
        `
        *,
        professional_reviewers(
          id,
          name,
          credentials,
          specializations
        ),
        review_results(*)
      `
      )
      .eq('reviewer_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    professionalReviewCache.set(cacheKey, data || []);
    return data || [];
  }

  async getCachedReviewById(reviewId: string): Promise<DocumentReview | null> {
    const cacheKey = `document_review_${reviewId}`;
    const cached = professionalReviewCache.get(cacheKey);

    if (
      cached &&
      typeof cached === 'object' &&
      cached !== null &&
      'id' in cached
    ) {
      return cached as DocumentReview;
    }

    const { data, error } = await supabase
      .from('document_reviews')
      .select(
        `
        *,
        professional_reviewers(
          id,
          name,
          credentials,
          specializations
        ),
        review_results(*)
      `
      )
      .eq('id', reviewId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (data) {
      professionalReviewCache.set(cacheKey, data);
    }

    return data || null;
  }

  async getCachedProfessionalReviewers(): Promise<ProfessionalReviewer[]> {
    const cacheKey = 'active_professional_reviewers';
    const cached = professionalReviewCache.get(cacheKey);

    if (Array.isArray(cached)) {
      return cached as ProfessionalReviewer[];
    }

    const { data, error } = await supabase
      .from('professional_reviewers')
      .select(
        `
        *,
        professional_specializations(*)
      `
      )
      .eq('profile_verified', true)
      .order('rating', { ascending: false });

    if (error) throw error;

    professionalReviewCache.set(cacheKey, data || []);
    return data || [];
  }

  // Cache invalidation methods
  async invalidateUserReviewCache(userId: string): Promise<void> {
    cacheInvalidation.invalidateProfessionalReviewCaches();
    professionalReviewCache.invalidate(`document_reviews_${userId}`);
    professionalReviewCache.invalidate(`professional_reviews_${userId}`);
  }

  async invalidateReviewCache(reviewId: string): Promise<void> {
    professionalReviewCache.invalidate(`document_review_${reviewId}`);
    // Also invalidate any user-specific caches that might contain this review
    cacheInvalidation.invalidateProfessionalReviewCaches(reviewId);
  }

  async refreshProfessionalReviewersCache(): Promise<void> {
    professionalReviewCache.invalidate('active_professional_reviewers');
    // Pre-warm the cache
    await this.getCachedProfessionalReviewers();
  }

  // Email notification system with actual API integration
  private async notifyAdminNewApplication(
    application: ProfessionalOnboarding
  ): Promise<void> {
    try {
      const credentials = application.credentials as ProfessionalCredentials;

      const emailData: EmailData = {
        to: 'admin@schwalbe.app',
        subject: `New Professional Application - ${credentials?.full_name || 'Unknown'}`,
        template: 'admin_new_application',
        applicantName: credentials?.full_name || 'Unknown',
        applicationId: application.id,
        professionalTitle: credentials?.professional_title || 'Unknown',
        barNumber: credentials?.bar_number || 'N/A',
        licensedStates: credentials?.licensed_states || [],
        specializations: credentials?.specializations || [],
        applicationDate: new Date().toLocaleDateString(),
        reviewUrl: `${window.location.origin}/admin/applications/${application.id}`,
      };

      await this.sendEmail({
        to: 'admin@schwalbe.app',
        subject: `New Professional Application - ${credentials?.full_name || 'Unknown'}`,
        template: 'admin_new_application',
        data: emailData,
      });

      // Log notification in database for tracking
      await this.logNotification({
        type: 'admin_application',
        recipient: 'admin@schwalbe.app',
        applicationId: application.id,
        status: 'sent',
      });
    } catch (error) {
      console.error('Failed to send admin notification:', error);
      await this.logNotification({
        type: 'admin_application',
        recipient: 'admin@schwalbe.app',
        applicationId: application.id,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private async notifyApplicantStatusChange(
    application: ProfessionalOnboarding,
    reviewNotes?: string
  ): Promise<void> {
    try {
      const credentials = application.credentials as ProfessionalCredentials;

      const templateMap = {
        pending: 'application_received',
        under_review: 'application_under_review',
        verified: 'application_approved',
        rejected: 'application_rejected',
      };

      const emailData: EmailData = {
        to: credentials?.email || 'unknown@example.com',
        subject: `Professional Application Update - ${application.verification_status}`,
        template:
          templateMap[(application.verification_status as keyof typeof templateMap)] ||
          'application_status_change',
        applicantName: credentials?.full_name || 'Unknown',
        status: application.verification_status,
        statusDisplay: this.formatStatusForDisplay(
          application.verification_status
        ),
        reviewNotes: reviewNotes || 'No additional notes provided',
        nextSteps: this.getNextStepsForStatus(application.verification_status),
        supportEmail: 'support@schwalbe.app',
        dashboardUrl: `${window.location.origin}/professional/dashboard`,
      };

      await this.sendEmail({
        to: credentials?.email || 'unknown@example.com',
        subject: `Professional Application Update - ${application.verification_status}`,
        template:
          templateMap[(application.verification_status as keyof typeof templateMap)] ||
          'application_status_change',
        data: emailData,
      });

      await this.logNotification({
        type: 'applicant_status_change',
        recipient: credentials?.email || 'unknown@example.com',
        applicationId: application.id,
        status: 'sent',
        metadata: { newStatus: application.verification_status },
      });
    } catch (error) {
      console.error('Failed to send applicant notification:', error);
      await this.logNotification({
        type: 'applicant_status_change',
        recipient: 'unknown@example.com',
        applicationId: application.id,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Email service integration
  private async sendEmail(emailData: {
    data: EmailData;
    subject: string;
    template: string;
    to: string;
  }): Promise<void> {
    // For now, we'll use Supabase Edge Functions for email sending
    // In production, this would integrate with SendGrid, AWS SES, or similar service

    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: emailData,
      });

      if (error) throw error;

      console.warn('Email sent successfully:', emailData.to);
    } catch (error) {
      console.error('Email sending failed:', error);
      // Fallback: log to database for manual processing
      await this.logFailedEmail(
        emailData,
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }

  private async logNotification(notification: {
    applicationId?: string;
    error?: string;
    metadata?: Record<string, boolean | null | number | string | undefined>;
    recipient: string;
    reviewId?: string;
    status: 'failed' | 'sent';
    type: string;
  }): Promise<void> {
    try {
      // Since notification_logs table doesn't exist, we'll use console logging for now
      console.warn('Notification logged:', notification);

      // TODO: Create notification_logs table in database schema
      // await supabase
      //   .from('notification_logs')
      //   .insert({
      //     ...notification,
      //     created_at: new Date().toISOString()
      //   });
    } catch (error) {
      console.error('Failed to log notification:', error);
    }
  }

  private async logFailedEmail(
    emailData: {
      data: EmailData;
      subject: string;
      template: string;
      to: string;
    },
    error: string
  ): Promise<void> {
    try {
      // Since failed_emails table doesn't exist, we'll use console logging for now
      console.warn('Failed email logged:', { emailData, error });

      // TODO: Create failed_emails table in database schema
      // await supabase
      //   .from('failed_emails')
      //   .insert({
      //     recipient: emailData.to,
      //     subject: emailData.subject,
      //     template: emailData.template,
      //     email_data: emailData.data,
      //     error_message: error,
      //     retry_count: 0,
      //     created_at: new Date().toISOString()
      //   });
    } catch (logError) {
      console.error('Failed to log failed email:', logError);
    }
  }

  // Helper methods
  private formatStatusForDisplay(status: string): string {
    const statusMap = {
      pending: 'Pending Review',
      under_review: 'Under Review',
      verified: 'Approved & Verified',
      rejected: 'Application Rejected',
    };
    return statusMap[status as keyof typeof statusMap] || status;
  }

  private getNextStepsForStatus(status: string): string {
    const nextStepsMap = {
      pending:
        'Your application is in queue for review. You will be notified when the review begins.',
      under_review:
        'Our team is currently reviewing your credentials. This typically takes 2-3 business days.',
      verified:
        'Congratulations! You can now access the professional portal and start accepting review assignments.',
      rejected:
        'Please review the feedback provided and feel free to reapply after addressing the noted concerns.',
    };
    return (
      nextStepsMap[status as keyof typeof nextStepsMap] ||
      'Please check your dashboard for updates.'
    );
  }

  private calculateExpectedCompletion(averageTurnaroundHours: number): string {
    const completionDate = new Date();
    completionDate.setHours(completionDate.getHours() + averageTurnaroundHours);
    return completionDate.toLocaleDateString();
  }
}

export const professionalService = ProfessionalService.getInstance();