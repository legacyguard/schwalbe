# Output Generation Quickstart (CZ/SK)

This guide shows how to render PDF-ready HTML for will drafts and produce handwriting templates and notarization checklists.

Prerequisites:
- Will Engine available at packages/logic/src/will/engine.ts
- Output modules at packages/logic/src/output

Usage:

```ts
import { WillEngine } from '../../packages/logic/src/will/engine'
import { renderPDF, renderHandwritingGuide, renderNotarizationChecklist } from '../../packages/logic/src/output'

const engine = new WillEngine()
const draft = engine.generate({
  jurisdiction: 'CZ',
  language: 'cs',
  form: 'typed',
  testator: { id: 't1', fullName: 'Jan Novák', age: 45, address: 'Praha' },
  beneficiaries: [{ id: 'b1', name: 'Jana Nováková', relationship: 'spouse' }],
  executorName: 'JUDr. Karel Veselý',
  signatures: { testatorSigned: true, witnessesSigned: true },
  witnesses: [{ id: 'w1', fullName: 'Petr Svoboda' }, { id: 'w2', fullName: 'Eva Dvořáková' }],
})

const pdf = renderPDF(
  { jurisdiction: 'CZ', language: 'cs' },
  { title: 'Poslední vůle a závěť', content: draft.content, testator: 'Jan Novák' }
)

// Example: generate a PDF buffer with Puppeteer
// const browser = await puppeteer.launch()
// const page = await browser.newPage()
// await page.setContent(pdf.html, { waitUntil: 'networkidle0' })
// const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true })
// await browser.close()

const handwriting = renderHandwritingGuide({ jurisdiction: 'SK', language: 'sk' }, {})
const checklist = renderNotarizationChecklist({ jurisdiction: 'CZ', language: 'en' })
```

Visual checks (acceptance criteria):
- CZ/SK output renders correct localized headings and notes
- PDF HTML uses A4 and margins; header/footer visible in print preview
- Handwriting template shows clear lined sections, signature lines, and witness area
- Notarization checklist lists "before/during/after" items correctly for CZ/SK

Print CSS validation:
- Ensure no content clipping at all margins
- Confirm font sizes are legible and color contrast meets WCAG AA in grayscale
- Links are underlined and readable when printed