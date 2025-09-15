import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  en: {
    'ui/scene1-promise': {
      title: 'Your Story Begins Here',
      subtitle: 'Every family has a story. Every person has something precious to pass on. Let me help you write a letter to the future - one filled with love, wisdom, and the certainty that your family will be protected.',
      storyBegins: 'Your story begins...',
      startWriting: 'Start Writing Your Story',
      footer: 'This journey takes just a few minutes',
      skipIntroduction: 'Skip introduction'
    }
  }
};

import { computePreferredLocaleFromBrowser } from './locale'

const initialLocale = computePreferredLocaleFromBrowser()

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLocale,
    // i18next fallback is used when a key is missing; we keep English as the final fallback
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;