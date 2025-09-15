// Notarization checklist renderer for CZ/SK
// Note: This is a practical checklist for the user; it is not legal advice.

import type { OutputOptions, RenderResult } from './index'
import { strings } from './strings'

export function renderNotarizationChecklist(opts: OutputOptions): RenderResult {
  const L = strings(opts.language)
  const css = `
    @media print { @page { size: A4; margin: 15mm; } }
    body { font: 12pt system-ui, -apple-system, Segoe UI, Roboto, sans-serif; color: #111; }
    h1 { font-size: 18pt; margin: 0 0 8px; }
    h2 { font-size: 14pt; margin: 16px 0 8px; }
    ul { margin: 0; padding-left: 18px; }
    li { margin: 6px 0; }
  `

  const items = opts.jurisdiction === 'CZ' ? L.checklistCZ : L.checklistSK

  const html = `<!doctype html>
  <html lang="${opts.language}">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${L.checklistTitle}</title>
      <style>${css}</style>
    </head>
    <body>
      <h1>${L.checklistTitle}</h1>
      <div class="muted">${opts.jurisdiction === 'CZ' ? L.jurCZ : L.jurSK}</div>
      <h2>${L.beforeVisit}</h2>
      <ul>
        ${items.before.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}
      </ul>
      <h2>${L.atVisit}</h2>
      <ul>
        ${items.at.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}
      </ul>
      <h2>${L.afterVisit}</h2>
      <ul>
        ${items.after.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}
      </ul>
      <p style="margin-top:16px; color:#555; font-size:10pt;">${L.disclaimer}</p>
    </body>
  </html>`

  return { html, css, metadata: { title: L.checklistTitle } }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}