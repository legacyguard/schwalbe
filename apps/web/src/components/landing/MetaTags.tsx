import React from 'react';
import { Helmet } from 'react-helmet-async';

interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

export function MetaTags({
  title = "LegacyGuard - Secure Your Digital Legacy",
  description = "Transform uncertainty into peace of mind. Secure your digital legacy with bank-level encryption and Sofia AI guidance. Start free and protect what matters most.",
  keywords = "digital legacy, estate planning, document storage, secure vault, Sofia AI, legacy protection, digital inheritance, secure documents",
  image = "/og-image.png",
  url = "https://legacyguard.vercel.app"
}: MetaTagsProps) {
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="LegacyGuard" />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="LegacyGuard" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#1e293b" />
      <link rel="canonical" href={url} />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "LegacyGuard",
          "description": description,
          "url": url,
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${url}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        })}
      </script>
    </Helmet>
  );
}