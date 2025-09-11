# Hollywood → Schwalbe Migration Mapping

Intent
- Extract core concepts and architecture rather than copy-paste; adapt to Schwalbe naming and rules while preserving functionality and purpose.

Applications
- Hollywood Web → Schwalbe apps/web
- Hollywood Mobile → Schwalbe apps/mobile
- Hollywood Demo → Schwalbe apps/demo
Evidence: /Users/luborfedak/Documents/Github/hollywood/docs/README.md:11-23; DEVELOPER_GUIDE_EN.md:274-323

Packages
- Hollywood packages/ui → Schwalbe packages/ui
- Hollywood packages/logic → Schwalbe packages/logic
- Hollywood packages/shared → Schwalbe packages/shared
Evidence: /Users/luborfedak/Documents/Github/hollywood/docs/DEVELOPER_GUIDE_EN.md:29-35,132-147

Backend
- Supabase (DB/Auth/Realtime/Storage) + Edge Functions retained.
Evidence: /Users/luborfedak/Documents/Github/hollywood/docs/DEVELOPER_GUIDE_EN.md:37-41

Key Adaptations and Cautions
- Error tracking: replace Sentry with Supabase logs + DB + Resend.
- React version: validate React 19.1.1 compatibility; fallback to 18.3.1 if needed.
- Environment variables: synchronize with Schwalbe env doc (Sentry removed; add logging settings if needed).
- i18n language set: apply Schwalbe rules (language replacements/additions) and ensure minimum language count per country.

