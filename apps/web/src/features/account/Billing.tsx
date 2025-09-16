import React from 'react'
import { supabase } from '@/lib/supabase'

export function Billing() {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const openPortal = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.functions.invoke('create-billing-portal-session', { body: {} })
      if (error) throw error
      const url = (data as any)?.url
      if (url) {
        window.location.href = url
      } else {
        throw new Error('No portal URL')
      }
    } catch (e) {
      setError('Failed to open billing portal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-semibold mb-4">Billing</h1>
      <p className="text-slate-300 mb-4">Manage your payment methods, invoices and subscription.</p>
      {error ? <div className="text-red-400 mb-3">{error}</div> : null}
      <div className="flex items-center gap-3">
        <button
          className="bg-sky-600 hover:bg-sky-500 px-3 py-1 rounded disabled:opacity-50"
          onClick={openPortal}
          disabled={loading}
        >
          {loading ? 'Opening…' : 'Open Billing Portal'}
        </button>
        <a href="/account/billing/details" className="text-slate-300 hover:text-white underline">Edit billing details</a>
      </div>
    </div>
  )
}
