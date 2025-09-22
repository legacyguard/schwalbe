# LegaczGuard Production Database Playbook

This playbook documents the minimum steps required to promote database changes into the managed Supabase project used by LegaczGuard. Treat it as the source of truth for engineering + ops sign-off.

## 1. Change Pipeline

1. **Author migration** – add a timestamped SQL file under `supabase/migrations` that captures the required schema/policy changes. Avoid ad‑hoc `psql` updates.
2. **Add seed data** – when new reference data is necessary, create an idempotent script under `supabase/seeds/production`. Guard inserts with `IF EXISTS` blocks.
3. **Run locally** – execute `supabase db reset` followed by `supabase db seed --env-file .env.local` to verify migrations + seed data are compatible.
4. **Stage first** – deploy to the staging Supabase project using `supabase db push --db-url $STAGING_DB_URL` and run the smoke tests.
5. **Promote to prod** – after QA approval, run `supabase db push --db-url $PROD_DB_URL` followed by `supabase db seed --db-url $PROD_DB_URL --file supabase/seeds/production/001_core_configuration.sql`.
6. **Monitor** – confirm realtime + auth policies via the dashboard and check Sentry/monitoring dashboards for anomalies.

## 2. Security Baseline

- **Row Level Security** must be enabled on all user data tables. `20250209090000_enable_rls_and_policies.sql` enables RLS + policies for families, documents, guardians, and professional workflows.
- **Policy tests**: add regression tests in `apps/web` ensuring authenticated users can only read their own rows. Example command: `npm run test -- --runTestsByPath apps/web/src/__tests__/documents.policy.test.ts` (TODO).

## 3. Seeding Strategy

- Keep seeds deterministic and idempotent. The provided `001_core_configuration.sql` only upserts configuration metadata.
- When adding new reference tables, place each dataset in a dedicated numbered file to simplify replays.

## 4. Checklist Before Releasing

- [ ] All migrations reviewed and approved (pair review required).
- [ ] Staging Supabase project updated and smoke-tested.
- [ ] Rollback plan captured (reverse migration or backup snapshot).
- [ ] Monitoring runbook updated if new metrics/logs are emitted.
- [ ] Ops ticket closed with links to migration commit + dashboard screenshots.

## 5. Useful Commands

```bash
# Apply migrations locally
supabase db reset

# Diff local schema vs production
supabase db diff --db-url $PROD_DB_URL > supabase/migrations/$(date +%Y%m%d%H%M%S)_manual.sql

# Seed production configuration
supabase db seed --db-url $PROD_DB_URL --file supabase/seeds/production/001_core_configuration.sql
```

> ⚠️ Always back up production before applying schema changes. Supabase offers PITR; capture the restore point timestamp in the change ticket.
