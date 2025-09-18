# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]: ready
  - generic [ref=e4]:
    - link "LegacyGuard" [ref=e5] [cursor=pointer]:
      - /url: /en
    - navigation "Primary" [ref=e6]:
      - link "Subscriptions" [ref=e7] [cursor=pointer]:
        - /url: /en/subscriptions
      - link "Support" [ref=e8] [cursor=pointer]:
        - /url: /en/support
      - link "Assistant" [ref=e9] [cursor=pointer]:
        - /url: /en/assistant?source=nav
    - button "Search" [ref=e11] [cursor=pointer]:
      - img [ref=e12] [cursor=pointer]
    - button "Select country" [ref=e16] [cursor=pointer]:
      - img [ref=e17] [cursor=pointer]
      - img [ref=e20] [cursor=pointer]
    - link "Support" [ref=e22] [cursor=pointer]:
      - /url: /en/support
      - img [ref=e23] [cursor=pointer]
    - button "Buy" [ref=e31] [cursor=pointer]:
      - img [ref=e32] [cursor=pointer]
      - img [ref=e36] [cursor=pointer]
    - link "Account" [ref=e38] [cursor=pointer]:
      - /url: /en/account
      - img [ref=e39] [cursor=pointer]
  - generic [ref=e42]:
    - heading "Something went wrong" [level=1] [ref=e43]
    - generic [ref=e44]: "Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL"
  - alert [ref=e45]
  - generic [ref=e48] [cursor=pointer]:
    - img [ref=e49] [cursor=pointer]
    - generic [ref=e51] [cursor=pointer]: 1 error
    - button "Hide Errors" [ref=e52] [cursor=pointer]:
      - img [ref=e53] [cursor=pointer]
```