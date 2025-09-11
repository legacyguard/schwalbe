# Plan: Dead Man Switch (Steps 1–10)

## Phases and Milestones

- Phase 1: Authentication & Profiles (Step 1)
- Phase 2: Database & Security (Step 2)
- Phase 3: Guardian Management (Step 3)
- Phase 4: Email/SMS Notifications (Step 4)
- Phase 5: Activity Tracking (Step 5)
- Phase 6: Cron + Edge Functions (Step 6)
- Phase 7: Emergency Access Control (Step 7)
- Phase 8: Security & Encryption (Step 8)
- Phase 9: Observability & Error Handling (Step 9)
- Phase 10: Testing & QA (Step 10)

## Week-by-Week

- Week 1: Steps 1–2 (Supabase Auth integration, profiles, migrations & RLS)
- Week 2: Steps 3–4 (Guardian flows, email provider integration)
- Week 3: Steps 5–6 (Activity tracking, inactivity checks with cron)
- Week 4: Steps 7–8 (Emergency access + encryption, secure links)
- Week 5: Steps 9–10 (Observability, tests, hardening, launch prep)

## Rollout & Risk

- Feature flags for activation; start with beta users.
- Backward compatible migrations.
- Clear incident runbook for false positives.
