# Tasks: 034-prep-operational-foundations

- [ ] Verify env variable names match code usage; add .env.local.sample in apps/web-next (placeholders only)
- [ ] Add GitHub Actions guard step using docs in ./ci/github-workflow-snippet.md
- [ ] Create SQL RLS smoke tests from ./testing/rls-test-harness.md in a test runner or migration verification step
- [ ] Align storage policies to UUID checks per ./security/rls-policy-catalog.md
- [ ] Implement structured logging utility aligned to ./observability/logging-standards.md
- [ ] Wire Resend alert trigger for one critical auth metric as a template (non-prod)
- [ ] Confirm MVP i18n matrix (CZ/SK; cs, sk, en, de, uk) and simulate redirects when VITE_IS_PRODUCTION=false
- [ ] Add ADR references to related specs (005, 011, 033)
- [ ] Update specs/ORDER.md to reference 034 under Phase 0
