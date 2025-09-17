
/**
 * Professional Review API Endpoints
 * RESTful API layer for professional review operations
 */

import { supabase } from '@/integrations/supabase/client';
import { professionalService } from '@/services/professionalService';
import { insightsService } from '@/services/insightsService';
import { milestonesService } from '@/services/milestonesService';
import type {
  Consultation,
  DocumentReview,
  ProfessionalOnboarding,
  ProfessionalReviewer,
  ReviewRequest,
} from '@/integrations/supabase/types';

// Professional Application Endpoints
export const professionalApplicationApi = {
  // POST /api/professional/applications
  async create(applicationData: {
    availability: {
      hours_per_week: number;
      preferred_schedule: string[];
      timezone: string;
    };
    credentials: {
      bar_number?: string;
      email: string;
      full_name: string;
      law_firm?: string;
      licensed_states: string[];
      phone?: string;
      professional_title: string;
      specializations: string[];
      website?: string;
      years_experience: number;
    };
    portfolio: {
      certifications?: string[];
      references?: Array<{
        contact: string;
        name: string;
        relationship: string;
      }>;
      sample_reviews?: string[];
    };
  }): Promise<{ applicationId: string; message: string; success: boolean }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Authentication required');

      const application = await professionalService.submitApplication({
        user_id: user.user.id,
        professional_type: 'attorney' as const, // Default type, can be determined from credentials
        credentials: applicationData.credentials,
        // Note: portfolio and availability data can be stored in credentials or handled separately
        verification_status: 'pending',
      });

      return {
        success: true,
        applicationId: application.id,
        message: 'Professional application submitted successfully',
      };
    } catch (error) {
      throw new Error(
        `Application submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },

  // GET /api/professional/applications/:id
  async get(applicationId: string): Promise<ProfessionalOnboarding> {
    try {
      const application =
        await professionalService.getApplication(applicationId);
      if (!application) throw new Error('Application not found');
      return application;
    } catch (error) {
      throw new Error(
        `Failed to retrieve application: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },

  // GET /api/professional/applications/user/:userId
  async getByUserId(userId: string): Promise<null | ProfessionalOnboarding> {
    try {
      return await professionalService.getApplicationByUserId(userId);
    } catch (error) {
      throw new Error(
        `Failed to retrieve user application: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },

  // PUT /api/professional/applications/:id/status
  async updateStatus(
    applicationId: string,
    status: ProfessionalOnboarding['verification_status'],
    reviewNotes?: string
  ): Promise<{ message: string; success: boolean }> {
    try {
      await professionalService.updateApplicationStatus(
        applicationId,
        status,
        reviewNotes
      );

      return {
        success: true,
        message: `Application status updated to ${status}`,
      };
    } catch (error) {
      throw new Error(
        `Status update failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
};

// Document Review Request Endpoints
export const reviewRequestApi = {
  // POST /api/reviews/request
  async create(requestData: {
    documentId: string;
    notes?: string;
    reviewType: 'basic' | 'certified' | 'comprehensive';
    specialization?: string;
    urgency: 'priority' | 'standard' | 'urgent';
  }): Promise<{ estimatedCost: number; requestId: string; success: boolean }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Authentication required');

      // Get pricing
      const pricing = await professionalService.getReviewPricing();
      const estimatedCost = pricing[requestData.reviewType];

      // Create review request
      const request = await professionalService.createReviewRequest({
        user_id: user.user.id,
        document_id: requestData.documentId,
        review_type: requestData.reviewType as
          | 'financial'
          | 'general'
          | 'legal'
          | 'medical',
        urgency_level: requestData.urgency as
          | 'high'
          | 'low'
          | 'medium'
          | 'urgent',
        status: 'pending',
        estimated_cost: estimatedCost,
        // Store additional notes in metadata or separate field
        ...(requestData.notes && { notes: requestData.notes }),
        ...(requestData.specialization && {
          specialization: requestData.specialization,
        }),
      });

      // Trigger milestone check
      await milestonesService.checkMilestones({
        type: 'review_completed',
        userId: user.user.id,
        reviewId: request.id,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        requestId: request.id,
        estimatedCost,
      };
    } catch (error) {
      throw new Error(
        `Review request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },

  // POST /api/reviews/:requestId/assign
  async assign(
    requestId: string,
    reviewerId: string
  ): Promise<{ reviewId: string; success: boolean }> {
    try {
      const review = await professionalService.assignReviewRequest(
        requestId,
        reviewerId
      );

      return {
        success: true,
        reviewId: review.id,
      };
    } catch (error) {
      throw new Error(
        `Review assignment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },

  // GET /api/reviews/requests/:userId
  async getUserRequests(userId: string): Promise<ReviewRequest[]> {
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
      return data || [];
    } catch (error) {
      throw new Error(
        `Failed to fetch review requests: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
};

// Document Review Management Endpoints
export const documentReviewApi = {
  // PUT /api/reviews/:reviewId/status
  async updateStatus(
    reviewId: string,
    status: DocumentReview['status'],
    result?: {
      completenessScore: number;
      findings: Array<{
        category: string;
        description: string;
        recommendation?: string;
        severity: 'high' | 'low' | 'medium';
        type: 'compliment' | 'error' | 'suggestion' | 'warning';
      }>;
      legalCompliance: {
        issues: string[];
        score: number;
      };
      recommendations: string[];
      riskAssessment: {
        categories: Record<string, 'high' | 'low' | 'medium'>;
        overall: 'high' | 'low' | 'medium';
      };
      score?: number;
      summary: string;
    }
  ): Promise<{ message: string; success: boolean }> {
    try {
      // Update the review status directly via Supabase
      const { data: review, error } = await supabase
        .from('document_reviews')
        .update({
          status,
          updated_at: new Date().toISOString(),
          ...(status === 'completed' && {
            completion_date: new Date().toISOString(),
          }),
        })
        .eq('id', reviewId)
        .select()
        .single();

      if (error) throw error;

      // Generate insights based on review completion
      if (status === 'completed' && result) {
        const { data: documentData } = await supabase
          .from('documents')
          .select('user_id')
          .eq('id', review.document_id)
          .single();

        if (documentData) {
          await insightsService.analyzeDocument(
            review.document_id,
            documentData.user_id
          );
        }
      }

      return {
        success: true,
        message: `Review status updated to ${status}`,
      };
    } catch (error) {
      throw new Error(
        `Review status update failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },

  // GET /api/reviews/:reviewId
  async get(reviewId: string): Promise<DocumentReview> {
    try {
      const review = await professionalService.getCachedReviewById(reviewId);
      if (!review) throw new Error('Review not found');
      return review;
    } catch (error) {
      throw new Error(
        `Failed to fetch review: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },

  // GET /api/reviews/user/:userId
  async getUserReviews(userId: string): Promise<DocumentReview[]> {
    try {
      return await professionalService.getCachedReviews(userId);
    } catch (error) {
      throw new Error(
        `Failed to fetch user reviews: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },

  // GET /api/reviews/reviewer/:reviewerId
  async getReviewerReviews(reviewerId: string): Promise<DocumentReview[]> {
    try {
      const { data, error } = await supabase
        .from('document_reviews')
        .select(
          `
          *,
          documents(title, type, user_id),
          review_results(*)
        `
        )
        .eq('reviewer_id', reviewerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(
        `Failed to fetch reviewer reviews: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
};

// Professional Directory Endpoints
export const professionalDirectoryApi = {
  // GET /api/professionals
  async search(filters: {
    availability?: boolean;
    jurisdiction?: string;
    rating?: number;
    specialization?: string;
  }): Promise<ProfessionalReviewer[]> {
    try {
      return await professionalService.searchReviewers({
        specializations: filters.specialization
          ? [filters.specialization]
          : undefined,
        jurisdiction: filters.jurisdiction,
        ratingMin: filters.rating,
        verified: true,
      });
    } catch (error) {
      throw new Error(
        `Professional search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },

  // GET /api/professionals/:id
  async get(professionalId: string): Promise<ProfessionalReviewer> {
    try {
      const professional =
        await professionalService.getReviewer(professionalId);
      if (!professional) throw new Error('Professional not found');
      return professional;
    } catch (error) {
      throw new Error(
        `Failed to fetch professional: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },

  // GET /api/professionals/directory
  async getDirectory(filters?: {
    jurisdiction?: string;
    rating?: number;
    specialization?: string;
  }): Promise<ProfessionalReviewer[]> {
    try {
      return await professionalService.getNetworkDirectory(filters);
    } catch (error) {
      throw new Error(
        `Failed to fetch directory: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
};

// Consultation Booking Endpoints
export const consultationApi = {
  // POST /api/consultations/book
  async book(bookingData: {
    consultationType: Consultation['consultation_type'];
    duration?: number;
    notes?: string;
    professionalId: string;
    scheduledTime: string;
  }): Promise<{ consultationId: string; cost: number; success: boolean }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Authentication required');

      const consultation = await professionalService.bookConsultation(
        bookingData.professionalId,
        user.user.id,
        bookingData.consultationType,
        bookingData.scheduledTime,
        bookingData.duration
      );

      // Calculate cost based on consultation type and duration
      const hourlyRates: Record<Consultation['consultation_type'], number> = {
        initial: 200,
        urgent: 300,
        follow_up: 150,
        document_review: 300,
      };

      const hourlyRate = hourlyRates[bookingData.consultationType] || 250;
      const cost = (hourlyRate * (bookingData.duration || 60)) / 60;

      return {
        success: true,
        consultationId: consultation.id,
        cost,
      };
    } catch (error) {
      throw new Error(
        `Consultation booking failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },

  // GET /api/consultations/user/:userId
  async getUserConsultations(userId: string): Promise<Consultation[]> {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select(
          `
          *,
          professional_reviewers(name, credentials, specializations)
        `
        )
        .eq('user_id', userId)
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(
        `Failed to fetch consultations: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },

  // PUT /api/consultations/:id/status
  async updateStatus(
    consultationId: string,
    status: Consultation['status']
  ): Promise<{ success: boolean }> {
    try {
      const { error } = await supabase
        .from('consultations')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', consultationId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      throw new Error(
        `Failed to update consultation status: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
};

// Analytics and Reporting Endpoints
export const professionalAnalyticsApi = {
  // GET /api/professional/analytics/:reviewerId
  async getReviewerStats(reviewerId: string): Promise<{
    averageRating: number;
    averageTurnaround: number;
    completionRate: number;
    monthlyStats: Array<{
      averageRating: number;
      month: string;
      reviewsCompleted: number;
    }>;
    specializations: Array<{ count: number; name: string }>;
    totalReviews: number;
  }> {
    try {
      // Get reviewer statistics
      const { data: reviews, error } = await supabase
        .from('document_reviews')
        .select(
          `
          *,
          review_results(score)
        `
        )
        .eq('reviewer_id', reviewerId)
        .eq('status', 'completed');

      if (error) throw error;

      const totalReviews = reviews?.length || 0;
      // Calculate average rating from review results
      const averageRating =
        reviews?.length && reviews.length > 0
          ? reviews.reduce((sum, r) => {
              // Handle review_results which might be an array or single object
              const result = Array.isArray(r.review_results)
                ? r.review_results[0]
                : r.review_results;
              // Use score property from review_results, with fallback
              const rating =
                result && typeof result === 'object' && 'score' in result
                  ? (result as any).score
                  : 4.0;
              return sum + (typeof rating === 'number' ? rating : 4.0);
            }, 0) / reviews.length
          : 0;

      // Calculate turnaround times
      const turnaroundTimes =
        reviews?.map(r => {
          if (r.created_at && r.completion_date) {
            const created = new Date(r.created_at).getTime();
            const completed = new Date(r.completion_date).getTime();
            return (completed - created) / (1000 * 60 * 60); // hours
          }
          return 0;
        }) || [];

      const averageTurnaround = turnaroundTimes.length
        ? turnaroundTimes.reduce((sum, time) => sum + time, 0) /
          turnaroundTimes.length
        : 0;

      return {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        averageTurnaround: Math.round(averageTurnaround),
        completionRate: 95, // Would calculate from actual data
        specializations: [], // Would aggregate from reviews
        monthlyStats: [], // Would calculate from review dates
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch reviewer analytics: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },

  // GET /api/professional/network/stats
  async getNetworkStats(): Promise<{
    averageRating: number;
    specializations: Array<{ count: number; name: string }>;
    topPerformers: Array<{
      id: string;
      name: string;
      rating: number;
      reviewsCompleted: number;
    }>;
    totalProfessionals: number;
    totalReviews: number;
  }> {
    try {
      const { data: professionals, error: profError } = await supabase
        .from('professional_reviewers')
        .select('*')
        .eq('profile_verified', true);

      const { data: reviews, error: reviewError } = await supabase
        .from('document_reviews')
        .select('*')
        .eq('status', 'completed');

      if (profError || reviewError) throw profError || reviewError;

      return {
        totalProfessionals: professionals?.length || 0,
        totalReviews: reviews?.length || 0,
        averageRating: 4.8, // Would calculate from actual ratings
        specializations: [], // Would aggregate from professional data
        topPerformers: [], // Would calculate from review performance
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch network stats: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
};

// Export all API collections
export const professionalApi = {
  applications: professionalApplicationApi,
  reviewRequests: reviewRequestApi,
  reviews: documentReviewApi,
  directory: professionalDirectoryApi,
  consultations: consultationApi,
  analytics: professionalAnalyticsApi,
};
