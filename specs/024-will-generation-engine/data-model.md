# Will Generation Engine - Data Model & API Contracts

## Database Schema

### Conventions (required)

- Identity: Supabase Auth (auth.uid()).
- FKs: user_id uuid not null references auth.users(id) on delete cascade; prefer UUID over TEXT for user IDs; apply consistently to user-owned tables.
- RLS: enable on all tables; owner-only default; write positive/negative tests per 005-auth-rls-baseline.
- Naming: snake_case; timestamps created_at and updated_at as timestamptz.
- Secrets: Service role keys used only in server contexts (Edge Functions); never in client.

### Core Tables

#### wills

```sql
CREATE TABLE wills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,

  -- Metadata
  title TEXT NOT NULL DEFAULT 'My Last Will and Testament',
  status will_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Personal Information
  testator_data JSONB NOT NULL DEFAULT '{}',

  -- Beneficiaries and inheritance
  beneficiaries JSONB NOT NULL DEFAULT '[]',

  -- Assets and property
  assets JSONB NOT NULL DEFAULT '{}',

  -- Executor information
  executor_data JSONB NOT NULL DEFAULT '{}',

  -- Guardian information (for minor children)
  guardianship_data JSONB NOT NULL DEFAULT '{}',

  -- Special instructions and wishes
  special_instructions JSONB NOT NULL DEFAULT '{}',

  -- Legal and technical data
  legal_data JSONB NOT NULL DEFAULT '{}',

  -- Generated document data
  document_data JSONB NOT NULL DEFAULT '{}',

  -- Version control
  version_number INTEGER DEFAULT 1,
  parent_will_id UUID REFERENCES wills(id) ON DELETE SET NULL,

  -- Jurisdiction and language
  jurisdiction TEXT NOT NULL DEFAULT 'US-General',
  language TEXT NOT NULL DEFAULT 'en'
);

-- Indexes
CREATE INDEX idx_wills_user_id ON wills(user_id);
CREATE INDEX idx_wills_status ON wills(status);
CREATE INDEX idx_wills_updated_at ON wills(updated_at DESC);
CREATE INDEX idx_wills_jurisdiction ON wills(jurisdiction);
CREATE INDEX idx_wills_parent_will ON wills(parent_will_id) WHERE parent_will_id IS NOT NULL;
```

#### will_templates

```sql
CREATE TABLE will_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  jurisdiction TEXT NOT NULL,
  template_name TEXT NOT NULL,
  template_version TEXT NOT NULL DEFAULT '1.0',

  -- Template structure and clauses
  template_structure JSONB NOT NULL,

  -- Jurisdiction-specific requirements
  legal_requirements JSONB NOT NULL DEFAULT '{}',

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_by TEXT,

  UNIQUE(jurisdiction, template_name, template_version)
);

-- Indexes
CREATE INDEX idx_will_templates_jurisdiction ON will_templates(jurisdiction);
CREATE INDEX idx_will_templates_active ON will_templates(is_active) WHERE is_active = true;
CREATE INDEX idx_will_templates_name ON will_templates(template_name);
```

#### will_drafts

```sql
CREATE TABLE will_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  will_id UUID REFERENCES wills(id) ON DELETE CASCADE,

  -- Draft data
  draft_data JSONB NOT NULL DEFAULT '{}',
  step_number INTEGER DEFAULT 1,
  total_steps INTEGER DEFAULT 8,

  -- Session management
  session_id TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, session_id)
);

-- Indexes
CREATE INDEX idx_will_drafts_user_id ON will_drafts(user_id);
CREATE INDEX idx_will_drafts_expires_at ON will_drafts(expires_at);
CREATE INDEX idx_will_drafts_session ON will_drafts(session_id);
```

#### will_versions

```sql
CREATE TABLE will_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  will_id UUID NOT NULL REFERENCES wills(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  version_data JSONB NOT NULL,
  change_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,

  UNIQUE(will_id, version_number)
);

-- Indexes
CREATE INDEX idx_will_versions_will_id ON will_versions(will_id);
CREATE INDEX idx_will_versions_number ON will_versions(version_number);
```

### Enums and Types

#### will_status

```sql
CREATE TYPE will_status AS ENUM (
  'draft',
  'in_progress',
  'review',
  'completed',
  'archived'
);
```

#### relationship_type

```sql
CREATE TYPE relationship_type AS ENUM (
  'spouse',
  'child',
  'parent',
  'sibling',
  'grandchild',
  'friend',
  'charity',
  'other'
);
```

