# CI Guards

Goal
- Prevent regressions to legacy auth/observability patterns

Banned patterns
- Clerk, clerkMiddleware, ClerkProvider, NEXT_PUBLIC_CLERK
- app.current_external_id(, current_external_id(
- Sentry, sentry.io, SENTRY_

Example GitHub Actions step
```yaml
- name: Guard banned strings
  run: |
    set -euo pipefail
    ! grep -RInE "(ClerkProvider|clerkMiddleware|\\bClerk\\b|NEXT_PUBLIC_CLERK|app\\.current_external_id\\(|current_external_id\\(|\\bSentry\\b|sentry\\.io|SENTRY_)" . \
      --exclude-dir=.git --exclude-dir=.next --exclude-dir=node_modules || (echo "Banned pattern found"; exit 1)
```

Notes
- Allow exceptions only in explicitly archived docs (if needed) with --exclude-dir
- Keep this guard early in the workflow to fail fast
