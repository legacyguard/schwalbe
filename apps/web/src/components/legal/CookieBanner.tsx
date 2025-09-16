import React, { useEffect, useState } from 'react'
import { getConsentVersionTag } from '@/lib/legal'
import { supabase } from '@/lib/supabase'
import { ensureConsentRow, markDeviceConsentAccepted, hasDeviceAccepted } from '@/features/legal/consent.service'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const tag = getConsentVersionTag()
    if (!hasDeviceAccepted(tag)) {
      setVisible(true)
    }

    // If already logged in on mount, ensure consent row exists
    ;(async () => {
      const { data: session } = await supabase.auth.getSession()
      if (session.session?.user) {
        const didCreate = await ensureConsentRow(supabase)
        if (didCreate) {
          markDeviceConsentAccepted(tag)
          setVisible(false)
        }
      }
    })()

    // On auth state changes, ensure consent row exists
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const didCreate = await ensureConsentRow(supabase)
        if (didCreate) {
          markDeviceConsentAccepted(tag)
          setVisible(false)
        }
      }
    })
    return () => {
      sub?.subscription?.unsubscribe()
    }
  }, [])

  const accept = async () => {
    const tag = getConsentVersionTag()
    // Try to upsert in DB if logged in; ignore errors for anonymous users
    const { data: session } = await supabase.auth.getSession()
    if (session.session?.user) {
      await ensureConsentRow(supabase, true)
    }
    markDeviceConsentAccepted(tag)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-5xl m-4 rounded-lg border border-slate-700 bg-slate-900/95 backdrop-blur p-4 text-slate-200 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm">
            <strong>Cookies & Privacy.</strong> We use only essential cookies to provide our service. By selecting "Accept", you agree to our Terms and Privacy Policy.
          </div>
          <div className="flex gap-2">
            <a className="text-slate-300 underline underline-offset-2 hover:text-white" href="/legal/privacy.en">Privacy</a>
            <a className="text-slate-300 underline underline-offset-2 hover:text-white" href="/legal/terms.en">Terms</a>
            <button onClick={accept} className="ml-2 rounded bg-emerald-600 px-3 py-1 text-sm font-medium text-white hover:bg-emerald-500">
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}