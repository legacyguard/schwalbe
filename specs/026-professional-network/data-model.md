# Professional Network Data Model

## Overview

This document defines the database schema, API contracts, and data structures for the Professional Network system. The data model is designed to support professional verification, document review workflows, consultation booking, and commission tracking while maintaining security, compliance, and scalability.

## Core Entities

### Professional Entity with Verification Fields

```typescript
interface Professional {
  id: string; // UUID
  user_id: string; // References auth.users
  full_name: string;
  email: string;
  phone?: string;
  bar_number: string;
  licensed_states: string[]; // Array of state codes
  specializations: string[]; // Array of specialization IDs
  experience_years: number;
  hourly_rate?: number;
  rating: number; // 0-5 scale
  review_count: number;
  profile_verified: boolean;
  verification_status: 'pending' | 'under_review' | 'verified' | 'rejected';
  onboarding_completed: boolean;
  verification_documents: {
    bar_license_url?: string;
    resume_url?: string;
    insurance_certificate_url?: string;
    references_urls?: string[];
  };
  verification_notes?: string;
  verified_at?: Date;
  verified_by?: string;
  created_at: Date;
  updated_at: Date;
}
```

### Review for Professional Reviews

```typescript
interface Review {
  id: string;
  document_id: string; // References documents table
  reviewer_id: string; // References professional_reviewers
  user_id: string; // References auth.users (client)
  status: 'requested' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'needs_revision';
  review_type: 'basic' | 'certified' | 'comprehensive';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimated_hours: number;
  actual_hours?: number;
  fee_amount: number;
  commission_rate: number; // Percentage
  requested_at: Date;
  assigned_at?: Date;
  started_at?: Date;
  completed_at?: Date;
  due_date?: Date;
  notes?: string;
  quality_score?: number; // 1-5 scale
  client_rating?: number; // 1-5 scale
  client_feedback?: string;
  created_at: Date;
  updated_at: Date;
}
```

### Consultation for Booking System

```typescript
interface Consultation {
  id: string;
  professional_id: string;
  user_id: string;
  title: string;
  description: string;
  consultation_type: 'initial' | 'follow_up' | 'review' | 'strategy';
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  scheduled_at: Date;
  duration_minutes: number;
  fee_amount: number;
  commission_rate: number;
  meeting_link?: string;
  notes?: string;
  preparation_required?: string[];
  follow_up_required: boolean;
  client_satisfaction?: number; // 1-5 scale
  client_feedback?: string;
  created_at: Date;
  updated_at: Date;
}
```

### Commission for Payment Tracking

```typescript
interface Commission {
  id: string;
  professional_id: string;
  reference_id: string; // Review or consultation ID
  reference_type: 'review' | 'consultation';
  amount: number;
  commission_rate: number;
  status: 'pending' | 'approved' | 'paid' | 'disputed' | 'cancelled';
  payment_method?: 'bank_transfer' | 'check' | 'paypal' | 'stripe';
  payment_date?: Date;
  stripe_payout_id?: string;
  paypal_transaction_id?: string;
  notes?: string;
  disputed_at?: Date;
  dispute_reason?: string;
  resolved_at?: Date;
  created_at: Date;
  updated_at: Date;
}
```

### Specialization for Professional Areas

```typescript
interface Specialization {
  id: string;
  category: 'business_law' | 'estate_planning' | 'family_law' | 'other' | 'real_estate' | 'tax_law';
  name: string;
  description?: string;
  active: boolean;
  professional_count: number; // Number of professionals with this specialization
  created_at: Date;
}
```

### BookingRequest for Consultation Requests

```typescript
interface BookingRequest {
  id: string;
  professional_id: string;
  user_id: string;
  consultation_type: 'initial' | 'follow_up' | 'review' | 'strategy';
  preferred_slots: Date[]; // Array of preferred time slots
  duration_minutes: number;
  topic: string;
  special_requests?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approved_slot?: Date;
  consultation_id?: string; // Reference to created consultation
  response_notes?: string;
  responded_at?: Date;
  created_at: Date;
  updated_at: Date;
}
```

