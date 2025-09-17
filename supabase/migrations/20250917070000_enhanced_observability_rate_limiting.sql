-- Enhanced observability with sophisticated alert rate limiting and metrics collection
-- This migration adds advanced rate limiting, metrics tracking, and alert escalation

-- Alert rate limiting configuration table
CREATE TABLE IF NOT EXISTS public.alert_rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_name TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  bucket_window_minutes INTEGER NOT NULL DEFAULT 60,
  max_alerts_per_window INTEGER NOT NULL DEFAULT 5,
  current_count INTEGER NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_alert_at TIMESTAMPTZ,
  escalation_level INTEGER NOT NULL DEFAULT 0,
  next_escalation_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Metrics collection table for observability data
CREATE TABLE IF NOT EXISTS public.observability_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('counter', 'gauge', 'histogram', 'summary')),
  value NUMERIC NOT NULL,
  labels JSONB NOT NULL DEFAULT '{}',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  environment TEXT NOT NULL DEFAULT 'development'
);

-- Alert escalation rules table
CREATE TABLE IF NOT EXISTS public.alert_escalation_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_name TEXT UNIQUE NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  initial_cooldown_minutes INTEGER NOT NULL DEFAULT 30,
  escalation_multiplier NUMERIC NOT NULL DEFAULT 2.0,
  max_escalation_level INTEGER NOT NULL DEFAULT 3,
  escalation_channels TEXT[] NOT NULL DEFAULT '{email}',
  pagerduty_integration BOOLEAN NOT NULL DEFAULT false,
  slack_integration BOOLEAN NOT NULL DEFAULT false,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Alert notification history for tracking delivery
CREATE TABLE IF NOT EXISTS public.alert_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_instance_id UUID NOT NULL REFERENCES public.alert_instances(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'slack', 'pagerduty', 'webhook')),
  recipient TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'pending', 'delivered')),
  attempt_count INTEGER NOT NULL DEFAULT 1,
  error_message TEXT,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_alert_rate_limits_fingerprint ON public.alert_rate_limits(fingerprint);
CREATE INDEX IF NOT EXISTS idx_alert_rate_limits_rule_name ON public.alert_rate_limits(rule_name);
CREATE INDEX IF NOT EXISTS idx_alert_rate_limits_window_start ON public.alert_rate_limits(window_start);
CREATE INDEX IF NOT EXISTS idx_observability_metrics_name_timestamp ON public.observability_metrics(metric_name, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_observability_metrics_type ON public.observability_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_observability_metrics_environment ON public.observability_metrics(environment);
CREATE INDEX IF NOT EXISTS idx_alert_escalation_rules_enabled ON public.alert_escalation_rules(enabled);
CREATE INDEX IF NOT EXISTS idx_alert_notifications_instance_id ON public.alert_notifications(alert_instance_id);
CREATE INDEX IF NOT EXISTS idx_alert_notifications_status ON public.alert_notifications(status);
CREATE INDEX IF NOT EXISTS idx_alert_notifications_created_at ON public.alert_notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.alert_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observability_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_escalation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies (service role manages all observability data)
DO $$
BEGIN
  -- Alert rate limits
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'alert_rate_limits' AND policyname = 'Service role manages rate limits'
  ) THEN
    CREATE POLICY "Service role manages rate limits" ON public.alert_rate_limits
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;

  -- Observability metrics
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'observability_metrics' AND policyname = 'Service role manages metrics'
  ) THEN
    CREATE POLICY "Service role manages metrics" ON public.observability_metrics
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;

  -- Alert escalation rules
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'alert_escalation_rules' AND policyname = 'Service role manages escalation rules'
  ) THEN
    CREATE POLICY "Service role manages escalation rules" ON public.alert_escalation_rules
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;

  -- Alert notifications
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'alert_notifications' AND policyname = 'Service role manages notifications'
  ) THEN
    CREATE POLICY "Service role manages notifications" ON public.alert_notifications
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Enhanced alert triggering function with sophisticated rate limiting
CREATE OR REPLACE FUNCTION public.trigger_alert_with_rate_limiting(
  p_rule_name TEXT,
  p_title TEXT,
  p_message TEXT,
  p_triggered_data JSONB DEFAULT '{}',
  p_fingerprint TEXT DEFAULT NULL,
  p_override_rate_limit BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  alert_id UUID,
  rate_limited BOOLEAN,
  escalation_level INTEGER,
  next_allowed_at TIMESTAMPTZ
) AS $$
DECLARE
  v_rule_id UUID;
  v_severity TEXT;
  v_cooldown_minutes INTEGER;
  v_enabled BOOLEAN;
  v_instance_id UUID;
  v_fingerprint TEXT;
  v_rate_limit_id UUID;
  v_current_count INTEGER;
  v_window_start TIMESTAMPTZ;
  v_max_alerts INTEGER;
  v_bucket_window INTEGER;
  v_escalation_level INTEGER := 0;
  v_next_allowed TIMESTAMPTZ;
  v_should_alert BOOLEAN := TRUE;
