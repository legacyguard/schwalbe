/**
 * Geo/IP Localization Middleware
 * Detects user location and provides localized content and emergency services
 */

import { config } from '@/lib/env';

import { NextRequest, NextResponse } from 'next/server';

export interface GeoLocation {
  country: string;
  countryCode: string;
  region: string;
  regionCode: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  currency: string;
  language: string;
  ipAddress: string;
  accuracy: 'high' | 'medium' | 'low';
  source: 'cloudflare' | 'vercel' | 'fallback' | 'browser';
}

export interface LocalizedContent {
  locale: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  emergencyNumber: string;
  legalFramework: string;
  taxSystem: string;
  dataProtectionLaws: string[];
  trustedInstitutions: string[];
  localServices: {
    lawyers: string[];
    notaries: string[];
    banks: string[];
    hospitals: string[];
  };
}

export interface EmergencyServices {
  police: string;
  fire: string;
  medical: string;
  unified: string;
  poison: string;
  disaster: string;
  helplines: {
    mental: string;
    domestic: string;
    child: string;
    senior: string;
  };
}

// Country-specific configurations
const COUNTRY_CONFIGS: Record<string, {
  locale: string;
  currency: string;
  emergencyServices: EmergencyServices;
  legalFramework: string;
  dataProtectionLaws: string[];
  trustedInstitutions: string[];
}> = {
  SK: {
    locale: 'sk-SK',
    currency: 'EUR',
    emergencyServices: {
      police: '158',
      fire: '150',
      medical: '155',
      unified: '112',
      poison: '+421-2-5477-4166',
      disaster: '199',
      helplines: {
        mental: '0850 566 566',
        domestic: '0800 212 212',
        child: '116 111',
        senior: '0800 100 102',
      },
    },
    legalFramework: 'Slovak Civil Code',
    dataProtectionLaws: ['GDPR', 'Slovak Personal Data Protection Act'],
    trustedInstitutions: [
      'Slovenská notárska komora',
      'Slovenská advokátska komora',
      'Národná banka Slovenska',
      'Ministerstvo spravodlivosti SR',
    ],
  },
  CZ: {
    locale: 'cs-CZ',
    currency: 'CZK',
    emergencyServices: {
      police: '158',
      fire: '150',
      medical: '155',
      unified: '112',
      poison: '+420-224-919-293',
      disaster: '199',
      helplines: {
        mental: '116 123',
        domestic: '800 149 149',
        child: '116 111',
        senior: '800 200 007',
      },
    },
    legalFramework: 'Czech Civil Code',
    dataProtectionLaws: ['GDPR', 'Czech Personal Data Protection Act'],
    trustedInstitutions: [
      'Notářská komora ČR',
      'Česká advokátní komora',
      'Česká národní banka',
      'Ministerstvo spravedlnosti ČR',
    ],
  },
  AT: {
    locale: 'de-AT',
    currency: 'EUR',
    emergencyServices: {
      police: '133',
      fire: '122',
      medical: '144',
      unified: '112',
      poison: '+43-1-406-43-43',
      disaster: '130',
      helplines: {
        mental: '142',
        domestic: '0800 222 555',
        child: '147',
        senior: '0800 201 440',
      },
    },
    legalFramework: 'Austrian Civil Code (ABGB)',
    dataProtectionLaws: ['GDPR', 'Austrian Data Protection Act'],
    trustedInstitutions: [
      'Österreichische Notariatskammer',
      'Österreichischer Rechtsanwaltskammertag',
      'Österreichische Nationalbank',
      'Bundesministerium für Justiz',
    ],
  },
  HU: {
    locale: 'hu-HU',
    currency: 'HUF',
    emergencyServices: {
      police: '107',
      fire: '105',
      medical: '104',
      unified: '112',
      poison: '+36-1-476-6464',
      disaster: '108',
      helplines: {
        mental: '116 123',
        domestic: '06 80 20 55 20',
        child: '116 111',
        senior: '06 1 225 75 75',
      },
    },
    legalFramework: 'Hungarian Civil Code',
    dataProtectionLaws: ['GDPR', 'Hungarian Privacy Act'],
    trustedInstitutions: [
      'Magyar Országos Közjegyzői Kamara',
      'Magyar Ügyvédi Kamara',
      'Magyar Nemzeti Bank',
      'Igazságügyi Minisztérium',
    ],
  },
  PL: {
    locale: 'pl-PL',
    currency: 'PLN',
    emergencyServices: {
      police: '997',
      fire: '998',
      medical: '999',
      unified: '112',
      poison: '+48-42-631-46-50',
      disaster: '992',
      helplines: {
        mental: '116 123',
        domestic: '800 120 002',
        child: '116 111',
        senior: '22 635 09 54',
      },
    },
    legalFramework: 'Polish Civil Code',
    dataProtectionLaws: ['GDPR', 'Polish Personal Data Protection Act'],
    trustedInstitutions: [
      'Krajowa Rada Notarialna',
      'Naczelna Rada Adwokacka',
      'Narodowy Bank Polski',
      'Ministerstwo Sprawiedliwości',
    ],
  },
  DE: {
    locale: 'de-DE',
    currency: 'EUR',
    emergencyServices: {
      police: '110',
      fire: '112',
      medical: '112',
      unified: '112',
      poison: '+49-551-19240',
      disaster: '112',
      helplines: {
        mental: '0800 111 0 111',
        domestic: '08000 116 016',
        child: '116 111',
        senior: '0800 111 0 333',
      },
    },
    legalFramework: 'German Civil Code (BGB)',
    dataProtectionLaws: ['GDPR', 'German Federal Data Protection Act'],
    trustedInstitutions: [
      'Bundesnotarkammer',
      'Bundesrechtsanwaltskammer',
      'Deutsche Bundesbank',
      'Bundesministerium der Justiz',
    ],
  },
  GB: {
    locale: 'en-GB',
    currency: 'GBP',
    emergencyServices: {
      police: '999',
      fire: '999',
      medical: '999',
      unified: '999',
      poison: '111',
      disaster: '999',
      helplines: {
        mental: '116 123',
        domestic: '0808 2000 247',
        child: '0800 1111',
        senior: '0800 731 4931',
      },
    },
    legalFramework: 'English Common Law',
    dataProtectionLaws: ['UK GDPR', 'Data Protection Act 2018'],
    trustedInstitutions: [
      'The Law Society',
      'Faculty of Notaries Public',
      'Bank of England',
      'Ministry of Justice',
    ],
  },
};

