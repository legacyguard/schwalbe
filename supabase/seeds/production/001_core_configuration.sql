-- Production seed data for LegaczGuard
-- Safely populate configuration tables with baseline values. Guarded to avoid errors if optional tables are missing.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'app_settings'
  ) THEN
    INSERT INTO app_settings (key, value)
    VALUES
      ('onboarding.next_version', 'v2'),
      ('monitoring.sampling_rate', '0.1'),
      ('billing.default_plan', 'legacy_guard_core')
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'professional_categories'
  ) THEN
    INSERT INTO professional_categories (slug, name)
    VALUES
      ('lawyer', 'Estate Lawyer'),
      ('notary', 'Notary Public'),
      ('financial_advisor', 'Financial Advisor'),
      ('estate_planner', 'Legacy Estate Planner')
    ON CONFLICT (slug) DO NOTHING;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'reminder_templates'
  ) THEN
    INSERT INTO reminder_templates (slug, title, description, cadence_days)
    VALUES
      ('annual-will-review', 'Yearly will review', 'Remind the family to review their will once per year.', 365),
      ('guardian-check-in', 'Guardian check-in', 'Quarterly check-in with assigned guardians.', 90)
    ON CONFLICT (slug) DO NOTHING;
  END IF;
END $$;