#### asset_type

```sql
CREATE TYPE asset_type AS ENUM (
  'real_estate',
  'bank_account',
  'investment',
  'vehicle',
  'personal_property',
  'digital_asset',
  'business',
  'other'
);
```

### Row Level Security Policies

```sql
-- Enable RLS
ALTER TABLE wills ENABLE ROW LEVEL SECURITY;
ALTER TABLE will_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE will_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE will_versions ENABLE ROW LEVEL SECURITY;

-- Wills policies
CREATE POLICY "Users can view own wills" ON wills
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own wills" ON wills
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own wills" ON wills
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own wills" ON wills
  FOR DELETE USING (auth.uid()::text = user_id);

-- Templates policies (read-only for authenticated users)
CREATE POLICY "Authenticated users can view templates" ON will_templates
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

-- Drafts policies
CREATE POLICY "Users can manage own drafts" ON will_drafts
  FOR ALL USING (auth.uid()::text = user_id);

-- Versions policies
CREATE POLICY "Users can view own will versions" ON will_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wills
      WHERE wills.id = will_versions.will_id
      AND wills.user_id = auth.uid()::text
    )
  );
```

## Data Model

### WillEngine Entity

```typescript
interface WillEngine {
  id: string;
  name: string;
  version: string;
  status: EngineStatus;
  configuration: EngineConfig;
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;

  // Engine capabilities
  supportedJurisdictions: string[];
  supportedLanguages: string[];
  features: EngineFeature[];
}
```

### LegalTemplate Entity

```typescript
interface LegalTemplate {
  id: string;
  name: string;
  jurisdiction: string;
  language: string;
  version: string;
  status: TemplateStatus;
  category: TemplateCategory;

  // Template content
  structure: TemplateStructure;
  clauses: Clause[];
  variables: TemplateVariable[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  legalReviewDate?: Date;
}
```

### Clause Entity

```typescript
interface Clause {
  id: string;
  templateId: string;
  name: string;
  type: ClauseType;
  content: string;
  order: number;
  required: boolean;

  // Conditional logic
  conditions?: ClauseCondition[];
  variables?: ClauseVariable[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

### JurisdictionRule Entity

```typescript
interface JurisdictionRule {
  id: string;
  jurisdiction: string;
  ruleType: RuleType;
  name: string;
  description: string;
  requirements: RuleRequirement[];
  version: string;
  effectiveDate: Date;
  expiryDate?: Date;

  // Validation
  validationRules: ValidationRule[];
  errorMessages: Record<string, string>;
}
```

### WillDocument Entity

```typescript
interface WillDocument {
  id: string;
  willId: string;
  version: string;
  format: DocumentFormat;
  status: DocumentStatus;

  // Document content
  content: string;
  metadata: DocumentMetadata;
  checksum: string;

  // Generation info
  generatedAt: Date;
  generatedBy: string;
  generationTime: number;

  // Storage
  storagePath: string;
  fileSize: number;
}
```

### LegalValidation Entity

```typescript
interface LegalValidation {
  id: string;
  documentId: string;
  jurisdiction: string;
  validationType: ValidationType;
  status: ValidationStatus;

  // Results
  results: ValidationResult[];
  errors: ValidationError[];
  warnings: ValidationWarning[];

  // Metadata
  validatedAt: Date;
  validatedBy?: string;
  validationTime: number;
}
```

### LegalTemplate Relations

```typescript
interface LegalTemplate {
  id: string;
  jurisdiction: string;
  templateName: string;
  templateVersion: string;
  templateStructure: TemplateStructure;
  legalRequirements: LegalRequirements;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}
