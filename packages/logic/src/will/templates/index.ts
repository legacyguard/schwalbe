// Template renderer for will drafts (CZ/SK)
// Simple string interpolation to avoid external deps for MVP.
import type { JurisdictionCode, WillForm } from '../engine'
import { renderCzechWill } from './czechTemplate'
import { renderSlovakWill } from './slovakTemplate'

export interface TemplateContext {
  jurisdiction: JurisdictionCode
  language: 'en' | 'cs' | 'sk'
  form: WillForm
  testator: string
  address: string
  testatorBirthDate?: string
  testatorCity?: string
  beneficiaries: Array<{
    id: string
    name: string
    relationship?: string
    share?: {
      type: 'percentage' | 'amount' | 'specific_asset'
      value?: number
      description?: string
    }
    conditions?: string
  }>
  executorName?: string
  witnessNames?: string[]
  guardianship?: Array<{
    childName?: string
    primaryGuardian?: { name: string }
    alternateGuardian?: { name: string }
    specialInstructions?: string
  }>
  funeralWishes?: string
  organDonation?: boolean
  petCare?: string
  digitalAssets?: string
}

function interpolate(template: string, data: Record<string, string>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => (data[k] ?? ''))
}

function section(title: string, content: string) {
  return `\n\n## ${title}\n\n${content}`
}

function list(items: string[]) {
  return items.map((i) => `- ${i}`).join('\n')
}

export function renderTemplate(ctx: TemplateContext): string {
  // Use comprehensive templates for Czech and Slovak jurisdictions
  if (ctx.jurisdiction === 'CZ' && ctx.language === 'cs') {
    return renderCzechWill(ctx)
  }

  if (ctx.jurisdiction === 'SK' && ctx.language === 'sk') {
    return renderSlovakWill(ctx)
  }

  // Fallback to basic template for other jurisdictions/languages
  const L = localizations[ctx.language] || localizations.en

  const header = `${L.title}: ${ctx.testator}`

  const declaration = interpolate(L.declaration, {
    testator: ctx.testator,
    address: ctx.address,
  })

  const beneficiaries = section(
    L.beneficiariesTitle,
    ctx.beneficiaries.length
      ? list(ctx.beneficiaries.map((b) => `${b.name}${b.relationship ? ` (${b.relationship})` : ''}`))
      : L.none
  )

  const executor = section(
    L.executorTitle,
    ctx.executorName ? interpolate(L.executorLine, { executor: ctx.executorName }) : L.none
  )

  const witnesses = section(
    L.witnessesTitle,
    ctx.witnessNames && ctx.witnessNames.length ? list(ctx.witnessNames) : L.none
  )

  const formNote = section(L.formTitle, ctx.form === 'holographic' ? L.formHolographic : L.formTyped)

  return [header, declaration, beneficiaries, executor, witnesses, formNote].join('\n')
}

const localizations = {
  en: {
    title: 'Last Will and Testament',
    declaration:
      'I, {{testator}}, of {{address}}, declare this document to be my Last Will and Testament.',
    beneficiariesTitle: 'Beneficiaries',
    executorTitle: 'Executor',
    executorLine: 'I appoint {{executor}} as Executor of my estate.',
    witnessesTitle: 'Witnesses',
    formTitle: 'Form',
    formHolographic: 'This draft is prepared as a holographic (handwritten) will.',
    formTyped: 'This draft is prepared as a typed will.',
    none: 'None',
  },
  cs: {
    title: 'Poslední vůle a závěť',
    declaration:
      'Já, {{testator}}, bytem {{address}}, prohlašuji tento dokument za svou poslední vůli a závěť.',
    beneficiariesTitle: 'Oprávnění (Beneficiaries)',
    executorTitle: 'Zůstavitelův vykonavatel (Executor)',
    executorLine: 'Určuji {{executor}} jako vykonavatele závěti.',
    witnessesTitle: 'Svědci',
    formTitle: 'Forma',
    formHolographic: 'Tento návrh je připraven jako holografní (vlastnoruční) závěť.',
    formTyped: 'Tento návrh je připraven jako strojopisná závěť.',
    none: 'Žádné',
  },
  sk: {
    title: 'Závet',
    declaration:
      'Ja, {{testator}}, bydliskom {{address}}, vyhlasujem tento dokument za môj závet.',
    beneficiariesTitle: 'Oprávnení (Beneficiaries)',
    executorTitle: 'Vykonávateľ závetu (Executor)',
    executorLine: 'Určujem {{executor}} za vykonávateľa závetu.',
    witnessesTitle: 'Svedkovia',
    formTitle: 'Forma',
    formHolographic: 'Tento návrh je pripravený ako holografný (vlastnoručný) závet.',
    formTyped: 'Tento návrh je pripravený ako písaný/strojopisný závet.',
    none: 'Žiadne',
  },
} as const
