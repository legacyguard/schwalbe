# Implementation Kickoff Prompts by Spec (SEATBELT: ON)

This document provides ready-to-use SEATBELT: ON prompts to start implementation safely and consistently across all major specs. Copy a prompt, adjust details, and use it to kick off a feature branch.

Index
- 01. Multi-domain top bar & language auto-detect
- 02. Environment-based redirect gating (VITE_IS_PRODUCTION)
- 03. i18n baseline: 34 languages (matrix enforcement)
- 04. Supabase logging replaces Sentry (error table + Resend alerts)
- 05. Privacy-preserving search index (hashed + salted tokens)
- 06. Identity & RLS note enforcement (Clerk)
- 07. Legal Will Generation Engine
- 08. Guided Will Creation Process & validations
- 09. Real-time Legal Compliance features
- 10. Output generation: PDF, handwriting templates, notarization checklists
- 11. Automatic Will Updates system
- 12. Asset Tracking system
- 13. Sharing functionality system
- 14. Backup Reminders system
- 15. Smart Document Management (OCR)
- 16. Smart Contract & Subscription Expiration system
- 17. Country configuration updates (new countries, languages, currencies)
- 18. Language rules (replacements/removals; min 4 per country)
- 19. Search UI in top bar (expandable) aligned with privacy index

How to use
- Pick the relevant prompt, fill blanks, and paste it to start the implementation session.
- Keep scopes to 3–6 bullets. Split larger scopes into multiple prompts/branches.

---

## 01. Multi-domain top bar & language auto-detect
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Multi-domain top bar with icons + language auto-detect
CONTEXT: Top bar should mimic nvidia.com with icons (user/Clerk, country/domains, search expandable, support, buy). Language should auto-detect from user environment and fallback to English if unsupported.
SCOPE:
- Implement top bar shell with icons and responsive layout
- Country menu: show EU countries; initially CZ/SK clickable with domain redirects
- Search: expandable input for articles/blog (no backend coupling yet)
- Support and Buy stubs with routes
- Auto-detect language; fallback to English when unsupported
NON_GOALS:
- Full search backend; full country list beyond MVP
ACCEPTANCE CRITERIA:
- Top bar matches required sections; CZ/SK domain links work
- Language auto-detect works; English fallback verified
DELIVERABLES:
- app shell/top bar components; routes for support/buy; docs/README snippet
CONSTRAINTS:
- i18n supports 34 languages; UI strings in English; privacy rules apply
- Respect VITE_IS_PRODUCTION redirect gating
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: feature/topbar-multidomain
RISK TOLERANCE: low
CHECKS BEFORE DONE:
- lint/build pass; basic a11y for header; docs updated
```

## 02. Environment-based redirect gating (VITE_IS_PRODUCTION)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Redirect gating by VITE_IS_PRODUCTION
CONTEXT: Preserve country switch/case redirect logic but wrap it so prod redirects are real; staging/local show CZ simulation banner for all target domains.
SCOPE:
- Wrap redirect switch in VITE_IS_PRODUCTION condition
- Staging/local: show CZ simulation modal/toast with the target URL per domain
- Add QA checklist to docs
NON_GOALS:
- New modal design
ACCEPTANCE CRITERIA:
- Prod: real redirects; Non-prod: only simulation in CZ
DELIVERABLES:
- Routing/app shell diffs; docs/QA steps
CONSTRAINTS:
- UI strings English; simulation message in Czech only
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: feature/redirect-gating
RISK TOLERANCE: low
CHECKS BEFORE DONE:
- Manual verification for CZ/SK domains
```

