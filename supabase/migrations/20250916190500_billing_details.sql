-- Billing Details for invoices (company, VAT, address)
-- Timestamp: 2025-09-16 19:05:00 UTC

-- Extend profiles with company_name, vat_id (EU VAT/DIČ), and billing_address JSONB
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS vat_id TEXT,
  ADD COLUMN IF NOT EXISTS billing_address JSONB;

-- Helpful GIN index for address lookups (optional)
CREATE INDEX IF NOT EXISTS idx_profiles_billing_address ON public.profiles USING GIN ((billing_address));