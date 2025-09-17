-- Create email_logs table for tracking sent emails
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  to TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT CHECK (status IN ('sent', 'failed', 'bounced', 'pending')) DEFAULT 'pending',
  message_id TEXT,
  error TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create analytics_events table for tracking user actions
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  session_id TEXT,
  device_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subscription_metrics table for business analytics
CREATE TABLE IF NOT EXISTS public.subscription_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_users INTEGER DEFAULT 0,
  free_users INTEGER DEFAULT 0,
  essential_users INTEGER DEFAULT 0,
  family_users INTEGER DEFAULT 0,
  premium_users INTEGER DEFAULT 0,
  new_subscriptions INTEGER DEFAULT 0,
  cancellations INTEGER DEFAULT 0,
  mrr DECIMAL(10, 2) DEFAULT 0, -- Monthly Recurring Revenue
  arr DECIMAL(10, 2) DEFAULT 0, -- Annual Recurring Revenue
  churn_rate DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create usage_metrics table for tracking feature usage
CREATE TABLE IF NOT EXISTS public.usage_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  documents_created INTEGER DEFAULT 0,
  documents_viewed INTEGER DEFAULT 0,
  documents_shared INTEGER DEFAULT 0,
  scans_performed INTEGER DEFAULT 0,
  time_capsules_created INTEGER DEFAULT 0,
  storage_used_mb DECIMAL(10, 2) DEFAULT 0,
  sync_events INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create system_health table for monitoring
