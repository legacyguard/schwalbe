import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAssets } from '../state/useAssets';
import { detectAssetConflicts } from '@schwalbe/logic/assets/conflicts';
export function ConflictReport() {
    const { assets, loading } = useAssets();
    if (loading)
        return null;
    const issues = detectAssetConflicts(assets);
    if (issues.length === 0)
        return null;
    return (_jsxs("div", { role: "region", "aria-label": "Asset conflicts", className: "mt-6 bg-rose-900/30 border border-rose-700 rounded p-4", children: [_jsx("div", { className: "font-semibold mb-2", children: "Conflict Report" }), _jsx("ul", { className: "list-disc pl-6", children: issues.map((i, idx) => (_jsx("li", { className: "text-rose-200", children: i.message }, idx))) })] }));
}
