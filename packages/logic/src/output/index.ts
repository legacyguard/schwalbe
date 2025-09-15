// Output generation public API
// All code and comments are in English. UI renders use i18n strings.

import type { JurisdictionCode } from '../will/engine'
export type OutputLanguage = 'en' | 'cs' | 'sk'

export interface OutputOptions {
  jurisdiction: JurisdictionCode
  language: OutputLanguage
  // For PDF layout tuning and a11y
  page?: {
    size?: 'A4'
    margin?: { top: string; right: string; bottom: string; left: string }
  }
}

export interface RenderResult {
  // HTML string that is print-ready
  html: string
  // Optional CSS to accompany the HTML (print-focused)
  css?: string
  // For PDF renderers that accept metadata
  metadata?: {
    title?: string
    author?: string
    subject?: string
  }
}

export { renderPDF } from './pdf'
export { renderHandwritingGuide } from './handwriting'
export { renderNotarizationChecklist } from './notarization-checklist'
