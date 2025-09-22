-- Production hardening: enable row level security and baseline policies
-- This migration assumes the data model created by the onboarding/family/document migrations.
-- Always run in staging first and validate policy behaviour with automated tests.

-- Enable RLS and policies for family members
ALTER TABLE IF EXISTS family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS family_members FORCE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS family_members_select_own
  ON family_members FOR SELECT
  USING (family_owner_id = auth.uid() OR user_id = auth.uid());
CREATE POLICY IF NOT EXISTS family_members_insert_owner
  ON family_members FOR INSERT
  WITH CHECK (family_owner_id = auth.uid());
CREATE POLICY IF NOT EXISTS family_members_update_owner
  ON family_members FOR UPDATE
  USING (family_owner_id = auth.uid());
CREATE POLICY IF NOT EXISTS family_members_delete_owner
  ON family_members FOR DELETE
  USING (family_owner_id = auth.uid());

-- Invitations belong to owners
ALTER TABLE IF EXISTS family_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS family_invitations FORCE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS family_invitations_owner_only
  ON family_invitations
  USING (sender_id = auth.uid());

-- Emergency access requests
ALTER TABLE IF EXISTS emergency_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS emergency_access_requests FORCE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS emergency_requests_owner_or_requester
  ON emergency_access_requests
  USING (owner_id = auth.uid() OR requester_id = auth.uid());

-- Document shares: allow owners and recipients
ALTER TABLE IF EXISTS document_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS document_shares FORCE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS document_shares_owner_access
  ON document_shares FOR ALL
  USING (owner_id = auth.uid() OR shared_with_id = auth.uid());

-- Documents
ALTER TABLE IF EXISTS documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS documents FORCE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS documents_owner_access
  ON documents FOR ALL
  USING (owner_id = auth.uid());

-- Guardians table (if present)
ALTER TABLE IF EXISTS guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS guardians FORCE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS guardians_owner_access
  ON guardians FOR ALL
  USING (user_id = auth.uid() OR owner_id = auth.uid());

-- Trust seals and professional resources should only be accessible by associated professional
ALTER TABLE IF EXISTS professional_reviewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS professional_reviewers FORCE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS professional_reviewers_self_access
  ON professional_reviewers FOR ALL
  USING (user_id = auth.uid());

ALTER TABLE IF EXISTS trust_seals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS trust_seals FORCE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS trust_seals_owner_access
  ON trust_seals FOR ALL
  USING (professional_id IN (
    SELECT id FROM professional_reviewers WHERE user_id = auth.uid()
  ));

ALTER TABLE IF EXISTS review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS review_requests FORCE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS review_requests_owner_access
  ON review_requests FOR ALL
  USING (client_user_id = auth.uid() OR professional_id IN (
    SELECT id FROM professional_reviewers WHERE user_id = auth.uid()
  ));

-- Ensure realtime publication security
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS family_members, family_invitations, emergency_access_requests, document_shares, review_requests;
