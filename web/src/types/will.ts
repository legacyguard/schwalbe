
/**
 * Will and Testament Types for LegacyGuard
 * Handles will creation, validation, and management
 */

export type WillStatus =
  | 'archived'
  | 'completed'
  | 'draft'
  | 'notarized'
  | 'review'
  | 'witnessed';
export type WillType = 'detailed' | 'international' | 'simple' | 'trust';
export type BeneficiaryType =
  | 'charitable'
  | 'contingent'
  | 'primary'
  | 'secondary';

export interface Will {
  // AI Assistance
  ai_suggestions?: AISuggestion[];
  asset_distributions: AssetDistribution[];
  beneficiaries: Beneficiary[];
  completeness_score: number;
  // Metadata
  created_at: string;

  declarations: WillDeclaration[];
  executor_appointments: ExecutorAppointment[];
  funeral_wishes?: FuneralWishes;

  guardianship_appointments?: GuardianshipAppointment[];
  id: string;
  // Legal Information
  jurisdiction: string;
  language: string;
  legal_framework: string;
  notarized_at?: string;
  notary?: NotaryDetails;
  // Content
  preamble?: string;

  signed_at?: string;
  special_instructions?: SpecialInstruction[];
  status: WillStatus;

  // Signatures & Witnesses
  testator_signature?: Signature;
  updated_at: string;
  user_id: string;
  validation_errors?: ValidationError[];
  version: number;

  will_type: WillType;
  witnessed_at?: string;
  witnesses?: WitnessSignature[];
}

export interface WillDeclaration {
  content: string;
  id: string;
  is_mandatory: boolean;
  order: number;
  type:
    | 'custom'
    | 'family_status'
    | 'identity'
    | 'mental_capacity'
    | 'revocation';
}

export interface Beneficiary {
  alternate_beneficiary_id?: string;
  conditions?: string;
  contact_info?: {
    address?: string;
    email?: string;
    phone?: string;
  };
  date_of_birth?: string;
  full_name: string;
  id: string;
  identification?: string;
  relationship: string;
  share_percentage?: number;
  specific_bequests?: string[];
  type: BeneficiaryType;
}

export interface AssetDistribution {
  asset_type:
    | 'business'
    | 'digital'
    | 'financial'
    | 'other'
    | 'personal'
    | 'real_estate';
  beneficiary_ids: string[];
  currency?: string;
  description: string;
  distribution_details: {
    [beneficiary_id: string]: {
      conditions?: string;
      percentage?: number;
      specific_amount?: number;
    };
  };
  distribution_type: 'equal' | 'percentage' | 'specific';
  estimated_value?: number;
  id: string;
  location?: string;
  special_instructions?: string;
}

export interface GuardianshipAppointment {
  alternate_guardian?: {
    contact_info: Record<string, any>;
    full_name: string;
    relationship: string;
  };
  child_date_of_birth: string;
  child_name: string;
  id: string;
  primary_guardian: {
    contact_info: Record<string, any>;
    full_name: string;
    relationship: string;
  };
  special_instructions?: string;
}

export interface ExecutorAppointment {
  compensation?: string;
  contact_info: Record<string, any>;
  full_name: string;
  id: string;
  powers_granted: string[];
  professional?: boolean;
  relationship: string;
  restrictions?: string[];
  type: 'alternate' | 'co-executor' | 'primary';
}

export interface SpecialInstruction {
  category: 'business' | 'charity' | 'debts' | 'other' | 'pets' | 'taxes';
  content: string;
  id: string;
  priority: 'high' | 'low' | 'medium';
  title: string;
}

export interface FuneralWishes {
  location?: string;
  memorial_preferences?: string;
  prepaid_arrangements?: boolean;
  provider_details?: string;
  specific_instructions?: string;
  type: 'burial' | 'cremation' | 'other';
}

export interface Signature {
  ip_address?: string;
  location?: string;
  signatory_name: string;
  signature_data?: string; // Base64 encoded signature image
  signed_at: string;
}

export interface WitnessSignature extends Signature {
  address: string;
  declaration: string;
  occupation?: string;
  witness_number: number;
}

