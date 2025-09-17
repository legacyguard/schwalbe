import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { LegacyGuardLogo } from '@/components/LegacyGuardLogo';
import { Button } from '@/components/ui/button';
import { ChevronDown, Languages } from 'lucide-react';
import i18n from '@/lib/i18n';
import { getAllowedLanguagesForCurrentHost, safeSetLocalStorage } from '@/lib/locale';
import { getLanguageLabel, normalizeLocale } from '../../../../../packages/shared/src/config/languages';
import { CountryMenu } from './CountryMenu';
import { SearchBox } from './SearchBox';
import { UserIcon } from './UserIcon';
function LanguageSwitcher() {
    const [open, setOpen] = useState(false);
    const allowed = useMemo(() => getAllowedLanguagesForCurrentHost(), []);
    const current = normalizeLocale(i18n.language) || 'en';
    const onSelect = (code) => {
        if (code === current) {
            setOpen(false);
            return;
        }
        i18n.changeLanguage(code);
        safeSetLocalStorage('lg.lang', code);
        setOpen(false);
    };
    return (_jsxs("div", { className: "relative", children: [_jsxs(Button, { "aria-haspopup": "menu", "aria-expanded": open, "aria-label": "Change language", className: "text-slate-200 hover:text-white hover:bg-slate-800/50 px-2 py-1 rounded", onClick: () => setOpen((v) => !v), children: [_jsx(Languages, { className: "w-4 h-4 mr-2" }), _jsx("span", { children: getLanguageLabel(current) }), _jsx(ChevronDown, { className: "w-4 h-4 ml-1 opacity-70" })] }), open && (_jsx("div", { role: "menu", "aria-label": "Language menu", className: "absolute right-0 mt-2 w-44 rounded-md border border-slate-700 bg-slate-900/95 backdrop-blur-sm shadow-lg p-1 z-50", children: allowed.map((code) => (_jsxs("button", { role: "menuitemradio", "aria-checked": current === code, onClick: () => onSelect(code), className: 'w-full text-left px-3 py-2 rounded text-sm ' +
                        (current === code
                            ? 'bg-slate-800 text-white'
                            : 'text-slate-200 hover:bg-slate-800 hover:text-white'), children: [_jsx("span", { className: "mr-2", children: getLanguageLabel(code) }), current === code ? _jsx("span", { className: "sr-only", children: "(selected)" }) : null] }, code))) }))] }));
}
export function TopBar() {
    return (_jsx("header", { className: "absolute top-0 left-0 right-0 z-50 bg-slate-900/30 backdrop-blur-sm border-b border-slate-700/30", children: _jsx("nav", { className: "container mx-auto px-4 py-4", "aria-label": "Global", children: _jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(LegacyGuardLogo, {}), _jsx("span", { className: "text-2xl font-bold text-white font-heading", children: "LegacyGuard" })] }), _jsxs("div", { className: "flex items-center gap-2 sm:gap-3", children: [_jsx("div", { className: "hidden md:block", children: _jsx(SearchBox, {}) }), _jsx("a", { href: "/support", className: "text-slate-200 hover:text-white hover:bg-slate-800/50 px-2 py-1 rounded", "aria-label": "Support", children: "Support" }), _jsx("a", { href: "/account/billing", className: "text-slate-200 hover:text-white hover:bg-slate-800/50 px-2 py-1 rounded", "aria-label": "Billing", children: "Billing" }), _jsx(LanguageSwitcher, {}), _jsx(CountryMenu, {}), _jsx("a", { href: "/reminders", "aria-label": "Open Reminders", className: "text-slate-200 hover:text-white hover:bg-slate-800/50 px-2 py-1 rounded", children: _jsx("span", { role: "img", "aria-hidden": "true", children: "\uD83D\uDD14" }) }), _jsx("a", { href: "/account/export", className: "text-slate-200 hover:text-white hover:bg-slate-800/50 px-2 py-1 rounded", "aria-label": "Export data", children: "Export" }), _jsx("a", { href: "/account/delete", className: "text-red-300 hover:text-white hover:bg-red-900/30 px-2 py-1 rounded", "aria-label": "Delete account", children: "Delete" }), _jsx(UserIcon, {})] })] }) }) }));
}
