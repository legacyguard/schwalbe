
/**
 * Will Template System Types
 * Multi-jurisdiction, multi-language will generation system
 */

export type Jurisdiction =
  | 'AL'
  | 'AT'
  | 'BA'
  | 'BE'
  | 'BG'
  | 'CH'
  | 'CY'
  | 'CZ'
  | 'DE'
  | 'DK'
  | 'EE'
  | 'ES'
  | 'FI'
  | 'FR'
  | 'GR'
  | 'HR'
  | 'HU'
  | 'IE'
  | 'IS'
  | 'IT'
  | 'LI'
  | 'LT'
  | 'LU'
  | 'LV'
  | 'MD'
  | 'ME'
  | 'MK'
  | 'MT'
  | 'NL'
  | 'NO'
  | 'PL'
  | 'PT'
  | 'RO'
  | 'RS'
  | 'SE'
  | 'SI'
  | 'SK'
  | 'UA'
  | 'UK';

export type WillTemplateType =
  | 'allographic'
  | 'holographic'
  | 'notarial'
  | 'witnessed';

export type LanguageCode =
  | 'bg'
  | 'bs'
  | 'cs'
  | 'da'
  | 'de'
  | 'el'
  | 'en'
  | 'es'
  | 'et'
  | 'fi'
  | 'fr'
  | 'ga'
  | 'hr'
  | 'hu'
  | 'is'
  | 'it'
  | 'lt'
  | 'lv'
  | 'me'
  | 'mk'
  | 'mt'
  | 'nl'
  | 'no'
  | 'pl'
  | 'pt'
  | 'ro'
  | 'ru'
  | 'sk'
  | 'sl'
  | 'sq'
  | 'sr'
  | 'sv'
  | 'uk';

export interface WillJurisdictionConfig {
  countryName: {
    [key in LanguageCode]?: string;
  };
  defaultWillType: WillTemplateType;
  jurisdiction: Jurisdiction;
  legalRequirements: JurisdictionRequirements;
  notaryRequirements?: NotaryRequirements;
  primaryLanguage: LanguageCode;
  supportedLanguages: LanguageCode[];
  supportedWillTypes: WillTemplateType[];
  taxInfo: TaxInfo;
}

export interface JurisdictionRequirements {
  forcedHeirship: boolean;
  formalRequirements: string[];
  holographicAllowed: boolean;
  minimumAge: number;
  notarization: {
    circumstances?: string[];
    optional: boolean;
    required: boolean;
  };
  revocationRules: string[];
  witnessRequirements: {
    minimumCount: number;
    required: boolean;
    witnessRestrictions: string[];
  };
}

export interface TaxInfo {
  exemptions?: string[];
  inheritanceTax: boolean;
  notes?: string;
  taxRates?: {
    rate: number;
    relationship: string;
    threshold: number;
  }[];
}

export interface NotaryRequirements {
  estimatedFees?: {
    currency: string;
    max: number;
    min: number;
  };
  organization: string;
  searchUrl?: string;
  verificationRequired: boolean;
}

export interface WillTemplate {
  id: string;
  jurisdiction: Jurisdiction;
  language: LanguageCode;
  legalClauses: LegalClause[];
  metadata: {
    description: string;
    lastUpdated: string;
    legalReview: {
      isApproved: boolean;
      reviewDate?: string;
      reviewedBy?: string;
    };
    name: string;
  };

  structure: WillTemplateStructure;

  type: WillTemplateType;
  validationRules: ValidationRule[];
  variables: TemplateVariable[];
  version: string;
}

export interface WillTemplateStructure {
  executionInstructions: ExecutionInstructions;
  footer: TemplateSection;
  header: TemplateSection;
  sections: TemplateSection[];
}

export interface TemplateSection {
  conditionalLogic?: ConditionalLogic;
  content: string;
  helpText?: string;
  id: string;
  legalReference?: string;
  order: number;
  required: boolean;
  title: string;
  variables?: string[];
}

export interface ConditionalLogic {
  condition: string;
  dependencies: string[];
  hideIf?: Record<string, any>;
  showIf?: Record<string, any>;
}

export interface TemplateVariable {
  dataSource?: 'asset' | 'beneficiary' | 'guardian' | 'user';
  defaultValue?: boolean | number | string | string[];
  description?: string;
  key: string;
  label: string;
  options?: SelectOption[];
  placeholder?: string;
  required: boolean;
  type: 'array' | 'boolean' | 'date' | 'number' | 'object' | 'select' | 'text';
  validation?: ValidationRule[];
}

export interface SelectOption {
  description?: string;
  label: string;
  value: string;
}

export interface ValidationRule {
  field?: string;
  jurisdictionSpecific?: boolean;
  message: string;
  severity: 'error' | 'info' | 'warning';
  type: 'custom' | 'legal' | 'maxLength' | 'minLength' | 'pattern' | 'required';
  value?: boolean | number | string;
}

