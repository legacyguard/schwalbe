import React from 'react';
import { PricingCard } from './PricingCard';

interface PlanSpec {
  plan: string;
  price: string;
  period?: string;
  features?: string[];
  highlight?: boolean;
}

interface PricingGridProps {
  plans: PlanSpec[];
}

export function PricingGrid({ plans }: PricingGridProps) {
  return (
    <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
      {plans.map((p, i) => (
        <PricingCard key={i} {...p} />
      ))}
    </div>
  );
}
