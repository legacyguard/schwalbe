import { computePreferredLocaleFromBrowser } from '../lib/utils';

export const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'cs', 'sk'],
  localeDetection: true,
} as const;

export type Locale = (typeof i18n)['locales'][number];

export function getInitialLocale() {
  if (typeof navigator === 'undefined') return i18n.defaultLocale;
  return computePreferredLocaleFromBrowser(navigator.languages);
}

export function getDirection(locale: Locale) {
  return 'ltr';
}