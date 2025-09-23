import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  noIndex?: boolean;
  noFollow?: boolean;
}

const defaultMeta = {
  title: 'LegacyGuard - Secure Your Legacy',
  description: 'Protect your documents, organize your legacy, and ensure your loved ones are prepared. The most trusted platform for family protection and estate planning.',
  keywords: 'estate planning, digital legacy, family protection, will wizard, document management, legacy planning',
  image: '/og-image.jpg',
  url: 'https://legacyguard.com',
  type: 'website' as const,
};

export function SEOHead({
  title,
  description = defaultMeta.description,
  keywords = defaultMeta.keywords,
  image = defaultMeta.image,
  url = defaultMeta.url,
  type = defaultMeta.type,
  noIndex = false,
  noFollow = false,
}: SEOHeadProps) {
  const fullTitle = title
    ? `${title} | LegacyGuard`
    : defaultMeta.title;

  const robotsContent = [
    noIndex ? 'noindex' : 'index',
    noFollow ? 'nofollow' : 'follow',
  ].join(', ');

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={robotsContent} />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="LegacyGuard" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#1e293b" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="LegacyGuard" />

      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://api.supabase.io" />

      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="https://js.stripe.com" />
      <link rel="dns-prefetch" href="https://vitals.vercel-insights.com" />
    </Helmet>
  );
}

// Pre-configured SEO components for common pages
export function DashboardSEO() {
  return (
    <SEOHead
      title="Dashboard"
      description="Manage your digital legacy, view protection status, and organize important documents in your secure LegacyGuard dashboard."
      noIndex={true} // Private area
    />
  );
}

export function LandingSEO() {
  return (
    <SEOHead
      title="Secure Your Digital Legacy"
      description="Protect your documents, organize your legacy, and ensure your loved ones are prepared. Start your journey with LegacyGuard today."
      keywords="digital legacy, estate planning, family protection, will creation, document security, legacy management"
    />
  );
}

export function AuthSEO() {
  return (
    <SEOHead
      title="Sign In"
      description="Access your secure LegacyGuard account to manage your digital legacy and family protection plans."
      noIndex={true} // Auth pages shouldn't be indexed
    />
  );
}

export function NotFoundSEO() {
  return (
    <SEOHead
      title="Page Not Found"
      description="The page you're looking for doesn't exist. Return to LegacyGuard to continue protecting your legacy."
      noIndex={true}
    />
  );
}