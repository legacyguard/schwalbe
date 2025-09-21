/**
 * @description Client-side API caching utilities with expiration and invalidation
 * Provides efficient caching for API responses with memory management
 */

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expires: number;
  key: string;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of cache entries
  keyPrefix?: string;
}

export class ApiCache {
  private cache = new Map<string, CacheEntry>();
  private options: Required<CacheOptions>;

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl ?? 5 * 60 * 1000, // 5 minutes default
      maxSize: options.maxSize ?? 100,
      keyPrefix: options.keyPrefix ?? 'api_cache',
    };
  }

  /**
   * @description Generate cache key from URL and parameters
   */
  private generateKey(url: string, params?: Record<string, any>): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${this.options.keyPrefix}:${url}:${paramString}`;
  }

  /**
   * @description Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() > entry.expires;
  }

  /**
   * @description Cleanup expired entries and enforce size limits
   */
  private cleanup(): void {
    // Remove expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
      }
    }

    // Enforce size limit by removing oldest entries
    if (this.cache.size > this.options.maxSize) {
      const entries = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);

      const toRemove = entries.slice(0, this.cache.size - this.options.maxSize);
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  /**
   * @description Store data in cache
   */
  set<T>(url: string, data: T, params?: Record<string, any>, customTtl?: number): void {
    const key = this.generateKey(url, params);
    const ttl = customTtl ?? this.options.ttl;

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expires: Date.now() + ttl,
      key,
    };

    this.cache.set(key, entry);
    this.cleanup();
  }

  /**
   * @description Retrieve data from cache
   */
  get<T>(url: string, params?: Record<string, any>): T | null {
    const key = this.generateKey(url, params);
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry || this.isExpired(entry)) {
      if (entry) {
        this.cache.delete(key);
      }
      return null;
    }

    return entry.data;
  }

  /**
   * @description Check if data exists in cache and is valid
   */
  has(url: string, params?: Record<string, any>): boolean {
    return this.get(url, params) !== null;
  }

  /**
   * @description Remove specific cache entry
   */
  delete(url: string, params?: Record<string, any>): boolean {
    const key = this.generateKey(url, params);
    return this.cache.delete(key);
  }

  /**
   * @description Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * @description Clear cache entries matching pattern
   */
  invalidatePattern(pattern: RegExp): void {
    for (const [key] of this.cache.entries()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * @description Get cache statistics
   */
  getStats(): { size: number; hitRate: number; memoryUsage: number } {
    return {
      size: this.cache.size,
      hitRate: 0, // Would need to track hits/misses
      memoryUsage: JSON.stringify(Array.from(this.cache.values())).length,
    };
  }
}

// Global cache instance
export const apiCache = new ApiCache();

// Decorator for automatic caching
export function cached(ttl?: number) {
  return function <T extends (...args: any[]) => Promise<any>>(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${target.constructor.name}.${propertyKey}`;
      const params = { args };

      // Try to get from cache first
      const cached = apiCache.get(cacheKey, params);
      if (cached !== null) {
        return cached;
      }

      // Execute original method and cache result
      const result = await originalMethod.apply(this, args);
      apiCache.set(cacheKey, result, params, ttl);

      return result;
    };

    return descriptor;
  };
}

// Rate limiting utility
export class RateLimiter {
  private requests = new Map<string, number[]>();

  constructor(
    private maxRequests: number = 10,
    private windowMs: number = 60 * 1000 // 1 minute
  ) {}

  /**
   * @description Check if request is allowed under rate limit
   */
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    const requests = this.requests.get(identifier) || [];
    const validRequests = requests.filter(time => time > windowStart);

    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(identifier, validRequests);

    return true;
  }

  /**
   * @description Get remaining requests for identifier
   */
  getRemaining(identifier: string): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const requests = this.requests.get(identifier) || [];
    const validRequests = requests.filter(time => time > windowStart);

    return Math.max(0, this.maxRequests - validRequests.length);
  }
}

export const rateLimiter = new RateLimiter();