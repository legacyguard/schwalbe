# Phase 08 – Identity & RLS (Clerk) Guardrails

Purpose
Ensure identity mapping and row-level security policies follow standard guidance.

Inputs
- SPEC LINKS: data-model.md, identity/RLS notes
- TABLES: list of tables with RLS

Kickoff prompt
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Identity mapping and RLS guardrails (Clerk)
CONTEXT: Standard guidance: app.current_external_id() and public.user_auth(clerk_id).
SCOPE:
- Verify mapping from Clerk to DB user context
- Ensure RLS policies reference user_auth mapping
- Add/verify "Identity and RLS note" in data-model docs
NON_GOALS:
- New auth providers
ACCEPTANCE CRITERIA:
- RLS policies pass smoke tests; docs reflect guidance
DELIVERABLES:
- policies/config diffs; docs
CONSTRAINTS:
- Least privilege; no PII leakage in logs
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: main
RISK TOLERANCE: low
CHECKS BEFORE DONE:
- RLS tests green
```

---

Ready-to-paste kickoff prompt (pre-filled)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Identity mapping and RLS guardrails
CONTEXT:
- ADR: docs/adr/ADR-001-supabase-auth-identity.md
- Quickstart: specs/005-auth-rls-baseline/quickstart.md
SCOPE:
- Verify current identity mapping (Supabase-first per quickstart); document if Clerk mapping exists anywhere
- Ensure RLS policies reference correct user identity table/mapping
- Add short note to specs/001-reboot-foundation/data-model.md on identity + RLS
NON_GOALS:
- Adding new auth providers
ACCEPTANCE CRITERIA:
- RLS smoke tests pass; docs updated to reflect current mapping
DELIVERABLES:
- policy/config diffs; data-model doc note
CONSTRAINTS:
- Least privilege; no PII in logs
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: main
RISK TOLERANCE: low
CHECKS BEFORE DONE:
- RLS tests green
```
