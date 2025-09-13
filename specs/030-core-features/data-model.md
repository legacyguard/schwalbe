# Data Model: Core Features Interfaces & Schemas

## Sofia AI System Contracts

### **Core Sofia Types**

```typescript
// Sofia Message System
interface SofiaMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  personality?: SofiaPersonality;
  actions?: ActionButton[];
  cost_tier?: 'free' | 'low_cost' | 'premium';
  metadata?: MessageMetadata;
}

interface ActionButton {
  id: string;
  label: string;
  action: string;
  cost_tier: 'free' | 'low_cost' | 'premium';
  description?: string;
  confirmation_required?: boolean;
  icon?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'destructive';
}

interface MessageMetadata {
  response_time?: number;
  ai_model_used?: string;
  tokens_consumed?: number;
  knowledge_base_hit?: boolean;
  user_context?: UserContext;
}
```

### **Personality System**

```typescript
interface SofiaPersonality {
  mode: PersonalityMode;
  confidence: number; // 0-1 scale
  communication_style: CommunicationStyle;
  last_updated: Date;
  interaction_history: InteractionPattern[];
}

type PersonalityMode = 'adaptive' | 'empathetic' | 'pragmatic';
type CommunicationStyle = 'balanced' | 'empathetic' | 'pragmatic';

interface InteractionPattern {
  timestamp: Date;
  response_time: number; // milliseconds
  action_type: 'help_seeking' | 'direct_action' | 'exploration' | 'completion';
  session_duration: number; // minutes
  page_context: string;
  user_satisfaction?: number; // 1-5 if provided
}

interface PersonalityAnalysis {
  empathetic_score: number; // 0-1 scale
  pragmatic_score: number; // 0-1 scale
  confidence_level: number; // 0-1 scale
  interaction_count: number;
  analysis_date: Date;
}
```

### **Command Processing System**

```typescript
interface SofiaCommand {
  id: string;
  category: CommandCategory;
  content: string;
  context: UserContext;
  timestamp: Date;
  expected_cost: CostTier;
}

type CommandCategory = 
  | 'navigation'
  | 'ui_action'
  | 'knowledge_query'
  | 'ai_query'
  | 'premium_feature'
  | 'document_action';

interface CommandResult {
  success: boolean;
  response: SofiaMessage;
  actions?: ActionButton[];
  cost_incurred: CostTier;
  processing_time: number;
  followup_suggestions?: ActionButton[];
  error?: CommandError;
}

interface CommandError {
  code: string;
  message: string;
  recoverable: boolean;
  suggested_action?: ActionButton;
}
```

### **Memory & Context System**

```typescript
interface SofiaMemory {
  conversation_history: SofiaMessage[];
  user_preferences: UserPreferences;
  topics_discussed: TopicMemory[];
  unfinished_tasks: UnfinishedTask[];
  learning_notes: LearningNote[];
  last_interaction: Date;
}

interface TopicMemory {
  topic: string;
  frequency: number;
  last_discussed: Date;
  user_interest_level: number; // 1-5 scale
  related_actions: string[];
}

interface UnfinishedTask {
  task_id: string;
  description: string;
  started_date: Date;
  last_action: Date;
  progress_percentage: number;
  suggested_next_step: ActionButton;
  expiry_date?: Date;
}

interface LearningNote {
  note: string;
  category: 'preference' | 'behavior' | 'goal' | 'concern';
  confidence: number; // 0-1 scale
  learned_date: Date;
  validation_count: number; // how many times confirmed
}
```

## Document Management System

### **Document Entity Model**

```typescript
interface Document {
  id: string;
  user_id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  category: DocumentCategory;
  subcategory?: string;
  tags: string[];
  upload_date: Date;
  last_modified: Date;
  
  // Encryption & Security
  encryption_key_id: string;
  encrypted_content: EncryptedBlob;
  content_hash: string;
  
  // AI Analysis
  ocr_text?: string;
  ai_summary?: string;
  ai_category_confidence?: number;
  ai_extracted_data?: ExtractedDocumentData;
  
  // Organization
  bundle_id?: string;
  related_document_ids?: string[];
  importance_level: 1 | 2 | 3 | 4 | 5;
  
  // Metadata
  custom_metadata?: Record<string, unknown>;
  version: number;
  is_archived: boolean;
}

type DocumentCategory = 
  | 'legal'
  | 'financial'
  | 'personal'
  | 'property'
  | 'family'
  | 'medical'
  | 'insurance'
  | 'tax'
  | 'other';

interface ExtractedDocumentData {
  document_type?: string;
  key_dates?: Date[];
  monetary_amounts?: MonetaryAmount[];
  people_mentioned?: PersonMention[];
  legal_entities?: string[];
  important_numbers?: string[];
  confidence_score: number;
}

interface MonetaryAmount {
  amount: number;
  currency: string;
  context: string;
}

interface PersonMention {
  name: string;
  role?: string;
  relationship?: string;
  confidence: number;
}
```

### **Document Bundle System**

