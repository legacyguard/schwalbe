import React from 'react';

export function PlanBadge({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 9999,
      background: '#111827',
      color: '#fff',
      fontSize: 12,
      fontWeight: 600,
    }}>
      {children}
    </span>
  );
}
