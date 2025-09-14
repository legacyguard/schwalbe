# Auth + RLS Baseline: Data Model

## Database Schema

### Core Entities

#### UserAuth

User authentication and profile information.

```sql
CREATE TABLE public.user_auth (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_user_auth_clerk_id ON public.user_auth(clerk_id);
CREATE INDEX idx_user_auth_email ON public.user_auth(email);
CREATE INDEX idx_user_auth_role ON public.user_auth(role);

-- RLS Policies
ALTER TABLE public.user_auth ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_read_own_auth"
ON public.user_auth FOR SELECT
USING (app.current_external_id() = clerk_id);

CREATE POLICY "system_can_manage_auth"
ON public.user_auth FOR ALL
USING (auth.role() = 'service_role');
```

#### RLSPolicy

Row Level Security policy definitions.

```sql
CREATE TABLE public.rls_policies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  policy_name TEXT NOT NULL,
  command TEXT NOT NULL, -- SELECT, INSERT, UPDATE, DELETE
  roles TEXT[],
  using_condition TEXT,
  check_condition TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(table_name, policy_name)
);

-- Indexes
CREATE INDEX idx_rls_policies_table_name ON public.rls_policies(table_name);
CREATE INDEX idx_rls_policies_active ON public.rls_policies(is_active);

-- RLS Policies
ALTER TABLE public.rls_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_can_manage_rls_policies"
ON public.rls_policies FOR ALL
USING (
  auth.role() = 'service_role'
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = app.current_external_id()
      AND ur.role_name = 'admin'
  )
);
```

  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  ip_address INET,
  user_agent TEXT,
  device_info JSONB,
  expires_at TIMESTAMPTZ NOT NULL,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_session_data_user_id ON public.session_data(user_id);
CREATE INDEX idx_session_data_token ON public.session_data(session_token);
CREATE INDEX idx_session_data_expires ON public.session_data(expires_at);
CREATE INDEX idx_session_data_active ON public.session_data(is_active);

#### AccessPermission

Permission definitions for access control.

```sql
CREATE TABLE public.access_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  conditions JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_access_permissions_resource ON public.access_permissions(resource);
CREATE INDEX idx_access_permissions_active ON public.access_permissions(is_active);

-- RLS Policies
ALTER TABLE public.access_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_can_manage_permissions"
ON public.access_permissions FOR ALL
USING (
  auth.role() = 'service_role'
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = app.current_external_id()
      AND ur.role_name = 'admin'
  )
);
```

#### UserRole

User role assignments and management.

```sql
CREATE TABLE public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  role_name TEXT NOT NULL,
  assigned_by TEXT,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role_name)
);

-- Indexes
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role_name ON public.user_roles(role_name);
CREATE INDEX idx_user_roles_active ON public.user_roles(is_active);

-- RLS Policies
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_read_own_roles"
ON public.user_roles FOR SELECT
USING (app.current_external_id() = user_id);

CREATE POLICY "admin_can_manage_roles"
ON public.user_roles FOR ALL
USING (
  auth.role() = 'service_role'
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = app.current_external_id()
      AND ur.role_name = 'admin'
  )
);
```

#### SecurityLog

Security and audit logging.

```sql
CREATE TABLE public.security_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL, -- low, medium, high, critical
  resource_type TEXT,
  resource_id TEXT,
  action TEXT,
  ip_address INET,
  user_agent TEXT,
  details JSONB,
  risk_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_security_logs_user_id ON public.security_logs(user_id);
CREATE INDEX idx_security_logs_event_type ON public.security_logs(event_type);
CREATE INDEX idx_security_logs_severity ON public.security_logs(severity);
CREATE INDEX idx_security_logs_created_at ON public.security_logs(created_at);
CREATE INDEX idx_security_logs_risk_score ON public.security_logs(risk_score);

-- RLS Policies
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_read_own_logs"
ON public.security_logs FOR SELECT
USING (app.current_external_id() = user_id);

CREATE POLICY "admin_can_read_all_logs"
ON public.security_logs FOR SELECT
USING (
  auth.role() = 'service_role'
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = app.current_external_id()
      AND ur.role_name = 'admin'
  )
);

CREATE POLICY "system_can_insert_logs"
ON public.security_logs FOR INSERT
WITH CHECK (auth.role() = 'service_role');
```

### Relations Between Entities

```sql
-- UserAuth relationships
ALTER TABLE public.user_roles ADD CONSTRAINT fk_user_roles_user_auth
FOREIGN KEY (user_id) REFERENCES public.user_auth(clerk_id) ON DELETE CASCADE;

ALTER TABLE public.session_data ADD CONSTRAINT fk_session_data_user_auth
FOREIGN KEY (user_id) REFERENCES public.user_auth(clerk_id) ON DELETE CASCADE;

ALTER TABLE public.security_logs ADD CONSTRAINT fk_security_logs_user_auth
FOREIGN KEY (user_id) REFERENCES public.user_auth(clerk_id) ON DELETE CASCADE;

-- UserRole relationships
ALTER TABLE public.user_roles ADD CONSTRAINT fk_user_roles_assigned_by
FOREIGN KEY (assigned_by) REFERENCES public.user_auth(clerk_id) ON DELETE SET NULL;
```

