/**
 * Domain configuration for all 39 European countries
 * Each domain maps to its supported languages in priority order
 */

export interface DomainConfig {
  domain: string;
  country: string;
  countryCode: string;
  languages: string[];
  currency: string;
  timezone: string;
}

export const DOMAIN_CONFIGURATIONS: Record<string, DomainConfig> = {
  // Central Europe
  'legacyguard.at': {
    domain: 'legacyguard.at',
    country: 'Austria',
    countryCode: 'AT',
    languages: ['de', 'en', 'hu', 'sl'],
    currency: 'EUR',
    timezone: 'Europe/Vienna',
  },
  'legacyguard.cz': {
    domain: 'legacyguard.cz',
    country: 'Czech Republic',
    countryCode: 'CZ',
    languages: ['cs', 'sk', 'en', 'de'],
    currency: 'CZK',
    timezone: 'Europe/Prague',
  },
  'legacyguard.sk': {
    domain: 'legacyguard.sk',
    country: 'Slovakia',
    countryCode: 'SK',
    languages: ['sk', 'cs', 'hu', 'en'],
    currency: 'EUR',
    timezone: 'Europe/Bratislava',
  },
  'legacyguard.hu': {
    domain: 'legacyguard.hu',
    country: 'Hungary',
    countryCode: 'HU',
    languages: ['hu', 'en', 'de', 'sk'],
    currency: 'HUF',
    timezone: 'Europe/Budapest',
  },
  'legacyguard.pl': {
    domain: 'legacyguard.pl',
    country: 'Poland',
    countryCode: 'PL',
    languages: ['pl', 'en', 'de', 'uk'],
    currency: 'PLN',
    timezone: 'Europe/Warsaw',
  },
  
  // Western Europe
  'legacyguard.de': {
    domain: 'legacyguard.de',
    country: 'Germany',
    countryCode: 'DE',
    languages: ['de', 'en', 'tr', 'pl'],
    currency: 'EUR',
    timezone: 'Europe/Berlin',
  },
  'legacyguard.fr': {
    domain: 'legacyguard.fr',
    country: 'France',
    countryCode: 'FR',
    languages: ['fr', 'en', 'de', 'es'],
    currency: 'EUR',
    timezone: 'Europe/Paris',
  },
  'legacyguard.be': {
    domain: 'legacyguard.be',
    country: 'Belgium',
    countryCode: 'BE',
    languages: ['nl', 'fr', 'de', 'en'],
    currency: 'EUR',
    timezone: 'Europe/Brussels',
  },
  'legacyguard.nl': {
    domain: 'legacyguard.nl',
    country: 'Netherlands',
    countryCode: 'NL',
    languages: ['nl', 'en', 'de', 'fr'],
    currency: 'EUR',
    timezone: 'Europe/Amsterdam',
  },
  'legacyguard.lu': {
    domain: 'legacyguard.lu',
    country: 'Luxembourg',
    countryCode: 'LU',
    languages: ['fr', 'de', 'en', 'pt'],
    currency: 'EUR',
    timezone: 'Europe/Luxembourg',
  },
  'legacyguard.ch': {
    domain: 'legacyguard.ch',
    country: 'Switzerland',
    countryCode: 'CH',
    languages: ['de', 'fr', 'it', 'en'],
    currency: 'CHF',
    timezone: 'Europe/Zurich',
  },
  'legacyguard.li': {
    domain: 'legacyguard.li',
    country: 'Liechtenstein',
    countryCode: 'LI',
    languages: ['de', 'en', 'fr', 'it'],
    currency: 'CHF',
    timezone: 'Europe/Vaduz',
  },
  
  // Southern Europe
  'legacyguard.it': {
    domain: 'legacyguard.it',
    country: 'Italy',
    countryCode: 'IT',
    languages: ['it', 'en', 'de', 'fr'],
    currency: 'EUR',
    timezone: 'Europe/Rome',
  },
  'legacyguard.es': {
    domain: 'legacyguard.es',
    country: 'Spain',
    countryCode: 'ES',
    languages: ['es', 'en', 'fr', 'de'],
    currency: 'EUR',
    timezone: 'Europe/Madrid',
  },
  'legacyguard.pt': {
    domain: 'legacyguard.pt',
    country: 'Portugal',
    countryCode: 'PT',
    languages: ['pt', 'en', 'es', 'fr'],
    currency: 'EUR',
    timezone: 'Europe/Lisbon',
  },
  'legacyguard.gr': {
    domain: 'legacyguard.gr',
    country: 'Greece',
    countryCode: 'GR',
    languages: ['el', 'en', 'de', 'fr'],
    currency: 'EUR',
    timezone: 'Europe/Athens',
  },
  'legacyguard.mt': {
    domain: 'legacyguard.mt',
    country: 'Malta',
    countryCode: 'MT',
    languages: ['mt', 'en', 'it', 'fr'],
    currency: 'EUR',
    timezone: 'Europe/Malta',
  },
  'legacyguard.cy': {
    domain: 'legacyguard.cy',
    country: 'Cyprus',
    countryCode: 'CY',
    languages: ['el', 'en', 'tr', 'ru'],
    currency: 'EUR',
    timezone: 'Asia/Nicosia',
  },
  
  // Nordic Countries
  'legacyguard.dk': {
    domain: 'legacyguard.dk',
    country: 'Denmark',
    countryCode: 'DK',
    languages: ['da', 'en', 'de', 'sv'],
    currency: 'DKK',
    timezone: 'Europe/Copenhagen',
  },
  'legacyguard.se': {
    domain: 'legacyguard.se',
    country: 'Sweden',
    countryCode: 'SE',
    languages: ['sv', 'en', 'fi', 'no'],
    currency: 'SEK',
    timezone: 'Europe/Stockholm',
  },
  'legacyguard.no': {
    domain: 'legacyguard.no',
    country: 'Norway',
    countryCode: 'NO',
    languages: ['no', 'en', 'sv', 'da'],
    currency: 'NOK',
    timezone: 'Europe/Oslo',
  },
  'legacyguard.fi': {
    domain: 'legacyguard.fi',
    country: 'Finland',
    countryCode: 'FI',
    languages: ['fi', 'sv', 'en', 'ru'],
    currency: 'EUR',
    timezone: 'Europe/Helsinki',
  },
  'legacyguard.is': {
    domain: 'legacyguard.is',
    country: 'Iceland',
    countryCode: 'IS',
    languages: ['is', 'en', 'da', 'no'],
    currency: 'ISK',
    timezone: 'Atlantic/Reykjavik',
  },
  
  // Baltic States
  'legacyguard.ee': {
    domain: 'legacyguard.ee',
    country: 'Estonia',
    countryCode: 'EE',
    languages: ['et', 'ru', 'en', 'fi'],
    currency: 'EUR',
    timezone: 'Europe/Tallinn',
  },
  'legacyguard.lv': {
    domain: 'legacyguard.lv',
    country: 'Latvia',
    countryCode: 'LV',
    languages: ['lv', 'ru', 'en', 'lt'],
    currency: 'EUR',
    timezone: 'Europe/Riga',
  },
  'legacyguard.lt': {
    domain: 'legacyguard.lt',
    country: 'Lithuania',
    countryCode: 'LT',
    languages: ['lt', 'ru', 'en', 'pl'],
    currency: 'EUR',
    timezone: 'Europe/Vilnius',
  },
  
  // Ireland & UK
  'legacyguard.ie': {
    domain: 'legacyguard.ie',
    country: 'Ireland',
    countryCode: 'IE',
    languages: ['en', 'ga', 'fr', 'de'],
    currency: 'EUR',
    timezone: 'Europe/Dublin',
  },
  'legacyguard.uk': {
    domain: 'legacyguard.uk',
    country: 'United Kingdom',
    countryCode: 'GB',
    languages: ['en', 'fr', 'de', 'es'],
    currency: 'GBP',
    timezone: 'Europe/London',
  },
  
  // Balkans
  'legacyguard.si': {
    domain: 'legacyguard.si',
    country: 'Slovenia',
    countryCode: 'SI',
    languages: ['sl', 'hr', 'en', 'de'],
    currency: 'EUR',
    timezone: 'Europe/Ljubljana',
  },
  'legacyguard.hr': {
    domain: 'legacyguard.hr',
    country: 'Croatia',
    countryCode: 'HR',
    languages: ['hr', 'en', 'de', 'it'],
    currency: 'EUR',
    timezone: 'Europe/Zagreb',
  },
  'legacyguard.ro': {
    domain: 'legacyguard.ro',
    country: 'Romania',
    countryCode: 'RO',
    languages: ['ro', 'en', 'hu', 'de'],
    currency: 'RON',
    timezone: 'Europe/Bucharest',
  },
  'legacyguard.bg': {
    domain: 'legacyguard.bg',
    country: 'Bulgaria',
    countryCode: 'BG',
    languages: ['bg', 'en', 'ru', 'tr'],
    currency: 'BGN',
    timezone: 'Europe/Sofia',
  },
  'legacyguard.rs': {
    domain: 'legacyguard.rs',
    country: 'Serbia',
    countryCode: 'RS',
    languages: ['sr', 'en', 'hu', 'ro'],
    currency: 'RSD',
    timezone: 'Europe/Belgrade',
  },
  'legacyguard.ba': {
    domain: 'legacyguard.ba',
    country: 'Bosnia and Herzegovina',
    countryCode: 'BA',
    languages: ['bs', 'hr', 'sr', 'en'],
    currency: 'BAM',
    timezone: 'Europe/Sarajevo',
  },
  'legacyguard.me': {
    domain: 'legacyguard.me',
    country: 'Montenegro',
    countryCode: 'ME',
    languages: ['me', 'sr', 'bs', 'sq'],
    currency: 'EUR',
    timezone: 'Europe/Podgorica',
  },
  'legacyguard.mk': {
    domain: 'legacyguard.mk',
    country: 'North Macedonia',
    countryCode: 'MK',
    languages: ['mk', 'sq', 'en', 'sr'],
    currency: 'MKD',
    timezone: 'Europe/Skopje',
  },
  'legacyguard.al': {
    domain: 'legacyguard.al',
    country: 'Albania',
    countryCode: 'AL',
    languages: ['sq', 'en', 'it', 'el'],
    currency: 'ALL',
    timezone: 'Europe/Tirane',
  },
  
  // Eastern Europe
  'legacyguard.md': {
    domain: 'legacyguard.md',
    country: 'Moldova',
    countryCode: 'MD',
    languages: ['ro', 'ru', 'uk', 'en'],
    currency: 'MDL',
    timezone: 'Europe/Chisinau',
  },
  'legacyguard.ua': {
    domain: 'legacyguard.ua',
    country: 'Ukraine',
    countryCode: 'UA',
    languages: ['uk', 'ru', 'en', 'pl'],
    currency: 'UAH',
    timezone: 'Europe/Kiev',
  },
};

