# Phase 23 – Privacy & Security Checklist

Purpose
Ensure privacy and security practices are consistently applied before shipping.

Inputs
- AREAS: logging, secrets, PII, search, sharing
- THREATS: list any project-specific risks

Kickoff prompt
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Privacy & Security hardening
CONTEXT: Verify no secrets exposure, correct logging levels, and privacy-safe search/sharing.
SCOPE:
- Secrets via env; secret handling review; no printing secrets
- Logging review: no PII in logs; structured errors only
- Search: hashed index confirmed; no raw-term logging
- Sharing: link lifecycle, password enforcement, audit coverage
NON_GOALS:
- Penetration testing
ACCEPTANCE CRITERIA:
- All checks pass or tracked with tickets
DELIVERABLES:
- Security checklist and fixes PRs
CONSTRAINTS:
- Least privilege; auditing where feasible
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: chore/privacy-security
RISK TOLERANCE: low
CHECKS BEFORE DONE:
- Sign-off from security checklist
```

---

Ready-to-paste kickoff prompt (pre-filled)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Privacy & Security hardening
CONTEXT:
- Logging: packages/shared/src/services/monitoring.service.ts; supabase monitoring tables
- Search: packages/shared/src/search/
- Sharing: apps/web/src/features/sharing/
SCOPE:
- Secrets via env; no printing secrets
- Logging: no PII in logs; structured errors only
- Search: hashed index confirmed; no raw-term logging
- Sharing: link lifecycle/password/audit checks
NON_GOALS:
- Penetration testing
ACCEPTANCE CRITERIA:
- All checks green or ticketed
DELIVERABLES:
- Security checklist, fixes PRs
CONSTRAINTS:
- Least privilege; auditing where feasible
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: chore/privacy-security
RISK TOLERANCE: low
CHECKS BEFORE DONE:
- Sign-off from checklist
```
