// Centralized database type definitions
import type { Database } from './supabase';

// Legacy item types (unified schema)
export type LegacyItem = Database['public']['Tables']['legacy_items']['Row'];
export type LegacyItemInsert = Database['public']['Tables']['legacy_items']['Insert'];
export type LegacyItemUpdate = Database['public']['Tables']['legacy_items']['Update'];

// Profile types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

// Document types
export type Document = Database['public']['Tables']['documents']['Row'];
export type DocumentInsert = Database['public']['Tables']['documents']['Insert'];
export type DocumentUpdate = Database['public']['Tables']['documents']['Update'];

// Legacy item categories and status
export const LEGACY_ITEM_CATEGORIES = [
  'will',
  'trust',
  'power_of_attorney',
  'healthcare_directive',
  'insurance',
  'financial',
  'property',
  'business',
  'digital',
  'personal',
  'other'
] as const;

export const LEGACY_ITEM_STATUS = [
  'draft',
  'pending',
  'completed',
  'archived'
] as const;

export const LEGACY_ITEM_PRIORITY = [
  'low',
  'medium',
  'high',
  'urgent'
] as const;

export type LegacyItemCategory = typeof LEGACY_ITEM_CATEGORIES[number];
export type LegacyItemStatus = typeof LEGACY_ITEM_STATUS[number];
export type LegacyItemPriority = typeof LEGACY_ITEM_PRIORITY[number];

// Helper type for converting snake_case to camelCase
export type CamelCase<T> = T extends string
  ? T extends `${infer P1}_${infer P2}${infer P3}`
    ? `${P1}${Uppercase<P2>}${CamelCase<P3>}`
    : T
  : T;

// Type for handling both snake_case and camelCase property access
export type FlexibleLegacyItem = LegacyItem & {
  // camelCase aliases for snake_case properties
  createdAt?: null | string;
  dueDate?: null | string;
  fileUrls?: null | string[];
  isPublic?: boolean | null;
  updatedAt?: null | string;
  userId?: string;
};

// Type guards for legacy items
export function isLegacyItem(item: any): item is LegacyItem {
  return item && typeof item === 'object' && 'id' in item && 'category' in item;
}

export function isLegacyItemCategory(category: string): category is LegacyItemCategory {
  return LEGACY_ITEM_CATEGORIES.includes(category as LegacyItemCategory);
}

export function isLegacyItemStatus(status: string): status is LegacyItemStatus {
  return LEGACY_ITEM_STATUS.includes(status as LegacyItemStatus);
}

export function isLegacyItemPriority(priority: string): priority is LegacyItemPriority {
  return LEGACY_ITEM_PRIORITY.includes(priority as LegacyItemPriority);
}

// Helper functions for property conversion
export function toCamelCase<T extends Record<string, any>>(obj: T): T {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = value;
  }
  return result;
}

export function toSnakeCase<T extends Record<string, any>>(obj: T): T {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = value;
  }
  return result;
}

// Type for handling flexible property access
export type Flexible<T> = T & {
  [K in keyof T as K extends string ? CamelCase<K> : K]: T[K];
};

// Database helper types
export type DbResult<T> = T extends PromiseLike<infer U> ? U : never;
export type DbResultOk<T> = T extends PromiseLike<{ data: infer U }> ? U : never;
export type DbResultErr = any; // PostgrestError

// Error handling
export interface DatabaseError {
  code?: string;
  details?: string;
  hint?: string;
  message: string;
}

// Query result types
export type QueryResult<T> = {
  data: null | T;
  error: DatabaseError | null;
  loading: boolean;
};

// Pagination types
export interface PaginationOptions {
  limit?: number;
  offset?: number;
  page?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  limit: number;
  page: number;
  total: number;
  totalPages: number;
}

// Filter types
export interface LegacyItemFilters {
  category?: LegacyItemCategory;
  dateFrom?: string;
  dateTo?: string;
  priority?: LegacyItemPriority;
  search?: string;
  status?: LegacyItemStatus;
  userId?: string;
}

// Sorting types
export interface SortOptions {
  direction: 'asc' | 'desc';
  field: keyof LegacyItem;
}

// Common query parameters
export interface QueryOptions {
  filters?: LegacyItemFilters;
  pagination?: PaginationOptions;
  sort?: SortOptions;
}

