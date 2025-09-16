import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'

export function ExportData() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bundle, setBundle] = useState<any | null>(null)
  const [rateLimited, setRateLimited] = useState<number | null>(null)

  const onExport = async () => {
    setError(null)
    setRateLimited(null)
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('export-data', { body: {} })
      if (error) throw error
      if ((data as any)?.error === 'rate_limited') {
        setRateLimited((data as any)?.retry_after_minutes || 15)
        return
      }
      const b = (data as any)?.bundle
      if (!b) throw new Error('No bundle')
      setBundle(b)
      // Offer download
      const blob = new Blob([JSON.stringify(b, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `legacyguard-export-${new Date().toISOString().slice(0,19)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (_e) {
      setError('Failed to export data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-slate-800 p-6 rounded">
      <h2 className="text-xl font-semibold text-white mb-2">Export your data</h2>
      <p className="text-slate-300 mb-4">Generate a JSON export of your key entities. Exports are rate-limited for your security.</p>

      {error ? <div className="text-red-400 mb-3">{error}</div> : null}
      {rateLimited ? <div className="text-amber-400 mb-3">Please try again in about {rateLimited} minutes.</div> : null}

      <button
        onClick={onExport}
        disabled={loading}
        className="bg-sky-600 hover:bg-sky-500 px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Generating…' : 'Generate export'}
      </button>

      {bundle ? (
        <div className="mt-4 text-xs text-slate-400">
          <p>Preview (truncated):</p>
          <pre className="max-h-60 overflow-auto whitespace-pre-wrap">{JSON.stringify(bundle.meta, null, 2)}</pre>
        </div>
      ) : null}
    </div>
  )
}
