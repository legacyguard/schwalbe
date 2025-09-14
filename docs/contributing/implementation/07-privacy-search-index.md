# Phase 07 – Privacy-Preserving Search Index (Hashed + Salted)

Purpose
Implement minimal hashed token search with salt, covering ingestion and query paths.

Inputs
- SPEC LINKS: privacy index plan
- SALT STRATEGY: env variable details and rotation policy

Kickoff prompt
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Privacy-preserving search index
CONTEXT: Store hashed tokens with salt; no plaintext terms.
SCOPE:
- Define index schema (hash, doc_id, freq/positions)
- Ingestion: tokenize and hash with salt; store
- Query: hash user terms with same salt; match
- Update docs/spec
NON_GOALS:
- Semantic search/embeddings
ACCEPTANCE CRITERIA:
- Queries match via hashes; no plaintext persisted
DELIVERABLES:
- schema, ingestion, query code; docs
CONSTRAINTS:
- Salt via env; do not log raw queries
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: feature/search-hashed-index
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- Unit tests for tokenization/hashing
```

---

Ready-to-paste kickoff prompt (pre-filled)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Privacy-preserving search index (hashed+salted)
CONTEXT:
- Privacy note: docs/hollywood-archive/privacy-first.md (reference)
SCOPE:
- Create schema migration: supabase/migrations/<ts>_create_hashed_search_index.sql
  - tables: documents (if needed ref), hashed_tokens(hash TEXT, doc_id UUID, freq INT, positions INT[])
  - indexes: on (hash), (doc_id)
- Ingestion (Node): packages/shared/src/search/ingest.ts
  - tokenizer.ts: simple, locale-aware tokenization
  - hashes via HMAC-SHA256 with SALT from env
- Query path: packages/shared/src/search/query.ts
  - hash incoming query terms with same salt; join by hash
- Do not log raw terms anywhere
NON_GOALS:
- Embeddings/semantic
ACCEPTANCE CRITERIA:
- Plaintext never stored; queries produce results via hash matches
DELIVERABLES:
- migration + ingest/query modules; docs
CONSTRAINTS:
- SALT from env; no raw-term logging; UI text English
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: feature/search-hashed-index
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- Unit tests cover tokenization/hashing consistency
```
