# ADR-001: Supabase Auth as Identity Source

Status: Accepted

Context
- We need a single, durable identity mechanism compatible with Postgres RLS

Decision
- Use Supabase Auth; policies reference auth.uid()
- Store user_id as UUID referencing auth.users(id) in all scoped tables
- No custom request claim mapping helpers (no app.current_external_id())

Consequences
- Uniform RLS policy authoring
- Easier test harness via request.jwt.claims
- Migrations must ensure UUID user_id everywhere
