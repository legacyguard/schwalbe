# Next.js Migration - Security Considerations

Note: This spec standardizes on Supabase Auth for identity and Postgres RLS for authorization. Replace legacy examples using Clerk with the patterns below and see:
- docs/security/auth-migration-playbook.md
- docs/security/rls-cookbook.md
- docs/observability/baseline.md

## Authentication & Authorization

### Clerk Integration Security

**Secure Configuration**:

```typescript
// middleware.ts - Secure route protection
import { authMiddleware } from '@clerk/nextjs'

export default authMiddleware({
  publicRoutes: ['/', '/about', '/contact', '/api/webhooks/stripe'],
  ignoredRoutes: ['/api/webhooks/clerk'],
  beforeAuth: (req) => {
    // Log authentication attempts
    console.log(`Auth attempt: ${req.url}`)
  },
  afterAuth: (auth, req) => {
    // Custom authorization logic
    if (!auth.userId && req.nextUrl.pathname.startsWith('/dashboard')) {
      return Response.redirect(new URL('/sign-in', req.url))
    }
  }
})
```

**Session Management**:

```typescript
// Secure session handling
export async function getServerSideProps(context) {
  const { userId } = getAuth(context.req)

  if (!userId) {
    return {
      redirect: {
        destination: '/sign-in',
        permanent: false,
      },
    }
  }

  return {
    props: { userId },
  }
}
```

### JWT Token Security

**Token Validation**:

```typescript
// Secure token validation
import { verifyToken } from '@clerk/backend'

export async function validateToken(token: string) {
  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!
    })

    // Additional validation
    if (payload.exp < Date.now() / 1000) {
      throw new Error('Token expired')
    }

    return payload
  } catch (error) {
    console.error('Token validation failed:', error)
    throw new Error('Invalid token')
  }
}
```

## Data Protection

### Row Level Security (RLS)

**Supabase RLS Policies**:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- User data access policy
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = clerk_id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = clerk_id);

-- Audit log policy (read-only for users)
CREATE POLICY "Users can view own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid()::text = (SELECT clerk_id FROM users WHERE id = user_id));
```

### Data Encryption

**Client-Side Encryption**:

```typescript
// Client-side data encryption
import { encryptData, decryptData } from '@/lib/encryption'

export async function saveSensitiveData(data: any, userId: string) {
  const encrypted = await encryptData(data, userId)
  return await supabase
    .from('sensitive_data')
    .insert({ user_id: userId, encrypted_data: encrypted })
}

export async function getSensitiveData(userId: string) {
  const { data } = await supabase
    .from('sensitive_data')
    .select('encrypted_data')
    .eq('user_id', userId)
    .single()

  return await decryptData(data.encrypted_data, userId)
}
```

**Database Encryption**:

```sql
-- Encrypted columns
CREATE TABLE sensitive_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  encrypted_data TEXT NOT NULL, -- Encrypted with user's public key
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Encryption functions
CREATE OR REPLACE FUNCTION encrypt_data(input_text TEXT, key TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Use pgcrypto for encryption
  RETURN encode(encrypt(input_text::bytea, key::bytea, 'aes'), 'hex');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrypt_data(encrypted_text TEXT, key TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN decode(decrypt(decode(encrypted_text, 'hex'), key::bytea, 'aes'), 'utf8');
END;
$$ LANGUAGE plpgsql;
```

## API Security

### Input Validation

**Request Validation**:

```typescript
// API route validation
import { z } from 'zod'

const createUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = createUserSchema.parse(body)

    // Proceed with validated data
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    throw error
  }
}
```

### Rate Limiting

**API Rate Limiting**:

```typescript
// Rate limiting middleware
import { Ratelimit } from '@upstash/ratelimit'
import { kv } from '@vercel/kv'

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
})

export async function rateLimitMiddleware(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1'
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return new Response('Too many requests', {
      status: 429,
      headers: {
        'Retry-After': '10',
      },
    })
  }

  return null // Continue processing
}
```

### CORS Configuration

**Secure CORS Setup**:

```typescript
// CORS middleware
import { NextResponse } from 'next/server'

export function corsMiddleware(request: Request) {
  const response = NextResponse.next()

  // Allow specific origins
  const allowedOrigins = [
    'https://yourdomain.com',
    'https://staging.yourdomain.com'
  ]

  const origin = request.headers.get('origin')
  if (allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }

  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Max-Age', '86400')

  return response
}
```

## Content Security Policy (CSP)

### CSP Implementation

**Next.js CSP Configuration**:

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://cdn.clerk.dev",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://api.stripe.com https://api.clerk.dev https://*.supabase.co",
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'"
            ].join('; ')
          }
        ]
      }
    ]
  }
}
```