## Entity Relations

### Professional Relations

```text
Professional
├── 1:1 → User (auth.users)
├── 1:many → Reviews (as reviewer)
├── 1:many → Consultations (as professional)
├── 1:many → Commissions
├── many:many → Specializations (through professional_specializations junction)
└── 1:1 → ProfessionalOnboarding
```

### Review Relations

```text
Review
├── 1:1 → Document
├── 1:1 → Professional (reviewer)
├── 1:1 → User (client)
├── 1:1 → Commission
└── 1:1 → ReviewResult
```

### Consultation Relations

```text
Consultation
├── 1:1 → Professional
├── 1:1 → User (client)
├── 1:1 → Commission
└── 1:1 → BookingRequest
```

### Commission Relations

```text
Commission
├── 1:1 → Professional
└── 1:1 → Reference (Review or Consultation)
```

### Specialization Relations

```text
Specialization
└── many:many → Professionals (through professional_specializations junction)
```

### BookingRequest Relations

```text
BookingRequest
├── 1:1 → Professional
├── 1:1 → User (client)
└── 1:1 → Consultation (when approved)
```

### Professional Onboarding

```typescript
interface ProfessionalOnboarding {
  id: string;
  professional_id: string;
  application_status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  submitted_at?: Date;
  reviewed_at?: Date;
  reviewed_by?: string;
  review_notes?: string;
  credentials: {
    bar_number: string;
    email: string;
    full_name: string;
    licensed_states: string[];
    professional_title: string;
    specializations: string[];
  };
  documents: {
    bar_license: string; // File URL
    resume: string; // File URL
    insurance_certificate?: string; // File URL
    references?: string[]; // File URLs
  };
  created_at: Date;
  updated_at: Date;
}
```

## Review System

### Document Review

```typescript
interface DocumentReview {
  id: string;
  document_id: string; // References documents table
  reviewer_id: string; // References professional_reviewers
  user_id: string; // References auth.users (client)
  status: 'requested' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'needs_revision';
  review_type: 'basic' | 'certified' | 'comprehensive';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimated_hours: number;
  actual_hours?: number;
  fee_amount: number;
  commission_rate: number; // Percentage
  requested_at: Date;
  assigned_at?: Date;
  started_at?: Date;
  completed_at?: Date;
  due_date?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}
```

### Review Request

```typescript
interface ReviewRequest {
  id: string;
  user_id: string;
  document_id: string;
  title: string;
  description: string;
  budget_max?: number;
  deadline?: Date;
  required_specializations: string[];
  preferred_reviewer_id?: string;
  review_type: 'basic' | 'certified' | 'comprehensive';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  family_context: {
    business_interests: boolean;
    complex_assets: boolean;
    family_members_count: number;
    minor_children: boolean;
  };
  special_instructions?: string;
  status: 'draft' | 'posted' | 'assigned' | 'in_progress' | 'completed';
  created_at: Date;
  updated_at: Date;
}
```

### Review Result

```typescript
interface ReviewResult {
  id: string;
  review_id: string;
  overall_status: 'approved' | 'approved_with_changes' | 'rejected' | 'requires_revision';
  legal_compliance_score: number; // 0-100
  summary: string;
  detailed_feedback: string;
  issues_found: ReviewIssue[];
  recommendations: ReviewRecommendation[];
  next_steps?: string[];
  trust_score_impact: number; // -10 to +10
  reviewed_at: Date;
  created_at: Date;
  updated_at: Date;
}
```

### Review Issue

```typescript
interface ReviewIssue {
  id: string;
  review_result_id: string;
  category: 'family_consideration' | 'legal_error' | 'missing_information' | 'unclear_language';
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'low' | 'medium';
  page_reference?: number;
  section_reference?: string;
  suggested_fix?: string;
  resolved: boolean;
  created_at: Date;
}
```

