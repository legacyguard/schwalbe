-- Sharing core: share_links and share_audits with RPC helpers
-- Privacy: no PII beyond optional user_agent; IP is nullable.
-- Security: passwords hashed with bcrypt via pgcrypto crypt(); RLS enforced; public access via SECURITY DEFINER RPC only.

-- Ensure pgcrypto is available for gen_random_bytes and crypt
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================
-- Tables
-- =====================
CREATE TABLE IF NOT EXISTS public.share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by TEXT NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('document','will','vault','family')),
  resource_id TEXT NOT NULL,
  share_id TEXT UNIQUE NOT NULL, -- url-safe token (base64url)
  permissions JSONB NOT NULL DEFAULT jsonb_build_object(
    'read', true,
    'download', false,
    'comment', false,
    'share', false
  ),
  expires_at TIMESTAMPTZ,
  max_access_count INTEGER,
  access_count INTEGER NOT NULL DEFAULT 0,
  password_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_accessed_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.share_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_link_id UUID NOT NULL REFERENCES public.share_links(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created','access_granted','access_denied','expired','revoked','downloaded','viewed')),
  reason TEXT,
  user_agent TEXT,
  ip_address INET,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================
-- Indexes
-- =====================
CREATE INDEX IF NOT EXISTS idx_share_links_created_by ON public.share_links(created_by);
CREATE INDEX IF NOT EXISTS idx_share_links_share_id ON public.share_links(share_id);
CREATE INDEX IF NOT EXISTS idx_share_links_expires_at ON public.share_links(expires_at);
CREATE INDEX IF NOT EXISTS idx_share_links_active ON public.share_links(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_share_links_resource ON public.share_links(resource_type, resource_id);

CREATE INDEX IF NOT EXISTS idx_share_audits_share_link_id ON public.share_audits(share_link_id);
CREATE INDEX IF NOT EXISTS idx_share_audits_action ON public.share_audits(action);
CREATE INDEX IF NOT EXISTS idx_share_audits_created_at ON public.share_audits(created_at DESC);

-- =====================
-- RLS
-- =====================
ALTER TABLE public.share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_audits ENABLE ROW LEVEL SECURITY;

-- Owners can fully manage their share links
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='share_links' AND policyname='owners_manage_share_links'
  ) THEN
    CREATE POLICY owners_manage_share_links ON public.share_links
      FOR ALL
      TO authenticated
      USING (created_by = auth.uid()::text)
      WITH CHECK (created_by = auth.uid()::text);
  END IF;
END $$;

-- Owners can view audits for their share links
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='share_audits' AND policyname='owners_select_audits'
  ) THEN
    CREATE POLICY owners_select_audits ON public.share_audits
      FOR SELECT
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM public.share_links sl
        WHERE sl.id = share_audits.share_link_id AND sl.created_by = auth.uid()::text
      ));
  END IF;
END $$;

-- No direct inserts to audits from clients; RPC handles inserts with SECURITY DEFINER

-- =====================
-- Helper functions
-- =====================

-- Create a share link with optional password; returns share_id and effective settings
CREATE OR REPLACE FUNCTION public.create_share_link(
  p_resource_type TEXT,
  p_resource_id TEXT,
  p_permissions JSONB DEFAULT NULL,
  p_expires_at TIMESTAMPTZ DEFAULT NULL,
  p_max_access_count INTEGER DEFAULT NULL,
  p_password TEXT DEFAULT NULL
)
RETURNS TABLE (
  share_id TEXT,
  expires_at TIMESTAMPTZ,
  permissions JSONB
) AS $$
DECLARE
  v_share_id TEXT;
  v_permissions JSONB;
  v_password_hash TEXT;
  v_link_id UUID;
BEGIN
  -- Only authenticated users may create
  IF auth.role() <> 'authenticated' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Sanitize permissions
  v_permissions := COALESCE(p_permissions, jsonb_build_object('read', true, 'download', false, 'comment', false, 'share', false));

  -- Generate url-safe token
  v_share_id := replace(encode(gen_random_bytes(12), 'base64'), '/', '_');
  v_share_id := replace(v_share_id, '+', '-');
  v_share_id := trim(trailing '=' FROM v_share_id);

  -- Password hash (bcrypt via crypt)
  IF p_password IS NOT NULL AND length(p_password) > 0 THEN
    v_password_hash := crypt(p_password, gen_salt('bf'));
  ELSE
    v_password_hash := NULL;
  END IF;

  INSERT INTO public.share_links (
    created_by, resource_type, resource_id, share_id, permissions, expires_at, max_access_count, password_hash
  ) VALUES (
    auth.uid()::text, p_resource_type, p_resource_id, v_share_id, v_permissions, p_expires_at, p_max_access_count, v_password_hash
  ) RETURNING id INTO v_link_id;

  -- Audit: created
  INSERT INTO public.share_audits(share_link_id, action, reason)
  VALUES (v_link_id, 'created', NULL);

  RETURN QUERY SELECT v_share_id, p_expires_at, v_permissions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Verify access and record audit