// Fallback configuration for unknown countries
const FALLBACK_CONFIG = {
  locale: 'sk-SK',
  currency: 'EUR',
  emergencyServices: {
    police: '112',
    fire: '112',
    medical: '112',
    unified: '112',
    poison: '112',
    disaster: '112',
    helplines: {
      mental: '112',
      domestic: '112',
      child: '112',
      senior: '112',
    },
  },
  legalFramework: 'International Standards',
  dataProtectionLaws: ['Local Privacy Laws'],
  trustedInstitutions: ['Local Legal Authorities'],
};

/**
 * Extract geolocation from request headers
 */
export function extractGeoLocation(request: NextRequest): GeoLocation {
  const headers = request.headers;

  // Try Vercel/Edge geolocation first
  const vercelCountry = headers.get('x-vercel-ip-country');
  const vercelRegion = headers.get('x-vercel-ip-country-region');
  const vercelCity = headers.get('x-vercel-ip-city');
  const vercelLatitude = headers.get('x-vercel-ip-latitude');
  const vercelLongitude = headers.get('x-vercel-ip-longitude');
  const vercelTimezone = headers.get('x-vercel-ip-timezone');

  // Try Cloudflare headers
  const cfCountry = headers.get('cf-ipcountry');
  const cfRegion = headers.get('cf-region');
  const cfCity = headers.get('cf-city');
  const cfLatitude = headers.get('cf-latitude');
  const cfLongitude = headers.get('cf-longitude');
  const cfTimezone = headers.get('cf-timezone');

  // Get IP address
  const forwardedFor = headers.get('x-forwarded-for');
  const realIp = headers.get('x-real-ip');
  const cfConnectingIp = headers.get('cf-connecting-ip');
  const ipAddress = cfConnectingIp || realIp || forwardedFor?.split(',')[0] || '127.0.0.1';

  // Determine source and accuracy
  let source: GeoLocation['source'] = 'fallback';
  let accuracy: GeoLocation['accuracy'] = 'low';

  let country = 'Slovakia';
  let countryCode = 'SK';
  let region = 'Unknown';
  let regionCode = 'UNK';
  let city = 'Unknown';
  let latitude = 0;
  let longitude = 0;
  let timezone = 'UTC';

  if (vercelCountry && vercelLatitude && vercelLongitude) {
    source = 'vercel';
    accuracy = 'high';
    country = vercelCountry;
    countryCode = vercelCountry;
    region = vercelRegion || 'Unknown';
    regionCode = vercelRegion || 'UNK';
    city = vercelCity || 'Unknown';
    latitude = parseFloat(vercelLatitude) || 0;
    longitude = parseFloat(vercelLongitude) || 0;
    timezone = vercelTimezone || 'UTC';
  } else if (cfCountry) {
    source = 'cloudflare';
    accuracy = cfLatitude && cfLongitude ? 'high' : 'medium';
    country = cfCountry;
    countryCode = cfCountry;
    region = cfRegion || 'Unknown';
    regionCode = cfRegion || 'UNK';
    city = cfCity || 'Unknown';
    latitude = parseFloat(cfLatitude || '0');
    longitude = parseFloat(cfLongitude || '0');
    timezone = cfTimezone || 'UTC';
  }

  const config = COUNTRY_CONFIGS[countryCode] || FALLBACK_CONFIG;

  return {
    country,
    countryCode,
    region,
    regionCode,
    city,
    latitude,
    longitude,
    timezone,
    currency: config.currency,
    language: config.locale.split('-')[0],
    ipAddress,
    accuracy,
    source,
  };
}

