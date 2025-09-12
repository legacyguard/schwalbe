import { jsx as _jsx } from "react/jsx-runtime";
export function SnapshotButton({ label = 'Save Snapshot', disabled, onSnapshot }) {
    return (_jsx("button", { type: "button", onClick: onSnapshot, disabled: disabled, style: {
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid #ccc',
            background: disabled ? '#e5e7eb' : '#0ea5e9',
            color: disabled ? '#6b7280' : '#fff',
            cursor: disabled ? 'not-allowed' : 'pointer',
        }, title: "Create a local snapshot", children: label }));
}
