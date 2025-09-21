
/**
 * Language Configuration for LegacyGuard
 * Defines settings for 34+ languages across all jurisdictions
 */

export interface LanguageConfig {
  code: string;
  currencyPosition: 'after' | 'before';
  dateFormat: string;
  decimalSeparator: string;
  direction: 'ltr' | 'rtl';
  name: string;
  nativeName: string;
  pluralRules?: (
    count: number
  ) => 'few' | 'many' | 'one' | 'other' | 'two' | 'zero';
  script: 'Arabic' | 'Cyrillic' | 'Greek' | 'Latin';
  thousandsSeparator: string;
  timeFormat: string;
}

export const LANGUAGE_CONFIG: Record<string, LanguageConfig> = {
  // Albanian
  sq: {
    code: 'sq',
    name: 'Albanian',
    nativeName: 'Shqip',
    direction: 'ltr',
    script: 'Latin',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    decimalSeparator: ',',
    thousandsSeparator: ' ',
    currencyPosition: 'after',
  },

  // Bosnian
  bs: {
    code: 'bs',
    name: 'Bosnian',
    nativeName: 'Bosanski',
    direction: 'ltr',
    script: 'Latin',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: 'HH:mm',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    currencyPosition: 'after',
  },

  // Bulgarian
  bg: {
    code: 'bg',
    name: 'Bulgarian',
    nativeName: 'Български',
    direction: 'ltr',
    script: 'Cyrillic',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: 'HH:mm',
    decimalSeparator: ',',
    thousandsSeparator: ' ',
    currencyPosition: 'after',
  },

  // Croatian
  hr: {
    code: 'hr',
    name: 'Croatian',
    nativeName: 'Hrvatski',
    direction: 'ltr',
    script: 'Latin',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: 'HH:mm',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    currencyPosition: 'after',
  },

  // Czech
  cs: {
    code: 'cs',
    name: 'Czech',
    nativeName: 'Čeština',
    direction: 'ltr',
    script: 'Latin',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: 'HH:mm',
    decimalSeparator: ',',
    thousandsSeparator: ' ',
    currencyPosition: 'after',
    pluralRules: (count: number) => {
      if (count === 1) return 'one';
      if (count >= 2 && count <= 4) return 'few';
      return 'many';
    },
  },

  // Danish
  da: {
    code: 'da',
    name: 'Danish',
    nativeName: 'Dansk',
    direction: 'ltr',
    script: 'Latin',
    dateFormat: 'DD-MM-YYYY',
    timeFormat: 'HH:mm',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    currencyPosition: 'before',
  },

  // Dutch
  nl: {
    code: 'nl',
    name: 'Dutch',
    nativeName: 'Nederlands',
    direction: 'ltr',
    script: 'Latin',
    dateFormat: 'DD-MM-YYYY',
    timeFormat: 'HH:mm',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    currencyPosition: 'before',
  },

  // English
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    script: 'Latin',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: 'hh:mm a',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    currencyPosition: 'before',
  },

  // Estonian
  et: {
    code: 'et',
    name: 'Estonian',
    nativeName: 'Eesti',
    direction: 'ltr',
    script: 'Latin',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: 'HH:mm',
    decimalSeparator: ',',
    thousandsSeparator: ' ',
    currencyPosition: 'after',
  },

  // Finnish
  fi: {
    code: 'fi',
    name: 'Finnish',
    nativeName: 'Suomi',
    direction: 'ltr',
    script: 'Latin',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: 'HH:mm',
    decimalSeparator: ',',
    thousandsSeparator: ' ',
    currencyPosition: 'after',
  },

  // French
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    direction: 'ltr',
    script: 'Latin',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    decimalSeparator: ',',
    thousandsSeparator: ' ',
    currencyPosition: 'after',
  },

  // German
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    direction: 'ltr',
    script: 'Latin',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: 'HH:mm',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    currencyPosition: 'after',
  },

  // Greek
  el: {
    code: 'el',
    name: 'Greek',
    nativeName: 'Ελληνικά',
    direction: 'ltr',
    script: 'Greek',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    currencyPosition: 'after',
  },

  // Hungarian
  hu: {
    code: 'hu',
    name: 'Hungarian',
    nativeName: 'Magyar',
    direction: 'ltr',
    script: 'Latin',
    dateFormat: 'YYYY.MM.DD',
    timeFormat: 'HH:mm',
    decimalSeparator: ',',
    thousandsSeparator: ' ',
    currencyPosition: 'after',
  },

  // Icelandic
  is: {
    code: 'is',
    name: 'Icelandic',
    nativeName: 'Íslenska',
    direction: 'ltr',
    script: 'Latin',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: 'HH:mm',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    currencyPosition: 'after',
  },

  // Irish Gaelic
  ga: {
    code: 'ga',
    name: 'Irish',
    nativeName: 'Gaeilge',
    direction: 'ltr',
    script: 'Latin',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    currencyPosition: 'before',
  },

  // Italian
  it: {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    direction: 'ltr',
    script: 'Latin',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    currencyPosition: 'after',
  },

  // Latvian
  lv: {
    code: 'lv',
    name: 'Latvian',
    nativeName: 'Latviešu',
    direction: 'ltr',
    script: 'Latin',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: 'HH:mm',
    decimalSeparator: ',',
    thousandsSeparator: ' ',
    currencyPosition: 'after',
  },

  // Lithuanian
  lt: {
    code: 'lt',
    name: 'Lithuanian',
    nativeName: 'Lietuvių',
    direction: 'ltr',
    script: 'Latin',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm',
    decimalSeparator: ',',
    thousandsSeparator: ' ',
    currencyPosition: 'after',
  },

  // Macedonian
  mk: {
    code: 'mk',
    name: 'Macedonian',
    nativeName: 'Македонски',
    direction: 'ltr',
    script: 'Cyrillic',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: 'HH:mm',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    currencyPosition: 'after',
  },

  // Maltese
  mt: {
    code: 'mt',
    name: 'Maltese',
    nativeName: 'Malti',
    direction: 'ltr',
    script: 'Latin',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    currencyPosition: 'before',
  },

  // Montenegrin
  me: {
    code: 'me',
    name: 'Montenegrin',
    nativeName: 'Crnogorski',
    direction: 'ltr',
    script: 'Latin',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: 'HH:mm',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    currencyPosition: 'after',
  },

  // Norwegian
  no: {
    code: 'no',
    name: 'Norwegian',
    nativeName: 'Norsk',
    direction: 'ltr',
    script: 'Latin',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: 'HH:mm',
    decimalSeparator: ',',
    thousandsSeparator: ' ',
    currencyPosition: 'before',
  },

  // Polish
  pl: {
    code: 'pl',
    name: 'Polish',
    nativeName: 'Polski',
    direction: 'ltr',
    script: 'Latin',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: 'HH:mm',
    decimalSeparator: ',',
    thousandsSeparator: ' ',
    currencyPosition: 'after',
    pluralRules: (count: number) => {
      if (count === 1) return 'one';
      const tens = count % 10;
      const hundreds = count % 100;
      if (tens >= 2 && tens <= 4 && (hundreds < 10 || hundreds >= 20))
        return 'few';
      return 'many';
    },
  },

  // Portuguese
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    direction: 'ltr',
    script: 'Latin',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    decimalSeparator: ',',
    thousandsSeparator: ' ',
    currencyPosition: 'after',
  },

  // Romanian
  ro: {
    code: 'ro',
    name: 'Romanian',
    nativeName: 'Română',
    direction: 'ltr',
    script: 'Latin',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: 'HH:mm',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    currencyPosition: 'after',
  },

  // Russian
  ru: {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    direction: 'ltr',
    script: 'Cyrillic',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: 'HH:mm',
    decimalSeparator: ',',
    thousandsSeparator: ' ',
    currencyPosition: 'after',
    pluralRules: (count: number) => {
      const tens = count % 10;
      const hundreds = count % 100;
      if (tens === 1 && hundreds !== 11) return 'one';
      if (tens >= 2 && tens <= 4 && (hundreds < 10 || hundreds >= 20))
        return 'few';
      return 'many';
    },
  },

  // Serbian
  sr: {
    code: 'sr',
    name: 'Serbian',
    nativeName: 'Српски',
    direction: 'ltr',
    script: 'Cyrillic', // Can also be Latin
    dateFormat: 'DD.MM.YYYY',
    timeFormat: 'HH:mm',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    currencyPosition: 'after',
  },

  // Slovak
  sk: {
    code: 'sk',
    name: 'Slovak',
    nativeName: 'Slovenčina',
    direction: 'ltr',
    script: 'Latin',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: 'HH:mm',
    decimalSeparator: ',',
    thousandsSeparator: ' ',
    currencyPosition: 'after',
    pluralRules: (count: number) => {
      if (count === 1) return 'one';
      if (count >= 2 && count <= 4) return 'few';
      return 'many';
    },
  },

  // Slovenian
  sl: {
    code: 'sl',
    name: 'Slovenian',
    nativeName: 'Slovenščina',
    direction: 'ltr',
    script: 'Latin',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: 'HH:mm',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    currencyPosition: 'after',
  },

  // Spanish
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    direction: 'ltr',
    script: 'Latin',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    currencyPosition: 'after',
  },

  // Swedish
  sv: {
    code: 'sv',
    name: 'Swedish',
    nativeName: 'Svenska',
    direction: 'ltr',
    script: 'Latin',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm',
    decimalSeparator: ',',
    thousandsSeparator: ' ',
    currencyPosition: 'after',
  },

  // Turkish
  tr: {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    direction: 'ltr',
    script: 'Latin',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: 'HH:mm',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    currencyPosition: 'after',
  },

  // Ukrainian
  uk: {
    code: 'uk',
    name: 'Ukrainian',
    nativeName: 'Українська',
    direction: 'ltr',
    script: 'Cyrillic',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: 'HH:mm',
    decimalSeparator: ',',
    thousandsSeparator: ' ',
    currencyPosition: 'after',
    pluralRules: (count: number) => {
      const tens = count % 10;
      const hundreds = count % 100;
      if (tens === 1 && hundreds !== 11) return 'one';
      if (tens >= 2 && tens <= 4 && (hundreds < 10 || hundreds >= 20))
        return 'few';
      return 'many';
    },
  },
};

