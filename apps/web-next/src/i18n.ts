import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Supported locales for the Next.js app
const locales = ['en', 'cs', 'sk', 'de', 'uk', 'pl', 'da', 'sv', 'fi', 'fr', 'it', 'es', 'pt', 'el', 'nl', 'lt', 'lv', 'et', 'hu', 'ro', 'sl', 'hr', 'sr', 'sq', 'mk', 'me', 'bg', 'ga', 'mt', 'is', 'no', 'tr', 'ru', 'bs'] as const;

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});