# Professional Network Quick Start Guide

## Overview

This guide provides quick start instructions for implementing and testing the Professional Network system. It covers the essential workflows, API usage, and testing scenarios to validate the professional verification, review system, consultation booking, and commission tracking functionality.

## Prerequisites

### System Requirements

- Node.js 18+ and npm
- Supabase project with database
- Stripe account for payments
- Supabase Auth configured
- Hollywood codebase access for migration

### Environment Setup

```bash
# Clone repositories
git clone https://github.com/your-org/schwalbe.git
git clone https://github.com/your-org/hollywood.git

# Install dependencies
cd schwalbe
npm ci

# Set up environment variables
cp .env.example .env.local
# Configure Supabase, Stripe, Resend credentials
```

### Security Verification Checklist

- Identity: Supabase Auth only (no Clerk)
- Row Level Security (RLS): enable and test on these tables at minimum
  - professional_reviewers
  - document_reviews
  - consultations
  - professional_commissions
  - professional_specializations (junction)
- Owner-first default policies examples:

```sql
-- Professional reviewers
ALTER TABLE professional_reviewers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Select own profile"
ON professional_reviewers
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Update own profile"
ON professional_reviewers
FOR UPDATE
USING (auth.uid() = user_id);

-- Reviews
ALTER TABLE document_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Client reads own reviews"
ON document_reviews
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Reviewer reads assigned reviews"
ON document_reviews
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM professional_reviewers pr
  WHERE pr.id = reviewer_id AND pr.user_id = auth.uid()
));

-- Consultations
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants read consultations"
ON consultations
FOR SELECT
USING (
  auth.uid() = user_id OR
  auth.uid() = (SELECT user_id FROM professional_reviewers WHERE id = professional_id)
);
```

- Token handling:
  - Only hashed single-use tokens with expires_at; store token_hash only; never log raw tokens
  - For server-to-server, use Supabase service role in Edge Functions; never expose to clients

- Observability baseline:
  - Structured logging in Supabase Edge Functions: include requestId, userId, path, status, latency; redact PII
  - Critical alerts via Resend; no Sentry

- Verification tests:
  - Positive/negative RLS tests using two distinct users; unauthorized access should return 0 rows

```ts
// Negative test for cross-tenant access
const { data: otherUserReviews } = await supabaseClientAsA
  .from('document_reviews')
  .select('*')
  .eq('user_id', userBId);
expect(otherUserReviews).toHaveLength(0);
```

## Core Workflows

### 1. Professional Onboarding Flow

#### API: Submit Professional Application

```typescript
const applicationData = {
  credentials: {
    full_name: "Sarah Johnson",
    email: "sarah.johnson@lawfirm.com",
    bar_number: "CA123456",
    licensed_states: ["CA", "NV"],
    professional_title: "Attorney at Law",
    specializations: ["estate_planning", "family_law"]
  },
  documents: {
    bar_license: "https://storage.example.com/bar-license.pdf",
    resume: "https://storage.example.com/resume.pdf"
  },
  experience_years: 8,
  hourly_rate: 350
};

const response = await fetch('/api/professional/onboard', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(applicationData)
});

const result = await response.json();
// Returns: { onboardingId: "uuid", status: "submitted" }
```

#### Verification Process

```typescript
// Admin verification endpoint
const verificationData = {
  onboardingId: "uuid",
  status: "verified",
  reviewNotes: "Credentials verified with California Bar Association"
};

await fetch('/api/admin/professional/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(verificationData)
});
```

### 2. Document Review Flow

#### API: Request Document Review

```typescript
const reviewRequest = {
  documentId: "doc-uuid",
  reviewType: "comprehensive",
  priority: "high",
  budgetMax: 500,
  deadline: "2024-02-01T00:00:00Z",
  requiredSpecializations: ["estate_planning"],
  familyContext: {
    business_interests: true,
    complex_assets: false,
    family_members_count: 4,
    minor_children: true
  },
  specialInstructions: "Focus on asset protection for minor children"
};

const response = await fetch('/api/reviews/request', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(reviewRequest)
});

const result = await response.json();
// Returns: { reviewRequestId: "uuid", estimatedCost: 450 }
```

