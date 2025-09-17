import { type LocaleCode } from '@schwalbe/shared';
export declare function getCurrentHost(): string;
export declare function getAllowedLanguagesForCurrentHost(): LocaleCode[];
export declare function computePreferredLocaleFromBrowser(): LocaleCode;
export declare function safeSetLocalStorage(key: string, value: string): void;
export declare function safeGetLocalStorage(key: string): string | null;
//# sourceMappingURL=locale.d.ts.map