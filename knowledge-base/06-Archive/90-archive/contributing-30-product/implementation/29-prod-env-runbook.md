# Phase 29 – Production Env/DNS/Robots/Secrets + Runbook

Purpose
Prepare production deployment with correct domains, HTTPS, environment secrets, robots policy, and an operational runbook.

Inputs
- DOMAINS: legacyguard.cz, legacyguard.sk (initial), others later
- PROVIDER: Vercel (preview/prod), Supabase project creds

Kickoff prompt (pre-filled)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Production env/DNS/robots/secrets + runbook
CONTEXT:
- Vercel project (apps/web) with environment variables
- Supabase project credentials and service role in prod
- Redirect policy via isProduction() already defined
SCOPE:
- Configure DNS and HTTPS for CZ/SK domains in Vercel
- Add env vars for Stripe/Resend/Supabase in prod environment
- robots.txt: allow prod, disallow staging; set headers in Vercel config
- Create runbook at docs/observability/baseline.md: deploy steps, rollback, incident response
- Backup/restore notes for Supabase (minimum viable)
NON_GOALS:
- Multi-region, CDNs beyond provider defaults
ACCEPTANCE CRITERIA:
- Domains resolve with HTTPS; env secrets present; robots policy correct
DELIVERABLES:
- Vercel config, env vars list, updated docs/observability/baseline.md
CONSTRAINTS:
- No secrets printed; use provider secret stores; keep diffs minimal
PERMISSIONS:
- edit docs: yes; prod ops: ask before execution
BRANCH: main
RISK TOLERANCE: low
CHECKS BEFORE DONE:
- Test prod URL health; quick smoke test of money path
```
