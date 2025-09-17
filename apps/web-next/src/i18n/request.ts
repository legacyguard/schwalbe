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

  // Load base messages and optional onboarding namespace
  const base = (await import(`../../messages/${locale}.json`).catch(() => ({ default: {} as any }))).default as any;
  const onboarding = (await import(`../messages/${locale}/onboarding.json`).catch(() => ({ default: {} as any }))).default as any;

  const messages = {
    ...base,
    onboarding: {
      ...(base?.onboarding || {}),
      ...onboarding,
    },
  } as any;

  return {
    locale,
    messages,
  };
});
