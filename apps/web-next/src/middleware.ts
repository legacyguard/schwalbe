import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';

// Basic domain configuration - will be enhanced later
const DOMAIN_LANGUAGES: Record<string, string[]> = {
  'legacyguard.app': ['en', 'cs', 'sk'], // Development/staging domain
  'legacyguard.cz': ['cs', 'sk', 'en'],
  'legacyguard.sk': ['sk', 'cs', 'en'],
  'localhost:3001': ['en', 'cs', 'sk'], // Local development
};

function getAllowedLanguagesForHost(hostname: string): string[] {
  // Remove port if present
  const cleanHost = hostname.split(':')[0];
  return DOMAIN_LANGUAGES[hostname] || DOMAIN_LANGUAGES[cleanHost] || ['en'];
}

function getDomainDefaultLanguage(hostname: string): string {
  const allowed = getAllowedLanguagesForHost(hostname);
  return allowed[0] || 'en';
}

export default function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  
  // Get domain-specific language configuration
  const allowedLanguages = getAllowedLanguagesForHost(hostname);
  const defaultLanguage = getDomainDefaultLanguage(hostname);

  // Create the internationalization middleware with domain-specific config
  const handleI18nRouting = createMiddleware({
    locales: allowedLanguages,
    defaultLocale: defaultLanguage,
    localePrefix: 'as-needed', // Only add locale prefix when needed
  });

  const response = handleI18nRouting(request);
  
  // Add security headers
  if (response) {
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  }

  return response;
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(cs|sk|en)/:path*']
};