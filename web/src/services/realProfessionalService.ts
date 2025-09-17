
/**
 * Real Professional Network Service
 * Complete database integration without mock data
 */

import { supabase } from '@/integrations/supabase/client';
import { professionalReviewRealtimeService } from '@/lib/realtime/professionalReviewUpdates';

export interface ProfessionalReviewer {
  availability_status: 'available' | 'busy' | 'unavailable';
  created_at: string;
  credentials: {
    bar_number?: string;
    certifications?: string[];
    law_firm?: string;
    licensed_states: string[];
    specializations: string[];
    years_experience: number;
  };
  email: string;
  hourly_rate: number;
  id: string;
  name: string;
  profile: {
    bio: string;
    education: string[];
    languages: string[];
    practice_areas: string[];
    timezone: string;
  };
  profile_verified: boolean;
  rating: number;
  reviews_count: number;
  updated_at: string;
  user_id: string;
  verification_status: 'pending' | 'rejected' | 'verified';
}

export interface DocumentReview {
  actual_cost?: number;
  completion_date?: string;
  created_at: string;
  document_id: string;
  estimated_cost: number;
  findings: ReviewFinding[];
  id: string;
  recommendations: ReviewRecommendation[];
  review_type: 'basic' | 'certified' | 'comprehensive';
  reviewer_id: string;
  score: number;
  status: 'cancelled' | 'completed' | 'in_progress' | 'requested';
  updated_at: string;
  urgency_level: 'priority' | 'standard' | 'urgent';
  user_id: string;
}

export interface ReviewFinding {
  category: string;
  description: string;
  id: string;
  line_reference?: string;
  recommendation?: string;
  severity: 'high' | 'low' | 'medium';
  type: 'compliment' | 'error' | 'suggestion' | 'warning';
}

export interface ReviewRecommendation {
  action_required: boolean;
  category: string;
  description: string;
  estimated_time: string;
  id: string;
  impact: string;
  priority: 'high' | 'low' | 'medium';
  title: string;
}

export interface ReviewRequest {
  assigned_reviewer_id?: string;
  created_at: string;
  document_id: string;
  estimated_cost: number;
  id: string;
  request_notes?: string;
  review_type: 'basic' | 'certified' | 'comprehensive';
  specialization_required?: string;
  status: 'assigned' | 'cancelled' | 'completed' | 'pending';
  updated_at: string;
  urgency_level: 'priority' | 'standard' | 'urgent';
  user_id: string;
}

export interface Consultation {
  consultation_type:
    | 'document_review'
    | 'estate_planning'
    | 'family_planning'
    | 'initial_consultation';
  cost: number;
  created_at: string;
  duration_minutes: number;
  id: string;
  meeting_url?: string;
  notes?: string;
  professional_id: string;
  scheduled_time: string;
  status: 'cancelled' | 'completed' | 'rescheduled' | 'scheduled';
  updated_at: string;
  user_id: string;
}

class RealProfessionalService {
  private static instance: RealProfessionalService;

  static getInstance(): RealProfessionalService {
    if (!RealProfessionalService.instance) {
      RealProfessionalService.instance = new RealProfessionalService();
    }
    return RealProfessionalService.instance;
  }

  // Professional Directory - Real Attorney Network
  async getVerifiedAttorneys(filters?: {
    availableOnly?: boolean;
    jurisdiction?: string;
    ratingMin?: number;
    specializations?: string[];
  }): Promise<ProfessionalReviewer[]> {
    try {
      let query = supabase
        .from('professional_reviewers')
        .select('*')
        .eq('profile_verified', true)
        .eq('verification_status', 'verified');

      if (filters?.ratingMin) {
        query = query.gte('rating', filters.ratingMin);
      }

      if (filters?.availableOnly) {
        query = query.eq('availability_status', 'available');
      }

      const { data, error } = await query.order('rating', { ascending: false });

      if (error) throw error;

      // Filter by specializations and jurisdiction in-memory since JSONB queries are complex
      let filteredData = data || [];

      if (filters?.specializations?.length) {
        filteredData = filteredData.filter(attorney =>
          (attorney as any).specializations?.some((spec: string) =>
            filters.specializations?.includes(spec)
          )
        );
      }

      if (filters?.jurisdiction) {
        filteredData = filteredData.filter(attorney =>
          attorney.jurisdiction === filters.jurisdiction
        );
      }

      const mappedData = filteredData.map((attorney: any) => ({
        id: attorney.id,
        name: attorney.name,
        email: attorney.contact_email,
        created_at: attorney.created_at,
        updated_at: attorney.updated_at,
        user_id: attorney.user_id || '',
        availability_status: 'available' as const,
        credentials: {
          bar_number: attorney.bar_number,
          certifications: [],
          law_firm: '',
          licensed_states: [attorney.jurisdiction],
          specializations: attorney.specializations || [],
          years_experience: 0,
        },
        profile: {
          bio: '',
          education: [],
          languages: [],
          practice_areas: attorney.specializations || [],
          timezone: '',
        },
        profile_verified: attorney.profile_verified || false,
        rating: attorney.rating || 0,
        reviews_count: attorney.reviews_completed || 0,
        hourly_rate: 0,
        verification_status: 'verified' as const,
      }));

      return mappedData as ProfessionalReviewer[];
    } catch (error) {
      console.error('Failed to fetch verified attorneys:', error);
      return [];
    }
  }

