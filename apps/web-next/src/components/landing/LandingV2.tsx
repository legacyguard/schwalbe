"use client"
import React from 'react'
import { useTranslations } from 'next-intl'
import { sendAnalytics } from '@/lib/analytics'

export default function LandingV2() {
  const t = useTranslations('landingV2')

  React.useEffect(() => {
    sendAnalytics('landing_view')
  }, [])

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 px-6 py-10">
      <section className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">{t('heroTitle')}</h1>
        <p className="text-slate-300 mb-6">{t('heroSubtitle')}</p>
        <button
          className="inline-flex items-center px-4 py-2 rounded bg-sky-600 hover:bg-sky-500"
          onClick={() => sendAnalytics('landing_cta_click', { cta: 'hero' })}
        >
          {t('cta')}
        </button>
      </section>
    </main>
  )
}