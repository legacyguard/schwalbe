# RLS Policy Catalog (Template)

Canonical copy for coding reference; mirrors docs/security/rls-policy-catalog.md.

Identity standard
- auth.uid() for current user
- user_id UUID referencing auth.users(id)

Example policies
- public.profiles: SELECT/INSERT/UPDATE/DELETE with auth.uid() = user_id
- public.user_sessions: owner SELECT; service_role ALL
- public.audit_logs: owner SELECT; service_role INSERT

Storage policies
- user-files bucket with folder prefix = user_id; compare UUID via ::uuid
