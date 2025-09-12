import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function SnapshotHistoryList({ items, onSelect }) {
    return (_jsxs("div", { style: { display: 'grid', gap: 8 }, children: [items.map(item => (_jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid #e5e7eb',
                    padding: 10,
                    borderRadius: 8,
                    background: '#fff',
                }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontWeight: 600 }, children: item.label || 'Snapshot' }), _jsx("div", { style: { color: '#6b7280', fontSize: 12 }, children: new Date(item.timestamp).toLocaleString() })] }), onSelect && (_jsx("button", { type: "button", onClick: () => onSelect(item.id), style: { padding: '6px 10px', borderRadius: 6, border: '1px solid #ccc', background: '#f3f4f6' }, children: "View" }))] }, item.id))), items.length === 0 && (_jsx("div", { style: { color: '#6b7280', fontSize: 14 }, children: "No snapshots yet." }))] }));
}