```

### Clause Relations

```typescript
interface Clause {
  id: string;
  templateId: string;
  clauseType: ClauseType;
  content: string;
  order: number;
  required: boolean;
  conditions?: ClauseCondition[];
  variables: ClauseVariable[];
  translations?: Record<string, string>;
}
```

### Bequest Entity

```typescript
interface Bequest {
  id: string;
  willId: string;
  beneficiaryId: string;
  assetType: AssetType;
  assetId: string;
  percentage?: number;
  specificAmount?: number;
  conditions?: string;
  description: string;
}
```

### LegalValidation Relations

```typescript
interface LegalValidation {
  id: string;
  willId: string;
  jurisdiction: string;
  validationType: ValidationType;
  status: ValidationStatus;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  validatedAt: Date;
  validatedBy?: string;
}
```

## Relations Between Entities

### Will → Beneficiaries (1:N)

- One will can have multiple beneficiaries
- Beneficiaries can have different inheritance percentages
- Supports conditional bequests and specific gifts

### Will → Assets (1:N)

- Assets are categorized by type (real estate, vehicles, accounts, etc.)
- Each asset can be assigned to specific beneficiaries
- Supports percentage-based and specific amount distributions

### Will → Executors (1:N)

- Primary executor with backup options
- Different power levels and responsibilities
- Professional executor support

### Template → Clauses (1:N)

- Templates contain multiple clauses
- Clauses have specific ordering and conditions
- Variable substitution within clauses

### Will → LegalValidations (1:N)

- Multiple validation checks per will
- Jurisdiction-specific validations
- Historical validation records

## Data Structures

### Testator Data

```typescript
interface TestatorData {
  fullName: string;
  dateOfBirth: string;
  address: Address;
  citizenship: string;
  maritalStatus: MaritalStatus;
  occupation?: string;
  ssn?: string;
  phone?: string;
  email?: string;
}
```

### Beneficiary Data

```typescript
interface Beneficiary {
  id: string;
  name: string;
  relationship: RelationshipType;
  percentage: number; // 0-100
  specificGifts?: string[];
  conditions?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  isBackup?: boolean; // For contingent beneficiaries
  dateOfBirth?: string;
  identification?: string;
}
```

### Asset Data

```typescript
interface AssetData {
  realEstate?: RealEstateAsset[];
  vehicles?: VehicleAsset[];
  bankAccounts?: BankAccountAsset[];
  investments?: InvestmentAsset[];
  personalProperty?: PersonalPropertyAsset[];
  digitalAssets?: DigitalAsset[];
  businessInterests?: BusinessAsset[];
}

interface RealEstateAsset {
  id: string;
  description: string;
  address: string;
  value: number;
  mortgageBalance?: number;
  recipient?: string; // Beneficiary ID
  ownershipPercentage?: number;
}

interface BankAccountAsset {
  id: string;
  bankName: string;
  accountNumber: string;
  accountType: string;
  value: number;
  recipient?: string;
  jointOwner?: string;
}
```

### Executor Data

```typescript
interface ExecutorData {
  primaryExecutor: Executor;
  backupExecutor?: Executor;
  executorPowers: ExecutorPower[];
  professionalExecutor?: boolean;
  compensation?: Compensation;
}

interface Executor {
  name: string;
  relationship: RelationshipType;
  address: Address;
  phone: string;
  email: string;
  qualifications?: string;
  isProfessional?: boolean;
}

interface ExecutorPower {
  power: string;
  description: string;
  limitations?: string;
}
```

### Guardianship Data

```typescript
interface GuardianshipData {
  minorChildren: MinorChild[];
  primaryGuardian: Guardian;
  backupGuardian?: Guardian;
  guardianInstructions: string;
  trustInstructions?: string;
  assetsForMinors?: AssetForMinor[];
}

interface MinorChild {
  name: string;
  dateOfBirth: string;
  specialNeeds?: string;
  relationship: RelationshipType;
}

interface Guardian {
  name: string;
  relationship: RelationshipType;
  address: Address;
  qualifications?: string;
  contactInfo: ContactInfo;
}
```

### Special Instructions

```typescript
interface SpecialInstructions {
  funeralWishes?: FuneralWishes;
  organDonation?: boolean;
  petCare?: PetCareInstructions;
  digitalAssets?: DigitalAssetInstructions;
  personalMessages?: PersonalMessage[];
  charitableBequests?: CharitableBequest[];
  otherInstructions?: string;
}

interface FuneralWishes {
  type: 'burial' | 'cremation' | 'other';
  location?: string;
  memorialPreferences?: string;
  prepaidArrangements?: boolean;
  providerDetails?: string;
  specificInstructions?: string;
}

interface PetCareInstructions {
  pets: Pet[];
  caretaker: Person;
  instructions: string;
  funding?: Funding;
}

interface DigitalAssetInstructions {
  accounts: DigitalAccount[];
  instructions: string;
  executorAccess: boolean;
}
```

### Legal Data

```typescript
interface LegalData {
  jurisdiction: string; // e.g., "US-California"
  witnessRequirements: WitnessRequirements;
  notarizationRequired: boolean;
  selfProving: boolean;
  previousWills: string;
  specialProvisions?: string;
  language: string;
  legalFramework: string;
}

