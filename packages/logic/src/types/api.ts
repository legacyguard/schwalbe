// API Types for LegacyGuard centralized API layer
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
}

export interface ApiError {
  details?: unknown;
  message: string;
  status: number;
}

export interface PaginatedResponse<T> {
  count: number;
  data: T[];
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiClientInterface {
  delete<T = unknown>(endpoint: string): Promise<T>;
  get<T = unknown>(endpoint: string): Promise<T>;
  post<T = unknown>(endpoint: string, data?: unknown): Promise<T>;
  put<T = unknown>(endpoint: string, data?: unknown): Promise<T>;
  uploadFile(
    endpoint: string,
    file: {
      base64: string;
      fileName: string;
      mimeType: string;
    }
  ): Promise<unknown>;
}

// Request/Response types for different endpoints
export interface DocumentUploadRequest {
  category?: string;
  documentType?: string;
  file: {
    base64: string;
    fileName: string;
    mimeType: string;
  };
}

export interface DocumentListResponse {
  documents: Array<{
    created_at: string;
    document_type: string;
    file_name: string;
    file_path: string;
    file_type: null | string;
    id: string;
    updated_at: string;
  }>;
}

export interface UserProfileResponse {
  profile: {
    avatar_url: null | string;
    created_at: string;
    email: null | string;
    full_name: null | string;
    id: string;
    phone: null | string;
    updated_at: string;
  };
}

export interface WillData {
  assets?: Array<{
    description: string;
    type: string;
    value?: number;
  }>;
  beneficiaries?: Array<{
    name: string;
    percentage: number;
    relationship: string;
  }>;
  executor?: {
    email: string;
    name: string;
    phone?: string;
  };
  wishes?: string;
}

export interface GuardianData {
  email: string;
  is_active?: boolean;
  name: string;
  notes?: null | string;
  phone?: null | string;
  relationship?: null | string;
}

// Service method parameter types
export interface GetDocumentsParams {
  category?: string;
  documentType?: string;
  limit?: number;
  offset?: number;
}

export interface GetGuardiansParams {
  activeOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface CreateLegacyItemParams {
  category: 'asset' | 'document' | 'instruction' | 'memory' | 'wish';
  description?: string;
  due_date?: string;
  metadata?: Record<string, unknown>;
  priority?: 'high' | 'low' | 'medium' | 'urgent';
  tags?: string[];
  title: string;
}
