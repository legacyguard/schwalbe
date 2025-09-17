import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Progress({ currentIndex, labels, statuses }) {
    return (_jsx("nav", { "aria-label": "Wizard steps", className: "mb-4", children: _jsx("ol", { className: "flex flex-wrap gap-2", children: labels.map((label, i) => {
                const s = statuses?.[i];
                const stateClass = s && s.errors > 0
                    ? 'bg-red-900/50 border-red-700'
                    : s && s.warnings > 0
                        ? 'bg-yellow-900/40 border-yellow-700'
                        : i === currentIndex
                            ? 'bg-sky-600 border-sky-400'
                            : i < currentIndex
                                ? 'bg-slate-700 border-slate-600'
                                : 'bg-slate-900 border-slate-700';
                return (_jsxs("li", { className: "flex items-center", children: [_jsxs("div", { "aria-current": i === currentIndex ? 'step' : undefined, className: 'px-3 py-1 rounded-full text-sm border flex items-center gap-2 ' + stateClass, children: [_jsx("span", { children: label }), s && (s.errors > 0 || s.warnings > 0) && (_jsxs("span", { className: "inline-flex items-center gap-1 text-xs", children: [s.errors > 0 && (_jsx("span", { "aria-label": `${s.errors} errors`, className: "bg-red-800 text-red-100 px-1 rounded", children: s.errors })), s.warnings > 0 && (_jsx("span", { "aria-label": `${s.warnings} warnings`, className: "bg-yellow-800 text-yellow-100 px-1 rounded", children: s.warnings }))] }))] }), i < labels.length - 1 && _jsx("span", { className: "mx-2 text-slate-500", children: "\u2192" })] }, label));
            }) }) }));
}
