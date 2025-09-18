# @schwalbe/web-next

Next.js app (app router) with feature-gated Dashboard V2 and Assistant.

## Quick start (local)

1. Install deps from repo root:

```
npm ci
```

2. Create an `.env.local` in `apps/web-next` (or export vars) with flags and stubbed env:

```
NEXT_PUBLIC_ENABLE_DASHBOARD_V2=1
NEXT_PUBLIC_ENABLE_ASSISTANT=1
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon-public-placeholder
NEXT_PUBLIC_APP_URL=http://localhost:3001
PORT=3001
```

3. Dev server:

```
npm run dev -w apps/web-next
```

Visit:
- `/en/dashboard-v2` (flag-guarded)
- `/en/assistant` (flag-guarded)

## Tests

Playwright e2e (uses webServer in the config):

```
npx playwright test -c apps/web-next/playwright.config.ts --reporter=list
```

Targeted typecheck for dashboard/assistant scope:

```
npm run typecheck -w apps/web-next
```

## Analytics

UI events (Assistant open/start/suggestion clicks, Dashboard CTA, Topbar nav) are sent via `/api/analytics/events` (202 acceptor) using a shared `sendAnalytics` helper. Replace the backend with a real collector when ready.