import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { supabase } from '@/lib/supabase';
export function Billing() {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const openPortal = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase.functions.invoke('create-billing-portal-session', { body: {} });
            if (error)
                throw error;
            const url = data?.url;
            if (url) {
                window.location.href = url;
            }
            else {
                throw new Error('No portal URL');
            }
        }
        catch {
            setError('Failed to open billing portal');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "max-w-3xl mx-auto p-6 text-white", children: [_jsx("h1", { className: "text-2xl font-semibold mb-4", children: "Billing" }), _jsx("p", { className: "text-slate-300 mb-4", children: "Manage your payment methods, invoices and subscription." }), error ? _jsx("div", { className: "text-red-400 mb-3", children: error }) : null, _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { className: "bg-sky-600 hover:bg-sky-500 px-3 py-1 rounded disabled:opacity-50", onClick: openPortal, disabled: loading, children: loading ? 'Opening…' : 'Open Billing Portal' }), _jsx("a", { href: "/account/billing/details", className: "text-slate-300 hover:text-white underline", children: "Edit billing details" })] })] }));
}
