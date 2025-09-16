import React from 'react'

export default function SupportEN() {
  return (
    <div className="container mx-auto px-4 py-10 text-slate-100">
      <h1 className="text-3xl font-semibold mb-4">Support</h1>
      <p className="mb-4">
        Need help? Email us at{' '}
        <a className="text-sky-300 underline" href="mailto:support@documentsafe.app">support@documentsafe.app</a>{' '}
        or visit our <a className="text-sky-300 underline" href="/support.en#faq">FAQ</a>.
      </p>

      <div className="rounded border border-slate-700 bg-slate-800 p-4" id="faq">
        <h2 className="text-xl font-medium mb-2">Frequently Asked Questions (stub)</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>
            How do I cancel? — Go to <a className="underline" href="/account/billing">Account → Billing</a> and choose
            Cancel at period end.
          </li>
          <li>
            How can I export my data? — Use <a className="underline" href="/account/export">Account → Export</a>.
          </li>
          <li>
            How do I contact support? — Email <a className="underline" href="mailto:support@documentsafe.app">support@documentsafe.app</a>.
          </li>
        </ul>
      </div>

      <div className="mt-6 text-sm text-slate-300">
        Legal: {" "}
        <a className="underline" href="/legal/terms.en">Terms</a> ·{' '}
        <a className="underline" href="/legal/privacy.en">Privacy</a> ·{' '}
        <a className="underline" href="/legal/cookies.en">Cookies</a> ·{' '}
        <a className="underline" href="/legal/imprint.en">Imprint</a>
      </div>
    </div>
  )
}