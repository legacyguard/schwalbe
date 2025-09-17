import { type NextRequest, NextResponse } from 'next/server';

// In-memory store for rate limiting (consider Redis for production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Clean up expired entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  },
  5 * 60 * 1000
);

export interface RateLimitConfig {
  keyGenerator?: (req: NextRequest) => string; // Function to generate rate limit key
  maxRequests?: number; // Max requests per window
  message?: string; // Error message
  skipFailedRequests?: boolean; // Don't count failed requests
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  windowMs?: number; // Time window in milliseconds
}

const defaultConfig: Required<RateLimitConfig> = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
  message: 'Too many requests, please try again later.',
  keyGenerator: req => {
    // Use IP address as default key
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    return `${ip}:${req.nextUrl.pathname}`;
  },
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
};

export function rateLimit(config: RateLimitConfig = {}) {
  const finalConfig = { ...defaultConfig, ...config };

  return async (req: NextRequest): Promise<NextResponse | null> => {
    const key = finalConfig.keyGenerator(req);
    const now = Date.now();

    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);

    if (!entry || entry.resetTime < now) {
      // Create new entry or reset expired one
      entry = {
        count: 0,
        resetTime: now + finalConfig.windowMs,
      };
      rateLimitStore.set(key, entry);
    }

    // Check if limit exceeded
    if (entry.count >= finalConfig.maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

      return NextResponse.json(
        {
          error: finalConfig.message,
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': finalConfig.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(entry.resetTime).toISOString(),
          },
        }
      );
    }

    // Increment counter
    entry.count++;

    // Return null to continue processing
    return null;
  };
}

// Preset configurations for different endpoints
export const rateLimitPresets = {
  // Strict limit for authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many authentication attempts. Please try again later.',
  },

  // Moderate limit for document uploads
  upload: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 3,
    message: 'Too many uploads. Please try again later.',
  },

  // General API endpoints
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    message: 'Too many API requests. Please try again later.',
  },
};
