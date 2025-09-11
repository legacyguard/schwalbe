import React from 'react';

interface SnapshotDiffViewProps {
  left?: unknown; // previous
  right?: unknown; // current
}

export function SnapshotDiffView({ left, right }: SnapshotDiffViewProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ background: '#f3f4f6', padding: 6, fontWeight: 600 }}>Previous</div>
        <pre style={{ margin: 0, padding: 10, whiteSpace: 'pre-wrap' }}>{JSON.stringify(left ?? null, null, 2)}</pre>
      </div>
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ background: '#f3f4f6', padding: 6, fontWeight: 600 }}>Current</div>
        <pre style={{ margin: 0, padding: 10, whiteSpace: 'pre-wrap' }}>{JSON.stringify(right ?? null, null, 2)}</pre>
      </div>
    </div>
  );
}
