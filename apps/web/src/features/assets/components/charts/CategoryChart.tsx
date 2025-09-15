import React from 'react';

type CategoryDatum = { label: string; value: number };
export function CategoryChart({ data }: { data: CategoryDatum[] }) {
  const max = Math.max(1, ...data.map(d => d.value));
  return (
    <div role="img" aria-label="Asset value by category" className="space-y-2">
      {data.map(d => (
        <div key={d.label} className="flex items-center gap-2">
          <div className="w-32 text-zinc-300 text-sm">{d.label}</div>
          <div className="flex-1 bg-zinc-800 rounded h-3">
            <div
              className="bg-emerald-500 h-3 rounded"
              style={{ width: `${(d.value / max) * 100}%` }}
              aria-valuemin={0}
              aria-valuemax={max}
              aria-valuenow={d.value}
            />
          </div>
          <div className="w-24 text-right text-zinc-400 text-sm">{d.value.toLocaleString()}</div>
        </div>
      ))}
      {data.length === 0 && <div className="text-zinc-400 text-sm">No data</div>}
    </div>
  );
}
