import React from 'react'
import { LegalLayout } from './LegalLayout'

export default function CookiesEN() {
  return (
    <LegalLayout lang="en" title="Cookie Policy">
      <p>We use only essential cookies required to operate the service and remember your preferences (like language and consent).</p>
      <h2>Types of Cookies</h2>
      <ul>
        <li>Essential: Required for core functionality (session and consent state).</li>
      </ul>
      <h2>Consent</h2>
      <p>You can accept cookies through our banner. We avoid any tracking before consent.</p>
    </LegalLayout>
  )
}
