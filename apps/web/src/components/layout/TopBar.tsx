import React, { useMemo, useState } from 'react'
import { LegacyGuardLogo } from '@/components/LegacyGuardLogo'
import { Button } from '@/components/ui/button'
import { ChevronDown, Languages } from 'lucide-react'
import i18n from '@/lib/i18n'
import { getAllowedLanguagesForCurrentHost, safeSetLocalStorage } from '@/lib/locale'
import { getLanguageLabel, normalizeLocale, type LocaleCode } from '@schwalbe/shared/config/languages'
import { CountryMenu } from './CountryMenu'
import { SearchBox } from './SearchBox'
import { UserIcon } from './UserIcon'


function LanguageSwitcher() {
  const [open, setOpen] = useState(false)
  const allowed = useMemo(() => getAllowedLanguagesForCurrentHost(), [])

  const current: LocaleCode = (normalizeLocale(i18n.language) as LocaleCode) || 'en'

  const onSelect = (code: LocaleCode) => {
    if (code === current) {
      setOpen(false)
      return
    }
    i18n.changeLanguage(code)
    safeSetLocalStorage('lg.lang', code)
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
            <LanguageSwitcher />
            <CountryMenu />
            {/* Reminders link (Bell) */}
            <a href="/reminders" aria-label="Open Reminders" className="text-slate-200 hover:text-white hover:bg-slate-800/50 px-2 py-1 rounded">
<span role="img" aria-hidden="true">🔔</span>
            </a>
            <UserIcon />
          </div>
        </div>
      </nav>
    </header>
  )
}
