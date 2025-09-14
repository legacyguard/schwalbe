# i18n & Country Rules - Internationalization and Localization System

- Implementation of Phase 6 — i18n + Country Rules from high-level-plan.md
- Single i18n layer for Next.js using next-intl with modular JSON locales
- Country-specific rules compliance and language detection system
- Google Translate API integration for background translation generation

## Goals

- Adopt single i18n layer for Next.js (next-intl) in apps/web-next only
- Import and curate modular JSON locales from Hollywood i18n system
- Implement Google Translate API for background generation and fallback
- Establish i18n health checks in CI pipeline
- Implement country-specific rules: remove Russian from Germany, remove Ukrainian from Iceland/Liechtenstein, ensure 4+ languages per country
- Ensure all UI text outside i18n files is English
- Create language detection and auto-switching system for both web and mobile; if browser/device language is not supported, fall back to English automatically
- Build translation management and compliance validation system

## Non-Goals (out of scope)

- Complete rewrite of existing Hollywood i18n system (migrate and adapt)
- Real-time translation features beyond background generation
- Custom language pack creation tools
- Advanced translation memory systems
- Multi-language AI responses (English only initially)

## Review & Acceptance

- [ ] next-intl integration completed in apps/web-next
- [ ] Modular JSON locales imported and curated from Hollywood
- [ ] Google Translate API wired for background generation
- [ ] i18n health checks passing in CI pipeline
- [ ] Country rules compliance: Russian removed in Germany, Ukrainian removal from Iceland/Liechtenstein, 4+ languages per country
- [ ] All UI text outside i18n files is English
- [ ] Language detection and auto-switching working
- [ ] Translation management system functional
- [ ] Performance meets target metrics (bundle size < 10% increase)
- [ ] Accessibility compliance for i18n features

## Risks & Mitigations

- Translation quality issues → Human-curated fixes and fallback mechanisms
- Bundle size increase → Lazy loading and code splitting for locales
- Country rule violations → Automated compliance checks and validation
- Language detection accuracy → Fallback to browser language with user override
- Google Translate API costs → Caching and rate limiting
- Missing translations → Comprehensive health checks and CI blocking

## References

- Hollywood i18n system (`/Users/luborfedak/Documents/Github/hollywood/locales/`)
- next-intl documentation and best practices
- Google Translate API documentation
- i18n accessibility guidelines
- Country-specific legal requirements for language support

## Cross-links

- See ../033-landing-page/spec.md for global header, multi-domain country selector, and MVP domain/language UX
- See 001-reboot-foundation/spec.md for foundation setup
- See 003-hollywood-migration/spec.md for migration patterns
- See 031-sofia-ai-system/spec.md for AI integration points
- See 006-document-vault/spec.md for document translation needs
- See 023-will-creation-system/spec.md for legal document i18n
- See 025-family-collaboration/spec.md for family communication i18n
- See 026-professional-network/spec.md for professional content i18n
- See 020-emergency-access/spec.md for emergency communication i18n
- See 029-mobile-app/spec.md for mobile i18n requirements
- See 013-animations-microinteractions/spec.md for animation text i18n
- See 022-time-capsule-legacy/spec.md for legacy content i18n
- See 028-pricing-conversion/spec.md for pricing display i18n
- See 027-business-journeys/spec.md for business logic i18n
- See 004-integration-testing/spec.md for i18n testing requirements
- See 010-production-deployment/spec.md for deployment i18n
- See 011-monitoring-analytics/spec.md for i18n analytics
- See 002-nextjs-migration/spec.md for Next.js integration
- See 020-auth-rls-baseline/spec.md for auth i18n
- See 021-database-types/spec.md for database i18n support
- See 008-billing-stripe/spec.md for billing i18n
- See 007-email-resend/spec.md for email i18n

## Linked design docs

- See `research.md` for i18n capabilities and user experience research
- See `data-model.md` for i18n data structures and relationships
- See `quickstart.md` for i18n interaction flows and testing scenarios
