// PDF output renderer: converts a will draft content into print-ready HTML
// Does not perform PDF generation itself; consumers can pass HTML to Puppeteer or similar.
// Accessibility: high-contrast defaults, proper landmarks, print CSS.

import type { OutputOptions, RenderResult } from './index'
import { strings } from './strings'

export interface PDFContext {
  title?: string
  content: string // plain text or markdown-like string
  // Optional summary metadata shown in header
  testator?: string
  jurisdictionLabel?: string
}

export function renderPDF(opts: OutputOptions, ctx: PDFContext): RenderResult {
  const L = strings(opts.language)

  // Basic print CSS for A4
  const css = `
    @media print {
      @page { size: A4; margin: 20mm; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
    :root { color-scheme: light dark; }
    body { font: 12pt/1.5 system-ui, -apple-system, Segoe UI, Roboto, sans-serif; color: #111; background: #fff; }
    header, footer { display: block; }
    header { border-bottom: 1px solid #ccc; padding: 8px 0; margin-bottom: 12px; }
    footer { border-top: 1px solid #ccc; padding: 8px 0; margin-top: 16px; font-size: 10pt; color: #555; }
    h1 { font-size: 20pt; margin: 0 0 8px; }
    h2 { font-size: 14pt; margin: 16px 0 8px; }
    p { margin: 0 0 8px; }
    .muted { color: #555; }
    .section { margin: 12px 0; }
    .content { white-space: pre-wrap; }
  `

  const headerRight = `${opts.jurisdiction === 'CZ' ? 'CZ' : 'SK'} • ${new Date().toISOString().slice(0, 10)}`
  const title = ctx.title ?? L.defaultTitle

  const html = `<!doctype html>
  <html lang="${opts.language}">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${escapeHtml(title)}</title>
      <style>${css}</style>
    </head>
    <body>
      <header role="banner" aria-label="${L.headerAria}">
        <div style="display:flex; justify-content:space-between; align-items:baseline; gap:12px;">
          <h1>${escapeHtml(title)}</h1>
          <div class="muted">${escapeHtml(headerRight)}</div>
        </div>
        ${ctx.testator ? `<div class="muted">${escapeHtml(L.testator)}: ${escapeHtml(ctx.testator)}</div>` : ''}
        ${ctx.jurisdictionLabel ? `<div class="muted">${escapeHtml(L.jurisdiction)}: ${escapeHtml(ctx.jurisdictionLabel)}</div>` : ''}
      </header>
      <main role="main" aria-label="${L.mainAria}">
        <section class="section content">${linkify(escapeHtml(ctx.content))}</section>
      </main>
      <footer role="contentinfo" aria-label="${L.footerAria}">
        <div class="muted">${escapeHtml(L.footerNote)}</div>
      </footer>
    </body>
  </html>`

  return {
    html,
    css,
    metadata: {
      title,
      subject: L.subject,
    },
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function linkify(s: string) {
  return s.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">$1</a>')
}