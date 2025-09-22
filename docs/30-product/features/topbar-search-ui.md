# Top Bar Search UI (Hashed Index)

Overview
- Adds an expandable search input in the global TopBar with debounced queries and a dropdown of results.
- Queries are resolved via a hashed search path that never stores or logs plaintext terms.
- Server-side hashing uses HMAC-SHA256 with a server-only salt. Client never sees the salt.

Components
- apps/web/src/components/layout/SearchBox.tsx
  - Collapsed button toggles to an input.
  - Debounce 250ms; calls Supabase Edge Function `hashed-search-query`.
  - Displays dropdown results with keyboard navigation (↑/↓/Enter).
  - No raw query logging. All UI strings use i18n keys under `ui/search` (English default).

Edge Function
- supabase/functions/hashed-search-query/index.ts
  - Accepts { q: string, locale?: string, limit?: number } via POST.
  - Tokenizes and hashes tokens server-side using SEARCH_INDEX_SALT.
  - Queries public.hashed_tokens and aggregates term frequencies per doc_id.
  - Fetches basic document fields via RLS (using caller auth context) and returns sorted results.
  - CORS: honors ALLOWED_ORIGINS.

Environment
- .env.example additions:
  - SEARCH_INDEX_SALT (server-only; do not expose to client).
  - ALLOWED_ORIGINS for Edge Function CORS.
- Client uses VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY as before.

i18n
- apps/web/src/lib/i18n.ts adds `ui/search` keys:
  - ariaLabel: "Search"
  - placeholder: "Search documents…"
  - noResults: "No results"
  - resultsAria: "Search results"

Privacy Review Checklist
- No plaintext search term is stored or logged.
- SALT is server-only and never bundled into client (no VITE_ prefix).
- Edge function uses caller Authorization header to enforce RLS; results are only for the authenticated user.
- Errors do not include user queries.

E2E Manual Test
1) Sign in and ensure you have documents with hashed index (ingest via `hashed-search-ingest` or upload flows that trigger it).
2) In the web app, open the top bar search, type at least 2 characters.
3) Verify results appear, links navigate to /documents/:id, and no network response includes plaintext search terms.
4) Inspect browser console and server logs to ensure no plaintext query strings are logged.

Notes
- Ranking is simple (sum of term frequencies). No embeddings or semantic ranking included (by design).
- Optional privacy-safe counters are omitted for now to avoid adding schema. Can be added later as aggregate counts without storing queries.