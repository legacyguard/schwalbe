
// OCR and Document Processing Types

export interface OCRResult {
  boundingBoxes: BoundingBox[];
  confidence: number;
  detectedLanguage: string;
  metadata: OCRMetadata;
  text: string;
}

export interface BoundingBox {
  height: number;
  width: number;
  x: number;
  y: number;
}

export interface OCRMetadata {
  extractedEntities: ExtractedEntity[];
  imageSize: {
    height: number;
    width: number;
  };
  processingTime: number;
  textBlocks: TextBlock[];
}

export interface TextBlock {
  boundingBox: BoundingBox;
  confidence: number;
  text: string;
  type: 'line' | 'paragraph' | 'word';
}

export interface ExtractedEntity {
  boundingBox?: BoundingBox;
  confidence: number;
  type: EntityType;
  value: string;
}

export type EntityType =
  | 'account_number'
  | 'address'
  | 'amount'
  | 'date'
  | 'email'
  | 'name'
  | 'organization'
  | 'phone'
  | 'policy_number'
  | 'signature'
  | 'ssn';

// Document Categories based on LegacyGuard context
export type DocumentCategory =
  | 'business'
  | 'financial'
  | 'government'
  | 'insurance'
  | 'legal'
  | 'medical'
  | 'other'
  | 'personal'
  | 'property';

export type DocumentType =
  // Legal Documents
  | 'adoption_papers'
  | 'auto_insurance'
  | 'bank_statement'
  | 'birth_certificate'
  | 'business_contract'
  | 'business_license'
  | 'business_tax'
  | 'contract'

  // Financial Documents
  | 'correspondence'
  | 'credit_card_statement'
  | 'disability_insurance'
  | 'divorce_decree'
  | 'drivers_license'
  | 'financial_statement'
  | 'government_benefit'
  | 'health_insurance'

  // Medical Documents
  | 'health_insurance_card'
  | 'home_appraisal'
  | 'home_insurance'
  | 'investment_account'
  | 'life_insurance'

  // Insurance Documents
  | 'living_will'
  | 'loan_document'
  | 'manual'
  | 'marriage_certificate'
  | 'medical_directive'

  // Personal Documents
  | 'medical_record'
  | 'military_records'
  | 'mortgage'
  | 'other'
  | 'passport'

  // Property Documents
  | 'power_of_attorney'
  | 'prescription'
  | 'property_deed'
  | 'property_tax'

  // Business Documents
  | 'receipt'
  | 'retirement_account'
  | 'social_security_card'

  // Government Documents
  | 'tax_document'
  | 'tax_return'
  | 'trust'

  // Other
  | 'utility_bill'
  | 'vaccination_record'
  | 'voter_registration'
  | 'warranty'
  | 'will';

export interface DocumentClassification {
  category: DocumentCategory;
  confidence: number;
  reasons: string[];
  suggestedTags: string[];
  type: DocumentType;
}

export interface ProcessedDocument {
  classification: DocumentClassification;
  createdAt: string;
  extractedMetadata: DocumentMetadata;
  id: string;
  ocrResult: OCRResult;
  originalFileName: string;
  processingError?: string;
  processingStatus: 'completed' | 'failed' | 'pending' | 'processing';
  updatedAt: string;
}

export interface DocumentMetadata {
  // Financial specific
  accountNumber?: string;
  address?: string;
  amount?: string;
  assessedValue?: string;
  balance?: string;

  coverageAmount?: string;
  // Custom fields
  customFields?: Record<string, string>;
  date?: string;

  dateOfBirth?: string;
  deductible?: string;
  diagnosis?: string;
  doctorName?: string;

  expirationDate?: string;
  // Personal identity
  fullName?: string;
  idNumber?: string;
  institutionName?: string;

  issuer?: string;
  jurisdiction?: string;
  // Legal specific
  legalEntity?: string;
  medicationList?: string[];

  ownerName?: string;
  // Medical specific
  patientName?: string;
  // Insurance specific
  policyNumber?: string;
  // Property specific
  propertyAddress?: string;

