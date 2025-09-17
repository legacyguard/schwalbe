import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { getDocument, updateDocument } from '../api/documentApi';
import { useParams, Link } from 'react-router-dom';
export function DocumentDetail() {
    const { id } = useParams();
    const [doc, setDoc] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    React.useEffect(() => {
        let mounted = true;
        (async () => {
            if (!id)
                return;
            setLoading(true);
            try {
                const d = await getDocument(id);
                if (mounted)
                    setDoc(d);
            }
            finally {
                if (mounted)
                    setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [id]);
    if (loading)
        return _jsx("div", { className: "p-6 text-white", children: "Loading\u2026" });
    if (!doc)
        return _jsx("div", { className: "p-6 text-white", children: "Not found" });
    const title = doc.title || doc.file_name;
    const exp = doc.expiration_date || (doc.expires_at ? new Date(doc.expires_at).toISOString().slice(0, 10) : null);
    const [saving, setSaving] = React.useState(false);
    const [edit, setEdit] = React.useState({});
    const onAccept = async () => {
        if (!doc)
            return;
        setSaving(true);
        try {
            const patch = {};
            if (edit.title != null)
                patch.title = edit.title;
            if (edit.category != null)
                patch.category = edit.category;
            if (edit.expiration_date != null) {
                patch.expiration_date = edit.expiration_date;
                patch.expires_at = new Date(`${edit.expiration_date}T09:00:00.000Z`).toISOString();
            }
            const updated = await updateDocument(doc.id, patch);
            setDoc(updated);
        }
        finally {
            setSaving(false);
        }
    };
    return (_jsxs("div", { className: "max-w-4xl mx-auto p-6 text-white", children: [_jsx("div", { className: "mb-4", children: _jsx(Link, { to: "/documents", className: "underline text-sky-300", children: "\u2190 Back to Documents" }) }), _jsx("h1", { className: "text-2xl font-semibold mb-1", children: title }), _jsxs("div", { className: "text-slate-300 mb-4", children: [doc.category || 'Uncategorized', " \u2022 Uploaded ", new Date(doc.created_at).toLocaleString()] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "md:col-span-2 space-y-4", children: [_jsxs("div", { className: "border border-slate-700 rounded p-3", children: [_jsx("div", { className: "font-medium mb-2", children: "Extracted Text (OCR)" }), _jsx("pre", { className: "whitespace-pre-wrap text-sm text-slate-200", children: doc.ocr_text || doc.ai_extracted_text || 'No text extracted.' })] }), _jsxs("div", { className: "border border-slate-700 rounded p-3", children: [_jsx("div", { className: "font-medium mb-2", children: "Metadata" }), _jsxs("div", { className: "text-sm text-slate-300", children: ["File: ", doc.file_name, " (", Math.round((doc.file_size || 0) / 1024), " KB)"] }), _jsxs("div", { className: "text-sm text-slate-300", children: ["Type: ", doc.file_type || 'n/a'] }), exp ? _jsxs("div", { className: "text-sm text-slate-300", children: ["Expiration: ", exp] }) : null, Array.isArray(doc.ai_suggested_tags) && doc.ai_suggested_tags.length > 0 ? (_jsxs("div", { className: "text-sm text-slate-300", children: ["Tags: ", doc.ai_suggested_tags.join(', ')] })) : null] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "border border-slate-700 rounded p-3", children: [_jsx("div", { className: "font-medium mb-2", children: "Analysis" }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "block text-sm", children: "Title" }), _jsx("input", { className: "w-full rounded bg-slate-800 border border-slate-700 p-2", defaultValue: doc.title || '', onChange: (e) => setEdit(s => ({ ...s, title: e.target.value })) }), _jsx("label", { className: "block text-sm", children: "Category" }), _jsx("input", { className: "w-full rounded bg-slate-800 border border-slate-700 p-2", defaultValue: doc.category || '', onChange: (e) => setEdit(s => ({ ...s, category: e.target.value })) }), _jsx("label", { className: "block text-sm", children: "Expiration (YYYY-MM-DD)" }), _jsx("input", { className: "w-full rounded bg-slate-800 border border-slate-700 p-2", defaultValue: exp || '', onChange: (e) => setEdit(s => ({ ...s, expiration_date: e.target.value })) }), _jsx("button", { disabled: saving, className: "mt-2 px-3 py-2 rounded bg-slate-700 hover:bg-slate-600", onClick: onAccept, children: saving ? 'Saving…' : 'Save' })] }), _jsxs("div", { className: "text-sm text-slate-300", children: ["Category: ", doc.category || '—', " ", doc.classification_confidence != null ? `(${Math.round(doc.classification_confidence * 100)}%)` : ''] }), _jsxs("div", { className: "text-sm text-slate-300", children: ["Title: ", doc.title || '—', " ", doc.ai_confidence != null ? `(${Math.round(doc.ai_confidence * 100)}%)` : ''] }), doc.ai_reasoning ? (_jsxs("details", { className: "mt-2", children: [_jsx("summary", { className: "cursor-pointer text-sm text-slate-200", children: "Reasoning" }), _jsx("pre", { className: "whitespace-pre-wrap text-xs text-slate-300", children: JSON.stringify(doc.ai_reasoning, null, 2) })] })) : null] }), _jsxs("div", { className: "border border-slate-700 rounded p-3", children: [_jsx("div", { className: "font-medium mb-2", children: "Status" }), _jsx("div", { className: "text-sm text-slate-300 capitalize", children: doc.processing_status })] })] })] })] }));
}
