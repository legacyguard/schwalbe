import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Get the domain-specific host configuration
 */
function getDomainConfig(hostname: string) {
  const isProduction = process.env.VITE_IS_PRODUCTION === 'true';
  
  if (!isProduction) {
    // In development/staging, show a modal instead of redirecting
    return {
      shouldRedirect: false,
      targetDomain: null
    };
  }

  // Map of country codes to their corresponding domains
  const domainMap: Record<string, string> = {
    'cz': 'legacyguard.cz',
    'sk': 'legacyguard.sk',
    // Add more domains as needed
  };

  // Extract country code from hostname
  const countryCode = hostname.split('.')[0].toLowerCase();
  const targetDomain = domainMap[countryCode];

  return {
    shouldRedirect: !!targetDomain && hostname !== targetDomain,
    targetDomain
  };
}

/**
 * Middleware guard to handle domain-specific redirects
 */
export function guardRoute() {
  const headersList = headers();
  const hostname = headersList.get('host') || '';
  
  const { shouldRedirect, targetDomain } = getDomainConfig(hostname);
  
  if (shouldRedirect && targetDomain) {
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    redirect(`${protocol}://${targetDomain}`);
  }
}