# Schwalbe: Dead Man Switch (Emergency Protection System)

- Production-grade implementation of the Family Shield / Dead Man Switch.
- Builds on 001 (foundation) and 002 (migration). 003 excludes this scope by design; 004 introduces it.

## Goals

- Guardian network with staged emergency activation and verification.
- Automated inactivity detection with health checks and escalation.
- Secure emergency access to selected user assets with full audit trail.
- Email/SMS notifications with verification links and expiry.
- Cron-based and event-driven checks (Supabase Edge Functions + Vercel Cron).
- Admin-free, self-serve flows; strong security and RLS throughout.

## Non-Goals

- Full legal will workflows (covered elsewhere).
- Payments/subscriptions.
- Mobile parity; web is primary.

## Acceptance Criteria

- [ ] Users can configure Family Shield (enable/disable, thresholds).
- [ ] Users can invite/manage guardians; guardians can verify and act.
- [ ] Inactivity detection triggers health checks and escalations.
- [ ] Emergency activation grants scoped, temporary access; everything is audited.
- [ ] Notifications are delivered; status tracked; retries handled.
- [ ] RLS policies prevent data leaks; security review passes.
- [ ] Observability: logs, metrics, and error alerts in place.

## Dependencies

- 001-reboot-foundation complete (monorepo, CI, RLS policy patterns).
- 002-hollywood-migration artifacts available (schemas/functions as baseline).
- Supabase project + env configured; email provider (Resend/SendGrid) available.

## High-level Architecture

- Frontend: React components (manager UI), Guardian flows, secure links.
- Backend: Supabase tables + RLS, Edge Functions for checks & notifications.
- Infra: Vercel deploy, Vercel Cron for periodic checks, secrets in env.


