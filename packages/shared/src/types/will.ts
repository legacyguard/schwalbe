/**
 * Will Generation Types
 * Type definitions for will creation, validation, and management
 */

export type Jurisdiction = 'CZ' | 'SK';
export type WillLanguage = 'cs' | 'sk' | 'en' | 'de' | 'uk';
export type WillStatus = 'draft' | 'completed' | 'executed';

// Personal Information
export interface PersonalInfo {
  userId?: string;
  fullName: string;
  dateOfBirth: string;
  address: AddressInfo | string;
  citizenship: string;
  personalId?: string; // rodné číslo for CZ/SK
  email?: string;
  phone?: string;
}

export interface AddressInfo {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

// Family Information
export interface FamilyInfo {
  spouse?: SpouseInfo;
  children?: ChildInfo[];
  parents?: PersonInfo[];
}

export interface SpouseInfo {
  fullName: string;
  dateOfBirth?: string;
  citizenship?: string;
  isLiving: boolean;
}

export interface ChildInfo {
  fullName: string;
  dateOfBirth: string;
  isMinor?: boolean;
  citizenship?: string;
  specialNeeds?: string;
}

export interface PersonInfo {
  fullName: string;
  relationship: string;
  dateOfBirth?: string;
  isLiving: boolean;
}

// Assets
export interface AssetInfo {
  id?: string;
  type: 'real_estate' | 'bank_account' | 'investment' | 'personal_property' | 'business' | 'other';
  description: string;
  value?: number;
  currency?: string;
  location?: string;
  ownershipPercentage?: number;
  jointOwner?: string;
  accountNumber?: string;
  institutionName?: string;
  specialInstructions?: string;
}

// Beneficiaries
export interface BeneficiaryInfo {
  id?: string;
  name: string;
  relationship: string;
  share: BeneficiaryShare;
  contactInfo?: ContactInfo;
  conditions?: string;
  isCharitable?: boolean;
  taxId?: string;
}

export interface BeneficiaryShare {
  type: 'percentage' | 'amount' | 'specific_asset' | 'residuary';
  value: string | number;
  assetId?: string;
  description?: string;
}

// Executors
export interface ExecutorInfo {
  id?: string;
  name: string;
  type: 'primary' | 'alternate';
  relationship: string;
  contactInfo: ContactInfo;
  specialization?: string;
  isLawyer?: boolean;
  isProfessional?: boolean;
  compensation?: string;
  powers?: string[];
}

// Guardians for minor children
export interface GuardianshipInfo {
  id?: string;
  childrenCovered: string[]; // Names or IDs of children
  primaryGuardian: ExecutorInfo;
  alternateGuardian?: ExecutorInfo;
  specialInstructions?: string;
  financialProvisions?: string;
  guardianshipType: 'personal' | 'financial' | 'both';
}

// Contact Information
export interface ContactInfo {
  email?: string;
  phone?: string;
  address?: AddressInfo | string;
}

// Witnesses
export interface WitnessInfo {
  id?: string;
  name: string;
  age?: number;
  address?: AddressInfo | string;
  relationship?: string;
}

// Main Will Data Structure
export interface WillUserData {
  personal: PersonalInfo;
  family: FamilyInfo;
  assets: AssetInfo[];
  beneficiaries: BeneficiaryInfo[];
  executors: ExecutorInfo[];
  guardians?: GuardianshipInfo[];
  witnesses?: WitnessInfo[];
  specialInstructions?: string;
  digitalAssets?: DigitalAssetInfo[];
  funeralWishes?: FuneralWishesInfo;
  petCare?: PetCareInfo[];
}

// Digital Assets
export interface DigitalAssetInfo {
  id?: string;
  type: 'social_media' | 'cryptocurrency' | 'digital_files' | 'online_accounts' | 'other';
  platform?: string;
  accountId?: string;
  instructions: string;
  accessInfo?: string;
  designatedManager?: string;
}

// Funeral Wishes
export interface FuneralWishesInfo {
  type: 'burial' | 'cremation' | 'other';
  location?: string;
  specificRequests?: string;
  ceremonyType?: string;
  religiousAffiliation?: string;
  donateOrgans?: boolean;
  donateBody?: boolean;
}

// Pet Care
export interface PetCareInfo {
  id?: string;
  petName: string;
  petType: string;
  caregiverName: string;
  caregiverContact: ContactInfo;
  financialProvision?: number;
  specialInstructions?: string;
}

// Validation
export interface ValidationError {
  field: string;
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  legalReference?: string;
}

export interface WillValidationResult {
  isValid: boolean;
  completenessScore: number;
  errors: ValidationError[];
  warnings: ValidationError[];
  legalRequirementsMet: boolean;
  missingRequiredFields: string[];
  suggestedImprovements: string[];
}

// Templates
export interface WillTemplate {
  id: string;
  name: string;
  jurisdiction: Jurisdiction;
  language: WillLanguage;
  description: string;
  content: string; // Template content with placeholders
  variables: TemplateVariable[];
  legalRequirements: string[];
  version: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateVariable {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'array' | 'object';
  required: boolean;
  defaultValue?: any;
  validation?: ValidationRule;
  dataSource?: 'user' | 'beneficiary' | 'asset' | 'guardian' | 'executor';
  description?: string;
}

export interface ValidationRule {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  options?: string[];
}

// Jurisdiction Configuration
export interface WillJurisdictionConfig {
  jurisdiction: Jurisdiction;
  legalRequirements: LegalRequirements;
  templateDefaults: Record<string, any>;
  validationRules: Record<string, ValidationRule>;
  supportedLanguages: WillLanguage[];
}

export interface LegalRequirements {
  minimumAge: number;
  witnessRequirements: WitnessRequirements;
  forcedHeirship: boolean;
  notarizationRequired: boolean;
  registrationRequired: boolean;
  holographicWillsAllowed: boolean;
  jointWillsAllowed: boolean;
  livingWillsAllowed: boolean;
}

export interface WitnessRequirements {
  required: boolean;
  minimumCount: number;
  maximumCount?: number;
  ageRequirement?: number;
  relationshipRestrictions?: string[];
  competencyRequirements?: string[];
}

// Guardian Integration Types (re-exported for convenience)
export interface Guardian {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship?: string;
  is_active: boolean;
  is_will_executor: boolean;
  is_child_guardian: boolean;
  can_trigger_emergency: boolean;
  can_access_health_docs: boolean;
  can_access_financial_docs: boolean;
  emergency_contact_priority: number;
  notes?: string;
}

// Will Generation History
export interface WillGenerationHistory {
  id: string;
  willId: string;
  version: number;
  changes: WillChange[];
  generatedAt: string;
  generatedBy: string;
  reason?: string;
}

export interface WillChange {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: 'added' | 'modified' | 'deleted';
}