### Review Recommendation

```typescript
interface ReviewRecommendation {
  id: string;
  review_result_id: string;
  category: 'best_practice' | 'family_protection' | 'legal_compliance' | 'optimization';
  title: string;
  description: string;
  action_required: boolean;
  estimated_impact: 'high' | 'low' | 'medium';
  type: 'critical' | 'important' | 'informational' | 'suggested';
  implemented: boolean;
  created_at: Date;
}
```

## Consultation System

### Consultation

```typescript
interface Consultation {
  id: string;
  professional_id: string;
  user_id: string;
  title: string;
  description: string;
  consultation_type: 'initial' | 'follow_up' | 'review' | 'strategy';
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  scheduled_at: Date;
  duration_minutes: number;
  fee_amount: number;
  commission_rate: number;
  meeting_link?: string;
  notes?: string;
  preparation_required?: string[];
  follow_up_required: boolean;
  created_at: Date;
  updated_at: Date;
}
```

### Professional Availability

```typescript
interface ProfessionalAvailability {
  id: string;
  professional_id: string;
  day_of_week: number; // 0-6 (Sunday = 0)
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  timezone: string;
  is_available: boolean;
  recurring: boolean;
  exception_date?: Date;
  created_at: Date;
  updated_at: Date;
}
```

### Consultation Booking

```typescript
interface ConsultationBooking {
  id: string;
  consultation_id: string;
  user_id: string;
  professional_id: string;
  requested_at: Date[];
  selected_slot?: Date;
  booking_status: 'pending' | 'confirmed' | 'cancelled' | 'rescheduled';
  special_requests?: string;
  cancellation_reason?: string;
  reschedule_reason?: string;
  created_at: Date;
  updated_at: Date;
}
```

## Commission System

### Professional Commission

```typescript
interface ProfessionalCommission {
  id: string;
  professional_id: string;
  reference_id: string; // Review or consultation ID
  reference_type: 'review' | 'consultation';
  amount: number;
  commission_rate: number;
  status: 'pending' | 'approved' | 'paid' | 'disputed' | 'cancelled';
  payment_method?: 'bank_transfer' | 'check' | 'paypal' | 'stripe';
  payment_date?: Date;
  stripe_payout_id?: string;
  paypal_transaction_id?: string;
  notes?: string;
  disputed_at?: Date;
  dispute_reason?: string;
  resolved_at?: Date;
  created_at: Date;
  updated_at: Date;
}
```

### Commission Dispute

```typescript
interface CommissionDispute {
  id: string;
  commission_id: string;
  raised_by: string; // Professional or admin ID
  dispute_reason: string;
  dispute_details: string;
  requested_resolution: string;
  status: 'open' | 'under_review' | 'resolved' | 'rejected';
  resolution?: string;
  resolved_by?: string;
  resolved_at?: Date;
  created_at: Date;
  updated_at: Date;
}
```

### Commission Summary

```typescript
interface CommissionSummary {
  professional_id: string;
  period_start: Date;
  period_end: Date;
  total_earned: number;
  total_paid: number;
  total_pending: number;
  total_disputed: number;
  review_count: number;
  consultation_count: number;
  average_rating: number;
  created_at: Date;
}
```

## Quality Assurance

### Professional Rating

```typescript
interface ProfessionalRating {
  id: string;
  professional_id: string;
  user_id: string;
  reference_id: string; // Review or consultation ID
  reference_type: 'review' | 'consultation';
  rating: number; // 1-5 scale
  review_text?: string;
  categories: {
    communication: number;
    expertise: number;
    timeliness: number;
    professionalism: number;
  };
  is_verified: boolean; // From completed service
  created_at: Date;
}
```

### Quality Metric

```typescript
interface QualityMetric {
  id: string;
  professional_id: string;
  metric_type: 'response_time' | 'completion_rate' | 'revision_rate' | 'client_satisfaction';
  value: number;
  period_start: Date;
  period_end: Date;
  benchmark_value?: number;
  status: 'above_average' | 'average' | 'below_average';
  created_at: Date;
}
```

