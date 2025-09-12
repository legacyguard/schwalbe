// Time Capsule Legacy System - Interface Contracts
// Based on Hollywood implementation with Schwalbe adaptations

export type DeliveryCondition = 'ON_DATE' | 'ON_DEATH';
export type CapsuleStatus = 'CANCELLED' | 'DELIVERED' | 'FAILED' | 'PENDING';
export type CapsuleFileType = 'audio' | 'video';

// Core Time Capsule Entity
export interface TimeCapsule {
  access_token: string;
  created_at: string;
  delivered_at?: null | string;
  delivery_attempts: number;
  delivery_condition: DeliveryCondition;
  delivery_date?: null | string;
  delivery_error?: null | string;
  duration_seconds?: null | number;
  file_size_bytes?: null | number;
  file_type: CapsuleFileType;
  id: string;
  is_delivered: boolean;
  last_delivery_attempt?: null | string;
  message_preview?: null | string;
  message_title: string;
  recipient_email: string;
  recipient_id?: null | string;
  recipient_name: string;
  status: CapsuleStatus;
  storage_path: string;
  thumbnail_path?: null | string;
  updated_at: string;
  user_id: string;
}

// API Request/Response Contracts
export interface CreateTimeCapsuleRequest {
  delivery_condition: DeliveryCondition;
  delivery_date?: string;
  duration_seconds?: number;
  file_size_bytes?: number;
  file_type: CapsuleFileType;
  message_preview?: string;
  message_title: string;
  recipient_email: string;
  recipient_id?: string;
  recipient_name: string;
}

export interface UpdateTimeCapsuleRequest
  extends Partial<CreateTimeCapsuleRequest> {
  status?: CapsuleStatus;
}

// Recording Data Structure
export interface TimeCapsuleRecordingData {
  blob: Blob;
  duration: number;
  fileType: CapsuleFileType;
  thumbnail?: Blob; // For video recordings
}

// Wizard Form Data
export interface TimeCapsuleFormData {
  deliveryCondition: DeliveryCondition;
  deliveryDate: Date | null;
  messagePreview: string;
  messageTitle: string;
  recipient: null | RecipientOption;
  recording: null | TimeCapsuleRecordingData;
}

// Recipient Selection
export interface RecipientOption {
  email: string;
  id?: string;
  isGuardian: boolean;
  name: string;
  relationship?: string;
}

// Secure Viewing Access
export interface TimeCapsuleAccess {
  capsule: TimeCapsule;
  signed_url: string; // Pre-signed URL for video/audio file
  thumbnail_url?: string; // Pre-signed URL for thumbnail if exists
  user_name: string;
}

// Delivery System Contracts
export interface TimeCapsuleDelivery {
  access_token: string;
  capsule_id: string;
  delivery_condition: DeliveryCondition;
  message_title: string;
  recipient_email: string;
  recipient_name: string;
  user_id: string;
}

// Recording Constraints
export interface RecordingConstraints {
  audio: {
    echoCancellation: boolean;
    noiseSuppression: boolean;
    sampleRate: number;
  };
  video?: {
    frameRate: { ideal: number };
    height: { ideal: number };
    width: { ideal: number };
  };
}

// Database Function Contracts
export interface DatabaseFunctions {
  // Get capsules ready for delivery
  get_time_capsules_ready_for_delivery(): Promise<TimeCapsuleDelivery[]>;

  // Mark capsule as delivered
  mark_capsule_delivered(capsule_uuid: string): Promise<boolean>;

  // Increment delivery attempts
  increment_delivery_attempt(
    capsule_uuid: string,
    error_message: string
  ): Promise<void>;

  // Generate signed URL for media access
  get_time_capsule_signed_url(
    capsule_token: string,
    expires_in?: number
  ): Promise<string>;
}

// Edge Function Request/Response
export interface EdgeFunctionRequest {
  method: string;
  headers: Record<string, string>;
  body?: any;
}

export interface EdgeFunctionResponse {
  status: number;
  headers: Record<string, string>;
  body: any;
}

// Email Template Contracts
export interface EmailTemplateData {
  capsule: TimeCapsuleDelivery;
  viewingUrl: string;
  isTestPreview?: boolean;
}

export interface EmailTemplateResponse {
  subject: string;
  html: string;
  text?: string;
}

// Storage Contracts
export interface StorageUploadRequest {
  file: Blob;
  fileName: string;
  contentType: string;
  cacheControl?: string;
}

