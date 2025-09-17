
/**
 * LegacyGuard Type Definitions
 * Centralized type definitions for the entire application
 */

// Import Supabase types for database operations
import type { Database } from '../integrations/supabase/types';

export type ProfessionalReviewer =
  Database['public']['Tables']['professional_reviewers']['Row'];
export type ProfessionalReviewerInsert =
  Database['public']['Tables']['professional_reviewers']['Insert'];
export type ProfessionalReviewerUpdate =
  Database['public']['Tables']['professional_reviewers']['Update'];

// Base types
export type UUID = string;
export type ISO8601Date = string;
export type Currency = string;

// User types
export interface User {
  avatar?: string;
  createdAt: ISO8601Date;
  email: string;
  firstName: string;
  id: UUID;
  lastName: string;
  preferences: UserPreferences;
  updatedAt: ISO8601Date;
}

export interface UserPreferences {
  language: string;
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
  timezone: string;
}

export interface NotificationPreferences {
  email: boolean;
  frequency: 'daily' | 'immediate' | 'weekly';
  push: boolean;
  sms: boolean;
}

export interface PrivacySettings {
  dataRetention: number;
  shareWithFamily: boolean;
  shareWithProfessionals: boolean;
}

// Estate planning types
export interface EstatePlan {
  assets: Asset[];
  beneficiaries: Beneficiary[];
  createdAt: ISO8601Date;
  description?: string;
  documents: Document[];
  id: UUID;
  name: string;
  status: 'active' | 'archived' | 'draft';
  updatedAt: ISO8601Date;
  userId: UUID;
}

export interface Document {
  content?: string;
  createdAt: ISO8601Date;
  estatePlanId: UUID;
  fileUrl?: string;
  id: UUID;
  metadata: DocumentMetadata;
  name: string;
  status: 'archived' | 'draft' | 'reviewed' | 'signed';
  type: DocumentType;
  updatedAt: ISO8601Date;
}

export type DocumentType =
  | 'bank_statement'
  | 'insurance_policy'
  | 'investment_statement'
  | 'living_will'
  | 'other'
  | 'power_of_attorney'
  | 'property_deed'
  | 'trust'
  | 'will';

export interface DocumentMetadata {
  checksum?: string;
  encryptionKey?: string;
  fileSize?: number;
  lastModifiedBy?: UUID;
  mimeType?: string;
  version: number;
}

// Asset types
export interface Asset {
  createdAt: ISO8601Date;
  currency: Currency;
  description?: string;
  estatePlanId: UUID;
  id: UUID;
  location?: string;
  name: string;
  ownership: OwnershipDetails;
  type: AssetType;
  updatedAt: ISO8601Date;
  value: number;
}

export type AssetType =
  | 'art'
  | 'bank_account'
  | 'business'
  | 'cryptocurrency'
  | 'insurance'
  | 'investment'
  | 'jewelry'
  | 'other'
  | 'real_estate'
  | 'vehicle';

export interface OwnershipDetails {
  coOwners?: CoOwner[];
  owner: string;
  percentage: number;
}

export interface CoOwner {
  name: string;
  percentage: number;
}

// Beneficiary types
export interface Beneficiary {
  allocation: AllocationDetails;
  createdAt: ISO8601Date;
  email?: string;
  estatePlanId: UUID;
  id: UUID;
  name: string;
  phone?: string;
  relationship: string;
  type: BeneficiaryType;
  updatedAt: ISO8601Date;
}

export type BeneficiaryType = 'individual' | 'organization' | 'trust';

export interface AllocationDetails {
  assetId?: UUID;
  conditions?: string[];
  type: 'fixed_amount' | 'percentage' | 'specific_asset';
  value: number;
}

// Professional specialization types
export interface ProfessionalSpecialization {
  category: string;
  id: string;
  name: string;
}

// Professional network types - Domain model for business logic
export interface ProfessionalReviewerDTO {
  bar_number?: string; // Alias for licenseNumber
  bio?: string;
  created_at: ISO8601Date; // Alias for createdAt
  createdAt: ISO8601Date;
  email: string; // Email address for notifications
  experience: number;
  experience_years: number; // Alias for experience
  // Extended properties for component compatibility
  full_name: string; // Alias for fullName
  fullName: string; // Full name for display and notifications
  hourly_rate?: number;
  id: UUID;
  jurisdiction: string;
  law_firm_name?: string;
  licensed_states?: string[];
  licenseNumber: string;
  onboardingStatus: OnboardingStatus;
  professional_title?: string;
  profile_image_url?: string;
  specializations: ProfessionalSpecialization[];
  status?: 'active' | 'inactive' | 'pending' | 'suspended';
  type: ProfessionalType;
  updated_at?: ISO8601Date; // Alias for updatedAt
  updatedAt: ISO8601Date;
  user_id?: string; // Alias for userId
  userId: UUID;
  verification_status?: string;
  verified: boolean;
}