interface WitnessRequirements {
  count: number;
  qualifications?: string[];
  exclusions?: string[];
}
```

### Document Data

```typescript
interface DocumentData {
  generatedPdfPath: string;
  pdfSize: number;
  generationDate: string; // ISO date string
  templateVersion: string;
  pageCount: number;
  checksum: string; // For integrity verification
  digitalSignature?: DigitalSignature;
  accessibilityScore?: number;
}

interface DigitalSignature {
  signed: boolean;
  signedAt?: string;
  signatureMethod: string;
  certificateInfo?: CertificateInfo;
}
```

## API Contracts

### REST API Endpoints

#### Will Management

```typescript
// GET /api/wills
interface GetWillsRequest {
  status?: WillStatus;
  jurisdiction?: string;
  limit?: number;
  offset?: number;
}

interface GetWillsResponse {
  wills: Will[];
  total: number;
  hasMore: boolean;
}

// POST /api/wills
interface CreateWillRequest {
  title?: string;
  jurisdiction: string;
  language?: string;
  templateId?: string;
}

interface CreateWillResponse {
  will: Will;
  draft: WillDraft;
}

// GET /api/wills/:id
interface GetWillResponse {
  will: Will;
  validationResults?: ValidationResult[];
}

// PUT /api/wills/:id
interface UpdateWillRequest {
  [key: string]: any; // Partial will data
}

interface UpdateWillResponse {
  will: Will;
  validationResults?: ValidationResult[];
}

// POST /api/wills/:id/generate-pdf
interface GeneratePdfRequest {
  includeWatermark?: boolean;
  language?: string;
}

interface GeneratePdfResponse {
  pdfUrl: string;
  checksum: string;
  documentData: DocumentData;
}
```

#### Template Management

```typescript
// GET /api/templates
interface GetTemplatesRequest {
  jurisdiction?: string;
  language?: string;
  limit?: number;
  offset?: number;
}

interface GetTemplatesResponse {
  templates: LegalTemplate[];
  total: number;
}

// GET /api/templates/:id
interface GetTemplateResponse {
  template: LegalTemplate;
}

// POST /api/templates/:id/validate
interface ValidateTemplateRequest {
  willData: Partial<WillData>;
}

interface ValidateTemplateResponse {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
}
```

#### Draft Management

```typescript
// GET /api/drafts/:sessionId
interface GetDraftResponse {
  draft: WillDraft;
  will: Will;
}

// PUT /api/drafts/:sessionId
interface UpdateDraftRequest {
  stepNumber?: number;
  draftData: Partial<WillData>;
}

interface UpdateDraftResponse {
  draft: WillDraft;
  validationResults: ValidationResult[];
}

// POST /api/drafts/:sessionId/complete
interface CompleteDraftRequest {
  confirmLegalReview?: boolean;
}

interface CompleteDraftResponse {
  will: Will;
  pdfUrl: string;
  validationResults: ValidationResult[];
}
```

### GraphQL Schema

```graphql
type Query {
  wills(status: WillStatus, jurisdiction: String, limit: Int, offset: Int): WillConnection!
  will(id: ID!): Will
  templates(jurisdiction: String, language: String, limit: Int, offset: Int): TemplateConnection!
  template(id: ID!): LegalTemplate
  draft(sessionId: String!): WillDraft
  willVersions(willId: ID!, limit: Int, offset: Int): WillVersionConnection!
}

type Mutation {
  createWill(input: CreateWillInput!): CreateWillPayload!
  updateWill(id: ID!, input: UpdateWillInput!): UpdateWillPayload!
  deleteWill(id: ID!): DeleteWillPayload!
  generatePdf(id: ID!, input: GeneratePdfInput): GeneratePdfPayload!
  updateDraft(sessionId: String!, input: UpdateDraftInput!): UpdateDraftPayload!
  completeDraft(sessionId: String!, input: CompleteDraftInput!): CompleteDraftPayload!
  createWillVersion(willId: ID!, changeSummary: String): CreateWillVersionPayload!
}

type Will {
  id: ID!
  userId: String!
  title: String!
  status: WillStatus!
  jurisdiction: String!
  language: String!
  createdAt: DateTime!
  updatedAt: DateTime!
  completedAt: DateTime

  testatorData: JSONObject!
  beneficiaries: [Beneficiary!]!
  assets: JSONObject!
  executorData: JSONObject!
  guardianshipData: JSONObject!
  specialInstructions: JSONObject!
  legalData: JSONObject!
  documentData: JSONObject!

  versionNumber: Int!
  parentWill: Will
  versions: [WillVersion!]!
}