export interface LegalClause {
  applicableWhenConditions?: Record<string, any>;
  content: string;
  id: string;
  jurisdiction: Jurisdiction;
  legalBasis: string;
  type: 'conditional' | 'mandatory' | 'optional';
}

export interface ExecutionInstructions {
  holographic?: {
    requirements: string[];
    steps: string[];
    warnings: string[];
  };
  notarial?: {
    expectedCosts: string;
    notaryRequirements: string[];
    steps: string[];
    warnings: string[];
  };
  witnessed?: {
    steps: string[];
    warnings: string[];
    witnessRequirements: string[];
  };
}

export interface WillGenerationRequest {
  jurisdiction: Jurisdiction;
  language: LanguageCode;
  preferences: WillGenerationPreferences;
  templateId?: string;
  userData: WillUserData;
  userId: string;
  willType: WillTemplateType;
}

export interface WillUserData {
  assets: AssetInfo[];
  beneficiaries: BeneficiaryInfo[];
  executors: ExecutorInfo[];
  family: FamilyInfo;
  guardians?: GuardianshipInfo[];
  personal: PersonalInfo;
  specialInstructions: SpecialInstruction[];
}

export interface PersonalInfo {
  address: AddressInfo;
  citizenship: string;
  dateOfBirth: string;
  fullName: string;
  maritalStatus: 'divorced' | 'married' | 'partnership' | 'single' | 'widowed';
  personalId?: string;
  placeOfBirth: string;
  profession?: string;
}

export interface AddressInfo {
  city: string;
  country: string;
  postalCode: string;
  region?: string;
  street: string;
}

export interface FamilyInfo {
  children: ChildInfo[];
  parents?: PersonalInfo[];
  siblings?: PersonalInfo[];
  spouse?: PersonalInfo;
}

export interface ChildInfo extends PersonalInfo {
  guardianship?: {
    currentGuardian?: string;
    proposedGuardian?: string;
    specialNeeds?: string;
  };
  isMinor: boolean;
}

export interface AssetInfo {
  currency: string;
  description: string;
  documentReference?: string;
  encumbrances?: string;
  id: string;
  location?: string;
  ownershipPercentage: number;
  type:
    | 'bank_account'
    | 'business'
    | 'digital_asset'
    | 'investment'
    | 'other'
    | 'personal_property'
    | 'real_estate'
    | 'vehicle';
  value: number;
}

export interface BeneficiaryInfo {
  address: AddressInfo;
  alternativeBeneficiary?: string;
  conditions?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
  };
  dateOfBirth?: string;
  id: string;
  name: string;
  personalId?: string;
  relationship: string;
  share: {
    assets?: string[];
    type: 'percentage' | 'remainder' | 'specific_amount' | 'specific_assets';
    value: number | string;
  };
}

export interface ExecutorInfo {
  address: AddressInfo;
  compensation?: string;
  contactInfo: {
    email?: string;
    phone?: string;
  };
  id: string;
  isProfessional: boolean;
  name: string;
  powerLimitations?: string[];
  relationship: string;
  specialization?: string;
  type: 'alternate' | 'co_executor' | 'primary';
}

export interface GuardianshipInfo {
  alternateGuardian?: ExecutorInfo;
  childId: string;
  educationWishes?: string;
  financialProvisions?: string;
  primaryGuardian: ExecutorInfo;
  specialInstructions?: string;
}

export interface SpecialInstruction {
  content: string;
  id: string;
  priority: 'high' | 'low' | 'medium';
  recipient?: string;
  title: string;
  type:
    | 'burial'
    | 'business_succession'
    | 'charitable_giving'
    | 'digital_assets'
    | 'funeral'
    | 'organ_donation'
    | 'other'
    | 'personal_message'
    | 'pet_care';
}

export interface WillGenerationPreferences {
  detailLevel: 'basic' | 'comprehensive' | 'detailed';
  generateMultipleLanguages: boolean;
  includeLegalExplanations: boolean;
  includeOptionalClauses: boolean;
  languageStyle: 'formal' | 'simplified' | 'traditional';
  targetLanguages?: LanguageCode[];
}

export interface GeneratedWill {
  aiSuggestions: AISuggestion[];
  content: {
    html: string;
    pdf?: ArrayBuffer;
    text: string;
  };
  executionInstructions: ExecutionInstructions;
  id: string;
  jurisdiction: Jurisdiction;
  language: LanguageCode;

  legalDisclaimer: string;

  metadata: {
    checksum: string;
    generationDate: string;
    pageCount: number;
    version: string;
    wordCount: number;
  };

  templateId: string;
  type: WillTemplateType;

  userId: string;
  validationResult: WillValidationResult;
}

export interface WillValidationResult {
  completenessScore: number;
  errors: ValidationError[];
  isValid: boolean;
  legalRequirementsMet: boolean;
  missingRequiredFields: string[];
  suggestedImprovements: string[];
  warnings: ValidationError[];
}

