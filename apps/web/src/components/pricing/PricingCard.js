import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function PricingCard({ plan, price, period = '', features = [], highlight, ctaLabel = 'Choose Plan', onSelect }) {
    return (_jsxs("div", { style: {
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            padding: 16,
            background: highlight ? '#f0f9ff' : '#fff',
        }, children: [_jsx("div", { style: { fontWeight: 700, fontSize: 18 }, children: plan }), _jsxs("div", { style: { marginTop: 6, fontSize: 28, fontWeight: 800 }, children: [price, " ", _jsx("span", { style: { fontSize: 14, color: '#6b7280' }, children: period })] }), _jsx("ul", { style: { marginTop: 12, paddingLeft: 16 }, children: features.map((f, i) => (_jsx("li", { style: { marginBottom: 6 }, children: f }, i))) }), _jsx("button", { type: "button", onClick: onSelect, style: {
                    marginTop: 12,
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #0ea5e9',
                    background: '#0ea5e9',
                    color: '#fff',
                    cursor: 'pointer',
                }, children: ctaLabel })] }));
}