export type ProfessionalType =
  | 'attorney'
  | 'estate_planner'
  | 'financial_advisor'
  | 'notary'
  | 'tax_advisor';

export type OnboardingStatus =
  | 'approved'
  | 'documents_submitted'
  | 'pending'
  | 'rejected'
  | 'suspended'
  | 'under_review';

// Mapper function to convert Supabase type to domain type
export function mapSupabaseToDomainReviewer(
  supabaseReviewer: ProfessionalReviewer
): ProfessionalReviewerDTO {
  const experience = calculateExperience(supabaseReviewer.reviews_completed);
  const fullName = supabaseReviewer.name;

  return {
    id: supabaseReviewer.id,
    userId: supabaseReviewer.contact_email, // Map contact_email to userId for domain logic
    email: supabaseReviewer.contact_email, // Use contact_email as email
    fullName,
    type: mapCredentialsToType(supabaseReviewer.credentials),
    licenseNumber: supabaseReviewer.bar_number || '',
    jurisdiction: supabaseReviewer.jurisdiction,
    specializations: (supabaseReviewer.specializations || []).map(
      (spec, index) => ({
        id: `${index}`,
        name: spec,
        category: mapSpecializationToCategory(spec),
      })
    ),
    experience,
    verified: supabaseReviewer.profile_verified,
    onboardingStatus: mapVerificationToOnboardingStatus(
      supabaseReviewer.profile_verified
    ),
    createdAt: supabaseReviewer.created_at,
    updatedAt: supabaseReviewer.updated_at,
    // Extended properties for component compatibility
    full_name: fullName,
    professional_title: supabaseReviewer.credentials,
    law_firm_name: undefined, // Not available in current schema
    bio: undefined, // Not available in current schema
    hourly_rate: undefined, // Not available in current schema
    experience_years: experience,
    licensed_states: [supabaseReviewer.jurisdiction], // Use jurisdiction as licensed state
    profile_image_url: undefined, // Not available in current schema
    bar_number: supabaseReviewer.bar_number || undefined,
    verification_status: supabaseReviewer.profile_verified
      ? 'verified'
      : 'pending',
    status: supabaseReviewer.profile_verified ? 'active' : 'inactive',
    created_at: supabaseReviewer.created_at,
  };
}

// Mapper function to convert domain type to Supabase type
export function mapDomainToSupabaseReviewer(
  domainReviewer: ProfessionalReviewerDTO
): Omit<ProfessionalReviewerInsert, 'created_at' | 'id' | 'updated_at'> {
  return {
    name: `${domainReviewer.userId}`, // Map userId to name field
    credentials: mapTypeToCredentials(domainReviewer.type),
    bar_number: domainReviewer.licenseNumber,
    jurisdiction: domainReviewer.jurisdiction,
    specializations: domainReviewer.specializations.map(spec => spec.name),
    rating: 0, // Default value
    reviews_completed: 0, // Default value
    average_turnaround_hours: 24, // Default value
    profile_verified: domainReviewer.verified,
    contact_email: domainReviewer.userId, // Map userId to contact_email
  };
}

// Helper functions for mapping
function mapCredentialsToType(credentials: string): ProfessionalType {
  if (
    credentials.toLowerCase().includes('attorney') ||
    credentials.toLowerCase().includes('lawyer')
  ) {
    return 'attorney';
  } else if (credentials.toLowerCase().includes('notary')) {
    return 'notary';
  } else if (
    credentials.toLowerCase().includes('financial') ||
    credentials.toLowerCase().includes('advisor')
  ) {
    return 'financial_advisor';
  } else if (
    credentials.toLowerCase().includes('estate') ||
    credentials.toLowerCase().includes('planner')
  ) {
    return 'estate_planner';
  } else if (credentials.toLowerCase().includes('tax')) {
    return 'tax_advisor';
  }
  return 'attorney'; // Default fallback
}

function mapTypeToCredentials(type: ProfessionalType): string {
  switch (type) {
    case 'attorney':
      return 'Attorney at Law';
    case 'notary':
      return 'Notary Public';
    case 'financial_advisor':
      return 'Financial Advisor';
    case 'estate_planner':
      return 'Estate Planning Specialist';
    case 'tax_advisor':
      return 'Tax Advisor';
    default:
      return 'Legal Professional';
  }
}

function calculateExperience(reviewsCompleted: number): number {
  // Simple heuristic: assume each review represents some experience
  return Math.max(1, Math.floor(reviewsCompleted / 10));
}

function mapVerificationToOnboardingStatus(
  verified: boolean
): OnboardingStatus {
  return verified ? 'approved' : 'pending';
}