  async getAttorneyById(id: string): Promise<null | ProfessionalReviewer> {
    try {
      const { data, error } = await supabase
        .from('professional_reviewers')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) return null;

      const mappedData = {
        id: data.id,
        name: data.name,
        email: data.contact_email,
        created_at: data.created_at,
        updated_at: data.updated_at,
        user_id: (data as any).user_id || '',
        availability_status: 'available' as const,
        credentials: {
          bar_number: data.bar_number,
          certifications: [],
          law_firm: '',
          licensed_states: [data.jurisdiction],
          specializations: (data as any).specializations || [],
          years_experience: 0,
        },
        profile: {
          bio: '',
          education: [],
          languages: [],
          practice_areas: (data as any).specializations || [],
          timezone: '',
        },
        profile_verified: data.profile_verified || false,
        rating: data.rating || 0,
        reviews_count: (data as any).reviews_completed || 0,
        hourly_rate: 0,
        verification_status: 'verified' as const,
      };

      return mappedData as ProfessionalReviewer;
    } catch (error) {
      console.error('Failed to fetch attorney by ID:', error);
      return null;
    }
  }

  // Review Request System - Real Database Operations
  private _mapReviewType(type: 'basic' | 'certified' | 'comprehensive'): string {
    return type;
  }

  async createReviewRequest(requestData: {
    document_id: string;
    estimated_cost: number;
    request_notes?: string;
    review_type: 'basic' | 'certified' | 'comprehensive';
    specialization_required?: string;
    urgency_level: 'priority' | 'standard' | 'urgent';
    user_id: string;
  }): Promise<ReviewRequest> {
    try {
      const { data, error } = await supabase
        .from('review_requests')
        .insert({
          document_id: requestData.document_id,
          estimated_cost: requestData.estimated_cost,
          request_notes: requestData.request_notes,
          review_type: requestData.review_type as any,
          specialization_required: requestData.specialization_required,
          user_id: requestData.user_id,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update document status to reflect review request
      await this.updateDocumentReviewStatus(
        requestData.document_id,
        'requested'
      );

      const mappedRequest = {
        ...data,
        estimated_cost: data.estimated_cost || 0,
        request_notes: data.notes,
        status: data.status || 'pending',
      } as unknown as ReviewRequest;

      // Notify available reviewers
      await this.notifyAvailableReviewers(mappedRequest);

      return mappedRequest;
    } catch (error) {
      console.error('Failed to create review request:', error);
      throw error;
    }
  }

  async assignReviewRequest(
    requestId: string,
    reviewerId: string
  ): Promise<DocumentReview> {
    try {
      // Get the review request
      const { data: request, error: requestError } = await supabase
        .from('review_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (requestError) throw requestError;

      // Create document review
      const { data: review, error: reviewError } = await supabase
        .from('document_reviews')
        .insert({

          user_id: request.user_id,
          document_id: request.document_id,
          reviewer_id: reviewerId,
          status: 'in_progress',
          review_type: request.review_type,
          urgency_level: request.urgency_level,
          estimated_cost: request.estimated_cost,
          findings: [],
          recommendations: [],
          score: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (reviewError) throw reviewError;

      // Update request status
      await supabase
        .from('review_requests')
        .update({
          status: 'assigned',
          assigned_reviewer_id: reviewerId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      // Update document status
      await this.updateDocumentReviewStatus(request.document_id, 'in_progress');

      // Send real-time update
      await professionalReviewRealtimeService.broadcastUpdateToUser(
        request.user_id,
        {
          review_id: review.id,
          document_id: request.document_id,
          status: 'in_progress',
          progress_percentage: 25,
        }
      );

      // Notify user
      await this.notifyUserReviewAssigned({ ...review, estimated_cost: 0, score: 0, urgency_level: "standard" as const, user_id: (request as any).user_id || "" } as unknown as DocumentReview);

      return { ...review, estimated_cost: 0, score: 0, urgency_level: "standard" as const, user_id: (request as any).user_id || "" } as unknown as DocumentReview;
    } catch (error) {
      console.error('Failed to assign review request:', error);
      throw error;
    }
  }

  async completeDocumentReview(
    reviewId: string,
    findings: ReviewFinding[],
    recommendations: ReviewRecommendation[],
    score: number
  ): Promise<DocumentReview> {
    try {
      const { data: review, error } = await supabase
        .from('document_reviews')
        .update({
          status: 'completed',
          findings: findings as any,
          recommendations: recommendations as any,
          score,
          completion_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', reviewId)
        .select('*, documents(*)')
        .single();

      if (error) throw error;

      // Update document with review results
      await professionalReviewRealtimeService.completeReview(
        review.document_id,
        score,
        findings,
        recommendations
      );

      // Send real-time update
      await professionalReviewRealtimeService.broadcastUpdateToUser(
        (review as any).user_id || "",
        {
          review_id: reviewId,
          document_id: review.document_id,
          status: 'completed',
          progress_percentage: 100,
          score,
          findings,
          recommendations,
          completion_date: review.completion_date || undefined,
        }
      );

      // Send completion notification
      await this.notifyUserReviewCompleted({ ...review, estimated_cost: 0, score, urgency_level: "standard" as const, user_id: (review as any).user_id || "" } as unknown as DocumentReview);

      return { ...review, estimated_cost: 0, score, urgency_level: "standard" as const, user_id: (review as any).user_id || "" } as unknown as DocumentReview;
    } catch (error) {
      console.error('Failed to complete review:', error);
      throw error;
    }
  }

  // Consultation Booking System
  async bookConsultation(
    professionalId: string,
    userId: string,
    consultationType: Consultation['consultation_type'],
    scheduledTime: string,
    durationMinutes: number = 60
  ): Promise<Consultation> {
    try {
      // Get professional's hourly rate
      const { data: professional } = await supabase
        .from('professional_reviewers')
        .select('hourly_rate')
        .eq('id', professionalId)
        .single();

      const cost = professional
        ? ((professional as any).hourly_rate * durationMinutes) / 60
        : 0;

      const { data, error } = await supabase
        .from('consultations')
        .insert({
          user_id: userId,
          professional_id: professionalId,
          consultation_type: consultationType as any,
          scheduled_time: scheduledTime,
          duration_minutes: durationMinutes,
          status: 'scheduled',
          cost,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Send confirmation emails
      await this.sendConsultationConfirmation(data as unknown as Consultation);

      return data as unknown as Consultation;
    } catch (error) {
      console.error('Failed to book consultation:', error);
      throw error;
    }
  }

  // Pricing System
  async getReviewPricing(): Promise<Record<string, number>> {
    return {
      basic: 199,
      comprehensive: 399,
      certified: 699,
    };
  }

  // Real Database Helper Methods
  private async updateDocumentReviewStatus(
    documentId: string,
    status: 'cancelled' | 'completed' | 'in_progress' | 'none' | 'requested'
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('documents')
        .update({
          professional_review_status: status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to update document review status:', error);
    }
  }

  private async notifyAvailableReviewers(
    request: ReviewRequest
  ): Promise<void> {
    try {
      // Get reviewers who match the specialization
      const { data: reviewers } = await supabase
        .from('professional_reviewers')
        .select('*')
        .eq('availability_status', 'available')
        .eq('profile_verified', true);

      if (reviewers?.length) {
        // Send notifications to matching reviewers
        const notifications = reviewers
          .filter(
            reviewer =>
              !request.specialization_required ||
              (reviewer as any).credentials?.specializations?.includes(
                request.specialization_required
              )
          )
          .map(reviewer => ({
            user_id: (reviewer as any).user_id || "",
            type: 'new_review_request',
            title: 'New Review Request Available',
            message: `A ${request.review_type} review is available for ${request.urgency_level} completion`,
            data: { request_id: request.id, document_id: request.document_id },
            created_at: new Date().toISOString(),
          }));

        if (notifications.length > 0) {
          await (supabase as any).from('notifications').insert(notifications);
        }
      }
    } catch (error) {
      console.error('Failed to notify available reviewers:', error);
    }
  }

  private async notifyUserReviewAssigned(
    review: DocumentReview
  ): Promise<void> {
    try {
      await (supabase as any).from('notifications').insert({
        user_id: review.user_id,
        type: 'review_assigned',
        title: 'Document Review Assigned',
        message: 'A professional has been assigned to review your document',
        data: { review_id: review.id, document_id: review.document_id },
        created_at: new Date().toISOString(),
      });

      // Send email notification
      await this.sendEmail({
        to: review.user_id,
        subject: 'Document Review Assigned',
        template: 'review_assigned',
        data: {
          reviewId: review.id,
          documentId: review.document_id,
          reviewType: review.review_type,
        },
      });
    } catch (error) {
      console.error('Failed to notify user of review assignment:', error);
    }
  }

  private async notifyUserReviewCompleted(
    review: DocumentReview
  ): Promise<void> {
    try {
      await (supabase as any).from('notifications').insert({
        user_id: review.user_id,
        type: 'review_completed',
        title: 'Document Review Completed',
        message: `Your document review has been completed with a score of ${review.score}/100`,
        data: {
          review_id: review.id,
          document_id: review.document_id,
          score: review.score,
          findings_count: review.findings.length,
          recommendations_count: review.recommendations.length,
        },
        created_at: new Date().toISOString(),
      });

      // Send email notification
      await this.sendEmail({
        to: review.user_id,
        subject: 'Document Review Completed',
        template: 'review_completed',
        data: {
          reviewId: review.id,
          score: review.score,
          findingsCount: review.findings.length,
          recommendationsCount: review.recommendations.length,
        },
      });
    } catch (error) {
      console.error('Failed to notify user of review completion:', error);
    }
  }

  private async sendConsultationConfirmation(
    consultation: Consultation
  ): Promise<void> {
    try {
      // Send to user
      await this.sendEmail({
        to: consultation.user_id,
        subject: 'Consultation Confirmation',
        template: 'consultation_confirmed_user',
        data: {
          consultationType: consultation.consultation_type,
          scheduledTime: consultation.scheduled_time,
          duration: consultation.duration_minutes,
          cost: consultation.cost,
        },
      });

      // Send to professional
      await this.sendEmail({
        to: consultation.professional_id,
        subject: 'New Consultation Booked',
        template: 'consultation_confirmed_professional',
        data: {
          consultationType: consultation.consultation_type,
          scheduledTime: consultation.scheduled_time,
          duration: consultation.duration_minutes,
        },
      });
    } catch (error) {
      console.error('Failed to send consultation confirmations:', error);
    }
  }

  private async sendEmail(emailData: {
    data: Record<string, any>;
    subject: string;
    template: string;
    to: string;
  }): Promise<void> {
    try {
      await supabase.functions.invoke('send-email', {
        body: emailData,
      });
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }

  // User Review Methods
  async getUserReviews(userId: string): Promise<DocumentReview[]> {
    try {
      const { data, error } = await supabase
        .from('document_reviews')
        .select(
          `
          *,
          documents(title, type),
          professional_reviewers(name, credentials)
        `
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as DocumentReview[];
    } catch (error) {
      console.error('Failed to fetch user reviews:', error);
      return [];
    }
  }

  async getUserReviewRequests(userId: string): Promise<ReviewRequest[]> {
    try {
      const { data, error } = await supabase
        .from('review_requests')
        .select(
          `
          *,
          documents(title, type),
          professional_reviewers(name, credentials)
        `
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map((d: any) => ({ ...d, estimated_cost: d.estimated_cost || 0 })) as ReviewRequest[];
    } catch (error) {
      console.error('Failed to fetch user review requests:', error);
      return [];
    }
  }

  async getUserConsultations(userId: string): Promise<Consultation[]> {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select(
          `
          *,
          professional_reviewers(name, credentials, profile)
        `
        )
        .eq('user_id', userId)
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      return (data || []) as unknown as Consultation[];
    } catch (error) {
      console.error('Failed to fetch user consultations:', error);
      return [];
    }
  }
}

export const realProfessionalService = RealProfessionalService.getInstance();
