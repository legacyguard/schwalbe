
/**
 * Caching Utilities for Performance Optimization
 * Implements in-memory caching, local storage caching, and cache invalidation
 */

import { useCallback, useEffect, useRef, useState } from 'react';

// Cache entry interface
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  timestamp: number;
}

// Cache configuration
interface CacheConfig {
  maxSize?: number; // Maximum number of entries
  persistent?: boolean; // Use localStorage for persistence
  ttl?: number; // Time to live in milliseconds
}

// Default cache configurations
const defaultCacheConfig: Required<CacheConfig> = {
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 100,
  persistent: false,
};

// In-memory cache implementation
class MemoryCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private config: Required<CacheConfig>;

  constructor(config: CacheConfig = {}) {
    this.config = { ...defaultCacheConfig, ...config };
  }

  set(key: string, data: T): void {
    // Remove expired entries and enforce size limit
    this.cleanup();

    if (this.cache.size >= this.config.maxSize) {
      // Remove oldest entry
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.config.ttl,
    };

    this.cache.set(key, entry);

    // Persist to localStorage if configured
    if (this.config.persistent) {
      try {
        localStorage.setItem(`cache_${key}`, JSON.stringify(entry));
      } catch (error) {
        console.warn('Failed to persist cache entry to localStorage:', error);
      }
    }
  }

  get(key: string): null | T {
    let entry = this.cache.get(key);

    // Try loading from localStorage if not in memory and persistence is enabled
    if (!entry && this.config.persistent) {
      try {
        const stored = localStorage.getItem(`cache_${key}`);
        if (stored) {
          entry = JSON.parse(stored);
          if (entry && entry.expiresAt > Date.now()) {
            this.cache.set(key, entry);
          } else {
            localStorage.removeItem(`cache_${key}`);
            entry = undefined;
          }
        }
      } catch (error) {
        console.warn('Failed to load cache entry from localStorage:', error);
      }
    }

    if (!entry || entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      if (this.config.persistent) {
        localStorage.removeItem(`cache_${key}`);
      }
      return null;
    }

    return entry.data;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
    if (this.config.persistent) {
      localStorage.removeItem(`cache_${key}`);
    }
  }

  invalidatePattern(pattern: RegExp): void {
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.invalidate(key));
  }

  clear(): void {
    this.cache.clear();
    if (this.config.persistent) {
      // Clear all cache entries from localStorage
      const keys = Object.keys(localStorage).filter(key =>
        key.startsWith('cache_')
      );
      keys.forEach(key => localStorage.removeItem(key));
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.invalidate(key));
  }

  getStats(): { hitRate: number; memoryUsage: string; size: number } {
    return {
      size: this.cache.size,
      hitRate: 0, // Would need to track hits/misses for this
      memoryUsage: `${JSON.stringify([...this.cache.entries()]).length} bytes`,
    };
  }
}

// Global cache instances for different data types
export const professionalReviewCache = new MemoryCache({
  ttl: 15 * 60 * 1000, // 15 minutes for professional reviews
  maxSize: 50,
  persistent: true,
});

export const analyticsCache = new MemoryCache({
  ttl: 5 * 60 * 1000, // 5 minutes for analytics data
  maxSize: 30,
  persistent: false,
});

export const familyDataCache = new MemoryCache({
  ttl: 10 * 60 * 1000, // 10 minutes for family data
  maxSize: 100,
  persistent: true,
});

export const documentMetadataCache = new MemoryCache({
  ttl: 30 * 60 * 1000, // 30 minutes for document metadata
  maxSize: 200,
  persistent: true,
});

