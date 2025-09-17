'use client';

import React, { useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { LegacyGuardLogo } from '../shared/LegacyGuardLogo'
import { Button } from '../ui/button'
import { ChevronDown, Languages } from 'lucide-react'
import { CountryMenu } from './CountryMenu'
import { SearchBox } from './SearchBox'
import { UserIcon } from './UserIcon'
import { getAllowedLanguagesForCurrentHost } from '@/lib/locale'
import { LocaleCode, getLanguageLabel, normalizeLocale } from '@/lib/i18n-config'

function LanguageSwitcher() {
  const [open, setOpen] = useState(false)
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const allowed = useMemo(() => getAllowedLanguagesForCurrentHost(), [])

  const current: LocaleCode = (normalizeLocale(locale) as LocaleCode) || 'en'

  const onSelect = (code: LocaleCode) => {
    if (code === current) {
      setOpen(false)
      return
    }
    
    // Update the locale in the URL
    const newPathname = pathname.replace(`/${locale}/`, `/${code}/`)
    router.push(newPathname)
    setOpen(false)
  }

  return (
    <div className="relative">
      <Button
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Change language"
        className="text-slate-200 hover:text-white hover:bg-slate-800/50 px-2 py-1 rounded"
        onClick={() => setOpen((v) => !v)}
      >
        <Languages className="w-4 h-4 mr-2" />
        <span>{getLanguageLabel(current)}</span>
        <ChevronDown className="w-4 h-4 ml-1 opacity-70" />
      </Button>
      {open && (
        <div
          role="menu"
          aria-label="Language menu"
          className="absolute right-0 mt-2 w-44 rounded-md border border-slate-700 bg-slate-900/95 backdrop-blur-sm shadow-lg p-1 z-50"
        >
          {allowed.map((code) => (
            <button
              key={code}
              role="menuitemradio"
              aria-checked={current === code}
              onClick={() => onSelect(code)}
              className={
                'w-full text-left px-3 py-2 rounded text-sm ' +
                (current === code
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-200 hover:bg-slate-800 hover:text-white')
              }
            >
              <span className="mr-2">{getLanguageLabel(code)}</span>
              {current === code ? <span className="sr-only">(selected)</span> : null}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function TopBar() {
  const t = useTranslations('navigation')
  const locale = useLocale()

  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-slate-900/30 backdrop-blur-sm border-b border-slate-700/30">
      <nav className="container mx-auto px-4 py-4" aria-label="Global">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <LegacyGuardLogo />
            <span className="text-2xl font-bold text-white font-heading">LegacyGuard</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:block">
              <SearchBox />
            </div>
            <Link href={`/${locale}/support`} className="text-slate-200 hover:text-white hover:bg-slate-800/50 px-2 py-1 rounded" aria-label={t('support')}>
              {t('support')}
            </Link>
            <Link href={`/${locale}/account/billing`} className="text-slate-200 hover:text-white hover:bg-slate-800/50 px-2 py-1 rounded" aria-label={t('billing')}>
              {t('billing')}
            </Link>
            <LanguageSwitcher />
            <CountryMenu />
            {/* Reminders link (Bell) */}
            <Link href={`/${locale}/reminders`} aria-label={t('reminders')} className="text-slate-200 hover:text-white hover:bg-slate-800/50 px-2 py-1 rounded">
              <span role="img" aria-hidden="true">🔔</span>
            </Link>
            <Link href={`/${locale}/account/export`} className="text-slate-200 hover:text-white hover:bg-slate-800/50 px-2 py-1 rounded" aria-label={t('export')}>
              {t('export')}
            </Link>
            <Link href={`/${locale}/account/delete`} className="text-red-300 hover:text-white hover:bg-red-900/30 px-2 py-1 rounded" aria-label={t('delete')}>
              {t('delete')}
            </Link>
            <UserIcon />
          </div>
        </div>
      </nav>
    </header>
  )
}