export interface NotaryDetails {
  currency?: string;
  fee?: number;
  jurisdiction: string;
  name: string;
  notarization_date: string;
  notarization_location: string;
  office_address: string;
  registration_number: string;
  seal_number?: string;
}

export interface AISuggestion {
  category: string;
  created_at: string;
  description: string;
  id: string;
  jurisdiction_specific: boolean;
  priority: 'high' | 'low' | 'medium';
  suggested_action?: string;
  title: string;
  type: 'improvement' | 'legal_requirement' | 'missing' | 'warning';
}

export interface ValidationError {
  field: string;
  legal_reference?: string;
  message: string;
  severity: 'error' | 'info' | 'warning';
}

// Asset type interfaces for legacy compatibility
export interface RealEstateAsset {
  address: string;
  description: string;
  value?: number;
}

export interface VehicleAsset {
  description: string;
  make?: string;
  model?: string;
  value?: number;
  year?: number;
}

export interface BankAccountAsset {
  accountNumber?: string;
  bank?: string;
  description: string;
  value?: number;
}

export interface PersonalPropertyAsset {
  category?: string;
  description: string;
  value?: number;
}

// Special provisions interface
export interface SpecialProvision {
  beneficiaryIds?: string[];
  conditions?: string;
  description: string;
  id: string;
  title: string;
  type: 'charity' | 'condition' | 'instruction' | 'trust';
}

// Legacy WillData interface for compatibility
export interface WillData {
  additionalClauses?: string[];

  // Assets structure for component compatibility
  assets: {
    bankAccounts?: BankAccountAsset[];
    investments?: Array<{
      accountType: string;
      company: string;
      value?: number;
    }>;
    personalProperty?: PersonalPropertyAsset[];
    realEstate?: RealEstateAsset[];
    vehicles?: VehicleAsset[];
  };

  // Beneficiaries structure for component compatibility
  beneficiaries: Array<{
    conditions?: string;
    id: string;
    name: string;
    percentage: number;
    relationship:
      | 'charity'
      | 'child'
      | 'friend'
      | 'grandchild'
      | 'other'
      | 'parent'
      | 'sibling'
      | 'spouse';
    specificGifts?: string[];
  }>;

  // Additional properties for compatibility
  completeness_score: number;

  digitalAssets?: {
    accessInfo?: string;
    included: boolean;
    instructions?: string;
  };

  // Executor data structure
  executor_data: {
    backupExecutor?: {
      name: string;
      phone?: string;
      relationship: string;
    };
    executorPowers?: string[];
    primaryExecutor?: {
      name: string;
      phone?: string;
      relationship: string;
    };
  };

  // Legacy compatibility properties
  executors?: ExecutorAppointment[];

  family_protection_level: 'basic' | 'comprehensive' | 'premium' | 'standard';

  funeralInstructions?: FuneralWishes;
  // Guardianship appointments for minor children
  guardianship?: GuardianshipAppointment[];
  // Guardianship data structure
  guardianship_data: {
    backupGuardian?: {
      name: string;
      relationship: string;
    };
    guardianInstructions?: string;
    minorChildren?: Array<{
      dateOfBirth: string;
      name: string;
    }>;
    primaryGuardian?: {
      name: string;
      relationship: string;
    };
  };
  // Legal data structure
  legal_data: {
    additionalClauses?: string[];
    jurisdiction?: string;
    language?: string;
    legalFramework?: string;
  };
  legalValidation?: {
    errors: ValidationError[];
    isValid: boolean;
    warnings: ValidationError[];
  };
  notarization?: NotaryDetails;
  // Professional Review System Integration
  professional_review?: ProfessionalReview;
  residuaryEstate?: {
    beneficiaries: Beneficiary[];
    distribution: string;
  };
  review_eligibility: boolean;

  // Special instructions structure
  special_instructions: {
    charitableBequests?: Array<{
      amount: number;
      charity: string;
    }>;
    digitalAssets?: string;
    funeralWishes?: string;
    organDonation?: boolean;
    personalMessages?: Array<{
      message: string;
      recipient: string;
    }>;
    petCare?: string;
  };

