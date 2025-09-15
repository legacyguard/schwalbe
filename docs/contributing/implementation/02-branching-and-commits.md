# Phase 02 – Mainline Commit Conventions

Purpose
Establish consistent branching and commit practices. Keep diffs small and understandable.

Inputs to include
- FEATURE NAME and SCOPE
- BRANCH: main
- COMMIT STYLE: conventional commits

Kickoff prompt
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Mainline commit conventions for <feature>
CONTEXT: We adopt conventional commits and small diffs. All commits go directly to main; no feature branches.
SCOPE:
- Use conventional commits (feat, fix, docs, chore, refactor, test)
- Keep diffs small; split if growing
NON_GOALS:
- Tooling changes beyond docs
ACCEPTANCE CRITERIA:
- Commit pattern documented
DELIVERABLES:
- Docs update with examples
CONSTRAINTS:
- No large refactors without separate prompt
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: main
RISK TOLERANCE: low
CHECKS BEFORE DONE:
- Example commits present
```

Commit examples
- feat(i18n): enforce 34 languages per domain matrix
- chore(logging): remove sentry and add supabase error_log table
- docs(contributing): add SEATBELT kickoff template

---

Ready-to-paste kickoff prompt (pre-filled)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Mainline commit conventions – enable for all upcoming phases
CONTEXT:
- We keep diffs small and commit directly to main
SCOPE:
- Document commit style in docs/contributing/coding-conventions.md (if missing)
- Provide commit examples for i18n, logging, redirects
NON_GOALS:
- Tooling changes
ACCEPTANCE CRITERIA:
- Example commits listed; guidance referenced in contributing docs
DELIVERABLES:
- Updated docs/contributing/coding-conventions.md (if needed)
CONSTRAINTS:
- No mass refactors
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: main
RISK TOLERANCE: low
CHECKS BEFORE DONE:
- Example commits present
```
