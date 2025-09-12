import { jsx as _jsx } from "react/jsx-runtime";
import { PricingCard } from './PricingCard';
export function PricingGrid({ plans }) {
    return (_jsx("div", { style: { display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }, children: plans.map((p, i) => (_jsx(PricingCard, { ...p }, i))) }));
}