function mapSpecializationToCategory(specialization: string): string {
  const spec = specialization.toLowerCase();
  if (
    spec.includes('estate') ||
    spec.includes('will') ||
    spec.includes('trust')
  ) {
    return 'estate_planning';
  } else if (spec.includes('tax')) {
    return 'tax_law';
  } else if (spec.includes('business') || spec.includes('corporate')) {
    return 'business_law';
  } else if (spec.includes('family') || spec.includes('divorce')) {
    return 'family_law';
  } else if (spec.includes('real estate') || spec.includes('property')) {
    return 'real_estate';
  }
  return 'general';
}

export interface ReviewRequest {
  createdAt: ISO8601Date;
  deadline?: ISO8601Date;
  documents: UUID[];
  estatePlanId: UUID;
  id: UUID;
  notes?: string;
  priority: Priority;
  reviewerId: UUID;
  status: ReviewStatus;
  type: ReviewType;
}

export type ReviewType =
  | 'compliance'
  | 'financial'
  | 'legal'
  | 'medical'
  | 'technical';
export type ReviewStatus =
  | 'completed'
  | 'in_progress'
  | 'needs_revision'
  | 'pending'
  | 'rejected';
export type Priority = 'high' | 'low' | 'medium' | 'urgent';

// Professional Profile - used by directory components
export interface ProfessionalProfile extends ProfessionalReviewerDTO {
  availability?: 'available' | 'busy' | 'unavailable';
}

// Professional Review types
export type ProfessionalReview =
  Database['public']['Tables']['professional_reviews']['Row'];

export interface DocumentShare {
  created_at: string;
  document_id: string;
  expires_at?: string;
  id: string;
  permissions: SharePermissions;
  shared_with: string;
  updated_at: string;
}

export interface SharePermissions {
  download: boolean;
  edit: boolean;
  view: boolean;
}

// Search result type for QuickSearch
export interface QuickSearchResult {
  action: () => void;
  icon: string;
  id: string;
  subtitle: string;
  title: string;
  type: 'action' | 'document' | 'guardian';
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  metadata?: ResponseMetadata;
  success: boolean;
}

export interface ApiError {
  code: string;
  details?: Record<string, any>;
  message: string;
  timestamp: ISO8601Date;
}

export interface ResponseMetadata {
  requestId: string;
  timestamp: ISO8601Date;
  version: string;
}

// Pagination types
export interface PaginationParams {
  filters?: Record<string, any>;
  limit: number;
  page: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    hasNext: boolean;
    hasPrev: boolean;
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface FormValidationError {
  field: string;
  message: string;
  type: 'custom' | 'invalid' | 'required';
}

export interface FormState<T> {
  data: T;
  errors: FormValidationError[];
  isSubmitting: boolean;
  isValid: boolean;
}

// Utility types
export type Nullable<T> = null | T;
export type Optional<T> = T | undefined;

// Enhanced DeepPartial with proper type constraints for complex objects
export type DeepPartial<T> = T extends (infer U)[]
  ? DeepPartial<U>[]
  : T extends Record<string, any>
    ? {
        [P in keyof T]?: T[P] extends (infer U)[]
          ? DeepPartial<U>[]
          : T[P] extends object
            ? DeepPartial<T[P]>
            : T[P];
      }
    : T;

// Additional utility types for advanced type operations
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// Type-safe object key extraction
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

// Conditional type for extracting function parameters
export type ExtractParameters<T> = T extends (...args: infer P) => any
  ? P
  : never;

// Advanced utility for creating type-safe pick operations
export type DeepPick<T, K extends string> = K extends keyof T
  ? T[K]
  : K extends `${infer Key}.${infer Rest}`
    ? Key extends keyof T
      ? T[Key] extends object
        ? DeepPick<T[Key], Rest>
        : never
      : never
    : never;

// Event types
export interface AppEvent {
  payload: Record<string, any>;
  timestamp: ISO8601Date;
  type: string;
  userId?: UUID;
}

// Configuration types
export interface AppConfig {
  api: {
    baseUrl: string;
    retryAttempts: number;
    timeout: number;
  };
  auth: {
    refreshTokenInterval: number;
    sessionTimeout: number;
  };
  features: {
    enableOfflineMode: boolean;
    enableProfessionalNetwork: boolean;
    enableRealTimeUpdates: boolean;
  };
  storage: {
    allowedMimeTypes: string[];
    encryptionKey: string;
    maxFileSize: number;
  };
}

// Webhook types
export interface WebhookPayload {
  data: Record<string, any>;
  event: string;
  signature: string;
  timestamp: ISO8601Date;
}

// Search types
export interface SearchFilters {
  dateFrom?: ISO8601Date;
  dateTo?: ISO8601Date;
  query?: string;
  status?: string[];
  tags?: string[];
  type?: string[];
}

export interface SearchResult<T> {
  highlights: Record<string, string[]>;
  item: T;
  score: number;
}
