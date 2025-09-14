# Schwalbe: Core Features (Sofia AI & Essential Systems)

- Implementation of core LegacyGuard features that provide unique competitive advantage.
- Focus on Sofia AI system, document management, and foundational user experience.
- Prerequisites: 001-reboot-foundation and 003-hollywood-migration completed.

## Goals

- Implement Sofia AI assistant with multi-personality system and adaptive behavior.
- Create secure document vault with client-side encryption and AI-powered organization.
- Build authentication flows and user onboarding with progressive disclosure.
- Establish dashboard framework with milestone tracking and progress visualization.
- Implement core navigation and layout patterns for estate planning workflows.

## Non-Goals (out of scope)

- Advanced estate planning features (will creation, family collaboration, professional network).
- Emergency access systems and dead man's switch functionality (covered in 018).
- Mobile application features and cross-platform synchronization.
- Payment processing and subscription management.
- Advanced legal validation and jurisdiction-specific templates.

## Review & Acceptance

- [ ] Sofia AI system operational: personality switching, conversation management, contextual responses
- [ ] Document vault functional: upload, encryption, categorization, search, AI analysis
- [ ] Authentication complete: sign-up/sign-in flows, profile management, session handling
- [ ] Dashboard framework ready: layout, navigation, progress tracking, milestone system
- [ ] User onboarding implemented: progressive disclosure, guided setup, initial value demonstration
- [ ] AI-powered features working: document analysis, smart suggestions, content generation
- [ ] Security patterns validated: client-side encryption, zero-knowledge data flow, audit logging
- [ ] Performance optimized: lazy loading, bundle splitting, caching strategies
- [ ] Accessibility compliant: screen reader support, keyboard navigation, WCAG 2.1 AA standards

## Cross-links

- See ../033-landing-page/spec.md for public navigation patterns (header, search, support, Buy)
- See `../018-dead-man-switch/` for emergency system scope.

## Risks & Mitigations

- AI model costs and rate limiting → Implement efficient caching; batch requests; use appropriate model tiers.
- Complex state management across AI interactions → Use established patterns; maintain conversation context carefully.
- Client-side encryption performance impact → Optimize crypto operations; use Web Workers for heavy operations.
- Document storage and retrieval at scale → Implement pagination; use virtual scrolling; optimize queries.

## References

- Hollywood Sofia AI implementation for personality system patterns
- Hollywood document vault for encryption and organization patterns  
- Sofia personality research and behavioral modeling from hollywood docs
- AI integration patterns and conversation management from hollywood implementation

## Linked design docs

- See `research.md` for Sofia AI architecture and personality system analysis
- See `data-model.md` for AI conversation models and document schemas
- See `plan.md` for implementation phases and integration patterns
- See `tasks.md` for detailed development checklist and acceptance criteria