BEGIN
  -- Get rule configuration
  SELECT ar.id, ar.severity, ar.cooldown_minutes, ar.enabled
  INTO v_rule_id, v_severity, v_cooldown_minutes, v_enabled
  FROM public.alert_rules ar
  WHERE ar.name = p_rule_name;
  
  -- Check if rule exists and is enabled
  IF v_rule_id IS NULL THEN
    RAISE EXCEPTION 'Alert rule % not found', p_rule_name;
  END IF;
  
  IF NOT v_enabled THEN
    RETURN QUERY SELECT NULL::UUID, FALSE, 0, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;
  
  -- Generate fingerprint for deduplication
  v_fingerprint := COALESCE(
    p_fingerprint, 
    encode(digest(p_rule_name || ':' || p_title || ':' || p_message, 'sha256'), 'hex')
  );
  
  -- Get or create rate limiting bucket
  SELECT id, current_count, window_start, max_alerts_per_window, bucket_window_minutes, escalation_level
  INTO v_rate_limit_id, v_current_count, v_window_start, v_max_alerts, v_bucket_window, v_escalation_level
  FROM public.alert_rate_limits
  WHERE rule_name = p_rule_name AND fingerprint = v_fingerprint;
  
  -- Create rate limiting bucket if it doesn't exist
  IF v_rate_limit_id IS NULL THEN
    INSERT INTO public.alert_rate_limits (
      rule_name, fingerprint, bucket_window_minutes, max_alerts_per_window
    ) VALUES (
      p_rule_name, v_fingerprint, 60, 5
    ) RETURNING id, current_count, window_start, max_alerts_per_window, bucket_window_minutes, escalation_level
    INTO v_rate_limit_id, v_current_count, v_window_start, v_max_alerts, v_bucket_window, v_escalation_level;
  END IF;
  
  -- Check if we need to reset the window
  IF NOW() > v_window_start + (v_bucket_window || ' minutes')::INTERVAL THEN
    UPDATE public.alert_rate_limits
    SET current_count = 0,
        window_start = NOW(),
        escalation_level = 0,
        updated_at = NOW()
    WHERE id = v_rate_limit_id;
    
    v_current_count := 0;
    v_escalation_level := 0;
    v_window_start := NOW();
  END IF;
  
  -- Calculate next allowed time
  v_next_allowed := v_window_start + (v_bucket_window || ' minutes')::INTERVAL;
  
  -- Check rate limiting (unless overridden)
  IF NOT p_override_rate_limit AND v_current_count >= v_max_alerts THEN
    -- Increment escalation level
    v_escalation_level := v_escalation_level + 1;
    
    UPDATE public.alert_rate_limits
    SET escalation_level = v_escalation_level,
        next_escalation_at = NOW() + (v_cooldown_minutes * POWER(2, v_escalation_level) || ' minutes')::INTERVAL,
        updated_at = NOW()
    WHERE id = v_rate_limit_id;
    
    -- Only allow escalated alerts if escalation level is moderate
    v_should_alert := v_escalation_level <= 3 AND v_escalation_level % 2 = 0;
  END IF;
  
  -- If rate limited and not escalating, return early
  IF NOT v_should_alert THEN
    RETURN QUERY SELECT NULL::UUID, TRUE, v_escalation_level, v_next_allowed;
    RETURN;
  END IF;
  
  -- Update rate limiting counter
  UPDATE public.alert_rate_limits
  SET current_count = v_current_count + 1,
      last_alert_at = NOW(),
      updated_at = NOW()
  WHERE id = v_rate_limit_id;
  
  -- Create alert instance
  INSERT INTO public.alert_instances (
    alert_rule_id, fingerprint, title, message, severity, triggered_data, status
  ) VALUES (
    v_rule_id, v_fingerprint, p_title, p_message, v_severity, 
    p_triggered_data || jsonb_build_object('escalation_level', v_escalation_level), 'open'
  ) RETURNING id INTO v_instance_id;
  
  RETURN QUERY SELECT v_instance_id, FALSE, v_escalation_level, v_next_allowed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record observability metrics
