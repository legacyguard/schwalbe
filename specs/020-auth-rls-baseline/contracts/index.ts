// Auth + RLS Baseline: Contracts Index
// Central export file for all contract interfaces

// Authentication contracts
export type {
  AuthUser,
  AuthSession,
  AuthContext,
  SignInRequest,
  SignUpRequest,
  PasswordResetRequest,
  PasswordUpdateRequest,
  AuthResponse,
  AuthError,
  AuthEvent,
  AuthMiddlewareConfig,
  AuthService,
  AuthHook,
} from './auth';

export {
  AuthErrorCode,
  AuthProvider,
  AuthEventType,
} from './auth';

export {
  SecurityLevel,
} from './security';

// Database contracts
export type {
  BaseEntity,
  Profile,
  UserSession,
  AuditLog,
  DatabaseResult,
  DatabaseError,
  QueryOptions,
  PaginationMeta,
  PaginatedResult,
  DatabaseTransaction,
  DatabaseClient,
  RLSPolicy,
  DatabaseMigration,
  DatabaseConfig,
  DatabaseHealth,
  DatabaseService,
} from './database';

// API contracts
export type {
  ApiResponse,
  ApiError,
  ApiMetadata,
  PaginationMetadata,
  ApiRequestOptions,
  AuthApiResponse,
  ProfileApiResponse,
  ProfilesApiResponse,
  SessionApiResponse,
  SessionsApiResponse,
  AuditLogApiResponse,
  AuditLogsApiResponse,
  ApiClient,
  AuthApi,
  ProfileApi,
  SessionApi,
  AuditApi,
  ApiService,
  ApiConfig,
} from './api';

export {
  ApiErrorCode,
  HttpStatusCode,
} from './api';

// Security contracts
export type {
  SecurityContext,
  SecurityPolicy,
  SecurityCondition,
  AccessControlResult,
  SecurityEvent,
  SecurityService,
  EncryptionService,
  RateLimitConfig,
  RateLimitResult,
  RateLimitService,
  SecurityHeadersConfig,
  SecurityMiddlewareConfig,
  SecurityAuditResult,
  SecurityMonitoringService,
} from './security';

export {
  AccessDecision,
  SecurityEventType,
  SecurityEventSeverity,
} from './security';