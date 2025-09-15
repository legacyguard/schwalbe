import React from 'react';
import { Link } from 'react-router-dom';
import { useAssetsSummary } from '../state/useAssets';
import { CategoryChart } from './charts/CategoryChart';
import { ConflictReport } from './ConflictReport';
import { AssetsSummaryCards } from './AssetsSummaryCards';

export function AssetsDashboard() {
  const { summary, loading, error } = useAssetsSummary();

  return (
    <div className="p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Assets</h1>
        <Link aria-label="Create new asset" to="/assets/new" className="underline text-emerald-300">
          New Asset
        </Link>
      </div>

      {error && (
        <div role="alert" className="text-red-300 mb-4">{String(error)}</div>
      )}

      {loading ? (
        <div aria-busy="true" aria-live="polite">Loading...</div>
      ) : (
        <>
          <AssetsSummaryCards />

          <div className="bg-zinc-900/60 rounded p-4">
            <h2 className="text-lg font-semibold mb-2">By Category</h2>
            <CategoryChart data={summary.byCategory} />
          </div>

          <ConflictReport />

          <div className="mt-6">
            <Link to="/assets/list" className="underline text-sky-300">Go to list</Link>
          </div>
        </>
      )}
    </div>
  );
}
