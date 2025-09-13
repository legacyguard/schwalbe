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
- [ ] All DMS tables have RLS enabled; policies prevent data leaks; policy tests pass.
- [ ] Sensitive tokens are stored hashed, single-use, and expire; no raw tokens persisted.
- [ ] Observability: structured logs in Supabase Edge Functions; critical alerts via Resend; no Sentry.

## Dependencies

- 001-reboot-foundation complete (monorepo, CI, RLS policy patterns).
- 002-hollywood-migration artifacts available (schemas/functions as baseline).
- 017-production-deployment guidance for secrets management and environment setup.
- 020-auth-rls-baseline published (identity strategy, RLS conventions).
- Supabase project + env configured; email provider (Resend/SendGrid) available.

## High-level Architecture

- Frontend: React components (manager UI), Guardian flows, secure links.
- Backend: Supabase tables + RLS, Edge Functions for checks & notifications.
- Infra: Vercel deploy, Vercel Cron for periodic checks, secrets in env.

## Identity & Security Model

- Identity source: Supabase Auth (JWT subject maps to `auth.uid()`).
- No direct Clerk dependency in this module. If other modules use Clerk, see 020-auth-rls-baseline for bridging guidance; DMS remains Supabase-first.
- Service role keys are never exposed to the browser; used only in Edge Functions.

## RLS Policy Overview

Enable RLS on every table. Patterns:
- Owner-only read/write on user-owned records.
- Minimal guardian access via join-based policies that prove membership and active status.
- Append-only audit logs; updates/deletes restricted.

Example policy patterns are documented in 020-auth-rls-baseline; this spec intentionally avoids embedding SQL.

## Token Handling & Secrets

- Verification and access tokens are stored as hashed values (e.g., SHA-256) with `expires_at` and `used_at` columns.
- Tokens are single-use; endpoints must atomically mark them as used.
- Email links carry opaque tokens; do not leak identifiers in URLs.
- All secrets are injected via environment variables and scoped to server-side contexts only.

## Observability & Alerts

- Use structured logs in Supabase Edge Functions with correlation IDs.
- Critical failures trigger email alerts via Resend.
- No Sentry usage in this project; confirm no Sentry dependencies in build/runtime.

## Cross-links

- 017-production-deployment: production readiness, env and secret handling.
- 020-auth-rls-baseline: identity conventions, standard RLS patterns and tests.

