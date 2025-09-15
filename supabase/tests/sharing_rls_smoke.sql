-- Sharing RLS smoke test
-- Validates create_share_link and verify_share_access behavior and RLS visibility for audits.

BEGIN;

-- Impersonate creator user
SET LOCAL request.jwt.claims TO '{"sub": "smoke_sharing_user"}';

-- Create link without password, expires in 1 hour
SELECT * FROM public.create_share_link(
  'document',
  'doc_123',
  '{"read": true, "download": false, "comment": false, "share": false}'::jsonb,
  now() + interval '1 hour',
  3,
  NULL
) AS res;

-- Fetch the share_id we just created
\t \a \o
SELECT share_id FROM public.share_links WHERE created_by::text = 'smoke_sharing_user' LIMIT 1;
\o
\a \t

-- Verify access anonymously
RESET request.jwt.claims; -- anon
SELECT * FROM public.verify_share_access((SELECT share_id FROM public.share_links WHERE created_by::text = 'smoke_sharing_user' LIMIT 1), NULL, 'test-agent', NULL);

-- Ensure audits not visible to anon (should error or return 0 depending on grants)
DO $$
DECLARE
  c int;
BEGIN
  SELECT COUNT(*) INTO c FROM public.share_audits; -- expect 0 rows visible under anon
  IF c <> 0 THEN
    RAISE EXCEPTION 'RLS failed: anon can read share_audits';
  END IF;
END $$;

-- Switch to owner and read audits
SET LOCAL request.jwt.claims TO '{"sub": "smoke_sharing_user"}';
DO $$
DECLARE
  c int;
BEGIN
  SELECT COUNT(*) INTO c FROM public.share_audits a JOIN public.share_links l ON l.id = a.share_link_id WHERE l.created_by::text = 'smoke_sharing_user';
  IF c = 0 THEN
    RAISE EXCEPTION 'Expected at least 1 audit entry for created/access events';
  END IF;
END $$;

ROLLBACK;
