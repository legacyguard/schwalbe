import React from 'react';

export function UrgencyBadge({ children = 'Limited seats' }: { children?: React.ReactNode }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 6,
      background: '#fef3c7',
      color: '#92400e',
      fontSize: 12,
      fontWeight: 600,
      border: '1px solid #f59e0b'
    }}>
      {children}
    </span>
  );
}
