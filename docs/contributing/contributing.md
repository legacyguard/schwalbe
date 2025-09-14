# Contributing – Implementation Kickoff Prompt (SEATBELT: ON)

This guide defines a small, repeatable prompt you can paste at the start of any implementation task so work begins safely, predictably, and fast.

What “SEATBELT: ON” means
- Confirm goal and scope; ask at most 3 quick clarifying questions if critical info is missing.
- Propose a short plan and prefer small, reversible diffs.
- Avoid destructive or interactive commands; never push without explicit confirmation.
- Respect project rules (examples): 34 languages for i18n, production redirects gated by VITE_IS_PRODUCTION, Supabase logging instead of Sentry, all UI text outside i18n in English, secrets via env vars only.
- Use Git with no pagers; keep diffs focused and readable.

Quick one‑liner (copy/paste)
```
SEATBELT: ON | MODE: IMPLEMENT | REPO: schwalbe | FEATURE: <name> | BRANCH: <feature/name> | SCOPE: <bulleted steps> | DELIVERABLES: <diffs, tests, docs> | CONSTRAINTS: <key rules> | PERMISSIONS: {edit_code: yes, readonly_cmds: yes, run_tests: yes, commit: ask} | DEADLINE: <when>
```

Standard template
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: <short title>
CONTEXT: <what exists already and why we’re doing this>
SCOPE:
- <step 1>
- <step 2>
- <step 3>
NON_GOALS:
- <out of scope items>
ACCEPTANCE CRITERIA:
- <success condition 1>
- <success condition 2>
DELIVERABLES:
- <changed files/diffs>
- <tests/verification>
- <docs/changelog>
CONSTRAINTS:
- <e.g., i18n has 34 languages; VITE_IS_PRODUCTION redirect gating; Supabase logging; UI strings in English>
PERMISSIONS:
- edit code: yes
- run read‑only commands (build/test/lint): yes
- run migrations or destructive ops: no (ask first)
- commit: ask before commit
BRANCH: feature/<name>
RISK TOLERANCE: low | medium | high
CHECKS BEFORE DONE:
- build/test pass
- project rules respected
- diffs are small and understandable
```

Example (filled)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Redirect gating by VITE_IS_PRODUCTION
CONTEXT: We have country-based switch/case redirect logic. We need to wrap it with env gating and show a Czech simulation banner in non‑production.
SCOPE:
- Wrap redirect switch in VITE_IS_PRODUCTION condition
- If false: show CZ modal/toast with simulated URLs for all configured domains
- Add short documentation and QA checklist
NON_GOALS:
- Re-design of the modal component
ACCEPTANCE CRITERIA:
- Production: real redirects occur
- Staging/local: no redirects; only CZ simulation banner
DELIVERABLES:
- diffs in routing/app shell
- short README/docs section with QA steps
CONSTRAINTS:
- UI text in English; simulation message in Czech
- No interactive commands; no push without confirmation
PERMISSIONS:
- edit code: yes; read‑only cmds: yes; commit: ask
BRANCH: feature/redirect-gating
RISK TOLERANCE: low
CHECKS BEFORE DONE:
- manual verification for CZ/SK domains
```

Usage tips
- You can leave some fields blank if unknown (I’ll ask concise follow‑ups).
- Keep SCOPE to 3–6 bullet points; split work if it grows.
- Prefer one feature branch per SEATBELT prompt.
