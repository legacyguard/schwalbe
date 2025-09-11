# Architecture Overview (Schwalbe)

Summary
- Schwalbe follows a TypeScript monorepo with npm workspaces and Turborepo, mirroring Hollywood’s modular structure (applications: web, mobile, demo; packages: ui, logic, shared; backend: Supabase).
- Core principles: clear separation between applications and packages; shared code in packages; reproducible builds via Turbo.

Evidence from Hollywood
- High-level modular architecture: /Users/luborfedak/Documents/Github/hollywood/docs/DEVELOPER_GUIDE_EN.md:18-42
- Tech stack overview: /Users/luborfedak/Documents/Github/hollywood/docs/DEVELOPER_GUIDE_EN.md:44-53
- Root structure & packages: /Users/luborfedak/Documents/Github/hollywood/docs/DEVELOPER_GUIDE_EN.md:107-130
- Monorepo structure reference: /Users/luborfedak/Documents/Github/hollywood/docs/README.md:11-23

Applications
- Web: Vite + React; routes/pages, services, hooks, i18n, styles.
  Evidence: /Users/luborfedak/Documents/Github/hollywood/docs/DEVELOPER_GUIDE_EN.md:274-297
- Mobile: React Native + Expo; app routing, components, native services.
  Evidence: /Users/luborfedak/Documents/Github/hollywood/docs/DEVELOPER_GUIDE_EN.md:299-310
- Demo: Vite app that exercises packages.
  Evidence: /Users/luborfedak/Documents/Github/hollywood/docs/DEVELOPER_GUIDE_EN.md:312-323

Packages
- UI (Tamagui-based cross-platform components)
- Logic (business rules and services)
- Shared (types, utilities, encryption, cross-cutting concerns)
Evidence: /Users/luborfedak/Documents/Github/hollywood/docs/DEVELOPER_GUIDE_EN.md:29-35,132-147

Backend
- Supabase for Postgres, Auth, Realtime, Storage; Edge Functions for server logic.
Evidence: /Users/luborfedak/Documents/Github/hollywood/docs/DEVELOPER_GUIDE_EN.md:37-41

Schwalbe-specific notes
- React version: Hollywood docs resolved React 19 incompatibilities by using React 18.3.1 (see deployment notes). Schwalbe currently uses React 19.1.1—verify compatibility or plan fallback.
  Evidence: /Users/luborfedak/Documents/Github/hollywood/docs/COMPLETE_DEPLOYMENT_SOLUTION.md:9-14,44-53
- Error tracking: Use Supabase logs + DB + Resend alerts (replace any Sentry usage).
- Security & encryption service shared from packages/shared (TweetNaCl XSalsa20-Poly1305).
  Evidence: /Users/luborfedak/Documents/Github/hollywood/docs/SECURITY.md:46-71