type Beneficiary {
  id: String!
  name: String!
  relationship: RelationshipType!
  percentage: Float!
  specificGifts: [String!]
  conditions: String
  contactInfo: ContactInfo
  isBackup: Boolean
  dateOfBirth: String
  identification: String
}

type ContactInfo {
  email: String
  phone: String
  address: Address
}

type Address {
  street: String
  city: String
  state: String
  zipCode: String
  country: String
}

enum WillStatus {
  DRAFT
  IN_PROGRESS
  REVIEW
  COMPLETED
  ARCHIVED
}

enum RelationshipType {
  SPOUSE
  CHILD
  PARENT
  SIBLING
  GRANDCHILD
  FRIEND
  CHARITY
  OTHER
}
```

### WebSocket Events

```typescript
// Real-time updates for collaborative editing
interface WebSocketEvents {
  'will:updated': {
    willId: string;
    userId: string;
    changes: Partial<WillData>;
    timestamp: string;
  };

  'draft:saved': {
    sessionId: string;
    stepNumber: number;
    timestamp: string;
  };

  'pdf:generated': {
    willId: string;
    pdfUrl: string;
    checksum: string;
    timestamp: string;
  };

  'validation:completed': {
    willId: string;
    results: ValidationResult[];
    timestamp: string;
  };
}
```

## Validation Schemas

### JSON Schema for Will Data

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "testatorData": {
      "type": "object",
      "required": ["fullName", "dateOfBirth", "address", "citizenship"],
      "properties": {
        "fullName": { "type": "string", "minLength": 2 },
        "dateOfBirth": { "type": "string", "format": "date" },
        "address": {
          "type": "object",
          "required": ["street", "city", "country"],
          "properties": {
            "street": { "type": "string" },
            "city": { "type": "string" },
            "state": { "type": "string" },
            "zipCode": { "type": "string" },
            "country": { "type": "string" }
          }
        },
        "citizenship": { "type": "string" },
        "maritalStatus": {
          "enum": ["single", "married", "divorced", "widowed"]
        }
      }
    },
    "beneficiaries": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["name", "relationship", "percentage"],
        "properties": {
          "name": { "type": "string" },
          "relationship": { "type": "string" },
          "percentage": { "type": "number", "minimum": 0, "maximum": 100 }
        }
      }
    }
  }
}
```

## Migration Scripts

### Initial Schema Creation

```sql
-- Create types
CREATE TYPE will_status AS ENUM ('draft', 'in_progress', 'review', 'completed', 'archived');
CREATE TYPE relationship_type AS ENUM ('spouse', 'child', 'parent', 'sibling', 'grandchild', 'friend', 'charity', 'other');
CREATE TYPE asset_type AS ENUM ('real_estate', 'bank_account', 'investment', 'vehicle', 'personal_property', 'digital_asset', 'business', 'other');

-- Create tables
CREATE TABLE wills (...);
CREATE TABLE will_templates (...);
CREATE TABLE will_drafts (...);
CREATE TABLE will_versions (...);

-- Create indexes
CREATE INDEX idx_wills_user_id ON wills(user_id);
-- ... other indexes

-- Enable RLS
ALTER TABLE wills ENABLE ROW LEVEL SECURITY;
-- ... other RLS enables

-- Create policies
CREATE POLICY "Users can view own wills" ON wills FOR SELECT USING (auth.uid()::text = user_id);
-- ... other policies
```

### Data Migration from Hollywood

```sql
-- Migrate existing wills
INSERT INTO wills (
  id, user_id, title, status, created_at, updated_at,
  testator_data, beneficiaries, assets, executor_data,
  guardianship_data, special_instructions, legal_data,
  document_data, version_number, jurisdiction, language
)
SELECT
  id, user_id, title, status, created_at, updated_at,
  testator_data, beneficiaries, assets, executor_data,
  guardianship_data, special_instructions, legal_data,
  document_data, version_number,
  COALESCE(legal_data->>'jurisdiction', 'US-General'),
  COALESCE(legal_data->>'language', 'en')
FROM hollywood.wills;
```

This data model provides a comprehensive foundation for the will creation system, supporting complex legal requirements while maintaining flexibility and security.
