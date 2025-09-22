# Tickets (Preflight & Global Rules)

- ID: T-001-i18n-matrix-source-of-truth
  Title: Consolidate per-country language matrix into docs/i18n/matrix.md
  Context: docs/i18n/matrix.md is marked TODO; it should embed or be generated from the long-form matrix file so CI/scripts can rely on one path.
  Acceptance:
  - docs/i18n/matrix.md contains full 39-country/34-language mapping or a deterministic generation script
  - CI check references only this path

- ID: T-002-country-domain-languages-prop
  Title: Extend CountryDomain to include languages: string[] and add MVP values
  Context: packages/shared/src/config/domains.ts lacks a languages list. Specs rely on it for gating the language switcher per domain.
  Acceptance:
  - CountryDomain has languages: string[] (locale codes)
  - CZ/SK populated: ["cs","sk","en","de","uk"]
  - Disabled markets can include placeholder languages or remain empty

- ID: T-003-redirect-simulation-ui-stub
  Title: Add non-production Czech simulation modal/toast component and wire to country menu
  Context: Gating policy is documented; staging UI simulation not yet implemented in code.
  Acceptance:
  - isProduction()=false shows Czech simulation modal with target URL when country selected
  - Production path unchanged (real redirect)

- ID: T-004-observability-readme-linking
  Title: Cross-link ADR-002 and security/overview to monitoring tables migration
  Context: We have migration and ADR; add pointers in README/observability docs for discoverability.
  Acceptance:
  - docs/observability/* and docs/README.md link to supabase/migrations/20240102000000_create_monitoring_tables.sql

- ID: T-005-privacy-index-spec-location
  Title: Create/confirm a canonical spec doc for the privacy-preserving search index
  Context: Implementation prompt exists; add a short standalone spec in docs/observability or docs/search.
  Acceptance:
  - A spec like docs/search/privacy-index.md that outlines schema, hashing approach, salt handling

- ID: T-006-identity-rls-consistency
  Title: Audit RLS policies to ensure all user_id columns reference auth.users(id)
  Context: ADR-001 mandates Supabase Auth; ensure all migrations/tables are consistent.
  Acceptance:
  - Quick audit doc listing tables checked and any fixes queued