#### Professional Review Assignment

```typescript
// Professional accepts review assignment
const assignmentData = {
  reviewId: "review-uuid",
  estimatedHours: 4,
  notes: "Will focus on asset protection clauses"
};

await fetch('/api/professional/reviews/accept', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(assignmentData)
});
```

#### Submit Review Results

```typescript
const reviewResult = {
  reviewId: "review-uuid",
  overallStatus: "approved_with_changes",
  legalComplianceScore: 85,
  summary: "Will is legally sound with minor improvements needed",
  detailedFeedback: "The will adequately protects assets but could benefit from more specific guardianship provisions.",
  issuesFound: [
    {
      category: "family_consideration",
      title: "Guardianship for minor children",
      description: "More specific guardianship provisions recommended",
      severity: "medium",
      suggestedFix: "Add detailed guardianship nominations"
    }
  ],
  recommendations: [
    {
      category: "family_protection",
      title: "Enhanced asset protection",
      description: "Consider adding spendthrift provisions",
      actionRequired: false,
      estimatedImpact: "medium",
      type: "suggested"
    }
  ],
  nextSteps: [
    "Review guardianship nominations",
    "Consider asset protection trust",
    "Update beneficiary designations"
  ],
  trustScoreImpact: 5
};

await fetch('/api/professional/reviews/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(reviewResult)
});
```

### 3. Consultation Booking Flow

#### API: Book Consultation

```typescript
const bookingRequest = {
  professionalId: "prof-uuid",
  consultationType: "initial",
  preferredSlots: [
    "2024-01-15T14:00:00Z",
    "2024-01-16T10:00:00Z",
    "2024-01-17T15:30:00Z"
  ],
  duration: 60,
  topic: "Estate planning for blended family",
  specialRequests: "Prefer phone consultation due to time zone difference"
};

const response = await fetch('/api/consultations/book', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(bookingRequest)
});

const result = await response.json();
// Returns: { consultationId: "uuid", scheduledAt: "2024-01-15T14:00:00Z" }
```

#### Professional Availability Management

```typescript
const availabilityData = {
  professionalId: "prof-uuid",
  schedule: [
    {
      dayOfWeek: 1, // Monday
      startTime: "09:00",
      endTime: "17:00",
      timezone: "America/Los_Angeles",
      isAvailable: true
    },
    {
      dayOfWeek: 3, // Wednesday
      startTime: "09:00",
      endTime: "17:00",
      timezone: "America/Los_Angeles",
      isAvailable: true
    }
  ]
};

await fetch('/api/professional/availability', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(availabilityData)
});
```

### 4. Commission Tracking Flow

#### API: View Commission Summary

```typescript
const response = await fetch('/api/professional/commissions?period=current_month', {
  method: 'GET',
  headers: { 'Authorization': 'Bearer token' }
});

const result = await response.json();
// Returns: {
//   commissions: [...],
//   summary: {
//     totalEarned: 2500,
//     totalPaid: 2000,
//     totalPending: 500
//   }
// }
```

#### Process Commission Payment

```typescript
const paymentData = {
  commissionId: "commission-uuid",
  paymentMethod: "bank_transfer",
  notes: "Monthly commission payout"
};

await fetch('/api/admin/commissions/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(paymentData)
});
```

## Testing Scenarios

### 1) Professional Registration - sign up as professional

```typescript
describe('Professional Registration', () => {
  test('should allow professional to sign up and create profile', async () => {
    // Create professional account
    const professionalData = {
      email: 'attorney@example.com',
      password: 'securePassword123',
      fullName: 'John Smith',
      barNumber: 'CA123456',
      licensedStates: ['CA'],
      specializations: ['estate_planning']
    };

    const response = await registerProfessional(professionalData);
    expect(response.success).toBe(true);
    expect(response.professionalId).toBeDefined();

    // Verify profile creation
    const profile = await getProfessionalProfile(response.professionalId);
    expect(profile.verificationStatus).toBe('pending');
    expect(profile.specializations).toContain('estate_planning');
  });
});
```

### 2) Verification Process - complete verification

