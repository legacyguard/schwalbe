// Schema migration utilities for handling the transition from old to new schema
import type { LegacyItem, LegacyItemInsert } from '../types/database';

// Old schema types (for migration)
export interface OldWill {
  content: string;
  created_at: string;
  id: string;
  metadata?: any;
  status: 'archived' | 'completed' | 'draft' | 'pending';
  title: string;
  updated_at: string;
  user_id: string;
}

export interface OldDocument {
  content: string;
  created_at: string;
  id: string;
  metadata?: any;
  name: string;
  status: 'archived' | 'completed' | 'draft' | 'pending';
  type: string;
  updated_at: string;
  user_id: string;
}

export interface OldTrust {
  assets: any[];
  beneficiaries: any[];
  created_at: string;
  id: string;
  metadata?: any;
  name: string;
  status: 'archived' | 'completed' | 'draft' | 'pending';
  type: string;
  updated_at: string;
  user_id: string;
}

// Migration functions
export function migrateWillToLegacyItem(will: OldWill): LegacyItemInsert {
  return {
    id: will.id,
    user_id: will.user_id,
    title: will.title,
    description: will.content,
    category: 'will',
    status: will.status,
    created_at: will.created_at,
    updated_at: will.updated_at,
    metadata: will.metadata ? JSON.stringify(will.metadata) : null,
    priority: 'medium',
    tags: [],
    file_urls: [],
    is_public: false,
    due_date: null
  };
}

export function migrateDocumentToLegacyItem(doc: OldDocument): LegacyItemInsert {
  return {
    id: doc.id,
    user_id: doc.user_id,
    title: doc.name,
    description: doc.content,
    category: doc.type as any,
    status: doc.status,
    created_at: doc.created_at,
    updated_at: doc.updated_at,
    metadata: doc.metadata ? JSON.stringify(doc.metadata) : null,
    priority: 'medium',
    tags: [],
    file_urls: [],
    is_public: false,
    due_date: null
  };
}

export function migrateTrustToLegacyItem(trust: OldTrust): LegacyItemInsert {
  return {
    id: trust.id,
    user_id: trust.user_id,
    title: trust.name,
    description: JSON.stringify({
      type: trust.type,
      beneficiaries: trust.beneficiaries,
      assets: trust.assets
    }),
    category: 'trust',
    status: trust.status,
    created_at: trust.created_at,
    updated_at: trust.updated_at,
    metadata: trust.metadata ? JSON.stringify(trust.metadata) : null,
    priority: 'medium',
    tags: [],
    file_urls: [],
    is_public: false,
    due_date: null
  };
}

// Reverse migration functions
export function migrateLegacyItemToWill(item: LegacyItem): OldWill {
  return {
    id: item.id,
    user_id: item.user_id,
    title: item.title,
    content: item.description || '',
    status: item.status as any,
    created_at: item.created_at || new Date().toISOString(),
    updated_at: item.updated_at || new Date().toISOString(),
    metadata: item.metadata ? JSON.parse(item.metadata as string) : undefined
  };
}

// Property mapping utilities
export const PROPERTY_MAPPINGS = {
  // camelCase to snake_case
  camelToSnake: {
    'createdAt': 'created_at',
    'updatedAt': 'updated_at',
    'dueDate': 'due_date',
    'fileUrls': 'file_urls',
    'isPublic': 'is_public',
    'userId': 'user_id'
  },
  // snake_case to camelCase
  snakeToCamel: {
    'created_at': 'createdAt',
    'updated_at': 'updatedAt',
    'due_date': 'dueDate',
    'file_urls': 'fileUrls',
    'is_public': 'isPublic',
    'user_id': 'userId'
  }
} as const;

// Type conversion utilities
export function convertCamelToSnake<T extends Record<string, any>>(obj: T): T {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = PROPERTY_MAPPINGS.camelToSnake[key as keyof typeof PROPERTY_MAPPINGS.camelToSnake] || key;
    result[snakeKey] = value;
  }
  return result;
}

export function convertSnakeToCamel<T extends Record<string, any>>(obj: T): T {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = PROPERTY_MAPPINGS.snakeToCamel[key as keyof typeof PROPERTY_MAPPINGS.snakeToCamel] || key;
    result[camelKey] = value;
  }
  return result;
}

// Type assertion utilities
export function isValidLegacyItemCategory(category: string): boolean {
  const validCategories = [
    'will', 'trust', 'power_of_attorney', 'healthcare_directive',
    'insurance', 'financial', 'property', 'business', 'digital',
    'personal', 'other'
  ];
  return validCategories.includes(category);
}

