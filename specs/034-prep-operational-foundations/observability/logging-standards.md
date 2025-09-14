# Logging Standards (Supabase logs)

Canonical copy; mirrors docs/observability/logging-standards.md.

- JSON logs with ts, req_id, user_id, area, event, severity, message, details, src
- No PII; severity=critical only for paging
