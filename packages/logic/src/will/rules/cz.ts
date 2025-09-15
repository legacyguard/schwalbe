// Czech Republic rules for wills
// Note: High-level practical rules for MVP validation; not legal advice.
import type { ValidationResult, WillInput } from '../engine'

export const CZ_RULES = {
  jurisdiction: 'CZ',
  minTestatorAge: 15, // handwritten allowed from 15, typed often 18; we gate at 18 for typed in validation
  witnessCount: {
    holographic: 0, // self-written entirely and signed by testator
    typed: 2, // generally two witnesses present when testator signs
  },
  disallowedWitnesses: ['beneficiary', 'executor'], // role-based constraint we check heuristically
}

export function validateCZ(input: WillInput): ValidationResult {
  const errors = [] as ValidationResult['errors']
  const warnings = [] as ValidationResult['warnings']

  // Jurisdiction tag
  if (input.jurisdiction !== 'CZ') {
    errors.push({ code: 'CZ_JURISDICTION_MISMATCH', message: 'Jurisdiction mismatch for CZ validator', severity: 'error' })
  }

  // Age rule (practical MVP):
  const age = input.testator.age ?? 0
  if (input.form === 'typed' && age < 18) {
    errors.push({ code: 'TESTATOR_AGE_TYPED_MIN_18', message: 'Typed will requires testator to be 18 or older', severity: 'error' })
  }
  if (input.form === 'holographic' && age < 15) {
    errors.push({ code: 'TESTATOR_AGE_HOLOGRAPHIC_MIN_15', message: 'Holographic will requires testator to be 15 or older', severity: 'error' })
  }

  // Witness requirements
  const requiredWitnesses = CZ_RULES.witnessCount[input.form]
  const witnesses = input.witnesses ?? []
  if (witnesses.length < requiredWitnesses) {
    errors.push({ code: 'WITNESS_COUNT_TOO_LOW', message: `At least ${requiredWitnesses} witnesses required`, severity: 'error' })
  }

  // Witness conflicts: beneficiary or executor should not witness
  for (const w of witnesses) {
    if (w.isBeneficiary) {
      errors.push({ code: 'WITNESS_CONFLICT_BENEFICIARY', message: 'Witness cannot be a beneficiary', severity: 'error' })
    }
  }

  // Signature presence (intent-level check only)
  if (!input.signatures.testatorSigned) {
    errors.push({ code: 'MISSING_TESTATOR_SIGNATURE', message: 'Testator signature is required', severity: 'error' })
  }
  if (requiredWitnesses > 0 && !input.signatures.witnessesSigned) {
    errors.push({ code: 'MISSING_WITNESS_SIGNATURES', message: 'Witness signatures are required', severity: 'error' })
  }

  return { isValid: errors.length === 0, errors, warnings }
}