```typescript
describe('Professional Verification', () => {
  test('should complete professional verification process', async () => {
    // Submit verification documents
    const verificationData = {
      professionalId: 'prof-123',
      barLicense: 'license-document.pdf',
      resume: 'professional-resume.pdf',
      insuranceCertificate: 'liability-insurance.pdf'
    };

    const submission = await submitVerificationDocuments(verificationData);
    expect(submission.status).toBe('submitted');

    // Admin approves verification
    await approveProfessionalVerification(submission.id);

    // Verify status update
    const verified = await getProfessionalProfile('prof-123');
    expect(verified.verificationStatus).toBe('verified');
    expect(verified.profileVerified).toBe(true);
  });
});
```

### 3) Review Submission - submit review

```typescript
describe('Review Submission', () => {
  test('should allow professional to submit document review', async () => {
    // Create review assignment
    const assignment = await assignReviewToProfessional('review-123', 'prof-456');
    expect(assignment.status).toBe('assigned');

    // Submit review results
    const reviewData = {
      reviewId: 'review-123',
      overallStatus: 'approved_with_changes',
      legalComplianceScore: 85,
      summary: 'Document is legally sound with minor improvements',
      issuesFound: [{
        category: 'family_consideration',
        title: 'Guardianship provisions',
        severity: 'medium',
        suggestedFix: 'Add specific guardianship nominations'
      }],
      recommendations: [{
        category: 'family_protection',
        title: 'Asset protection trust',
        type: 'suggested',
        actionRequired: false
      }]
    };

    const submission = await submitReviewResults(reviewData);
    expect(submission.status).toBe('completed');
    expect(submission.complianceScore).toBe(85);
  });
});
```

### 4) Consultation Booking - book consultation

```typescript
describe('Consultation Booking', () => {
  test('should allow client to book consultation with professional', async () => {
    // Check professional availability
    const availability = await getProfessionalAvailability('prof-789');
    expect(availability.length).toBeGreaterThan(0);

    // Book consultation
    const bookingData = {
      professionalId: 'prof-789',
      clientId: 'client-123',
      consultationType: 'initial',
      preferredSlots: ['2024-01-15T14:00:00Z', '2024-01-16T10:00:00Z'],
      duration: 60,
      topic: 'Estate planning consultation'
    };

    const booking = await bookConsultation(bookingData);
    expect(booking.status).toBe('confirmed');
    expect(booking.scheduledAt).toBeDefined();
    expect(booking.meetingLink).toBeDefined();
  });
});
```

### 5) Payment Processing - process payment

```typescript
describe('Payment Processing', () => {
  test('should process payment for professional services', async () => {
    // Complete service (review/consultation)
    const service = await completeService('service-456');
    expect(service.status).toBe('completed');

    // Calculate commission
    const commission = await calculateCommission('service-456');
    expect(commission.amount).toBeGreaterThan(0);
    expect(commission.status).toBe('pending');

    // Process payment
    const payment = await processCommissionPayment(commission.id, {
      paymentMethod: 'stripe',
      bankAccount: 'acct_123456789'
    });

    expect(payment.status).toBe('paid');
    expect(payment.transactionId).toBeDefined();
  });
});
```

### 6) Commission Tracking - track commissions

```typescript
describe('Commission Tracking', () => {
  test('should track and display professional commissions', async () => {
    // Get commission summary
    const summary = await getCommissionSummary('prof-789', 'current_month');
    expect(summary.totalEarned).toBeDefined();
    expect(summary.totalPaid).toBeDefined();
    expect(summary.pendingAmount).toBeDefined();

    // Verify commission details
    const commissions = await getProfessionalCommissions('prof-789');
    expect(commissions.length).toBeGreaterThan(0);

    commissions.forEach(commission => {
      expect(commission.professionalId).toBe('prof-789');
      expect(commission.status).toBeOneOf(['pending', 'paid', 'disputed']);
      expect(commission.amount).toBeGreaterThan(0);
    });
  });
});
```

### 7) Quality Assurance - monitor quality

