import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import TermsEN from '@/pages/legal/terms.en'
import TermsCS from '@/pages/legal/terms.cs'
import TermsSK from '@/pages/legal/terms.sk'
import PrivacyEN from '@/pages/legal/privacy.en'
import PrivacyCS from '@/pages/legal/privacy.cs'
import PrivacySK from '@/pages/legal/privacy.sk'
import CookiesEN from '@/pages/legal/cookies.en'
import CookiesCS from '@/pages/legal/cookies.cs'
import CookiesSK from '@/pages/legal/cookies.sk'
import ImprintEN from '@/pages/legal/imprint.en'
import ImprintCS from '@/pages/legal/imprint.cs'
import ImprintSK from '@/pages/legal/imprint.sk'

export function LegalRoutes() {
  return (
    <Routes>
      <Route path="terms.en" element={<TermsEN />} />
      <Route path="terms.cs" element={<TermsCS />} />
      <Route path="terms.sk" element={<TermsSK />} />

      <Route path="privacy.en" element={<PrivacyEN />} />
      <Route path="privacy.cs" element={<PrivacyCS />} />
      <Route path="privacy.sk" element={<PrivacySK />} />

      <Route path="cookies.en" element={<CookiesEN />} />
      <Route path="cookies.cs" element={<CookiesCS />} />
      <Route path="cookies.sk" element={<CookiesSK />} />

      <Route path="imprint.en" element={<ImprintEN />} />
      <Route path="imprint.cs" element={<ImprintCS />} />
      <Route path="imprint.sk" element={<ImprintSK />} />

      <Route path="*" element={<Navigate to="terms.en" replace />} />
    </Routes>
  )
}

export default LegalRoutes;
