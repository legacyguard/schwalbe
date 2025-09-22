# Storage Policy Design (Supabase)

Purpose: Standardize secure object access rules for user content.

Bucket structure
- user_documents/<auth.uid()>/* for all user-owned files.

Policies
- Production: foldername(name)[1] = auth.uid()::text for SELECT/INSERT/UPDATE/DELETE.
- Development option: LIKE auth.uid()::text || '/%' scoped policies.

Testing
- Upload/read/update/delete as owner → success; as non-owner → denied.
- Confirm no raw paths or secrets logged; verify redaction.
