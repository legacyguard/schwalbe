import React from 'react'

interface LegalPageProps {
  lang: 'en' | 'cs' | 'sk'
  title: string
  children: React.ReactNode
}

export function LegalLayout({ lang, title, children }: LegalPageProps) {
  return (
    <div className="container mx-auto px-4 py-10 text-slate-200">
      <h1 className="text-3xl font-semibold mb-4">{title}</h1>
      <div className="prose prose-invert max-w-none">
        {children}
      </div>
      <div className="mt-8 text-xs opacity-60">
        <p>
          {lang === 'en' && 'This content is provided for information purposes and does not constitute legal advice.'}
          {lang === 'cs' && 'Tento obsah je pouze informativní a nepředstavuje právní poradenství.'}
          {lang === 'sk' && 'Tento obsah má informatívny charakter a nepredstavuje právne poradenstvo.'}
        </p>
      </div>
    </div>
  )
}
