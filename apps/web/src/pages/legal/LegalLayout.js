import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function LegalLayout({ lang, title, children }) {
    return (_jsxs("div", { className: "container mx-auto px-4 py-10 text-slate-200", children: [_jsx("h1", { className: "text-3xl font-semibold mb-4", children: title }), _jsx("div", { className: "prose prose-invert max-w-none", children: children }), _jsx("div", { className: "mt-8 text-xs opacity-60", children: _jsxs("p", { children: [lang === 'en' && 'This content is provided for information purposes and does not constitute legal advice.', lang === 'cs' && 'Tento obsah je pouze informativní a nepředstavuje právní poradenství.', lang === 'sk' && 'Tento obsah má informatívny charakter a nepredstavuje právne poradenstvo.'] }) })] }));
}
