# Phase 25 – Release, QA & Ops Playbook

Purpose
Provide a predictable path to release with QA gates and rollback plan.

Inputs
- ENVIRONMENTS: staging, production
- CHECKS: build, tests, a11y/i18n, privacy/security, alerts

Kickoff prompt
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Release and QA playbook
CONTEXT: Prepare a release checklist and rollback steps; ensure gates are green.
SCOPE:
- Define release checklist and sign-offs
- Run QA gates (a11y/i18n, privacy/security)
- Document rollback and hotfix flow
NON_GOALS:
- CD tooling changes beyond docs
ACCEPTANCE CRITERIA:
- All gates pass; rollback plan documented
DELIVERABLES:
- release checklist, docs
CONSTRAINTS:
- No interactive production ops without approval
PERMISSIONS:
- edit docs/code: yes; destructive ops: no (ask first)
BRANCH: main
RISK TOLERANCE: low
CHECKS BEFORE DONE:
- Dry-run on staging
```

---

Ready-to-paste kickoff prompt (pre-filled)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Release and QA playbook
CONTEXT:
- Envs: staging, production
- Gates: a11y/i18n (Phase 22), privacy/security (Phase 23), alerts (Phase 24)
SCOPE:
- Define release checklist and sign-offs
- Run QA gates
- Document rollback and hotfix flow
NON_GOALS:
- CD tooling changes beyond docs
ACCEPTANCE CRITERIA:
- All gates pass; rollback plan documented
DELIVERABLES:
- release checklist, docs
CONSTRAINTS:
- No interactive production ops without approval
PERMISSIONS:
- edit docs/code: yes; destructive ops: no (ask first)
BRANCH: main
RISK TOLERANCE: low
CHECKS BEFORE DONE:
- Dry-run on staging
```
