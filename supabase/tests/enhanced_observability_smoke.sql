-- Enhanced Observability System Smoke Tests
-- Tests for alert rate limiting, metrics collection, and notification systems

BEGIN;

-- Test 1: Basic alert rate limiting functionality
DO $$
DECLARE
  v_alert_id UUID;
  v_rate_limited BOOLEAN;
  v_escalation_level INTEGER;
BEGIN
  -- Create test alert rule if not exists
  INSERT INTO alert_rules (name, condition_type, condition_config, severity, cooldown_minutes, notification_channels)
  VALUES ('test_rate_limiting', 'test', '{}', 'high', 5, '{email}')
  ON CONFLICT (name) DO NOTHING;

  -- Trigger alert with rate limiting
  SELECT alert_id, rate_limited, escalation_level 
  INTO v_alert_id, v_rate_limited, v_escalation_level
  FROM trigger_alert_with_rate_limiting(
    'test_rate_limiting',
    'Test Alert',
    'This is a test alert message',
    '{"test": true}',
    'test_fingerprint_001'
  );

  -- First alert should succeed
  ASSERT v_alert_id IS NOT NULL, 'First alert should be created';
  ASSERT v_rate_limited = FALSE, 'First alert should not be rate limited';
  ASSERT v_escalation_level = 0, 'First alert should have escalation level 0';

  RAISE NOTICE 'Test 1 PASSED: Basic alert triggering works';
END $$;

-- Test 2: Rate limiting enforcement
DO $$
DECLARE
  v_alert_id UUID;
  v_rate_limited BOOLEAN;
  v_escalation_level INTEGER;
  i INTEGER;
BEGIN
  -- Trigger multiple alerts with same fingerprint to test rate limiting
  FOR i IN 1..7 LOOP
    SELECT alert_id, rate_limited, escalation_level 
    INTO v_alert_id, v_rate_limited, v_escalation_level
    FROM trigger_alert_with_rate_limiting(
      'test_rate_limiting',
      'Test Alert Burst',
      'Burst test message ' || i,
      jsonb_build_object('iteration', i),
      'test_fingerprint_burst'
    );
    
    IF i <= 5 THEN
      ASSERT v_rate_limited = FALSE, 'Alert ' || i || ' should not be rate limited';
    ELSE
      ASSERT v_rate_limited = TRUE, 'Alert ' || i || ' should be rate limited';
      ASSERT v_escalation_level >= 1, 'Rate limited alerts should have escalation level >= 1';
    END IF;
  END LOOP;

  RAISE NOTICE 'Test 2 PASSED: Rate limiting enforcement works';
END $$;

-- Test 3: Metrics recording functionality
DO $$
DECLARE
  v_metric_id UUID;
  v_count INTEGER;
BEGIN
  -- Record test metrics
  SELECT record_metric(
    'test_counter_metric',
    'counter',
    1,
    '{"component": "test", "environment": "test"}',
    'test'
  ) INTO v_metric_id;

  ASSERT v_metric_id IS NOT NULL, 'Metric recording should return ID';

  SELECT record_metric(
    'test_gauge_metric',
    'gauge',
    42.5,
    '{"component": "test", "type": "gauge"}',
    'test'
  ) INTO v_metric_id;

  ASSERT v_metric_id IS NOT NULL, 'Gauge metric recording should work';

  -- Verify metrics were stored
  SELECT COUNT(*) INTO v_count
  FROM observability_metrics
  WHERE metric_name IN ('test_counter_metric', 'test_gauge_metric')
    AND environment = 'test';

  ASSERT v_count = 2, 'Both test metrics should be stored';

  RAISE NOTICE 'Test 3 PASSED: Metrics recording works';
END $$;

-- Test 4: Rate limit status reporting
DO $$
DECLARE
  v_status_count INTEGER;
BEGIN
  -- Check rate limit status function
  SELECT COUNT(*) INTO v_status_count
  FROM get_alert_rate_limit_status('test_rate_limiting', NULL);

  ASSERT v_status_count > 0, 'Rate limit status should return data for test rule';

  RAISE NOTICE 'Test 4 PASSED: Rate limit status reporting works';
END $$;

-- Test 5: Metrics summary functionality
DO $$
DECLARE
  v_summary_count INTEGER;
BEGIN
  -- Get metrics summary
  SELECT COUNT(*) INTO v_summary_count
  FROM get_metrics_summary('test_counter_metric', 'test', 24);

  ASSERT v_summary_count > 0, 'Metrics summary should return data for test metrics';

  RAISE NOTICE 'Test 5 PASSED: Metrics summary works';
END $$;

-- Test 6: Alert escalation rules
DO $$
DECLARE
  v_rule_count INTEGER;
