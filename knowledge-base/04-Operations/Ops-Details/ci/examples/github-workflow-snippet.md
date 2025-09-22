# GitHub Actions Snippet: Banned Pattern Guard

```yaml
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install
        run: npm ci
      - name: Typecheck
        run: npm run type-check --if-present
      - name: Lint
        run: npm run lint --if-present
      - name: Guard banned strings
        run: |
          set -euo pipefail
          ! grep -RInE "(ClerkProvider|clerkMiddleware|\\bClerk\\b|NEXT_PUBLIC_CLERK|app\\.current_external_id\\(|current_external_id\\(|\\bSentry\\b|sentry\\.io|SENTRY_)" . \
            --exclude-dir=.git --exclude-dir=.next --exclude-dir=node_modules || (echo "Banned pattern found"; exit 1)
```
