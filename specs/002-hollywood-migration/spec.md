# Schwalbe: Hollywood Migration (Infrastructure & Core Packages)

- Systematic migration of production-ready components from hollywood to schwalbe monorepo.
- Focus on infrastructure, build tooling, and core packages that provide immediate development velocity.
- Prerequisite: 001-reboot-foundation completed.

## Goals

- Migrate proven monorepo infrastructure (Turborepo, TypeScript configs, build pipelines).
- Copy battle-tested core packages: `@schwalbe/ui`, `@schwalbe/shared`, `@schwalbe/logic`.
- Port working CI/CD, testing, and development tooling.
- Establish security foundations (encryption, auth patterns) from hollywood.
- Preserve existing i18n system (EN/CS/SK) with legal terminology.

## Non-Goals (out of scope)

- Migrating specific application features (Sofia AI, will creation, document vault).
- Copying full web/mobile app implementations.
- Database schema migration or Supabase setup.
- Third-party service integrations (Stripe, Clerk, Google Vision).

## Review & Acceptance

- [ ] Migration strategy approved: selective copy vs full clone approach
- [ ] Core packages structure validated: UI components, shared services, business logic
- [ ] Build tooling verified: Turbo pipelines, TypeScript Project References, ESLint configs
- [ ] Security patterns established: client-side encryption, zero-knowledge architecture  
- [ ] i18n system migrated: translation files, localization utilities, jurisdiction-aware content
- [ ] Testing infrastructure ready: Jest, Playwright, coverage reporting
- [ ] Development workflow functional: dev server, hot reload, debugging tools
- [ ] CI/CD pipelines active: lint, typecheck, test, build verification
- [ ] Package boundaries enforced: dependency direction rules, import restrictions

## Risks & Mitigations

- Hollywood coupling to specific services → Extract service interfaces; use dependency injection patterns.
- Monorepo complexity overwhelming → Migrate incrementally; start with packages before apps.
- Hollywood tech debt carrying over → Cherry-pick clean implementations; refactor during copy.
- Version conflicts between hollywood and schwalbe → Pin versions; audit dependencies before copy.

## References

- Hollywood monorepo at `/Users/luborfedak/Documents/Github/hollywood`
- 001-reboot-foundation spec for monorepo standards
- Hollywood's proven architecture patterns and build configurations

## Linked design docs

- See `research.md` for hollywood architecture analysis and component catalog
- See `data-model.md` for service interfaces and data contracts
- See `plan.md` for detailed migration phases and implementation steps
- See `tasks.md` for ordered migration checklist
