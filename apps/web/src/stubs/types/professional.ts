// Minimal professional types to satisfy web app typechecking
export type ProfessionalReviewer = {
  id: string
  full_name: string
  professional_title?: string
  law_firm_name?: string
  jurisdiction?: string
  languages?: string[]
  licensed_states?: string[]
  experience_years?: number
  hourly_rate?: number
  profile_image_url?: string
  bio?: string
  profile_verified?: boolean
  verification_status?: 'pending' | 'under_review' | 'verified' | 'rejected'
  created_at?: string
}

export type ReviewRequest = {
  id: string
  document_id?: string
  reviewer_id?: string
  status?: 'requested' | 'assigned' | 'in_progress' | 'completed'
}

export type ProfessionalOnboarding = {
  email: string
  full_name: string
  hourly_rate?: number
  bio?: string
}

export interface ProfessionalProfile extends ProfessionalReviewer {
  specializations: { id: string; name: string }[]
  userId?: string
}

export type DocumentReview = {
  id: string
  document_id: string
  review_type: string
  status: string
  completed_at?: string
  requested_at?: string
  due_date?: string
  review_fee?: number
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  notes?: string
}

