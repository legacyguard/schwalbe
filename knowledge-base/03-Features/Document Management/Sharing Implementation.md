# Sharing Core Implementation (links, passwords, viewer, audit)

This feature adds:
- Database tables: `public.share_links` and `public.share_audits` with RLS
- RPC functions: `create_share_link` (auth required) and `verify_share_access` (anon allowed)
- Client service: `SharingService` to call RPCs
- Web viewer route: `/share/:shareId` with password prompt, noindex meta, and print-to-PDF export

API Summary
- Create share link
  - RPC: create_share_link(p_resource_type text, p_resource_id text, p_permissions jsonb?, p_expires_at timestamptz?, p_max_access_count int?, p_password text?)
  - Returns: { share_id, expires_at, permissions }
- Verify share access
  - RPC: verify_share_access(p_share_id text, p_password text?, p_user_agent text?, p_ip inet?)
  - Returns: { status, reason, resource_type, resource_id, permissions, expires_at, has_password }

Security & Privacy
- Passwords hashed in DB using bcrypt via pgcrypto (crypt + gen_salt('bf'))
- RLS: only owners (created_by) can manage their links; audits readable by owners
- Viewer sends noindex, nofollow robots meta; UI in English with project i18n ready
- No PII logged by default; optional user_agent stored; IP can be passed by a server environment only

Acceptance Criteria mapping
- Valid links: verify_share_access returns status=ok with resource identifiers
- Expired/invalid blocked: verify returns status expired/invalid and viewer blocks
- Audits recorded: create and access events captured in share_audits

Next steps
- Render actual content for document/will types in ShareViewer
- Optional: server-side function to stream file downloads with audit action=downloaded
