# Family Shield Emergency - Crisis Response and Access Control

- Implementation of comprehensive emergency access system with guardian verification and inactivity monitoring
- Secure token-based access control for family shield activation
- Automated inactivity detection with configurable thresholds and guardian notifications
- Multi-channel emergency communication and access staging

## Goals

- Migrate and enhance Hollywood emergency system components for Schwalbe
- Implement secure guardian verification and access control mechanisms
- Create automated inactivity monitoring with configurable thresholds
- Build emergency protocol activation system with multi-guardian confirmation
- Establish comprehensive audit logging for all emergency access activities
- Integrate with existing vault encryption and document access systems
- Provide survivor manual generation and emergency contact management
- Ensure compliance with privacy regulations and secure data handling

## Non-Goals (out of scope)

- Real-time health monitoring or medical emergency detection
- Automatic emergency service notifications (police, medical)
- Integration with external emergency response systems
- Voice-based emergency communication
- Cross-platform mobile emergency alerts

## Review & Acceptance

- [ ] Emergency access verification system migrated from Hollywood
- [ ] Guardian verification and access control implemented
- [ ] Inactivity monitoring with configurable thresholds working
- [ ] Emergency protocol activation with multi-guardian confirmation
- [ ] Hashed, single-use token generation and validation with expiry operational; no raw tokens stored
- [ ] All emergency tables have RLS enabled; policies tested (owner vs guardian) per 005-auth-rls-baseline
- [ ] Audit logging for all emergency access activities
- [ ] Survivor manual generation and emergency contacts management
- [ ] Integration with vault encryption and document access
- [ ] Privacy compliance and secure data handling verified
- [ ] Observability baseline: structured logs in Supabase Edge Functions and critical email alerts via Resend; no Sentry
- [ ] End-to-end emergency simulation testing completed

## Risks & Mitigations

- Emergency access abuse → Multi-guardian verification and audit logging
- False inactivity detection → Configurable thresholds and grace periods
- Guardian communication failures → Multi-channel notification system
- Token security vulnerabilities → Secure token generation and expiration
- Privacy data exposure → End-to-end encryption and access controls
- System availability during emergencies → Redundant systems and failover

## References

- Hollywood emergency system implementation (`/Users/luborfedak/Documents/Github/hollywood`)
- Emergency access verification function (`verify-emergency-access`)
- Family shield activation function (`activate-family-shield`)
- Inactivity monitoring function (`check-inactivity`)
- Guardian management system and permissions
- Emergency access tokens and audit logging

## Cross-links

- See 001-reboot-foundation/spec.md for core infrastructure
- See 003-hollywood-migration/spec.md for migration patterns
- See 031-sofia-ai-system/spec.md for AI integration
- See 006-document-vault/spec.md for vault encryption
- See 023-will-creation-system/spec.md for will generation
- See 025-family-collaboration/spec.md for family features
- See 026-professional-network/spec.md for professional integration
- See 020-emergency-access/spec.md for emergency access foundation
- See 029-mobile-app/spec.md for mobile integration
- See 005-auth-rls-baseline/spec.md for authentication and RLS conventions
- See 015-database-types/spec.md for database schema
- See 008-billing-stripe/spec.md for billing integration
- See 007-email-resend/spec.md for email notifications
- See 016-vault-encrypted-storage/spec.md for encrypted storage

## Linked design docs

- See `research.md` for emergency system capabilities and user experience research
- See `data-model.md` for emergency system data structures and relationships
- See `quickstart.md` for emergency system interaction flows and testing scenarios

## Baseline Notes: Identity, RLS, Tokens, Observability

- Identity: Supabase Auth is the identity provider; see 005-auth-rls-baseline for conventions and bridging guidance.
- RLS: Enable RLS on all emergency tables; default to owner-only access; minimal guardian access must be proven via joins; write positive/negative policy tests.
- Tokens: Store only hashed tokens with `expires_at` and `used_at`; tokens are single-use and never logged; URLs contain opaque tokens only (no identifiers).
- Observability: Use structured logs in Supabase Edge Functions and critical email alerts via Resend. Do not use Sentry in this project.
