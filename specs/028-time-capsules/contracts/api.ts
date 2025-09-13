// Time Capsules API Contracts

// REST API Endpoints
export interface TimeCapsulesAPI {
  // Capsule Management
  'GET /api/time-capsules': {
    request: GetCapsulesRequest;
    response: GetCapsulesResponse;
  };

  'POST /api/time-capsules': {
    request: CreateCapsuleRequest;
    response: CreateCapsuleResponse;
  };

  'PUT /api/time-capsules/{id}': {
    request: UpdateCapsuleRequest;
    response: UpdateCapsuleResponse;
  };

  'DELETE /api/time-capsules/{id}': {
    request: {};
    response: DeleteCapsuleResponse;
  };

  // File Operations
  'POST /api/time-capsules/{id}/upload': {
    request: UploadMediaRequest;
    response: UploadMediaResponse;
  };

  'GET /api/time-capsules/{id}/download': {
    request: {};
    response: Blob;
  };

  // Test Preview
  'POST /api/time-capsules/{id}/test-preview': {
    request: SendTestPreviewRequest;
    response: SendTestPreviewResponse;
  };

  // Analytics
  'GET /api/time-capsules/{id}/analytics': {
    request: GetAnalyticsRequest;
    response: GetAnalyticsResponse;
  };

  // Legacy Operations (Phase 2G)
  'GET /api/time-capsules/{id}/versions': {
    request: GetVersionsRequest;
    response: GetVersionsResponse;
  };

  'POST /api/time-capsules/{id}/versions': {
    request: CreateVersionRequest;
    response: CreateVersionResponse;
  };
}

// Request/Response Types
export interface GetCapsulesRequest {
  status?: CapsuleStatus;
  deliveryCondition?: DeliveryCondition;
  limit?: number;
  offset?: number;
  sortBy?: 'created_at' | 'delivery_date' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface GetCapsulesResponse {
  capsules: TimeCapsule[];
  total: number;
  hasMore: boolean;
  nextOffset?: number;
}

export interface CreateCapsuleRequest {
  recipientName: string;
  recipientEmail: string;
  deliveryCondition: DeliveryCondition;
  deliveryDate?: string;
  messageTitle: string;
  messagePreview?: string;
  mediaType: MediaType;
  emotionalTags?: EmotionalTags;
}

export interface CreateCapsuleResponse {
  capsule: TimeCapsule;
  uploadUrl?: string;
  expiresAt?: string;
}

export interface UpdateCapsuleRequest {
  messageTitle?: string;
  messagePreview?: string;
  deliveryDate?: string;
  emotionalTags?: EmotionalTags;
}

export interface UpdateCapsuleResponse {
  capsule: TimeCapsule;
  success: boolean;
}

export interface DeleteCapsuleResponse {
  success: boolean;
  deletedAt: string;
}

export interface UploadMediaRequest {
  file: File;
  encryptionMetadata: EncryptionMetadata;
  generateThumbnail?: boolean;
}

export interface UploadMediaResponse {
  storagePath: string;
  thumbnailPath?: string;
  fileSize: number;
  duration: number;
  encryptionVerified: boolean;
}

export interface SendTestPreviewRequest {
  // No body required - uses capsule data
}

export interface SendTestPreviewResponse {
  success: boolean;
  emailSent: boolean;
  previewUrl: string;
  sentAt: string;
}

export interface GetAnalyticsRequest {
  eventTypes?: EventType[];
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

export interface GetAnalyticsResponse {
  analytics: CapsuleAnalytics[];
  summary: AnalyticsSummary;
}

export interface GetVersionsRequest {
  limit?: number;
  offset?: number;
}

export interface GetVersionsResponse {
  versions: CapsuleVersion[];
  total: number;
  hasMore: boolean;
}

export interface CreateVersionRequest {
  versionLabel?: string;
  changeReason?: string;
  emotionalContext?: EmotionalContext;
}

export interface CreateVersionResponse {
  version: CapsuleVersion;
  success: boolean;
}

// Edge Function Contracts
export interface EdgeFunctionsAPI {
  'time-capsule-delivery': {
    payload: DeliveryFunctionPayload;
    response: DeliveryResult;
  };

  'time-capsule-test-preview': {
    payload: TestPreviewPayload;
    response: TestPreviewResult;
  };
}

export interface DeliveryFunctionPayload {
  capsuleId?: string; // Specific capsule, or all ready capsules if not provided
  force?: boolean; // Force delivery regardless of conditions
  dryRun?: boolean; // Test mode without actual delivery
}

export interface DeliveryResult {
  success: boolean;
  processedCount: number;
  deliveredCount: number;
  failedCount: number;
  skippedCount: number;
  errors: DeliveryError[];
  executionTime: number;
}

export interface DeliveryError {
  capsuleId: string;
  error: string;
  code: string;
  retryable: boolean;
  retryAfter?: number;
}

export interface TestPreviewPayload {
  capsuleId: string;
  customRecipient?: string; // Override recipient for testing
}

export interface TestPreviewResult {
  success: boolean;
  emailSent: boolean;
  previewUrl: string;
  testToken: string;
  expiresAt: string;
}

// WebSocket API (Future enhancement)
export interface WebSocketAPI {
  'capsule:status': {
    payload: { capsuleId: string };
    response: CapsuleStatusUpdate;
  };

