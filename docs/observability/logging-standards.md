# Logging Standards (Supabase logs)

Goals
- Consistent, searchable logs with no PII
- Actionable context for debugging and analytics

Event shape (JSON)
- ts: ISO timestamp
- req_id: request correlation id
- user_id: UUID or null (do not log email)
- area: auth | billing | documents | sharing | ui | edge
- event: short_action_name (e.g., auth.sign_in_attempt)
- severity: debug | info | warn | error | critical
- message: human-readable summary
- details: object with non-PII context (ids, counts, timings)
- src: web | edge | worker

Example
{
  "ts":"2025-09-14T17:30:00Z",
  "req_id":"abc123",
  "user_id":"00000000-0000-0000-0000-00000000000A",
  "area":"auth",
  "event":"auth.session_refresh",
  "severity":"info",
  "message":"Session refreshed",
  "details":{"refresh_latency_ms":42},
  "src":"web"
}

Guidelines
- No PII (emails, raw tokens, addresses)
- Include req_id for cross-service tracing
- Use severity=critical only for paging conditions
- Prefer flat keys and small details payloads