#### user_sessions

Session tracking for security monitoring and audit purposes.

```sql
CREATE TABLE public.user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL UNIQUE,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_activity TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_id ON public.user_sessions(session_id);
CREATE INDEX idx_user_sessions_expires_at ON public.user_sessions(expires_at);

-- RLS Policies
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_read_own_sessions"
ON public.user_sessions FOR SELECT
USING (app.current_external_id() = user_id);

CREATE POLICY "system_can_manage_sessions"
ON public.user_sessions FOR ALL
USING (auth.role() = 'service_role');
```

#### audit_logs

Comprehensive audit logging for security and compliance.

```sql
CREATE TABLE public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL, -- 'login', 'logout', 'profile_update', 'data_access', etc.
  resource_type TEXT, -- 'profile', 'document', 'session', etc.
  resource_id TEXT,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB, -- Additional context
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);

-- RLS Policies
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_read_own_audit_logs"
ON public.audit_logs FOR SELECT
USING (auth.uid()::text = user_id);

CREATE POLICY "system_can_insert_audit_logs"
ON public.audit_logs FOR INSERT
WITH CHECK (auth.role() = 'service_role');
```

### Helper Functions

#### current_external_id()

Extracts Clerk user ID from JWT claims.

```sql
CREATE OR REPLACE FUNCTION app.current_external_id()
RETURNS TEXT AS $$
  SELECT nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
$$ LANGUAGE sql SECURITY DEFINER;
```

#### log_auth_event()

Logs authentication events for audit purposes.

