# Will Creation System - Data Model & API Contracts

## Database Schema

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
  parent_will_id UUID REFERENCES wills(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_wills_user_id ON wills(user_id);
CREATE INDEX idx_wills_status ON wills(status);
CREATE INDEX idx_wills_updated_at ON wills(updated_at DESC);
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

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,

  UNIQUE(jurisdiction, template_name, template_version)
);

-- Indexes
CREATE INDEX idx_will_templates_jurisdiction ON will_templates(jurisdiction);
CREATE INDEX idx_will_templates_active ON will_templates(is_active) WHERE is_active = true;
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
```

### Enums and Types

#### will_status
```sql
CREATE TYPE will_status AS ENUM (
  'draft',
  'in_progress',
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

### Row Level Security Policies

```sql
-- Enable RLS
ALTER TABLE wills ENABLE ROW LEVEL SECURITY;
ALTER TABLE will_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE will_drafts ENABLE ROW LEVEL SECURITY;

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
```

## Data Model

### Will Entity
```typescript
interface Will {
  id: string;
  userId: string;
  title: string;
  status: WillStatus;
  jurisdiction: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;

  // Core will data
  testatorData: TestatorData;
  beneficiaries: Beneficiary[];
  assets: AssetData;
  executorData: ExecutorData;
  guardianshipData?: GuardianshipData;
  specialInstructions?: SpecialInstructions;
  legalData: LegalData;
  documentData?: DocumentData;

  // Version control
  versionNumber: number;
  parentWillId?: string;
}
```

### LegalTemplate Entity
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
}
```

### Clause Entity
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
}
```

### Executor Entity
```typescript
interface Executor {
  id: string;
  willId: string;
  personId: string;
  role: ExecutorRole; // primary, backup
  powers: ExecutorPower[];
  compensation?: Compensation;
}
```

### LegalValidation Entity
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
}

interface RealEstateAsset {
  id: string;
  description: string;
  address: string;
  value: number;
  mortgageBalance?: number;
  recipient?: string; // Beneficiary ID
}

interface VehicleAsset {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  value: number;
  recipient?: string;
}
```

### Executor Data
```typescript
interface ExecutorData {
  primaryExecutor: Executor;
  backupExecutor?: Executor;
  executorPowers: string[];
  professionalExecutor?: boolean;
}

interface Executor {
  name: string;
  relationship: RelationshipType;
  address: string;
  phone: string;
  email: string;
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
}

interface MinorChild {
  name: string;
  dateOfBirth: string;
  specialNeeds?: string;
}

interface Guardian {
  name: string;
  relationship: RelationshipType;
  address: string;
  qualifications?: string;
}
```

### Special Instructions
```typescript
interface SpecialInstructions {
  funeralWishes?: string;
  organDonation?: boolean;
  petCare?: {
    pets: string[];
    caretaker: string;
    instructions: string;
  };
  digitalAssets?: {
    accounts: DigitalAsset[];
    instructions: string;
  };
  personalMessages?: PersonalMessage[];
  charitableBequests?: CharitableBequest[];
  otherInstructions?: string;
}

interface PersonalMessage {
  recipient: string; // Beneficiary name
  message: string;
}

interface CharitableBequest {
  charity: string;
  amount: number;
  purpose?: string;
}
```

### Legal Data
```typescript
interface LegalData {
  jurisdiction: string; // e.g., "US-California"
  witnessRequirements: number;
  notarizationRequired: boolean;
  selfProving: boolean;
  previousWills: string;
  specialProvisions?: string;
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
}
```

## API Contracts

### REST API Endpoints

#### Will Management
```typescript
// GET /api/wills
interface GetWillsRequest {
  status?: WillStatus;
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
}

interface CreateWillResponse {
  will: Will;
  draft: WillDraft;
}

// GET /api/wills/:id
interface GetWillResponse {
  will: Will;
}

// PUT /api/wills/:id
interface UpdateWillRequest {
  [key: string]: any; // Partial will data
}

interface UpdateWillResponse {
  will: Will;
}

// POST /api/wills/:id/generate-pdf
interface GeneratePdfRequest {
  includeWatermark?: boolean;
}

interface GeneratePdfResponse {
  pdfUrl: string;
  checksum: string;
}
```

#### Template Management
```typescript
// GET /api/templates
interface GetTemplatesRequest {
  jurisdiction?: string;
  limit?: number;
  offset?: number;
}

interface GetTemplatesResponse {
  templates: WillTemplate[];
  total: number;
}

// GET /api/templates/:id
interface GetTemplateResponse {
  template: WillTemplate;
}
```

#### Draft Management
```typescript
// GET /api/drafts/:sessionId
interface GetDraftResponse {
  draft: WillDraft;
}

// PUT /api/drafts/:sessionId
interface UpdateDraftRequest {
  stepNumber?: number;
  draftData: Partial<WillData>;
}

interface UpdateDraftResponse {
  draft: WillDraft;
}

// POST /api/drafts/:sessionId/complete
interface CompleteDraftRequest {
  confirmLegalReview?: boolean;
}

interface CompleteDraftResponse {
  will: Will;
  pdfUrl: string;
}
```

### GraphQL Schema

```graphql
type Query {
  wills(status: WillStatus, limit: Int, offset: Int): WillConnection!
  will(id: ID!): Will
  templates(jurisdiction: String, limit: Int, offset: Int): TemplateConnection!
  template(id: ID!): WillTemplate
  draft(sessionId: String!): WillDraft
}

type Mutation {
  createWill(input: CreateWillInput!): CreateWillPayload!
  updateWill(id: ID!, input: UpdateWillInput!): UpdateWillPayload!
  deleteWill(id: ID!): DeleteWillPayload!
  generatePdf(id: ID!, input: GeneratePdfInput): GeneratePdfPayload!
  updateDraft(sessionId: String!, input: UpdateDraftInput!): UpdateDraftPayload!
  completeDraft(sessionId: String!, input: CompleteDraftInput!): CompleteDraftPayload!
}

type Will {
  id: ID!
  userId: String!
  title: String!
  status: WillStatus!
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
}

type ContactInfo {
  email: String
  phone: String
  address: String
}

enum WillStatus {
  DRAFT
  IN_PROGRESS
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
CREATE TYPE will_status AS ENUM ('draft', 'in_progress', 'completed', 'archived');
CREATE TYPE relationship_type AS ENUM ('spouse', 'child', 'parent', 'sibling', 'grandchild', 'friend', 'charity', 'other');

-- Create tables
CREATE TABLE wills (...);
CREATE TABLE will_templates (...);
CREATE TABLE will_drafts (...);

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
  document_data, version_number
)
SELECT
  id, user_id, title, status, created_at, updated_at,
  testator_data, beneficiaries, assets, executor_data,
  guardianship_data, special_instructions, legal_data,
  document_data, version_number
FROM hollywood.wills;
```

This data model provides a comprehensive foundation for the will creation system, supporting complex legal requirements while maintaining flexibility and security.