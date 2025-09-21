import React from 'react'
import { getDocument, updateDocument } from '../api/documentApi'
import { useParams, Link, useLocation } from 'react-router-dom'
import DocumentIntelligence from '@/components/documents/DocumentIntelligence'
import { ShareManager } from '@/features/sharing/manager/ShareManager'
import { reminderService, type ReminderRule } from '@schwalbe/shared'

export function DocumentDetail() {
  const { id } = useParams()
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const showUploadedAffirm = params.get('affirm') === 'uploaded'
  const [doc, setDoc] = React.useState<any | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [showShare, setShowShare] = React.useState(false)

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

const [saving, setSaving] = React.useState(false)
  const [edit, setEdit] = React.useState<{ title?: string; category?: string; expiration_date?: string }>({})

  const onAccept = async () => {
    if (!doc) return
    setSaving(true)
    try {
      const patch: any = {}
      if (edit.title != null) patch.title = edit.title
      if (edit.category != null) patch.category = edit.category
      if (edit.expiration_date != null) {
        patch.expiration_date = edit.expiration_date
        patch.expires_at = new Date(`${edit.expiration_date}T09:00:00.000Z`).toISOString()
      }
      const updated = await updateDocument(doc.id, patch)
      setDoc(updated)

      // (MVP) Create/update expiration reminder if applicable
      if (patch.expiration_date) {
        try {
          const exp = patch.expiration_date as string
          const expDate = new Date(`${exp}T09:00:00.000Z`)
          let scheduled = new Date(expDate)
          scheduled.setUTCDate(scheduled.getUTCDate() - 30)
          const now = new Date()
          if (scheduled < now) {
            scheduled = new Date(expDate)
            scheduled.setUTCDate(scheduled.getUTCDate() - 7)
          }
          if (scheduled < now) {
            scheduled = new Date(now.getTime() + 60 * 60 * 1000)
          }
          const titleR = `Document expiring: ${updated.title || updated.file_name}`
          const description = `This document is expected to expire on ${exp}. Please review and renew if needed.`
          const rule: Omit<ReminderRule, 'id' | 'created_at' | 'updated_at'> = {
            user_id: updated.user_id,
            title: titleR,
            description,
            scheduled_at: scheduled.toISOString(),
            recurrence_rule: null,
            recurrence_end_at: null,
            channels: ['email', 'in_app'],
            priority: 'high',
            status: 'active',
            next_execution_at: scheduled.toISOString(),
            last_executed_at: null,
            execution_count: 0,
            max_executions: 1,
          }
          await reminderService.create(rule as any)
        } catch {
          // best effort; ignore errors
        }
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 text-white">
      <div className="mb-4"><Link to="/documents" className="underline text-sky-300">← Back to Documents</Link></div>
      <h1 className="text-2xl font-semibold mb-1">{title}</h1>
      {showUploadedAffirm && (
        <div className="mt-3">
          <SofiaAffirmation type='document_uploaded' />
        </div>
      )}
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

          {/* AI Intelligence: categorization, recommendations, insights */}
          <div className="border border-slate-700 rounded p-3">
            <div className="font-medium mb-2">Intelligence</div>
            <DocumentIntelligence
              documents={[{
                id: String(doc.id),
                name: doc.title || doc.file_name,
                type: doc.file_type || 'application/octet-stream',
                size: doc.file_size || 0,
                uploadDate: new Date(doc.created_at),
                content: doc.ai_extracted_text || doc.ocr_text || '',
                status: doc.processing_status || 'completed'
              }]}
            />
          </div>
        </div>
        <div className="space-y-4">
<div className="border border-slate-700 rounded p-3">
            <div className="font-medium mb-2">Analysis</div>
            <div className="space-y-2">
              <label className="block text-sm">Title</label>
              <input className="w-full rounded bg-slate-800 border border-slate-700 p-2" defaultValue={doc.title || ''} onChange={(e)=>setEdit(s=>({...s,title:e.target.value}))} />
              <label className="block text-sm">Category</label>
              <input className="w-full rounded bg-slate-800 border border-slate-700 p-2" defaultValue={doc.category || ''} onChange={(e)=>setEdit(s=>({...s,category:e.target.value}))} />
              <label className="block text-sm">Expiration (YYYY-MM-DD)</label>
              <input className="w-full rounded bg-slate-800 border border-slate-700 p-2" defaultValue={exp || ''} onChange={(e)=>setEdit(s=>({...s,expiration_date:e.target.value}))} />
              <button disabled={saving} className="mt-2 px-3 py-2 rounded bg-slate-700 hover:bg-slate-600" onClick={onAccept}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
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

          <div className="border border-slate-700 rounded p-3">
            <div className="font-medium mb-2">Share</div>
            <button
              className="px-3 py-2 rounded bg-sky-600 hover:bg-sky-700"
              onClick={() => setShowShare(true)}
            >
              Create Share Link
            </button>
            {showShare && (
              <div className="mt-3">
                <ShareManager
                  resourceType="document"
                  resourceId={String(doc.id)}
                  resourceTitle={title}
                  onClose={() => setShowShare(false)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}