## 03. i18n baseline: 34 languages (matrix enforcement)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: i18n baseline – enforce 34 languages and per-domain subsets
CONTEXT: Language matrix defines 34 total languages and 4–5 per domain. Enforce loading/switching per domain and default/fallback rules.
SCOPE:
- Ensure only domain-allowed languages appear in the switcher
- Fallback hierarchy: user pref → device → domain default → English
- Add tests/docs for language availability per domain
NON_GOALS:
- Translating new content
ACCEPTANCE CRITERIA:
- Domain-specific language menus show only allowed languages
- English fallback verified
DELIVERABLES:
- i18n config diffs; tests/docs
CONSTRAINTS:
- Keep domain matrices in sync with docs; UI strings English
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: feature/i18n-34-baseline
RISK TOLERANCE: low
CHECKS BEFORE DONE:
- i18n smoke tests pass; docs updated
```

## 04. Supabase logging replaces Sentry (error table + Resend alerts)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Replace Sentry with Supabase logging and email alerts
CONTEXT: Remove Sentry; use Supabase Edge Functions logs + structured console.error + error table; email critical alerts via Resend.
SCOPE:
- Remove Sentry config
- Add error_log table and minimal write API
- Console/error wrappers to capture structured context
- Integrate Resend email for critical levels
- Docs with runbook
NON_GOALS:
- Full SIEM integration
ACCEPTANCE CRITERIA:
- Errors stored and visible; critical alerts email sent
DELIVERABLES:
- logging config, error table migration, email setup docs
CONSTRAINTS:
- Secrets via env; no secrets printed; follow least privilege
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: feature/logging-supabase
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- Test errors flow end-to-end in staging
```

## 05. Privacy-preserving search index (hashed + salted tokens)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Minimal privacy-preserving search index
CONTEXT: Index tokens as salted hashes; adjust spec/plan and ingestion; update search UI to use index safely.
SCOPE:
- Define salt handling (env-managed, rotation notes)
- Tokenize and hash during ingestion; store frequency/positions as needed
- Update query path to hash user query with same salt
- Update docs/spec to reflect privacy approach
NON_GOALS:
- Semantic search/embeddings
ACCEPTANCE CRITERIA:
- Plaintext terms not stored; queries match via hashes
DELIVERABLES:
- index schema code, ingestion pipeline, docs
CONSTRAINTS:
- Secrets via env; do not log raw queries; i18n UI text English
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: feature/search-hashed-index
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- Privacy review; unit tests for hashing path
```

## 06. Identity & RLS note enforcement (Clerk)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Identity wiring and RLS guardrails (Clerk)
CONTEXT: Use app.current_external_id() and public.user_auth(clerk_id) consistently; ensure docs and data model show correct patterns.
SCOPE:
- Verify auth context mapping in API and DB
- Ensure RLS policies follow user_auth mapping
- Add short “Identity and RLS note” to data-model docs
NON_GOALS:
- New auth providers
ACCEPTANCE CRITERIA:
- RLS rules pass smoke tests; docs reflect standard guidance
DELIVERABLES:
- policy/config diffs; docs update
CONSTRAINTS:
- Least privilege; no leaking PII in logs
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: feature/identity-rls-guardrails
RISK TOLERANCE: low
CHECKS BEFORE DONE:
- RLS tests pass
```

## 07. Legal Will Generation Engine
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Will generation engine (country frameworks, dynamic clauses)
CONTEXT: Support country-specific legal frameworks, witness/signature rules; dynamic clause insertion and compliance checking.
SCOPE:
- Schema for country legal requirements
- Clause library with dynamic insertion rules
- Validation pass that checks compliance per jurisdiction
NON_GOALS:
- UI polish for editor
ACCEPTANCE CRITERIA:
- Engine produces compliant drafts for at least 2 markets (CZ, SK)
DELIVERABLES:
- engine modules; sample templates; tests; docs
CONSTRAINTS:
- i18n 34 languages; legal terms per language-country; UI strings English
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: feature/will-engine
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- Unit tests for compliance rules
```

## 08. Guided Will Creation Process & validations
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Guided will creation wizard with legal validations
CONTEXT: Multi-step guided flow with context-aware validations and hints.
SCOPE:
- Wizard steps (assets, beneficiaries, guardians, executors)
- Inline legal validations per country/language
- Save/resume and progress preservation
NON_GOALS:
- Advanced analytics
ACCEPTANCE CRITERIA:
- Flow completes with valid output; invalid entries blocked with clear reasons
DELIVERABLES:
- wizard UI, validation hooks, docs
CONSTRAINTS:
- i18n 34; accessibility; UI text English
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: feature/will-wizard
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- E2E happy-path test for CZ/SK
```

