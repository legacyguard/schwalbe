import React from 'react'
import { listDocuments } from '../api/documentApi'
import { Link, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'

export function DocumentList() {
  const [items, setItems] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const navigate = useNavigate()

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      try {
        const docs = await listDocuments()
        if (mounted) setItems(docs)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  const [categoryFilter, setCategoryFilter] = React.useState<string>('all')
  const categories = React.useMemo(() => {
    const set = new Set<string>()
    items.forEach(d => { if (d.category) set.add(d.category) })
    return ['all', ...Array.from(set)]
  }, [items])

  return (
    <div className="max-w-4xl mx-auto p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Documents</h1>
        <div className="flex items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm"
            aria-label="Filter by category"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === 'all' ? 'All categories' : c}</option>
            ))}
          </select>
          <Button onClick={() => navigate('/documents/new')}>Upload</Button>
        </div>
      </div>
      {loading ? (
        <p>Loading…</p>
      ) : items.length === 0 ? (
        <div className="text-slate-300">No documents yet. Click Upload to add one.</div>
      ) : (
        <ul className="divide-y divide-slate-700 border border-slate-700 rounded">
          {items
            .filter(d => categoryFilter === 'all' || d.category === categoryFilter)
            .map((d) => {
            const title = d.title || d.file_name
            const status = d.processing_status
            const exp = d.expiration_date || (d.expires_at ? new Date(d.expires_at).toISOString().slice(0, 10) : null)
            const expSoon = (() => {
              if (!d.expires_at && !d.expiration_date) return false
              const target = d.expires_at ? new Date(d.expires_at) : new Date(`${d.expiration_date}T09:00:00.000Z`)
              const diff = target.getTime() - Date.now()
              return diff > 0 && diff <= 30 * 24 * 3600 * 1000
            })()
            return (
              <li key={d.id} className="p-3 hover:bg-slate-900">
                <Link to={`/documents/${d.id}`} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{title}</div>
                    <div className="text-xs text-slate-400">{d.category || 'Uncategorized'} • {new Date(d.created_at).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {exp ? (
                      <span className={`text-xs px-2 py-1 rounded border ${expSoon ? 'bg-yellow-900/40 border-yellow-600 text-yellow-200' : 'bg-slate-800 border-slate-700'}`}>
                        {expSoon ? 'Expiring soon: ' : 'Expires: '}{exp}
                      </span>
                    ) : null}
                    <span className="text-xs px-2 py-1 rounded bg-slate-800 border border-slate-700">{status}</span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}