// Helper functions
export const getLanguageConfig = (code: string): LanguageConfig | undefined => {
  return LANGUAGE_CONFIG[code];
};

export const getLanguagesByScript = (
  script: LanguageConfig['script']
): LanguageConfig[] => {
  return Object.values(LANGUAGE_CONFIG).filter(lang => lang.script === script);
};

export const getRTLLanguages = (): LanguageConfig[] => {
  return Object.values(LANGUAGE_CONFIG).filter(
    lang => lang.direction === 'rtl'
  );
};

// Format functions
export const formatDate = (date: Date, languageCode: string): string => {
  const config = LANGUAGE_CONFIG[languageCode];
  if (!config) return date.toLocaleDateString();

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return config.dateFormat
    .replace('DD', day)
    .replace('MM', month)
    .replace('YYYY', String(year));
};

export const formatNumber = (num: number, languageCode: string): string => {
  const config = LANGUAGE_CONFIG[languageCode];
  if (!config) return num.toLocaleString();

  const parts = num.toFixed(2).split('.');
  const integerPart = parts[0].replace(
    /\B(?=(\d{3})+(?!\d))/g,
    config.thousandsSeparator
  );
  const decimalPart = parts[1];

  return `${integerPart}${config.decimalSeparator}${decimalPart}`;
};

export const formatCurrency = (
  amount: number,
  currency: string,
  languageCode: string
): string => {
  const config = LANGUAGE_CONFIG[languageCode];
  if (!config) return `${currency} ${amount}`;

  const formattedAmount = formatNumber(amount, languageCode);

  if (config.currencyPosition === 'before') {
    return `${currency} ${formattedAmount}`;
  } else {
    return `${formattedAmount} ${currency}`;
  }
};