  // Special provisions for advanced will features
  specialProvisions?: SpecialProvision[];

  specificBequests?: AssetDistribution[];
  // Additional testator_data property for component compatibility
  testator_data: {
    address?: string;
    citizenship?: string;
    dateOfBirth?: string;
    fullName?: string;
    maritalStatus?: 'divorced' | 'married' | 'single' | 'widowed';
  };
  testatorInfo?: {
    address: string;
    city: string;
    country: string;
    dateOfBirth: string;
    fullName: string;
    postalCode: string;
    state?: string;
  };
  trust_score?: TrustScore;

  witnesses?: WitnessSignature[];
}

// Will Builder Types
export interface WillBuilderState {
  completedSteps: number[];
  currentSection: WillSection;
  currentStep: number;
  totalSteps: number;
  validationStatus: ValidationStatus;
  will: Partial<Will>;
}

export type WillSection =
  | 'assets'
  | 'beneficiaries'
  | 'executors'
  | 'funeral_wishes'
  | 'guardianship'
  | 'personal_info'
  | 'review'
  | 'signatures'
  | 'special_instructions';

export interface ValidationStatus {
  completeness: number;
  errors: ValidationError[];
  isValid: boolean;
  missingRequired: string[];
  warnings: ValidationError[];
}

// Professional Network Integration
export interface WillReview {
  currency?: string;
  fee?: number;
  id: string;
  recommendations?: string[];
  review_notes?: string;
  reviewed_at?: string;
  reviewer_id: string;
  reviewer_type: 'financial_advisor' | 'lawyer' | 'notary';
  status: 'completed' | 'in_progress' | 'pending' | 'rejected';
  will_id: string;
}

export interface WillTemplate {
  description: string;
  id: string;
  is_active: boolean;
  jurisdiction: string;
  language: string;
  name: string;
  sections: WillTemplateSection[];
  variables: TemplateVariable[];
  will_type: WillType;
}

export interface WillTemplateSection {
  conditions?: string;
  content: string;
  help_text?: string;
  id: string;
  is_mandatory: boolean;
  order: number;
  title: string;
}

export interface TemplateVariable {
  default_value?: boolean | number | string;
  key: string;
  label: string;
  options?: { label: string; value: string }[];
  required: boolean;
  type: 'boolean' | 'date' | 'number' | 'select' | 'text';
  validation_rules?: Record<string, any>;
}

// Professional Review System Types
export interface ProfessionalReviewer {
  average_turnaround_hours: number;
  bar_number?: string;
  credentials: string;
  id: string;
  jurisdiction: string;
  name: string;
  profile_verified: boolean;
  rating: number; // 1-5 star rating
  reviews_completed: number;
  specializations: string[];
}

export interface ProfessionalReview {
  certification_level: 'basic' | 'legal_certified' | 'premium';
  completion_date?: string;
  document_id: string;
  family_protection_score: number; // 0-100
  id: string;
  legal_compliance_score: number; // 0-100
  recommended_changes?: string[];
  review_date: string;
  review_fee?: number;
  review_notes?: string;
  reviewer: ProfessionalReviewer;
  status: 'approved' | 'in_review' | 'needs_revision' | 'pending' | 'rejected';
}

export interface TrustScore {
  completeness_score: number; // Document completeness
  factors: TrustFactor[];
  family_protection_score: number; // How well it protects family
  last_updated: string;
  overall_score: number; // 0-100
  professional_score: number; // Professional review score
  validation_score: number; // Technical validation
}

export interface TrustFactor {
  description: string;
  improvement_suggestion?: string;
  name: string;
  score: number;
  weight: number;
}

// Export functions for will management
export const WILL_VALIDATION_RULES = {
  MIN_WITNESSES: 2,
  MIN_AGE: 18,
  MAX_BENEFICIARIES: 50,
  MAX_EXECUTORS: 4,
} as const;

export const DEFAULT_WILL_TEMPLATE: Partial<Will> = {
  will_type: 'simple',
  status: 'draft',
  version: 1,
  declarations: [],
  beneficiaries: [],
  asset_distributions: [],
  executor_appointments: [],
  completeness_score: 0,
};