// React hook for cached data fetching
export function useCachedData<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  cache: MemoryCache<unknown> = analyticsCache,
  dependencies: any[] = []
): {
  data: null | T;
  error: Error | null;
  invalidate: () => void;
  loading: boolean;
  refresh: () => void;
} {
  const [data, setData] = useState<null | T>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const fetchFnRef = useRef(fetchFn);

  // Update fetchFn ref when it changes
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  const fetchData = useCallback(
    async (useCache: boolean = true) => {
      // Try cache first if enabled
      if (useCache) {
        const cached = cache.get(cacheKey);
        if (cached !== null && cached !== undefined) {
          setData(cached as T);
          return;
        }
      }

      setLoading(true);
      setError(null);

      try {
        const result = await fetchFnRef.current();
        cache.set(cacheKey, result);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [cacheKey, cache]
  );

  const refresh = useCallback(() => {
    fetchData(false); // Bypass cache on refresh
  }, [fetchData]);

  const invalidate = useCallback(() => {
    cache.invalidate(cacheKey);
    setData(null);
  }, [cacheKey, cache]);

  // Initial load and dependency updates
  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  return {
    data,
    loading,
    error,
    refresh,
    invalidate,
  };
}

// Hook for cached professional reviews
export function useCachedProfessionalReviews(userId: string) {
  return useCachedData(
    `professional_reviews_${userId}`,
    async () => {
      // This would be replaced with actual API call
      const response = await fetch(
        `/api/professional-reviews?userId=${userId}`
      );
      if (!response.ok) throw new Error('Failed to fetch professional reviews');
      return response.json();
    },
    professionalReviewCache,
    [userId]
  );
}

// Hook for cached analytics data
export function useCachedAnalytics(userId: string, timeframe: string = '30d') {
  return useCachedData(
    `analytics_${userId}_${timeframe}`,
    async () => {
      // This would be replaced with actual analytics API call
      const response = await fetch(
        `/api/analytics?userId=${userId}&timeframe=${timeframe}`
      );
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    },
    analyticsCache,
    [userId, timeframe]
  );
}

// Hook for cached family data
export function useCachedFamilyData(familyId: string) {
  return useCachedData(
    `family_data_${familyId}`,
    async () => {
      // This would be replaced with actual family API call
      const response = await fetch(`/api/family/${familyId}`);
      if (!response.ok) throw new Error('Failed to fetch family data');
      return response.json();
    },
    familyDataCache,
    [familyId]
  );
}

// Cache invalidation utilities
export const cacheInvalidation = {
  // Invalidate all user-related caches
  invalidateUserCaches: (userId: string) => {
    analyticsCache.invalidatePattern(new RegExp(`.*${userId}.*`));
    familyDataCache.invalidatePattern(new RegExp(`.*${userId}.*`));
    professionalReviewCache.invalidatePattern(new RegExp(`.*${userId}.*`));
  },

  // Invalidate family-related caches
  invalidateFamilyCaches: (familyId: string) => {
    familyDataCache.invalidatePattern(new RegExp(`.*${familyId}.*`));
    analyticsCache.invalidatePattern(new RegExp(`.*${familyId}.*`));
  },

  // Invalidate professional review caches
  invalidateProfessionalReviewCaches: (reviewId?: string) => {
    if (reviewId) {
      professionalReviewCache.invalidatePattern(new RegExp(`.*${reviewId}.*`));
    } else {
      professionalReviewCache.clear();
    }
  },

  // Clear all caches
  clearAllCaches: () => {
    analyticsCache.clear();
    familyDataCache.clear();
    professionalReviewCache.clear();
    documentMetadataCache.clear();
  },
};

// Cache warming utility
export const warmCache = {
  // Pre-load critical data for better user experience
  preloadUserData: async (userId: string) => {
    try {
      // Warm analytics cache
      fetch(`/api/analytics?userId=${userId}&timeframe=30d`).then(response => {
        if (response.ok) {
          response.json().then(data => {
            analyticsCache.set(`analytics_${userId}_30d`, data);
          });
        }
      });

      // Warm family data cache
      fetch(`/api/family?userId=${userId}`).then(response => {
        if (response.ok) {
          response.json().then(data => {
            familyDataCache.set(`family_data_${userId}`, data);
          });
        }
      });
    } catch (error) {
      console.warn('Cache warming failed:', error);
    }
  },
};
