# Phase 35 – GDPR Minimum (Delete/Export Data) + Privacy Hygiene

Purpose
Implement basic GDPR flows: account deletion, data export stub, privacy retention notes; ensure privacy hygiene in logs.

Inputs
- FLOWS: delete account, export data (JSON bundle or email link), retention policy text
- TABLES: user-related tables to purge/anonymize

Kickoff prompt (pre-filled)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: GDPR minimum – delete/export + privacy hygiene
CONTEXT:
- Supabase auth users + app tables; logging tables exist
SCOPE:
- Add "Delete account" UI (apps/web/src/features/account/DeleteAccount.tsx) → server action to purge user rows (or schedule purge) and auth user
- Export data stub: generate JSON bundle of key entities; deliver via email link (Resend) or direct download after auth
- Update Privacy page with retention summary; ensure logs avoid PII and redact sensitive fields
NON_GOALS:
- Full DSR automation portal; legal counsel automation
ACCEPTANCE CRITERIA:
- Delete flow removes app data and disables auth; export returns bundle; privacy page updated
DELIVERABLES:
- Account UI, server/purge script, export generator, docs
CONSTRAINTS:
- Irreversible delete warning; rate‑limit export requests; secrets not logged
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: main
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- Manual delete/export test on staging; logs show no PII leakage
```
