# Phase 10 – Guided Will Creation Wizard & Validations

Purpose
Build a multi-step wizard for will creation with context-aware validations and save/resume.

Inputs
- SPEC LINKS: guided flow and validation rules
- STEPS: assets, beneficiaries, guardians, executors, etc.

Kickoff prompt
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Guided will creation wizard with legal validations
CONTEXT: Provide a structured flow with inline validations; preserve progress.
SCOPE:
- Implement wizard steps and navigation
- Wire validations per country/language
- Save/resume and progress preservation
NON_GOALS:
- Deep analytics
ACCEPTANCE CRITERIA:
- Valid flow completion; invalid inputs blocked with clear reasons
DELIVERABLES:
- wizard UI components, validation hooks, docs
CONSTRAINTS:
- i18n 34; a11y; UI English
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: feature/will-wizard
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- E2E happy path for CZ/SK
```

---

Ready-to-paste kickoff prompt (pre-filled)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Guided will creation wizard
CONTEXT:
- Will system: specs/023-will-creation-system/quickstart.md, tasks.md, contracts/
SCOPE:
- Create wizard under apps/web/src/features/will/wizard/
  - steps/, hooks/, components/, routes integration
- Wire validations from packages/logic/src/will/ (engine)
- Save/resume with Supabase auth session
NON_GOALS:
- Advanced analytics
ACCEPTANCE CRITERIA:
- Valid flow for CZ/SK; invalid inputs blocked with clear reasons
DELIVERABLES:
- wizard UI, validation hooks, docs
CONSTRAINTS:
- i18n 34; a11y; UI English
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: feature/will-wizard
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- E2E happy path for CZ/SK
```
