# ADR-002: Observability Without Sentry

Status: Accepted

Context
- We want simple, cost-effective, and self-contained observability

Decision
- Use Supabase logs as the primary logging sink
- Use Resend for critical error notifications
- No Sentry SDK or DSN anywhere

Consequences
- Simpler operational footprint
- Must standardize structured logs and alert thresholds
- Optional future: add queryable log sink or BI for deep analysis
