import { notFound } from 'next/navigation';
import { getRequestConfig, setRequestLocale } from 'next-intl/server';

// Supported locales for the Next.js app
export const locales = ['en', 'cs', 'sk'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async () => {
  // Get the locale from the request
  const localeHeader = (await import('next/headers')).headers().get('x-locale')
  const locale = (localeHeader ?? 'en') as Locale
  setRequestLocale(locale)
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locale)) notFound();

  return {
    locale,
    // Prefer project messages under src/messages (code in EN, copy in locale files)
    messages: (await import(`../../src/messages/${locale}.json`)).default,
  };
});
