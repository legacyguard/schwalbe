import { jsx as _jsx } from "react/jsx-runtime";
export function UrgencyBadge({ children = 'Limited seats' }) {
    return (_jsx("span", { style: {
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: 6,
            background: '#fef3c7',
            color: '#92400e',
            fontSize: 12,
            fontWeight: 600,
            border: '1px solid #f59e0b'
        }, children: children }));
}
