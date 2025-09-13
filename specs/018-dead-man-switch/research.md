# Research: Dead Man Switch

## Problem Space

- Detect prolonged inactivity reliably without false positives.
- Balance privacy, security, and necessary emergency access.
- Provide humane, empathetic UX for sensitive scenarios.

## Prior Art

- Gmail Inactive Account Manager
- GitHub stale bot patterns (for escalation logic inspiration)
- Estate planning apps with emergency access

## Key Questions

- Which events count as “activity” for reset? (login, document open, guardian ping)
- How to verify guardian identity robustly?
- What grace periods minimize false positives?

## Decisions

- Identity: Supabase Auth is the source of truth (see 020-auth-rls-baseline). If other modules use Clerk, bridge via server-side mapping; keep DMS Supabase-first.
- RLS-first design across all tables; owner-only by default, with minimal guardian access proved by joins.
- Tokens are hashed, single-use, and time-limited; no raw tokens stored.
- Edge Functions for checks; Vercel Cron for schedule.
- Email first; SMS optional (twilio later).
- Observability: Supabase logs + email alerts via Resend; no Sentry.