export interface AISuggestion {
  affectedSections: string[];
  category: string;
  description: string;
  id: string;
  isJurisdictionSpecific: boolean;
  priority: 'high' | 'low' | 'medium';
  suggestedAction: string;
  title: string;
  type: 'improvement' | 'legal_consideration' | 'optimization' | 'warning';
}

export interface ValidationError {
  code: string;
  field: string;
  legalReference?: string;
  message: string;
  severity: 'error' | 'info' | 'warning';
  suggestedFix?: string;
}

// Template Library System
export interface TemplateLibrary {
  getAllTemplates(): Promise<WillTemplate[]>;
  getJurisdictionConfig(
    jurisdiction: Jurisdiction
  ): Promise<WillJurisdictionConfig>;
  getSupportedLanguages(jurisdiction: Jurisdiction): Promise<LanguageCode[]>;
  getTemplate(
    jurisdiction: Jurisdiction,
    type: WillTemplateType,
    language: LanguageCode
  ): Promise<WillTemplate>;
  validateWillData(
    data: WillUserData,
    template: WillTemplate
  ): Promise<WillValidationResult>;
}

// Sofia AI Integration
export interface SofiaWillAssistant {
  explainLegalTerms(
    content: string,
    language: LanguageCode
  ): Promise<Record<string, string>>;
  generateWillSuggestions(
    userData: WillUserData,
    jurisdiction: Jurisdiction
  ): Promise<AISuggestion[]>;
  optimizeWillContent(will: GeneratedWill): Promise<GeneratedWill>;
  suggestBeneficiaryOptimizations(
    beneficiaries: BeneficiaryInfo[],
    assets: AssetInfo[]
  ): Promise<AISuggestion[]>;
  validateCompliance(will: GeneratedWill): Promise<WillValidationResult>;
}

// Constants for Czech Republic and Slovakia
export const CZ_SK_JURISDICTIONS: Record<'CZ' | 'SK', WillJurisdictionConfig> =
  {
    CZ: {
      jurisdiction: 'CZ',
      countryName: {
        cs: 'Česká republika',
        sk: 'Česká republika',
        en: 'Czech Republic',
        de: 'Tschechische Republik',
        uk: 'Чеська Республіка',
      },
      supportedLanguages: ['cs', 'sk', 'en', 'de', 'uk'],
      primaryLanguage: 'cs',
      supportedWillTypes: ['holographic', 'witnessed', 'notarial'],
      defaultWillType: 'holographic',
      legalRequirements: {
        minimumAge: 18,
        witnessRequirements: {
          required: false,
          minimumCount: 2,
          witnessRestrictions: ['not_beneficiary', 'adult', 'mentally_capable'],
        },
        notarization: {
          required: false,
          optional: true,
          circumstances: [
            'complex_assets',
            'international_assets',
            'business_succession',
          ],
        },
        holographicAllowed: true,
        forcedHeirship: true,
        revocationRules: [
          'explicit_revocation',
          'new_will_supersedes',
          'marriage_revokes_partial',
        ],
        formalRequirements: ['handwritten', 'signed', 'dated'],
      },
      taxInfo: {
        inheritanceTax: false,
        exemptions: ['close_relatives'],
        notes: 'No inheritance tax between spouses, children, and parents',
      },
      notaryRequirements: {
        organization: 'Notářská komora České republiky',
        searchUrl: 'https://www.nkcr.cz',
        verificationRequired: false,
        estimatedFees: {
          min: 1000,
          max: 5000,
          currency: 'CZK',
        },
      },
    },
    SK: {
      jurisdiction: 'SK',
      countryName: {
        sk: 'Slovenská republika',
        cs: 'Slovenská republika',
        en: 'Slovak Republic',
        de: 'Slowakische Republik',
        uk: 'Словацька Республіка',
      },
      supportedLanguages: ['sk', 'cs', 'en', 'de', 'uk'],
      primaryLanguage: 'sk',
      supportedWillTypes: ['holographic', 'witnessed', 'notarial'],
      defaultWillType: 'holographic',
      legalRequirements: {
        minimumAge: 18,
        witnessRequirements: {
          required: false,
          minimumCount: 2,
          witnessRestrictions: [
            'not_beneficiary',
            'adult',
            'mentally_capable',
            'simultaneous_presence',
          ],
        },
        notarization: {
          required: false,
          optional: true,
          circumstances: ['international_validity', 'complex_estate'],
        },
        holographicAllowed: true,
        forcedHeirship: true,
        revocationRules: [
          'explicit_revocation',
          'new_will_supersedes',
          'material_change_in_circumstances',
        ],
        formalRequirements: [
          'handwritten',
          'signed',
          'dated',
          'personal_handwriting_required',
        ],
      },
      taxInfo: {
        inheritanceTax: false,
        exemptions: ['all_heirs'],
        notes: 'No inheritance tax in Slovakia',
      },
      notaryRequirements: {
        organization: 'Notárska komora Slovenskej republiky',
        searchUrl: 'https://www.notar.sk',
        verificationRequired: false,
        estimatedFees: {
          min: 50,
          max: 300,
          currency: 'EUR',
        },
      },
    },
  };
