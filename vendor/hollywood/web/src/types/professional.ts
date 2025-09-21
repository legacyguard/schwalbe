
/**
 * Professional Network Types
 * Types for attorney and professional reviewer system
 */

// Import the domain model interface from main types
export type { ProfessionalReviewerDTO as ProfessionalReviewer } from './index';

export interface ProfessionalSpecialization {
  category:
    | 'business_law'
    | 'estate_planning'
    | 'family_law'
    | 'other'
    | 'real_estate'
    | 'tax_law';
  description?: string;
  id: string;
  name: string;
}

export interface DocumentReview {
  actual_hours?: number;
  assigned_at?: string;
  completed_at?: string;
  created_at: string;
  document_id: string;
  due_date?: string;
  estimated_hours?: number;
  id: string;
  notes?: string;
  priority: 'high' | 'low' | 'medium' | 'urgent';
  requested_at: string;
  review_fee?: number;
  review_type: 'basic' | 'certified' | 'comprehensive';
  reviewer_id: string;
  status: 'assigned' | 'completed' | 'in_progress' | 'rejected' | 'requested';
  updated_at: string;
  user_id: string;
}

export interface ReviewResult {
  created_at: string;
  detailed_feedback: string;
  follow_up_required: boolean;
  id: string;
  issues_found: ReviewIssue[];
  legal_compliance_score: number; // 0-100
  next_steps?: string[];
  overall_status:
    | 'approved'
    | 'approved_with_changes'
    | 'rejected'
    | 'requires_revision';
  recommendations: ReviewRecommendation[];
  review_id: string;
  summary: string;
  trust_score_impact: number; // -10 to +10
  updated_at: string;
}

export interface ReviewRecommendation {
  action_required: boolean;
  category:
    | 'best_practice'
    | 'family_protection'
    | 'legal_compliance'
    | 'optimization';
  description: string;
  estimated_impact: 'high' | 'low' | 'medium';
  id: string;
  title: string;
  type: 'critical' | 'important' | 'informational' | 'suggested';
}

export interface ReviewIssue {
  category:
    | 'family_consideration'
    | 'legal_error'
    | 'missing_information'
    | 'unclear_language';
  description: string;
  id: string;
  page_reference?: number;
  section_reference?: string;
  severity: 'critical' | 'high' | 'low' | 'medium';
  suggested_fix?: string;
  title: string;
}

export interface ProfessionalOnboarding {
  bar_number: string;
  bio?: string;
  created_at: string;
  email: string;
  experience_years: number;
  full_name: string;
  hourly_rate?: number;
  id: string;
  law_firm_name?: string;
  licensed_states: string[];
  motivation?: string;
  professional_title: string;
  referral_source?: string;
  reviewed_at?: string;
  specializations: string[];
  status: 'approved' | 'draft' | 'rejected' | 'submitted' | 'under_review';
  submitted_at?: string;
  updated_at: string;
}

export interface ReviewRequest {
  budget_max?: number;
  created_at: string;
  deadline?: string;
  document_id: string;
  family_context: {
    business_interests: boolean;
    complex_assets: boolean;
    family_members_count: number;
    minor_children: boolean;
  };
  id: string;
  preferred_reviewer_id?: string;
  priority: 'high' | 'low' | 'medium' | 'urgent';
  required_specializations: string[];
  review_type: 'basic' | 'certified' | 'comprehensive';
  special_instructions?: string;
  status: 'assigned' | 'cancelled' | 'pending';
  updated_at: string;
  user_id: string;
}

export interface ProfessionalPartnership {
  auto_assign_enabled: boolean;
  availability_hours: {
    friday: string[];
    monday: string[];
    saturday: string[];
    sunday: string[];
    thursday: string[];
    tuesday: string[];
    wednesday: string[];
  };
  commission_rate: number; // 0-100
  created_at: string;
  id: string;
  max_concurrent_reviews: number;
  minimum_review_fee: number;
  notification_preferences: {
    email: boolean;
    in_app: boolean;
    sms: boolean;
  };
  partnership_type: 'firm' | 'individual' | 'network';
  preferred_review_types: ('basic' | 'certified' | 'comprehensive')[];
  reviewer_id: string;
  status: 'active' | 'paused' | 'terminated';
  updated_at: string;
}

export type ReviewStatus = DocumentReview['status'];
// Note: ProfessionalReviewer no longer has a 'status' field, use 'onboardingStatus' instead
export type ReviewerStatus = 'active' | 'inactive' | 'pending' | 'suspended';
export type OnboardingStatus = ProfessionalOnboarding['status'];
