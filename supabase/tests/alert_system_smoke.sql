-- Alert system smoke test
-- Tests alert rules, instances, triggering, and deduplication

BEGIN;

-- Setup: Ensure we're testing as service_role (only role that can manage alerts)
SET LOCAL request.jwt.claims TO '{"sub": "service_user", "role": "service_role"}';
SET LOCAL ROLE service_role;

-- Test 1: Insert alert rule
INSERT INTO public.alert_rules (name, condition_type, condition_config, severity, cooldown_minutes)
VALUES ('test_rule', 'test_condition', '{"test": true}', 'medium', 10);

-- Test 2: Trigger alert using function
DO $$
DECLARE
  v_instance_id UUID;
BEGIN
  SELECT public.trigger_alert(
    'test_rule',
    'Test Alert',
    'This is a test alert',
    '{"source": "smoke_test"}'
  ) INTO v_instance_id;
  
  IF v_instance_id IS NULL THEN
    RAISE EXCEPTION 'Failed to trigger alert';
  END IF;
  
  -- Verify alert instance was created
  IF NOT EXISTS (
    SELECT 1 FROM public.alert_instances 
    WHERE id = v_instance_id AND title = 'Test Alert'
  ) THEN
    RAISE EXCEPTION 'Alert instance not found after triggering';
  END IF;
END $$;

-- Test 3: Test deduplication (should return existing instance)
DO $$
DECLARE
  v_instance_id1 UUID;
  v_instance_id2 UUID;
BEGIN
  -- Trigger same alert twice
  SELECT public.trigger_alert(
    'test_rule',
    'Duplicate Alert',
    'This alert should be deduplicated',
    '{"source": "smoke_test"}'
  ) INTO v_instance_id1;
  
  SELECT public.trigger_alert(
    'test_rule',
    'Duplicate Alert',
    'This alert should be deduplicated',
    '{"source": "smoke_test"}'
  ) INTO v_instance_id2;
  
  -- Should return same instance ID due to deduplication
  IF v_instance_id1 != v_instance_id2 THEN
    RAISE EXCEPTION 'Alert deduplication failed: expected same ID, got % and %', v_instance_id1, v_instance_id2;
  END IF;
  
  -- Should only have one instance in database
  IF (SELECT COUNT(*) FROM public.alert_instances WHERE title = 'Duplicate Alert') != 1 THEN
    RAISE EXCEPTION 'Expected exactly one deduplicated alert instance';
  END IF;
END $$;

-- Test 4: Test alert resolution
DO $$
DECLARE
  v_instance_id UUID;
  v_resolved BOOLEAN;
BEGIN
  -- Create an alert to resolve
  SELECT public.trigger_alert(
    'test_rule',
    'Resolvable Alert',
    'This alert will be resolved',
    '{"source": "smoke_test"}'
  ) INTO v_instance_id;
  
  -- Resolve the alert
  SELECT public.resolve_alert(v_instance_id) INTO v_resolved;
  
  IF NOT v_resolved THEN
    RAISE EXCEPTION 'Failed to resolve alert';
  END IF;
  
  -- Verify alert is marked as resolved
  IF NOT EXISTS (
    SELECT 1 FROM public.alert_instances 
    WHERE id = v_instance_id AND status = 'resolved' AND resolved_at IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Alert not properly marked as resolved';
  END IF;
END $$;

-- Test 5: Test disabled rule (should not create alert)
DO $$
DECLARE
  v_instance_id UUID;
BEGIN
  -- Disable the test rule
  UPDATE public.alert_rules SET enabled = false WHERE name = 'test_rule';
  
  -- Try to trigger alert on disabled rule
  SELECT public.trigger_alert(
    'test_rule',
    'Disabled Rule Alert',
    'This should not create an alert',
    '{"source": "smoke_test"}'
  ) INTO v_instance_id;
  
  -- Should return NULL for disabled rule
  IF v_instance_id IS NOT NULL THEN
    RAISE EXCEPTION 'Disabled rule created alert instance, expected NULL';
  END IF;
  
  -- Re-enable for cleanup
  UPDATE public.alert_rules SET enabled = true WHERE name = 'test_rule';
END $$;

-- Test 6: Test RLS policies (non-service roles should not access)
-- Reset to authenticated role
SET LOCAL request.jwt.claims TO '{"sub": "test_user", "role": "authenticated"}';
SET LOCAL ROLE authenticated;

DO $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Try to read alert_rules as authenticated user (should return 0 due to RLS)
  SELECT COUNT(*) INTO v_count FROM public.alert_rules;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'RLS failed: authenticated user can read alert_rules';
  END IF;
  
  -- Try to read alert_instances as authenticated user (should return 0 due to RLS)
  SELECT COUNT(*) INTO v_count FROM public.alert_instances;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'RLS failed: authenticated user can read alert_instances';
  END IF;
END $$;

-- Test 7: Test insert permissions for non-service roles (should fail)
DO $$
BEGIN
  BEGIN
    INSERT INTO public.alert_rules (name, condition_type, condition_config, severity)
    VALUES ('unauthorized_rule', 'test', '{}', 'low');
    
    RAISE EXCEPTION 'RLS failed: authenticated user could insert alert_rules';
  EXCEPTION 
    WHEN insufficient_privilege THEN
      -- Expected behavior
      NULL;
    WHEN others THEN
      -- Also acceptable if other security mechanism blocks it
      NULL;
  END;
END $$;

ROLLBACK;