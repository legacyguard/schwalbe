// Handwriting guide renderer: produces a lined, print-friendly guide with prompts
// for manual completion by the testator and witnesses.

import type { OutputOptions, RenderResult } from './index'
import { strings } from './strings'

export interface HandwritingContext {
  testator?: string
  address?: string
  dateLabel?: string // override localized date label
}

export function renderHandwritingGuide(opts: OutputOptions, ctx: HandwritingContext = {}): RenderResult {
  const L = strings(opts.language)

  const css = `
    @media print {
      @page { size: A4; margin: 15mm; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
    body { font: 12pt/1.6 system-ui, -apple-system, Segoe UI, Roboto, sans-serif; color: #000; }
    h1 { font-size: 18pt; margin: 0 0 12px; }
    .muted { color: #333; }
    .prompt { margin: 10px 0 4px; font-weight: 600; }
    .line { border-bottom: 1px dashed #999; height: 22px; }
    .sig-line { border-bottom: 1px solid #000; height: 22px; margin-top: 24px; }
    .grid { display: grid; grid-template-columns: 1fr; gap: 8px; }
  `

  const lines = (n: number) => new Array(n).fill('<div class="line" aria-hidden="true"></div>').join('')

  const html = `<!doctype html>
  <html lang="${opts.language}">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${L.hwTitle}</title>
      <style>${css}</style>
    </head>
    <body>
      <header>
        <h1>${L.hwTitle}</h1>
        <div class="muted">${opts.jurisdiction === 'CZ' ? L.jurCZ : L.jurSK}</div>
      </header>
      <main>
        <section>
          <div class="prompt">${L.promptTestator}</div>
          <div class="grid">${lines(2)}</div>
          <div class="prompt">${L.promptAddress}</div>
          <div class="grid">${lines(2)}</div>
          <div class="prompt">${L.promptBody}</div>
          <div class="grid">${lines(10)}</div>
        </section>
        <section>
          <div class="prompt">${ctx.dateLabel ?? L.date}</div>
          <div class="grid">${lines(1)}</div>
          <div class="prompt">${L.testatorSignature}</div>
          <div class="sig-line" role="img" aria-label="${L.signatureLine}"></div>
        </section>
        <section>
          <div class="prompt">${L.witnesses}</div>
          <div class="grid">${lines(2)}</div>
          <div class="sig-line" role="img" aria-label="${L.signatureLine}"></div>
          <div class="sig-line" role="img" aria-label="${L.signatureLine}"></div>
        </section>
      </main>
    </body>
  </html>`

  return { html, css, metadata: { title: L.hwTitle } }
}