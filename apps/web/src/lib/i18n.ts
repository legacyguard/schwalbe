import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  en: {
    'ui/scene1-promise': {
      title: 'Your Story Begins Here',
      subtitle:
        'Every family has a story. Every person has something precious to pass on. Let me help you write a letter to the future - one filled with love, wisdom, and the certainty that your family will be protected.',
      storyBegins: 'Your story begins...',
      startWriting: 'Start Writing Your Story',
      footer: 'This journey takes just a few minutes',
      skipIntroduction: 'Skip introduction',
    },
    'will/wizard': {
      title: 'Guided Will Creation',
      steps: {
        start: 'Getting Started',
        testator: 'Personal Information',
        beneficiaries: 'Beneficiaries',
        executor: 'Executor',
        witnesses: 'Witnesses & Signatures',
        review: 'Review & Draft',
      },
      actions: {
        back: 'Back',
        next: 'Next',
        save: 'Save Draft',
        resume: 'Resume',
        finish: 'Generate Draft',
      },
      labels: {
        jurisdiction: 'Jurisdiction',
        language: 'Document language',
        form: 'Will form',
        fullName: 'Full legal name',
        age: 'Age',
        address: 'Address',
        beneficiaryName: 'Beneficiary name',
        relationship: 'Relationship',
        executorName: 'Executor name',
        witnessName: 'Witness name',
        testatorSigned: 'I, the testator, will sign the will',
        witnessesSigned: 'Witnesses will sign the will',
      },
      hints: {
        startInfo: 'Choose your jurisdiction and will form. You can change this later.',
        minAge: 'For typed wills you must be 18 or older; for holographic, at least 15.',
        beneficiaryHint: 'Add at least one beneficiary.',
        witnessHint: 'Typed wills require two witnesses; holographic wills require none.',
      },
      errors: {
        required: 'This field is required',
        nameLength: 'Name must be at least 2 characters',
        ageMinHolographic: 'Holographic will requires you to be 15 or older',
        ageMinTyped: 'Typed will requires you to be 18 or older',
        atLeastOneBeneficiary: 'Add at least one beneficiary',
        witnessCount: 'At least 2 witnesses required for typed wills',
        mustSign: 'Testator signature is required',
        witnessesMustSign: 'Witness signatures are required for typed wills',
      },
      review: {
        validationErrors: 'Validation errors',
        validationWarnings: 'Validation warnings',
        previewTitle: 'Draft preview',
      },
    },
  },
};

import { computePreferredLocaleFromBrowser } from './locale';

const initialLocale = computePreferredLocaleFromBrowser();

i18n.use(initReactI18next).init({
  resources,
  lng: initialLocale,
  // i18next fallback is used when a key is missing; we keep English as the final fallback
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
