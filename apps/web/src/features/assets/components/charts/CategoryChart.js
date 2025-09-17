import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function CategoryChart({ data }) {
    const max = Math.max(1, ...data.map(d => d.value));
    return (_jsxs("div", { role: "img", "aria-label": "Asset value by category", className: "space-y-2", children: [data.map(d => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-32 text-zinc-300 text-sm", children: d.label }), _jsx("div", { className: "flex-1 bg-zinc-800 rounded h-3", children: _jsx("div", { className: "bg-emerald-500 h-3 rounded", style: { width: `${(d.value / max) * 100}%` }, "aria-valuemin": 0, "aria-valuemax": max, "aria-valuenow": d.value }) }), _jsx("div", { className: "w-24 text-right text-zinc-400 text-sm", children: d.value.toLocaleString() })] }, d.label))), data.length === 0 && _jsx("div", { className: "text-zinc-400 text-sm", children: "No data" })] }));
}
