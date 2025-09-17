'use client';

import React from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { subscriptionService } from '@schwalbe/shared'

export function DunningBanner() {
  const [show, setShow] = React.useState(false)
  const t = useTranslations('billing')
  const locale = useLocale()

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const sub = await subscriptionService.getCurrentSubscription()
        if (!mounted) return
        setShow(!!sub && sub.status === 'past_due')
      } catch {
        // no-op
      }
    })()
    return () => { mounted = false }
  }, [])

  if (!show) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[60]">
      <div className="mx-auto max-w-5xl mt-2">
        <div className="bg-amber-100 border border-amber-300 text-amber-900 rounded px-4 py-3 shadow">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold">{t('payment_issue')}</div>
              <div className="text-sm">{t('payment_issue_message')}</div>
            </div>
            <Link 
              className="inline-flex items-center px-3 py-1 rounded bg-amber-500 text-white hover:bg-amber-600" 
              href={`/${locale}/account/billing`}
            >
              {t('open_billing_portal')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}