-- Enhancement migration for observability tables
-- Adds additional indexes and functions for better observability
-- Builds on existing error_log, alert_rules, alert_instances tables

-- Additional indexes for error_log performance
CREATE INDEX IF NOT EXISTS idx_error_log_level_created_at ON public.error_log(level, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_log_message_text ON public.error_log USING gin(to_tsvector('english', message));

-- Enhanced alert rules with escalation support
ALTER TABLE public.alert_rules ADD COLUMN IF NOT EXISTS escalation_policy JSONB DEFAULT '{"levels": [{"delay_minutes": 0, "channels": ["email"]}]}';
ALTER TABLE public.alert_rules ADD COLUMN IF NOT EXISTS max_escalation_level INTEGER DEFAULT 0;

-- Enhanced alert instances with delivery tracking
ALTER TABLE public.alert_instances ADD COLUMN IF NOT EXISTS escalation_level INTEGER DEFAULT 0;
ALTER TABLE public.alert_instances ADD COLUMN IF NOT EXISTS delivery_attempts JSONB DEFAULT '[]';
ALTER TABLE public.alert_instances ADD COLUMN IF NOT EXISTS last_delivery_attempt TIMESTAMPTZ;

-- Additional indexes for enhanced alert functionality
CREATE INDEX IF NOT EXISTS idx_alert_instances_escalation_level ON public.alert_instances(escalation_level);
CREATE INDEX IF NOT EXISTS idx_alert_instances_last_delivery ON public.alert_instances(last_delivery_attempt);

-- Function to get error statistics
CREATE OR REPLACE FUNCTION public.get_error_statistics(
  p_start_time TIMESTAMPTZ DEFAULT NOW() - INTERVAL '1 hour',
  p_end_time TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE(
  level TEXT,
  count BIGINT,
  latest_error TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.level,
    COUNT(*) as count,
    MAX(e.created_at) as latest_error
  FROM public.error_log e
  WHERE e.created_at BETWEEN p_start_time AND p_end_time
  GROUP BY e.level
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get active alerts summary
CREATE OR REPLACE FUNCTION public.get_active_alerts_summary()
RETURNS TABLE(
  rule_name TEXT,
  severity TEXT,
  active_count BIGINT,
  suppressed_count BIGINT,
  latest_triggered TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ar.name as rule_name,
    ar.severity,
    COUNT(CASE WHEN ai.status = 'open' THEN 1 END) as active_count,
    COUNT(CASE WHEN ai.status = 'suppressed' THEN 1 END) as suppressed_count,
    MAX(ai.created_at) as latest_triggered
  FROM public.alert_rules ar
  LEFT JOIN public.alert_instances ai ON ar.id = ai.alert_rule_id
  WHERE ar.enabled = true
  GROUP BY ar.id, ar.name, ar.severity
  ORDER BY active_count DESC, ar.severity DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record delivery attempt
CREATE OR REPLACE FUNCTION public.record_delivery_attempt(
  p_instance_id UUID,
  p_channel TEXT,
  p_success BOOLEAN,
  p_error_message TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_delivery_record JSONB;
  v_current_attempts JSONB;
BEGIN
  -- Create delivery record
  v_delivery_record := jsonb_build_object(
    'timestamp', NOW(),
    'channel', p_channel,
    'success', p_success,
    'error_message', p_error_message
  );
  
  -- Get current delivery attempts
  SELECT delivery_attempts INTO v_current_attempts
  FROM public.alert_instances
  WHERE id = p_instance_id;
  
  -- Append new delivery attempt
  v_current_attempts := COALESCE(v_current_attempts, '[]'::jsonb) || v_delivery_record;
  
  -- Update the instance
  UPDATE public.alert_instances
  SET 
    delivery_attempts = v_current_attempts,
    last_delivery_attempt = NOW(),
    notification_sent = CASE 
      WHEN p_success THEN true 
      ELSE notification_sent 
    END
  WHERE id = p_instance_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to escalate alerts
CREATE OR REPLACE FUNCTION public.escalate_alert(p_instance_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_level INTEGER;
  v_max_level INTEGER;
  v_rule_id UUID;
BEGIN
  -- Get current escalation info
  SELECT 
    ai.escalation_level,
    ar.max_escalation_level,
    ai.alert_rule_id
  INTO v_current_level, v_max_level, v_rule_id
  FROM public.alert_instances ai
  JOIN public.alert_rules ar ON ai.alert_rule_id = ar.id
  WHERE ai.id = p_instance_id;
  
  -- Check if escalation is possible
  IF v_current_level >= v_max_level THEN
    RETURN FALSE;
  END IF;
  
  -- Escalate
  UPDATE public.alert_instances
  SET escalation_level = v_current_level + 1
  WHERE id = p_instance_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old error logs (keep for 7 days by default)
CREATE OR REPLACE FUNCTION public.cleanup_old_error_logs(
  p_retention_days INTEGER DEFAULT 7
)
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM public.error_log
  WHERE created_at < NOW() - (p_retention_days || ' days')::INTERVAL;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to service role
GRANT EXECUTE ON FUNCTION public.get_error_statistics TO service_role;
GRANT EXECUTE ON FUNCTION public.get_active_alerts_summary TO service_role;
GRANT EXECUTE ON FUNCTION public.record_delivery_attempt TO service_role;
GRANT EXECUTE ON FUNCTION public.escalate_alert TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_old_error_logs TO service_role;