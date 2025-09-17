import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { useAssetsSummary } from '../state/useAssets';
import { CategoryChart } from './charts/CategoryChart';
import { ConflictReport } from './ConflictReport';
import { AssetsSummaryCards } from './AssetsSummaryCards';
export function AssetsDashboard() {
    const { summary, loading, error } = useAssetsSummary();
    return (_jsxs("div", { className: "p-6 text-white", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Assets" }), _jsx(Link, { "aria-label": "Create new asset", to: "/assets/new", className: "underline text-emerald-300", children: "New Asset" })] }), error && (_jsx("div", { role: "alert", className: "text-red-300 mb-4", children: String(error) })), loading ? (_jsx("div", { "aria-busy": "true", "aria-live": "polite", children: "Loading..." })) : (_jsxs(_Fragment, { children: [_jsx(AssetsSummaryCards, {}), _jsxs("div", { className: "bg-zinc-900/60 rounded p-4", children: [_jsx("h2", { className: "text-lg font-semibold mb-2", children: "By Category" }), _jsx(CategoryChart, { data: summary.byCategory })] }), _jsx(ConflictReport, {}), _jsx("div", { className: "mt-6", children: _jsx(Link, { to: "/assets/list", className: "underline text-sky-300", children: "Go to list" }) })] }))] }));
}