CREATE OR REPLACE FUNCTION public.record_metric(
  p_metric_name TEXT,
  p_metric_type TEXT,
  p_value NUMERIC,
  p_labels JSONB DEFAULT '{}',
  p_environment TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_metric_id UUID;
  v_environment TEXT;
BEGIN
  v_environment := COALESCE(p_environment, current_setting('app.environment', true), 'development');
  
  INSERT INTO public.observability_metrics (
    metric_name, metric_type, value, labels, environment
  ) VALUES (
    p_metric_name, p_metric_type, p_value, p_labels, v_environment
  ) RETURNING id INTO v_metric_id;
  
  RETURN v_metric_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get alert rate limiting status
CREATE OR REPLACE FUNCTION public.get_alert_rate_limit_status(
  p_rule_name TEXT DEFAULT NULL,
  p_fingerprint TEXT DEFAULT NULL
)
RETURNS TABLE (
  rule_name TEXT,
  fingerprint TEXT,
  current_count INTEGER,
  max_alerts INTEGER,
  window_minutes INTEGER,
  window_progress_percent NUMERIC,
  escalation_level INTEGER,
  is_rate_limited BOOLEAN,
  next_window_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    arl.rule_name,
    arl.fingerprint,
    arl.current_count,
    arl.max_alerts_per_window,
    arl.bucket_window_minutes,
    ROUND(
      (EXTRACT(EPOCH FROM (NOW() - arl.window_start)) / 
       EXTRACT(EPOCH FROM (arl.bucket_window_minutes || ' minutes')::INTERVAL)) * 100, 2
    ) as window_progress_percent,
    arl.escalation_level,
    (arl.current_count >= arl.max_alerts_per_window) as is_rate_limited,
    (arl.window_start + (arl.bucket_window_minutes || ' minutes')::INTERVAL) as next_window_at
  FROM public.alert_rate_limits arl
  WHERE (p_rule_name IS NULL OR arl.rule_name = p_rule_name)
    AND (p_fingerprint IS NULL OR arl.fingerprint = p_fingerprint)
  ORDER BY arl.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get observability metrics with aggregation
CREATE OR REPLACE FUNCTION public.get_metrics_summary(
  p_metric_name TEXT DEFAULT NULL,
  p_environment TEXT DEFAULT NULL,
  p_hours_back INTEGER DEFAULT 24
)
RETURNS TABLE (
  metric_name TEXT,
  metric_type TEXT,
  environment TEXT,
  count BIGINT,
  min_value NUMERIC,
  max_value NUMERIC,
  avg_value NUMERIC,
  sum_value NUMERIC,
  latest_value NUMERIC,
  latest_timestamp TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    om.metric_name,
    om.metric_type,
    om.environment,
    COUNT(*) as count,
    MIN(om.value) as min_value,
    MAX(om.value) as max_value,
    ROUND(AVG(om.value), 4) as avg_value,
    SUM(om.value) as sum_value,
    (array_agg(om.value ORDER BY om.timestamp DESC))[1] as latest_value,
    MAX(om.timestamp) as latest_timestamp
  FROM public.observability_metrics om
  WHERE (p_metric_name IS NULL OR om.metric_name = p_metric_name)
    AND (p_environment IS NULL OR om.environment = p_environment)
    AND om.timestamp >= NOW() - (p_hours_back || ' hours')::INTERVAL
  GROUP BY om.metric_name, om.metric_type, om.environment
  ORDER BY latest_timestamp DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old metrics and rate limiting data
CREATE OR REPLACE FUNCTION public.cleanup_observability_data(
  p_metrics_retention_days INTEGER DEFAULT 30,
  p_rate_limits_retention_days INTEGER DEFAULT 7
)
RETURNS TABLE (
  cleaned_metrics INTEGER,
  cleaned_rate_limits INTEGER,
  cleaned_notifications INTEGER
) AS $$
DECLARE
  v_metrics_deleted INTEGER;
  v_rate_limits_deleted INTEGER;
  v_notifications_deleted INTEGER;
BEGIN
  -- Clean up old metrics
  DELETE FROM public.observability_metrics
  WHERE timestamp < NOW() - (p_metrics_retention_days || ' days')::INTERVAL;
  GET DIAGNOSTICS v_metrics_deleted = ROW_COUNT;
  
  -- Clean up old rate limiting data
  DELETE FROM public.alert_rate_limits
  WHERE updated_at < NOW() - (p_rate_limits_retention_days || ' days')::INTERVAL;
  GET DIAGNOSTICS v_rate_limits_deleted = ROW_COUNT;
  
  -- Clean up old notification records
  DELETE FROM public.alert_notifications
  WHERE created_at < NOW() - (p_rate_limits_retention_days || ' days')::INTERVAL;
  GET DIAGNOSTICS v_notifications_deleted = ROW_COUNT;
  
  RETURN QUERY SELECT v_metrics_deleted, v_rate_limits_deleted, v_notifications_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create default escalation rules
INSERT INTO public.alert_escalation_rules (
  rule_name, severity, initial_cooldown_minutes, escalation_multiplier, max_escalation_level, escalation_channels
) VALUES 
  ('critical_errors', 'critical', 15, 2.0, 4, '{email,slack}'),
  ('high_errors', 'high', 30, 1.5, 3, '{email}'),
  ('medium_errors', 'medium', 60, 1.2, 2, '{email}'),
  ('system_health', 'high', 20, 2.0, 3, '{email,slack}')
ON CONFLICT (rule_name) DO NOTHING;

-- Grant permissions
DO $$
BEGIN
  GRANT EXECUTE ON FUNCTION public.trigger_alert_with_rate_limiting(TEXT, TEXT, TEXT, JSONB, TEXT, BOOLEAN) TO service_role;
  GRANT EXECUTE ON FUNCTION public.record_metric(TEXT, TEXT, NUMERIC, JSONB, TEXT) TO service_role, authenticated;
  GRANT EXECUTE ON FUNCTION public.get_alert_rate_limit_status(TEXT, TEXT) TO service_role, authenticated;
  GRANT EXECUTE ON FUNCTION public.get_metrics_summary(TEXT, TEXT, INTEGER) TO service_role, authenticated;
  GRANT EXECUTE ON FUNCTION public.cleanup_observability_data(INTEGER, INTEGER) TO service_role;
END $$;