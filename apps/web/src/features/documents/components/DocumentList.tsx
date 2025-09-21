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

  return (
    <div className="max-w-4xl mx-auto p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Documents</h1>
        <Button onClick={() => navigate('/documents/new')}>Upload</Button>
      </div>
      {loading ? (
        <p>Loading…</p>
      ) : items.length === 0 ? (
        <div className="text-slate-300">No documents yet. Click Upload to add one.</div>
      ) : (
        <ul className="divide-y divide-slate-700 border border-slate-700 rounded">
          {items.map((d) => {
            const title = d.title || d.file_name
            const status = d.processing_status
            const exp = d.expiration_date || (d.expires_at ? new Date(d.expires_at).toISOString().slice(0, 10) : null)
            return (
              <li key={d.id} className="p-3 hover:bg-slate-900">
                <Link to={`/documents/${d.id}`} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{title}</div>
                    <div className="text-xs text-slate-400">{d.category || 'Uncategorized'} • {new Date(d.created_at).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {exp ? <span className="text-xs px-2 py-1 rounded bg-slate-800 border border-slate-700">Expires: {exp}</span> : null}
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