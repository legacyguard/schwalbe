// packages/shared/src/config/legal/requirements.ts
// Minimal legal requirements dataset for 39 European countries.
// Scope: MVP metadata used for validation planning and UI hints.
// NOTE: This is a lightweight reference; engine-level jurisdiction validators will
// still enforce detailed rules per country as they are implemented.

export type Jurisdiction =
  | 'DE' | 'FR' | 'ES' | 'IT' | 'NL' | 'BE' | 'LU' | 'CH' | 'LI' | 'AT'
  | 'UK' | 'DK' | 'SE' | 'FI' | 'CZ' | 'SK' | 'PL' | 'HU' | 'SI' | 'EE'
  | 'LV' | 'LT' | 'PT' | 'GR' | 'MT' | 'CY' | 'IE' | 'NO' | 'IS'
  | 'RO' | 'BG' | 'HR' | 'RS' | 'AL' | 'MK' | 'ME' | 'MD' | 'UA' | 'BA'

export interface CountryLegalRequirements {
  jurisdiction: Jurisdiction
  minAge: {
    holographic: number
    typed: number
  }
  witnessCount: {
    holographic: number
    typed: number
  }
  notarizationRequired: boolean
  notes?: string
}

// Defaults used where specific info is pending deeper implementation.
const DEFAULTS = {
  minAge: { holographic: 15, typed: 18 },
  witnessCount: { holographic: 0, typed: 2 },
  notarizationRequired: false,
}

export const LEGAL_REQUIREMENTS: Record<Jurisdiction, CountryLegalRequirements> = {
  // Tier 1
  DE: {
    jurisdiction: 'DE',
    minAge: { holographic: 16, typed: 18 },
    witnessCount: { holographic: 0, typed: 2 },
    notarizationRequired: false,
    notes: 'German Civil Code (BGB). Notarization commonly used for certain acts; standard wills typically do not require notarization if handwritten entirely by testator.',
  },
  FR: { jurisdiction: 'FR', ...DEFAULTS, notes: 'Forced heirship (réserve héréditaire). Notary involvement is common but not strictly required for holographic wills.' },
  ES: { jurisdiction: 'ES', ...DEFAULTS, notes: 'Regional variations (derechos forales) may apply per autonomous community.' },
  IT: { jurisdiction: 'IT', ...DEFAULTS, notes: 'DAT considerations. Notary system widely used.' },
  NL: { jurisdiction: 'NL', ...DEFAULTS },
  BE: { jurisdiction: 'BE', ...DEFAULTS, notes: 'Regional tax variations across Flanders, Wallonia, Brussels.' },
  LU: { jurisdiction: 'LU', ...DEFAULTS },
  CH: { jurisdiction: 'CH', ...DEFAULTS, notes: 'Cantonal differences; multilingual environment.' },
  LI: { jurisdiction: 'LI', ...DEFAULTS },
  AT: { jurisdiction: 'AT', ...DEFAULTS, notes: 'No inheritance tax. Notary network integration planned.' },
  UK: { jurisdiction: 'UK', minAge: { holographic: 18, typed: 18 }, witnessCount: { holographic: 2, typed: 2 }, notarizationRequired: false, notes: 'England/Wales/Scotland/NI variants.' },
  DK: { jurisdiction: 'DK', ...DEFAULTS },
  SE: { jurisdiction: 'SE', minAge: { holographic: 18, typed: 18 }, witnessCount: { holographic: 2, typed: 2 }, notarizationRequired: false },
  FI: { jurisdiction: 'FI', ...DEFAULTS },
  CZ: { jurisdiction: 'CZ', minAge: { holographic: 15, typed: 18 }, witnessCount: { holographic: 0, typed: 2 }, notarizationRequired: false },
  SK: { jurisdiction: 'SK', minAge: { holographic: 15, typed: 18 }, witnessCount: { holographic: 0, typed: 2 }, notarizationRequired: false },
  PL: { jurisdiction: 'PL', ...DEFAULTS },
  HU: { jurisdiction: 'HU', ...DEFAULTS },
  SI: { jurisdiction: 'SI', ...DEFAULTS },
  EE: { jurisdiction: 'EE', ...DEFAULTS },
  LV: { jurisdiction: 'LV', ...DEFAULTS },
  LT: { jurisdiction: 'LT', ...DEFAULTS },
  PT: { jurisdiction: 'PT', ...DEFAULTS, notes: 'Stamp duty considerations for beneficiaries (non-direct heirs).' },
  GR: { jurisdiction: 'GR', ...DEFAULTS },
  MT: { jurisdiction: 'MT', ...DEFAULTS },
  CY: { jurisdiction: 'CY', ...DEFAULTS },
  IE: { jurisdiction: 'IE', ...DEFAULTS },
  NO: { jurisdiction: 'NO', ...DEFAULTS },
  IS: { jurisdiction: 'IS', ...DEFAULTS },
  // Tier 2
  RO: { jurisdiction: 'RO', ...DEFAULTS, notes: '1% inheritance tax if succession not finalized within two years.' },
  BG: { jurisdiction: 'BG', ...DEFAULTS },
  HR: { jurisdiction: 'HR', ...DEFAULTS },
  RS: { jurisdiction: 'RS', ...DEFAULTS },
  AL: { jurisdiction: 'AL', ...DEFAULTS },
  MK: { jurisdiction: 'MK', ...DEFAULTS },
  ME: { jurisdiction: 'ME', ...DEFAULTS },
  MD: { jurisdiction: 'MD', ...DEFAULTS },
  UA: { jurisdiction: 'UA', ...DEFAULTS },
  BA: { jurisdiction: 'BA', ...DEFAULTS, notes: 'Complex multi-entity structure (Federation, Republika Srpska, Brčko District).' },
}

export function getLegalRequirements(code: Jurisdiction): CountryLegalRequirements {
  return LEGAL_REQUIREMENTS[code]
}