```typescript
interface DocumentBundle {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  category: BundleCategory;
  document_ids: string[];
  created_date: Date;
  last_modified: Date;
  
  // AI Analysis
  bundle_summary?: string;
  completeness_score?: number; // 0-1 scale
  missing_document_suggestions?: string[];
  
  // Organization
  custom_fields?: Record<string, unknown>;
  importance_level: 1 | 2 | 3 | 4 | 5;
  is_archived: boolean;
}

type BundleCategory = 
  | 'vehicle'
  | 'property'
  | 'investment_account'
  | 'insurance_policy'
  | 'legal_matter'
  | 'tax_year'
  | 'family_member'
  | 'custom';
```

### **Document Search & Analysis**

```typescript
interface DocumentSearchQuery {
  text_query?: string;
  category_filter?: DocumentCategory[];
  date_range?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  bundle_id?: string;
  importance_level?: number[];
  sort_by?: 'relevance' | 'date' | 'name' | 'importance';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

interface DocumentSearchResult {
  documents: Document[];
  total_count: number;
  search_time: number;
  suggestions?: SearchSuggestion[];
  facets?: SearchFacet[];
}

interface SearchSuggestion {
  type: 'spelling' | 'category' | 'related_term';
  original: string;
  suggested: string;
  confidence: number;
}

interface SearchFacet {
  field: string;
  values: FacetValue[];
}

interface FacetValue {
  value: string;
  count: number;
  selected: boolean;
}
```

## User Management & Authentication

### **User Profile System**

```typescript
interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: Date;
  
  // Preferences
  language: string; // 'en', 'cs', 'sk'
  country: string;
  timezone: string;
  communication_preferences: CommunicationPreferences;
  
  // Security
  encryption_public_key: string;
  backup_method?: BackupMethod;
  mfa_enabled: boolean;
  last_password_change?: Date;
  
  // Sofia AI
  sofia_personality: SofiaPersonality;
  sofia_preferences: SofiaPreferences;
  
  // Progress Tracking
  onboarding_completed: boolean;
  milestones_completed: string[];
  current_goals: string[];
  
  // Metadata
  created_date: Date;
  last_login: Date;
  account_status: 'active' | 'suspended' | 'pending_verification';
}

interface CommunicationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  sofia_proactive_suggestions: boolean;
  marketing_communications: boolean;
  security_alerts: boolean;
  language_preference: string;
  notification_frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
}

interface SofiaPreferences {
  personality_override?: PersonalityMode;
  proactive_interventions_enabled: boolean;
  conversation_history_retention: number; // days
  cost_tier_permissions: CostTierPermissions;
  preferred_interaction_style: 'chat' | 'action_buttons' | 'mixed';
}

interface CostTierPermissions {
  allow_premium_features: boolean;
  daily_premium_limit?: number;
  require_confirmation_for_premium: boolean;
  auto_upgrade_suggestions: boolean;
}
```

### **Family Management System**

```typescript
interface FamilyMember {
  id: string;
  family_id: string;
  user_profile_id?: string; // null if not yet registered
  relationship: FamilyRelationship;
  first_name: string;
  last_name?: string;
  email?: string;
  date_of_birth?: Date;
  
  // Permissions & Roles
  role: FamilyRole;
  permissions: FamilyPermission[];
  access_level: AccessLevel;
  
  // Status
  invitation_status: InvitationStatus;
  invited_date?: Date;
  joined_date?: Date;
  last_active?: Date;
  
  // Emergency Information
  is_emergency_contact: boolean;
  emergency_phone?: string;
  emergency_address?: Address;
}

type FamilyRelationship = 
  | 'spouse'
  | 'child'
  | 'parent'
  | 'sibling'
  | 'grandparent'
  | 'grandchild'
  | 'other';

type FamilyRole = 
  | 'owner'
  | 'executor'
  | 'guardian'
  | 'beneficiary'
  | 'emergency_contact'
  | 'viewer';

type FamilyPermission = 
  | 'view_documents'
  | 'edit_documents'
  | 'manage_family'
  | 'emergency_access'
  | 'financial_access'
  | 'legal_access';

type AccessLevel = 'full' | 'limited' | 'emergency_only' | 'none';

type InvitationStatus = 
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'expired'
  | 'revoked';
```

## Dashboard & Progress System

### **Milestone Tracking**

```typescript
interface Milestone {
  id: string;
  category: MilestoneCategory;
  title: string;
  description: string;
  priority: 1 | 2 | 3 | 4 | 5;
  estimated_time: number; // minutes
  
  // Completion Tracking
  status: MilestoneStatus;
  progress_percentage: number;
  completed_date?: Date;
  
  // Dependencies
  prerequisite_milestone_ids?: string[];
  unlocks_milestone_ids?: string[];
  
  // Guidance
  sofia_guidance?: string;
  help_resources?: HelpResource[];
  tutorial_steps?: TutorialStep[];
  
  // Personalization
  user_priority?: number; // user-set priority override
  user_notes?: string;
  reminder_date?: Date;
}

type MilestoneCategory = 
  | 'getting_started'
  | 'document_organization'
  | 'will_creation'
  | 'family_setup'
  | 'emergency_planning'
  | 'financial_planning'
  | 'security_setup';

type MilestoneStatus = 
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'skipped'
  | 'blocked';

interface HelpResource {
  type: 'article' | 'video' | 'tutorial' | 'sofia_chat';
  title: string;
  url?: string;
  description?: string;
  estimated_time?: number;
}

interface TutorialStep {
  step_number: number;
  title: string;
  description: string;
  action_required?: ActionButton;
  validation_criteria?: string;
}
```

