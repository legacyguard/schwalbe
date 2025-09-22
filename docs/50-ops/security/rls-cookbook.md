# RLS Policy Cookbook

Purpose: Standardize secure, performant RLS policies for common ownership models.

Patterns
1) Owner-only tables
- Columns: user_id (UUID or TEXT), created_at, updated_at
- Policies:
  - SELECT/UPDATE/DELETE: USING (user_id = auth.uid() [::text])
  - INSERT: WITH CHECK (user_id = auth.uid() [::text])
- Indexes: CREATE INDEX ON table(user_id), created_at DESC

2) Owner + admin
- Add EXISTS check referencing a role table or JWT claim
- Example admin claim: auth.jwt() ->> 'role' = 'admin'

3) Owner + guardian (two-party access)
- Guardian mapping table: guardians(user_id, guardian_id)
- SELECT USING (
  user_id = auth.uid() [::text]
  OR auth.uid() [::text] IN (SELECT guardian_id FROM guardians WHERE user_id = table.user_id)
)

4) Join tables
- e.g., document_shares(user_id, document_id)
- SELECT USING (
  auth.uid() [::text] = user_id OR
  auth.uid() [::text] = (SELECT d.user_id FROM documents d WHERE d.id = document_id)
)

5) Public read, private write
- SELECT USING (true)
- INSERT/UPDATE/DELETE restricted to owner/admin

Testing
- Always include positive/negative tests (two-user tests) with expected row counts.
- Add pgTap or SQL test scripts in CI.

Performance
- Always index user_id; add composite indexes for frequent filters.
- Avoid unbounded subqueries inside policies; prefer EXISTS and index-supported filters.
