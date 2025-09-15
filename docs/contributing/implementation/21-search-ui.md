# Phase 21 – Search UI (Top Bar, Debounced, Privacy-Aligned)

Purpose
Implement the top bar search UI that works with the hashed search index.

Inputs
- SPEC LINKS: search UI spec, privacy index spec
- UI BEHAVIOR: debounce delay, minimum chars, result limit

Kickoff prompt
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Top bar search UI using hashed index
CONTEXT: No plaintext term storage/logging; queries hashed client-side/server-side consistently.
SCOPE:
- Expandable input with debounce and dropdown results
- Integrate with query path that hashes terms with the same salt
- Avoid raw-term logging; add privacy-safe counters if needed
NON_GOALS:
- Semantic ranking/embeddings
ACCEPTANCE CRITERIA:
- Results returned via hashed path; no PII leakage
DELIVERABLES:
- UI components; query integration; docs
CONSTRAINTS:
- Secrets via env; UI English; i18n for visible text
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: main
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- Privacy review; E2E query flow test
```

---

Ready-to-paste kickoff prompt (pre-filled)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Top bar search UI using hashed index
CONTEXT:
- Header: apps/web/src/components/layout/TopBar.tsx (Phase 04)
- Hashed index: Phase 07 modules under packages/shared/src/search/
SCOPE:
- Expandable input with debounce and dropdown results (apps/web/src/components/layout/SearchBox.tsx)
- Integrate with query path hashing terms with same salt
- Avoid raw-term logging
NON_GOALS:
- Semantic ranking
ACCEPTANCE CRITERIA:
- Results via hashed path; no PII leakage
DELIVERABLES:
- UI components; query integration; docs
CONSTRAINTS:
- Secrets via env; UI English; i18n for visible text
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: main
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- Privacy review; E2E query flow test
```