### Professional Performance

```typescript
interface ProfessionalPerformance {
  professional_id: string;
  period_start: Date;
  period_end: Date;
  metrics: {
    total_reviews: number;
    completed_reviews: number;
    average_rating: number;
    average_response_time_hours: number;
    completion_rate: number;
    revision_rate: number;
    client_satisfaction_score: number;
    total_earnings: number;
  };
  rankings: {
    overall_rank: number;
    specialization_rank: number;
    response_time_rank: number;
  };
  created_at: Date;
}
```

## Communication System

### Professional Message

```typescript
interface ProfessionalMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  message_type: 'text' | 'file' | 'system';
  content: string;
  file_url?: string;
  file_name?: string;
  read_at?: Date;
  encrypted: boolean;
  created_at: Date;
}
```

### Conversation

```typescript
interface Conversation {
  id: string;
  participants: string[]; // Array of user IDs
  conversation_type: 'review' | 'consultation' | 'general';
  reference_id?: string; // Review or consultation ID
  subject: string;
  last_message_at: Date;
  unread_count: { [userId: string]: number };
  created_at: Date;
  updated_at: Date;
}
```

## Notification System

### Professional Notification

```typescript
interface ProfessionalNotification {
  id: string;
  user_id: string;
  notification_type: 'review_assigned' | 'consultation_booked' | 'commission_paid' | 'rating_received' | 'system_update';
  title: string;
  message: string;
  reference_id?: string;
  reference_type?: string;
  read: boolean;
  action_url?: string;
  expires_at?: Date;
  created_at: Date;
}
```

## Database Schema

### Tables Overview

```sql
-- Core professional tables
professional_reviewers
professional_specializations
professional_onboarding
professional_availability

-- Review system tables
document_reviews
review_requests
review_results
review_issues
review_recommendations

-- Consultation system tables
consultations
consultation_bookings

-- Commission system tables
professional_commissions
commission_disputes
commission_summaries

-- Quality assurance tables
professional_ratings
quality_metrics
professional_performance

-- Communication tables
professional_messages
conversations

-- Notification tables
professional_notifications
```

### Indexes and Constraints

```sql
-- Performance indexes
CREATE INDEX idx_professional_reviewers_rating ON professional_reviewers(rating DESC);
CREATE INDEX idx_professional_reviewers_specializations ON professional_reviewers USING GIN(specializations);
CREATE INDEX idx_document_reviews_status ON document_reviews(status);
CREATE INDEX idx_document_reviews_reviewer ON document_reviews(reviewer_id);
CREATE INDEX idx_professional_commissions_status ON professional_commissions(status);
CREATE INDEX idx_professional_ratings_professional ON professional_ratings(professional_id);

-- Unique constraints
ALTER TABLE professional_reviewers ADD CONSTRAINT unique_bar_number UNIQUE(bar_number);
ALTER TABLE professional_onboarding ADD CONSTRAINT unique_professional_application UNIQUE(professional_id);

-- Foreign key constraints
ALTER TABLE document_reviews ADD CONSTRAINT fk_document_reviews_reviewer FOREIGN KEY (reviewer_id) REFERENCES professional_reviewers(id);
ALTER TABLE professional_commissions ADD CONSTRAINT fk_commissions_professional FOREIGN KEY (professional_id) REFERENCES professional_reviewers(id);
```

## API Contracts

### Professional Management APIs

#### GET /api/professional/profile

```typescript
interface GetProfessionalProfileRequest {
  professionalId: string;
}

interface GetProfessionalProfileResponse {
  professional: ProfessionalReviewer;
  specializations: ProfessionalSpecialization[];
  availability: ProfessionalAvailability[];
  ratings: ProfessionalRating[];
  performance: ProfessionalPerformance;
}
```

