# Schwalbe Documentation (Evidence-backed extraction from Hollywood)

Purpose
- Rebuild Schwalbe as a “reborn Hollywood,” preserving intent and architecture while adapting to Schwalbe-specific rules (e.g., Supabase logging instead of Sentry, environment-controlled redirect behavior).
- Each section cites the Hollywood source material by absolute path and line ranges to ensure traceability and reduce risk of mistakes.

Documentation Index
- Architecture: ./architecture/overview.md
- Environment Variables: ./env/environment-variables.md
- i18n Strategy: ./i18n/strategy.md
- Deployment Strategy: ./deployment/strategy.md
- Security Overview: ./security/overview.md
- Domain Redirect Strategy: ./domain/redirect-strategy.md
- API Overview: ./api/overview.md
- Migration Mapping: ./migration/hollywood-to-schwalbe-mapping.md
- Rebuild Checklist: ./checklists/rebuild-checklist.md
- Open Questions: ./open-questions.md

Notes on Adaptations for Schwalbe
- Error tracking: Replace Sentry with Supabase logging and structured console.error + DB table + email alerts via Resend (per project rules).
- Redirects: Behavior is controlled via VITE_IS_PRODUCTION; in non-production show Czech simulation message; in production perform real redirects (per project rules).
- Language and i18n: Keep all documentation and code comments in English; UI supports extended languages with specified adjustments (see i18n strategy).

Source Evidence Highlights
- Monorepo purpose and structure: /Users/luborfedak/Documents/Github/hollywood/docs/README.md:9-23
- Feature scope (web & mobile): /Users/luborfedak/Documents/Github/hollywood/docs/README.md:59-79
- Architecture & tech stack: /Users/luborfedak/Documents/Github/hollywood/docs/DEVELOPER_GUIDE_EN.md:18-53,107-130
- API scope (OpenAPI): /Users/luborfedak/Documents/Github/hollywood/docs/api/openapi.yaml:1-16,28-45

