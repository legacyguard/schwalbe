
/**
 * Content Security Policy Configuration
 * Provides comprehensive XSS protection and content control
 */

export interface CSPConfig {
  directives: {
    [key: string]: string | string[];
  };
}

/**
 * Get CSP configuration based on environment
 */
export function getCSPConfig(isDevelopment: boolean = false): CSPConfig {
  const baseConfig: CSPConfig = {
    directives: {
      // Default source for all content types
      'default-src': ["'self'"],

      // Script sources
      'script-src': [
        "'self'",
        isDevelopment ? "'unsafe-inline'" : '', // Only in dev
        isDevelopment ? "'unsafe-eval'" : '', // Only in dev
        'https://challenges.cloudflare.com',
        'https://clerk.com',
        'https://*.clerk.com',
        'https://*.clerk.accounts.dev',
      ].filter(Boolean),

      // Style sources
      'style-src': [
        "'self'",
        "'unsafe-inline'", // Required for Tailwind
        'https://fonts.googleapis.com',
      ],

      // Font sources
      'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],

      // Image sources
      'img-src': [
        "'self'",
        'data:',
        'blob:',
        'https://*.supabase.co',
        'https://*.clerk.com',
        'https://img.clerk.com',
        'https://www.gravatar.com',
      ],

      // Media sources
      'media-src': ["'self'", 'blob:', 'https://*.supabase.co'],

      // Connect sources (API calls, WebSockets)
      'connect-src': [
        "'self'",
        'https://*.supabase.co',
        'wss://*.supabase.co',
        'https://*.clerk.com',
        'https://*.clerk.accounts.dev',
        'https://api.openai.com',
        'https://o4504287416786944.ingest.sentry.io',
        isDevelopment ? 'ws://localhost:*' : '',
        isDevelopment ? 'http://localhost:*' : '',
      ].filter(Boolean),

      // Frame sources
      'frame-src': [
        "'self'",
        'https://challenges.cloudflare.com',
        'https://*.clerk.com',
        'https://*.clerk.accounts.dev',
      ],

      // Frame ancestors (who can embed us)
      'frame-ancestors': ["'none'"],

      // Object sources (plugins)
      'object-src': ["'none'"],

      // Base URI
      'base-uri': ["'self'"],

      // Form action
      'form-action': ["'self'"],

      // Upgrade insecure requests
      'upgrade-insecure-requests': isDevelopment ? [] : [''],

      // Block all mixed content
      'block-all-mixed-content': isDevelopment ? [] : [''],
    },
  };

  return baseConfig;
}

/**
 * Convert CSP config to header string
 */
export function cspConfigToString(config: CSPConfig): string {
  return Object.entries(config.directives)
    .filter(([_, value]) => value.length > 0)
    .map(([key, value]) => {
      const valueStr = Array.isArray(value) ? value.join(' ') : value;
      return `${key} ${valueStr}`;
    })
    .join('; ');
}

/**
 * Generate CSP meta tag content
 */
export function generateCSPMeta(): string {
  const config = getCSPConfig(process.env.NODE_ENV === 'development');
  return cspConfigToString(config);
}

/**
 * Security headers configuration
 */
export const securityHeaders = {
  'Content-Security-Policy': generateCSPMeta(),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '0',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Resource-Policy': 'same-origin',
};

/**
 * Report CSP violations
 */
export async function reportCSPViolation(violation: any): Promise<void> {
  try {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('CSP Violation:', violation);
    }

    // Send to monitoring service
    await fetch('/api/security/csp-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        violation,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      }),
    });
  } catch (error) {
    console.error('Failed to report CSP violation:', error);
  }
}

// Set up CSP violation listener
if (typeof window !== 'undefined') {
  window.addEventListener('securitypolicyviolation', event => {
    reportCSPViolation({
      blockedURI: event.blockedURI,
      columnNumber: event.columnNumber,
      disposition: event.disposition,
      documentURI: event.documentURI,
      effectiveDirective: event.effectiveDirective,
      lineNumber: event.lineNumber,
      originalPolicy: event.originalPolicy,
      referrer: event.referrer,
      sourceFile: event.sourceFile,
      statusCode: event.statusCode,
      violatedDirective: event.violatedDirective,
    });
  });
}
