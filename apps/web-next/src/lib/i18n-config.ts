export type LocaleCode = 'en' | 'cs' | 'sk';

export function getLanguageLabel(code: LocaleCode): string {
  const labels: Record<LocaleCode, string> = {
    en: 'English',
    cs: 'Čeština',
    sk: 'Slovenčina'
  };
  return labels[code] || code;
}

export function normalizeLocale(locale: string): LocaleCode {
  switch (locale) {
    case 'cs':
      return 'cs';
    case 'sk':
      return 'sk';
    default:
      return 'en';
  }
}