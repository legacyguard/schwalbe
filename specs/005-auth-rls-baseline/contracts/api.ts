// Auth + RLS Baseline: API Contracts
// Defines the interfaces and contracts for API operations

/**
 * Base API response interface
 */
export interface ApiResponse<T = any> {
  /** Operation success status */
  success: boolean;
  /** Response data */
  data?: T;
  /** Error information */
  error?: ApiError;
  /** Response metadata */
  metadata?: ApiMetadata;
}

/**
 * API error interface
 */
export interface ApiError {
  /** Error code */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Error details */
  details?: any;
  /** Error timestamp */
  timestamp?: string;
  /** Request ID for tracing */
  requestId?: string;
}

/**
 * API metadata interface
 */
export interface ApiMetadata {
  /** Request ID for tracing */
  requestId: string;
  /** Response timestamp */
  timestamp: string;
  /** API version */
  version: string;
  /** Processing time in milliseconds */
  processingTime?: number;
  /** Pagination metadata */
  pagination?: PaginationMetadata;
}

/**
 * Pagination metadata interface
 */
export interface PaginationMetadata {
  /** Current page number */
  page: number;
  /** Number of items per page */
  limit: number;
  /** Total number of items */
  total: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there are more pages */
  hasNext: boolean;
  /** Whether there are previous pages */
  hasPrev: boolean;
}

/**
 * API request options interface
 */
export interface ApiRequestOptions {
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Request headers */
  headers?: Record<string, string>;
  /** Query parameters */
  params?: Record<string, any>;
  /** Request body */
  body?: any;
  /** Response type */
  responseType?: 'json' | 'text' | 'blob';
}

/**
 * Authentication API responses
 */
export interface AuthApiResponse extends ApiResponse {
  data?: {
    user: import('./auth').AuthUser;
    session: import('./auth').AuthSession;
    tokens?: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
  };
}

/**
 * Profile API responses
 */
export interface ProfileApiResponse extends ApiResponse {
  data?: import('./database').Profile;
}

export interface ProfilesApiResponse extends ApiResponse<import('./database').Profile[]> {
  metadata?: ApiMetadata & {
    pagination: PaginationMetadata;
  };
}

/**
 * Session API responses
 */
export interface SessionApiResponse extends ApiResponse {
  data?: import('./database').UserSession;
}

export interface SessionsApiResponse extends ApiResponse<import('./database').UserSession[]> {
  metadata?: ApiMetadata & {
    pagination: PaginationMetadata;
  };
}

/**
 * Audit API responses
 */
export interface AuditLogApiResponse extends ApiResponse {
  data?: import('./database').AuditLog;
}

export interface AuditLogsApiResponse extends ApiResponse<import('./database').AuditLog[]> {
  metadata?: ApiMetadata & {
    pagination: PaginationMetadata;
  };
}

/**
 * API client interface
 * Defines the contract for API operations
 */
export interface ApiClient {
  /** Base API URL */
  baseURL: string;

  /** Default request options */
  defaults: ApiRequestOptions;

  /** Make GET request */
  get<T = any>(
    endpoint: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>>;

  /** Make POST request */
  post<T = any>(
    endpoint: string,
    data?: any,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>>;

  /** Make PUT request */
  put<T = any>(
    endpoint: string,
    data?: any,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>>;

  /** Make PATCH request */
  patch<T = any>(
    endpoint: string,
    data?: any,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>>;

  /** Make DELETE request */
  delete<T = any>(
    endpoint: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>>;

  /** Set authentication token */
  setAuthToken(token: string | null): void;

  /** Set default headers */
  setHeaders(headers: Record<string, string>): void;

  /** Handle authentication errors */
  onAuthError(handler: (error: ApiError) => void): void;

  /** Handle network errors */
  onNetworkError(handler: (error: Error) => void): void;
}

/**
 * Authentication API interface
 */
export interface AuthApi {
  /** Sign in */
  signIn(credentials: {
    email: string;
    password: string;
  }): Promise<AuthApiResponse>;

  /** Sign up */
  signUp(userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<AuthApiResponse>;

  /** Sign out */
  signOut(): Promise<ApiResponse>;

  /** Get current user */
  getCurrentUser(): Promise<ProfileApiResponse>;

  /** Refresh session */
  refreshSession(): Promise<AuthApiResponse>;

  /** Request password reset */
  requestPasswordReset(email: string): Promise<ApiResponse>;

  /** Reset password */
  resetPassword(token: string, newPassword: string): Promise<ApiResponse>;

  /** Verify email */
  verifyEmail(token: string): Promise<ApiResponse>;
}

/**
 * Profile API interface
 */
export interface ProfileApi {
  /** Get user profile */
  getProfile(): Promise<ProfileApiResponse>;

  /** Create user profile */
  createProfile(profileData: Partial<import('./database').Profile>): Promise<ProfileApiResponse>;

  /** Update user profile */
  updateProfile(profileData: Partial<import('./database').Profile>): Promise<ProfileApiResponse>;

  /** Delete user profile */
  deleteProfile(): Promise<ApiResponse>;

  /** Upload avatar */
  uploadAvatar(file: File): Promise<ApiResponse<{ avatarUrl: string }>>;
}

/**
 * Session API interface
 */
export interface SessionApi {
  /** Get user sessions */
  getSessions(options?: {
    page?: number;
    limit?: number;
  }): Promise<SessionsApiResponse>;

  /** Get current session */
  getCurrentSession(): Promise<SessionApiResponse>;

  /** Terminate session */
  terminateSession(sessionId: string): Promise<ApiResponse>;

  /** Terminate all other sessions */
  terminateOtherSessions(): Promise<ApiResponse>;
}

/**
 * Audit API interface
 */
export interface AuditApi {
  /** Get audit logs */
  getAuditLogs(options?: {
    page?: number;
    limit?: number;
    action?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AuditLogsApiResponse>;

  /** Get audit log details */
  getAuditLog(logId: string): Promise<AuditLogApiResponse>;
}

/**
 * API service interface
 * Main API service that combines all API interfaces
 */
export interface ApiService {
  /** Authentication API */
  auth: AuthApi;
  /** Profile API */
  profile: ProfileApi;
  /** Session API */
  session: SessionApi;
  /** Audit API */
  audit: AuditApi;
  /** HTTP client */
  client: ApiClient;

  /** Initialize API service */
  initialize(config: ApiConfig): void;

  /** Set authentication token */
  setAuthToken(token: string | null): void;

  /** Check API health */
  healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>>;
}

/**
 * API configuration interface
 */
export interface ApiConfig {
  /** Base API URL */
  baseURL: string;
  /** API version */
  version?: string;
  /** Request timeout */
  timeout?: number;
  /** Default headers */
  headers?: Record<string, string>;
  /** Retry configuration */
  retry?: {
    attempts: number;
    delay: number;
    backoff: number;
  };
}

/**
 * API error codes
 */
export enum ApiErrorCode {
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  CONNECTION_ERROR = 'CONNECTION_ERROR',

  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',

  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  REQUIRED_FIELD = 'REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',

  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',

  // Server errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',

  // Rate limiting
  RATE_LIMITED = 'RATE_LIMITED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
}

/**
 * HTTP status codes
 */
export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
}