# SEO & Social Media Sharing Implementation Guide

## Overview

This guide explains how to implement proper SEO and social media sharing capabilities using the `MetaTags` component in the LegacyGuard project.

## What We've Implemented

### 1. MetaTags Component (`src/components/common/MetaTags.tsx`)

A reusable React component that automatically generates all necessary meta tags for:

- **SEO**: Title, description, keywords, canonical URLs
- **Open Graph**: Facebook, LinkedIn, and other social media platforms
- **Twitter Cards**: Twitter-specific sharing optimization
- **Structured Data**: JSON-LD schema markup for search engines

### 2. Updated Pages

The following pages now use the MetaTags component:

- **LandingPage**: Main marketing page with comprehensive SEO
- **Terms of Service**: Legal page with appropriate meta tags
- **Privacy Policy**: Privacy page with relevant descriptions
- **404 Not Found**: Error page with noindex directive

## How to Use the MetaTags Component

### Basic Usage

```tsx
import { MetaTags } from '@/components/common/MetaTags';

const MyPage = () => {
  return (
    <>
      <MetaTags />
      {/* Your page content */}
    </>
  );
};
```

### Customized Usage

```tsx
import { MetaTags } from '@/components/common/MetaTags';

const MyPage = () => {
  return (
    <>
      <MetaTags 
        title="Custom Page Title"
        description="Custom page description for SEO and social sharing"
        url="https://legacyguard.app/custom-page"
        keywords="custom, keywords, for, this, page"
        author="Custom Author"
        robots="index, follow"
      />
      {/* Your page content */}
    </>
  );
};
```

### Advanced Usage with Custom Structured Data

```tsx
import { MetaTags } from '@/components/common/MetaTags';

const MyPage = () => {
  const customStructuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Custom Article Title",
    "author": {
      "@type": "Person",
      "name": "Author Name"
    },
    "datePublished": "2024-01-01",
    "description": "Article description"
  };

  return (
    <>
      <MetaTags 
        title="Custom Article"
        description="Article description"
        structuredData={customStructuredData}
      />
      {/* Your page content */}
    </>
  );
};
```

## Component Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `title` | string | No | "LegacyGuard \| Your Legacy, Secured. Your Family, Protected." | Page title (will be appended with " \| LegacyGuard") |
| `description` | string | No | Default description about LegacyGuard | Page description for SEO and social sharing |
| `imageUrl` | string | No | "<https://www.yourdomain.com/og-image.png>" | Social media image URL (should be 1200x630px) |
| `url` | string | No | "<https://www.yourdomain.com>" | Canonical URL for the page |
| `keywords` | string | No | Default keywords about legacy planning | Comma-separated keywords for SEO |
| `author` | string | No | "LegacyGuard" | Page author |
| `robots` | string | No | "index, follow" | Robots directive |
| `structuredData` | object | No | Default LegacyGuard app schema | Custom JSON-LD structured data |

## Default Values

The component provides sensible defaults for all LegacyGuard pages:

- **Title**: "LegacyGuard | Your Legacy, Secured. Your Family, Protected."
- **Description**: Comprehensive description of LegacyGuard's services
- **Keywords**: Relevant keywords for legacy planning and document management
- **Author**: "LegacyGuard"
- **Robots**: "index, follow"
- **Structured Data**: WebApplication schema with app details

## Important Notes

### 1. Image Requirements

- **Size**: 1200x630 pixels (optimal for social media)
- **Format**: PNG or JPG
- **Accessibility**: Must be publicly accessible via HTTPS
- **Content**: Should represent your page/brand clearly

### 2. URL Configuration

**IMPORTANT**: Update the default URLs in the component:

```tsx
const DEFAULTS = {
  // ... other defaults
  IMAGE_URL: 'https://legacyguard.app/og-image.png', // Update this
  URL: 'https://legacyguard.app', // Update this
};
```

### 3. Testing Your Meta Tags

Use these tools to verify your implementation:

- **Facebook Sharing Debugger**: <https://developers.facebook.com/tools/debug/>
- **Twitter Card Validator**: <https://cards-dev.twitter.com/validator>
- **LinkedIn Post Inspector**: <https://www.linkedin.com/post-inspector/>
- **Google Rich Results Test**: <https://search.google.com/test/rich-results>

## Adding MetaTags to New Pages

### Step 1: Import the Component

```tsx
import { MetaTags } from '@/components/common/MetaTags';
```

### Step 2: Add to Your JSX

```tsx
const NewPage = () => {
  return (
    <>
      <MetaTags 
        title="Your Page Title"
        description="Your page description"
      />
      {/* Your page content */}
    </>
  );
};
```

### Step 3: Customize as Needed

Add any additional props based on your page's specific needs:

- Custom keywords for better SEO
- Specific social media descriptions
- Custom structured data for rich snippets
- Special robots directives (e.g., "noindex" for private pages)

## Best Practices

### 1. Title Optimization

- Keep titles under 60 characters
- Include primary keywords
- Make them compelling and descriptive
- Use the format: "Page Title | LegacyGuard"

### 2. Description Optimization

- Keep descriptions under 160 characters
- Include primary and secondary keywords
- Make them compelling for click-through
- Avoid keyword stuffing

### 3. Image Optimization

- Use high-quality, relevant images
- Ensure images load quickly
- Test across different social platforms
- Consider accessibility (alt text in content)

### 4. Structured Data

- Use appropriate schema types
- Include all required fields
- Test with Google's Rich Results Test
- Keep data accurate and up-to-date

## Troubleshooting

### Common Issues

1. **Meta tags not appearing**
   - Ensure `HelmetProvider` wraps your app in `main.tsx`
   - Check that the component is imported correctly
   - Verify the component is rendered in your JSX

2. **Social media not picking up images**
   - Ensure image URL is publicly accessible
   - Check image dimensions (1200x630px recommended)
   - Use Facebook Sharing Debugger to refresh cache

3. **SEO not improving**
   - Ensure all required meta tags are present
   - Check that descriptions are unique per page
   - Verify canonical URLs are correct
   - Test structured data with Google's tools

## Next Steps

1. **Update Default URLs**: Replace placeholder URLs with your actual domain
2. **Create Social Media Images**: Design and upload 1200x630px images
3. **Test Implementation**: Use the testing tools mentioned above
4. **Monitor Performance**: Track SEO improvements in Google Search Console
5. **Expand Coverage**: Add MetaTags to remaining pages in your application

## Support

For questions or issues with the MetaTags implementation:

1. Check this documentation first
2. Review the component code in `src/components/common/MetaTags.tsx`
3. Test with the provided tools
4. Consult the react-helmet-async documentation if needed

---

**Last Updated**: January 2025
**Version**: 1.0
**Maintainer**: Development Team
