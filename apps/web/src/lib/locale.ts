// apps/web/src/lib/locale.ts
// Browser helpers for locale selection and domain language menus

import { computePreferredLocale, getAllowedLanguagesForHost, type LocaleCode } from '@schwalbe/shared'

export function getCurrentHost(): string {
  if (typeof window !== 'undefined' && window.location) return window.location.hostname
  return ''
}

export function getAllowedLanguagesForCurrentHost(): LocaleCode[] {
  return getAllowedLanguagesForHost(getCurrentHost())
}

export function computePreferredLocaleFromBrowser(): LocaleCode {
  const userPreferred = safeGetLocalStorage('lg.lang') || safeGetLocalStorage('lang')
  const deviceLocales = typeof navigator !== 'undefined' ? navigator.languages : []
  return computePreferredLocale({ host: getCurrentHost(), userPreferred, deviceLocales })
}

export function safeSetLocalStorage(key: string, value: string): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, value)
  } catch {}
}

export function safeGetLocalStorage(key: string): string | null {
  try {
    if (typeof localStorage !== 'undefined') return localStorage.getItem(key)
  } catch {}
  return null
}