```typescript
describe('Quality Assurance', () => {
  test('should monitor and ensure professional service quality', async () => {
    // Submit client feedback
    const feedback = await submitClientFeedback('service-789', {
      rating: 5,
      reviewText: 'Excellent service, very thorough and professional',
      categories: {
        communication: 5,
        expertise: 5,
        timeliness: 4,
        professionalism: 5
      }
    });

    expect(feedback.success).toBe(true);

    // Check quality metrics
    const metrics = await getProfessionalQualityMetrics('prof-789');
    expect(metrics.averageRating).toBeGreaterThan(4.0);
    expect(metrics.totalReviews).toBeGreaterThan(0);
    expect(metrics.responseTimeHours).toBeLessThan(24);
  });
});
```

### 8) Performance Analytics - view analytics

```typescript
describe('Performance Analytics', () => {
  test('should provide comprehensive performance analytics', async () => {
    // Get performance dashboard data
    const analytics = await getProfessionalAnalytics('prof-789', {
      period: 'last_30_days',
      includeTrends: true
    });

    expect(analytics.summary).toBeDefined();
    expect(analytics.trends).toBeDefined();
    expect(analytics.metrics).toBeDefined();

    // Verify key metrics
    expect(analytics.summary.totalServices).toBeDefined();
    expect(analytics.summary.averageRating).toBeDefined();
    expect(analytics.summary.totalEarnings).toBeDefined();
    expect(analytics.trends.growthRate).toBeDefined();
  });
});
```

### 9) Dispute Resolution - handle disputes

```typescript
describe('Dispute Resolution', () => {
  test('should handle commission disputes effectively', async () => {
    // Create dispute
    const dispute = await createCommissionDispute('commission-123', {
      reason: 'Service not completed as agreed',
      description: 'Client claims review was incomplete',
      requestedResolution: 'Partial refund of 50%',
      evidence: ['email-correspondence.pdf', 'incomplete-review.pdf']
    });

    expect(dispute.status).toBe('open');
    expect(dispute.id).toBeDefined();

    // Admin reviews dispute
    const resolution = await resolveCommissionDispute(dispute.id, {
      decision: 'partial_refund',
      refundAmount: 50,
      adminNotes: 'Review was partially incomplete, refund approved',
      resolution: 'Issue resolved with partial refund'
    });

    expect(resolution.status).toBe('resolved');
    expect(resolution.refundAmount).toBe(50);
  });
});
```

### 10) Professional Directory - browse professionals

```typescript
describe('Professional Directory', () => {
  test('should allow clients to browse and search professionals', async () => {
    // Search professionals by specialization
    const searchResults = await searchProfessionals({
      specialization: 'estate_planning',
      location: 'California',
      minRating: 4.0,
      maxHourlyRate: 400
    });

    expect(searchResults.length).toBeGreaterThan(0);
    searchResults.forEach(professional => {
      expect(professional.specializations).toContain('estate_planning');
      expect(professional.rating).toBeGreaterThanOrEqual(4.0);
      expect(professional.hourlyRate).toBeLessThanOrEqual(400);
    });

    // Filter by availability
    const availableNow = await filterProfessionalsByAvailability(searchResults, {
      date: new Date(),
      duration: 60
    });

    expect(availableNow.length).toBeLessThanOrEqual(searchResults.length);
  });
});
```

### 11) Review Network - consultation offers

```typescript
describe('Review Network', () => {
  test('should handle consultation offers and notary matching', async () => {
    // Create consultation offer
    const offer = await createConsultationOffer({
      professionalId: 'prof-123',
      clientId: 'client-456',
      consultationType: 'will_review',
      proposedFee: 300,
      availability: ['2024-01-15T10:00:00Z', '2024-01-16T14:00:00Z'],
      specialNotes: 'Specializing in complex estate planning'
    });

    expect(offer.status).toBe('pending');
    expect(offer.proposedFee).toBe(300);

    // Client accepts offer
    const accepted = await acceptConsultationOffer(offer.id);
    expect(accepted.status).toBe('accepted');

    // Schedule consultation
    const scheduled = await scheduleConsultation(accepted.id, '2024-01-15T10:00:00Z');
    expect(scheduled.status).toBe('scheduled');
    expect(scheduled.meetingLink).toBeDefined();
  });
});
```

