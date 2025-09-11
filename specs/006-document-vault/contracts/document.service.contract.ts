/**
 * Document Service Contract
 * 
 * This contract defines the interface for the Document Service API,
 * including all operations for document management, storage, and retrieval.
 */

export interface DocumentServiceContract {
  // Core CRUD operations
  uploadDocument(file: File, metadata: DocumentUploadMetadata): Promise<Document>;
  getDocument(id: string): Promise<Document>;
  updateDocument(id: string, updates: Partial<Document>): Promise<Document>;
  deleteDocument(id: string): Promise<void>;
  
  // Document listing and search
  listDocuments(filters?: DocumentFilters): Promise<DocumentListResult>;
  searchDocuments(query: SearchQuery): Promise<DocumentSearchResult>;
  
  // Document operations
  downloadDocument(id: string): Promise<Blob>;
  shareDocument(id: string, permissions: SharePermissions): Promise<ShareLink>;
  archiveDocument(id: string, reason?: string): Promise<void>;
  
  // Versioning
  getDocumentVersions(id: string): Promise<DocumentVersion[]>;
  restoreDocumentVersion(id: string, versionId: string): Promise<Document>;
  compareDocumentVersions(id: string, version1: string, version2: string): Promise<DocumentDiff>;
  
  // Bundles
  createBundle(bundle: BundleCreateRequest): Promise<DocumentBundle>;
  addDocumentToBundle(documentId: string, bundleId: string): Promise<void>;
  removeDocumentFromBundle(documentId: string, bundleId: string): Promise<void>;
  
  // Metadata and processing
  extractMetadata(id: string): Promise<DocumentMetadata>;
  processDocument(id: string): Promise<ProcessingResult>;
  updateDocumentTags(id: string, tags: string[]): Promise<Document>;
}

// Data Transfer Objects

export interface Document {
  id: string;
  userId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  encryptionNonce: string;
  bundleId?: string;
  category?: string;
  title?: string;
  description?: string;
  tags: string[];
  isImportant: boolean;
  ocrText?: string;
  ocrConfidence?: number;
  extractedEntities?: Record<string, any>;
  classificationConfidence?: number;
  extractedMetadata?: Record<string, any>;
  processingStatus: ProcessingStatus;
  uploadedAt: Date;
  modifiedAt: Date;
  expiresAt?: Date;
  
  // Versioning
  isArchived: boolean;
  versionNumber: number;
  previousVersionId?: string;
  isLatestVersion: boolean;
  versionDate: Date;
  archivedAt?: Date;
  archivedReason?: string;
}

export interface DocumentUploadMetadata {
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  isImportant?: boolean;
  expiresAt?: Date;
  bundleId?: string;
}

export interface DocumentFilters {
  category?: string;
  tags?: string[];
  isImportant?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  bundleId?: string;
  processingStatus?: ProcessingStatus;
  limit?: number;
  offset?: number;
}

export interface DocumentListResult {
  documents: Document[];
  totalCount: number;
  hasMore: boolean;
}

export interface SearchQuery {
  query: string;
  filters?: SearchFilters;
  sortBy?: SortOption;
  limit?: number;
  offset?: number;
}