/**
 * Get localized content based on geolocation
 */
export function getLocalizedContent(geoLocation: GeoLocation): LocalizedContent {
  const config = COUNTRY_CONFIGS[geoLocation.countryCode] || FALLBACK_CONFIG;

  // Determine date and time formats based on locale
  const dateTimeFormats = getDateTimeFormats(config.locale);

  return {
    locale: config.locale,
    currency: config.currency,
    dateFormat: dateTimeFormats.date,
    timeFormat: dateTimeFormats.time,
    emergencyNumber: config.emergencyServices.unified,
    legalFramework: config.legalFramework,
    taxSystem: getTaxSystemInfo(geoLocation.countryCode),
    dataProtectionLaws: config.dataProtectionLaws,
    trustedInstitutions: config.trustedInstitutions,
    localServices: getLocalServices(geoLocation),
  };
}

/**
 * Get emergency services based on location
 */
export function getEmergencyServices(geoLocation: GeoLocation): EmergencyServices {
  const config = COUNTRY_CONFIGS[geoLocation.countryCode] || FALLBACK_CONFIG;
  return config.emergencyServices;
}

/**
 * Get date and time formats for locale
 */
function getDateTimeFormats(locale: string): { date: string; time: string } {
  const formats: Record<string, { date: string; time: string }> = {
    'sk-SK': { date: 'dd.MM.yyyy', time: 'HH:mm' },
    'cs-CZ': { date: 'dd.MM.yyyy', time: 'HH:mm' },
    'de-AT': { date: 'dd.MM.yyyy', time: 'HH:mm' },
    'de-DE': { date: 'dd.MM.yyyy', time: 'HH:mm' },
    'hu-HU': { date: 'yyyy.MM.dd', time: 'HH:mm' },
    'pl-PL': { date: 'dd.MM.yyyy', time: 'HH:mm' },
    'en-GB': { date: 'dd/MM/yyyy', time: 'HH:mm' },
  };

  return formats[locale] || formats['sk-SK'];
}

/**
 * Get tax system information
 */
