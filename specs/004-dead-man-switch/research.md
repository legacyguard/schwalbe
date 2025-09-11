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

- Supabase as source of truth; RLS-first design.
- Edge Functions for checks; Vercel Cron for schedule.
- Email first; SMS optional (twilio later).
