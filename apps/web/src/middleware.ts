/**
 * Next.js Middleware
 * Handles geo-localization, security, and request routing
 */

import { NextRequest, NextResponse } from 'next/server';
import { geoLocalizationMiddleware } from './middleware/geoLocalizationMiddleware';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes that don't need geo
  const isStaticFile = pathname.startsWith('/_next/') ||
                      pathname.startsWith('/favicon') ||
                      pathname.startsWith('/images/') ||
                      pathname.startsWith('/icons/') ||
                      pathname.includes('.');

  const isApiRoute = pathname.startsWith('/api/');
  const isAuthRoute = pathname.startsWith('/auth/');

  // Apply geo-localization middleware to main app routes
  if (!isStaticFile) {
    const response = geoLocalizationMiddleware(request);

    // Add security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    // Add CSP for enhanced security
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https: wss:",
      "frame-src 'none'",
    ].join('; ');

    response.headers.set('Content-Security-Policy', csp);

    return response;
  }

  // For API routes, add basic security headers only
  if (isApiRoute) {
    const response = NextResponse.next();
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};