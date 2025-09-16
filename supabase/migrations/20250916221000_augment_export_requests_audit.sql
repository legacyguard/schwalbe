-- Augment export_requests for richer auditing and email delivery tracking

DO $mig$
DECLARE
  cons_name text;
BEGIN
  -- Ensure table exists before altering (no-op if missing)
  IF to_regclass('public.export_requests') IS NULL THEN
    RAISE NOTICE 'Table public.export_requests does not exist; skipping alterations.';
    RETURN;
  END IF;

  -- Add delivery/object_path/error columns (idempotent)
  BEGIN
    EXECUTE 'ALTER TABLE public.export_requests
      ADD COLUMN IF NOT EXISTS delivery TEXT CHECK (delivery IN (''inline'',''email'')),
      ADD COLUMN IF NOT EXISTS object_path TEXT,
      ADD COLUMN IF NOT EXISTS error TEXT';
  EXCEPTION WHEN others THEN
    -- Log and continue; safe in most environments
    RAISE NOTICE 'Alter table add columns failed: %', SQLERRM;
  END;

  -- Replace existing status check constraint to include ''emailed''
  SELECT conname INTO cons_name
  FROM pg_constraint
  WHERE conrelid = 'public.export_requests'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) ILIKE '%status%check%';

  IF cons_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.export_requests DROP CONSTRAINT %I', cons_name);
  END IF;

  -- Create a consistent named constraint
  EXECUTE 'ALTER TABLE public.export_requests
    ADD CONSTRAINT export_requests_status_check
    CHECK (status IN (''started'',''completed'',''failed'',''emailed''))';
END
$mig$;