#### POST /api/professional/onboard

```typescript
interface OnboardProfessionalRequest {
  credentials: ProfessionalCredentials;
  documents: ProfessionalDocuments;
  specializations: string[];
  availability: AvailabilitySchedule;
}

interface OnboardProfessionalResponse {
  onboardingId: string;
  status: 'submitted';
  estimatedReviewTime: string;
}
```

### Review Management APIs

#### POST /api/reviews/request

```typescript
interface RequestReviewRequest {
  documentId: string;
  reviewType: 'basic' | 'certified' | 'comprehensive';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  budgetMax?: number;
  deadline?: string;
  specializations: string[];
  instructions?: string;
}

interface RequestReviewResponse {
  reviewRequestId: string;
  estimatedCost: number;
  estimatedCompletion: string;
}
```

#### GET /api/reviews/{reviewId}/result

```typescript
interface GetReviewResultResponse {
  review: DocumentReview;
  result: ReviewResult;
  issues: ReviewIssue[];
  recommendations: ReviewRecommendation[];
  professional: {
    id: string;
    name: string;
    rating: number;
  };
}
```

### Commission APIs

#### GET /api/professional/commissions

```typescript
interface GetCommissionsRequest {
  professionalId: string;
  status?: 'pending' | 'approved' | 'paid';
  period?: {
    start: string;
    end: string;
  };
  limit?: number;
  offset?: number;
}

interface GetCommissionsResponse {
  commissions: ProfessionalCommission[];
  summary: {
    totalEarned: number;
    totalPaid: number;
    totalPending: number;
  };
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}
```

### Consultation APIs

#### POST /api/consultations/book

```typescript
interface BookConsultationRequest {
  professionalId: string;
  consultationType: 'initial' | 'follow_up' | 'review' | 'strategy';
  preferredSlots: string[]; // ISO date strings
  duration: number; // minutes
  topic: string;
  specialRequests?: string;
}

interface BookConsultationResponse {
  consultationId: string;
  scheduledAt: string;
  meetingLink: string;
  preparationNotes?: string[];
}
```

## Data Flow Diagrams

### Professional Onboarding Flow

```text
Professional Application → Document Upload → Credential Verification → Background Check → Profile Creation → Availability Setup → Active Status
```

### Review Request Flow

```text
Client Request → Professional Matching → Bid Process → Assignment → Review Work → Quality Check → Completion → Payment Processing
```

### Commission Calculation Flow

```text
Service Completion → Commission Calculation → Quality Validation → Approval Process → Payment Scheduling → Payout Execution → Record Keeping
```

## Security Considerations

### Data Encryption

- Professional credentials encrypted at rest
- Client-professional communications encrypted end-to-end
- Document reviews encrypted during transmission
- Commission data encrypted in database

### Access Control

- Role-based access control (RBAC) for professional operations
- Row-level security (RLS) for data isolation
- Multi-factor authentication for sensitive operations
- API rate limiting and abuse prevention

### Audit Logging

- All professional actions logged with timestamps
- Commission transactions fully auditable
- Review quality decisions tracked
- Access attempts monitored and logged

## Performance Optimization

### Database Optimization

- Partitioning for large commission tables
- Materialized views for performance metrics
- Connection pooling for high concurrency
- Query result caching with Redis

### API Optimization

- Response compression for large datasets
- Pagination for list endpoints
- ETag headers for caching
- Background processing for heavy operations

### Caching Strategy

- Professional profile caching
- Search result caching
- Commission summary caching
- Availability schedule caching

## Monitoring and Analytics

### Key Metrics

- Professional onboarding conversion rate
- Review completion time and quality
- Commission processing efficiency
- Client satisfaction scores
- System performance and availability

### Alerting

- Failed commission payments
- Professional verification delays
- Review quality issues
- System performance degradation
- Security incidents

This data model provides a comprehensive foundation for the Professional Network system, supporting all required functionality while maintaining security, performance, and scalability requirements.
