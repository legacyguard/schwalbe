# Cutover Plan: Auth + RLS Baseline

Prechecks
- All migrations applied in staging; RLS tests pass
- Supabase types generated and app compiles
- Env vars set in Vercel for staging and production

Rollout steps
1) Deploy to staging
2) Run smoke tests: sign-in, protected route, basic CRUD behind RLS
3) Verify logs and alerts (no spikes)
4) Approve production deployment
5) Deploy to production off-peak
6) Re-run smoke tests in production

Verification
- Protected routes require session
- Owner-only data visible
- Storage policies enforce folder-based access

Rollback
- Revert to previous deployment in Vercel
- If migrations cause issues, run rollback scripts (have them ready)
- Disable new features behind env flag if needed

Communications
- Post release notes
- Capture metrics for 24–48h
