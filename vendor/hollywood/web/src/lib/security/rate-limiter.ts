
/**
 * Advanced Rate Limiting System
 * Protects against DDoS, brute force, and API abuse
 */

import { envConfig } from './env-config';

interface RateLimitConfig {
  handler?: (context: unknown) => void; // Custom handler when limit exceeded
  keyGenerator?: (context: unknown) => string; // Custom key generator
  maxRequests: number; // Maximum requests per window
  skipFailedRequests?: boolean; // Skip counting failed requests
  skipSuccessfulRequests?: boolean; // Skip counting successful requests
  windowMs: number; // Time window in milliseconds
}

interface RateLimitStore {
  requests: number;
  resetTime: number;
}

// Default rate limit configurations for different endpoints
export const RATE_LIMIT_PRESETS = {
  // Authentication endpoints - very strict
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    skipSuccessfulRequests: true,
  },

  // API endpoints - moderate
  api: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
  },

  // Document upload - strict
  upload: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 10, // 10 uploads per 5 minutes
  },

  // AI/LLM endpoints - expensive operations
  ai: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 10, // 10 AI requests per minute
  },

  // Public endpoints - lenient
  public: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
  },

  // Critical operations (will generation, etc.)
  critical: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5, // 5 operations per hour
  },
} as const;

class RateLimiter {
  private static instance: RateLimiter;
  private store: Map<string, RateLimitStore> = new Map();
  private cleanupInterval: null | number = null;
  private enabled: boolean;

  private constructor() {
    this.enabled = envConfig.getSecurityFeatures().enableRateLimiting;

    if (this.enabled) {
      this.startCleanup();
    }
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  /**
   * Start periodic cleanup of expired entries
   */
  private startCleanup(): void {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.store.entries()) {
        if (value.resetTime < now) {
          this.store.delete(key);
        }
      }
    }, 60000); // 1 minute
  }

  /**
   * Stop cleanup interval
   */
  public stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Generate a unique key for rate limiting
   */
  private generateKey(
    identifier: string,
    endpoint: string,
    customKeyGenerator?: (context: unknown) => string,
    context?: unknown
  ): string {
    if (customKeyGenerator && context) {
      return customKeyGenerator(context);
    }

    // Default key: identifier + endpoint
    return `${identifier}:${endpoint}`;
  }

  /**
   * Check if request should be rate limited
   */
  public async checkLimit(
    identifier: string, // User ID, IP address, etc.
    endpoint: string,
    config: RateLimitConfig
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    // Skip if rate limiting is disabled
    if (!this.enabled) {
      return { allowed: true, remaining: config.maxRequests, resetTime: 0 };
    }

    const key = this.generateKey(identifier, endpoint, config.keyGenerator);
    const now = Date.now();

    // Get or create store entry
    let entry = this.store.get(key);

    if (!entry || entry.resetTime < now) {
      // Create new entry or reset expired one
      entry = {
        requests: 0,
        resetTime: now + config.windowMs,
      };
      this.store.set(key, entry);
    }

    // Check if limit exceeded
    if (entry.requests >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    // Increment request count
    entry.requests++;

    return {
      allowed: true,
      remaining: config.maxRequests - entry.requests,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Reset rate limit for specific key
   */
  public reset(identifier: string, endpoint: string): void {
    const key = `${identifier}:${endpoint}`;
    this.store.delete(key);
  }

  /**
   * Get current stats for monitoring
   */
  public getStats(): {
    memoryUsage: number;
    topOffenders: Array<{ key: string; requests: number }>;
    totalKeys: number;
  } {
    const topOffenders = Array.from(this.store.entries())
      .map(([key, value]) => ({ key, requests: value.requests }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 10);

    return {
      totalKeys: this.store.size,
      memoryUsage: this.store.size * 100, // Rough estimate in bytes
      topOffenders,
    };
  }

  /**
   * Clear all rate limit data (use with caution)
   */
  public clearAll(): void {
    this.store.clear();
  }
}

// Export singleton instance
export const rateLimiter = RateLimiter.getInstance();

/**
 * Express/API middleware for rate limiting
 */
export function createRateLimitMiddleware(
  presetOrConfig: keyof typeof RATE_LIMIT_PRESETS | RateLimitConfig
) {
  const config =
    typeof presetOrConfig === 'string'
      ? RATE_LIMIT_PRESETS[presetOrConfig]
      : presetOrConfig;

  return async (req: any, res: any, next: any) => {
    // Get identifier (user ID or IP address)
    const identifier = req.user?.id || req.ip || 'anonymous';
    const endpoint = req.path;

    const result = await rateLimiter.checkLimit(identifier, endpoint, config);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', config.maxRequests);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader(
      'X-RateLimit-Reset',
      new Date(result.resetTime).toISOString()
    );

    if (!result.allowed) {
      // Rate limit exceeded
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
      });

      // Log the incident
      console.warn(`Rate limit exceeded for ${identifier} on ${endpoint}`);

      // Custom handler if provided
      if ((config as any).handler) {
        (config as any).handler({ req, res, identifier, endpoint });
      }

      return;
    }

    next();
  };
}

