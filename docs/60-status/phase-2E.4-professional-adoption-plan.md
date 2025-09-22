# Phase 2E.4 – Hollywood Professional Network Adoption Plan

Scope: Adopt Hollywood professional network components/services into Schwalbe web app incrementally, maintaining working builds at each step.

Adoption sequence
1) Reviewer cards and directory (enhanced)
   - Components: ProfessionalCard, ProfessionalDirectory (filters: specialization, jurisdiction, rating), pagination
   - Services: searchReviewers, getNetworkDirectory
   - Dependencies: types/professional, shared UI tokens
   - Supabase: professional_reviewers, professional_specializations
   - Risks: data shape differences; mitigate with adapter layer

2) Professional onboarding + dashboards
   - Components: ProfessionalOnboardingFlow, AttorneyDashboard, CommissionTrackingDashboard
   - Services: submitApplication, updateApplicationStatus, getApplicationByUserId
   - Supabase: professional_onboarding
   - Risks: RLS policies not yet applied; keep read paths behind mocks until DB migrations are approved

3) Review request workflow
   - Components: ReviewRequestWorkflow
   - Services: createReviewRequest, assignReviewRequest, getUserRequests
   - Supabase: review_requests, document_reviews
   - Risks: multiple table deps; stub in-memory state until DB ready

4) Consultations and scheduling
   - Components: ConsultationBooking (lite)
   - Services: bookConsultation, getUserConsultations, updateStatus
   - Supabase: consultations
   - Risks: time zones; keep UTC in first pass

5) Real-time notifications and updates
   - Services: Realtime channel subscriptions for documents/professional_reviews
   - UI: small toast notifications and inbox
   - Risks: env availability; feature flag and silent no-op

6) Partnerships and templates
   - Components: PartnerTemplateGallery, PartnershipSettings (lite)
   - Services: TBD (defer until core flows stable)

Adapters and guards
- Adapter functions to normalize Hollywood data shapes to Schwalbe types
- Feature flag gates around non-critical surfaces
- Reduced-motion guard around animations

Rollout checkpoints
- Each step merges with: build green, basic tests (type checks), minimal demo page updates
- Revisit RLS and DB migrations only after UI/services stabilized