### 12) Specialization Management - manage specializations

```typescript
describe('Specialization Management', () => {
  test('should manage professional specializations effectively', async () => {
    // Add specialization to professional
    const updatedProfile = await addProfessionalSpecialization('prof-123', 'tax_law');
    expect(updatedProfile.specializations).toContain('tax_law');

    // Get specialization statistics
    const stats = await getSpecializationStats('tax_law');
    expect(stats.professionalCount).toBeGreaterThan(0);
    expect(stats.averageRating).toBeDefined();

    // Match professionals by specialization
    const matches = await findProfessionalsBySpecialization('tax_law', {
      minRating: 4.0,
      maxHourlyRate: 300
    });
    expect(matches.length).toBeGreaterThan(0);
    matches.forEach(professional => {
      expect(professional.specializations).toContain('tax_law');
      expect(professional.rating).toBeGreaterThanOrEqual(4.0);
    });
  });
});
```

### 13) Dispute Resolution - handle professional disputes

```typescript
describe('Dispute Resolution', () => {
  test('should handle commission and service disputes professionally', async () => {
    // Create commission dispute
    const dispute = await createCommissionDispute('commission-123', {
      reason: 'Service quality dispute',
      description: 'Client claims review was inadequate',
      requestedResolution: 'Partial refund of 30%',
      evidence: ['client-email.pdf', 'review-feedback.pdf'],
      disputeType: 'commission'
    });

    expect(dispute.status).toBe('open');
    expect(dispute.disputeType).toBe('commission');

    // Escalate dispute
    const escalated = await escalateDispute(dispute.id, {
      escalationReason: 'Unable to resolve directly',
      priority: 'high'
    });
    expect(escalated.status).toBe('escalated');

    // Resolve dispute
    const resolution = await resolveDispute(dispute.id, {
      decision: 'partial_refund',
      refundAmount: 90,
      resolutionNotes: 'Review quality was below standard, partial refund approved',
      preventiveActions: ['Additional quality training', 'Enhanced review checklist']
    });

    expect(resolution.status).toBe('resolved');
    expect(resolution.refundAmount).toBe(90);
  });
});
```

### 14) Professional Analytics - comprehensive performance tracking

```typescript
describe('Professional Analytics', () => {
  test('should provide detailed professional performance analytics', async () => {
    // Get comprehensive analytics
    const analytics = await getProfessionalAnalytics('prof-789', {
      period: 'last_90_days',
      includeTrends: true,
      includeComparisons: true
    });

    expect(analytics.performance).toBeDefined();
    expect(analytics.earnings).toBeDefined();
    expect(analytics.clientSatisfaction).toBeDefined();

    // Verify performance metrics
    expect(analytics.performance.completionRate).toBeGreaterThan(0);
    expect(analytics.performance.averageRating).toBeGreaterThan(0);
    expect(analytics.performance.responseTimeHours).toBeLessThan(48);

    // Check earnings analytics
    expect(analytics.earnings.totalEarned).toBeGreaterThan(0);
    expect(analytics.earnings.averageCommission).toBeDefined();
    expect(analytics.earnings.trends.monthlyGrowth).toBeDefined();

    // Verify client satisfaction
    expect(analytics.clientSatisfaction.overallScore).toBeGreaterThan(0);
    expect(analytics.clientSatisfaction.feedbackCategories).toBeDefined();
  });
});
```

### 15) Accessibility Testing - ensure professional accessibility

```typescript
describe('Professional Accessibility', () => {
  test('should ensure professional interfaces meet accessibility standards', async () => {
    // Test keyboard navigation
    const navigationTest = await testKeyboardNavigation('/professional/dashboard');
    expect(navigationTest.allElementsAccessible).toBe(true);
    expect(navigationTest.tabOrderLogical).toBe(true);

    // Test screen reader compatibility
    const screenReaderTest = await testScreenReaderCompatibility('/professional/profile');
    expect(screenReaderTest.announcements).toBeDefined();
    expect(screenReaderTest.landmarks).toBeDefined();

    // Test high contrast mode
    const contrastTest = await testHighContrastMode('/professional/reviews');
    expect(contrastTest.minimumRatio).toBeGreaterThanOrEqual(4.5);
    expect(contrastTest.allTextReadable).toBe(true);

    // Test focus management
    const focusTest = await testFocusManagement('/professional/availability');
    expect(focusTest.focusTrapped).toBe(true);
    expect(focusTest.focusVisible).toBe(true);
  });
});
```