## 09. Real-time Legal Compliance features
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Real-time compliance checks
CONTEXT: Live compliance feedback as user fills data.
SCOPE:
- Trigger validations on field changes
- Aggregate compliance status per step and overall
- Provide clear corrective guidance
NON_GOALS:
- Cross-border edge cases
ACCEPTANCE CRITERIA:
- Users see immediate, accurate compliance state
DELIVERABLES:
- validation engine wiring; UI indicators; docs
CONSTRAINTS:
- UI English; country logic from engine
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: feature/real-time-compliance
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- Unit/UI tests for validations
```

## 10. Output generation: PDF, handwriting templates, notarization checklists
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Output generation for will documents
CONTEXT: Produce legally formatted outputs: PDF, handwriting-friendly template, notarization checklist.
SCOPE:
- PDF generator with jurisdiction formatting
- Handwriting template with line spacing and fields
- Notarization checklist per country rules
NON_GOALS:
- External e-signature integration
ACCEPTANCE CRITERIA:
- Outputs render correctly for CZ/SK
DELIVERABLES:
- output module, example templates, docs
CONSTRAINTS:
- i18n 34; UI English; a11y for print styles
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: feature/output-generation
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- Visual check of PDFs; print CSS validated
```

## 11. Automatic Will Updates system
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Automatic will updates (sync, smart logic, notifications, versioning)
CONTEXT: Monitor changes in assets/beneficiaries/guardians; propose/apply updates; provide version history with diff and rollback.
SCOPE:
- Sync engine to detect relevant changes
- Smart update rules + user approval flow
- Versioning: history, diff, rollback, export
- Notification delivery and snooze/undo
NON_GOALS:
- ML-based predictions
ACCEPTANCE CRITERIA:
- Updates proposed accurately; user can approve/undo; versions preserved
DELIVERABLES:
- engine code, version store, notifications, docs
CONSTRAINTS:
- Privacy-aware logging; UI English; i18n where visible
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: feature/auto-will-updates
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- Unit/E2E tests for change detection and rollback
```

## 12. Asset Tracking system
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Asset tracking (categories, docs, beneficiaries, dashboard)
CONTEXT: Track assets with categories and optional fields; overview dashboard and detailed views; i18n support.
SCOPE:
- Data model for assets, links to docs/beneficiaries
- CRUD UI with filters and charts
- Templates by category; conflict detection/report
NON_GOALS:
- Financial provider integrations
ACCEPTANCE CRITERIA:
- Create/edit assets; see dashboard; generate simple reports
DELIVERABLES:
- models, UI, docs
CONSTRAINTS:
- i18n 34; UI English; a11y
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: feature/assets-core
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- Unit/UI tests for CRUD and summaries
```

## 13. Sharing functionality system
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Sharing (secure links, passwords, audit, viewer UI, PDF)
CONTEXT: Time-limited share links with optional password, manage expirations and audit logs; clean viewer with print-friendly and responsive design.
SCOPE:
- Share link generation and validation
- Password protection; expiration; audit logging
- Shared viewer UI; PDF export for summaries
NON_GOALS:
- Public indexing of shared content
ACCEPTANCE CRITERIA:
- Valid links open viewer; expired/invalid blocked; audits recorded
DELIVERABLES:
- share APIs/UI; PDF export; docs
CONSTRAINTS:
- Privacy rules; UI English; i18n for viewer
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: feature/sharing-core
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- Security review; link lifecycle tests
```

## 14. Backup Reminders system
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Backup reminders (scheduling, triggers, channels, analytics)
CONTEXT: Configurable reminders for major content; avoid annoyance; support in-app, email, dashboard; i18n.
SCOPE:
- Reminder scheduling + smart triggers
- Delivery channels + snooze/history UI
- Analytics for optimization
NON_GOALS:
- Push notifications to mobile apps (if not in scope)
ACCEPTANCE CRITERIA:
- Reminders fire per schedule with snooze; history captured
DELIVERABLES:
- reminder engine, UI, docs
CONSTRAINTS:
- UI English; email via Resend if used; privacy-aware
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: feature/reminders-core
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- Unit tests for schedules/triggers; QA checklist
```

