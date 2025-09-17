import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, Globe } from 'lucide-react';
import { COUNTRY_DOMAINS, getEnabledDomains, DEFAULT_COUNTRY, } from '@schwalbe/shared';
import { getDomainByHost } from '@schwalbe/shared';
import { getCurrentHost } from '@/lib/locale';
import { redirectToCountryOrSimulate } from '@/lib/utils/redirect-guard';
import { RedirectSimulationModal } from '@/components/modals/RedirectSimulationModal';
export function CountryMenu() {
    const [open, setOpen] = useState(false);
    const [simOpen, setSimOpen] = useState(false);
    const [simTargets, setSimTargets] = useState([]);
    const enabled = useMemo(() => new Set(getEnabledDomains().map((c) => c.code)), []);
    const items = useMemo(() => {
        const list = [...COUNTRY_DOMAINS];
        // Sort: enabled first, then by name
        return list.sort((a, b) => {
            const ae = a.enabled ? 0 : 1;
            const be = b.enabled ? 0 : 1;
            if (ae !== be)
                return ae - be;
            return a.name.localeCompare(b.name);
        });
    }, []);
    const currentCountry = useMemo(() => {
        const host = getCurrentHost();
        const dom = getDomainByHost(host);
        if (dom)
            return dom.code;
        return DEFAULT_COUNTRY;
    }, []);
    const handleSelect = (code) => {
        const outcome = redirectToCountryOrSimulate(code);
        setOpen(false);
        if (!outcome.didRedirect && outcome.simulationTargets) {
            setSimTargets(outcome.simulationTargets);
            setSimOpen(true);
        }
    };
    return (_jsxs("div", { className: "relative", children: [_jsxs(Button, { "aria-haspopup": "menu", "aria-expanded": open, "aria-label": "Select country domain", className: "text-slate-200 hover:text-white hover:bg-slate-800/50 px-2 py-1 rounded", onClick: () => setOpen((v) => !v), children: [_jsx(Globe, { className: "w-4 h-4 mr-2" }), _jsx("span", { children: "Country" }), _jsx(ChevronDown, { className: "w-4 h-4 ml-1 opacity-70" })] }), open && (_jsxs("div", { role: "menu", "aria-label": "Country menu", className: "absolute right-0 mt-2 w-64 rounded-md border border-slate-700 bg-slate-900/95 backdrop-blur-sm shadow-lg p-2 z-50 max-h-80 overflow-auto", children: [_jsx("div", { className: "text-xs uppercase text-slate-400 px-2 pb-1", children: "European Union" }), _jsx("ul", { className: "space-y-1", children: items.map((c) => {
                            const isEnabled = enabled.has(c.code);
                            return (_jsx("li", { children: _jsxs("button", { role: "menuitem", "aria-current": currentCountry === c.code ? 'true' : undefined, disabled: !isEnabled, onClick: () => isEnabled && handleSelect(c.code), className: 'w-full text-left px-3 py-2 rounded text-sm flex items-center justify-between ' +
                                        (currentCountry === c.code
                                            ? 'bg-slate-800 text-white border border-slate-600 '
                                            : '') +
                                        (isEnabled
                                            ? 'text-slate-200 hover:bg-slate-800 hover:text-white'
                                            : 'text-slate-500 cursor-not-allowed'), children: [_jsxs("span", { children: [c.name, currentCountry === c.code ? (_jsx("span", { className: "ml-2 text-[10px] uppercase text-slate-300", children: "current" })) : null] }), _jsx("span", { className: "text-xs text-slate-400", children: c.host })] }) }, c.code));
                        }) })] })), _jsx(RedirectSimulationModal, { open: simOpen, onOpenChange: setSimOpen, targets: simTargets })] }));
}
