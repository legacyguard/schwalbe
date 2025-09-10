// Export all types
export * from './api';
export * from './supabase';

/**
 * Shared TypeScript Types and Interfaces
 * Central type definitions for the entire LegacyGuard application
 */

// User and Authentication Types
export interface User {
  avatarUrl?: string;
  createdAt: Date;
  email: string;
  id: string;
  lastLogin?: Date;
  name?: string;
  phoneNumber?: string;
  preferences?: UserPreferences;
  subscription?: Subscription;
  updatedAt: Date;
}

export interface UserPreferences {
  autoSave: boolean;
  language: string;
  notifications: NotificationSettings;
  privacyLevel: 'private' | 'public' | 'shared';
  sofiaMode: 'balanced' | 'empathetic' | 'pragmatic';
  theme: 'dark' | 'light' | 'system';
}

export interface NotificationSettings {
  email: boolean;
  marketing: boolean;
  push: boolean;
  reminders: boolean;
  sms: boolean;
  updates: boolean;
}

// Document Types
export interface Document {
  category: DocumentCategory;
  content: DocumentContent;
  createdAt: Date;
  encryption?: EncryptionInfo;
  id: string;
  lastAccessedAt?: Date;
  metadata: DocumentMetadata;
  sharing?: SharingSettings;
  status: DocumentStatus;
  tags: string[];
  title: string;
  type: DocumentType;
  updatedAt: Date;
  userId: string;
}

export type DocumentType =
  | 'digital-assets'
  | 'emergency-contacts'
  | 'family-history'
  | 'financial'
  | 'funeral-wishes'
  | 'healthcare-directive'
  | 'insurance'
  | 'personal-letter'
  | 'power-of-attorney'
  | 'will';

export type DocumentStatus =
  | 'archived'
  | 'complete'
  | 'draft'
  | 'reviewed'
  | 'shared';

export type DocumentCategory =
  | 'emergency'
  | 'family'
  | 'financial'
  | 'legal'
  | 'medical'
  | 'personal';

export interface DocumentContent {
  attachments?: Attachment[];
  fields?: Record<string, unknown>;
  text?: string;
  version: number;
}

export interface DocumentMetadata {
  completionPercentage: number;
  importance: 'critical' | 'high' | 'low' | 'medium';
  isTemplate: boolean;
  lastReviewDate?: Date;
  nextReviewDate?: Date;
  wordCount?: number;
}

export interface Attachment {
  encrypted: boolean;
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  url: string;
}

// Encryption Types
export interface EncryptionInfo {
  algorithm: string;
  encryptedAt: Date;
  iv?: string;
  keyId: string;
  salt?: string;
}

// Sharing Types
export interface SharingSettings {
  expiresAt?: Date;
  isShared: boolean;
  permissions: SharingPermission[];
  publicLink?: string;
  sharedWith: SharedUser[];
}

export interface SharedUser {
  email: string;
  lastAccessed?: Date;
  name?: string;
  role: 'admin' | 'editor' | 'viewer';
  sharedAt: Date;
  userId?: string;
}

export type SharingPermission =
  | 'comment'
  | 'download'
  | 'edit'
  | 'print'
  | 'share'
  | 'view';

// Subscription Types
export interface Subscription {
  billingCycle: BillingCycle;
  endDate?: Date;
  id: string;
  paymentMethod?: PaymentMethod;
  plan: SubscriptionPlan;
  startDate: Date;
  status: SubscriptionStatus;
  usage: SubscriptionUsage;
  userId: string;
}

export type SubscriptionPlan = 'enterprise' | 'family' | 'free' | 'premium';

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'expired'
  | 'past_due'
  | 'trialing';

export type BillingCycle = 'lifetime' | 'monthly' | 'yearly';

export interface PaymentMethod {
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  id: string;
  last4?: string;
  type: 'bank' | 'card' | 'paypal';
}

export interface SubscriptionUsage {
  aiRequestsLimit: number;
  aiRequestsUsed: number;
  documentsCreated: number;
  documentsLimit: number;
  sharesLimit: number;
  sharesUsed: number;
  storageLimitMB: number;
  storageUsedMB: number;
}

// Activity and Analytics Types
export interface UserActivity {
  action: ActivityAction;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
  resourceId: string;
  resourceType: ResourceType;
  timestamp: Date;
  userAgent?: string;
  userId: string;
}

export type ActivityAction =
  | 'archive'
  | 'create'
  | 'delete'
  | 'download'
  | 'print'
  | 'read'
  | 'restore'
  | 'share'
  | 'update';

export type ResourceType =
  | 'contact'
  | 'document'
  | 'setting'
  | 'subscription'
  | 'template';

// Template Types
export interface Template {
  category: DocumentCategory;
  content: TemplateContent;
  createdBy: string;
  description: string;
  id: string;
  isPremium: boolean;
  name: string;
  rating?: number;
  tags: string[];
  thumbnail?: string;
  type: DocumentType;
  usageCount: number;
}

export interface TemplateContent {
  defaultValues?: Record<string, unknown>;
  structure: TemplateField[];
  validationRules?: ValidationRule[];
}

export interface TemplateField {
  helpText?: string;
  id: string;
  label: string;
  name: string;
  options?: FieldOption[];
  placeholder?: string;
  required: boolean;
  type: FieldType;
  validation?: ValidationRule;
}

export type FieldType =
  | 'checkbox'
  | 'date'
  | 'email'
  | 'file'
  | 'multiselect'
  | 'number'
  | 'phone'
  | 'radio'
  | 'select'
  | 'signature'
  | 'text'
  | 'textarea';

export interface FieldOption {
  disabled?: boolean;
  label: string;
  value: string;
}

export interface ValidationRule {
  message?: string;
  type: 'custom' | 'max' | 'min' | 'pattern' | 'required';
  value?: unknown;
}

// Contact Types
export interface Contact {
  address?: Address;
  createdAt: Date;
  email?: string;
  id: string;
  isEmergency: boolean;
  isPrimary: boolean;
  name: string;
  notes?: string;
  permissions: SharingPermission[];
  phone?: string;
  relationship?: string;
  type: ContactType;
  updatedAt: Date;
  userId: string;
}

export type ContactType =
  | 'attorney'
  | 'beneficiary'
  | 'doctor'
  | 'emergency'
  | 'executor'
  | 'family'
  | 'friend'
  | 'guardian';

export interface Address {
  city: string;
  country: string;
  postalCode: string;
  state: string;
  street1: string;
  street2?: string;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: ApiError;
  metadata?: ResponseMetadata;
  success: boolean;
}

export interface ApiError {
  code: string;
  details?: unknown;
  message: string;
  timestamp: Date;
}

export interface ResponseMetadata {
  hasMore?: boolean;
  limit?: number;
  page?: number;
  total?: number;
}

// Form Types
export interface FormState<T = unknown> {
  errors: Record<string, string>;
  isSubmitting: boolean;
  isValid: boolean;
  touched: Record<string, boolean>;
  values: T;
}

// Navigation Types
export interface NavigationItem {
  badge?: number | string;
  children?: NavigationItem[];
  icon?: string;
  id: string;
  label: string;
  path?: string;
  requiresAuth?: boolean;
  requiresPlan?: SubscriptionPlan[];
}

// Export all types from this file
export type {};