export interface StorageUploadResponse {
  path: string;
  id: string;
  fullPath: string;
}

// Statistics and Analytics
export interface TimeCapsuleStats {
  delivered: number;
  failed: number;
  pending: number;
  scheduled_for_date: number;
  scheduled_on_death: number;
  total: number;
}

// Error Contracts
export interface TimeCapsuleError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Validation Contracts
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface TimeCapsuleValidation extends ValidationResult {
  fieldErrors: Record<string, string[]>;
}

// Guardian interface (simplified for contracts)
export interface Guardian {
  id: string;
  user_id: string;
  name: string;
  email: string;
  relationship?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Component Props Contracts
export interface TimeCapsuleWizardProps {
  guardians: Guardian[];
  isOpen: boolean;
  onCapsuleCreated: (capsule: TimeCapsule) => void;
  onClose: () => void;
}

export interface TimeCapsuleListProps {
  capsules: TimeCapsule[];
  onTestPreview: (capsule: TimeCapsule) => void;
  onDelete: (capsuleId: string) => void;
  loading?: boolean;
}

export interface TimeCapsuleViewProps {
  accessToken: string;
  onError?: (error: TimeCapsuleError) => void;
}

// Service Layer Contracts
export interface TimeCapsuleService {
  // CRUD operations
  create(capsule: CreateTimeCapsuleRequest): Promise<TimeCapsule>;
  getById(id: string): Promise<TimeCapsule | null>;
  getByUserId(userId: string): Promise<TimeCapsule[]>;
  update(id: string, updates: UpdateTimeCapsuleRequest): Promise<TimeCapsule>;
  delete(id: string): Promise<void>;

  // Business logic
  getReadyForDelivery(): Promise<TimeCapsule[]>;
  markAsDelivered(id: string): Promise<void>;
  sendTestPreview(id: string): Promise<void>;
  getSignedUrl(token: string, expiresIn?: number): Promise<string>;
}

export interface StorageService {
  upload(file: Blob, path: string, options?: {
    contentType?: string;
    cacheControl?: string;
  }): Promise<string>;

  getSignedUrl(path: string, expiresIn?: number): Promise<string>;
  delete(path: string): Promise<void>;
}

export interface EmailService {
  sendTimeCapsuleDelivery(
    recipient: TimeCapsuleDelivery,
    viewingUrl: string
  ): Promise<void>;

  sendTestPreview(
    capsule: TimeCapsule,
    viewingUrl: string
  ): Promise<void>;
}

// Constants and Configuration
export const DEFAULT_RECORDING_CONSTRAINTS: RecordingConstraints = {
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 },
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    sampleRate: 44100,
  },
};

export const MAX_RECORDING_DURATION = 300; // 5 minutes in seconds
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes
export const VIEWING_URL_EXPIRY = 3600; // 1 hour in seconds
export const CAPSULE_ACCESS_EXPIRY = 30; // 30 days

// Type Guards
export function isTimeCapsule(obj: any): obj is TimeCapsule {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.user_id === 'string' &&
    typeof obj.message_title === 'string' &&
    typeof obj.recipient_email === 'string' &&
    typeof obj.delivery_condition === 'string' &&
    ['ON_DATE', 'ON_DEATH'].includes(obj.delivery_condition)
  );
}

export function isDeliveryCondition(value: string): value is DeliveryCondition {
  return ['ON_DATE', 'ON_DEATH'].includes(value);
}

export function isCapsuleStatus(value: string): value is CapsuleStatus {
  return ['CANCELLED', 'DELIVERED', 'FAILED', 'PENDING'].includes(value);
}

export function isCapsuleFileType(value: string): value is CapsuleFileType {
  return ['audio', 'video'].includes(value);
}

// Utility Types
export type TimeCapsuleStatus = 'creating' | 'uploading' | 'processing' | 'ready' | 'delivered' | 'failed';
export type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped' | 'processing';

// Forward compatibility types (for future enhancements)
export interface TimeCapsuleMetadata {
  tags?: string[];
  categories?: string[];
  priority?: 'low' | 'medium' | 'high';
  custom_fields?: Record<string, any>;
}

export interface BulkOperationRequest {
  capsuleIds: string[];
  operation: 'delete' | 'archive' | 'export';
}

export interface TimeCapsuleFilter {
  status?: CapsuleStatus[];
  deliveryCondition?: DeliveryCondition[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  recipient?: string;
}

// Re-export for convenience
// Guardian type defined inline above