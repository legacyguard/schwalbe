# Phase 11 – Real-time Legal Compliance

Purpose
Provide live compliance status and guidance as users fill in the wizard.

Inputs
- SPEC LINKS: compliance rules per jurisdiction
- EVENTS: when to trigger validations

Kickoff prompt
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Real-time legal compliance checks
CONTEXT: As users fill data, validate and surface issues immediately.
SCOPE:
- Hook validation triggers to relevant fields
- Aggregate compliance status per step and overall
- Provide clear remediation instructions
NON_GOALS:
- Cross-border or rare edge cases
ACCEPTANCE CRITERIA:
- Accurate, immediate compliance feedback
DELIVERABLES:
- validation engine wiring, UI indicators, docs
CONSTRAINTS:
- UI English; leverage engine rules
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: feature/real-time-compliance
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- Unit/UI tests for validation triggers
```

---

Ready-to-paste kickoff prompt (pre-filled)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Real-time legal compliance checks
CONTEXT:
- Will engine compliance rules under packages/logic/src/will/
SCOPE:
- Trigger validations on field changes within wizard
- Aggregate step-level and overall compliance
- Show actionable remediation guidance
NON_GOALS:
- Cross-border edge cases
ACCEPTANCE CRITERIA:
- Immediate and accurate compliance feedback in UI
DELIVERABLES:
- validation wiring, indicators, docs
CONSTRAINTS:
- UI English; leverage engine rules
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: feature/real-time-compliance
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- Unit/UI tests for triggers
```
