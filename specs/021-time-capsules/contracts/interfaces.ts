// Time Capsules TypeScript Interfaces
// Core Types
export type DeliveryCondition = 'ON_DATE' | 'ON_DEATH';
export type CapsuleStatus = 'PENDING' | 'DELIVERED' | 'FAILED' | 'CANCELLED';
export type MediaType = 'video' | 'audio';
export type EventType = 'CREATED' | 'DELIVERED' | 'VIEWED' | 'FAILED' | 'TEST_PREVIEW';

// Main Entity Interfaces
export interface TimeCapsule {
  id: string;
  userId: string;
  recipientId?: string;
  recipientName: string;
  recipientEmail: string;
  deliveryCondition: DeliveryCondition;
  deliveryDate?: string;
  messageTitle: string;
  messagePreview?: string;
  mediaType: MediaType;
  storagePath: string;
  fileSizeBytes?: number;
  durationSeconds?: number;
  thumbnailPath?: string;
  status: CapsuleStatus;
  isDelivered: boolean;
  deliveredAt?: string;
  deliveryAttempts: number;
  accessToken: string;
  accessExpiresAt?: string;
  versionId?: string;
  emotionalTags?: EmotionalTags;
  createdAt: string;
  updatedAt: string;
}

export interface CapsuleVersion {
  id: string;
  capsuleId: string;
  userId: string;
  versionNumber: number;
  versionLabel?: string;
  createdAt: string;
  snapshotData: CapsuleSnapshot;
  emotionalContext?: EmotionalContext;
  changeReason?: string;
  isLegacy: boolean;
}

export interface CapsuleAnalytics {
  id: string;
  capsuleId: string;
  userId: string;
  eventType: EventType;
  eventTimestamp: string;
  emotionalImpactScore?: number;
  userSentiment?: string;
  engagementDuration?: string;
  loadTime?: string;
  playbackDuration?: string;
  completionRate?: number;
}

// Snapshot and Legacy Types
export interface CapsuleSnapshot {
  capsule: TimeCapsule;
  recipient: GuardianInfo;
  delivery: DeliveryConfig;
  content: ContentMetadata;
}

export interface EmotionalTags {
  joy: number;
  sadness: number;
  hope: number;
  love: number;
  gratitude: number;
  customTags: string[];
}

export interface EmotionalContext {
  userMood: string;
  lifeStage: string;
  motivation: string;
  timestamp: string;
}

// Supporting Types
export interface GuardianInfo {
  id: string;
  name: string;
  email: string;
  relationship: string;
}

export interface DeliveryConfig {
  condition: DeliveryCondition;
  date?: string;
  timezone: string;
  emergencyTriggers: string[];
}

export interface ContentMetadata {
  title: string;
  preview?: string;
  mediaType: MediaType;
  duration?: number;
  size?: number;
  encryption: EncryptionInfo;
}

export interface EncryptionInfo {
  algorithm: string;
  keySalt: string;
  version: string;
  timestamp: string;
}

// API Request/Response Types
export interface CreateCapsuleRequest {
  recipientName: string;
  recipientEmail: string;
  deliveryCondition: DeliveryCondition;
  deliveryDate?: string;
  messageTitle: string;
  messagePreview?: string;
  mediaType: MediaType;
}

export interface CreateCapsuleResponse {
  capsuleId: string;
  uploadUrl: string;
}

export interface UpdateCapsuleRequest {
  messageTitle?: string;
  messagePreview?: string;
  deliveryDate?: string;
}

export interface GetCapsulesRequest {
  status?: CapsuleStatus;
  limit?: number;
  offset?: number;
}

export interface GetCapsulesResponse {
  capsules: TimeCapsule[];
  total: number;
  hasMore: boolean;
}

// File Upload Types
export interface UploadMediaRequest {
  file: File;
  encryptionMetadata: EncryptionMetadata;
}

export interface UploadMediaResponse {
  storagePath: string;
  thumbnailPath?: string;
  fileSize: number;
  duration: number;
}