// Type for handling partial updates
export type PartialUpdate<T> = Partial<T> & { id: string };

// Type for handling JSON data safely
export type SafeJson<T = any> = null | T | undefined;

// Type for handling arrays safely
export type SafeArray<T> = null | T[] | undefined;

// Type for handling dates safely
export type SafeDate = null | string | undefined;

// Type for handling enums safely
export type SafeEnum<T extends string> = null | T | undefined;

// Type for handling relationships
export interface LegacyItemWithRelations extends LegacyItem {
  documents?: Document[];
  profile?: Profile;
}

// Type for handling file uploads
export interface FileUpload {
  file: File;
  metadata?: Record<string, any>;
  path: string;
}

// Type for handling batch operations
export interface BatchOperation<T> {
  items: T[];
  operation: 'create' | 'delete' | 'update';
}

// Type for handling real-time updates
export interface RealtimeUpdate<T> {
  old_record?: T;
  record: T;
  table: string;
  type: 'DELETE' | 'INSERT' | 'UPDATE';
}

// Type for handling subscription events
export interface SubscriptionEvent<T> {
  eventType: 'DELETE' | 'INSERT' | 'UPDATE';
  new: null | T;
  old: null | T;
}

// Type for handling cache updates
export interface CacheUpdate<T> {
  data: T;
  key: string;
  timestamp: number;
}

// Type for handling optimistic updates
export interface OptimisticUpdate<T> {
  data: Partial<T>;
  id: string;
  timestamp: number;
}

// Type for handling error states
export interface ErrorState {
  error: DatabaseError | null;
  lastRetry: null | number;
  retryCount: number;
}

// Type for handling loading states
export interface LoadingState {
  loading: boolean;
  message?: string;
  progress?: number;
}

// Type for handling success states
export interface SuccessState<T> {
  data: T;
  message?: string;
  timestamp: number;
}

// Type for handling safe JSON operations
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

// Type for handling date operations
export function safeDateParse(date: null | string | undefined): Date | null {
  if (!date) return null;
  const parsed = new Date(date);
  return isNaN(parsed.getTime()) ? null : parsed;
}

// Type for handling array operations
export function safeArray<T>(arr: null | T[] | undefined): T[] {
  return Array.isArray(arr) ? arr : [];
}

// Type for handling enum operations
export function safeEnum<T extends string>(
  value: null | string | undefined,
  validValues: readonly T[]
): null | T {
  if (!value) return null;
  return validValues.includes(value as T) ? (value as T) : null;
}


// Type for handling nullable properties
export type Nullable<T> = null | T;

// Type for handling optional properties
export type Optional<T> = T | undefined;

// Type for handling required properties
export type Required<T> = T extends null | undefined ? never : T;

// Type for handling partial with required id
export type PartialWithId<T> = Partial<T> & { id: string };

// Type for handling update operations
export type UpdateOperation<T> = {
  id: string;
  timestamp: number;
  updates: Partial<T>;
};

// Type for handling create operations
export type CreateOperation<T> = {
  data: T;
  timestamp: number;
};

// Type for handling delete operations
export type DeleteOperation = {
  id: string;
  timestamp: number;
};

// Type for handling batch operations
export type BatchOperations<T> = {
  creates?: CreateOperation<T>[];
  deletes?: DeleteOperation[];
  updates?: UpdateOperation<T>[];
};

