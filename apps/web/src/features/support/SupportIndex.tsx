import React from 'react'
import { Navigate } from 'react-router-dom'
import { normalizeLocale } from '@schwalbe/shared'

import i18n from '@/lib/i18n'

export function SupportIndex() {
  const normalized = (normalizeLocale(i18n.language) || 'en') as 'en' | 'cs' | 'sk'
  const target = normalized === 'en' || normalized === 'cs' || normalized === 'sk' ? normalized : 'en'
  return <Navigate to={`/support.${target}`} replace />
}

export default SupportIndex;