CREATE TABLE IF NOT EXISTS public.system_health (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL,
  status TEXT CHECK (status IN ('healthy', 'degraded', 'down')) DEFAULT 'healthy',
  response_time_ms INTEGER,
  error_rate DECIMAL(5, 2),
  last_error TEXT,
  checked_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

-- Create webhook_logs table for Stripe webhook tracking
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id TEXT UNIQUE,
  event_type TEXT NOT NULL,
  status TEXT CHECK (status IN ('received', 'processing', 'processed', 'failed')) DEFAULT 'received',
  payload JSONB,
  error TEXT,
  attempts INTEGER DEFAULT 1,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_email_logs_status ON public.email_logs(status);
CREATE INDEX idx_email_logs_sent_at ON public.email_logs(sent_at);
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX idx_subscription_metrics_date ON public.subscription_metrics(date);
CREATE INDEX idx_usage_metrics_user_date ON public.usage_metrics(user_id, date);
CREATE INDEX idx_system_health_service_name ON public.system_health(service_name);
CREATE INDEX idx_system_health_checked_at ON public.system_health(checked_at);
CREATE INDEX idx_webhook_logs_event_type ON public.webhook_logs(event_type);
CREATE INDEX idx_webhook_logs_status ON public.webhook_logs(status);

-- Enable Row Level Security
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_logs (admin only)
CREATE POLICY "Service role can manage email logs" ON public.email_logs
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- RLS Policies for analytics_events
CREATE POLICY "Users can view own analytics" ON public.analytics_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage analytics" ON public.analytics_events
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- RLS Policies for subscription_metrics (public read for dashboard)
CREATE POLICY "Anyone can view subscription metrics" ON public.subscription_metrics
  FOR SELECT USING (TRUE);

CREATE POLICY "Service role can manage subscription metrics" ON public.subscription_metrics
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- RLS Policies for usage_metrics
CREATE POLICY "Users can view own usage metrics" ON public.usage_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage usage metrics" ON public.usage_metrics
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- RLS Policies for system_health (public read)
CREATE POLICY "Anyone can view system health" ON public.system_health
  FOR SELECT USING (TRUE);

CREATE POLICY "Service role can manage system health" ON public.system_health
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- RLS Policies for webhook_logs (admin only)
CREATE POLICY "Service role can manage webhook logs" ON public.webhook_logs
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Function to calculate daily subscription metrics
CREATE OR REPLACE FUNCTION public.calculate_daily_metrics()
RETURNS void AS $$
DECLARE
  v_date DATE := CURRENT_DATE;
  v_total_users INTEGER;
  v_free_users INTEGER;
  v_essential_users INTEGER;
  v_family_users INTEGER;
  v_premium_users INTEGER;
  v_new_subs INTEGER;
  v_cancellations INTEGER;
  v_mrr DECIMAL(10, 2);
  v_arr DECIMAL(10, 2);
  v_churn_rate DECIMAL(5, 2);
BEGIN
  -- Count users by plan
  SELECT COUNT(*) INTO v_total_users FROM public.user_subscriptions WHERE status = 'active';
  SELECT COUNT(*) INTO v_free_users FROM public.user_subscriptions WHERE plan = 'free' AND status = 'active';
  SELECT COUNT(*) INTO v_essential_users FROM public.user_subscriptions WHERE plan = 'essential' AND status = 'active';
  SELECT COUNT(*) INTO v_family_users FROM public.user_subscriptions WHERE plan = 'family' AND status = 'active';
  SELECT COUNT(*) INTO v_premium_users FROM public.user_subscriptions WHERE plan = 'premium' AND status = 'active';
  
  -- Count new subscriptions today
  SELECT COUNT(*) INTO v_new_subs 
  FROM public.user_subscriptions 
  WHERE DATE(started_at) = v_date AND plan != 'free';
  
  -- Count cancellations today
  SELECT COUNT(*) INTO v_cancellations 
  FROM public.user_subscriptions 
  WHERE DATE(cancelled_at) = v_date;
  
  -- Calculate MRR (simplified - should consider actual billing cycles)
  SELECT 
    SUM(CASE 
      WHEN plan = 'essential' AND billing_cycle = 'month' THEN 9.99
      WHEN plan = 'essential' AND billing_cycle = 'year' THEN 99.99 / 12
      WHEN plan = 'family' AND billing_cycle = 'month' THEN 19.99
      WHEN plan = 'family' AND billing_cycle = 'year' THEN 199.99 / 12
      WHEN plan = 'premium' AND billing_cycle = 'month' THEN 39.99
      WHEN plan = 'premium' AND billing_cycle = 'year' THEN 399.99 / 12
      ELSE 0
    END) INTO v_mrr
  FROM public.user_subscriptions
  WHERE status = 'active' AND plan != 'free';
  
  -- Calculate ARR
  v_arr := v_mrr * 12;
  
  -- Calculate churn rate (monthly)
  IF v_total_users > 0 THEN
    v_churn_rate := (v_cancellations::DECIMAL / v_total_users) * 100;
  ELSE
    v_churn_rate := 0;
  END IF;
  
  -- Insert or update metrics
  INSERT INTO public.subscription_metrics (
    date, total_users, free_users, essential_users, family_users, premium_users,
    new_subscriptions, cancellations, mrr, arr, churn_rate
  ) VALUES (
    v_date, v_total_users, v_free_users, v_essential_users, v_family_users, v_premium_users,
    v_new_subs, v_cancellations, v_mrr, v_arr, v_churn_rate
  )
  ON CONFLICT (date) DO UPDATE SET
    total_users = EXCLUDED.total_users,
    free_users = EXCLUDED.free_users,
    essential_users = EXCLUDED.essential_users,
    family_users = EXCLUDED.family_users,
    premium_users = EXCLUDED.premium_users,
    new_subscriptions = EXCLUDED.new_subscriptions,
    cancellations = EXCLUDED.cancellations,
    mrr = EXCLUDED.mrr,
    arr = EXCLUDED.arr,
    churn_rate = EXCLUDED.churn_rate,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track analytics events
CREATE OR REPLACE FUNCTION public.track_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_event_data JSONB DEFAULT '{}',
  p_session_id TEXT DEFAULT NULL,
  p_device_info JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO public.analytics_events (
    user_id, event_type, event_data, session_id, device_info
  ) VALUES (
    p_user_id, p_event_type, p_event_data, p_session_id, p_device_info
  ) RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check system health
CREATE OR REPLACE FUNCTION public.check_system_health(
  p_service_name TEXT,
  p_status TEXT,
  p_response_time INTEGER DEFAULT NULL,
  p_error_rate DECIMAL DEFAULT NULL,
  p_last_error TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.system_health (
    service_name, status, response_time_ms, error_rate, last_error, metadata
  ) VALUES (
    p_service_name, p_status, p_response_time, p_error_rate, p_last_error, p_metadata
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule daily metrics calculation (requires pg_cron)
-- SELECT cron.schedule('calculate-daily-metrics', '0 2 * * *', 'SELECT public.calculate_daily_metrics();');
