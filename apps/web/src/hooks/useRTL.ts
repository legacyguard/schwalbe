import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

/**
 * @description Manages RTL (Right-to-Left) text direction based on current language
 * @returns {boolean} true if current language is RTL
 */
export function useRTL(): boolean {
  const { i18n } = useTranslation();
  const isRTL = RTL_LANGUAGES.includes(i18n.language);

  useEffect(() => {
    const dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', i18n.language);
  }, [isRTL, i18n.language]);

  return isRTL;
}