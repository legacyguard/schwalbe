import React from 'react'

export default function SupportCS() {
  return (
    <div className="container mx-auto px-4 py-10 text-slate-100">
      <h1 className="text-3xl font-semibold mb-4">Podpora</h1>
      <p className="mb-4">
        Potřebujete pomoc? Napište nám na{' '}
        <a className="text-sky-300 underline" href="mailto:support@documentsafe.app">support@documentsafe.app</a>{' '}
        nebo navštivte naše <a className="text-sky-300 underline" href="/support.cs#faq">FAQ</a>.
      </p>

      <div className="rounded border border-slate-700 bg-slate-800 p-4" id="faq">
        <h2 className="text-xl font-medium mb-2">Často kladené otázky (stub)</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>
            Jak zruším předplatné? — Přejděte do <a className="underline" href="/account/billing">Účet → Fakturace</a> a zvolte
            Zrušit na konci období.
          </li>
          <li>
            Jak exportuji data? — Použijte <a className="underline" href="/account/export">Účet → Export</a>.
          </li>
          <li>
            Jak kontaktovat podporu? — Napište na{' '}
            <a className="underline" href="mailto:support@documentsafe.app">support@documentsafe.app</a>.
          </li>
        </ul>
      </div>

      <div className="mt-6 text-sm text-slate-300">
        Právní: {" "}
        <a className="underline" href="/legal/terms.cs">Podmínky</a> ·{' '}
        <a className="underline" href="/legal/privacy.cs">Ochrana osobních údajů</a> ·{' '}
        <a className="underline" href="/legal/cookies.cs">Cookies</a> ·{' '}
        <a className="underline" href="/legal/imprint.cs">Imprint</a>
      </div>
    </div>
  )
}