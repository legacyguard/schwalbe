# RLS Policy Catalog (Template)

Identity standard
- Use auth.uid() for the authenticated user identity in all policies
- user_id columns are UUID and reference auth.users(id)

Catalog fields
- Table
- Operation (SELECT | INSERT | UPDATE | DELETE)
- Policy name
- USING and WITH CHECK expression
- Notes

Example entries
- Table: public.profiles
  - SELECT: users_can_read_own_profile
    - USING: auth.uid() = user_id
  - INSERT: users_can_insert_own_profile
    - WITH CHECK: auth.uid() = user_id
  - UPDATE: users_can_update_own_profile
    - USING: auth.uid() = user_id
    - WITH CHECK: auth.uid() = user_id
  - DELETE: users_can_delete_own_profile
    - USING: auth.uid() = user_id

- Table: public.user_sessions
  - SELECT: users_can_read_own_sessions
    - USING: auth.uid() = user_id
  - ALL: system_can_manage_sessions
    - USING: auth.role() = 'service_role'

- Table: public.audit_logs
  - SELECT: users_can_read_own_audit_logs
    - USING: auth.uid() = user_id
  - INSERT: system_can_insert_audit_logs
    - WITH CHECK: auth.role() = 'service_role'

Storage policies (user-files bucket)
- INSERT: bucket_id='user-files' AND auth.uid() = (storage.foldername(name))[1]::uuid
- SELECT: bucket_id='user-files' AND auth.uid() = (storage.foldername(name))[1]::uuid
- UPDATE: same as SELECT for USING and WITH CHECK
- DELETE: same as SELECT for USING