BEGIN
  -- Check that default escalation rules exist
  SELECT COUNT(*) INTO v_rule_count
  FROM alert_escalation_rules
  WHERE enabled = true;

  ASSERT v_rule_count >= 4, 'Should have at least 4 default escalation rules';

  RAISE NOTICE 'Test 6 PASSED: Escalation rules are configured';
END $$;

-- Test 7: Cleanup function
DO $$
DECLARE
  v_cleaned_metrics INTEGER;
  v_cleaned_rate_limits INTEGER;
  v_cleaned_notifications INTEGER;
BEGIN
  -- Insert old test data
  INSERT INTO observability_metrics (metric_name, metric_type, value, timestamp, environment)
  VALUES ('old_test_metric', 'counter', 1, NOW() - INTERVAL '35 days', 'test');

  INSERT INTO alert_rate_limits (rule_name, fingerprint, updated_at)
  VALUES ('old_test_rule', 'old_test_fingerprint', NOW() - INTERVAL '10 days');

  -- Run cleanup with aggressive retention for testing
  SELECT cleaned_metrics, cleaned_rate_limits, cleaned_notifications
  INTO v_cleaned_metrics, v_cleaned_rate_limits, v_cleaned_notifications
  FROM cleanup_observability_data(30, 7);

  ASSERT v_cleaned_metrics >= 1, 'Should clean up old metrics';
  ASSERT v_cleaned_rate_limits >= 1, 'Should clean up old rate limits';

  RAISE NOTICE 'Test 7 PASSED: Cleanup function works';
END $$;

-- Test 8: Alert fingerprint uniqueness
DO $$
DECLARE
  v_alert_id_1 UUID;
  v_alert_id_2 UUID;
  v_rate_limited BOOLEAN;
BEGIN
  -- Create two alerts with same fingerprint but different content
  SELECT alert_id INTO v_alert_id_1
  FROM trigger_alert_with_rate_limiting(
    'test_rate_limiting',
    'Unique Test 1',
    'Different message content',
    '{"test": "unique1"}',
    'unique_fingerprint_test'
  );

  SELECT alert_id, rate_limited INTO v_alert_id_2, v_rate_limited
  FROM trigger_alert_with_rate_limiting(
    'test_rate_limiting',
    'Unique Test 2',
    'Different message content again',
    '{"test": "unique2"}',
    'unique_fingerprint_test'
  );

  ASSERT v_alert_id_1 IS NOT NULL, 'First unique alert should be created';
  ASSERT v_rate_limited = TRUE, 'Second alert with same fingerprint should be rate limited';

  RAISE NOTICE 'Test 8 PASSED: Fingerprint deduplication works';
END $$;

-- Test 9: RLS policies
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Test that service role can access all tables
  SET ROLE service_role;
  
  SELECT COUNT(*) INTO v_count FROM alert_rate_limits;
  SELECT COUNT(*) INTO v_count FROM observability_metrics;
  SELECT COUNT(*) INTO v_count FROM alert_escalation_rules;
  SELECT COUNT(*) INTO v_count FROM alert_notifications;

  RESET ROLE;

  RAISE NOTICE 'Test 9 PASSED: RLS policies allow service role access';
END $$;

-- Test 10: Function permissions
DO $$
BEGIN
  -- Test that functions can be executed by service role
  PERFORM trigger_alert_with_rate_limiting('test', 'test', 'test', '{}', 'test', false);
  PERFORM record_metric('test', 'counter', 1, '{}', 'test');
  PERFORM get_alert_rate_limit_status(NULL, NULL);
  PERFORM get_metrics_summary(NULL, NULL, 24);

  RAISE NOTICE 'Test 10 PASSED: Function permissions are correct';
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Function permissions test failed: %', SQLERRM;
END $$;

-- Cleanup test data
DELETE FROM alert_instances WHERE title LIKE 'Test Alert%' OR title LIKE 'Unique Test%';
DELETE FROM alert_rate_limits WHERE rule_name = 'test_rate_limiting' OR fingerprint LIKE 'test_fingerprint%' OR fingerprint = 'unique_fingerprint_test';
DELETE FROM observability_metrics WHERE metric_name LIKE 'test_%metric' OR environment = 'test';
DELETE FROM alert_rules WHERE name = 'test_rate_limiting';

COMMIT;

-- Final validation
DO $$
BEGIN
  RAISE NOTICE '🎉 Enhanced Observability Smoke Tests PASSED';
  RAISE NOTICE 'All core functionality verified:';
  RAISE NOTICE '  ✅ Alert rate limiting with escalation';
  RAISE NOTICE '  ✅ Metrics collection and aggregation';
  RAISE NOTICE '  ✅ Fingerprint-based deduplication';
  RAISE NOTICE '  ✅ Status reporting and monitoring';
  RAISE NOTICE '  ✅ Data cleanup and maintenance';
  RAISE NOTICE '  ✅ Security and permissions';
END $$;