# Implementation Playbook (Phased, Prompt-Driven)

This folder provides phase-by-phase SEATBELT: ON prompts and checklists for the full implementation, using the project specs as the source of truth.

How to use
- Start each phase by copying the prompt in that phase file, fill the required inputs, and send it as the kickoff message.
- Keep scopes small; if a phase grows, split it into multiple sub-phases.
- Always keep the specs as the source of truth; link to them in CONTEXT.

Index of phases
- [01 – Preflight & Global Rules](01-preflight-and-rules.md)
- [02 – Branching & Commit Conventions](02-branching-and-commits.md)
- [03 – i18n Baseline: 34 Languages (Matrix Enforcement)](03-i18n-34-baseline.md)
- [04 – Multi-domain Top Bar & Language Auto-detect](04-topbar-and-language-detect.md)
- [05 – Redirect Gating by VITE_IS_PRODUCTION](05-redirect-gating.md)
- [06 – Supabase Logging (replace Sentry) + Alerts (Resend)](06-logging-and-alerts.md)
- [07 – Privacy-Preserving Search Index (Hashed + Salted)](07-privacy-search-index.md)
- [08 – Identity & RLS (Clerk) Guardrails](08-identity-rls.md)
- [09 – Will Generation Engine (Country Frameworks, Dynamic Clauses)](09-will-engine.md)
- [10 – Guided Will Creation Wizard & Validations](10-will-wizard.md)
- [11 – Real-time Legal Compliance](11-real-time-compliance.md)
- [12 – Output Generation (PDF, Handwriting, Notarization Checklists)](12-output-generation.md)
- [13 – Automatic Will Updates (Sync, Logic, Versioning, Notifications)](13-auto-updates.md)
- [14 – Asset Tracking (Models, Dashboard, Templates)](14-assets.md)
- [15 – Sharing (Secure Links, Passwords, Viewer, Audit)](15-sharing.md)
- [16 – Backup Reminders (Scheduling, Triggers, Channels, Analytics)](16-reminders.md)
- [17 – Documents & OCR (Upload, Categorization, Expiry)](17-documents-ocr.md)
- [18 – Subscriptions Tracking (Metadata, Dashboard, Notifications)](18-subscriptions.md)
- [19 – Country Configurations (Domains, Currencies, Legal Data)](19-country-configs.md)
- [20 – Language Rules (Replacements/Removals; ≥4 per country)](20-language-rules.md)
- [21 – Search UI (Top Bar, Debounced, Privacy-Aligned)](21-search-ui.md)
- [22 – A11y & i18n QA Suite](22-a11y-i18n-qa.md)
- [23 – Privacy & Security Checklist](23-privacy-security.md)
- [24 – Telemetry & Alerting (Operational Runbook)](24-telemetry-alerting.md)
- [25 – Release, QA & Ops Playbook](25-release-qa-ops.md)
- [26 – MCP Prompting Guide (Warp)](26-mcp-prompting-guide.md)
- [27 – Stripe Billing + Webhooks + Gating](27-stripe-billing.md)
- [28 – Legal/Compliance Pages + Consent Tracking + Cookie Banner](28-legal-compliance.md)
- [29 – Production Env/DNS/Robots/Secrets + Runbook](29-prod-env-runbook.md)
- [30 – E2E Money‑Path Smoke Tests](30-e2e-money-path.md)
- [31 – Dunning + Email Flows + Billing Portal UX](31-dunning-and-portal.md)

Requirements honored in all phases
- UI strings outside i18n are in English; the app supports 34 languages.
- VITE_IS_PRODUCTION gating for redirects (prod: real redirects; non-prod: Czech simulation banner).
- Sentry replaced with Supabase logging + simple error table + Resend alerts.
- Privacy-preserving search index with hashed and salted tokens.
- Identity & RLS guidance: app.current_external_id() and public.user_auth(clerk_id).
- Country/language rules and minimum 4 languages per country.
