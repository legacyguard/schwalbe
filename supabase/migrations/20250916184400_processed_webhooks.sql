-- Processed webhooks deduplication table
-- Date: 2025-09-16T18:44:00Z

CREATE TABLE IF NOT EXISTS public.processed_webhooks (
  event_id TEXT PRIMARY KEY,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Optional index for maintenance/retention queries
CREATE INDEX IF NOT EXISTS idx_processed_webhooks_received_at ON public.processed_webhooks(received_at);

-- Enable RLS to restrict non-service access (service role bypasses RLS)
ALTER TABLE public.processed_webhooks ENABLE ROW LEVEL SECURITY;
