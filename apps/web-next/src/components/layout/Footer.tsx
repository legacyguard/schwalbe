'use client';

import React from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'

export function Footer() {
  const t = useTranslations('footer')
  const locale = useLocale()

  return (
    <footer className="border-t border-slate-800 bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm opacity-80">{t('tagline')}</p>
          <nav className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Legal and Support">
            <Link className="hover:text-white underline-offset-2 hover:underline" href={`/${locale}/support`}>
              {t('support')}
            </Link>
            <Link className="hover:text-white underline-offset-2 hover:underline" href={`/${locale}/legal/terms`}>
              {t('terms')}
            </Link>
            <Link className="hover:text-white underline-offset-2 hover:underline" href={`/${locale}/legal/privacy`}>
              {t('privacy')}
            </Link>
            <Link className="hover:text-white underline-offset-2 hover:underline" href={`/${locale}/legal/cookies`}>
              {t('cookies')}
            </Link>
            <Link className="hover:text-white underline-offset-2 hover:underline" href={`/${locale}/legal/imprint`}>
              {t('imprint')}
            </Link>
          </nav>
        </div>
        <div className="mt-4 text-xs opacity-60">© {new Date().getFullYear()} LegacyGuard</div>
      </div>
    </footer>
  )
}