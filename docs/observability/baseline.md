# Observability Baseline

Purpose: Define standard logging, alerting, and diagnostics.

Logging
- Structured logs: { timestamp, level, correlationId, userId?, route, fn, status, latencyMs, errorCode?, message, context }
- Redaction: Never log tokens, passwords, secrets, raw PII; scrub known patterns.
- Edge Functions: Use shared logger; ensure correlationId propagation.

Error handling & alerts
- Critical errors: email via Resend; include correlationId and affected area.
- Error severity taxonomy: low, medium, high, critical.
- Paging rules: document escalation and on-call schedule.

Dashboards & metrics
- Track error rates, latency, throughput, queue backlog; per function and route.
- Log-based metrics for policy denials and auth failures.

Verification
- Staging smoke: emit a test error; verify alert; verify no secrets appear in logs.
- Production: periodic synthetic checks; alert routing validation.
