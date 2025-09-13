# Quickstart: Dead Man Switch

## Prerequisites

- Supabase project with anon and service role keys
- Vercel project with Cron enabled
- Email provider (Resend/SendGrid) credentials

## Steps

1) Configure env (server-only where applicable)

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # use ONLY in Edge Functions or server contexts
EMAIL_PROVIDER=sendgrid|resend
EMAIL_API_KEY=
APP_URL=https://your-app
```

Notes:
- Do not expose the service role key to the browser.
- Use your deployment platform's secret manager for production (see 017-production-deployment).

2) Apply migrations

```
supabase db push  # or run SQL files in supabase/migrations
```

3) Deploy edge functions

```
supabase functions deploy check-inactivity
supabase functions deploy protocol-inactivity-checker
```

4) Schedule cron (Vercel)

- check-inactivity: every 6h
- protocol-inactivity-checker: hourly

5) Run locally

```
npm run dev
```

6) Verify security & RLS

- Confirm all DMS tables have RLS enabled.
- Run RLS tests for owner vs guardian paths.
- Confirm hashed token storage (no raw tokens in DB).

7) Verify observability

- Trigger a controlled error in an Edge Function; confirm structured log in Supabase logs.
- Confirm Resend email alert fires for critical failures.
- Ensure there is no Sentry dependency in the app.