// Helper functions
export function getDomainConfig(domain: string): DomainConfig | undefined {
  return DOMAIN_CONFIGURATIONS[domain];
}

export function getDefaultLanguageForDomain(domain: string): string {
  const config = getDomainConfig(domain);
  return config?.languages[0] || 'en';
}

export function getSupportedLanguagesForDomain(domain: string): string[] {
  const config = getDomainConfig(domain);
  return config?.languages || ['en'];
}

export function getAllDomains(): string[] {
  return Object.keys(DOMAIN_CONFIGURATIONS);
}

export function getDomainByCountryCode(countryCode: string): string | undefined {
  const entry = Object.entries(DOMAIN_CONFIGURATIONS).find(
    ([_, config]) => config.countryCode === countryCode
  );
  return entry?.[0];
}

export function getCurrencyForDomain(domain: string): string {
  const config = getDomainConfig(domain);
  return config?.currency || 'EUR';
}

export function getTimezoneForDomain(domain: string): string {
  const config = getDomainConfig(domain);
  return config?.timezone || 'Europe/Brussels';
}

// Export for middleware use
export const DOMAIN_LANGUAGES: Record<string, string[]> = Object.entries(
  DOMAIN_CONFIGURATIONS
).reduce((acc, [domain, config]) => {
  acc[domain] = config.languages;
  return acc;
}, {} as Record<string, string[]>);

export default DOMAIN_CONFIGURATIONS;