### **Progress Analytics**

```typescript
interface UserProgress {
  user_id: string;
  overall_completion: number; // 0-100 percentage
  
  // Category Completion
  category_progress: Record<MilestoneCategory, CategoryProgress>;
  
  // Activity Metrics
  total_documents_uploaded: number;
  total_time_spent: number; // minutes
  sofia_interactions: number;
  last_activity_date: Date;
  
  // Achievements
  achievements_earned: Achievement[];
  current_streak: number; // days of consecutive activity
  longest_streak: number;
  
  // Goals & Planning
  current_goals: Goal[];
  completed_goals: Goal[];
  
  updated_date: Date;
}

interface CategoryProgress {
  completion_percentage: number;
  milestones_completed: number;
  milestones_total: number;
  estimated_time_remaining: number; // minutes
  last_activity: Date;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned_date: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  target_date?: Date;
  related_milestone_ids: string[];
  progress_percentage: number;
  created_date: Date;
  completed_date?: Date;
}
```

## Validation Schemas

### **Zod Validation Schemas**

```typescript
import { z } from 'zod';

// Sofia Message Validation
const SofiaMessageSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1).max(5000),
  role: z.enum(['user', 'assistant']),
  timestamp: z.date(),
  personality: z.object({
    mode: z.enum(['adaptive', 'empathetic', 'pragmatic']),
    confidence: z.number().min(0).max(1),
    communication_style: z.enum(['balanced', 'empathetic', 'pragmatic']),
  }).optional(),
  actions: z.array(z.object({
    id: z.string(),
    label: z.string().min(1).max(100),
    action: z.string().min(1),
    cost_tier: z.enum(['free', 'low_cost', 'premium']),
  })).optional(),
});

// Document Upload Validation
const DocumentUploadSchema = z.object({
  filename: z.string().min(1).max(255),
  file_size: z.number().min(1).max(100 * 1024 * 1024), // 100MB max
  mime_type: z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.]*$/),
  category: z.enum(['legal', 'financial', 'personal', 'property', 'family', 'medical', 'insurance', 'tax', 'other']),
  tags: z.array(z.string().min(1).max(50)).max(20),
});

// User Profile Validation
const UserProfileSchema = z.object({
  email: z.string().email(),
  display_name: z.string().min(1).max(100).optional(),
  first_name: z.string().min(1).max(50).optional(),
  last_name: z.string().min(1).max(50).optional(),
  language: z.enum(['en', 'cs', 'sk']),
  country: z.string().length(2), // ISO country codes
  timezone: z.string().min(1), // IANA timezone
});

// Search Query Validation
const DocumentSearchSchema = z.object({
  text_query: z.string().max(1000).optional(),
  category_filter: z.array(z.enum(['legal', 'financial', 'personal', 'property', 'family', 'medical', 'insurance', 'tax', 'other'])).optional(),
  date_range: z.object({
    start: z.date(),
    end: z.date(),
  }).refine(data => data.end >= data.start, "End date must be after start date").optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});
```

## API Contracts

### **Sofia API Endpoints**

```typescript
// Sofia Chat API
interface SofiaChatRequest {
  message: string;
  context: UserContext;
  conversation_id?: string;
  cost_tier_limit?: CostTier;
}

interface SofiaChatResponse {
  message: SofiaMessage;
  conversation_id: string;
  actions?: ActionButton[];
  cost_incurred: CostTier;
  processing_time: number;
}

// Sofia Action API
interface SofiaActionRequest {
  action_id: string;
  parameters?: Record<string, unknown>;
  context: UserContext;
}

interface SofiaActionResponse {
  success: boolean;
  result?: unknown;
  message?: string;
  followup_actions?: ActionButton[];
  navigation_target?: string;
}
```

### **Document API Endpoints**

```typescript
// Document Upload API
interface DocumentUploadRequest {
  file: File;
  category?: DocumentCategory;
  tags?: string[];
  bundle_id?: string;
  metadata?: Record<string, unknown>;
}

interface DocumentUploadResponse {
  document_id: string;
  upload_url: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  estimated_processing_time?: number;
}

// Document Search API
interface DocumentSearchRequest {
  query: DocumentSearchQuery;
  include_content?: boolean;
  include_ai_analysis?: boolean;
}

interface DocumentSearchResponse {
  results: DocumentSearchResult;
  query_suggestions?: string[];
  facets?: SearchFacet[];
  processing_time: number;
}
```

This comprehensive data model provides the type safety and contracts needed for implementing Sofia AI, document management, and user systems while maintaining clean boundaries and enabling future extensibility.