/**
 * React hook for client-side rate limiting
 */
export function useRateLimit(
  endpoint: string,
  config: RateLimitConfig = RATE_LIMIT_PRESETS.api
): {
  checkLimit: () => Promise<boolean>;
  remaining: number;
  resetTime: number;
} {
  const [remaining, setRemaining] = React.useState(config.maxRequests);
  const [resetTime, setResetTime] = React.useState(0);

  const checkLimit = React.useCallback(async () => {
    // Use session ID or generate a unique client ID
    const identifier =
      sessionStorage.getItem('clientId') ||
      (() => {
        const id = crypto.randomUUID();
        sessionStorage.setItem('clientId', id);
        return id;
      })();

    const result = await rateLimiter.checkLimit(identifier, endpoint, config);

    setRemaining(result.remaining);
    setResetTime(result.resetTime);

    return result.allowed;
  }, [endpoint, config]);

  return { checkLimit, remaining, resetTime };
}

/**
 * Decorator for rate limiting class methods
 */
export function RateLimit(
  presetOrConfig: keyof typeof RATE_LIMIT_PRESETS | RateLimitConfig
) {
  const config =
    typeof presetOrConfig === 'string'
      ? RATE_LIMIT_PRESETS[presetOrConfig]
      : presetOrConfig;

  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const identifier =
        (this as any).userId || (this as any).sessionId || 'system';
      const endpoint = `${(target as any).constructor.name}.${propertyKey}`;

      const result = await rateLimiter.checkLimit(identifier, endpoint, config);

      if (!result.allowed) {
        throw new Error(
          `Rate limit exceeded. Try again in ${Math.ceil((result.resetTime - Date.now()) / 1000)} seconds.`
        );
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Advanced DDoS protection with adaptive rate limiting
 */
export class DDoSProtection {
  private static instance: DDoSProtection;
  private suspiciousIPs: Map<string, number> = new Map();
  private blockedIPs: Set<string> = new Set();

  private constructor() {
    // Start monitoring
    this.startMonitoring();
  }

  public static getInstance(): DDoSProtection {
    if (!DDoSProtection.instance) {
      DDoSProtection.instance = new DDoSProtection();
    }
    return DDoSProtection.instance;
  }

  private startMonitoring(): void {
    // Reset suspicious IPs every hour
    setInterval(
      () => {
        this.suspiciousIPs.clear();
      },
      60 * 60 * 1000
    );
  }

  public checkRequest(ip: string, userAgent: string): boolean {
    // Check if IP is blocked
    if (this.blockedIPs.has(ip)) {
      return false;
    }

    // Check for suspicious patterns
    if (this.isSuspicious(ip, userAgent)) {
      const count = (this.suspiciousIPs.get(ip) || 0) + 1;
      this.suspiciousIPs.set(ip, count);

      // Block after 10 suspicious requests
      if (count > 10) {
        this.blockedIPs.add(ip);
        console.error(`Blocked IP ${ip} for suspicious activity`);
        return false;
      }
    }

    return true;
  }

  private isSuspicious(_ip: string, userAgent: string): boolean {
    // Check for common bot patterns
    const botPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
    ];

    return botPatterns.some(pattern => pattern.test(userAgent));
  }

  public unblockIP(ip: string): void {
    this.blockedIPs.delete(ip);
    this.suspiciousIPs.delete(ip);
  }

  public getBlockedIPs(): string[] {
    return Array.from(this.blockedIPs);
  }
}

// Export DDoS protection instance
export const ddosProtection = DDoSProtection.getInstance();

// Import React for the hook
import React from 'react';
