import React from 'react';

export interface SnapshotListItem {
  id: string;
  label?: string;
  timestamp: string; // ISO
}

interface SnapshotHistoryListProps {
  items: SnapshotListItem[];
  onSelect?: (id: string) => void;
}

export function SnapshotHistoryList({ items, onSelect }: SnapshotHistoryListProps) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {items.map(item => (
        <div
          key={item.id}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: '1px solid #e5e7eb',
            padding: 10,
            borderRadius: 8,
            background: '#fff',
          }}
        >
          <div>
            <div style={{ fontWeight: 600 }}>{item.label || 'Snapshot'}</div>
            <div style={{ color: '#6b7280', fontSize: 12 }}>{new Date(item.timestamp).toLocaleString()}</div>
          </div>
          {onSelect && (
            <button
              type="button"
              onClick={() => onSelect(item.id)}
              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ccc', background: '#f3f4f6' }}
            >
              View
            </button>
          )}
        </div>
      ))}
      {items.length === 0 && (
        <div style={{ color: '#6b7280', fontSize: 14 }}>No snapshots yet.</div>
      )}
    </div>
  );
}
