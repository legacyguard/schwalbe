import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAssets, useDeleteAsset } from '../state/useAssets';

export function AssetsList() {
  const { assets, loading, error } = useAssets();
  const { deleteAsset } = useDeleteAsset();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');

  const filtered = useMemo(() => {
    return assets.filter(a => {
      const matchesText = q ? (a.name?.toLowerCase().includes(q.toLowerCase()) || a.notes?.toLowerCase().includes(q.toLowerCase())) : true;
      const matchesCategory = category ? a.category === category : true;
      return matchesText && matchesCategory;
    });
  }, [assets, q, category]);

  return (
    <div className="p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Assets</h1>
        <Link aria-label="Create new asset" className="underline text-emerald-300" to="/assets/new">New Asset</Link>
      </div>

      <div className="flex gap-3 mb-4">
        <label className="sr-only" htmlFor="search">Search</label>
        <input
          id="search"
          className="bg-zinc-900 text-white rounded px-3 py-2 w-64"
          placeholder="Search assets..."
          value={q}
          onChange={e => setQ(e.target.value)}
        />
        <label className="sr-only" htmlFor="category">Category</label>
        <select
          id="category"
          className="bg-zinc-900 text-white rounded px-3 py-2"
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          <option value="">All categories</option>
          <option value="property">Property</option>
          <option value="vehicle">Vehicle</option>
          <option value="financial">Financial</option>
          <option value="business">Business</option>
          <option value="personal">Personal</option>
        </select>
      </div>

      {error && <div role="alert" className="text-red-300 mb-3">{String(error)}</div>}
      {loading ? (
        <div aria-busy="true" aria-live="polite">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-400">
                <th className="p-2">Name</th>
                <th className="p-2">Category</th>
                <th className="p-2">Value</th>
                <th className="p-2">Acquired</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id} className="border-t border-zinc-800">
                  <td className="p-2">{a.name}</td>
                  <td className="p-2 capitalize">{a.category}</td>
                  <td className="p-2">{a.estimated_value ? a.estimated_value.toLocaleString(undefined, { style: 'currency', currency: a.currency || 'USD' }) : '—'}</td>
                  <td className="p-2">{a.acquired_at ? new Date(a.acquired_at).toLocaleDateString() : '—'}</td>
                  <td className="p-2">
                    <Link className="underline text-sky-300 mr-3" to={`/assets/${a.id}/edit`}>Edit</Link>
                    <button
                      className="underline text-red-300"
                      onClick={() => deleteAsset(a.id)}
                      aria-label={`Delete asset ${a.name}`}
                    >Delete</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="p-4 text-zinc-400" colSpan={5}>No assets found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
