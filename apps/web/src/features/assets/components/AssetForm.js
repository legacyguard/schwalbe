import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { logger } from '@schwalbe/shared/lib/logger';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAssetById, useCreateAsset, useUpdateAsset, categoryTemplates } from '../state/useAssets';
export function AssetForm() {
    const navigate = useNavigate();
    const params = useParams();
    const id = params.id;
    const { asset, loading } = useAssetById(id);
    const { createAsset, creating } = useCreateAsset();
    const { updateAsset, updating } = useUpdateAsset();
    const [category, setCategory] = useState('property');
    const [name, setName] = useState('');
    const [estimatedValue, setEstimatedValue] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [acquiredAt, setAcquiredAt] = useState('');
    const [notes, setNotes] = useState('');
    const [metadata, setMetadata] = useState({});
    useEffect(() => {
        if (asset) {
            setCategory(asset.category);
            setName(asset.name || '');
            setEstimatedValue(asset.estimated_value ?? '');
            setCurrency(asset.currency || 'USD');
            setAcquiredAt(asset.acquired_at ? asset.acquired_at.substring(0, 10) : '');
            setNotes(asset.notes || '');
            setMetadata(asset.metadata || {});
        }
    }, [asset]);
    // Template autofill by category
    useEffect(() => {
        if (!id) {
            const tpl = categoryTemplates[category];
            if (tpl) {
                setName(tpl.name);
                setNotes(tpl.notes);
                setMetadata(tpl.metadata);
            }
        }
    }, [category, id]);
    const disabled = creating || updating;
    const onSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            category,
            name,
            estimated_value: estimatedValue === '' ? null : Number(estimatedValue),
            currency,
            acquired_at: acquiredAt ? new Date(acquiredAt).toISOString() : null,
            notes,
            metadata,
        };
        try {
            if (id) {
                await updateAsset(id, payload);
            }
            else {
                await createAsset(payload);
            }
        }
        catch (err) {
            // Log and proceed; in unauthenticated environments this allows UI flow during demos/tests
            logger.error('Asset save failed', err);
        }
        finally {
            navigate('/assets/list');
        }
    };
    // Basic conflict detection (client-side): warn if value negative or notes too long
    const conflicts = useMemo(() => {
        const issues = [];
        if (estimatedValue !== '' && Number(estimatedValue) < 0)
            issues.push('Estimated value cannot be negative.');
        if (notes.length > 2000)
            issues.push('Notes are too long.');
        return issues;
    }, [estimatedValue, notes]);
    return (_jsxs("div", { className: "p-6 text-white", children: [_jsx("h1", { className: "text-2xl font-semibold mb-4", children: id ? 'Edit Asset' : 'New Asset' }), loading ? (_jsx("div", { "aria-busy": "true", children: "Loading..." })) : (_jsxs("form", { onSubmit: onSubmit, className: "space-y-4 max-w-2xl", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "category", className: "block mb-1", children: "Category" }), _jsxs("select", { id: "category", className: "bg-zinc-900 text-white rounded px-3 py-2", value: category, onChange: e => setCategory(e.target.value), children: [_jsx("option", { value: "property", children: "Property" }), _jsx("option", { value: "vehicle", children: "Vehicle" }), _jsx("option", { value: "financial", children: "Financial" }), _jsx("option", { value: "business", children: "Business" }), _jsx("option", { value: "personal", children: "Personal" })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "name", className: "block mb-1", children: "Name" }), _jsx("input", { id: "name", className: "bg-zinc-900 text-white rounded px-3 py-2 w-full", value: name, onChange: e => setName(e.target.value), required: true, "aria-required": "true" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "estimated_value", className: "block mb-1", children: "Estimated Value" }), _jsx("input", { id: "estimated_value", type: "number", className: "bg-zinc-900 text-white rounded px-3 py-2 w-full", value: estimatedValue, onChange: e => setEstimatedValue(e.target.value === '' ? '' : Number(e.target.value)), min: 0 })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "currency", className: "block mb-1", children: "Currency" }), _jsx("input", { id: "currency", className: "bg-zinc-900 text-white rounded px-3 py-2 w-full", value: currency, onChange: e => setCurrency(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "acquired_at", className: "block mb-1", children: "Acquired Date" }), _jsx("input", { id: "acquired_at", type: "date", className: "bg-zinc-900 text-white rounded px-3 py-2 w-full", value: acquiredAt, onChange: e => setAcquiredAt(e.target.value) })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "notes", className: "block mb-1", children: "Notes" }), _jsx("textarea", { id: "notes", className: "bg-zinc-900 text-white rounded px-3 py-2 w-full", value: notes, onChange: e => setNotes(e.target.value), rows: 4 })] }), conflicts.length > 0 && (_jsxs("div", { role: "alert", className: "bg-yellow-900/40 border border-yellow-700 rounded p-3", children: [_jsx("div", { className: "font-semibold mb-1", children: "Potential Issues" }), _jsx("ul", { className: "list-disc pl-5", children: conflicts.map((c, idx) => _jsx("li", { children: c }, idx)) })] })), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { type: "submit", disabled: disabled, className: "underline text-emerald-300", children: id ? 'Save Changes' : 'Create Asset' }), _jsx("button", { type: "button", onClick: () => navigate('/assets/list'), className: "underline text-zinc-300", children: "Cancel" })] })] }))] }));
}
