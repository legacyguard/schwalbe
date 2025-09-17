
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// Define the props the component will accept
interface MetaTagsProps {
  author?: string;
  description?: string;
  imageUrl?: string;
  keywords?: string;
  robots?: string;
  structuredData?: object;
  title?: string;
  url?: string;
}

// Define default image and URL values
const STATIC_DEFAULTS = {
  IMAGE_URL: 'https://legacyguard.app/og-image.png',
  URL: 'https://legacyguard.app',
};

export const MetaTags = ({
  title,
  description,
  imageUrl,
  url,
  structuredData,
  keywords,
  author,
  robots,
}: MetaTagsProps) => {
  const { t } = useTranslation('ui/meta-tags');

  // Use provided props or fall back to the default values
  const pageTitle = title ? t('titleWithBrand', { title }) : t('defaults.title');
  const pageDescription = description || t('defaults.description');
  const pageImageUrl = imageUrl || STATIC_DEFAULTS.IMAGE_URL;
  const pageUrl = url || STATIC_DEFAULTS.URL;
  const pageKeywords = keywords || t('defaults.keywords');
  const pageAuthor = author || t('defaults.author');
  const pageRobots = robots || t('defaults.robots');

  // Default structured data for LegacyGuard
  const defaultStructuredData = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: t('structuredData.name'),
      description: pageDescription,
      url: pageUrl,
      applicationCategory: t('structuredData.applicationCategory'),
      operatingSystem: t('structuredData.operatingSystem'),
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        category: t('structuredData.freeCategory'),
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '5.0',
        ratingCount: '1',
      },
    }),
    [pageDescription, pageUrl]
  );

  const finalStructuredData = structuredData || defaultStructuredData;

  useEffect(() => {
    // Update document title
    document.title = pageTitle;

    // Helper function to update or create meta tags
    const updateMetaTag = (selector: string, content: string) => {
      let element = document.querySelector(selector) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        // Parse selector more robustly
        const propertyMatch = selector.match(/\[property="([^"]+)"\]/);
        const nameMatch = selector.match(/\[name="([^"]+)"\]/);

        if (propertyMatch && propertyMatch[1]) {
          element.setAttribute('property', propertyMatch[1]);
        } else if (nameMatch && nameMatch[1]) {
          element.setAttribute('name', nameMatch[1]);
        } else {
          console.warn(`Unable to parse meta tag selector: ${selector}`);
          return;
        }
        document.head.appendChild(element);
      }
      element.content = content;
    };

    // Helper function to update or create link tags
    const updateLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(
        `link[rel="${rel}"]`
      ) as HTMLLinkElement;
      if (!element) {
        element = document.createElement('link');
        element.rel = rel;
        document.head.appendChild(element);
      }
      element.href = href;
    };

    // Update standard SEO meta tags
    updateMetaTag('meta[name="description"]', pageDescription);
    updateMetaTag('meta[name="keywords"]', pageKeywords);
    updateMetaTag('meta[name="author"]', pageAuthor);
    updateMetaTag('meta[name="robots"]', pageRobots);
    updateLinkTag('canonical', pageUrl);

    // Update Open Graph meta tags
    updateMetaTag('meta[property="og:type"]', 'website');
    updateMetaTag('meta[property="og:url"]', pageUrl);
    updateMetaTag('meta[property="og:title"]', pageTitle);
    updateMetaTag('meta[property="og:description"]', pageDescription);
    updateMetaTag('meta[property="og:image"]', pageImageUrl);
    updateMetaTag('meta[property="og:site_name"]', t('defaults.siteName'));
    updateMetaTag('meta[property="og:locale"]', t('defaults.locale'));

    // Update Twitter Card meta tags
    updateMetaTag('meta[name="twitter:card"]', 'summary_large_image');
    updateMetaTag('meta[name="twitter:url"]', pageUrl);
    updateMetaTag('meta[name="twitter:title"]', pageTitle);
    updateMetaTag('meta[name="twitter:description"]', pageDescription);
    updateMetaTag('meta[name="twitter:image"]', pageImageUrl);

    // Update structured data
    let scriptElement = document.querySelector(
      'script[type="application/ld+json"]'
    );
    if (!scriptElement) {
      scriptElement = document.createElement('script');
      (scriptElement as any).type = 'application/ld+json';
      document.head.appendChild(scriptElement);
    }
    try {
      scriptElement.textContent = JSON.stringify(finalStructuredData);
    } catch (error) {
      console.error('Failed to serialize structured data:', error);
      scriptElement.textContent = JSON.stringify(defaultStructuredData);
    }

    // Cleanup function (optional - keeps meta tags in place for SPA navigation)
    return () => {
      // If you want to reset to defaults when component unmounts, uncomment below:
      // document.title = DEFAULTS.TITLE;
    };
  }, [
    pageTitle,
    pageDescription,
    pageImageUrl,
    pageUrl,
    pageKeywords,
    pageAuthor,
    pageRobots,
    finalStructuredData,
    defaultStructuredData,
  ]);

  // This component doesn't render anything visible
  return null;
};
