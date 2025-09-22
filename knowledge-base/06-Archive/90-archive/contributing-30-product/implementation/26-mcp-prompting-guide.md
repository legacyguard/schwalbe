# Phase 26 – MCP Prompting Guide (Warp)

Purpose
Show exactly how to drive implementation through prompts using MCP servers in Warp.

Inputs

- MCP SERVERS: list of configured servers
- WORKFLOW: when to use which prompt/file

Kickoff prompt

```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: MCP-driven implementation session
CONTEXT: Using the Implementation Playbook. This session uses MCP servers to run read-only commands and prepare diffs.
SCOPE:
- Reference the phase doc for the current feature
- Provide required inputs (CONTEXT, SCOPE, NON_GOALS, etc.)
- Ask for plan confirmation, then proceed with small diffs
NON_GOALS:
- Running unsafe/interactive commands
ACCEPTANCE CRITERIA:
- Session follows SEATBELT guardrails; diffs are small and testable
DELIVERABLES:
- Verified diffs; updated docs if needed
CONSTRAINTS:
- No secrets in plain text; env variables only; no printing secrets
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: main
RISK TOLERANCE: low
CHECKS BEFORE DONE:
- Build/test pass; plan matched
```

Usage notes

- Always start from the relevant phase doc and copy its prompt.
- If you need to deviate, state the reason in CONTEXT and update SCOPE accordingly.
- Keep each session focused and small; commit directly to main.
- Tokens/keys must be supplied via environment variables; do not commit secrets in this repo.

---

Ready-to-paste kickoff prompt (pre-filled)

```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: MCP-driven implementation session
CONTEXT: Using docs/contributing/implementation/00-overview.md and the relevant phase doc. MCP servers configured per .cursor/mcp.json and mcp-servers/*.
SCOPE:
- Reference the phase doc for the current feature
- Provide required inputs (already pre-filled in each phase doc)
- Ask for plan confirmation, then proceed with small diffs
NON_GOALS:
- Running unsafe/interactive commands
ACCEPTANCE CRITERIA:
- Session follows SEATBELT guardrails; diffs are small and testable
DELIVERABLES:
- Verified diffs; updated docs if needed
CONSTRAINTS:
- No secrets in plain text; env variables only; no printing secrets
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: main
RISK TOLERANCE: low
CHECKS BEFORE DONE:
- Build/test pass; plan matched
```
