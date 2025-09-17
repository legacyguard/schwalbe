
import { beforeEach, describe, expect, it } from 'vitest';
/**
 * A/B Testing System Tests
 * Validates core functionality of the A/B testing framework
 */

import { abTestingSystem } from '../ab-testing-system';

describe('ABTestingSystem', () => {
  beforeEach(() => {
    // Reset the system for each test
    (abTestingSystem as any).assignments.clear();
    (abTestingSystem as any).metrics = [];
  });

  describe('Variant Assignment', () => {
    it('should assign consistent variants for the same user', () => {
      const userId = 'test-user-123';
      const testName = 'onboarding_flow_v1';

      const variant1 = abTestingSystem.getVariant(userId, testName);
      const variant2 = abTestingSystem.getVariant(userId, testName);

      expect(variant1).toBe(variant2);
    });

    it('should assign valid variants from configured tests', () => {
      const userId = 'test-user-456';
      const testName = 'trust_score_display_v1';

      const variant = abTestingSystem.getVariant(userId, testName);
      const validVariants = ['control', 'variant_a', 'variant_b'];

      expect(validVariants).toContain(variant);
    });

    it('should return control for inactive tests', () => {
      const userId = 'test-user-789';
      const testName = 'nonexistent_test';

      const variant = abTestingSystem.getVariant(userId, testName);

      expect(variant).toBe('control');
    });
  });

  describe('Conversion Tracking', () => {
    it('should track conversions with correct metadata', () => {
      const userId = 'test-user-conversion';
      const testName = 'professional_review_cta_v1';
      const metric = 'button_clicked';
      const value = 1;
      const metadata = { trustScore: 75 };

      abTestingSystem.trackConversion(
        userId,
        testName,
        metric,
        value,
        metadata
      );

      const metrics = abTestingSystem.getTestMetrics(testName);
      expect(metrics).toHaveLength(1);
      expect(metrics[0].userId).toBe(userId);
      expect(metrics[0].metric).toBe(metric);
      expect(metrics[0].value).toBe(value);
      expect(metrics[0].metadata).toEqual(metadata);
    });

    it('should track multiple conversions for different users', () => {
      const testName = 'onboarding_flow_v1';

      abTestingSystem.trackConversion('user1', testName, 'started', 1);
      abTestingSystem.trackConversion('user2', testName, 'completed', 1);
      abTestingSystem.trackConversion('user1', testName, 'completed', 1);

      const metrics = abTestingSystem.getTestMetrics(testName);
      expect(metrics).toHaveLength(3);

      const user1Metrics = metrics.filter(m => m.userId === 'user1');
      const user2Metrics = metrics.filter(m => m.userId === 'user2');

      expect(user1Metrics).toHaveLength(2);
      expect(user2Metrics).toHaveLength(1);
    });
  });

  describe('Conversion Rate Calculation', () => {
    it('should calculate conversion rates correctly', () => {
      const testName = 'test_conversion_rates';

      // Mock some test metrics
      (abTestingSystem as any).metrics = [
        {
          userId: 'user1',
          testName,
          variant: 'control',
          metric: 'started',
          value: 1,
          timestamp: new Date().toISOString(),
        },
        {
          userId: 'user1',
          testName,
          variant: 'control',
          metric: 'completed',
          value: 1,
          timestamp: new Date().toISOString(),
        },
        {
          userId: 'user2',
          testName,
          variant: 'control',
          metric: 'started',
          value: 1,
          timestamp: new Date().toISOString(),
        },
        {
          userId: 'user3',
          testName,
          variant: 'variant_a',
          metric: 'started',
          value: 1,
          timestamp: new Date().toISOString(),
        },
        {
          userId: 'user3',
          testName,
          variant: 'variant_a',
          metric: 'completed',
          value: 1,
          timestamp: new Date().toISOString(),
        },
      ];

      const rates = abTestingSystem.getConversionRates(testName);

      expect(rates.control).toBeDefined();
      expect(rates.variant_a).toBeDefined();
      expect(rates.control.users).toBe(2);
      expect(rates.variant_a.users).toBe(1);
      expect(rates.control.conversions).toBe(1);
      expect(rates.variant_a.conversions).toBe(1);
    });
  });

  describe('Test Configuration', () => {
    it('should return valid test configuration', () => {
      const config = abTestingSystem.getTestConfig('onboarding_flow_v1');

      expect(config).toBeDefined();
      expect(config?.testName).toBe('onboarding_flow_v1');
      expect(config?.isActive).toBe(true);
      expect(config?.variants).toBeDefined();
      expect(Object.keys(config?.variants || {})).toContain('control');
    });

    it('should return undefined for invalid test', () => {
      const config = abTestingSystem.getTestConfig('invalid_test');

      expect(config).toBeUndefined();
    });
  });

  describe('Onboarding Tracking', () => {
    it('should track onboarding metrics correctly', () => {
      const userId = 'onboarding-test-user';

      abTestingSystem.trackOnboardingMetric(userId, 'start', 'started');
      abTestingSystem.trackOnboardingMetric(
        userId,
        'personal_info',
        'completed',
        5000
      );
      abTestingSystem.trackOnboardingMetric(
        userId,
        'family_info',
        'completed',
        3000
      );
      abTestingSystem.trackOnboardingMetric(
        userId,
        'complete',
        'completed',
        15000
      );

      const metrics = abTestingSystem.getTestMetrics('onboarding_flow_v1');
      const userMetrics = metrics.filter(m => m.userId === userId);

      expect(userMetrics).toHaveLength(4);
      expect(
        userMetrics.find(m => m.metric === 'onboarding_complete_completed')
      ).toBeDefined();
    });
  });
});