function getTaxSystemInfo(countryCode: string): string {
  const taxSystems: Record<string, string> = {
    SK: 'Slovak Income Tax System',
    CZ: 'Czech Income Tax System',
    AT: 'Austrian Income Tax System',
    DE: 'German Income Tax System',
    HU: 'Hungarian Income Tax System',
    PL: 'Polish Income Tax System',
    GB: 'UK Income Tax and National Insurance',
  };

  return taxSystems[countryCode] || 'Local Tax System';
}

/**
 * Get local services (placeholder - would integrate with APIs)
 */
function getLocalServices(geoLocation: GeoLocation): LocalizedContent['localServices'] {
  // In production, this would integrate with local APIs to get actual services
  return {
    lawyers: [`Local Legal Services in ${geoLocation.city}`],
    notaries: [`Notary Services in ${geoLocation.city}`],
    banks: [`Banking Services in ${geoLocation.city}`],
    hospitals: [`Medical Services in ${geoLocation.city}`],
  };
}

/**
 * Middleware function for geo/IP localization
 */
export function geoLocalizationMiddleware(request: NextRequest) {
  const response = NextResponse.next();

  try {
    // Extract geolocation
    const geoLocation = extractGeoLocation(request);

    // Get localized content
    const localizedContent = getLocalizedContent(geoLocation);
    const emergencyServices = getEmergencyServices(geoLocation);

    // Set headers for client-side access
    response.headers.set('x-geo-country', geoLocation.countryCode);
    response.headers.set('x-geo-region', geoLocation.region);
    response.headers.set('x-geo-city', geoLocation.city);
    response.headers.set('x-geo-currency', geoLocation.currency);
    response.headers.set('x-geo-language', geoLocation.language);
    response.headers.set('x-geo-timezone', geoLocation.timezone);
    response.headers.set('x-geo-emergency', emergencyServices.unified);
    response.headers.set('x-geo-locale', localizedContent.locale);

    // Store full data in cookies for client access (encoded)
    const geoData = {
      location: geoLocation,
      content: localizedContent,
      emergency: emergencyServices,
      timestamp: new Date().toISOString(),
    };

    response.cookies.set('geo-data', btoa(JSON.stringify(geoData)), {
      maxAge: 60 * 60 * 24, // 24 hours
      httpOnly: false, // Allow client access
      secure: config.isProd,
      sameSite: 'lax',
    });

    // Log for analytics (optional)
    console.log('Geo localization:', {
      ip: geoLocation.ipAddress,
      country: geoLocation.countryCode,
      city: geoLocation.city,
      source: geoLocation.source,
      accuracy: geoLocation.accuracy,
    });

  } catch (error) {
    console.error('Geo localization middleware error:', error);
    // Continue without geo data on error
  }

  return response;
}

/**
 * Client-side hook to access geo data
 */
export function useGeoLocalization() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const geoCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('geo-data='))
      ?.split('=')[1];

    if (!geoCookie) {
      return null;
    }

    const geoData = JSON.parse(atob(geoCookie));
    return geoData;
  } catch (error) {
    console.error('Error reading geo data:', error);
    return null;
  }
}

/**
 * Utility to format currency based on geo location
 */
export function formatCurrency(amount: number, geoLocation?: GeoLocation): string {
  const currency = geoLocation?.currency || 'EUR';
  const locale = geoLocation ?
    COUNTRY_CONFIGS[geoLocation.countryCode]?.locale || 'sk-SK' :
    'sk-SK';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  } catch (error) {
    // Fallback formatting
    return `${amount.toFixed(2)} ${currency}`;
  }
}

/**
 * Utility to format date based on geo location
 */
export function formatDate(date: Date, geoLocation?: GeoLocation): string {
  const locale = geoLocation ?
    COUNTRY_CONFIGS[geoLocation.countryCode]?.locale || 'sk-SK' :
    'sk-SK';

  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  } catch (error) {
    // Fallback formatting
    return date.toLocaleDateString();
  }
}

/**
 * Utility to format time based on geo location
 */
export function formatTime(date: Date, geoLocation?: GeoLocation): string {
  const locale = geoLocation ?
    COUNTRY_CONFIGS[geoLocation.countryCode]?.locale || 'sk-SK' :
    'sk-SK';

  try {
    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (error) {
    // Fallback formatting
    return date.toLocaleTimeString();
  }
}