# Automatic Will Updates

Status: Draft

Scope
- Change detection engine for assets, beneficiaries, and guardians
- Smart update rules with approval flow
- Versioning (history, diff, rollback, export)
- Notifications via Resend

Architecture
- Logic (packages/logic):
  - will/autoUpdate/diff.ts: computes added/removed/modified across assets/beneficiaries/guardians
  - will/autoUpdate/rules.ts: builds a safe patch (non-destructive defaults)
  - will/autoUpdate/patch.ts: applies a patch and returns inverse for rollback
- Shared service (packages/shared):
  - services/will-auto-update.service.ts orchestrates: detect → propose → approve/apply → rollback
- Database (supabase/migrations):
  - will_versions: stores immutable snapshots per version
  - will_update_proposals: stores pending/applied proposals
- Notifications: packages/shared/src/services/email.service.ts extended with 2 methods

Data privacy
- Email notifications include only non-PII summaries (counts/categories).
- Logging uses monitoringService with structured context; no PII in message fields.

Identity and RLS note
- Identity: Supabase Auth (auth.uid()); RLS policies reference auth.uid() directly.
- Tables created here (will_versions, will_update_proposals) enforce owner-only access.

API (service)
- detectAndPropose(willId): detects external changes (guardians, legacy assets), writes pending proposal, emails user.
- approveAndApply(proposalId): applies patch to will, writes will_versions, marks proposal applied, emails user.
- rollbackToVersion(willId, versionNumber): restores a prior snapshot.

Testing
- Unit tests in packages/logic/src/__tests__/will/autoUpdate.test.ts cover detection and rollback.
- For E2E, wire a simple flow: create a will row, insert legacy_items and guardians, call detectAndPropose, approveAndApply, then rollback.

Non-goals
- ML predictions are explicitly out of scope.

Constraints
- UI strings must remain in English; localize only via UI i18n.
- Logging must be privacy-aware; do not log raw will content.