export function isValidLegacyItemStatus(status: string): boolean {
  const validStatuses = ['draft', 'pending', 'completed', 'archived'];
  return validStatuses.includes(status);
}

export function isValidLegacyItemPriority(priority: string): boolean {
  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  return validPriorities.includes(priority);
}

// JSON handling utilities
export function safeJsonParse<T>(json: null | string | undefined): null | T {
  if (!json) return null;
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export function safeJsonStringify(obj: any): null | string {
  try {
    return JSON.stringify(obj);
  } catch {
    return null;
  }
}

// Date handling utilities
export function safeDateParse(date: null | string | undefined): Date | null {
  if (!date) return null;
  const parsed = new Date(date);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDateForDatabase(date: Date): string {
  return date.toISOString();
}

// Array handling utilities
export function safeArray<T>(arr: null | T[] | undefined): T[] {
  return Array.isArray(arr) ? arr : [];
}

// Enum handling utilities
export function safeEnum<T extends string>(
  value: null | string | undefined,
  validValues: readonly T[]
): null | T {
  if (!value) return null;
  return validValues.includes(value as T) ? (value as T) : null;
}

// Validation utilities
export function validateLegacyItem(item: any): item is LegacyItem {
  return (
    item &&
    typeof item === 'object' &&
    'id' in item &&
    'user_id' in item &&
    'title' in item &&
    'category' in item &&
    'status' in item &&
    isValidLegacyItemCategory(item.category) &&
    isValidLegacyItemStatus(item.status)
  );
}

// Error handling utilities
export interface MigrationError {
  code: string;
  context?: any;
  details: string;
  message: string;
}

export function createMigrationError(
  message: string,
  context?: any,
  code?: string
): MigrationError {
  return {
    message,
    code: code || 'UNKNOWN',
    details: context ? JSON.stringify(context) : '',
    context
  };
}

// Batch migration utilities
export interface BatchMigrationResult {
  errors: MigrationError[];
  failed: number;
  migrated: LegacyItem[];
  success: number;
}

export function createBatchMigrationResult(): BatchMigrationResult {
  return {
    success: 0,
    failed: 0,
    errors: [],
    migrated: []
  };
}

// Type checking utilities
export function isOldWill(obj: any): obj is OldWill {
  return (
    obj &&
    typeof obj === 'object' &&
    'id' in obj &&
    'user_id' in obj &&
    'title' in obj &&
    'content' in obj &&
    'status' in obj
  );
}

export function isOldDocument(obj: any): obj is OldDocument {
  return (
    obj &&
    typeof obj === 'object' &&
    'id' in obj &&
    'user_id' in obj &&
    'name' in obj &&
    'type' in obj &&
    'content' in obj &&
    'status' in obj
  );
}

export function isOldTrust(obj: any): obj is OldTrust {
  return (
    obj &&
    typeof obj === 'object' &&
    'id' in obj &&
    'user_id' in obj &&
    'name' in obj &&
    'type' in obj &&
    'beneficiaries' in obj &&
    'assets' in obj &&
    'status' in obj
  );
}

// Migration configuration
export interface MigrationConfig {
  batchSize: number;
  delayBetweenBatches: number;
  retryAttempts: number;
  validateAfterMigration: boolean;
}

export const DEFAULT_MIGRATION_CONFIG: MigrationConfig = {
  batchSize: 100,
  retryAttempts: 3,
  delayBetweenBatches: 1000,
  validateAfterMigration: true
};

// Migration progress tracking
export interface MigrationProgress {
  duration?: number;
  endTime?: number;
  errors: MigrationError[];
  failed: number;
  processed: number;
  startTime: number;
  success: number;
  total: number;
}

export function createMigrationProgress(total: number): MigrationProgress {
  return {
    total,
    processed: 0,
    success: 0,
    failed: 0,
    errors: [],
    startTime: Date.now()
  };
}

// Export all utilities
export const SchemaMigration = {
  migrateWillToLegacyItem,
  migrateDocumentToLegacyItem,
  migrateTrustToLegacyItem,
  migrateLegacyItemToWill,
  convertCamelToSnake,
  convertSnakeToCamel,
  safeJsonParse,
  safeJsonStringify,
  safeDateParse,
  safeArray,
  safeEnum,
  validateLegacyItem,
  createMigrationError,
  createBatchMigrationResult,
  createMigrationProgress,
  isOldWill,
  isOldDocument,
  isOldTrust
};

export default SchemaMigration;