### 16) End-to-End Test - complete workflow

```typescript
describe('Directory Analytics', () => {
  test('should track professional directory engagement metrics', async () => {
    // Track search interactions
    await trackDirectorySearch({
      userId: 'client-123',
      searchQuery: 'estate planning California',
      filters: { specialization: 'estate_planning', location: 'CA' },
      resultsCount: 25
    });

    // Track profile views
    await trackProfileView({
      userId: 'client-123',
      professionalId: 'prof-456',
      viewSource: 'search_results',
      timeSpent: 120 // seconds
    });

    // Get analytics data
    const analytics = await getDirectoryAnalytics('last_7_days');
    expect(analytics.totalSearches).toBeGreaterThan(0);
    expect(analytics.popularSpecializations).toBeDefined();
    expect(analytics.averageProfileViews).toBeDefined();
  });
});
```

### 13) End-to-End Test - complete workflow

```typescript
describe('End-to-End Professional Network', () => {
  test('should complete full professional network workflow', async () => {
    // 1. Professional registration
    const professional = await registerProfessional(testProfessionalData);
    expect(professional.verificationStatus).toBe('pending');

    // 2. Verification completion
    await completeVerification(professional.id);
    const verified = await getProfessionalProfile(professional.id);
    expect(verified.verificationStatus).toBe('verified');

    // 3. Client requests review
    const reviewRequest = await createReviewRequest(testDocument, testRequirements);
    expect(reviewRequest.status).toBe('posted');

    // 4. Review assignment
    await assignReview(reviewRequest.id, professional.id);
    const assigned = await getReviewRequest(reviewRequest.id);
    expect(assigned.status).toBe('assigned');

    // 5. Review completion
    await submitReview(assigned.id, testReviewResults);
    const completed = await getReviewRequest(reviewRequest.id);
    expect(completed.status).toBe('completed');

    // 6. Commission processing
    const commission = await getCommissionForReview(completed.id);
    expect(commission.status).toBe('pending');

    await processPayment(commission.id);
    const paid = await getCommissionForReview(completed.id);
    expect(paid.status).toBe('paid');

    // 7. Client feedback
    await submitFeedback(completed.id, testFeedback);
    const final = await getReviewRequest(reviewRequest.id);
    expect(final.clientRating).toBeDefined();
  });
});
```

## UI Component Usage

### Professional Network Launch Component

```tsx
import { ProfessionalNetworkLaunch } from '@/components/professional/ProfessionalNetworkLaunch';

function ProfessionalPage() {
  return (
    <ProfessionalNetworkLaunch
      variant="attorney-landing"
    />
  );
}
```

### Commission Dashboard Component

```tsx
import { CommissionTrackingDashboard } from '@/components/professional/CommissionTrackingDashboard';

function ProfessionalDashboard() {
  return (
    <CommissionTrackingDashboard
      reviewerId={currentUser.id}
      isAdmin={false}
      onExportData={handleExport}
      onProcessPayment={handlePayment}
    />
  );
}
```

## Database Setup

### Migration Scripts

```sql
-- Create professional tables
CREATE TABLE professional_reviewers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  bar_number TEXT UNIQUE,
  licensed_states TEXT[],
  specializations TEXT[],
  experience_years INTEGER,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  profile_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_professional_reviewers_rating ON professional_reviewers(rating DESC);
CREATE INDEX idx_professional_reviewers_specializations ON professional_reviewers USING GIN(specializations);

-- Enable RLS
ALTER TABLE professional_reviewers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Professional reviewers are viewable by authenticated users" ON professional_reviewers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own professional profile" ON professional_reviewers
  FOR UPDATE USING (auth.uid() = user_id);
```

## API Testing

### Using cURL