## 15. Smart Document Management (OCR)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Document management (upload, categorization, OCR, expiry detection)
CONTEXT: Drag-and-drop upload, storage (e.g., S3), OCR (Google Vision/Tesseract), categorization, expiry detection, reminders.
SCOPE:
- Upload UI and storage wiring
- OCR pipeline and text extraction
- Categorization suggestions and expiry detection
- Reminder hooks
NON_GOALS:
- Full DMS migrations/imports
ACCEPTANCE CRITERIA:
- Files upload; OCR text available; expiry reminders created
DELIVERABLES:
- storage/OCR code, UI, docs
CONSTRAINTS:
- Secrets via env; privacy rules; UI English
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: feature/documents-ocr
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- OCR accuracy smoke test; storage/security review
```

## 16. Smart Contract & Subscription Expiration system
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Subscription tracking (metadata, dashboard, notifications)
CONTEXT: Enhance document metadata with subscription fields; suggestions for reminders; dashboards with cost/renewal views; advanced notifications.
SCOPE:
- Metadata fields + migration
- Dashboard (cost and renewal views)
- Notification rules and templates (email)
- Integration with existing reminders
NON_GOALS:
- Billing provider integrations
ACCEPTANCE CRITERIA:
- Subscriptions tracked and surfaced in dashboard; reminders sent
DELIVERABLES:
- models/UI, templates, docs
CONSTRAINTS:
- UI English; Resend for email; privacy-aware
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: feature/subscriptions-core
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- Unit tests; email template QA
```

## 17. Country configuration updates (new countries, languages, currencies)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Country additions and currency/language setup
CONTEXT: Add Moldova, Ukraine, Serbia, Albania, North Macedonia, Montenegro; ensure language files and domain currency configs; update legal requirements DB.
SCOPE:
- Add/verify domain entries and currencies
- Add language resources where missing
- Update legal requirements dataset
NON_GOALS:
- Full content translations
ACCEPTANCE CRITERIA:
- Countries appear with correct languages/currencies; legal data present
DELIVERABLES:
- config diffs; language stubs; legal dataset updates; docs
CONSTRAINTS:
- i18n 34; each country ≥4 languages; UI English
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: feature/countries-expansion
RISK TOLERANCE: low
CHECKS BEFORE DONE:
- QA per country checklist
```

## 18. Language rules (replacements/removals; min 4 per country)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Enforce language rules per project guidance
CONTEXT: Replace Russian with Ukrainian where specified; remove Russian in Germany; remove Ukrainian in Iceland/Liechtenstein; ensure ≥4 languages per country (add closest when only 3).
SCOPE:
- Audit domain-language configs for rule compliance
- Apply replacements/removals and add 4th language where needed
- Update docs and tests for language menus
NON_GOALS:
- Country additions beyond current list
ACCEPTANCE CRITERIA:
- All configs satisfy rules; tests pass
DELIVERABLES:
- config diffs; docs/test updates
CONSTRAINTS:
- i18n 34; UI English
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: feature/language-rules-enforcement
RISK TOLERANCE: low
CHECKS BEFORE DONE:
- Spot-check affected countries
```

## 19. Search UI in top bar (expandable) aligned with privacy index
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Expandable search UI using hashed index
CONTEXT: Implement top bar search UI that queries the privacy-preserving index; no plaintext term storage/logging.
SCOPE:
- Expandable search input with debounce and results dropdown
- Wire to query path that hashes user terms with salt
- No raw-term logging; add analytics counters if privacy-safe
NON_GOALS:
- Semantic ranking
ACCEPTANCE CRITERIA:
- Search returns results via hashed path; no PII leakage
DELIVERABLES:
- UI components; query integration; docs
CONSTRAINTS:
- Secrets via env; UI English; i18n for visible text
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: feature/search-ui
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- Privacy review; E2E test of query flow
```