```sql
CREATE OR REPLACE FUNCTION app.log_auth_event(
  p_user_id TEXT,
  p_action TEXT,
  p_metadata JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, metadata)
  VALUES (p_user_id, p_action, p_metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Storage Policies

### User Files Bucket

```sql
-- Create bucket for user files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-files',
  'user-files',
  false,
  10485760, -- 10MB limit
  ARRAY['image/*', 'application/pdf', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Storage Policies
CREATE POLICY "users_can_upload_own_files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "users_can_read_own_files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "users_can_update_own_files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'user-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "users_can_delete_own_files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## TypeScript Types

### Authentication Types

```typescript
// Clerk user object
export interface ClerkUser {
  id: string;
  emailAddresses: Array<{
    id: string;
    emailAddress: string;
  }>;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  publicMetadata: Record<string, any>;
  privateMetadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Session types
export interface AuthSession {
  userId: string;
  sessionId: string;
  expiresAt: Date;
  lastActivity: Date;
}

// Auth context
export interface AuthContextType {
  user: ClerkUser | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  signOut: () => Promise<void>;
}
```

### Database Types

```typescript
// Profile types
export interface Profile {
  id: string;
  user_id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProfileRequest {
  email?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}

export interface UpdateProfileRequest {
  email?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}

// Session types
export interface UserSession {
  id: string;
  user_id: string;
  session_id: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  expires_at: string;
  last_activity: string;
}

// Audit types
export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export type AuditAction =
  | 'login'
  | 'logout'
  | 'profile_create'
  | 'profile_update'
  | 'profile_delete'
  | 'session_create'
  | 'session_destroy'
  | 'data_access'
  | 'file_upload'
  | 'file_download'
  | 'file_delete';
```

### API Contract Types

```typescript
// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth API types
export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  user: ClerkUser;
  session: AuthSession;
}

// Profile API types
export interface ProfileResponse extends ApiResponse<Profile> {}
export interface ProfilesResponse extends PaginatedResponse<Profile> {}

// Session API types
export interface SessionResponse extends ApiResponse<UserSession> {}
export interface SessionsResponse extends PaginatedResponse<UserSession> {}

// Audit API types
export interface AuditLogResponse extends ApiResponse<AuditLog> {}
export interface AuditLogsResponse extends PaginatedResponse<AuditLog> {}
```

## API Contracts

### Authentication Endpoints

#### POST /api/auth/sign-in

Sign in with email and password.

**Request:**

```typescript
{
  email: string;
  password: string;
}
```

**Response:**

```typescript
{
  success: boolean;
  data?: {
    user: ClerkUser;
    session: AuthSession;
  };
  error?: ApiError;
}
```

#### POST /api/auth/sign-up

Create new account.

**Request:**

```typescript
{
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}
```

**Response:**

```typescript
{
  success: boolean;
  data?: {
    user: ClerkUser;
    session: AuthSession;
  };
  error?: ApiError;
}
```

#### POST /api/auth/sign-out

Sign out current user.

**Response:**

```typescript
{
  success: boolean;
  error?: ApiError;
}
```

#### GET /api/auth/session

Get current session information.

**Response:**

```typescript
{
  success: boolean;
  data?: AuthSession;
  error?: ApiError;
}
```

### Profile Endpoints

#### GET /api/profile

Get current user's profile.

**Response:**

```typescript
{
  success: boolean;
  data?: Profile;
  error?: ApiError;
}
```

#### POST /api/profile

Create user profile.

**Request:**

```typescript
{
  email?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}
```

**Response:**

```typescript
{
  success: boolean;
  data?: Profile;
  error?: ApiError;
}
```

#### PUT /api/profile

Update user profile.

**Request:**

```typescript
{
  email?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}
```

**Response:**

```typescript
{
  success: boolean;
  data?: Profile;
  error?: ApiError;
}
```

#### DELETE /api/profile

Delete user profile.

**Response:**

```typescript
{
  success: boolean;
  error?: ApiError;
}
```

### Session Management Endpoints

#### GET /api/sessions

Get user's active sessions.

**Query Parameters:**

- `page?: number` - Page number (default: 1)
- `limit?: number` - Items per page (default: 20)

**Response:**

```typescript
{
  success: boolean;
  data?: UserSession[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: ApiError;
}
```

#### DELETE /api/sessions/:sessionId

Terminate specific session.

**Response:**

```typescript
{
  success: boolean;
  error?: ApiError;
}
```

### Audit Endpoints

#### GET /api/audit

Get user's audit logs.

**Query Parameters:**

- `page?: number` - Page number (default: 1)
- `limit?: number` - Items per page (default: 20)
- `action?: string` - Filter by action type
- `startDate?: string` - Filter from date (ISO 8601)
- `endDate?: string` - Filter to date (ISO 8601)

**Response:**

```typescript
{
  success: boolean;
  data?: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: ApiError;
}
```

## Error Types

```typescript
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export const ERROR_CODES = {
  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',

  // Profile errors
  PROFILE_NOT_FOUND: 'PROFILE_NOT_FOUND',
  PROFILE_ALREADY_EXISTS: 'PROFILE_ALREADY_EXISTS',
  INVALID_PROFILE_DATA: 'INVALID_PROFILE_DATA',

  // Session errors
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  INVALID_SESSION: 'INVALID_SESSION',

  // General errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
} as const;
```

## Validation Schemas

### Profile Validation

```typescript
import { z } from 'zod';

export const createProfileSchema = z.object({
  email: z.string().email().optional(),
  first_name: z.string().min(1).max(50).optional(),
  last_name: z.string().min(1).max(50).optional(),
  avatar_url: z.string().url().optional(),
});

export const updateProfileSchema = createProfileSchema;

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
```

### Authentication Validation

```typescript
export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
```

## Migration Scripts

### Initial Schema Migration

```sql
-- 20250101000000_create_auth_baseline.sql
-- Create initial authentication tables and policies

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_sessions table
CREATE TABLE public.user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL UNIQUE,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_activity TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_id ON public.user_sessions(session_id);
CREATE INDEX idx_user_sessions_expires_at ON public.user_sessions(expires_at);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);

-- Create helper functions
CREATE OR REPLACE FUNCTION app.current_external_id()
RETURNS TEXT AS $$
  SELECT nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION app.log_auth_event(
  p_user_id TEXT,
  p_action TEXT,
  p_metadata JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, metadata)
  VALUES (p_user_id, p_action, p_metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "users_can_read_own_profile"
ON public.profiles FOR SELECT
USING (app.current_external_id() = user_id);

CREATE POLICY "users_can_insert_own_profile"
ON public.profiles FOR INSERT
WITH CHECK (app.current_external_id() = user_id);

CREATE POLICY "users_can_update_own_profile"
ON public.profiles FOR UPDATE
USING (app.current_external_id() = user_id)
WITH CHECK (app.current_external_id() = user_id);

CREATE POLICY "users_can_delete_own_profile"
ON public.profiles FOR DELETE
USING (app.current_external_id() = user_id);

-- Create RLS policies for sessions
CREATE POLICY "users_can_read_own_sessions"
ON public.user_sessions FOR SELECT
USING (app.current_external_id() = user_id);

CREATE POLICY "system_can_manage_sessions"
ON public.user_sessions FOR ALL
USING (auth.role() = 'service_role');

-- Create RLS policies for audit logs
CREATE POLICY "users_can_read_own_audit_logs"
ON public.audit_logs FOR SELECT
USING (app.current_external_id() = user_id);

CREATE POLICY "system_can_insert_audit_logs"
ON public.audit_logs FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-files',
  'user-files',
  false,
  10485760,
  ARRAY['image/*', 'application/pdf', 'text/*']
);

-- Create storage policies
CREATE POLICY "users_can_upload_own_files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-files'
  AND app.current_external_id() = (storage.foldername(name))[1]
);

CREATE POLICY "users_can_read_own_files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user-files'
  AND app.current_external_id() = (storage.foldername(name))[1]
);

CREATE POLICY "users_can_update_own_files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user-files'
  AND app.current_external_id() = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'user-files'
  AND app.current_external_id() = (storage.foldername(name))[1]
);

CREATE POLICY "users_can_delete_own_files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-files'
  AND app.current_external_id() = (storage.foldername(name))[1]
);
```

## Supabase Types Generation

After running migrations, generate TypeScript types:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > packages/shared/src/types/supabase.ts
```

This will generate comprehensive types for all database tables, functions, and storage buckets with proper Clerk integration.
