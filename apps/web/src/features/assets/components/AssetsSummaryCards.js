import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAssetsSummary } from '../state/useAssets';
export function AssetsSummaryCards() {
    const { summary, loading } = useAssetsSummary();
    if (loading)
        return _jsx("div", { "aria-busy": "true", children: "Loading summaries..." });
    return (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-6", children: [_jsxs("div", { className: "bg-zinc-900/60 rounded p-4", children: [_jsx("div", { className: "text-sm text-zinc-400", children: "Total assets" }), _jsx("div", { className: "text-3xl font-medium", children: summary.totalCount })] }), _jsxs("div", { className: "bg-zinc-900/60 rounded p-4", children: [_jsx("div", { className: "text-sm text-zinc-400", children: "Total estimated value" }), _jsx("div", { className: "text-3xl font-medium", children: summary.totalValue.toLocaleString(undefined, { style: 'currency', currency: summary.currency || 'USD' }) })] }), _jsxs("div", { className: "bg-zinc-900/60 rounded p-4", children: [_jsx("div", { className: "text-sm text-zinc-400", children: "Categories" }), _jsx("div", { className: "text-3xl font-medium", children: summary.categoryCount })] })] }));
}
