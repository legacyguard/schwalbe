/**
 * i18n configuration for all 34 supported languages
 */

export const languages = [
  "en",
  "bg",
  "hr",
  "cs",
  "da",
  "nl",
  "et",
  "fi",
  "fr",
  "de",
  "el",
  "hu",
  "ga",
  "it",
  "lv",
  "lt",
  "mt",
  "pl",
  "pt",
  "ro",
  "sk",
  "sl",
  "es",
  "sv",
  "no",
  "is",
  "tr",
  "sr",
  "sq",
  "mk",
  "me",
  "bs",
  "ru",
  "uk"
] as const;

export type Language = typeof languages[number];

export const languageNames: Record<Language, string> = {
  "en": "English",
  "bg": "Bulgarian",
  "hr": "Croatian",
  "cs": "Czech",
  "da": "Danish",
  "nl": "Dutch",
  "et": "Estonian",
  "fi": "Finnish",
  "fr": "French",
  "de": "German",
  "el": "Greek",
  "hu": "Hungarian",
  "ga": "Irish",
  "it": "Italian",
  "lv": "Latvian",
  "lt": "Lithuanian",
  "mt": "Maltese",
  "pl": "Polish",
  "pt": "Portuguese",
  "ro": "Romanian",
  "sk": "Slovak",
  "sl": "Slovenian",
  "es": "Spanish",
  "sv": "Swedish",
  "no": "Norwegian",
  "is": "Icelandic",
  "tr": "Turkish",
  "sr": "Serbian",
  "sq": "Albanian",
  "mk": "Macedonian",
  "me": "Montenegrin",
  "bs": "Bosnian",
  "ru": "Russian",
  "uk": "Ukrainian"
};

export const defaultLanguage: Language = 'en';

export function getLanguageName(code: Language): string {
  return languageNames[code] || code;
}

export const locales = languages;
export type Locale = Language;