export interface SearchFilters {
  category?: string;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  fileTypes?: string[];
  bundleId?: string;
  isImportant?: boolean;
  hasOCR?: boolean;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

export interface DocumentSearchResult {
  documents: Document[];
  totalCount: number;
  hasMore: boolean;
  searchTime: number;
  suggestions?: string[];
}

export interface DocumentVersion {
  id: string;
  versionNumber: number;
  versionDate: Date;
  fileSize: number;
  changeDescription?: string;
  isLatest: boolean;
}

export interface DocumentDiff {
  added: string[];
  removed: string[];
  modified: string[];
  unchanged: string[];
}

export interface SharePermissions {
  canRead: boolean;
  canDownload: boolean;
  canShare: boolean;
  canDelete: boolean;
  expiresAt?: Date;
}

export interface ShareLink {
  id: string;
  documentId: string;
  recipientId?: string;
  permissions: SharePermissions;
  expiresAt?: Date;
  createdAt: Date;
  accessCount: number;
  maxAccessCount?: number;
}

export interface DocumentBundle {
  id: string;
  userId: string;
  bundleName: string;
  bundleCategory: BundleCategory;
  description?: string;
  primaryEntity?: string;
  entityType?: string;
  keywords: string[];
  documentCount: number;
  totalFileSize: number;
  lastDocumentAdded?: Date;
  createdAt: Date;
  modifiedAt: Date;
}

export interface BundleCreateRequest {
  bundleName: string;
  bundleCategory: BundleCategory;
  description?: string;
  primaryEntity?: string;
  entityType?: string;
  keywords?: string[];
}

export interface DocumentMetadata {
  title?: string;
  description?: string;
  category?: string;
  tags: string[];
  entities: Entity[];
  keywords: string[];
  language: string;
  confidence: number;
  extractedAt: Date;
}

export interface Entity {
  text: string;
  type: string;
  confidence: number;
  startIndex: number;
  endIndex: number;
}

export interface ProcessingResult {
  documentId: string;
  status: ProcessingStatus;
  results: {
    ocr?: OCRResult;
    analysis?: DocumentAnalysis;
    categorization?: CategorizationResult;
  };
  errors?: ProcessingError[];
  processingTime: number;
  completedAt: Date;
}

export interface OCRResult {
  text: string;
  confidence: number;
  language: string;
  boundingBoxes?: BoundingBox[];
  extractedAt: Date;
}

export interface DocumentAnalysis {
  category: string;
  importance: number;
  summary: string;
  entities: Entity[];
  keywords: string[];
  language: string;
  confidence: number;
  analyzedAt: Date;
}

export interface CategorizationResult {
  category: string;
  confidence: number;
  alternativeCategories: Array<{
    category: string;
    confidence: number;
  }>;
  reasoning: string;
  categorizedAt: Date;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  confidence: number;
}

export interface ProcessingError {
  documentId: string;
  error: DocumentVaultError;
  retryable: boolean;
  retryAfter?: number;
}

export interface DocumentVaultError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  documentId?: string;
}

// Enums and Types

export type BundleCategory = 'legal' | 'financial' | 'medical' | 'personal' | 'business' | 'educational' | 'other';

export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';

// Error Types

export class DocumentNotFoundError extends Error {
  constructor(documentId: string) {
    super(`Document with ID ${documentId} not found`);
    this.name = 'DocumentNotFoundError';
  }
}

export class DocumentAccessDeniedError extends Error {
  constructor(documentId: string) {
    super(`Access denied to document ${documentId}`);
    this.name = 'DocumentAccessDeniedError';
  }
}

export class DocumentUploadError extends Error {
  constructor(message: string, cause?: Error) {
    super(`Document upload failed: ${message}`);
    this.name = 'DocumentUploadError';
    this.cause = cause;
  }
}

export class DocumentDownloadError extends Error {
  constructor(message: string, cause?: Error) {
    super(`Document download failed: ${message}`);
    this.name = 'DocumentDownloadError';
    this.cause = cause;
  }
}

export class DocumentProcessingError extends Error {
  constructor(message: string, cause?: Error) {
    super(`Document processing failed: ${message}`);
    this.name = 'DocumentProcessingError';
    this.cause = cause;
  }
}

export class DocumentVersionError extends Error {
  constructor(message: string, cause?: Error) {
    super(`Document versioning failed: ${message}`);
    this.name = 'DocumentVersionError';
    this.cause = cause;
  }
}

export class DocumentBundleError extends Error {
  constructor(message: string, cause?: Error) {
    super(`Document bundle operation failed: ${message}`);
    this.name = 'DocumentBundleError';
    this.cause = cause;
  }
}

export class DocumentSearchError extends Error {
  constructor(message: string, cause?: Error) {
    super(`Document search failed: ${message}`);
    this.name = 'DocumentSearchError';
    this.cause = cause;
  }
}

export class DocumentSharingError extends Error {
  constructor(message: string, cause?: Error) {
    super(`Document sharing failed: ${message}`);
    this.name = 'DocumentSharingError';
    this.cause = cause;
  }
}

// Validation Schemas