**Runtime CSP**:

```typescript
// Runtime CSP for dynamic content
export function generateCSP(nonce: string) {
  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' https://cdn.clerk.dev`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: https:`,
    `connect-src 'self' https://*.supabase.co`,
    `frame-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`
  ].join('; ')
}
```

## Secure Headers

### Security Headers Configuration

**Next.js Security Headers**:

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          }
        ]
      }
    ]
  }
}
```

## File Upload Security

### Secure File Upload

**File Validation**:

```typescript
// Secure file upload validation
export async function validateFileUpload(file: File) {
  // Check file size
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    throw new Error('File too large')
  }

  // Check file type
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain'
  ]

  if (!allowedTypes.includes(file.type)) {
    throw new Error('File type not allowed')
  }

  // Check file extension matches MIME type
  const extension = file.name.split('.').pop()?.toLowerCase()
  const mimeToExt: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/gif': ['gif'],
    'application/pdf': ['pdf'],
    'text/plain': ['txt']
  }

  if (!mimeToExt[file.type]?.includes(extension)) {
    throw new Error('File extension does not match MIME type')
  }

  return true
}
```

**Secure File Storage**:

```typescript
// Secure file storage with Supabase
export async function uploadSecureFile(file: File, userId: string) {
  // Generate secure filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}.${fileExt}`

  // Upload with security metadata
  const { data, error } = await supabase.storage
    .from('secure-files')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
      metadata: {
        uploadedBy: userId,
        originalName: file.name,
        checksum: await calculateChecksum(file)
      }
    })

  if (error) throw error

  return data
}
```

## Audit Logging

### Comprehensive Audit System

**Audit Event Logging**:

```typescript
// Audit logging utility
export class AuditLogger {
  static async logEvent(event: AuditEvent) {
    const auditData = {
      userId: event.userId,
      action: event.action,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
      oldValues: event.oldValues,
      newValues: event.newValues,
      metadata: {
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        sessionId: event.sessionId,
        timestamp: new Date().toISOString()
      }
    }

    await supabase
      .from('audit_logs')
      .insert(auditData)
  }

  static async logAuthEvent(event: AuthEvent) {
    await this.logEvent({
      ...event,
      action: 'auth',
      resourceType: 'authentication'
    })
  }

  static async logDataAccess(event: DataAccessEvent) {
    await this.logEvent({
      ...event,
      action: 'data_access',
      resourceType: event.tableName
    })
  }
}
```

## Environment Security

### Secure Environment Variables

**Environment Validation**:

```typescript
// Environment validation
export function validateEnvironment() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'STRIPE_SECRET_KEY',
    'RESEND_API_KEY'
  ]

  const missing = required.filter(key => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  // Validate URLs
  const urlPattern = /^https:\/\/[^\s/$.?#].[^\s]*$/
  if (!urlPattern.test(process.env.NEXT_PUBLIC_SUPABASE_URL!)) {
    throw new Error('Invalid SUPABASE_URL format')
  }
}
```

### Secret Management

**Secure Secret Storage**:

```typescript
// Secure secret access
export class SecretManager {
  static getSupabaseUrl(): string {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!url) throw new Error('SUPABASE_URL not configured')
    return url
  }

  static getSupabaseAnonKey(): string {
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!key) throw new Error('SUPABASE_ANON_KEY not configured')
    return key
  }

  static getServiceRoleKey(): string {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured')
    return key
  }
}
```

## Monitoring and Alerting

### Security Monitoring

**Security Event Monitoring**:

```typescript
// Security monitoring
export class SecurityMonitor {
  static async monitorFailedLogin(email: string, ip: string) {
    // Log failed login attempt
    await AuditLogger.logEvent({
      action: 'failed_login',
      resourceType: 'authentication',
      metadata: { email, ip }
    })

    // Check for brute force attempts
    const recentAttempts = await this.getRecentFailedAttempts(ip)
    if (recentAttempts >= 5) {
      await this.alertSecurityTeam('Brute force attempt detected', { ip, email })
    }
  }

  static async monitorSuspiciousActivity(userId: string, activity: string) {
    // Monitor for suspicious patterns
    const riskScore = await this.calculateRiskScore(userId, activity)

    if (riskScore > 0.8) {
      await this.alertSecurityTeam('Suspicious activity detected', {
        userId,
        activity,
        riskScore
      })
    }
  }
}
```

This comprehensive security implementation ensures the Next.js migration maintains high security standards with multiple layers of protection, comprehensive monitoring, and secure data handling practices.
