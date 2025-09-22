# Runbook: Auth Baseline Migrations

Scope
- Migrations introducing UUID user_id and auth.uid() policies

Pre-flight
- Backup database or take snapshot
- Confirm maintenance window
- Verify migration order and dependencies

Apply (staging)
- supabase db push (or your migration runner)
- Generate types: npx supabase gen types typescript --project-id <id> > packages/shared/src/types/supabase.ts
- Run RLS test harness queries and record results

Apply (production)
- Repeat with production project
- Monitor logs for errors (auth, RLS denials)

Verification
- Two-user RLS checks on key tables
- Storage policy access by folder

Rollback
- Apply down scripts in reverse order
- Re-generate types if schema changed

Notes
- Never run with production secrets locally
- Ensure service_role keys are only used in secure contexts
