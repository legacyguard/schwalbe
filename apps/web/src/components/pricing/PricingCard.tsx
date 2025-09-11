import React from 'react';

interface PricingCardProps {
  plan: string;
  price: string; // e.g., "$19"
  period?: string; // e.g., "/mo"
  features?: string[];
  highlight?: boolean;
  ctaLabel?: string;
  onSelect?: () => void;
}

export function PricingCard({ plan, price, period = '', features = [], highlight, ctaLabel = 'Choose Plan', onSelect }: PricingCardProps) {
  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: 16,
        background: highlight ? '#f0f9ff' : '#fff',
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 18 }}>{plan}</div>
      <div style={{ marginTop: 6, fontSize: 28, fontWeight: 800 }}>
        {price} <span style={{ fontSize: 14, color: '#6b7280' }}>{period}</span>
      </div>
      <ul style={{ marginTop: 12, paddingLeft: 16 }}>
        {features.map((f, i) => (
          <li key={i} style={{ marginBottom: 6 }}>{f}</li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onSelect}
        style={{
          marginTop: 12,
          padding: '8px 12px',
          borderRadius: 8,
          border: '1px solid #0ea5e9',
          background: '#0ea5e9',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        {ctaLabel}
      </button>
    </div>
  );
}
