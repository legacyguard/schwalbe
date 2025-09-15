import React from 'react'
import { getDocument } from '../api/documentApi'
import { useParams, Link } from 'react-router-dom'

export function DocumentDetail() {
  const { id } = useParams()
  const [doc, setDoc] = React.useState<any | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!id) return
      setLoading(true)
      try {
        const d = await getDocument(id)
        if (mounted) setDoc(d)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [id])

  if (loading) return <div className="p-6 text-white">Loading…</div>
  if (!doc) return <div className="p-6 text-white">Not found</div>

  const title = doc.title || doc.file_name
  const exp = doc.expiration_date || (doc.expires_at ? new Date(doc.expires_at).toISOString().slice(0, 10) : null)

  return (
    <div className="max-w-4xl mx-auto p-6 text-white">
      <div className="mb-4"><Link to="/documents" className="underline text-sky-300">← Back to Documents</Link></div>
      <h1 className="text-2xl font-semibold mb-1">{title}</h1>
      <div className="text-slate-300 mb-4">{doc.category || 'Uncategorized'} • Uploaded {new Date(doc.created_at).toLocaleString()}</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <div className="border border-slate-700 rounded p-3">
            <div className="font-medium mb-2">Extracted Text (OCR)</div>
            <pre className="whitespace-pre-wrap text-sm text-slate-200">{doc.ocr_text || doc.ai_extracted_text || 'No text extracted.'}</pre>
          </div>
          <div className="border border-slate-700 rounded p-3">
            <div className="font-medium mb-2">Metadata</div>
            <div className="text-sm text-slate-300">File: {doc.file_name} ({Math.round((doc.file_size || 0)/1024)} KB)</div>
            <div className="text-sm text-slate-300">Type: {doc.file_type || 'n/a'}</div>
            {exp ? <div className="text-sm text-slate-300">Expiration: {exp}</div> : null}
            {Array.isArray(doc.ai_suggested_tags) && doc.ai_suggested_tags.length > 0 ? (
              <div className="text-sm text-slate-300">Tags: {doc.ai_suggested_tags.join(', ')}</div>
            ) : null}
          </div>
        </div>
        <div className="space-y-4">
          <div className="border border-slate-700 rounded p-3">
            <div className="font-medium mb-2">Analysis</div>
            <div className="text-sm text-slate-300">Category: {doc.category || '—'} {doc.classification_confidence != null ? `(${Math.round(doc.classification_confidence*100)}%)` : ''}</div>
            <div className="text-sm text-slate-300">Title: {doc.title || '—'} {doc.ai_confidence != null ? `(${Math.round(doc.ai_confidence*100)}%)` : ''}</div>
            {doc.ai_reasoning ? (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-slate-200">Reasoning</summary>
                <pre className="whitespace-pre-wrap text-xs text-slate-300">{JSON.stringify(doc.ai_reasoning, null, 2)}</pre>
              </details>
            ) : null}
          </div>
          <div className="border border-slate-700 rounded p-3">
            <div className="font-medium mb-2">Status</div>
            <div className="text-sm text-slate-300 capitalize">{doc.processing_status}</div>
          </div>
        </div>
      </div>
    </div>
  )
}