# RLS Test Harness (SQL)

Purpose
- Assert owner vs non-owner access across tables guarded by auth.uid()

Setup pattern
- In a test session, set request.jwt.claims to simulate different users

Examples
```sql
-- Simulate user A
SET LOCAL request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000A"}';
SELECT current_setting('request.jwt.claims', true);

-- Should return only user A profile
SELECT * FROM public.profiles; 

-- Simulate user B
SET LOCAL request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000B"}';

-- Should return no profile for user A id
SELECT * FROM public.profiles WHERE user_id = '00000000-0000-0000-0000-00000000000A'::uuid; -- expect 0 rows

-- Service role bypass (example)
RESET ALL; -- or use a separate connection with service_role
-- Verify admin/system access where intended
```

Notes
- Ensure all user_id columns are UUID
- Prefer explicit casts (uuid) when comparing literals