```bash
# Get professional profile
curl -X GET "https://your-api.com/api/professional/profile" \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json"

# Submit review request
curl -X POST "https://your-api.com/api/reviews/request" \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "doc-uuid",
    "reviewType": "comprehensive",
    "requiredSpecializations": ["estate_planning"]
  }'
```

### Using Postman Collection

```json
{
  "info": {
    "name": "Professional Network API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Professional Onboarding",
      "item": [
        {
          "name": "Submit Application",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"credentials\":{\"full_name\":\"Test Attorney\",\"email\":\"test@lawfirm.com\",\"bar_number\":\"TX123456\",\"licensed_states\":[\"TX\"],\"professional_title\":\"Attorney\",\"specializations\":[\"estate_planning\"]},\"experience_years\":5,\"hourly_rate\":300}"
            },
            "url": {
              "raw": "{{base_url}}/api/professional/onboard",
              "host": [
                "{{base_url}}"
              ],
              "path": [
                "api",
                "professional",
                "onboard"
              ]
            }
          }
        }
      ]
    }
  ]
}
```

## Monitoring and Debugging

### Key Metrics to Monitor

```typescript
// Professional onboarding metrics
const onboardingMetrics = {
  totalApplications: 0,
  verifiedProfessionals: 0,
  averageVerificationTime: 0,
  conversionRate: 0
};

// Review performance metrics
const reviewMetrics = {
  totalReviews: 0,
  completedReviews: 0,
  averageCompletionTime: 0,
  clientSatisfactionScore: 0
};

// Commission metrics
const commissionMetrics = {
  totalCommissions: 0,
  paidCommissions: 0,
  pendingCommissions: 0,
  averageProcessingTime: 0
};
```

### Logging Important Events

```typescript
// Professional verification events
logger.info('Professional application submitted', {
  professionalId: application.id,
  email: application.email,
  specializations: application.specializations
});

// Review completion events
logger.info('Review completed', {
  reviewId: review.id,
  professionalId: review.professionalId,
  completionTime: Date.now() - review.startedAt,
  qualityScore: review.qualityScore
});

// Commission payment events
logger.info('Commission paid', {
  commissionId: commission.id,
  professionalId: commission.professionalId,
  amount: commission.amount,
  paymentMethod: commission.paymentMethod
});
```

## Troubleshooting

### Common Issues

#### Professional Verification Stuck

```typescript
// Check verification status
const status = await getProfessionalVerificationStatus(professionalId);
if (status === 'pending') {
  // Trigger manual verification check
  await triggerVerificationCheck(professionalId);
}
```

#### Review Assignment Failing

```typescript
// Check professional availability
const availability = await getProfessionalAvailability(professionalId);
if (!availability.isAvailable) {
  // Update availability or reassign
  await updateProfessionalAvailability(professionalId, newSchedule);
}
```

#### Commission Calculation Errors

```typescript
// Recalculate commission
const correctedCommission = await recalculateCommission(reviewId);
await updateCommissionRecord(commissionId, correctedCommission);
```

## Performance Optimization

### Database Query Optimization

```sql
-- Optimized professional search
CREATE INDEX CONCURRENTLY idx_professional_search
ON professional_reviewers (rating DESC, review_count DESC)
WHERE profile_verified = true;

-- Partition commission table by month
CREATE TABLE professional_commissions_y2024m01 PARTITION OF professional_commissions
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

### Caching Strategy

```typescript
// Cache professional profiles
const cacheKey = `professional:${professionalId}`;
const profile = await redis.get(cacheKey);
if (!profile) {
  profile = await fetchProfessionalProfile(professionalId);
  await redis.setex(cacheKey, 3600, JSON.stringify(profile)); // 1 hour
}
```

### Background Processing

```typescript
// Queue commission calculations
await commissionQueue.add('calculate-commission', {
  reviewId: review.id,
  professionalId: review.professionalId
});

// Process in background worker
commissionQueue.process('calculate-commission', async (job) => {
  const { reviewId, professionalId } = job.data;
  const commission = await calculateCommission(reviewId);
  await saveCommission(commission);
});
```

This quick start guide provides the essential information needed to implement, test, and deploy the Professional Network system. Use the provided code examples, API calls, and testing scenarios to validate each component of the system.
