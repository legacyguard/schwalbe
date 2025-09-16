import React from 'react'

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm opacity-80">Transforming life's chaos into lasting clarity, one family at a time.</p>
          <nav className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Legal">
            <a className="hover:text-white underline-offset-2 hover:underline" href="/legal/terms.en">Terms</a>
            <a className="hover:text-white underline-offset-2 hover:underline" href="/legal/privacy.en">Privacy</a>
            <a className="hover:text-white underline-offset-2 hover:underline" href="/legal/cookies.en">Cookies</a>
            <a className="hover:text-white underline-offset-2 hover:underline" href="/legal/imprint.en">Imprint</a>
            <span className="mx-2 hidden sm:inline opacity-50">|</span>
            <a className="hover:text-white underline-offset-2 hover:underline" href="/legal/terms.cs">Podmínky</a>
            <a className="hover:text-white underline-offset-2 hover:underline" href="/legal/privacy.cs">Ochrana osobních údajů</a>
            <a className="hover:text-white underline-offset-2 hover:underline" href="/legal/cookies.cs">Cookies</a>
            <a className="hover:text-white underline-offset-2 hover:underline" href="/legal/imprint.cs">Imprint</a>
            <span className="mx-2 hidden sm:inline opacity-50">|</span>
            <a className="hover:text-white underline-offset-2 hover:underline" href="/legal/terms.sk">Podmienky</a>
            <a className="hover:text-white underline-offset-2 hover:underline" href="/legal/privacy.sk">Súkromie</a>
            <a className="hover:text-white underline-offset-2 hover:underline" href="/legal/cookies.sk">Cookies</a>
            <a className="hover:text-white underline-offset-2 hover:underline" href="/legal/imprint.sk">Imprint</a>
          </nav>
        </div>
        <div className="mt-4 text-xs opacity-60">© {new Date().getFullYear()} LegacyGuard</div>
      </div>
    </footer>
  )
}
