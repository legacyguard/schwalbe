// apps/web/src/lib/locale.ts
// Browser helpers for locale selection and domain language menus
import { computePreferredLocale, getAllowedLanguagesForHost } from '@schwalbe/shared';
export function getCurrentHost() {
    if (typeof window !== 'undefined' && window.location)
        return window.location.hostname;
    return '';
}
export function getAllowedLanguagesForCurrentHost() {
    return getAllowedLanguagesForHost(getCurrentHost());
}
export function computePreferredLocaleFromBrowser() {
    const userPreferred = safeGetLocalStorage('lg.lang') || safeGetLocalStorage('lang');
    const deviceLocales = typeof navigator !== 'undefined' ? navigator.languages : [];
    return computePreferredLocale({ host: getCurrentHost(), userPreferred, deviceLocales });
}
export function safeSetLocalStorage(key, value) {
    try {
        if (typeof localStorage !== 'undefined')
            localStorage.setItem(key, value);
    }
    catch {
        // no-op: localStorage not available
    }
}
export function safeGetLocalStorage(key) {
    try {
        if (typeof localStorage !== 'undefined')
            return localStorage.getItem(key);
    }
    catch {
        // no-op: localStorage not available
    }
    return null;
}
