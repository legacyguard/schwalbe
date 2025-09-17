
/**
 * Jurisdiction Configuration for LegacyGuard
 * Defines legal frameworks, languages, and regional settings for 40 countries
 */

export interface JurisdictionConfig {
  code: string;
  currency: string;
  dateLocale: string;
  defaultLanguage: string;
  documentTypes: string[];
  domain: string;
  emergencyProtocols: boolean;
  features?: {
    digitalNotary?: boolean;
    forcedHeirship?: boolean;
    multipleOfficialLanguages?: boolean;
    regionalVariations?: boolean;
  };
  inheritanceTax: {
    hasInheritanceTax: boolean;
    rates?: string;
  };
  legalSystem: string;
  name: string;
  notaryRequired: boolean;
  pricing: {
    currency: string;
    monthly: number;
  };
  supportedLanguages: string[];
  tier: 1 | 2;
}

export const JURISDICTION_CONFIG: Record<string, JurisdictionConfig> = {
  // TIER 1 MARKETS - Western & Central Europe
  DE: {
    code: 'DE',
    name: 'Germany',
    domain: 'legacyguard.de',
    tier: 1,
    defaultLanguage: 'de',
    supportedLanguages: ['de', 'en', 'pl', 'uk', 'ru'],
    currency: 'EUR',
    dateLocale: 'de-DE',
    legalSystem: 'German Civil Code (BGB)',
    notaryRequired: true,
    inheritanceTax: {
      hasInheritanceTax: true,
      rates: '7-50%',
    },
    documentTypes: ['Testament', 'Vorsorgevollmacht', 'Patientenverfügung'],
    emergencyProtocols: true,
    pricing: { monthly: 19, currency: 'EUR' },
  },

  CZ: {
    code: 'CZ',
    name: 'Czech Republic',
    domain: 'legacyguard.cz',
    tier: 1,
    defaultLanguage: 'cs',
    supportedLanguages: ['cs', 'sk', 'en', 'de', 'uk'],
    currency: 'CZK',
    dateLocale: 'cs-CZ',
    legalSystem: 'Czech Civil Code',
    notaryRequired: true,
    inheritanceTax: {
      hasInheritanceTax: false,
    },
    documentTypes: ['závěť', 'plná moc', 'dříve vyslovené přání'],
    emergencyProtocols: true,
    pricing: { monthly: 19, currency: 'EUR' },
  },

  SK: {
    code: 'SK',
    name: 'Slovakia',
    domain: 'legacyguard.sk',
    tier: 1,
    defaultLanguage: 'sk',
    supportedLanguages: ['sk', 'cs', 'en', 'de', 'uk'],
    currency: 'EUR',
    dateLocale: 'sk-SK',
    legalSystem: 'Slovak Civil Code',
    notaryRequired: true,
    inheritanceTax: {
      hasInheritanceTax: false,
    },
    documentTypes: ['závet', 'splnomocnenie', 'predchádzajúce súhlasy'],
    emergencyProtocols: true,
    pricing: { monthly: 19, currency: 'EUR' },
  },

  FR: {
    code: 'FR',
    name: 'France',
    domain: 'legacyguard.fr',
    tier: 1,
    defaultLanguage: 'fr',
    supportedLanguages: ['fr', 'en', 'de', 'es', 'uk'],
    currency: 'EUR',
    dateLocale: 'fr-FR',
    legalSystem: 'French Civil Code',
    notaryRequired: true,
    inheritanceTax: {
      hasInheritanceTax: true,
      rates: 'up to 60%',
    },
    documentTypes: ['testament', 'donation', 'désignation bénéficiaire'],
    emergencyProtocols: true,
    pricing: { monthly: 19, currency: 'EUR' },
    features: {
      forcedHeirship: true,
    },
  },

  ES: {
    code: 'ES',
    name: 'Spain',
    domain: 'legacyguard.es',
    tier: 1,
    defaultLanguage: 'es',
    supportedLanguages: ['es', 'en', 'fr', 'de', 'uk'],
    currency: 'EUR',
    dateLocale: 'es-ES',
    legalSystem: 'Spanish Civil Code',
    notaryRequired: true,
    inheritanceTax: {
      hasInheritanceTax: true,
      rates: 'varies by region',
    },
    documentTypes: ['testamento', 'poder notarial', 'instrucciones previas'],
    emergencyProtocols: true,
    pricing: { monthly: 19, currency: 'EUR' },
    features: {
      regionalVariations: true,
    },
  },

  IT: {
    code: 'IT',
    name: 'Italy',
    domain: 'legacyguard.it',
    tier: 1,
    defaultLanguage: 'it',
    supportedLanguages: ['it', 'en', 'de', 'fr', 'uk'],
    currency: 'EUR',
    dateLocale: 'it-IT',
    legalSystem: 'Italian Civil Code (Codice Civile)',
    notaryRequired: true,
    inheritanceTax: {
      hasInheritanceTax: true,
      rates: '4-8%',
    },
    documentTypes: ['testamento', 'procura', 'DAT'],
    emergencyProtocols: true,
    pricing: { monthly: 19, currency: 'EUR' },
  },

  NL: {
    code: 'NL',
    name: 'Netherlands',
    domain: 'legacyguard.nl',
    tier: 1,
    defaultLanguage: 'nl',
    supportedLanguages: ['nl', 'en', 'de', 'fr', 'uk'],
    currency: 'EUR',
    dateLocale: 'nl-NL',
    legalSystem: 'Dutch Civil Code (Burgerlijk Wetboek)',
    notaryRequired: true,
    inheritanceTax: {
      hasInheritanceTax: true,
      rates: '10-40%',
    },
    documentTypes: ['testament', 'volmacht', 'wilsverklaring'],
    emergencyProtocols: true,
    pricing: { monthly: 19, currency: 'EUR' },
  },

  BE: {
    code: 'BE',
    name: 'Belgium',
    domain: 'legacyguard.be',
    tier: 1,
    defaultLanguage: 'nl',
    supportedLanguages: ['nl', 'fr', 'en', 'de', 'uk'],
    currency: 'EUR',
    dateLocale: 'nl-BE',
    legalSystem: 'Belgian Civil Code',
    notaryRequired: true,
    inheritanceTax: {
      hasInheritanceTax: true,
      rates: 'varies by region',
    },
    documentTypes: ['testament', 'volmacht', 'mandat'],
    emergencyProtocols: true,
    pricing: { monthly: 19, currency: 'EUR' },
    features: {
      regionalVariations: true,
      multipleOfficialLanguages: true,
    },
  },

  CH: {
    code: 'CH',
    name: 'Switzerland',
    domain: 'legacyguard.ch',
    tier: 1,
    defaultLanguage: 'de',
    supportedLanguages: ['de', 'fr', 'it', 'en', 'uk'],
    currency: 'CHF',
    dateLocale: 'de-CH',
    legalSystem: 'Swiss Civil Code (ZGB/CC/CCS)',
    notaryRequired: true,
    inheritanceTax: {
      hasInheritanceTax: true,
      rates: '0-55% by canton',
    },
    documentTypes: [
      'Testament',
      'Vorsorgeauftrag',
      "mandat pour cause d'inaptitude",
    ],
    emergencyProtocols: true,
    pricing: { monthly: 19, currency: 'EUR' },
    features: {
      regionalVariations: true,
      multipleOfficialLanguages: true,
    },
  },

  AT: {
    code: 'AT',
    name: 'Austria',
    domain: 'legacyguard.at',
    tier: 1,
    defaultLanguage: 'de',
    supportedLanguages: ['de', 'en', 'it', 'cs', 'uk'],
    currency: 'EUR',
    dateLocale: 'de-AT',
    legalSystem: 'Austrian Civil Code (ABGB)',
    notaryRequired: true,
    inheritanceTax: {
      hasInheritanceTax: false,
    },
    documentTypes: ['Testament', 'Vorsorgevollmacht', 'Patientenverfügung'],
    emergencyProtocols: true,
    pricing: { monthly: 19, currency: 'EUR' },
  },

  UK: {
    code: 'UK',
    name: 'United Kingdom',
    domain: 'legacyguard.uk',
    tier: 1,
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'pl', 'fr', 'de', 'uk'],
    currency: 'GBP',
    dateLocale: 'en-GB',
    legalSystem: 'UK Inheritance Act',
    notaryRequired: false,
    inheritanceTax: {
      hasInheritanceTax: true,
      rates: '40% above threshold',
    },
    documentTypes: ['will', 'LPA', 'living will'],
    emergencyProtocols: true,
    pricing: { monthly: 19, currency: 'EUR' },
    features: {
      regionalVariations: true, // England, Scotland, Northern Ireland
    },
  },

  PL: {
    code: 'PL',
    name: 'Poland',
    domain: 'legacyguard.pl',
    tier: 1,
    defaultLanguage: 'pl',
    supportedLanguages: ['pl', 'en', 'de', 'cs', 'uk'],
    currency: 'PLN',
    dateLocale: 'pl-PL',
    legalSystem: 'Polish Civil Code',
    notaryRequired: true,
    inheritanceTax: {
      hasInheritanceTax: true,
      rates: '3-20%',
    },
    documentTypes: ['testament', 'pełnomocnictwo', 'oświadczenie woli'],
    emergencyProtocols: true,
    pricing: { monthly: 19, currency: 'EUR' },
  },

  DK: {
    code: 'DK',
    name: 'Denmark',
    domain: 'legacyguard.dk',
    tier: 1,
    defaultLanguage: 'da',
    supportedLanguages: ['da', 'en', 'de', 'sv', 'uk'],
    currency: 'DKK',
    dateLocale: 'da-DK',
    legalSystem: 'Danish Inheritance Act',
    notaryRequired: false,
    inheritanceTax: {
      hasInheritanceTax: true,
      rates: 'boafgift',
    },
    documentTypes: ['testamente', 'fremtidsfuldmagt', 'livstestamente'],
    emergencyProtocols: true,
    pricing: { monthly: 19, currency: 'EUR' },
    features: {
      digitalNotary: true,
    },
  },

  SE: {
    code: 'SE',
    name: 'Sweden',
    domain: 'legacyguard.se',
    tier: 1,
    defaultLanguage: 'sv',
    supportedLanguages: ['sv', 'en', 'de', 'fi', 'uk'],
    currency: 'SEK',
    dateLocale: 'sv-SE',
    legalSystem: 'Swedish Inheritance Code',
    notaryRequired: false,
    inheritanceTax: {
      hasInheritanceTax: false,
    },
    documentTypes: ['testamente', 'fullmakt', 'framtidsfullmakt'],
    emergencyProtocols: true,
    pricing: { monthly: 19, currency: 'EUR' },
  },

  FI: {
    code: 'FI',
    name: 'Finland',
    domain: 'legacyguard.fi',
    tier: 1,
    defaultLanguage: 'fi',
    supportedLanguages: ['fi', 'sv', 'en', 'de', 'uk'],
    currency: 'EUR',
    dateLocale: 'fi-FI',
    legalSystem: 'Finnish Code of Inheritance',
    notaryRequired: false,
    inheritanceTax: {
      hasInheritanceTax: true,
    },
    documentTypes: ['testamentti', 'valtakirja', 'hoitotahto'],
    emergencyProtocols: true,
    pricing: { monthly: 19, currency: 'EUR' },
    features: {
      multipleOfficialLanguages: true, // Finnish and Swedish
    },
  },

  PT: {
    code: 'PT',
    name: 'Portugal',
    domain: 'legacyguard.pt',
    tier: 1,
    defaultLanguage: 'pt',
    supportedLanguages: ['pt', 'en', 'es', 'fr', 'uk'],
    currency: 'EUR',
    dateLocale: 'pt-PT',
    legalSystem: 'Portuguese Civil Code',
    notaryRequired: true,
    inheritanceTax: {
      hasInheritanceTax: true,
      rates: '10% stamp duty',
    },
    documentTypes: ['testamento', 'procuração', 'diretiva antecipada'],
    emergencyProtocols: true,
    pricing: { monthly: 19, currency: 'EUR' },
  },

  GR: {
    code: 'GR',
    name: 'Greece',
    domain: 'legacyguard.gr',
    tier: 1,
    defaultLanguage: 'el',
    supportedLanguages: ['el', 'en', 'de', 'fr', 'uk'],
    currency: 'EUR',
    dateLocale: 'el-GR',
    legalSystem: 'Greek Civil Code',
    notaryRequired: true,
    inheritanceTax: {
      hasInheritanceTax: true,
      rates: 'progressive',
    },
    documentTypes: ['διαθήκη', 'πληρεξούσιο', 'προκαταβολικές οδηγίες'],
    emergencyProtocols: true,
    pricing: { monthly: 19, currency: 'EUR' },
  },

  HU: {
    code: 'HU',
    name: 'Hungary',
    domain: 'legacyguard.hu',
    tier: 1,
    defaultLanguage: 'hu',
    supportedLanguages: ['hu', 'en', 'de', 'sk', 'ro'],
    currency: 'HUF',
    dateLocale: 'hu-HU',
    legalSystem: 'Hungarian Civil Code (Ptk)',
    notaryRequired: true,
    inheritanceTax: {
      hasInheritanceTax: true,
      rates: '18% general',
    },
    documentTypes: [
      'végrendelet',
      'meghatalmazás',
      'előzetes egészségügyi rendelkezés',
    ],
    emergencyProtocols: true,
    pricing: { monthly: 19, currency: 'EUR' },
  },

  SI: {
    code: 'SI',
    name: 'Slovenia',
    domain: 'legacyguard.si',
    tier: 1,
    defaultLanguage: 'sl',
    supportedLanguages: ['sl', 'en', 'de', 'hr', 'it'],
    currency: 'EUR',
    dateLocale: 'sl-SI',
    legalSystem: 'Slovenian Inheritance Act',
    notaryRequired: true,
    inheritanceTax: {
      hasInheritanceTax: true,
      rates: '5-39%',
    },
    documentTypes: ['oporoka', 'pooblastilo', 'predhodna volja'],
    emergencyProtocols: true,
    pricing: { monthly: 19, currency: 'EUR' },
  },

  EE: {
    code: 'EE',
    name: 'Estonia',
    domain: 'legacyguard.ee',
    tier: 1,
    defaultLanguage: 'et',
    supportedLanguages: ['et', 'ru', 'en', 'fi', 'uk'],
    currency: 'EUR',
    dateLocale: 'et-EE',
    legalSystem: 'Estonian Law of Succession Act',
    notaryRequired: true,
    inheritanceTax: {
      hasInheritanceTax: false,
    },
    documentTypes: ['testament', 'volikiri', 'hoolduskorraldus'],
    emergencyProtocols: true,
    pricing: { monthly: 19, currency: 'EUR' },
  },

  LV: {
    code: 'LV',
    name: 'Latvia',
    domain: 'legacyguard.lv',
    tier: 1,
    defaultLanguage: 'lv',
    supportedLanguages: ['lv', 'ru', 'en', 'de', 'uk'],
    currency: 'EUR',
    dateLocale: 'lv-LV',
    legalSystem: 'Latvian Civil Law',
    notaryRequired: true,
    inheritanceTax: {
      hasInheritanceTax: true,
    },
    documentTypes: ['testaments', 'pilnvara', 'nākotnes pilnvarojums'],
    emergencyProtocols: true,
    pricing: { monthly: 19, currency: 'EUR' },
  },

  LT: {
    code: 'LT',
    name: 'Lithuania',
    domain: 'legacyguard.lt',
    tier: 1,
    defaultLanguage: 'lt',
    supportedLanguages: ['lt', 'en', 'ru', 'pl', 'uk'],
    currency: 'EUR',
    dateLocale: 'lt-LT',
    legalSystem: 'Lithuanian Civil Code',
    notaryRequired: true,
    inheritanceTax: {
      hasInheritanceTax: true,
    },
    documentTypes: ['testamentas', 'įgaliojimas', 'išankstinis nurodymas'],
    emergencyProtocols: true,
    pricing: { monthly: 19, currency: 'EUR' },
  },

  LU: {
    code: 'LU',
    name: 'Luxembourg',
    domain: 'legacyguard.lu',
    tier: 1,
    defaultLanguage: 'fr',
    supportedLanguages: ['fr', 'de', 'en', 'pt', 'uk'],
    currency: 'EUR',
    dateLocale: 'fr-LU',
    legalSystem: 'Luxembourg inheritance law',
    notaryRequired: true,
    inheritanceTax: {
      hasInheritanceTax: true,
    },
    documentTypes: ['testament', 'procuration'],
    emergencyProtocols: true,
    pricing: { monthly: 19, currency: 'EUR' },
    features: {
      multipleOfficialLanguages: true,
    },
  },

  LI: {
    code: 'LI',
    name: 'Liechtenstein',
    domain: 'legacyguard.li',
    tier: 1,
    defaultLanguage: 'de',
    supportedLanguages: ['de', 'en', 'fr', 'it', 'uk'],
    currency: 'CHF',
    dateLocale: 'de-LI',
    legalSystem: 'Liechtenstein inheritance law',
    notaryRequired: true,
    inheritanceTax: {
      hasInheritanceTax: true,
    },
    documentTypes: ['Testament', 'Vollmacht'],
    emergencyProtocols: true,
    pricing: { monthly: 19, currency: 'EUR' },
  },

  MT: {
    code: 'MT',
    name: 'Malta',
    domain: 'legacyguard.mt',
    tier: 1,
    defaultLanguage: 'mt',
    supportedLanguages: ['mt', 'en', 'it', 'de', 'fr'],
    currency: 'EUR',
    dateLocale: 'mt-MT',
    legalSystem: 'Maltese Civil Code',
    notaryRequired: true,
    inheritanceTax: {
      hasInheritanceTax: false,
    },
    documentTypes: ['testment', 'prokura'],
    emergencyProtocols: true,
    pricing: { monthly: 19, currency: 'EUR' },
    features: {
      multipleOfficialLanguages: true,
    },
  },

  CY: {
    code: 'CY',
    name: 'Cyprus',
    domain: 'legacyguard.cy',
    tier: 1,
    defaultLanguage: 'el',
    supportedLanguages: ['el', 'en', 'tr', 'ru', 'uk'],
    currency: 'EUR',
    dateLocale: 'el-CY',
    legalSystem: 'Cypriot Wills and Succession Law',
    notaryRequired: false,
    inheritanceTax: {
      hasInheritanceTax: false,
    },
    documentTypes: ['will', 'power of attorney'],
    emergencyProtocols: true,
    pricing: { monthly: 19, currency: 'EUR' },
  },

  IE: {
    code: 'IE',
    name: 'Ireland',
    domain: 'legacyguard.ie',
    tier: 1,
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'ga', 'pl', 'fr', 'uk'],
    currency: 'EUR',
    dateLocale: 'en-IE',
    legalSystem: 'Irish Succession Act',
    notaryRequired: false,
    inheritanceTax: {
      hasInheritanceTax: true,
      rates: '33% CAT',
    },
    documentTypes: ['will', 'enduring power of attorney'],
    emergencyProtocols: true,
    pricing: { monthly: 19, currency: 'EUR' },
  },

  NO: {
    code: 'NO',
    name: 'Norway',
    domain: 'legacyguard.no',
    tier: 1,
    defaultLanguage: 'no',
    supportedLanguages: ['no', 'en', 'sv', 'da', 'uk'],
    currency: 'NOK',
    dateLocale: 'nb-NO',
    legalSystem: 'Norwegian Inheritance Act',
    notaryRequired: false,
    inheritanceTax: {
      hasInheritanceTax: false,
    },
    documentTypes: ['testament', 'fremtidsfullmakt', 'livstestament'],
    emergencyProtocols: true,
    pricing: { monthly: 19, currency: 'EUR' },
    features: {
      digitalNotary: true,
    },
  },

  IS: {
    code: 'IS',
    name: 'Iceland',
    domain: 'legacyguard.is',
    tier: 1,
    defaultLanguage: 'is',
    supportedLanguages: ['is', 'en', 'da', 'no', 'uk'],
    currency: 'ISK',
    dateLocale: 'is-IS',
    legalSystem: 'Icelandic Inheritance Act',
    notaryRequired: false,
    inheritanceTax: {
      hasInheritanceTax: true,
    },
    documentTypes: ['erfðaskrá', 'umboð'],
    emergencyProtocols: true,
    pricing: { monthly: 19, currency: 'EUR' },
  },

  // TIER 2 MARKETS - Eastern Europe & Balkans
  RO: {
    code: 'RO',
    name: 'Romania',
    domain: 'legacyguard.ro',
    tier: 2,
    defaultLanguage: 'ro',
    supportedLanguages: ['ro', 'en', 'de', 'hu', 'uk'],
    currency: 'RON',
    dateLocale: 'ro-RO',
    legalSystem: 'Romanian Civil Code',
    notaryRequired: true,
    inheritanceTax: {
      hasInheritanceTax: true,
      rates: '1% if delayed',
    },
    documentTypes: ['testament', 'procură', 'directivă anticipată'],
    emergencyProtocols: true,
    pricing: { monthly: 14, currency: 'EUR' },
  },

  BG: {
    code: 'BG',
    name: 'Bulgaria',
    domain: 'legacyguard.bg',
    tier: 2,
    defaultLanguage: 'bg',
    supportedLanguages: ['bg', 'en', 'de', 'ru', 'uk'],
    currency: 'BGN',
    dateLocale: 'bg-BG',
    legalSystem: 'Bulgarian Inheritance Act',
    notaryRequired: true,
    inheritanceTax: {
      hasInheritanceTax: true,
      rates: '0.4-6.6%',
    },
    documentTypes: ['завещание', 'пълномощно', 'декларация'],
    emergencyProtocols: true,
    pricing: { monthly: 14, currency: 'EUR' },
  },

  HR: {
    code: 'HR',
    name: 'Croatia',
    domain: 'legacyguard.hr',
    tier: 2,
    defaultLanguage: 'hr',
    supportedLanguages: ['hr', 'en', 'de', 'it', 'sr'],
    currency: 'EUR',
    dateLocale: 'hr-HR',
    legalSystem: 'Croatian Inheritance Act',
    notaryRequired: true,
    inheritanceTax: {
      hasInheritanceTax: true,
      rates: '4%',
    },
    documentTypes: ['oporuka', 'punomoć', 'izjave volje'],
    emergencyProtocols: true,
    pricing: { monthly: 14, currency: 'EUR' },
  },

  RS: {
    code: 'RS',
    name: 'Serbia',
    domain: 'legacyguard.rs',
    tier: 2,
    defaultLanguage: 'sr',
    supportedLanguages: ['sr', 'en', 'de', 'ru', 'hr'],
    currency: 'RSD',
    dateLocale: 'sr-RS',
    legalSystem: 'Serbian Law of Inheritance',
    notaryRequired: true,
    inheritanceTax: {
      hasInheritanceTax: true,
      rates: 'progressive',
    },
    documentTypes: ['тестамент', 'пуномоћје'],
    emergencyProtocols: true,
    pricing: { monthly: 14, currency: 'EUR' },
  },

  AL: {
    code: 'AL',
    name: 'Albania',
    domain: 'legacyguard.al',
    tier: 2,
    defaultLanguage: 'sq',
    supportedLanguages: ['sq', 'en', 'it', 'de', 'el'],
    currency: 'ALL',
    dateLocale: 'sq-AL',
    legalSystem: 'Albanian Civil Code',
    notaryRequired: true,
    inheritanceTax: {
      hasInheritanceTax: true,
    },
    documentTypes: ['testament', 'prokurë'],
    emergencyProtocols: true,
    pricing: { monthly: 14, currency: 'EUR' },
  },

  MK: {
    code: 'MK',
    name: 'North Macedonia',
    domain: 'legacyguard.mk',
    tier: 2,
    defaultLanguage: 'mk',
    supportedLanguages: ['mk', 'sq', 'en', 'de', 'bg'],
    currency: 'MKD',
    dateLocale: 'mk-MK',
    legalSystem: 'North Macedonian Law of Inheritance',
    notaryRequired: true,
    inheritanceTax: {
      hasInheritanceTax: true,
    },
    documentTypes: ['тестамент', 'полномошно'],
    emergencyProtocols: true,
    pricing: { monthly: 14, currency: 'EUR' },
    features: {
      multipleOfficialLanguages: true, // Macedonian and Albanian
    },
  },

  ME: {
    code: 'ME',
    name: 'Montenegro',
    domain: 'legacyguard.me',
    tier: 2,
    defaultLanguage: 'me',
    supportedLanguages: ['me', 'sr', 'en', 'de', 'ru'],
    currency: 'EUR',
    dateLocale: 'sr-ME',
    legalSystem: 'Montenegrin Law of Inheritance',
    notaryRequired: true,
    inheritanceTax: {
      hasInheritanceTax: true,
    },
    documentTypes: ['тестамент', 'пуномоћје'],
    emergencyProtocols: true,
    pricing: { monthly: 14, currency: 'EUR' },
  },

  MD: {
    code: 'MD',
    name: 'Moldova',
    domain: 'legacyguard.md',
    tier: 2,
    defaultLanguage: 'ro',
    supportedLanguages: ['ro', 'ru', 'en', 'uk', 'bg'],
    currency: 'MDL',
    dateLocale: 'ro-MD',
    legalSystem: 'Moldovan Civil Code',
    notaryRequired: true,
    inheritanceTax: {
      hasInheritanceTax: true,
    },
    documentTypes: ['testament', 'procură'],
    emergencyProtocols: true,
    pricing: { monthly: 14, currency: 'EUR' },
  },

  UA: {
    code: 'UA',
    name: 'Ukraine',
    domain: 'legacyguard.ua',
    tier: 2,
    defaultLanguage: 'uk',
    supportedLanguages: ['uk', 'ru', 'en', 'pl', 'ro'],
    currency: 'UAH',
    dateLocale: 'uk-UA',
    legalSystem: 'Ukrainian Civil Code',
    notaryRequired: true,
    inheritanceTax: {
      hasInheritanceTax: true,
    },
    documentTypes: ['заповіт', 'довіреність'],
    emergencyProtocols: true,
    pricing: { monthly: 14, currency: 'EUR' },
  },

  BA: {
    code: 'BA',
    name: 'Bosnia and Herzegovina',
    domain: 'legacyguard.ba',
    tier: 2,
    defaultLanguage: 'bs',
    supportedLanguages: ['bs', 'hr', 'sr', 'en', 'de'],
    currency: 'BAM',
    dateLocale: 'bs-BA',
    legalSystem: 'Bosnia and Herzegovina inheritance law',
    notaryRequired: true,
    inheritanceTax: {
      hasInheritanceTax: true,
      rates: 'varies by entity',
    },
    documentTypes: ['testament', 'oporuka', 'punomoć'],
    emergencyProtocols: true,
    pricing: { monthly: 14, currency: 'EUR' },
    features: {
      regionalVariations: true, // Federation, Republika Srpska, Brčko
      multipleOfficialLanguages: true,
    },
  },
};

// Helper functions
export const getJurisdictionByDomain = (
  domain: string
): JurisdictionConfig | undefined => {
  return Object.values(JURISDICTION_CONFIG).find(j => j.domain === domain);
};

export const getJurisdictionsByTier = (tier: 1 | 2): JurisdictionConfig[] => {
  return Object.values(JURISDICTION_CONFIG).filter(j => j.tier === tier);
};

export const getJurisdictionsByLanguage = (
  language: string
): JurisdictionConfig[] => {
  return Object.values(JURISDICTION_CONFIG).filter(j =>
    j.supportedLanguages.includes(language)
  );
};

export const getAllJurisdictions = (): JurisdictionConfig[] => {
  return Object.values(JURISDICTION_CONFIG);
};
