-- Create alert_rules and alert_instances tables for observability
-- Supports alert rules configuration and instance tracking with deduplication

-- Alert Rules table - defines alert conditions and configuration
CREATE TABLE IF NOT EXISTS public.alert_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  condition_type TEXT NOT NULL,
  condition_config JSONB NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  enabled BOOLEAN NOT NULL DEFAULT true,
  cooldown_minutes INTEGER NOT NULL DEFAULT 30,
  notification_channels TEXT[] NOT NULL DEFAULT '{email}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Alert Instances table - tracks triggered alerts with fingerprinting for deduplication
CREATE TABLE IF NOT EXISTS public.alert_instances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_rule_id UUID NOT NULL REFERENCES public.alert_rules(id) ON DELETE CASCADE,
  fingerprint TEXT NOT NULL, -- Hash of alert content for deduplication
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  triggered_data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'suppressed', 'resolved')),
  notification_sent BOOLEAN NOT NULL DEFAULT false,
  suppressed_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_alert_rules_enabled ON public.alert_rules(enabled);
CREATE INDEX IF NOT EXISTS idx_alert_rules_name ON public.alert_rules(name);
CREATE INDEX IF NOT EXISTS idx_alert_instances_rule_id ON public.alert_instances(alert_rule_id);
CREATE INDEX IF NOT EXISTS idx_alert_instances_status ON public.alert_instances(status);
CREATE INDEX IF NOT EXISTS idx_alert_instances_fingerprint ON public.alert_instances(fingerprint);
CREATE INDEX IF NOT EXISTS idx_alert_instances_created_at ON public.alert_instances(created_at);
CREATE INDEX IF NOT EXISTS idx_alert_instances_suppressed_until ON public.alert_instances(suppressed_until);

-- Unique constraint for deduplication within cooldown period
-- Note: Cannot use NOW() in index predicate as it's not immutable
-- Deduplication logic will be handled in application/function level
CREATE UNIQUE INDEX IF NOT EXISTS idx_alert_instances_fingerprint_active 
  ON public.alert_instances(fingerprint) 
  WHERE status = 'active';

-- Enable Row Level Security
ALTER TABLE public.alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_instances ENABLE ROW LEVEL SECURITY;

-- RLS Policies for alert_rules (service role manage, admin read)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'alert_rules' AND policyname = 'Service role can manage alert rules'
  ) THEN
    CREATE POLICY "Service role can manage alert rules" ON public.alert_rules
      FOR ALL 
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- RLS Policies for alert_instances (service role manage, admin read)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'alert_instances' AND policyname = 'Service role can manage alert instances'
  ) THEN
    CREATE POLICY "Service role can manage alert instances" ON public.alert_instances
      FOR ALL 
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Function to trigger alert with deduplication support
CREATE OR REPLACE FUNCTION public.trigger_alert(
  p_rule_name TEXT,
  p_title TEXT,
  p_message TEXT,
  p_triggered_data JSONB DEFAULT '{}',
  p_fingerprint TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_rule_id UUID;
  v_severity TEXT;
  v_cooldown_minutes INTEGER;
  v_enabled BOOLEAN;
  v_instance_id UUID;
  v_fingerprint TEXT;
  v_existing_instance UUID;
BEGIN
  -- Get rule configuration
  SELECT id, severity, cooldown_minutes, enabled
  INTO v_rule_id, v_severity, v_cooldown_minutes, v_enabled
  FROM public.alert_rules
  WHERE name = p_rule_name;
  
  -- Check if rule exists and is enabled
  IF v_rule_id IS NULL THEN
    RAISE EXCEPTION 'Alert rule % not found', p_rule_name;
  END IF;
  
  IF NOT v_enabled THEN
    RAISE NOTICE 'Alert rule % is disabled, skipping', p_rule_name;
    RETURN NULL;
  END IF;
  
  -- Generate fingerprint for deduplication
  v_fingerprint := COALESCE(
    p_fingerprint, 
    encode(digest(p_rule_name || ':' || p_title || ':' || p_message, 'sha256'), 'hex')
  );
  
  -- Check for existing suppressed instance within cooldown
  SELECT id INTO v_existing_instance
  FROM public.alert_instances
  WHERE fingerprint = v_fingerprint
    AND alert_rule_id = v_rule_id
    AND (
      status = 'suppressed' 
      OR (suppressed_until IS NOT NULL AND suppressed_until > NOW())
    )
  LIMIT 1;
  
  -- If alert is suppressed, extend suppression and return existing ID
  IF v_existing_instance IS NOT NULL THEN
    UPDATE public.alert_instances
    SET suppressed_until = NOW() + (v_cooldown_minutes || ' minutes')::INTERVAL,
        triggered_data = p_triggered_data
    WHERE id = v_existing_instance;
    
    RAISE NOTICE 'Alert % suppressed until %', p_title, NOW() + (v_cooldown_minutes || ' minutes')::INTERVAL;
    RETURN v_existing_instance;
  END IF;
  
  -- Create new alert instance
  INSERT INTO public.alert_instances (
    alert_rule_id, fingerprint, title, message, severity, triggered_data,
    status, suppressed_until
  ) VALUES (
    v_rule_id, v_fingerprint, p_title, p_message, v_severity, p_triggered_data,
    'open', NOW() + (v_cooldown_minutes || ' minutes')::INTERVAL
  ) RETURNING id INTO v_instance_id;
  
  RAISE NOTICE 'Alert triggered: % (ID: %)', p_title, v_instance_id;
  RETURN v_instance_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to resolve alert instances
CREATE OR REPLACE FUNCTION public.resolve_alert(p_instance_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.alert_instances
  SET status = 'resolved',
      resolved_at = NOW()
  WHERE id = p_instance_id
    AND status != 'resolved';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to suppress alert instances
CREATE OR REPLACE FUNCTION public.suppress_alert(
  p_instance_id UUID,
  p_duration_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.alert_instances
  SET status = 'suppressed',
      suppressed_until = NOW() + (p_duration_minutes || ' minutes')::INTERVAL
  WHERE id = p_instance_id
    AND status != 'resolved';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup function for old resolved alerts (keep for 30 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_alerts()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM public.alert_instances
  WHERE status = 'resolved'
    AND resolved_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create some default alert rules
INSERT INTO public.alert_rules (name, condition_type, condition_config, severity, cooldown_minutes, notification_channels)
VALUES 
  (
    'critical_error_spike',
    'error_rate',
    '{"threshold": 10, "window_minutes": 5, "level": "error"}',
    'critical',
    15,
    '{email}'
  ),
  (
    'subscription_webhook_failures',
    'webhook_failure_rate',
    '{"threshold": 3, "window_minutes": 10, "event_type": "stripe"}',
    'high',
    30,
    '{email}'
  ),
  (
    'high_error_rate',
    'error_rate',
    '{"threshold": 5, "window_minutes": 10, "level": "warn"}',
    'medium',
    60,
    '{email}'
  )
ON CONFLICT (name) DO NOTHING;