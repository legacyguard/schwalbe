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
    'onboarding': {
      question: 'Question',
      of: 'of',
      cancel: 'Cancel',
      previous: 'Previous',
      next: 'Next',
      complete: 'Complete',
      familyStatus: {
        title: 'familyStatus.title',
        description: 'familyStatus.description',
        single: 'Single',
        couple: 'Couple',
        family: 'Family with children',
        extended: 'Extended family',
      },
      priority: {
        title: 'priority.title',
        description: 'priority.description',
        safety: 'Document security and privacy',
        organization: 'Better organization and access',
        family: 'Family protection and communication',
      },
      timeAvailable: {
        title: 'timeAvailable.title',
        description: 'timeAvailable.description',
        quick: 'Quick setup (15-30 minutes)',
        moderate: 'Moderate time (1-2 hours)',
        thorough: 'Thorough planning (several hours)',
      },
      experience: {
        title: 'experience.title',
        description: 'experience.description',
        new: 'New to estate planning',
        some: 'Some experience',
        experienced: 'Experienced with legal documents',
      },
      concerns: {
        title: 'concerns.title',
        description: 'concerns.description',
        privacy: 'Privacy and data security',
        accessibility: 'Easy access for family',
        complexity: 'Legal complexity',
        cost: 'Cost and value',
      },
      goals: {
        title: 'goals.title',
        description: 'goals.description',
        peace_of_mind: 'Peace of mind for my family',
        family_protection: 'Protect my family\'s future',
        organization: 'Better organization of important documents',
        future_planning: 'Plan for the future',
      },
    },
    'plan': {
      title: 'Your Personalized Plan',
      subtitle: 'Based on your answers, here\'s your recommended journey',
      yourPlan: 'Your Plan',
      nextAction: 'Next Action',
      estimatedTime: 'Estimated time',
      days: 'days',
      minutes: 'minutes',
      estimate: 'Estimate',
      priority: {
        high: 'High',
        medium: 'Medium',
        low: 'Low',
      },
      confidence: {
        high: 'High confidence',
        medium: 'Medium confidence',
        low: 'Low confidence',
      },
      restart: 'Restart Questionnaire',
      startJourney: 'Start My Journey',
    },
    'persona': {
      starter: {
        name: 'Starter',
        description: 'You\'re taking the first steps toward protecting your family. We\'ll focus on the essentials to get you started safely.',
      },
      planner: {
        name: 'Planner',
        description: 'You value organization and efficiency. We\'ll help you create a comprehensive system for managing your important documents.',
      },
      guardian: {
        name: 'Guardian',
        description: 'Family protection is your priority. We\'ll focus on communication, access, and ensuring your loved ones are taken care of.',
      },
    },
    'ui/search': {
      ariaLabel: 'Search',
      placeholder: 'Search documents…',
      noResults: 'No results',
      resultsAria: 'Search results'
    },
    'dashboard': {
      'sofiaGuidance': {
        'title': 'Sofia’s Guidance',
        'lead': 'If today is not the day to decide, that’s okay. When it feels right, you might consider one small step:',
        'actions': {
          'inviteTrusted': 'Invite a trusted person',
          'beginWill': 'Begin a simple will',
          'addDocument': 'Add one important document'
        }
      },
      'reminders': {
        'title': 'Gentle Reminders',
        'addEmergencyContact': 'When you feel ready, add an emergency contact.',
        'addImportantDocument': 'Add one important document (for example, a passport or ID card).',
        'startWillAddBeneficiary': 'Start your will and jot down a beneficiary.'
      }
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
    'onboarding': {
      question: 'Otázka',
      of: 'z',
      cancel: 'Zrušit',
      previous: 'Předchozí',
      next: 'Další',
      complete: 'Dokončit',
      familyStatus: {
        title: 'Rodinný stav',
        description: 'Pomozte nám lépe porozumět vaší situaci',
        single: 'Svobodný/Svobodná',
        couple: 'Pár',
        family: 'Rodina s dětmi',
        extended: 'Rozšířená rodina',
      },
      priority: {
        title: 'Vaše priority',
        description: 'Co je pro vás nejdůležitější?',
        safety: 'Zabezpečení dokumentů a soukromí',
        organization: 'Lepší organizace a přístup',
        family: 'Ochrana rodiny a komunikace',
      },
      timeAvailable: {
        title: 'Dostupný čas',
        description: 'Kolik času můžete věnovat nastavení?',
        quick: 'Rychlé nastavení (15-30 minut)',
        moderate: 'Střední čas (1-2 hodiny)',
        thorough: 'Důkladné plánování (několik hodin)',
      },
      experience: {
        title: 'Vaše zkušenosti',
        description: 'Jaké máte zkušenosti s právními dokumenty?',
        new: 'Začátečník v estate planningu',
        some: 'Nějaké zkušenosti',
        experienced: 'Zkušený s právními dokumenty',
      },
      concerns: {
        title: 'Vaše obavy',
        description: 'Co vás nejvíce zajímá?',
        privacy: 'Soukromí a bezpečnost dat',
        accessibility: 'Snadný přístup pro rodinu',
        complexity: 'Právní složitost',
        cost: 'Cena a hodnota',
      },
      goals: {
        title: 'Vaše cíle',
        description: 'Čeho chcete dosáhnout?',
        peace_of_mind: 'Klid pro mou rodinu',
        family_protection: 'Ochránit budoucnost mé rodiny',
        organization: 'Lepší organizace důležitých dokumentů',
        future_planning: 'Plánování pro budoucnost',
      },
    },
    'plan': {
      title: 'Váš personalizovaný plán',
      subtitle: 'Na základě vašich odpovědí je zde váš doporučený postup',
      yourPlan: 'Váš plán',
      nextAction: 'Další krok',
      estimatedTime: 'Odhadovaný čas',
      days: 'dní',
      minutes: 'minut',
      estimate: 'Odhad',
      priority: {
        high: 'Vysoká',
        medium: 'Střední',
        low: 'Nízká',
      },
      confidence: {
        high: 'Vysoká jistota',
        medium: 'Střední jistota',
        low: 'Nízká jistota',
      },
      restart: 'Restartovat dotazník',
      startJourney: 'Začít mou cestu',
    },
    'persona': {
      starter: {
        name: 'Začátečník',
        description: 'Děláte první kroky k ochraně své rodiny. Zaměříme se na základní věci, abychom vás bezpečně rozjeli.',
      },
      planner: {
        name: 'Plánovač',
        description: 'Ceníte si organizace a efektivity. Pomůžeme vám vytvořit komplexní systém pro správu vašich důležitých dokumentů.',
      },
      guardian: {
        name: 'Strážce',
        description: 'Ochrana rodiny je vaší prioritou. Zaměříme se na komunikaci, přístup a zajištění, že se o vaše blízké bude postaráno.',
      },
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
    'onboarding': {
      question: 'Otázka',
      of: 'z',
      cancel: 'Zrušiť',
      previous: 'Predchádzajúca',
      next: 'Ďalšia',
      complete: 'Dokončiť',
      familyStatus: {
        title: 'Rodinný stav',
        description: 'Pomôžte nám lepšie porozumieť vašej situácii',
        single: 'Slobodný/Slobodná',
        couple: 'Pár',
        family: 'Rodina s deťmi',
        extended: 'Rozšírená rodina',
      },
      priority: {
        title: 'Vaše priority',
        description: 'Čo je pre vás najdôležitejšie?',
        safety: 'Zabezpečenie dokumentov a súkromie',
        organization: 'Lepšia organizácia a prístup',
        family: 'Ochrana rodiny a komunikácia',
      },
      timeAvailable: {
        title: 'Dostupný čas',
        description: 'Koľko času môžete venovať nastaveniu?',
        quick: 'Rýchle nastavenie (15-30 minút)',
        moderate: 'Stredný čas (1-2 hodiny)',
        thorough: 'Dôkladné plánovanie (niekoľko hodín)',
      },
      experience: {
        title: 'Vaše skúsenosti',
        description: 'Aké máte skúsenosti s právnymi dokumentmi?',
        new: 'Začiatočník v estate planningu',
        some: 'Niektoré skúsenosti',
        experienced: 'Skúsený s právnymi dokumentmi',
      },
      concerns: {
        title: 'Vaše obavy',
        description: 'Čo vás najviac zaujíma?',
        privacy: 'Súkromie a bezpečnosť dát',
        accessibility: 'Ľahký prístup pre rodinu',
        complexity: 'Právna zložitosť',
        cost: 'Cena a hodnota',
      },
      goals: {
        title: 'Vaše ciele',
        description: 'Čoho chcete dosiahnuť?',
        peace_of_mind: 'Pokoj pre moju rodinu',
        family_protection: 'Chrániť budúcnosť mojej rodiny',
        organization: 'Lepšia organizácia dôležitých dokumentov',
        future_planning: 'Plánovanie pre budúcnosť',
      },
    },
    'plan': {
      title: 'Váš personalizovaný plán',
      subtitle: 'Na základe vašich odpovedí je tu váš odporúčaný postup',
      yourPlan: 'Váš plán',
      nextAction: 'Ďalší krok',
      estimatedTime: 'Odhadovaný čas',
      days: 'dní',
      minutes: 'minút',
      estimate: 'Odhad',
      priority: {
        high: 'Vysoká',
        medium: 'Stredná',
        low: 'Nízka',
      },
      confidence: {
        high: 'Vysoká istota',
        medium: 'Stredná istota',
        low: 'Nízka istota',
      },
      restart: 'Reštartovať dotazník',
      startJourney: 'Začať moju cestu',
    },
    'persona': {
      starter: {
        name: 'Začiatočník',
        description: 'Robíte prvé kroky k ochrane svojej rodiny. Zameriam sa na základné veci, aby sme vás bezpečne rozbehli.',
      },
      planner: {
        name: 'Plánovač',
        description: 'Ceníte si organizáciu a efektivity. Pomôžeme vám vytvoriť komplexný systém na správu vašich dôležitých dokumentov.',
      },
      guardian: {
        name: 'Strážca',
        description: 'Ochrana rodiny je vašou prioritou. Zameriam sa na komunikáciu, prístup a zabezpečenie, že sa o vašich blízkych bude postarané.',
      },
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
  // Add pluralization support
  pluralSeparator: '_',
  contextSeparator: '_',
  // Enable debugging in development
  debug: process.env.NODE_ENV === 'development',
  // Support for missing key handler
  missingKeyHandler: (lng, ns, key) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Missing translation: ${lng}:${ns}:${key}`);
    }
  },
  // RTL language support
  detection: {
    order: ['localStorage', 'navigator', 'htmlTag'],
    caches: ['localStorage'],
  },
});

export default i18n;
