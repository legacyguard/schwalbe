# Technology Decisions (Schwalbe)

React version direction
- Direction: Keep React 19.1.1 across apps and packages.
- Rationale: Current Schwalbe workspace uses React 19.1.1; ecosystem (Vite 6, Storybook 9, Tamagui 1.132) are known to work with React 19 in most setups.
- Contingency: If any hard blocker appears (runtime error, library incompatibility), downgrade to React 18.3.1 (Hollywood’s stable baseline) while tracking the blocking dependency.
- Pre-flight validation (run all before release):
  - Build each workspace (web, demo, ui) and Storybook
  - Run unit/integration tests
  - Manually verify common flows: routing, HMR, Storybook stories, Tamagui theming
  - Check bundle/runtime warnings related to React 19
- Evidence for the fallback baseline: /Users/luborfedak/Documents/Github/hollywood/docs/COMPLETE_DEPLOYMENT_SOLUTION.md:9-14,44-53

Deployment target
- Finalize: Vercel (apps) + Supabase (DB/Auth/Realtime/Storage + Edge Functions).
- Practice:
  - Environment variables: set per-environment in Vercel; keep sensitive values out of git (see env doc)
  - Edge Functions: logs monitored in Supabase; structured console.error; DB error table + Resend email alerts for critical issues (replaces Sentry)
  - Storybook: auto-deploy to Vercel on main if desired
- Evidence anchors: Deployment strategy guidance and security guidelines. Sources: /Users/luborfedak/Documents/Github/hollywood/docs/deployment-strategy.md:30-39; /Users/luborfedak/Documents/Github/hollywood/docs/SECURITY_GUIDELINES.md:33-60

Notes
- Redirect logic: Keep env-controlled behavior (VITE_IS_PRODUCTION) and simulation in non-prod; no need to finalize country→domain list.
- i18n: Keep English-first docs/comments; broader language matrices out of scope here per request.

