-- Subscriptions Tracking: metadata, preferences, and expiry reminders
-- Timestamp: 2025-09-16 05:25:00 UTC

-- Ensure pgcrypto for UUIDs
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Extend user_subscriptions with metadata needed for cost and renewal views
ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS price_amount_cents INTEGER,
  ADD COLUMN IF NOT EXISTS price_currency TEXT,
  ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS renew_url TEXT;

-- Helpful for queries and scheduling
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expires_at ON public.user_subscriptions(expires_at);

-- 2) Subscription preferences (per-user notification settings)
CREATE TABLE IF NOT EXISTS public.subscription_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  days_before_primary INTEGER NOT NULL DEFAULT 7 CHECK (days_before_primary BETWEEN 0 AND 365),
  days_before_secondary INTEGER NOT NULL DEFAULT 1 CHECK (days_before_secondary BETWEEN 0 AND 365),
  channels JSONB NOT NULL DEFAULT '["email","in_app"]', -- delivery channels for reminders
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.subscription_preferences ENABLE ROW LEVEL SECURITY;

-- RLS: owners can manage their preferences
DROP POLICY IF EXISTS "subscription_prefs_owner_select" ON public.subscription_preferences;
CREATE POLICY "subscription_prefs_owner_select" ON public.subscription_preferences
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "subscription_prefs_owner_upsert" ON public.subscription_preferences;
CREATE POLICY "subscription_prefs_owner_upsert" ON public.subscription_preferences
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "subscription_prefs_owner_update" ON public.subscription_preferences;
CREATE POLICY "subscription_prefs_owner_update" ON public.subscription_preferences
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- updated_at trigger for preferences
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_subscription_prefs_updated_at'
  ) THEN
    CREATE TRIGGER trg_subscription_prefs_updated_at
    BEFORE UPDATE ON public.subscription_preferences
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END$$;

-- 3) Update handle_new_user to also create default preferences (idempotent)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Create user profile if absent
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;

  -- Create default subscription record if absent
  INSERT INTO public.user_subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Create default usage record if absent
  INSERT INTO public.user_usage (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Create default subscription preferences if absent
  INSERT INTO public.subscription_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4) Upsert subscription expiry reminders based on preferences
CREATE OR REPLACE FUNCTION public.upsert_subscription_reminders()
RETURNS trigger AS $$
DECLARE
  v_plan TEXT;
  v_expires TIMESTAMPTZ;
  v_status TEXT;
  v_days_primary INTEGER := 7;
  v_days_secondary INTEGER := 1;
  v_channels JSONB := '["email","in_app"]'::jsonb;
  v_sched_primary TIMESTAMPTZ;
  v_sched_secondary TIMESTAMPTZ;
BEGIN
  -- Load active subscription
  SELECT plan, expires_at, status
    INTO v_plan, v_expires, v_status
FROM public.user_subscriptions
  WHERE user_id = NEW.user_id
  ORDER BY updated_at DESC
  LIMIT 1;

  -- Load preferences (if present)
  SELECT COALESCE(days_before_primary, 7), COALESCE(days_before_secondary, 1), COALESCE(channels, '["email","in_app"]'::jsonb)
    INTO v_days_primary, v_days_secondary, v_channels
FROM public.subscription_preferences
  WHERE user_id = NEW.user_id;

  -- Clean up any existing subscription reminder rules for this user
DELETE FROM public.reminder_rule
   WHERE user_id = NEW.user_id
     AND title IN ('Subscription renewal reminder (primary)', 'Subscription renewal reminder (secondary)')
     AND status IN ('active','paused');

  -- Only schedule for active subs with expiry
  IF v_status = 'active' AND v_expires IS NOT NULL THEN
    v_sched_primary := v_expires - make_interval(days => v_days_primary);
    v_sched_secondary := v_expires - make_interval(days => v_days_secondary);

    -- Insert primary reminder
    INSERT INTO public.reminder_rule (
      user_id, title, description, scheduled_at, recurrence_rule, channels, priority, status, next_execution_at, execution_count
    ) VALUES (
      NEW.user_id,
      'Subscription renewal reminder (primary)',
      format('Your %s plan renews on %s. This is a reminder %s days before renewal.', COALESCE(v_plan,'free'), to_char(v_expires, 'YYYY-MM-DD'), v_days_primary::text),
      v_sched_primary,
      NULL,
      v_channels,
      'high',
      'active',
      v_sched_primary,
      0
    );

    -- Insert secondary reminder
    INSERT INTO public.reminder_rule (
      user_id, title, description, scheduled_at, recurrence_rule, channels, priority, status, next_execution_at, execution_count
    ) VALUES (
      NEW.user_id,
      'Subscription renewal reminder (secondary)',
      format('Your %s plan renews on %s. This is a reminder %s day(s) before renewal.', COALESCE(v_plan,'free'), to_char(v_expires, 'YYYY-MM-DD'), v_days_secondary::text),
      v_sched_secondary,
      NULL,
      v_channels,
      'urgent',
      'active',
      v_sched_secondary,
      0
    );
  END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on user_subscriptions to maintain reminders on create/update
DROP TRIGGER IF EXISTS trg_user_subscriptions_upsert_reminders ON public.user_subscriptions;
CREATE TRIGGER trg_user_subscriptions_upsert_reminders
  AFTER INSERT OR UPDATE OF expires_at, status, plan ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.upsert_subscription_reminders();

-- Trigger on subscription_preferences to reschedule reminders when preferences change
DROP TRIGGER IF EXISTS trg_subscription_prefs_upsert_reminders ON public.subscription_preferences;
CREATE TRIGGER trg_subscription_prefs_upsert_reminders
  AFTER INSERT OR UPDATE OF days_before_primary, days_before_secondary, channels ON public.subscription_preferences
  FOR EACH ROW EXECUTE FUNCTION public.upsert_subscription_reminders();
