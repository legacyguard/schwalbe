import React from 'react'

export default function SupportSK() {
  return (
    <div className="container mx-auto px-4 py-10 text-slate-100">
      <h1 className="text-3xl font-semibold mb-4">Podpora</h1>
      <p className="mb-4">
        Potrebujete pomoc? Napíšte nám na{' '}
        <a className="text-sky-300 underline" href="mailto:support@documentsafe.app">support@documentsafe.app</a>{' '}
        alebo navštívte naše <a className="text-sky-300 underline" href="/support.sk#faq">FAQ</a>.
      </p>

      <div className="rounded border border-slate-700 bg-slate-800 p-4" id="faq">
        <h2 className="text-xl font-medium mb-2">Často kladené otázky (stub)</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>
            Ako zruším predplatné? — Prejdite do <a className="underline" href="/account/billing">Účet → Fakturácia</a> a zvoľte
            Zrušiť na konci obdobia.
          </li>
          <li>
            Ako exportujem svoje dáta? — Použite <a className="underline" href="/account/export">Účet → Export</a>.
          </li>
          <li>
            Ako kontaktovať podporu? — Napíšte na{' '}
            <a className="underline" href="mailto:support@documentsafe.app">support@documentsafe.app</a>.
          </li>
        </ul>
      </div>

      <div className="mt-6 text-sm text-slate-300">
        Právne: {" "}
        <a className="underline" href="/legal/terms.sk">Podmienky</a> ·{' '}
        <a className="underline" href="/legal/privacy.sk">Súkromie</a> ·{' '}
        <a className="underline" href="/legal/cookies.sk">Cookies</a> ·{' '}
        <a className="underline" href="/legal/imprint.sk">Imprint</a>
      </div>
    </div>
  )
}