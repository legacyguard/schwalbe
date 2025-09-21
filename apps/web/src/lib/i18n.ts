import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  en: {
    'landingV2': {
      heroTitle: 'Protect what matters most',
      heroSubtitle: 'A modern way to secure your family\'s legacy with care and clarity.',
      cta: 'Get started',
      valueTitle: 'Why LegacyGuard?',
      valueCopy: 'Clear steps, gentle guidance, and privacy-first protection.',
    },
    'sharing/viewer': {
      metaDescription: 'Secure shared viewer',
      loading: 'Loading…',
      sharedViewer: 'Shared Viewer',
      enterPassword: 'Enter Password',
      linkExpired: 'Link Expired',
      invalidLink: 'Invalid Link',
      protectedTitle: 'This shared link is protected',
      protectedPrompt: 'Please enter the password to continue.',
      passwordLabel: 'Password',
      unlock: 'Unlock',
      unlockAria: 'Submit password',
      expiredMessage: 'This link has expired.',
      invalidMessage: 'This link is not valid or has been revoked.',
      unableToVerify: 'Unable to verify link.',
      back: 'Back',
      exportPdf: 'Export PDF',
      type: 'Type',
      resourceId: 'Resource ID',
      expires: 'Expires',
      contentPlaceholder: 'Content preview is not yet implemented. Permissions:'
    },
    'ui/scene1-promise': {
      title: 'Your Story Begins Here',
      subtitle:
        'Every family has a story. Every person has something precious to pass on. Let me help you write a letter to the future - one filled with love, wisdom, and the certainty that your family will be protected.',
      storyBegins: 'Your story begins...',
      startWriting: 'Start Writing Your Story',
      footer: 'This journey takes just a few minutes',
      skipIntroduction: 'Skip introduction',
    },
    'ui/search': {
      ariaLabel: 'Search',
      placeholder: 'Search documents…',
      noResults: 'No results',
      resultsAria: 'Search results'
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
    'subscriptions': {
      title: 'Subscriptions',
      currentPlan: 'Current plan',
      trialActive: 'Trial active. {{remaining}} remaining.',
      gracePeriod: 'Grace period: you will retain access for {{days}} day{{s}} after cancellation.',
      plan: 'Plan',
      status: 'Status',
      billingCycle: 'Billing cycle',
      price: 'Price',
      autoRenew: 'Auto renew',
      renewalDate: 'Renewal date',
      manageSubscription: 'Manage subscription',
      openBillingPortal: 'Open Billing Portal',
      cancelSubscription: 'Cancel subscription',
      noSubscription: 'No subscription found.',
      confirmCancellation: 'Confirm cancellation',
      cancelEndOfPeriod: 'Your subscription will remain active until the end of the current billing period.',
      cancelImmediate: 'Your subscription will be cancelled immediately and access will end now.',
      cancelAtEndOfPeriod: 'Cancel at end of current period (recommended)',
      keepSubscription: 'Keep subscription',
      confirmCancellationButton: 'Confirm cancellation',
      cancelling: 'Cancelling…',
      renewalReminders: 'Renewal reminders',
      primaryReminder: 'Primary reminder (days)',
      secondaryReminder: 'Secondary reminder (days)',
      channels: 'Channels',
      savePreferences: 'Save preferences',
      loadingPreferences: 'Loading preferences…',
      errors: {
        loadFailed: 'Failed to load subscription data',
        saveFailed: 'Failed to save preferences',
        cancelFailed: 'Failed to cancel subscription',
      },
    },
    'sharing/manager': {
      title: 'Share Link',
      close: 'Close',
      shareUrl: 'Share URL',
      copy: 'Copy',
      copied: 'Copied!',
      linkCreated: 'Share link created successfully. Anyone with this link can access the resource according to the permissions you set.',
      createAnother: 'Create Another',
      done: 'Done',
      permissions: {
        title: 'Permissions',
        read: 'Read/View',
        download: 'Download',
        comment: 'Comment',
        share: 'Share with others'
      },
      password: {
        enable: 'Require password',
        placeholder: 'Enter password'
      },
      expiry: {
        enable: 'Set expiry',
        days: 'days from now'
      },
      accessLimit: {
        enable: 'Limit access count',
        accesses: 'max accesses'
      },
      creating: 'Creating…',
      createLink: 'Create Share Link',
      cancel: 'Cancel',
      errors: {
        insufficientPlan: 'Sharing requires a paid subscription. Please upgrade your plan.',
        createFailed: 'Failed to create share link. Please try again.'
      }
    },
  },
  cs: {
    'landingV2': {
      heroTitle: 'Chraňte to nejdůležitější',
      heroSubtitle: 'Moderní způsob, jak s péčí a jasem chránit rodinné dědictví.',
      cta: 'Začít',
      valueTitle: 'Proč LegacyGuard?',
      valueCopy: 'Jasné kroky, jemné vedení a soukromí na prvním místě.',
    },
    'subscriptions': {
      title: 'Předplatné',
      currentPlan: 'Aktuální plán',
      trialActive: 'Zkušební období aktivní. {{remaining}} zbývá.',
      gracePeriod: 'Karenční doba: po zrušení si zachováte přístup po dobu {{days}} dn{{s}}.',
      plan: 'Plán',
      status: 'Status',
      billingCycle: 'Fakturační cyklus',
      price: 'Cena',
      autoRenew: 'Automatické obnovení',
      renewalDate: 'Datum obnovení',
      manageSubscription: 'Spravovat předplatné',
      openBillingPortal: 'Otevřít fakturační portál',
      cancelSubscription: 'Zrušit předplatné',
      noSubscription: 'Žádné předplatné nenalezeno.',
      confirmCancellation: 'Potvrdit zrušení',
      cancelEndOfPeriod: 'Vaše předplatné zůstane aktivní až do konce aktuálního fakturačního období.',
      cancelImmediate: 'Vaše předplatné bude zrušeno okamžitě a přístup skončí nyní.',
      cancelAtEndOfPeriod: 'Zrušit na konci aktuálního období (doporučeno)',
      keepSubscription: 'Zachovat předplatné',
      confirmCancellationButton: 'Potvrdit zrušení',
      cancelling: 'Ruší se…',
      renewalReminders: 'Připomínky obnovení',
      primaryReminder: 'Primární připomínka (dny)',
      secondaryReminder: 'Sekundární připomínka (dny)',
      channels: 'Kanály',
      savePreferences: 'Uložit předvolby',
      loadingPreferences: 'Načítání předvoleb…',
      errors: {
        loadFailed: 'Nepodařilo se načíst údaje o předplatném',
        saveFailed: 'Nepodařilo se uložit předvolby',
        cancelFailed: 'Nepodařilo se zrušit předplatné',
      },
    },
    'sharing/manager': {
      title: 'Sdílet odkaz',
      close: 'Zavřít',
      shareUrl: 'URL pro sdílení',
      copy: 'Kopírovat',
      copied: 'Zkopírováno!',
      linkCreated: 'Odkaz pro sdílení byl úspěšně vytvořen. Kdokoli s tímto odkazem může přistupovat k prostředku podle nastavených oprávnění.',
      createAnother: 'Vytvořit další',
      done: 'Hotovo',
      permissions: {
        title: 'Oprávnění',
        read: 'Čtení/Zobrazení',
        download: 'Stahování',
        comment: 'Komentování',
        share: 'Sdílení s ostatními'
      },
      password: {
        enable: 'Vyžadovat heslo',
        placeholder: 'Zadejte heslo'
      },
      expiry: {
        enable: 'Nastavit vypršení',
        days: 'dní od teď'
      },
      accessLimit: {
        enable: 'Omezit počet přístupů',
        accesses: 'max. přístupů'
      },
      creating: 'Vytváří se…',
      createLink: 'Vytvořit odkaz pro sdílení',
      cancel: 'Zrušit',
      errors: {
        insufficientPlan: 'Sdílení vyžaduje placené předplatné. Prosím upgradujte váš plán.',
        createFailed: 'Nepodařilo se vytvořit odkaz pro sdílení. Zkuste to znovu.'
      }
    },
  },
  sk: {
    'landingV2': {
      heroTitle: 'Chráňte to najdôležitejšie',
      heroSubtitle: 'Moderný spôsob, ako s láskou a jasom chrániť dedičstvo rodiny.',
      cta: 'Začať',
      valueTitle: 'Prečo LegacyGuard?',
      valueCopy: 'Jasné kroky, jemné vedenie a súkromie na prvom mieste.',
    },
    'subscriptions': {
      title: 'Predplatné',
      currentPlan: 'Aktuálny plán',
      trialActive: 'Skúšobné obdobie aktívne. {{remaining}} zostáva.',
      gracePeriod: 'Karenčná doba: po zrušení si zachováte prístup po dobu {{days}} dn{{s}}.',
      plan: 'Plán',
      status: 'Status',
      billingCycle: 'Fakturačný cyklus',
      price: 'Cena',
      autoRenew: 'Automatické obnovenie',
      renewalDate: 'Dátum obnovenia',
      manageSubscription: 'Spravovať predplatné',
      openBillingPortal: 'Otvoriť fakturačný portál',
      cancelSubscription: 'Zrušiť predplatné',
      noSubscription: 'Žiadne predplatné nebolo nájdené.',
      confirmCancellation: 'Potvrdiť zrušenie',
      cancelEndOfPeriod: 'Vaše predplatné zostane aktívne až do konca aktuálneho fakturačného obdobia.',
      cancelImmediate: 'Vaše predplatné bude zrušené okamžite a prístup skončí teraz.',
      cancelAtEndOfPeriod: 'Zrušiť na konci aktuálneho obdobia (odporúčané)',
      keepSubscription: 'Zachovať predplatné',
      confirmCancellationButton: 'Potvrdiť zrušenie',
      cancelling: 'Ruší sa…',
      renewalReminders: 'Pripomienky obnovenia',
      primaryReminder: 'Primárna pripomienka (dni)',
      secondaryReminder: 'Sekundárna pripomienka (dni)',
      channels: 'Kanály',
      savePreferences: 'Uložiť predvoľby',
      loadingPreferences: 'Načítanie predvolieb…',
      errors: {
        loadFailed: 'Nepodarilo sa načítať údaje o predplatnom',
        saveFailed: 'Nepodarilo sa uložiť predvoľby',
        cancelFailed: 'Nepodarilo sa zrušiť predplatné',
      },
    },
    'sharing/manager': {
      title: 'Zdieľať odkaz',
      close: 'Zavrieť',
      shareUrl: 'URL na zdieľanie',
      copy: 'Kopírovať',
      copied: 'Skopírované!',
      linkCreated: 'Odkaz na zdieľanie bol úspešne vytvorený. Ktokoľvek s týmto odkazom môže pristupovať k zdroju podľa nastavených oprávnení.',
      createAnother: 'Vytvoriť ďalší',
      done: 'Hotovo',
      permissions: {
        title: 'Oprávnenia',
        read: 'Čítanie/Zobrazenie',
        download: 'Sťahovanie',
        comment: 'Komentovanie',
        share: 'Zdieľanie s ostatnými'
      },
      password: {
        enable: 'Vyžadovať heslo',
        placeholder: 'Zadajte heslo'
      },
      expiry: {
        enable: 'Nastaviť vypršanie',
        days: 'dní odteraz'
      },
      accessLimit: {
        enable: 'Obmedziť počet prístupov',
        accesses: 'max. prístupov'
      },
      creating: 'Vytvára sa…',
      createLink: 'Vytvoriť odkaz na zdieľanie',
      cancel: 'Zrušiť',
      errors: {
        insufficientPlan: 'Zdieľanie vyžaduje platené predplatné. Prosím vylepšite váš plán.',
        createFailed: 'Nepodarilo sa vytvoriť odkaz na zdieľanie. Skúste to znovu.'
      }
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
