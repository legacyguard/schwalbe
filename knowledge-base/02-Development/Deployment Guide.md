# Deployment Strategy (Schwalbe)

Goals
- Zero build failures; environment consistency; CSS/Tailwind correctness; secrets management; rollback capability; post-deploy health checks; performance validation.
Evidence: /Users/luborfedak/Documents/Github/hollywood/docs/deployment-strategy.md:30-39

Key Risks and Fixes (from Hollywood)
- Node.js version standardization (20.19.1 recommended).
- Tailwind CSS config fixes; robust build validation; consolidated pipeline.
Evidence: /Users/luborfedak/Documents/Github/hollywood/docs/deployment-strategy.md:5-29,41-69

React Compatibility Note
- Hollywood solved React 19 runtime issues by using React 18.3.1; Schwalbe currently runs React 19.1.1—verify compatibility or plan a downgrade.
Evidence: /Users/luborfedak/Documents/Github/hollywood/docs/COMPLETE_DEPLOYMENT_SOLUTION.md:9-14,44-53

Process
- Pre-deploy validation (type-check, tests, build).
- Environment var verification and secret management via platform UI (e.g., Vercel).
- Health checks and metrics; rollback plan.
- Document troubleshooting procedures.

