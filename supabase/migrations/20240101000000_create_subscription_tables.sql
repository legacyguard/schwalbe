-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'essential', 'family', 'premium')),
  status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'past_due', 'cancelled', 'trialing')),
  billing_cycle TEXT DEFAULT 'month' CHECK (billing_cycle IN ('month', 'year')),
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create user_usage table for tracking limits
CREATE TABLE IF NOT EXISTS public.user_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_count INTEGER DEFAULT 0,
  storage_used_mb DECIMAL(10, 2) DEFAULT 0,
  time_capsule_count INTEGER DEFAULT 0,
  scans_this_month INTEGER DEFAULT 0,
  offline_document_count INTEGER DEFAULT 0,
  last_reset_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create subscription_limits table for plan definitions
CREATE TABLE IF NOT EXISTS public.subscription_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan TEXT UNIQUE NOT NULL CHECK (plan IN ('free', 'essential', 'family', 'premium')),
  max_documents INTEGER,
  max_storage_mb INTEGER,
  max_time_capsules INTEGER,
  max_scans_per_month INTEGER,
  max_family_members INTEGER DEFAULT 1,
  offline_access BOOLEAN DEFAULT FALSE,
  ai_features BOOLEAN DEFAULT FALSE,
  advanced_search BOOLEAN DEFAULT FALSE,
  priority_support BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default plan limits
INSERT INTO public.subscription_limits (plan, max_documents, max_storage_mb, max_time_capsules, max_scans_per_month, max_family_members, offline_access, ai_features, advanced_search, priority_support) VALUES
('free', 100, 500, 1, 10, 1, FALSE, FALSE, FALSE, FALSE),
('essential', 1000, 5120, 5, 100, 1, TRUE, FALSE, TRUE, FALSE),
('family', 5000, 20480, 20, 500, 5, TRUE, TRUE, TRUE, FALSE),
('premium', NULL, NULL, NULL, NULL, 10, TRUE, TRUE, TRUE, TRUE)
ON CONFLICT (plan) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_stripe_customer_id ON public.user_subscriptions(stripe_customer_id);
CREATE INDEX idx_user_subscriptions_stripe_subscription_id ON public.user_subscriptions(stripe_subscription_id);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX idx_user_usage_user_id ON public.user_usage(user_id);

-- Enable Row Level Security
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_limits ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_subscriptions
CREATE POLICY "Users can view own subscription" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all subscriptions" ON public.user_subscriptions
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Create RLS policies for user_usage
CREATE POLICY "Users can view own usage" ON public.user_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all usage" ON public.user_usage
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Create RLS policies for subscription_limits (read-only for all authenticated users)
CREATE POLICY "Anyone can view subscription limits" ON public.subscription_limits
  FOR SELECT USING (TRUE);

-- Create function to automatically create user_subscription and user_usage records
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default subscription record
  INSERT INTO public.user_subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active');
  
  -- Create default usage record
  INSERT INTO public.user_usage (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to check usage limits
CREATE OR REPLACE FUNCTION public.check_usage_limit(
  p_user_id UUID,
  p_limit_type TEXT,
  p_increment INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan TEXT;
  v_current_usage INTEGER;
  v_max_limit INTEGER;
BEGIN
  -- Get user's current plan
  SELECT plan INTO v_plan
  FROM public.user_subscriptions
  WHERE user_id = p_user_id AND status = 'active';
  
  IF v_plan IS NULL THEN
    v_plan := 'free';
  END IF;
  
  -- Get current usage and limit based on type
  CASE p_limit_type
    WHEN 'documents' THEN
      SELECT document_count INTO v_current_usage FROM public.user_usage WHERE user_id = p_user_id;
      SELECT max_documents INTO v_max_limit FROM public.subscription_limits WHERE plan = v_plan;
    WHEN 'storage' THEN
      SELECT storage_used_mb INTO v_current_usage FROM public.user_usage WHERE user_id = p_user_id;
      SELECT max_storage_mb INTO v_max_limit FROM public.subscription_limits WHERE plan = v_plan;
    WHEN 'time_capsules' THEN
      SELECT time_capsule_count INTO v_current_usage FROM public.user_usage WHERE user_id = p_user_id;
      SELECT max_time_capsules INTO v_max_limit FROM public.subscription_limits WHERE plan = v_plan;
    WHEN 'scans' THEN
      SELECT scans_this_month INTO v_current_usage FROM public.user_usage WHERE user_id = p_user_id;
      SELECT max_scans_per_month INTO v_max_limit FROM public.subscription_limits WHERE plan = v_plan;
    ELSE
      RETURN FALSE;
  END CASE;
  
  -- NULL means unlimited
  IF v_max_limit IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Check if adding increment would exceed limit
  RETURN (v_current_usage + p_increment) <= v_max_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment usage
CREATE OR REPLACE FUNCTION public.increment_usage(
  p_user_id UUID,
  p_usage_type TEXT,
  p_amount INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if increment is allowed
  IF NOT public.check_usage_limit(p_user_id, p_usage_type, p_amount) THEN
    RETURN FALSE;
  END IF;
  
  -- Increment the appropriate counter
  CASE p_usage_type
    WHEN 'documents' THEN
      UPDATE public.user_usage 
      SET document_count = document_count + p_amount,
          updated_at = NOW()
      WHERE user_id = p_user_id;
    WHEN 'storage' THEN
      UPDATE public.user_usage 
      SET storage_used_mb = storage_used_mb + p_amount,
          updated_at = NOW()
      WHERE user_id = p_user_id;
    WHEN 'time_capsules' THEN
      UPDATE public.user_usage 
      SET time_capsule_count = time_capsule_count + p_amount,
          updated_at = NOW()
      WHERE user_id = p_user_id;
    WHEN 'scans' THEN
      UPDATE public.user_usage 
      SET scans_this_month = scans_this_month + p_amount,
          updated_at = NOW()
      WHERE user_id = p_user_id;
    ELSE
      RETURN FALSE;
  END CASE;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to reset monthly usage
CREATE OR REPLACE FUNCTION public.reset_monthly_usage()
RETURNS void AS $$
BEGIN
  UPDATE public.user_usage
  SET scans_this_month = 0,
      last_reset_date = NOW(),
      updated_at = NOW()
  WHERE DATE_TRUNC('month', last_reset_date) < DATE_TRUNC('month', NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to reset monthly usage (requires pg_cron extension)
-- This should be run once a day
-- SELECT cron.schedule('reset-monthly-usage', '0 0 * * *', 'SELECT public.reset_monthly_usage();');
