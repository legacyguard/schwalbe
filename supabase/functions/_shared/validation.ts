import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

// Base validation utilities
export class ValidationError extends Error {
  constructor(
    public field: string,
    message: string,
    public code: string = 'VALIDATION_ERROR'
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

export interface ValidationResult {
  success: boolean
  data?: any
  errors?: ValidationError[]
}

// Common validation schemas
export const schemas = {
  // Basic types
  email: z.string().email('Invalid email format').max(320, 'Email too long'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password too long'),
  uuid: z.string().uuid('Invalid UUID format'),

  // Text inputs with sanitization
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z\s\-'\.]+$/, 'Name contains invalid characters'),

  // Safe text input (for descriptions, notes, etc.)
  safeText: z.string()
    .max(5000, 'Text too long')
    .refine(
      (val) => !/<script|javascript:|data:|vbscript:/i.test(val),
      'Text contains potentially dangerous content'
    ),

  // Numeric inputs
  positiveInt: z.number().int().positive('Must be a positive integer'),
  age: z.number().int().min(15, 'Must be at least 15 years old').max(150, 'Invalid age'),

  // Date validation
  futureDate: z.string().refine(
    (date) => new Date(date) > new Date(),
    'Date must be in the future'
  ),

  // File upload validation
  fileUpload: z.object({
    name: z.string().max(255, 'Filename too long'),
    size: z.number().max(10 * 1024 * 1024, 'File too large (max 10MB)'),
    type: z.string().refine(
      (type) => ['application/pdf', 'image/jpeg', 'image/png', 'text/plain'].includes(type),
      'Invalid file type'
    )
  })
}

// Validation middleware function
export function validateInput<T>(schema: z.ZodSchema<T>) {
  return async (input: unknown): Promise<ValidationResult> => {
    try {
      const data = await schema.parseAsync(input)
      return { success: true, data }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err =>
          new ValidationError(
            err.path.join('.'),
            err.message,
            err.code
          )
        )
        return { success: false, errors }
      }

      return {
        success: false,
        errors: [new ValidationError('unknown', 'Validation failed', 'UNKNOWN_ERROR')]
      }
    }
  }
}

// Sanitization utilities
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

export function sanitizeFilename(input: string): string {
  return input
    .replace(/[^a-zA-Z0-9\-_.]/g, '_')
    .substring(0, 255)
}

// Rate limiting validation
export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyGenerator?: (req: Request) => string
}

export class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>()

  constructor(private config: RateLimitConfig) {}

  check(req: Request): { allowed: boolean; resetTime?: number } {
    const key = this.config.keyGenerator?.(req) ?? this.getClientIP(req)
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    // Clean up expired entries
    for (const [k, v] of this.requests.entries()) {
      if (v.resetTime < now) {
        this.requests.delete(k)
      }
    }

    const current = this.requests.get(key)

    if (!current || current.resetTime < now) {
      this.requests.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs
      })
      return { allowed: true }
    }

    if (current.count >= this.config.maxRequests) {
      return { allowed: false, resetTime: current.resetTime }
    }

    current.count++
    return { allowed: true }
  }

  private getClientIP(req: Request): string {
    return req.headers.get('x-forwarded-for') ||
           req.headers.get('x-real-ip') ||
           'unknown'
  }
}

// Specific validation schemas for different endpoints
export const endpointSchemas = {
  createWillDraft: z.object({
    will_type: z.enum(['simple', 'holographic', 'complex']),
    testator: z.object({
      fullName: schemas.name,
      age: schemas.age,
      address: schemas.safeText.max(500),
      email: schemas.email.optional(),
    }),
    beneficiaries: z.array(z.object({
      name: schemas.name,
      relationship: schemas.safeText.max(50),
      share: z.number().min(0).max(100),
    })).max(20, 'Too many beneficiaries'),
    executors: z.array(z.object({
      name: schemas.name,
      email: schemas.email,
      phone: z.string().regex(/^\+?[\d\s\-()]+$/, 'Invalid phone number'),
    })).max(5, 'Too many executors'),
  }),

  uploadDocument: z.object({
    file: schemas.fileUpload,
    category: z.enum(['legal', 'financial', 'personal', 'medical']),
    description: schemas.safeText.optional(),
    tags: z.array(z.string().max(50)).max(10, 'Too many tags').optional(),
  }),

  updateProfile: z.object({
    full_name: schemas.name.optional(),
    email: schemas.email.optional(),
    phone: z.string().regex(/^\+?[\d\s\-()]+$/, 'Invalid phone number').optional(),
    address: schemas.safeText.max(500).optional(),
    notifications: z.object({
      email: z.boolean(),
      sms: z.boolean(),
      push: z.boolean(),
    }).optional(),
  }),

  aiQuery: z.object({
    message: schemas.safeText.max(1000),
    context: z.enum(['will_creation', 'document_review', 'legal_question', 'general']),
    session_id: schemas.uuid.optional(),
  }),
}

// Response helpers
export function validationErrorResponse(errors: ValidationError[], status = 400) {
  return new Response(
    JSON.stringify({
      error: 'Validation failed',
      details: errors.map(err => ({
        field: err.field,
        message: err.message,
        code: err.code
      }))
    }),
    {
      status,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}

export function rateLimitErrorResponse(resetTime: number) {
  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      reset_time: resetTime
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString()
      }
    }
  )
}