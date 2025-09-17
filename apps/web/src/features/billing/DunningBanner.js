import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { subscriptionService } from '@schwalbe/shared';
export function DunningBanner() {
    const [show, setShow] = React.useState(false);
    React.useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const sub = await subscriptionService.getCurrentSubscription();
                if (!mounted)
                    return;
                setShow(!!sub && sub.status === 'past_due');
            }
            catch {
                // no-op
            }
        })();
        return () => { mounted = false; };
    }, []);
    if (!show)
        return null;
    return (_jsx("div", { className: "fixed top-0 left-0 right-0 z-[60]", children: _jsx("div", { className: "mx-auto max-w-5xl mt-2", children: _jsx("div", { className: "bg-amber-100 border border-amber-300 text-amber-900 rounded px-4 py-3 shadow", children: _jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx("div", { className: "font-semibold", children: "Payment issue" }), _jsx("div", { className: "text-sm", children: "We could not process your payment. Please update your payment method to restore full access." })] }), _jsx("a", { className: "inline-flex items-center px-3 py-1 rounded bg-amber-500 text-white hover:bg-amber-600", href: "/account/billing", children: "Open Billing Portal" })] }) }) }) }));
}