export const DocumentUploadMetadataSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', maxLength: 255 },
    description: { type: 'string', maxLength: 1000 },
    category: { type: 'string', maxLength: 100 },
    tags: { type: 'array', items: { type: 'string', maxLength: 50 } },
    isImportant: { type: 'boolean' },
    expiresAt: { type: 'string', format: 'date-time' },
    bundleId: { type: 'string', format: 'uuid' }
  },
  additionalProperties: false
};

export const DocumentFiltersSchema = {
  type: 'object',
  properties: {
    category: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' } },
    isImportant: { type: 'boolean' },
    dateRange: {
      type: 'object',
      properties: {
        start: { type: 'string', format: 'date-time' },
        end: { type: 'string', format: 'date-time' }
      },
      required: ['start', 'end']
    },
    bundleId: { type: 'string', format: 'uuid' },
    processingStatus: { type: 'string', enum: ['pending', 'processing', 'completed', 'failed', 'skipped'] },
    limit: { type: 'integer', minimum: 1, maximum: 100 },
    offset: { type: 'integer', minimum: 0 }
  },
  additionalProperties: false
};

export const SearchQuerySchema = {
  type: 'object',
  properties: {
    query: { type: 'string', minLength: 1, maxLength: 500 },
    filters: { $ref: '#/definitions/SearchFilters' },
    sortBy: {
      type: 'object',
      properties: {
        field: { type: 'string' },
        direction: { type: 'string', enum: ['asc', 'desc'] }
      },
      required: ['field', 'direction']
    },
    limit: { type: 'integer', minimum: 1, maximum: 100 },
    offset: { type: 'integer', minimum: 0 }
  },
  required: ['query'],
  additionalProperties: false
};

export const BundleCreateRequestSchema = {
  type: 'object',
  properties: {
    bundleName: { type: 'string', minLength: 1, maxLength: 255 },
    bundleCategory: { type: 'string', enum: ['legal', 'financial', 'medical', 'personal', 'business', 'educational', 'other'] },
    description: { type: 'string', maxLength: 1000 },
    primaryEntity: { type: 'string', maxLength: 255 },
    entityType: { type: 'string', maxLength: 100 },
    keywords: { type: 'array', items: { type: 'string', maxLength: 50 } }
  },
  required: ['bundleName', 'bundleCategory'],
  additionalProperties: false
};

// Performance Requirements

export interface PerformanceRequirements {
  // Document operations
  uploadTime: {
    smallFiles: number; // <1MB in milliseconds
    mediumFiles: number; // 1-10MB in milliseconds
    largeFiles: number; // 10-100MB in milliseconds
  };
  
  downloadTime: {
    smallFiles: number; // <1MB in milliseconds
    mediumFiles: number; // 1-10MB in milliseconds
    largeFiles: number; // 10-100MB in milliseconds
  };
  
  // Search operations
  searchTime: {
    simpleQuery: number; // Simple text search in milliseconds
    complexQuery: number; // Complex filtered search in milliseconds
    facetedSearch: number; // Faceted search in milliseconds
  };
  
  // Metadata operations
  metadataExtraction: {
    ocrProcessing: number; // OCR processing time in milliseconds
    aiAnalysis: number; // AI analysis time in milliseconds
    categorization: number; // Categorization time in milliseconds
  };
  
  // System limits
  limits: {
    maxFileSize: number; // Maximum file size in bytes
    maxDocumentsPerUser: number; // Maximum documents per user
    maxStoragePerUser: number; // Maximum storage per user in bytes
    maxSearchResults: number; // Maximum search results per query
  };
}

// Default performance requirements
export const DEFAULT_PERFORMANCE_REQUIREMENTS: PerformanceRequirements = {
  uploadTime: {
    smallFiles: 500,
    mediumFiles: 2000,
    largeFiles: 10000
  },
  downloadTime: {
    smallFiles: 200,
    mediumFiles: 1000,
    largeFiles: 5000
  },
  searchTime: {
    simpleQuery: 100,
    complexQuery: 300,
    facetedSearch: 500
  },
  metadataExtraction: {
    ocrProcessing: 2000,
    aiAnalysis: 1000,
    categorization: 500
  },
  limits: {
    maxFileSize: 100 * 1024 * 1024, // 100MB
    maxDocumentsPerUser: 10000,
    maxStoragePerUser: 10 * 1024 * 1024 * 1024, // 10GB
    maxSearchResults: 1000
  }
};