-- Webhook metrics and increment RPC
-- Date: 2025-09-16T19:25:50Z

CREATE TABLE IF NOT EXISTS public.webhook_metrics (
  date DATE NOT NULL,
  event_type TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (date, event_type)
);

ALTER TABLE public.webhook_metrics ENABLE ROW LEVEL SECURITY;

-- Allow public read (optional), service role manage
CREATE POLICY "Anyone can view webhook metrics" ON public.webhook_metrics
  FOR SELECT USING (TRUE);

CREATE POLICY "Service role can manage webhook metrics" ON public.webhook_metrics
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE INDEX IF NOT EXISTS idx_webhook_metrics_date ON public.webhook_metrics(date);
CREATE INDEX IF NOT EXISTS idx_webhook_metrics_event_type ON public.webhook_metrics(event_type);

-- Optional convenience function to increment metric
CREATE OR REPLACE FUNCTION public.increment_webhook_metric(p_event_type TEXT)
RETURNS void AS $$
DECLARE
  v_date DATE := CURRENT_DATE;
BEGIN
  INSERT INTO public.webhook_metrics(date, event_type, count)
  VALUES (v_date, p_event_type, 1)
  ON CONFLICT (date, event_type) DO UPDATE SET
    count = public.webhook_metrics.count + 1,
    created_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