CREATE OR REPLACE FUNCTION public.verify_share_access(
  p_share_id TEXT,
  p_password TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_ip INET DEFAULT NULL
)
RETURNS TABLE (
  status TEXT,
  reason TEXT,
  resource_type TEXT,
  resource_id TEXT,
  permissions JSONB,
  expires_at TIMESTAMPTZ,
  has_password BOOLEAN
) AS $$
DECLARE
  v_row public.share_links;
  v_now TIMESTAMPTZ := now();
BEGIN
  SELECT * INTO v_row FROM public.share_links WHERE share_id = p_share_id;

  IF NOT FOUND OR v_row.is_active = false THEN
    -- Not found or inactive
    RETURN QUERY SELECT 'invalid'::TEXT, 'not_found_or_inactive'::TEXT, NULL::TEXT, NULL::TEXT, NULL::JSONB, NULL::TIMESTAMPTZ, NULL::BOOLEAN;
    RETURN;
  END IF;

  -- Expiration and access limits
  IF v_row.expires_at IS NOT NULL AND v_now > v_row.expires_at THEN
    UPDATE public.share_links SET is_active = false WHERE id = v_row.id;
    INSERT INTO public.share_audits(share_link_id, action, reason, user_agent, ip_address)
    VALUES (v_row.id, 'expired', 'expired_by_time', p_user_agent, p_ip);
    RETURN QUERY SELECT 'expired'::TEXT, 'expired_by_time'::TEXT, NULL::TEXT, NULL::TEXT, NULL::JSONB, v_row.expires_at, (v_row.password_hash IS NOT NULL);
    RETURN;
  END IF;

  IF v_row.max_access_count IS NOT NULL AND v_row.access_count >= v_row.max_access_count THEN
    UPDATE public.share_links SET is_active = false WHERE id = v_row.id;
    INSERT INTO public.share_audits(share_link_id, action, reason, user_agent, ip_address)
    VALUES (v_row.id, 'expired', 'max_access_reached', p_user_agent, p_ip);
    RETURN QUERY SELECT 'expired'::TEXT, 'max_access_reached'::TEXT, NULL::TEXT, NULL::TEXT, NULL::JSONB, v_row.expires_at, (v_row.password_hash IS NOT NULL);
    RETURN;
  END IF;

  -- Password checks
  IF v_row.password_hash IS NOT NULL THEN
    IF p_password IS NULL OR p_password = '' THEN
      INSERT INTO public.share_audits(share_link_id, action, reason, user_agent, ip_address)
      VALUES (v_row.id, 'access_denied', 'password_required', p_user_agent, p_ip);
      RETURN QUERY SELECT 'password_required'::TEXT, 'password_required'::TEXT, NULL::TEXT, NULL::TEXT, NULL::JSONB, v_row.expires_at, true::BOOLEAN;
      RETURN;
    END IF;

    IF crypt(p_password, v_row.password_hash) <> v_row.password_hash THEN
      INSERT INTO public.share_audits(share_link_id, action, reason, user_agent, ip_address)
      VALUES (v_row.id, 'access_denied', 'password_incorrect', p_user_agent, p_ip);
      RETURN QUERY SELECT 'password_incorrect'::TEXT, 'password_incorrect'::TEXT, NULL::TEXT, NULL::TEXT, NULL::JSONB, v_row.expires_at, true::BOOLEAN;
      RETURN;
    END IF;
  END IF;

  -- Grant access
  UPDATE public.share_links
  SET access_count = v_row.access_count + 1,
      last_accessed_at = v_now
  WHERE id = v_row.id;

  INSERT INTO public.share_audits(share_link_id, action, reason, user_agent, ip_address)
  VALUES (v_row.id, 'access_granted', NULL, p_user_agent, p_ip);

  RETURN QUERY SELECT 'ok'::TEXT, NULL::TEXT, v_row.resource_type, v_row.resource_id, v_row.permissions, v_row.expires_at, (v_row.password_hash IS NOT NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grants for RPCs
DO $$
BEGIN
  GRANT EXECUTE ON FUNCTION public.create_share_link(TEXT, TEXT, JSONB, TIMESTAMPTZ, INTEGER, TEXT) TO authenticated;
  GRANT EXECUTE ON FUNCTION public.verify_share_access(TEXT, TEXT, TEXT, INET) TO anon, authenticated;
END $$;