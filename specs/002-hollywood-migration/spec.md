# Schwalbe: Hollywood Migration (Infrastructure & Core Packages)

- Systematic migration of production-ready components from hollywood to schwalbe monorepo.
- Focus on infrastructure, build tooling, and core packages that provide immediate development velocity.
- Prerequisite: 001-reboot-foundation completed.

## Goals

- Migrate proven monorepo infrastructure (Turborepo, TypeScript configs, build pipelines).
- Copy battle-tested core packages: `@schwalbe/ui`, `@schwalbe/shared`, `@schwalbe/logic`.
- Port working CI/CD, testing, and development tooling.
- Establish security foundations (encryption, auth patterns) from hollywood.
- Preserve and adapt i18n for MVP (EN/CS/SK/DE/UK) with legal terminology; prepare production target of 34 languages per i18n matrix doc.

### Core packages and integrations to include

- Notifications & Email system (transactional + lifecycle): service abstraction, templates, delivery providers
- OCR/AI services: document OCR, summarization, categorization, suggestion pipelines
- Storybook/UI: component docs, visual regression baseline, theme tokens
- Security improvements: CSP, Trusted Types, encryption, key mgmt, audit logging
- Stripe implementation: products/prices, payment links, subscriptions, invoices

## Non-Goals (out of scope)

- Migrating specific application features (Sofia AI, will creation, document vault).
- Copying full web/mobile app implementations.
- Database schema migration or Supabase setup.
- Third-party service integrations (Stripe, Clerk, Google Vision).

Note: While deep product integrations are not fully implemented here, we must migrate the reusable package-level scaffolding and abstractions for notifications/email, OCR/AI, Storybook/UI, security, and Stripe so Phase 003 can plug them in rapidly.

## Review & Acceptance

- [ ] Migration strategy approved: selective copy vs full clone approach
- [ ] Core packages structure validated: UI components, shared services, business logic
- [ ] Build tooling verified: Turbo pipelines, TypeScript Project References, ESLint configs
- [ ] Security patterns established: client-side encryption, zero-knowledge architecture  
- [ ] i18n system migrated: MVP languages (EN/CS/SK/DE/UK) translation files, localization utilities, jurisdiction-aware content; production target (34 languages) prepared with validation tooling
- [ ] Notifications/email foundations migrated: template engine, provider adapter, send pipeline
- [ ] OCR/AI foundations migrated: service interface, job queue pattern, parsers
- [ ] Storybook configured for `@schwalbe/ui` with key stories and docs
- [ ] Security hardening applied: CSP, Trusted Types, encryption utils validated
- [ ] Stripe scaffolding in `@schwalbe/shared` ready: client factory, domain types
- [ ] Testing infrastructure ready: Jest, Playwright, coverage reporting
- [ ] Development workflow functional: dev server, hot reload, debugging tools
- [ ] CI/CD pipelines active: lint, typecheck, test, build verification
- [ ] Package boundaries enforced: dependency direction rules, import restrictions
- [ ] 004 prerequisites satisfied (schemas and functions available for DMS)

## Risks & Mitigations

- Hollywood coupling to specific services → Extract service interfaces; use dependency injection patterns.
- Monorepo complexity overwhelming → Migrate incrementally; start with packages before apps.
- Hollywood tech debt carrying over → Cherry-pick clean implementations; refactor during copy.
- Version conflicts between hollywood and schwalbe → Pin versions; audit dependencies before copy.

### Feature-specific risks

- Email deliverability variance → Keep provider-agnostic adapter (e.g., Resend/SES) and test with sandbox
- OCR quality differences → Abstract OCR provider; enable local mock for deterministic tests
- AI dependencies and costs → Gate behind feature flags and use offline fixtures for CI
- Storybook drift vs production UI → Embed tokens and composition identical to app theme
- Stripe test vs live data → Provide strict environment separation and seeded products/prices

## References

- See `../ORDER.md` for canonical execution order of all specs.
- See `../../docs/i18n/matrix.md` for the i18n language matrix (MVP 5, production 34).

- Hollywood monorepo at `/Users/luborfedak/Documents/Github/hollywood`
- 001-reboot-foundation spec for monorepo standards
- Hollywood's proven architecture patterns and build configurations

## Linked design docs

- See `research.md` for hollywood architecture analysis and component catalog
- See `data-model.md` for service interfaces and data contracts
- See `plan.md` for detailed migration phases and implementation steps
- See `tasks.md` for ordered migration checklist

## Hollywood's customer experience and business logic gold

The following represent differentiated assets to be preserved as patterns and scaffolding in this phase, with full feature build-out targeted in 003:

- Sofia AI system – emotional intelligence core
  - Sofia AI core logic and personality system
  - Firefly animation components and physics
  - Context-aware guidance system (journey- and state-aware prompts)
  - Celebration animations and milestone system
  - Landing page with 3‑act story and firefly
  - Onboarding flow with empathy-first journey
  - Family viral growth and gamification system
  - Animation system and wow‑moment micro‑interactions
  - Professional network B2B2C monetization
  - Time capsule innovation and legacy features

In 002 we migrate the UI primitives, animation library foundations, event hooks, and service interfaces that these depend on. Concrete product flows are delivered in 003.

## Business philosophy, customer journeys, pricing

- Customer journey maps: import as documentation and Storybook MDX references
- Pricing psychology and conversion funnels: migrate Stripe product/price types, plan taxonomy, and funnel event schema; defer pricing experiments to 003 but ensure analytics hooks are present.

## Cross-links

- Downstream: `../004-dead-man-switch/`
