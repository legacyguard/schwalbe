# Research summary (from LegacyGuard product manual)

## Product scope

- Family-centric digital estate platform: organize documents, protect in crises, preserve legacy.
- Three pillars: Presence (today’s life), Protection (crisis readiness), Legacy (future impact).

## Core user flows

- Narrative onboarding with assistant (Sofia) → define priorities, trust key, initial milestones.
- First quick win: capture ID, AI OCR → structured profile; dashboard seeds progress.
- Dashboard (“Family Shield”) with milestones, active challenges, areas overview.
- Family center: interactive family tree, role assignments (heir, guardian, executor, emergency).
- Will generator: jurisdiction-aware wizard, real-time validation, asset linking, messages.
- Guardians network with staged emergency access; activation triggers and escalation.
- Video messages (time capsules) with scheduled delivery.
- Smart document import (Gmail) with AI classification and metadata extraction.

## Entities (high level)

- User, FamilyMember, Relationship, RoleAssignment (heir/guardian/executor/etc.)
- Document, DocumentVersion, Bundle (e.g., vehicle, property), Category, Metadata
- Will, Bequest, Executor, LegalTemplate, Jurisdiction
- Guardian, EmergencyTrigger, AccessPolicy, AuditEvent
- Professional, ReviewRequest, Consultation, Commission, Specialization
- Notification, Suggestion, Milestone, Achievement
- VideoMessage (time capsule)

## Feature highlights

- AI-powered classification, OCR, suggestions; staged emergency access; legal validation; professional network.
- i18n and geolocation-driven domain/language selection.

## Technical/UX notes

- Keep React 18 baseline; use framer-motion for selective high-impact scenes.
- Per-app i18n assets; shared runtime helpers.
- Client-side encryption for sensitive data; strict RLS on backend (Supabase).

## Open questions

- Exact MVP scope for Schwalbe vs full manual: which modules are day-1?
- Jurisdictions to launch first (SK, CZ confirmed?)
- Professional network timing for MVP.
