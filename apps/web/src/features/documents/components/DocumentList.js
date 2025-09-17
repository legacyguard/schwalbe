import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { listDocuments } from '../api/documentApi';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
export function DocumentList() {
    const [items, setItems] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const navigate = useNavigate();
    React.useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            try {
                const docs = await listDocuments();
                if (mounted)
                    setItems(docs);
            }
            finally {
                if (mounted)
                    setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);
    return (_jsxs("div", { className: "max-w-4xl mx-auto p-6 text-white", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Documents" }), _jsx(Button, { onClick: () => navigate('/documents/new'), children: "Upload" })] }), loading ? (_jsx("p", { children: "Loading\u2026" })) : items.length === 0 ? (_jsx("div", { className: "text-slate-300", children: "No documents yet. Click Upload to add one." })) : (_jsx("ul", { className: "divide-y divide-slate-700 border border-slate-700 rounded", children: items.map((d) => {
                    const title = d.title || d.file_name;
                    const status = d.processing_status;
                    const exp = d.expiration_date || (d.expires_at ? new Date(d.expires_at).toISOString().slice(0, 10) : null);
                    return (_jsx("li", { className: "p-3 hover:bg-slate-900", children: _jsxs(Link, { to: `/documents/${d.id}`, className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: title }), _jsxs("div", { className: "text-xs text-slate-400", children: [d.category || 'Uncategorized', " \u2022 ", new Date(d.created_at).toLocaleString()] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [exp ? _jsxs("span", { className: "text-xs px-2 py-1 rounded bg-slate-800 border border-slate-700", children: ["Expires: ", exp] }) : null, _jsx("span", { className: "text-xs px-2 py-1 rounded bg-slate-800 border border-slate-700", children: status })] })] }) }, d.id));
                }) }))] }));
}
