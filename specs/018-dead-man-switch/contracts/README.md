# Contracts: Dead Man Switch

## API Endpoints

- POST /api/guardians/invite
  - Auth: user must be authenticated; owner context required.
  - Sends invitation with single-use, hashed verification token.
- POST /api/guardians/verify
  - Public endpoint that validates a signed URL containing an opaque token.
  - On success, activates guardian record and invalidates token (single-use).
- POST /api/emergency/activate
  - Auth: guardian or owner per workflow; issues scoped, time-limited access token.
  - Full audit logged; rate limited.
- POST /api/emergency/record-activity
  - Auth: owner session; updates last-activity signals.
- GET  /api/emergency/status
  - Auth: owner; limited read for guardians if explicitly allowed by policy.

## Events

- emergency.rule.triggered
- emergency.notification.sent
- emergency.access.granted
- emergency.access.revoked

## Cron Jobs

- check-inactivity (6h)
- protocol-inactivity-checker (1h)

## Security

- All DB access is behind RLS; enable on every table.
- Tokens are only stored as hashes with `expires_at` and `used_at`; validate and atomically mark used.
- Rate limiting and backoff for activation/verification endpoints.
- No service role tokens in the client; Edge Functions only.

## Observability & Errors

- Structured logs with correlation IDs from all endpoints and functions.
- Critical failures send email alerts via Resend (no Sentry).

## Email Templates

- Guardian Invitation
- Activation Request
- Verification Needed
- Shield Activated
