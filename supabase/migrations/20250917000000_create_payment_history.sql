-- Create payment_history table for tracking Stripe payments
CREATE TABLE IF NOT EXISTS public.payment_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_invoice_id TEXT UNIQUE NOT NULL,
  stripe_subscription_id TEXT NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('succeeded', 'failed', 'pending')),
  paid_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  attempt_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payment_history_subscription ON public.payment_history(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_customer ON public.payment_history(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON public.payment_history(status);
CREATE INDEX IF NOT EXISTS idx_payment_history_created ON public.payment_history(created_at DESC);

-- Enable RLS
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- Only service role can access payment history
CREATE POLICY "Service role full access" ON public.payment_history
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add missing columns to user_profiles if they don't exist
DO $$
BEGIN
  -- Add payment failure tracking columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'user_profiles' 
                 AND column_name = 'payment_failed') THEN
    ALTER TABLE public.user_profiles ADD COLUMN payment_failed BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'user_profiles' 
                 AND column_name = 'payment_failed_at') THEN
    ALTER TABLE public.user_profiles ADD COLUMN payment_failed_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'user_profiles' 
                 AND column_name = 'payment_retry_count') THEN
    ALTER TABLE public.user_profiles ADD COLUMN payment_retry_count INTEGER DEFAULT 0;
  END IF;

  -- Add Stripe email tracking
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'user_profiles' 
                 AND column_name = 'stripe_customer_email') THEN
    ALTER TABLE public.user_profiles ADD COLUMN stripe_customer_email TEXT;
  END IF;

  -- Add subscription period tracking
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'user_profiles' 
                 AND column_name = 'subscription_current_period_end') THEN
    ALTER TABLE public.user_profiles ADD COLUMN subscription_current_period_end TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'user_profiles' 
                 AND column_name = 'subscription_cancel_at_period_end') THEN
    ALTER TABLE public.user_profiles ADD COLUMN subscription_cancel_at_period_end BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'user_profiles' 
                 AND column_name = 'subscription_updated_at') THEN
    ALTER TABLE public.user_profiles ADD COLUMN subscription_updated_at TIMESTAMPTZ;
  END IF;
END $$;

-- Comments
COMMENT ON TABLE public.payment_history IS 'Tracks all payment attempts from Stripe webhooks';
COMMENT ON COLUMN public.payment_history.amount IS 'Payment amount in smallest currency unit (cents for USD)';
COMMENT ON COLUMN public.payment_history.attempt_count IS 'Number of payment attempts for failed invoices';