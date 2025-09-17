/**
 * Tests for Rate Limiter
 */

import { RateLimiter } from '@/lib/security/rate-limiter';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter();
    rateLimiter.reset(); // Clear all limits
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Basic Rate Limiting', () => {
    test('should allow requests within limit', async () => {
      const identifier = 'user123';
      const endpoint = '/api/test';
      const config = { windowMs: 60000, maxRequests: 5 };

      for (let i = 0; i < 5; i++) {
        const result = await rateLimiter.checkLimit(
          identifier,
          endpoint,
          config
        );
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(4 - i);
      }
    });

    test('should block requests exceeding limit', async () => {
      const identifier = 'user123';
      const endpoint = '/api/test';
      const config = { windowMs: 60000, maxRequests: 3 };

      // First 3 requests should pass
      for (let i = 0; i < 3; i++) {
        const result = await rateLimiter.checkLimit(
          identifier,
          endpoint,
          config
        );
        expect(result.allowed).toBe(true);
      }

      // 4th request should be blocked
      const result = await rateLimiter.checkLimit(identifier, endpoint, config);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    test('should reset after window expires', async () => {
      jest.useFakeTimers();

      const identifier = 'user123';
      const endpoint = '/api/test';
      const config = { windowMs: 1000, maxRequests: 1 };

      // First request should pass
      let result = await rateLimiter.checkLimit(identifier, endpoint, config);
      expect(result.allowed).toBe(true);

      // Second immediate request should fail
      result = await rateLimiter.checkLimit(identifier, endpoint, config);
      expect(result.allowed).toBe(false);

      // Advance time past the window
      jest.advanceTimersByTime(1100);

      // Request should now pass again
      result = await rateLimiter.checkLimit(identifier, endpoint, config);
      expect(result.allowed).toBe(true);

      jest.useRealTimers();
    });

    test('should track different identifiers separately', async () => {
      const endpoint = '/api/test';
      const config = { windowMs: 60000, maxRequests: 1 };

      // First user's request
      let result = await rateLimiter.checkLimit('user1', endpoint, config);
      expect(result.allowed).toBe(true);

      // First user's second request should fail
      result = await rateLimiter.checkLimit('user1', endpoint, config);
      expect(result.allowed).toBe(false);

      // Second user's request should still pass
      result = await rateLimiter.checkLimit('user2', endpoint, config);
      expect(result.allowed).toBe(true);
    });

    test('should track different endpoints separately', async () => {
      const identifier = 'user123';
      const config = { windowMs: 60000, maxRequests: 1 };

      // Request to first endpoint
      let result = await rateLimiter.checkLimit(
        identifier,
        '/api/endpoint1',
        config
      );
      expect(result.allowed).toBe(true);

      // Second request to first endpoint should fail
      result = await rateLimiter.checkLimit(
        identifier,
        '/api/endpoint1',
        config
      );
      expect(result.allowed).toBe(false);

      // Request to second endpoint should still pass
      result = await rateLimiter.checkLimit(
        identifier,
        '/api/endpoint2',
        config
      );
      expect(result.allowed).toBe(true);
    });
  });

  describe('Preset Configurations', () => {
    test('should use auth preset correctly', async () => {
      const preset = rateLimiter.RATE_LIMIT_PRESETS.auth;
      const identifier = 'user123';
      const endpoint = '/auth/login';

      // Should allow up to maxRequests
      for (let i = 0; i < preset.maxRequests; i++) {
        const result = await rateLimiter.checkLimit(
          identifier,
          endpoint,
          preset
        );
        expect(result.allowed).toBe(true);
      }

      // Next request should be blocked
      const result = await rateLimiter.checkLimit(identifier, endpoint, preset);
      expect(result.allowed).toBe(false);
    });

    test('should use API preset correctly', async () => {
      const preset = rateLimiter.RATE_LIMIT_PRESETS.api;
      const identifier = 'user123';
      const endpoint = '/api/data';

      // API preset should have higher limit than auth
      expect(preset.maxRequests).toBeGreaterThan(
        rateLimiter.RATE_LIMIT_PRESETS.auth.maxRequests
      );

      // Test limit
      for (let i = 0; i < preset.maxRequests; i++) {
        const result = await rateLimiter.checkLimit(
          identifier,
          endpoint,
          preset
        );
        expect(result.allowed).toBe(true);
      }

      const result = await rateLimiter.checkLimit(identifier, endpoint, preset);
      expect(result.allowed).toBe(false);
    });

    test('should use critical preset with strictest limits', async () => {
      const preset = rateLimiter.RATE_LIMIT_PRESETS.critical;
      const identifier = 'user123';
      const endpoint = '/api/delete-account';

      // Critical should have the lowest limit
      expect(preset.maxRequests).toBeLessThanOrEqual(
        rateLimiter.RATE_LIMIT_PRESETS.auth.maxRequests
      );

      // Test very strict limit
      for (let i = 0; i < preset.maxRequests; i++) {
        const result = await rateLimiter.checkLimit(
          identifier,
          endpoint,
          preset
        );
        expect(result.allowed).toBe(true);
      }

      const result = await rateLimiter.checkLimit(identifier, endpoint, preset);
      expect(result.allowed).toBe(false);
    });
  });

  describe('IP-based Rate Limiting', () => {
    test('should apply global IP limit', async () => {
      const ip = '192.168.1.1';
      const config = { windowMs: 60000, maxRequests: 10 };

      // Test across different endpoints
      for (let i = 0; i < 10; i++) {
        const result = await rateLimiter.checkIpLimit(ip, config);
        expect(result.allowed).toBe(true);
      }

      // Should block after limit
      const result = await rateLimiter.checkIpLimit(ip, config);
      expect(result.allowed).toBe(false);
    });

    test('should track burst activity', async () => {
      const identifier = 'user123';
      const endpoint = '/api/test';
      const config = {
        windowMs: 1000,
        maxRequests: 100,
        burstLimit: 10,
        burstWindowMs: 100,
      };

      // Rapid burst should be detected
      const promises = [];
      for (let i = 0; i < 15; i++) {
        promises.push(rateLimiter.checkLimit(identifier, endpoint, config));
      }

      const results = await Promise.all(promises);
      const blocked = results.filter(r => !r.allowed).length;

      // Some requests should be blocked due to burst limit
      expect(blocked).toBeGreaterThan(0);
    });
  });

  describe('Cleanup and Management', () => {
    test('should clean up expired entries', async () => {
      jest.useFakeTimers();

      const identifier = 'user123';
      const endpoint = '/api/test';
      const config = { windowMs: 1000, maxRequests: 1 };

      // Make a request
      await rateLimiter.checkLimit(identifier, endpoint, config);

      // Advance time past cleanup interval
      jest.advanceTimersByTime(61000); // Past 1 minute cleanup interval

      // Trigger cleanup
      rateLimiter.cleanup();

      // New request should pass (old entry cleaned up)
      const result = await rateLimiter.checkLimit(identifier, endpoint, config);
      expect(result.allowed).toBe(true);

      jest.useRealTimers();
    });

    test('should reset specific identifier', async () => {
      const identifier = 'user123';
      const endpoint = '/api/test';
      const config = { windowMs: 60000, maxRequests: 1 };

      // Use up the limit
      await rateLimiter.checkLimit(identifier, endpoint, config);
      let result = await rateLimiter.checkLimit(identifier, endpoint, config);
      expect(result.allowed).toBe(false);

      // Reset this specific identifier
      rateLimiter.resetIdentifier(identifier);

      // Should now allow request
      result = await rateLimiter.checkLimit(identifier, endpoint, config);
      expect(result.allowed).toBe(true);
    });

    test('should reset all limits', async () => {
      const config = { windowMs: 60000, maxRequests: 1 };

      // Use up limits for multiple identifiers
      await rateLimiter.checkLimit('user1', '/api/test', config);
      await rateLimiter.checkLimit('user2', '/api/test', config);

      // Both should be blocked on second request
      let result1 = await rateLimiter.checkLimit('user1', '/api/test', config);
      let result2 = await rateLimiter.checkLimit('user2', '/api/test', config);
      expect(result1.allowed).toBe(false);
      expect(result2.allowed).toBe(false);

      // Reset all
      rateLimiter.reset();

      // Both should now allow requests
      result1 = await rateLimiter.checkLimit('user1', '/api/test', config);
      result2 = await rateLimiter.checkLimit('user2', '/api/test', config);
      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(true);
    });
  });

  describe('Advanced Features', () => {
    test('should provide accurate reset time', async () => {
      const identifier = 'user123';
      const endpoint = '/api/test';
      const windowMs = 60000;
      const config = { windowMs, maxRequests: 1 };

      const startTime = Date.now();
      await rateLimiter.checkLimit(identifier, endpoint, config);

      const result = await rateLimiter.checkLimit(identifier, endpoint, config);
      expect(result.allowed).toBe(false);
      expect(result.resetTime).toBeGreaterThan(startTime);
      expect(result.resetTime).toBeLessThanOrEqual(startTime + windowMs);
    });

    test('should handle concurrent requests correctly', async () => {
      const identifier = 'user123';
      const endpoint = '/api/test';
      const config = { windowMs: 60000, maxRequests: 5 };

      // Make 10 concurrent requests
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(rateLimiter.checkLimit(identifier, endpoint, config));
      }

      const results = await Promise.all(promises);
      const allowed = results.filter(r => r.allowed).length;
      const blocked = results.filter(r => !r.allowed).length;

      // Exactly 5 should be allowed
      expect(allowed).toBe(5);
      expect(blocked).toBe(5);
    });

    test('should handle distributed rate limiting keys', async () => {
      const config = { windowMs: 60000, maxRequests: 2 };

      // Simulate distributed system with composite keys
      const key1 = 'server1:user123:/api/test';
      const key2 = 'server2:user123:/api/test';

      // Each key should have independent limit
      const result1 = await rateLimiter.checkLimit(key1, '', config);
      const result2 = await rateLimiter.checkLimit(key2, '', config);

      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(true);
    });
  });
});
