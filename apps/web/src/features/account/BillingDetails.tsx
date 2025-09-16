import React from 'react'
import { supabase } from '@/lib/supabase'

// Minimal inline i18n for EN/CZ/SK
const labels = {
  en: {
    title: 'Billing details',
    subtitle: 'These details appear on your Stripe invoices and help calculate tax.',
    companyName: 'Company name (optional)',
    vatId: 'VAT ID / DIČ (optional)',
    line1: 'Address line 1',
    line2: 'Address line 2 (optional)',
    city: 'City',
    postal_code: 'Postal code',
    country: 'Country (ISO code, e.g. CZ, SK)',
    save: 'Save billing details',
    saving: 'Saving…',
    saved: 'Saved successfully',
    error: 'Unable to save billing details.',
    back: 'Back to Billing',
  },
  cs: {
    title: 'Fakturační údaje',
    subtitle: 'Tyto údaje se zobrazí na fakturách Stripe a pomáhají vypočítat daň.',
    companyName: 'Název společnosti (volitelné)',
    vatId: 'DIČ (volitelné)',
    line1: 'Ulice a číslo',
    line2: 'Adresa – doplněk (volitelné)',
    city: 'Město',
    postal_code: 'PSČ',
    country: 'Země (kód ISO, např. CZ, SK)',
    save: 'Uložit fakturační údaje',
    saving: 'Ukládání…',
    saved: 'Úspěšně uloženo',
    error: 'Uložení fakturačních údajů se nezdařilo.',
    back: 'Zpět na Billing',
  },
  sk: {
    title: 'Fakturačné údaje',
    subtitle: 'Tieto údaje sa zobrazia na faktúrach Stripe a pomáhajú vypočítať daň.',
    companyName: 'Názov spoločnosti (voliteľné)',
    vatId: 'IČ DPH / DIČ (voliteľné)',
    line1: 'Ulica a číslo',
    line2: 'Adresa – doplnok (voliteľné)',
    city: 'Mesto',
    postal_code: 'PSČ',
    country: 'Krajina (kód ISO, napr. CZ, SK)',
    save: 'Uložiť fakturačné údaje',
    saving: 'Ukladám…',
    saved: 'Úspešne uložené',
    error: 'Uloženie fakturačných údajov sa nepodarilo.',
    back: 'Späť na Billing',
  }
} as const

function useUi() {
  const lang = (navigator?.language || 'en').slice(0,2).toLowerCase()
  if (lang === 'cs') return labels.cs
  if (lang === 'sk') return labels.sk
  return labels.en
}

export function BillingDetails() {
  const L = useUi()
  const [form, setForm] = React.useState({
    company_name: '',
    vat_id: '',
    line1: '',
    line2: '',
    city: '',
    postal_code: '',
    country: '',
  })
  const [saving, setSaving] = React.useState(false)
  const [status, setStatus] = React.useState<'idle'|'ok'|'err'>('idle')

  React.useEffect(() => {
    // Load saved details (best-effort)
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('company_name, vat_id, billing_address')
        .eq('id', user.id)
        .maybeSingle()
      const addr = (data as any)?.billing_address || {}
      setForm({
        company_name: ((data as any)?.company_name as string) || '',
        vat_id: ((data as any)?.vat_id as string) || '',
        line1: (addr.line1 as string) || '',
        line2: (addr.line2 as string) || '',
        city: (addr.city as string) || '',
        postal_code: (addr.postal_code as string) || '',
        country: (addr.country as string) || '',
      })
    })()
  }, [])

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setStatus('idle')
    try {
      const { data, error } = await supabase.functions.invoke('update-billing-details', {
        body: {
          company_name: form.company_name?.trim() || null,
          vat_id: form.vat_id?.trim() || null,
          billing_address: {
            line1: form.line1?.trim() || null,
            line2: form.line2?.trim() || null,
            city: form.city?.trim() || null,
            postal_code: form.postal_code?.trim() || null,
            country: form.country?.trim()?.toUpperCase() || null,
          },
        },
      })
      if (error) throw error
      if ((data as any)?.ok) setStatus('ok')
      else setStatus('err')
    } catch {
      setStatus('err')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-semibold mb-2">{L.title}</h1>
      <p className="text-slate-300 mb-6">{L.subtitle}</p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">{L.companyName}</label>
          <input name="company_name" value={form.company_name} onChange={onChange} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">{L.vatId}</label>
          <input name="vat_id" value={form.vat_id} onChange={onChange} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">{L.line1}</label>
          <input name="line1" value={form.line1} onChange={onChange} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">{L.line2}</label>
          <input name="line2" value={form.line2} onChange={onChange} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">{L.city}</label>
            <input name="city" value={form.city} onChange={onChange} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">{L.postal_code}</label>
            <input name="postal_code" value={form.postal_code} onChange={onChange} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">{L.country}</label>
            <input name="country" value={form.country} onChange={onChange} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2" />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={saving} className="bg-sky-600 hover:bg-sky-500 px-3 py-1 rounded disabled:opacity-50">
            {saving ? L.saving : L.save}
          </button>
          {status === 'ok' ? <span className="text-green-400">{L.saved}</span> : null}
          {status === 'err' ? <span className="text-red-400">{L.error}</span> : null}
        </div>
      </form>

      <div className="mt-6">
        <a href="/account/billing" className="text-slate-300 hover:text-white underline">{L.back}</a>
      </div>
    </div>
  )
}