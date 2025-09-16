-- Augment export_requests for richer auditing and email delivery tracking

DO $mig$
DECLARE
  existing_def text;
  named_cons text := 'export_requests_status_check';
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

  -- Handle status check constraint idempotently
  SELECT pg_get_constraintdef(oid) INTO existing_def
  FROM pg_constraint
  WHERE conrelid = 'public.export_requests'::regclass
    AND contype = 'c'
    AND conname = named_cons;

  IF existing_def IS NULL THEN
    -- If no named constraint exists, create one that includes ''emailed''
    EXECUTE 'ALTER TABLE public.export_requests
      ADD CONSTRAINT export_requests_status_check
      CHECK (status IN (''started'',''completed'',''failed'',''emailed''))';
  ELSE
    -- If constraint exists but does not include ''emailed'', replace it
    IF position('emailed' in existing_def) = 0 THEN
      EXECUTE format('ALTER TABLE public.export_requests DROP CONSTRAINT %I', named_cons);
      EXECUTE 'ALTER TABLE public.export_requests
        ADD CONSTRAINT export_requests_status_check
        CHECK (status IN (''started'',''completed'',''failed'',''emailed''))';
    END IF;
  END IF;
END
$mig$;
