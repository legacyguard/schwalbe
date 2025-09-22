# GDPR minimum – delete/export + privacy hygiene

This document summarizes the new flows and how to validate them on staging.

What was added
- Delete account flow
  - UI: /account/delete (in TopBar and AccountRoutes)
  - Edge function: delete-account
  - Behavior: removes user-owned rows across app tables, deletes storage in user_documents/<userId>/*, anonymizes logs, and deletes auth user. Irreversible.
- Export data flow
  - UI: /account/export
  - Edge function: export-data
  - Behavior: returns a JSON bundle of key entities (profile, assets, documents metadata, reminders, subscriptions). Rate-limited via export_requests.
- Privacy page update
  - Added retention summary, export mention, and log hygiene statement.

Environment and security notes
- No secrets are logged. Error messages in functions are sanitized; sensitive values are redacted.
- export-data is rate-limited by export_requests table (cooldown configurable via EXPORT_COOLDOWN_MINUTES).
- Email delivery: export is direct download for now; wiring optional email delivery can be done via existing send-email function if desired.

Manual staging test checklist
1) Data export
   - Sign in as a test user.
   - Navigate to /account/export and click "Generate export".
   - Verify a JSON file downloads and includes: profile (id + basic fields), assets, documents metadata (no file contents), reminders, subscriptions.
   - Immediately try again and verify you receive a rate-limit message (429) with retry_after_minutes guidance.
   - Check function logs: ensure no PII or secrets are printed.

2) Delete account
   - Navigate to /account/delete.
   - Type DELETE and confirm.
   - Verify success message and auto sign-out. Attempt to sign in again with same credentials should fail if auth user is removed. If using OAuth, ensure user row is gone.
   - In the database, confirm rows for that user are removed from: assets, documents, reminder_rule, user_subscriptions, share_links/share_audits, emergency_* and profile.
   - Confirm user_documents/<userId>/ files are removed from storage.
   - Check logs tables: error_logs entries have user_id NULL and do not include url/session/user_agent for that user; webhook_logs metadata is cleared for that user.

3) Privacy page
   - Visit /legal/privacy.en and check the new sections: Data Retention & Deletion, Data Export, Logging & Privacy Hygiene.

Rollback
- Revert the two edge functions (delete-account, export-data) and the export_requests migration if needed.
- Remove UI links from TopBar and AccountRoutes.

Open items / Future
- Optional: Add an email export link via send-email Edge function (Resend) with a signed download URL stored temporarily (bucket or function endpoint).
- Optional: Allow scheduling deletion with a grace period (+24h) and a cancel window.
