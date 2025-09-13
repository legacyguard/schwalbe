// Auth + RLS Baseline: Authentication Contracts
// Defines the interfaces and contracts for authentication operations

/**
 * Core authentication user interface
 * Represents a user in the authentication system
 */
export interface AuthUser {
  /** Unique user identifier from Clerk */
  id: string;
  /** User's email address */
  email: string;
  /** User's first name */
  firstName?: string;
  /** User's last name */
  lastName?: string;
  /** User's profile image URL */
  imageUrl?: string;
  /** User metadata */
  metadata: Record<string, any>;
  /** Account creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Authentication session interface
 * Represents an active user session
 */
export interface AuthSession {
  /** Session identifier */
  id: string;
  /** Associated user ID */
  userId: string;
  /** Session expiration timestamp */
  expiresAt: Date;
  /** Session creation timestamp */
  createdAt: Date;
  /** Last activity timestamp */
  lastActivity: Date;
  /** IP address of the session */
  ipAddress?: string;
  /** User agent string */
  userAgent?: string;
}

/**
 * Authentication context interface
 * Provides authentication state and methods
 */
export interface AuthContext {
  /** Current authenticated user */
  user: AuthUser | null;
  /** Whether authentication state is loaded */
  isLoaded: boolean;
  /** Whether user is signed in */
  isSignedIn: boolean;
  /** Sign out function */
  signOut: () => Promise<void>;
  /** Get current session */
  getSession: () => Promise<AuthSession | null>;
}

/**
 * Sign in request interface
 */
export interface SignInRequest {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
  /** Remember user preference */
  remember?: boolean;
}

/**
 * Sign up request interface
 */
export interface SignUpRequest {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
  /** User's first name */
  firstName?: string;
  /** User's last name */
  lastName?: string;
  /** Accept terms agreement */
  acceptTerms: boolean;
}

/**
 * Password reset request interface
 */
export interface PasswordResetRequest {
  /** User's email address */
  email: string;
}

/**
 * Password update request interface
 */
export interface PasswordUpdateRequest {
  /** Current password */
  currentPassword: string;
  /** New password */
  newPassword: string;
  /** Confirm new password */
  confirmPassword: string;
}

/**
 * Authentication response interface
 */
export interface AuthResponse {
  /** Operation success status */
  success: boolean;
  /** Authenticated user data */
  user?: AuthUser;
  /** User session data */
  session?: AuthSession;
  /** Error information */
  error?: AuthError;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Authentication error interface
 */
export interface AuthError {
  /** Error code */
  code: AuthErrorCode;
  /** Human-readable error message */
  message: string;
  /** Additional error details */
  details?: any;
}

/**
 * Authentication error codes
 */
export enum AuthErrorCode {
  // General errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',

  // Authentication errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_NOT_FOUND = 'ACCOUNT_NOT_FOUND',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  TOO_MANY_ATTEMPTS = 'TOO_MANY_ATTEMPTS',

  // Session errors
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  SESSION_INVALID = 'SESSION_INVALID',
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',

  // Authorization errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // Password errors
  PASSWORD_TOO_WEAK = 'PASSWORD_TOO_WEAK',
  PASSWORD_MISMATCH = 'PASSWORD_MISMATCH',
  PASSWORD_RESET_EXPIRED = 'PASSWORD_RESET_EXPIRED',
}

/**
 * Authentication provider types
 */
export enum AuthProvider {
  EMAIL = 'email',
  GOOGLE = 'google',
  GITHUB = 'github',
  MICROSOFT = 'microsoft',
}

/**
 * Authentication event types for audit logging
 */
export enum AuthEventType {
  SIGN_IN = 'sign_in',
  SIGN_OUT = 'sign_out',
  SIGN_UP = 'sign_up',
  PASSWORD_RESET_REQUEST = 'password_reset_request',
  PASSWORD_RESET_COMPLETE = 'password_reset_complete',
  PASSWORD_CHANGE = 'password_change',
  EMAIL_VERIFICATION = 'email_verification',
  SESSION_CREATE = 'session_create',
  SESSION_DESTROY = 'session_destroy',
  ACCOUNT_UPDATE = 'account_update',
  ACCOUNT_DELETE = 'account_delete',
}

/**
 * Authentication event interface for audit logging
 */
export interface AuthEvent {
  /** Event type */
  type: AuthEventType;
  /** User ID associated with the event */
  userId?: string;
  /** Session ID if applicable */
  sessionId?: string;
  /** Event timestamp */
  timestamp: Date;
  /** IP address of the request */
  ipAddress?: string;
  /** User agent string */
  userAgent?: string;
  /** Additional event metadata */
  metadata?: Record<string, any>;
  /** Event success status */
  success: boolean;
  /** Error information if applicable */
  error?: AuthError;
}

/**
 * Authentication middleware configuration
 */
export interface AuthMiddlewareConfig {
  /** Routes that require authentication */
  protectedRoutes: string[];
  /** Routes that are public */
  publicRoutes: string[];
  /** Routes that require specific roles */
  roleRoutes: Record<string, string[]>;
  /** Redirect URL for unauthorized access */
  signInUrl: string;
  /** Redirect URL after sign in */
  afterSignInUrl: string;
  /** Redirect URL after sign out */
  afterSignOutUrl: string;
}

/**
 * Authentication service interface
 * Defines the contract for authentication operations
 */
export interface AuthService {
  /** Sign in with email and password */
  signIn(request: SignInRequest): Promise<AuthResponse>;

  /** Sign up with email and password */
  signUp(request: SignUpRequest): Promise<AuthResponse>;

  /** Sign out current user */
  signOut(): Promise<AuthResponse>;

  /** Get current user */
  getCurrentUser(): Promise<AuthUser | null>;

  /** Get current session */
  getCurrentSession(): Promise<AuthSession | null>;

  /** Refresh current session */
  refreshSession(): Promise<AuthResponse>;

  /** Request password reset */
  requestPasswordReset(request: PasswordResetRequest): Promise<AuthResponse>;

  /** Update password */
  updatePassword(request: PasswordUpdateRequest): Promise<AuthResponse>;

  /** Verify email address */
  verifyEmail(token: string): Promise<AuthResponse>;

  /** Check if user is authenticated */
  isAuthenticated(): boolean;

  /** Get user sessions */
  getSessions(): Promise<AuthSession[]>;

  /** Terminate specific session */
  terminateSession(sessionId: string): Promise<AuthResponse>;

  /** Terminate all sessions except current */
  terminateOtherSessions(): Promise<AuthResponse>;
}

/**
 * Authentication hook interface for React components
 */
export interface AuthHook {
  /** Current user */
  user: AuthUser | null;
  /** Loading state */
  isLoading: boolean;
  /** Authentication status */
  isAuthenticated: boolean;
  /** Sign in function */
  signIn: (request: SignInRequest) => Promise<void>;
  /** Sign up function */
  signUp: (request: SignUpRequest) => Promise<void>;
  /** Sign out function */
  signOut: () => Promise<void>;
  /** Error state */
  error: AuthError | null;
  /** Clear error */
  clearError: () => void;
}