# Auto-generated Feature Specs

Directory: docs/feature_specs/

Purpose
- Store one Markdown spec per feature update (new or updated), generated automatically by an agent or via a manual command.
- Make it easy to review what changed, why, and where, in the same PR as the code.

File naming
- docs/feature_specs/<YYYY-MM-DD>_<short-feature-name>.md

Front-matter (YAML)
---
feature: <Short Feature Name>
status: updated|new
changed_files:
  - path/to/file1.ts
  - path/to/file2.ts
owner: <team/person>
related_endpoints:
  - GET /api/...
  - POST /api/...
---

Sections (required)
- Overview (1–2 paragraphs: what and why)
- Architecture & data flow (source → processing → outputs)
- Components & methods (name → when used → inputs → outputs)
- API (endpoint → request → response → typical errors)
- DB / configuration (tables/migrations/envs)
- Tests & edge cases (coverage and risks)
- Changed files (auto)

How this repository supports auto-docs
- scripts/agent/run-agent.sh is a versioned agent shim. Configure DOC_AGENT_CMD to point to your agent CLI. It reads docs/feature_specs/agent_prompt.txt + docs/_autodoc_context.txt on stdin and expects output lines DOC_OK: and COMMIT_MSG:.
- scripts/collect_feature_context.sh gathers context from staged changes, recent commits, endpoints, envs, and src tree.
- scripts/collect_feature_context.sh gathers context from staged changes, recent commits, endpoints, envs, and src tree.
- .git/hooks/pre-commit (local only; not versioned) can invoke your agent CLI to generate the spec before commit.
- GitHub Actions (.github/workflows/build-auto-doc.yml) can run the agent on feature branches after build/tests pass, commit the doc, and push.

Manual workflow (minimal)
- Optional local guard command: npm run doc:guard (runs typecheck, lint, and tests).
- One‑shot convenience: npm run doc:feature (collects context and opens the file).
1) Stage your changes (git add ...)
2) Run scripts/collect_feature_context.sh
3) Open docs/_autodoc_context.txt and paste it into your agent (Warp AI) with the following prompt:

Task: Generate or update a feature spec using the template above.
Input: You will receive context (git diff, changed files, API hints, src tree).
Output: A single Markdown file with:
---
feature: <Short Feature Name>
status: new|updated
changed_files:
  - path/to/file1
  - path/to/file2
owner: <team/person or unknown>
related_endpoints:
  - <METHOD PATH>
---

# Overview
# Architecture & data flow
# Components & methods
# API
# DB / configuration
# Tests & edge cases
# Changed files (auto)

Rules:
- Do not hallucinate filenames or endpoints. If missing, use "unknown".
- JSON examples must be valid.
- For updates, include "what changed and why".
- Finish with:
  DOC_OK: docs/feature_specs/<YYYY-MM-DD>_<short-feature>.md
  COMMIT_MSG: feat(doc): add/update spec for <feature> (files: N; endpoints: …)

4) Save the generated Markdown into docs/feature_specs/<YYYY-MM-DD>_<feature>.md
5) git add docs/feature_specs/... and commit together with code.

Commit message template (Conventional Commits)
feat(doc): add/refresh spec for <feature> (endpoints: GET /x, POST /y; files: 5)

- added: docs/feature_specs/2025-09-13_<feature>.md
- updated: src/services/…, src/api/…
- reason: align docs with new parameters and DB migration