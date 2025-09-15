import React from 'react';
import { useAssetsSummary } from '../state/useAssets';

export function AssetsSummaryCards() {
  const { summary, loading } = useAssetsSummary();
  if (loading) return <div aria-busy="true">Loading summaries...</div>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-zinc-900/60 rounded p-4">
        <div className="text-sm text-zinc-400">Total assets</div>
        <div className="text-3xl font-medium">{summary.totalCount}</div>
      </div>
      <div className="bg-zinc-900/60 rounded p-4">
        <div className="text-sm text-zinc-400">Total estimated value</div>
        <div className="text-3xl font-medium">{summary.totalValue.toLocaleString(undefined, { style: 'currency', currency: summary.currency || 'USD' })}</div>
      </div>
      <div className="bg-zinc-900/60 rounded p-4">
        <div className="text-sm text-zinc-400">Categories</div>
        <div className="text-3xl font-medium">{summary.categoryCount}</div>
      </div>
    </div>
  );
}
