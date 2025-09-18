import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { DOMAIN_LANGUAGES, getDefaultLanguageForDomain, getSupportedLanguagesForDomain } from './config/domains';

// Add development domains to the configuration
const EXTENDED_DOMAIN_LANGUAGES: Record<string, string[]> = {
  ...DOMAIN_LANGUAGES,
  'legacyguard.app': ['en', 'cs', 'sk', 'de'], // Development/staging domain
  'localhost:3001': ['en', 'cs', 'sk', 'de'], // Local development
};

function getAllowedLanguagesForHost(hostname: string): string[] {
  // Remove port if present
  const cleanHost = hostname.split(':')[0];
  const domainWithExtension = cleanHost.includes('.') ? cleanHost : `legacyguard.${cleanHost}`;
  
  return EXTENDED_DOMAIN_LANGUAGES[hostname] || 
         EXTENDED_DOMAIN_LANGUAGES[cleanHost] || 
         EXTENDED_DOMAIN_LANGUAGES[domainWithExtension] || 
         ['en'];
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
  // Run on all paths except API, Next internals and assets
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