export interface EncryptionMetadata {
  algorithm: string;
  keySalt: string;
  iv: string;
  authTag?: string;
  version: string;
}

// Edge Function Types
export interface DeliveryFunctionPayload {
  capsuleId?: string;
  force?: boolean;
}

export interface DeliveryResult {
  success: boolean;
  deliveredCount: number;
  failedCount: number;
  errors: DeliveryError[];
}

export interface DeliveryError {
  capsuleId: string;
  error: string;
  retryable: boolean;
}

export interface TestPreviewPayload {
  capsuleId: string;
}

export interface TestPreviewResult {
  success: boolean;
  emailSent: boolean;
  previewUrl: string;
}

// Component Prop Types
export interface TimeCapsuleWizardProps {
  onComplete?: (capsule: TimeCapsule) => void;
  initialData?: Partial<CreateCapsuleRequest>;
}

export interface RecordingStepProps {
  onRecordingComplete: (blob: Blob, metadata: RecordingMetadata) => void;
  onError: (error: RecordingError) => void;
  maxDuration?: number;
  quality?: RecordingQuality;
}

export interface RecordingMetadata {
  duration: number;
  size: number;
  type: string;
  quality: RecordingQuality;
}

export interface RecordingError {
  code: string;
  message: string;
  recoverable: boolean;
}

export type RecordingQuality = 'low' | 'medium' | 'high';

// Hook Return Types
export interface UseVideoRecordingReturn {
  isRecording: boolean;
  recordedBlob: Blob | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  error: string | null;
}

export interface UseCapsuleCreationReturn {
  createCapsule: (data: CreateCapsuleRequest) => Promise<TimeCapsule>;
  uploadMedia: (capsuleId: string, file: File) => Promise<UploadMediaResponse>;
  isLoading: boolean;
  error: string | null;
}

// Service Interface Types
export interface EncryptionService {
  encryptFile(file: File, passphrase: string): Promise<{
    encryptedBlob: Blob;
    metadata: EncryptionMetadata;
  }>;
  decryptFile(encryptedBlob: Blob, passphrase: string, metadata: EncryptionMetadata): Promise<Blob>;
  deriveKey(passphrase: string, salt: string): Promise<CryptoKey>;
}

export interface StorageService {
  uploadFile(file: Blob, path: string): Promise<string>;
  downloadFile(path: string): Promise<Blob>;
  generateSignedUrl(path: string, expiresIn: number): Promise<string>;
  deleteFile(path: string): Promise<void>;
}

export interface EmailService {
  sendDeliveryEmail(capsule: TimeCapsule, accessToken: string): Promise<boolean>;
  sendTestPreviewEmail(capsule: TimeCapsule, accessToken: string): Promise<boolean>;
  validateTemplate(templateId: string): Promise<boolean>;
}

// Error Types
export interface CapsuleError {
  code: string;
  message: string;
  field?: string;
  recoverable: boolean;
}

export interface ValidationError extends CapsuleError {
  field: string;
  value: any;
  constraint: string;
}

// Configuration Types
export interface TimeCapsuleConfig {
  maxFileSize: number;
  maxDuration: number;
  accessExpiryDays: number;
  supportedFormats: string[];
  encryptionAlgorithm: string;
  keyDerivationRounds: number;
}

export interface EmailTemplateConfig {
  deliveryTemplate: string;
  testPreviewTemplate: string;
  fromEmail: string;
  brandColors: {
    primary: string;
    secondary: string;
  };
}

// Analytics Types
export interface CapsuleMetrics {
  totalCreated: number;
  totalDelivered: number;
  averageCreationTime: number;
  averageDeliveryTime: number;
  failureRate: number;
  userSatisfaction: number;
}

export interface PerformanceMetrics {
  recordingInitTime: number;
  uploadTime: number;
  encryptionTime: number;
  deliveryTime: number;
  pageLoadTime: number;
}