  'capsule:progress': {
    payload: { capsuleId: string };
    response: UploadProgress;
  };
}

export interface CapsuleStatusUpdate {
  capsuleId: string;
  status: CapsuleStatus;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface UploadProgress {
  capsuleId: string;
  progress: number; // 0-100
  stage: 'uploading' | 'encrypting' | 'processing' | 'complete';
  bytesUploaded: number;
  totalBytes: number;
}

// Error Response Contracts
export interface APIError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    field?: string;
    timestamp: string;
  };
}

export interface ValidationError extends APIError {
  error: APIError['error'] & {
    field: string;
    value: any;
    constraint: string;
  };
}

export interface RateLimitError extends APIError {
  error: APIError['error'] & {
    retryAfter: number;
    limit: number;
    remaining: number;
  };
}

// Pagination Contract
export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  nextOffset?: number;
  prevOffset?: number;
}

// Filtering Contract
export interface CapsuleFilters {
  status?: CapsuleStatus[];
  deliveryCondition?: DeliveryCondition[];
  mediaType?: MediaType[];
  dateFrom?: string;
  dateTo?: string;
  recipientEmail?: string;
  hasEmotionalTags?: boolean;
  minDuration?: number;
  maxDuration?: number;
}

// Sorting Contract
export interface CapsuleSorting {
  field: 'created_at' | 'updated_at' | 'delivery_date' | 'status' | 'file_size_bytes';
  order: 'asc' | 'desc';
}

// Bulk Operations Contract
export interface BulkOperationRequest {
  capsuleIds: string[];
  operation: 'delete' | 'update_status' | 'update_delivery';
  data?: Record<string, any>;
}

export interface BulkOperationResponse {
  success: boolean;
  processedCount: number;
  failedCount: number;
  results: BulkOperationResult[];
}

export interface BulkOperationResult {
  capsuleId: string;
  success: boolean;
  error?: string;
}

// Import Contracts
export interface ImportCapsulesRequest {
  source: 'hollywood' | 'json' | 'csv';
  data: any;
  options?: ImportOptions;
}

export interface ImportOptions {
  skipValidation?: boolean;
  createVersions?: boolean;
  preserveIds?: boolean;
  defaultStatus?: CapsuleStatus;
}

export interface ImportCapsulesResponse {
  success: boolean;
  importedCount: number;
  failedCount: number;
  errors: ImportError[];
  executionTime: number;
}

export interface ImportError {
  index: number;
  error: string;
  data?: any;
}

// Export Contracts
export interface ExportCapsulesRequest {
  capsuleIds?: string[];
  format: 'json' | 'csv' | 'xml';
  includeVersions?: boolean;
  includeAnalytics?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface ExportCapsulesResponse {
  success: boolean;
  downloadUrl: string;
  expiresAt: string;
  fileSize: number;
  recordCount: number;
}

// Search Contract
export interface SearchCapsulesRequest {
  query: string;
  fields?: ('title' | 'preview' | 'recipient_name' | 'emotional_tags')[];
  filters?: CapsuleFilters;
  sorting?: CapsuleSorting;
  limit?: number;
  offset?: number;
}

export interface SearchCapsulesResponse {
  capsules: TimeCapsule[];
  highlights: SearchHighlight[];
  total: number;
  searchTime: number;
  pagination: PaginationMeta;
}

export interface SearchHighlight {
  capsuleId: string;
  field: string;
  snippet: string;
  positions: number[];
}

// Analytics Summary Contract
export interface AnalyticsSummary {
  totalViews: number;
  totalPlays: number;
  averageEngagement: number;
  completionRate: number;
  emotionalImpact: {
    joy: number;
    sadness: number;
    hope: number;
    love: number;
    gratitude: number;
  };
  performance: {
    averageLoadTime: number;
    averagePlaybackTime: number;
    failureRate: number;
  };
}

// Type imports (from interfaces.ts)
type TimeCapsule = import('./interfaces').TimeCapsule;
type CapsuleStatus = import('./interfaces').CapsuleStatus;
type DeliveryCondition = import('./interfaces').DeliveryCondition;
type MediaType = import('./interfaces').MediaType;
type EventType = import('./interfaces').EventType;
type EmotionalTags = import('./interfaces').EmotionalTags;
type EncryptionMetadata = import('./interfaces').EncryptionMetadata;
type CapsuleAnalytics = import('./interfaces').CapsuleAnalytics;
type CapsuleVersion = import('./interfaces').CapsuleVersion;
type EmotionalContext = import('./interfaces').EmotionalContext;