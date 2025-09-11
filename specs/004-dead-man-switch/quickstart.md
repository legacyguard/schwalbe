# Quickstart: Dead Man Switch

## Prerequisites

- Supabase project with anon and service role keys
- Vercel project with Cron enabled
- Email provider (Resend/SendGrid) credentials

## Steps

1) Configure env

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
EMAIL_PROVIDER=sendgrid|resend
EMAIL_API_KEY=
APP_URL=https://your-app
```

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

6) Verify

- Create user, enable Family Shield
- Invite guardian (test email)
- Simulate inactivity and confirm notifications
