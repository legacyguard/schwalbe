// Will Generation Engine - core orchestration for CZ/SK
// All code and comments are in English. Templates contain localized legal text.

export type JurisdictionCode = 'CZ' | 'SK'
export type WillForm = 'holographic' | 'typed'

export interface Person {
  id: string
  fullName: string
  age?: number
  isBeneficiary?: boolean
}

export interface Witness extends Person {}

export interface Beneficiary {
  id: string
  name: string
  relationship?: string
}

export interface WillInput {
  jurisdiction: JurisdictionCode
  language: 'en' | 'cs' | 'sk'
  form: WillForm
  testator: Person & { address?: string }
  beneficiaries: Beneficiary[]
  executorName?: string
  // Signatures present at drafting time (engine only validates intent fields)
  signatures: {
    testatorSigned: boolean
    witnessesSigned?: boolean
  }
  witnesses?: Witness[]
}

export interface ValidationIssue {
  code: string
  message: string
  severity: 'error' | 'warning'
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
}

export interface DraftResult {
  jurisdiction: JurisdictionCode
  language: 'en' | 'cs' | 'sk'
  form: WillForm
  content: string
  validation: ValidationResult
  // Optional metadata useful for downstream output generation (checksum, title, etc.)
  metadata?: {
    title?: string
    checksum?: string
  }
}

// Rules
import { validateCZ, CZ_RULES } from './rules/cz'
import { validateSK, SK_RULES } from './rules/sk'

// Templates
import { renderTemplate } from './templates'

export class WillEngine {
  generate(input: WillInput): DraftResult {
    const rules = this.getRules(input.jurisdiction)
    const validation = this.validate(input)

    const content = renderTemplate({
      jurisdiction: input.jurisdiction,
      language: input.language,
      form: input.form,
      testator: input.testator.fullName,
      address: input.testator.address ?? '',
      beneficiaries: input.beneficiaries,
      executorName: input.executorName ?? '',
      witnessNames: (input.witnesses ?? []).map((w) => w.fullName),
      // Minimal placeholder set; templates can ignore missing fields safely
    })

    return {
      jurisdiction: input.jurisdiction,
      language: input.language,
      form: input.form,
      content,
      validation,
    }
  }

  validate(input: WillInput): ValidationResult {
    switch (input.jurisdiction) {
      case 'CZ':
        return validateCZ(input)
      case 'SK':
        return validateSK(input)
      default: {
        return {
          isValid: false,
          errors: [
            {
              code: 'JURISDICTION_UNSUPPORTED',
              message: 'Unsupported jurisdiction',
              severity: 'error',
            },
          ],
          warnings: [],
        }
      }
    }
  }

  getRules(jurisdiction: JurisdictionCode) {
    return jurisdiction === 'CZ' ? CZ_RULES : SK_RULES
  }
}
