# RLS Test Template (Positive/Negative)

Purpose: Provide a reusable matrix for validating RLS.

Actors
- userA (owner)
- userB (non-owner)
- admin (optional)

Test Matrix (example for `documents`)
- Positive: as userA, SELECT/UPDATE/DELETE own rows → success (>0 rows for SELECT)
- Negative: as userB, SELECT/UPDATE/DELETE userA rows → 0 rows or denied
- Insert: as userA, INSERT with user_id = userA → success; user_id != userA → denied
- Admin (if applicable): admin can read/update as permitted with audit logs

Reporting
- For each test: expected vs actual row counts/status; correlationId; timestamp.
