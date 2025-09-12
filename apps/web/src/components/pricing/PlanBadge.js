import { jsx as _jsx } from "react/jsx-runtime";
export function PlanBadge({ children }) {
    return (_jsx("span", { style: {
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: 9999,
            background: '#111827',
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
        }, children: children }));
}
