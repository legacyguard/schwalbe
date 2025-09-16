import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'

export function DeleteAccount() {
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const onDelete = async () => {
    setError(null)
    setSuccess(null)
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm this irreversible action.')
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('delete-account', { body: { confirm: true } })
      if (error) throw error
      const ok = (data as any)?.success
      if (ok) {
        setSuccess('Your account has been deleted. You will be signed out now.')
        // Proactively sign out
        setTimeout(async () => {
          await supabase.auth.signOut()
          window.location.href = '/'
        }, 1500)
      } else {
        setError((data as any)?.error || 'Failed to delete account')
      }
    } catch (_e) {
      setError('Failed to delete account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-slate-800 p-6 rounded">
      <h2 className="text-xl font-semibold text-red-300 mb-2">Delete account</h2>
      <p className="text-slate-300 mb-3">This action is irreversible. All your data will be permanently deleted and your account disabled.</p>
      <p className="text-slate-400 mb-4">To confirm, type <span className="font-mono bg-slate-700 px-1 py-0.5 rounded">DELETE</span> below.</p>

      {error ? <div className="text-red-400 mb-3">{error}</div> : null}
      {success ? <div className="text-emerald-400 mb-3">{success}</div> : null}

      <div className="flex items-center gap-3 mb-4">
        <input
          aria-label="Type DELETE to confirm"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="bg-slate-700 border border-slate-600 rounded px-3 py-2 flex-1"
          placeholder="Type DELETE to confirm"
        />
        <button
          onClick={onDelete}
          disabled={loading || confirmText !== 'DELETE'}
          className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Deleting…' : 'Delete my account'}
        </button>
      </div>

      <p className="text-slate-500 text-sm">We will permanently remove your app data and disable your sign-in. Certain aggregate or anonymized logs may be retained without personal identifiers for security and compliance.</p>
    </div>
  )
}