// Type for handling query builders
export type QueryBuilder<T> = {
  and: (filters: any[]) => QueryBuilder<T>;
  containedBy: (column: string, value: any) => QueryBuilder<T>;
  contains: (column: string, value: any) => QueryBuilder<T>;
  csv: () => QueryBuilder<T>;
  delete: () => any;
  eq: (column: string, value: any) => QueryBuilder<T>;
  gt: (column: string, value: any) => QueryBuilder<T>;
  gte: (column: string, value: any) => QueryBuilder<T>;
  ilike: (column: string, pattern: string) => QueryBuilder<T>;
  in: (column: string, values: any[]) => QueryBuilder<T>;
  insert: (values: Partial<T>[]) => any;
  is: (column: string, value: any) => QueryBuilder<T>;
  like: (column: string, pattern: string) => QueryBuilder<T>;
  limit: (count: number) => QueryBuilder<T>;
  lt: (column: string, value: any) => QueryBuilder<T>;
  lte: (column: string, value: any) => QueryBuilder<T>;
  match: (query: any) => QueryBuilder<T>;
  maybeSingle: () => QueryBuilder<T>;
  neq: (column: string, value: any) => QueryBuilder<T>;
  not: (query: any) => QueryBuilder<T>;
  or: (filters: any[]) => QueryBuilder<T>;
  order: (column: string, options?: { ascending?: boolean; nullsFirst?: boolean }) => QueryBuilder<T>;
  overlaps: (column: string, range: any) => QueryBuilder<T>;
  range: (from: number, to: number) => QueryBuilder<T>;
  rangeAdjacent: (column: string, range: any) => QueryBuilder<T>;
  rangeGt: (column: string, range: any) => QueryBuilder<T>;
  rangeGte: (column: string, range: any) => QueryBuilder<T>;
  rangeLt: (column: string, range: any) => QueryBuilder<T>;
  rangeLte: (column: string, range: any) => QueryBuilder<T>;
  select: (columns?: string) => any;
  single: () => QueryBuilder<T>;
  textSearch: (column: string, query: string) => QueryBuilder<T>;
  update: (values: Partial<T>) => any;
};

// Type for handling database operations
export interface DatabaseOperations {
  documents: {
    create: (document: DocumentInsert) => Promise<Document>;
    delete: (id: string) => Promise<void>;
    list: (userId: string) => Promise<Document[]>;
    read: (id: string) => Promise<Document | null>;
    update: (id: string, updates: DocumentUpdate) => Promise<Document>;
  };
  legacyItems: {
    create: (item: LegacyItemInsert) => Promise<LegacyItem>;
    delete: (id: string) => Promise<void>;
    list: (options?: QueryOptions) => Promise<PaginatedResult<LegacyItem>>;
    read: (id: string) => Promise<LegacyItem | null>;
    update: (id: string, updates: LegacyItemUpdate) => Promise<LegacyItem>;
  };
  profiles: {
    create: (profile: ProfileInsert) => Promise<Profile>;
    delete: (id: string) => Promise<void>;
    read: (id: string) => Promise<null | Profile>;
    update: (id: string, updates: ProfileUpdate) => Promise<Profile>;
  };
}

// Type for handling migration operations
export interface MigrationOperations {
  migrateFromLegacy: (oldData: any) => LegacyItem;
  migrateToLegacy: (newData: LegacyItem) => any;
  validateMigration: (oldData: any, newData: LegacyItem) => boolean;
}

// Type for handling validation
export interface ValidationRules<T> {
  custom?: Record<string, (value: any) => boolean>;
  optional?: (keyof T)[];
  required?: (keyof T)[];
}

// Type for handling error handling
export interface ErrorHandler {
  handleError: (error: any) => DatabaseError;
  retry: (operation: () => Promise<any>, maxRetries?: number) => Promise<any>;
}

// Type for handling logging
export interface Logger {
  debug: (message: string, data?: any) => void;
  error: (message: string, error?: any) => void;
  log: (message: string, data?: any) => void;
  warn: (message: string, data?: any) => void;
}

// Type for handling performance
export interface PerformanceMetrics {
  cacheHitRate: number;
  errorRate: number;
  memoryUsage: number;
  queryTime: number;
}

// Type for handling caching
export interface CacheConfig {
  maxSize: number;
  strategy: 'fifo' | 'lfu' | 'lru';
  ttl: number;
}

// Type for handling rate limiting
export interface RateLimitConfig {
  maxRequests: number;
  skipSuccessfulRequests: boolean;
  windowMs: number;
}

// Type for handling security
export interface SecurityConfig {
  corsOrigins: string[];
  encryptionKey: string;
  jwtSecret: string;
  saltRounds: number;
}

// Type for handling configuration
export interface AppConfig {
  cache: CacheConfig;
  database: {
    poolSize: number;
    timeout: number;
    url: string;
  };
  logging: {
    format: 'json' | 'text';
    level: 'debug' | 'error' | 'info' | 'warn';
  };
  rateLimit: RateLimitConfig;
  security: SecurityConfig;
}

// Export everything
export * from './supabase';
