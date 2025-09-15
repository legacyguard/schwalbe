import React from 'react';
import { useAssets } from '../state/useAssets';
import { detectAssetConflicts } from '@schwalbe/logic/assets/conflicts';

export function ConflictReport() {
  const { assets, loading } = useAssets();
  if (loading) return null;
  const issues = detectAssetConflicts(assets);
  if (issues.length === 0) return null;
  return (
    <div role="region" aria-label="Asset conflicts" className="mt-6 bg-rose-900/30 border border-rose-700 rounded p-4">
      <div className="font-semibold mb-2">Conflict Report</div>
      <ul className="list-disc pl-6">
        {issues.map((i, idx) => (
          <li key={idx} className="text-rose-200">{i.message}</li>
        ))}
      </ul>
    </div>
  );
}
