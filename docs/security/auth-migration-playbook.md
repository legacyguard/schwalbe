# Supabase Auth Migration Playbook

Purpose: Provide a safe, step-by-step plan to standardize identity and authorization on Supabase Auth with Postgres RLS while minimizing risk.

Decision context
- Rationale: auth.uid() aligns directly with Postgres RLS; fewer moving parts; consistent with Edge Functions and observability baseline.
- Constraints: No service-role key on client; default-deny RLS; hashed tokens with expiry; no raw token logging.

Phased plan
1) Inventory & mapping
- Identify all tables with user_id-like fields; classify: owner-only, owner+admin, owner+guardian, public read.
- Document current identity assumptions (TEXT vs UUID, source columns).

2) RLS policy design (docs-first)
- For each table category, select a policy pattern from docs/security/rls-cookbook.md.
- Write expected policy behavior and test matrix before any migration.

3) Transitional schema strategy
- If user_id column types differ from auth.users.id UUID, keep TEXT and compare to auth.uid()::text.
- Plan a later type migration (UUID) with backfill and reversible steps.

4) Storage policies
- Adopt bucket structure user_documents/<auth.uid()>/*.
- Use foldername(name)[1] = auth.uid()::text (production) with an optional dev policy that is user-scoped.

5) Rollout procedure
- Staging: Apply policies; run positive/negative tests; verify logs & alerts.
- Canary: Enable for a subset of users; monitor error rates and access anomalies.
- Production: Rollout with on-call and rollback plan ready.

6) Verification & monitoring
- Positive/negative RLS tests (two-user tests) per table.
- Structured logs include correlationId and policy decision context.
- Resend critical alerts on policy evaluation failures; no Sentry.

Backout plan
- Maintain reversible migration scripts for policies.
- Feature flag gates for routes that depend on new policies.

References
- docs/security/rls-cookbook.md
- docs/observability/baseline.md
- docs/testing/rls-test-template.md