  recipient?: string;
  // Common metadata
  title?: string;
  transactionDate?: string;

  witnessRequired?: boolean;
}

// Document processing configuration
export interface OCRProcessingConfig {
  confidenceThreshold: number;
  enableDocumentClassification: boolean;
  enableEntityExtraction: boolean;
  enableMetadataExtraction: boolean;
  languageHints?: string[];
  processingMode: 'accurate' | 'fast';
}

// API request/response types
export interface OCRProcessingRequest {
  config: OCRProcessingConfig;
  fileData: string; // base64 encoded
  fileName: string;
}

export interface OCRProcessingResponse {
  error?: string;
  processedDocument?: ProcessedDocument;
  processingId: string;
  success: boolean;
}

// Document categorization patterns
export const DOCUMENT_PATTERNS: Record<
  DocumentType,
  {
    category: DocumentCategory;
    keywords: string[];
    patterns: RegExp[];
    requiredEntities?: EntityType[];
  }
> = {
  // Legal Documents
  will: {
    keywords: [
      'last will',
      'testament',
      'executor',
      'beneficiary',
      'estate',
      'bequest',
    ],
    patterns: [
      /last\s+will\s+and\s+testament/i,
      /hereby\s+revoke/i,
      /sound\s+mind/i,
    ],
    category: 'legal',
    requiredEntities: ['name', 'signature'],
  },
  trust: {
    keywords: [
      'trust agreement',
      'trustee',
      'grantor',
      'settlor',
      'trust fund',
    ],
    patterns: [
      /trust\s+agreement/i,
      /revocable\s+trust/i,
      /irrevocable\s+trust/i,
    ],
    category: 'legal',
  },
  power_of_attorney: {
    keywords: ['power of attorney', 'attorney-in-fact', 'agent', 'principal'],
    patterns: [/power\s+of\s+attorney/i, /attorney.in.fact/i],
    category: 'legal',
  },

  // Financial Documents
  bank_statement: {
    keywords: [
      'bank statement',
      'account summary',
      'balance',
      'transaction',
      'deposit',
      'withdrawal',
    ],
    patterns: [
      /account\s+balance/i,
      /statement\s+period/i,
      /routing\s+number/i,
    ],
    category: 'financial',
    requiredEntities: ['account_number', 'amount'],
  },
  tax_return: {
    keywords: [
      'form 1040',
      'tax return',
      'irs',
      'adjusted gross income',
      'tax liability',
    ],
    patterns: [/form\s+1040/i, /tax\s+year/i, /adjusted\s+gross\s+income/i],
    category: 'financial',
  },

  // Medical Documents
  medical_record: {
    keywords: [
      'patient',
      'diagnosis',
      'treatment',
      'medical history',
      'physician',
    ],
    patterns: [/patient\s+name/i, /date\s+of\s+birth/i, /diagnosis/i],
    category: 'medical',
    requiredEntities: ['name', 'date'],
  },

  // Insurance Documents
  life_insurance: {
    keywords: [
      'life insurance',
      'policy',
      'beneficiary',
      'death benefit',
      'premium',
    ],
    patterns: [
      /life\s+insurance\s+policy/i,
      /death\s+benefit/i,
      /policy\s+number/i,
    ],
    category: 'insurance',
    requiredEntities: ['policy_number', 'amount'],
  },

  // Personal Documents
  birth_certificate: {
    keywords: [
      'birth certificate',
      'date of birth',
      'place of birth',
      'parents',
    ],
    patterns: [
      /certificate\s+of\s+birth/i,
      /born\s+on/i,
      /place\s+of\s+birth/i,
    ],
    category: 'personal',
    requiredEntities: ['name', 'date'],
  },

  // Property Documents
  property_deed: {
    keywords: ['deed', 'property', 'grantor', 'grantee', 'real estate'],
    patterns: [
      /warranty\s+deed/i,
      /quit\s+claim\s+deed/i,
      /property\s+description/i,
    ],
    category: 'property',
    requiredEntities: ['name', 'address'],
  },

  // Default for other types
  other: {
    keywords: [],
    patterns: [],
    category: 'other',
  },

  // Add minimal patterns for remaining types
  living_will: { keywords: ['living will'], patterns: [], category: 'legal' },
  marriage_certificate: {
    keywords: ['marriage certificate'],
    patterns: [],
    category: 'personal',
  },
  divorce_decree: {
    keywords: ['divorce decree'],
    patterns: [],
    category: 'legal',
  },
  adoption_papers: { keywords: ['adoption'], patterns: [], category: 'legal' },
  contract: {
    keywords: ['contract', 'agreement'],
    patterns: [],
    category: 'legal',
  },
  investment_account: {
    keywords: ['investment', 'portfolio'],
    patterns: [],
    category: 'financial',
  },
  retirement_account: {
    keywords: ['401k', 'ira', 'retirement'],
    patterns: [],
    category: 'financial',
  },
  loan_document: { keywords: ['loan'], patterns: [], category: 'financial' },
  mortgage: { keywords: ['mortgage'], patterns: [], category: 'financial' },
  credit_card_statement: {
    keywords: ['credit card'],
    patterns: [],
    category: 'financial',
  },
  financial_statement: {
    keywords: ['financial statement'],
    patterns: [],
    category: 'financial',
  },
  prescription: {
    keywords: ['prescription'],
    patterns: [],
    category: 'medical',
  },
  medical_directive: {
    keywords: ['medical directive'],
    patterns: [],
    category: 'medical',
  },
  health_insurance_card: {
    keywords: ['health insurance'],
    patterns: [],
    category: 'insurance',
  },
  vaccination_record: {
    keywords: ['vaccination'],
    patterns: [],
    category: 'medical',
  },
  health_insurance: {
    keywords: ['health insurance'],
    patterns: [],
    category: 'insurance',
  },
  auto_insurance: {
    keywords: ['auto insurance'],
    patterns: [],
    category: 'insurance',
  },
  home_insurance: {
    keywords: ['home insurance'],
    patterns: [],
    category: 'insurance',
  },
  disability_insurance: {
    keywords: ['disability insurance'],
    patterns: [],
    category: 'insurance',
  },
  passport: { keywords: ['passport'], patterns: [], category: 'personal' },
  drivers_license: {
    keywords: ['drivers license'],
    patterns: [],
    category: 'personal',
  },
  social_security_card: {
    keywords: ['social security'],
    patterns: [],
    category: 'personal',
  },
  military_records: {
    keywords: ['military'],
    patterns: [],
    category: 'personal',
  },
  property_tax: {
    keywords: ['property tax'],
    patterns: [],
    category: 'property',
  },
  home_appraisal: {
    keywords: ['appraisal'],
    patterns: [],
    category: 'property',
  },
  utility_bill: {
    keywords: ['utility', 'electric', 'gas', 'water'],
    patterns: [],
    category: 'property',
  },
  business_license: {
    keywords: ['business license'],
    patterns: [],
    category: 'business',
  },
  business_contract: {
    keywords: ['business contract'],
    patterns: [],
    category: 'business',
  },
  business_tax: {
    keywords: ['business tax'],
    patterns: [],
    category: 'business',
  },
  tax_document: { keywords: ['tax'], patterns: [], category: 'government' },
  government_benefit: {
    keywords: ['social security', 'medicare', 'medicaid'],
    patterns: [],
    category: 'government',
  },
  voter_registration: {
    keywords: ['voter registration'],
    patterns: [],
    category: 'government',
  },
  receipt: { keywords: ['receipt'], patterns: [], category: 'other' },
  warranty: { keywords: ['warranty'], patterns: [], category: 'other' },
  manual: {
    keywords: ['manual', 'instructions'],
    patterns: [],
    category: 'other',
  },
  correspondence: {
    keywords: ['letter', 'correspondence'],
    patterns: [],
    category: 'other',
  },
};
