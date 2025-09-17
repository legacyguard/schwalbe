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

  // Load base and namespaces for features
  const base = (await import(`../../messages/${locale}.json`).catch(() => ({ default: {} as any }))).default as any;
  const onboarding = (await import(`../messages/${locale}/onboarding.json`).catch(() => ({ default: {} as any }))).default as any;
  const assistant = (await import(`../messages/${locale}/assistant.json`).catch(() => ({ default: {} as any }))).default as any;
  const dashboard = (await import(`../messages/${locale}/dashboard.json`).catch(() => ({ default: {} as any }))).default as any;

  const messages = {
    ...base,
    onboarding: { ...(base?.onboarding || {}), ...onboarding },
    assistant: { ...(base?.assistant || {}), ...assistant },
    dashboard: { ...(base?.dashboard || {}), ...dashboard },
  } as any;

  return {
    locale,
    messages,
  };
});
