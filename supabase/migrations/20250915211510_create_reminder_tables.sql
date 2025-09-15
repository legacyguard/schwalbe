-- Backup Reminders: core tables and RLS
-- Timestamp: 2025-09-15 21:15:10 UTC

-- Ensure pgcrypto for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Reminder rules table
CREATE TABLE IF NOT EXISTS public.reminder_rule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  recurrence_rule TEXT, -- RFC 5545 RRULE (subset supported)
  recurrence_end_at TIMESTAMPTZ,
  channels JSONB NOT NULL DEFAULT '["email"]', -- ["email","in_app"]
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active','paused','completed','cancelled')),
  next_execution_at TIMESTAMPTZ,
  last_executed_at TIMESTAMPTZ,
  execution_count INTEGER DEFAULT 0,
  max_executions INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reminder_rule_user_id ON public.reminder_rule(user_id);
CREATE INDEX IF NOT EXISTS idx_reminder_rule_scheduled_at ON public.reminder_rule(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_reminder_rule_next_execution ON public.reminder_rule(next_execution_at);
CREATE INDEX IF NOT EXISTS idx_reminder_rule_status ON public.reminder_rule(status);

-- Updated_at trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_reminder_rule_updated_at'
  ) THEN
    CREATE TRIGGER trg_reminder_rule_updated_at
    BEFORE UPDATE ON public.reminder_rule
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END$$;

-- Notification log table (delivery + history)
CREATE TABLE IF NOT EXISTS public.notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_rule_id UUID REFERENCES public.reminder_rule(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('email','in_app','sms','push')),
  recipient TEXT NOT NULL, -- user id or email depending on channel
  status TEXT NOT NULL CHECK (status IN ('sent','delivered','failed','bounced')),
  provider_response JSONB,
  sent_at TIMESTAMPTZ DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notification_log_reminder_id ON public.notification_log(reminder_rule_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_status ON public.notification_log(status);
CREATE INDEX IF NOT EXISTS idx_notification_log_sent_at ON public.notification_log(sent_at DESC);

-- RLS
ALTER TABLE public.reminder_rule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;

-- Owner policies for reminder_rule
DROP POLICY IF EXISTS "reminder_owner_all" ON public.reminder_rule;
CREATE POLICY "reminder_owner_all" ON public.reminder_rule
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Owner select on notification_log (via owned rule)
DROP POLICY IF EXISTS "notif_owner_select" ON public.notification_log;
CREATE POLICY "notif_owner_select" ON public.notification_log
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.reminder_rule rr
      WHERE rr.id = notification_log.reminder_rule_id
        AND rr.user_id = auth.uid()
    )
  );

-- Owner update on notification_log (allow marking delivered for in-app)
DROP POLICY IF EXISTS "notif_owner_update" ON public.notification_log;
CREATE POLICY "notif_owner_update" ON public.notification_log
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.reminder_rule rr
      WHERE rr.id = notification_log.reminder_rule_id
        AND rr.user_id = auth.uid()
    )
  );

-- Service role full access for notification_log
DROP POLICY IF EXISTS "notif_service_all" ON public.notification_log;
CREATE POLICY "notif_service_all" ON public.notification_log
  FOR ALL TO authenticated
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');
