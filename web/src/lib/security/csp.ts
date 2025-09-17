/**
 * Content Security Policy (CSP) Configuration
 * Protects against XSS, clickjacking, and other code injection attacks
 */

interface CSPConfig {
  directives: {
    'default-src'?: string[];
    'script-src'?: string[];
    'style-src'?: string[];
    'img-src'?: string[];
    'font-src'?: string[];
    'connect-src'?: string[];
    'frame-src'?: string[];
    'object-src'?: string[];
    'media-src'?: string[];
    'manifest-src'?: string[];
    'worker-src'?: string[];
    'base-uri'?: string[];
    'form-action'?: string[];
    'frame-ancestors'?: string[];
    'upgrade-insecure-requests'?: boolean;
  };
  reportOnly: boolean;
  reportUri?: string;
}

class CSPManager {
  private config: CSPConfig;

  constructor(config: CSPConfig) {
    this.config = config;
  }

  generatePolicy(): string {
    const directives: string[] = [];

    Object.entries(this.config.directives).forEach(([directive, values]) => {
      if (values === true) {
        // Boolean directives like 'upgrade-insecure-requests'
        directives.push(directive);
      } else if (Array.isArray(values) && values.length > 0) {
        directives.push(`${directive} ${values.join(' ')}`);
      }
    });

    let policy = directives.join('; ');

    if (this.config.reportUri) {
      policy += `; report-uri ${this.config.reportUri}`;
    }

    return policy;
  }

  applyToDocument(): void {
    if (typeof document === 'undefined') return;

    const meta = document.createElement('meta');
    meta.httpEquiv = this.config.reportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy';
    meta.content = this.generatePolicy();
    
    document.head.appendChild(meta);
  }

  getReportOnlyHeader(): string {
    return this.config.reportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy';
  }
}

// Production CSP configuration
export const productionCSP = new CSPManager({
  reportOnly: false, // Enforce in production
  reportUri: '/api/security/csp-report',
  directives: {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'", // Required for React development
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
      'https://js.stripe.com',
      'https://cdn.jsdelivr.net', // For any CDN resources
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Required for styled-components/emotion
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
    ],
    'img-src': [
      "'self'",
      'data:',
      'https:',
      'https://www.google-analytics.com',
      'https://fonts.gstatic.com',
      'https://hollywood-3ip6ftl78-legacyguards-projects.vercel.app', // Your domain
    ],
    'font-src': [
      "'self'",
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
    ],
    'connect-src': [
      "'self'",
      'https://api.legacyguard.eu',
      'https://legacyguard.supabase.co',
      'https://api.stripe.com',
      'https://www.google-analytics.com',
      'https://api.clerk.com',
      'wss://legacyguard.supabase.co', // WebSocket for real-time features
    ],
    'frame-src': [
      "'self'",
      'https://js.stripe.com',
      'https://api.clerk.com',
    ],
    'object-src': ["'none'"],
    'media-src': ["'self'"],
    'manifest-src': ["'self'"],
    'worker-src': ["'self'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"], // Prevent clickjacking
    'upgrade-insecure-requests': true,
  },
});

// Development CSP (more permissive)
export const developmentCSP = new CSPManager({
  reportOnly: true, // Report only in development
  directives: {
    'default-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'https:'],
    'font-src': ["'self'", 'data:'],
    'connect-src': ["'self'", 'ws:', 'wss:'],
    'object-src': ["'none'"],
    'upgrade-insecure-requests': false,
  },
});

// Security headers configuration
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};

// Apply CSP to document
export function applySecurityHeaders(): void {
  const isDevelopment = import.meta.env.DEV;
  const csp = isDevelopment ? developmentCSP : productionCSP;
  
  try {
    csp.applyToDocument();
    console.log('🔒 Security headers applied');
  } catch (error) {
    console.warn('Failed to apply security headers:', error);
  }
}

// CSP violation reporting
export function setupCSPReporting(): void {
  if (typeof document === 'undefined') return;

  document.addEventListener('securitypolicyviolation', (event) => {
    console.warn('CSP Violation:', {
      documentURI: event.documentURI,
      blockedURI: event.blockedURI,
      violatedDirective: event.violatedDirective,
      originalPolicy: event.originalPolicy,
    });

    // Send to analytics endpoint
    if (import.meta.env.PROD) {
      fetch('/api/security/csp-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/csp-report' },
        body: JSON.stringify({
          'csp-report': {
            'document-uri': event.documentURI,
            'referrer': event.referrer,
            'blocked-uri': event.blockedURI,
            'violated-directive': event.violatedDirective,
            'original-policy': event.originalPolicy,
            'line-number': event.lineNumber,
            'column-number': event.columnNumber,
            'source-file': event.sourceFile,
            'status-code': event.statusCode,
          },
        }),
      }).catch(console.error);
    }
  });
}

// Export for use in server configuration
export function getSecurityHeaders(): Record<string, string> {
  const isDevelopment = import.meta.env.DEV;
  const csp = isDevelopment ? developmentCSP : productionCSP;
  
  return {
    ...securityHeaders,
    [csp.getReportOnlyHeader()]: csp.generatePolicy(),
  };
}