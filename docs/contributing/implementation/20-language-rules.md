# Phase 20 – Language Rules (Replacements/Removals; ≥4 per country)

Purpose
Apply language-specific rules: replacements/removals and ensure minimum language count.

Inputs
- SPEC LINKS: language rules doc
- AUDIT TARGETS: countries suspected to violate rules

Kickoff prompt
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Enforce language rules
CONTEXT: Replace Russian with Ukrainian where specified; remove Russian in Germany; remove Ukrainian in Iceland/Liechtenstein; ensure ≥4 languages per country (add closest where only 3).
SCOPE:
- Audit domain-language configs
- Apply required replacements/removals
- Add 4th language where needed
- Update docs and tests
NON_GOALS:
- Country additions
ACCEPTANCE CRITERIA:
- All configs meet rules; tests pass
DELIVERABLES:
- config diffs; docs/tests updates
CONSTRAINTS:
- i18n 34; UI English
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: main
RISK TOLERANCE: low
CHECKS BEFORE DONE:
- Spot checks of adjusted countries
```

---

Ready-to-paste kickoff prompt (pre-filled)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Enforce language rules
CONTEXT:
- Rules source: docs/i18n/LANGUAGE MATRIX PER DOMAIN (39 COUNTRIES, 34 LANGUAGES).md and project rules
SCOPE:
- Audit domain-language configs
- Apply: replace Russian with Ukrainian where specified; remove Russian in Germany; remove Ukrainian in Iceland/Liechtenstein; ensure ≥4 languages
- Update docs and tests
NON_GOALS:
- Country additions
ACCEPTANCE CRITERIA:
- All configs meet rules; tests pass
DELIVERABLES:
- config diffs; docs/tests
CONSTRAINTS:
- i18n 34; UI English
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: main
RISK TOLERANCE: low
CHECKS BEFORE DONE:
- Spot checks of adjusted countries
```
