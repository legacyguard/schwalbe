import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function computePreferredLocaleFromBrowser(browserLanguages: readonly string[] = []): string {
  const supportedLocales = ['en', 'cs', 'sk'];
  
  // Try to find a full match first
  const fullMatch = browserLanguages.find(lang => 
    supportedLocales.includes(lang.toLowerCase())
  );
  if (fullMatch) return fullMatch.toLowerCase();

  // Try to match language part only
  const languageMatch = browserLanguages.find(lang => 
    supportedLocales.includes(lang.split('-')[0].toLowerCase())
  );
  if (languageMatch) return languageMatch.split('-')[0].toLowerCase();

  // Default to English
  return 'en';
}
