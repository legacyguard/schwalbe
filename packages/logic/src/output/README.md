# Output Generation Modules (CZ/SK)

This package provides output renderers for the Will Engine in HTML suitable for PDF printing and paper workflows. It does not perform PDF generation itself; pipe the HTML to your renderer of choice (e.g., Puppeteer) to produce a .pdf.

Modules:
- pdf.ts — print-ready HTML for the will draft
- handwriting.ts — lined handwriting template with prompts
- notarization-checklist.ts — practical checklist for notarization visit

Jurisdictions: CZ (Czech Republic), SK (Slovak Republic)
Languages: en, cs, sk (UI English; document copy localized per file content)

Accessibility and print:
- A4 page size, margins, and high-contrast defaults
- Proper landmark roles (header, main, footer)
- Avoids color-only semantics; ensures legible default fonts

Usage example:

```ts
import { WillEngine } from '../will/engine'
import { renderPDF, renderHandwritingGuide, renderNotarizationChecklist } from './output'

const engine = new WillEngine()
const draft = engine.generate({
  jurisdiction: 'CZ',
  language: 'cs',
  form: 'typed',
  testator: { id: 'u1', fullName: 'Jan Novák', age: 45, address: 'Praha, Česká republika' },
  beneficiaries: [{ id: 'b1', name: 'Jana Nováková', relationship: 'spouse' }],
  executorName: 'JUDr. Karel Veselý',
  signatures: { testatorSigned: true, witnessesSigned: true },
  witnesses: [{ id: 'w1', fullName: 'Petr Svoboda' }, { id: 'w2', fullName: 'Eva Dvořáková' }],
})

// PDF HTML
const pdf = renderPDF(
  { jurisdiction: 'CZ', language: 'cs' },
  { title: 'Poslední vůle a závěť', content: draft.content, testator: 'Jan Novák' }
)
// pdf.html -> feed into Puppeteer

// Handwriting guide
const hw = renderHandwritingGuide({ jurisdiction: 'SK', language: 'sk' }, {})

// Notarization checklist
const cl = renderNotarizationChecklist({ jurisdiction: 'CZ', language: 'en' })
```

Printing CSS validation:
- Verify A4 layout does not clip content
- Check that header/footer render on all pages
- Links are visible and underlined in print

Note: This module intentionally avoids e-signature and advanced features in this scope.