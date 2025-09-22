import { z } from 'zod'

// Environment variables schema with validation
const envSchema = z.object({
  // Supabase
  VITE_SUPABASE_URL: z.string().url('VITE_SUPABASE_URL must be a valid URL'),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, 'VITE_SUPABASE_ANON_KEY is required'),

  // Stripe
  VITE_STRIPE_PUBLISHABLE_KEY: z.string().min(1, 'VITE_STRIPE_PUBLISHABLE_KEY is required'),

  // API
  VITE_API_URL: z.string().url('VITE_API_URL must be a valid URL'),

  // Sofia AI
  VITE_SOFIA_AI_BASE_URL: z.string().url('VITE_SOFIA_AI_BASE_URL must be a valid URL'),

  // Feature flags (default to false for safety)
  VITE_ENABLE_HOLLYWOOD_LANDING: z.string().transform(val => val === '1' || val === 'true').optional().default('false'),
  VITE_ENABLE_DASHBOARD_V2: z.string().transform(val => val === '1' || val === 'true').optional().default('false'),
  VITE_ENABLE_ASSISTANT: z.string().transform(val => val === '1' || val === 'true').optional().default('false'),

  // Optional services
  VITE_SENTRY_DSN: z.string().url().optional(),
  VITE_GA_TRACKING_ID: z.string().optional(),
})

// Parse and validate environment variables
let validatedEnv: z.infer<typeof envSchema>

try {
  validatedEnv = envSchema.parse(import.meta.env)
} catch (error) {
  if (import.meta.env.DEV) {
    console.warn('Environment validation failed, using defaults for development:', error)
    // Provide development defaults
    validatedEnv = {
      VITE_SUPABASE_URL: 'http://localhost:54321',
      VITE_SUPABASE_ANON_KEY: 'anon-public-placeholder',
      VITE_STRIPE_PUBLISHABLE_KEY: 'pk_test_placeholder',
      VITE_API_URL: 'http://localhost:3000',
      VITE_SOFIA_AI_BASE_URL: 'http://localhost:3000',
      VITE_ENABLE_HOLLYWOOD_LANDING: false,
      VITE_ENABLE_DASHBOARD_V2: false,
      VITE_ENABLE_ASSISTANT: false,
    }
  } else {
    // In production, fail fast
    console.error('Environment validation failed:', error)
    throw new Error('Invalid environment configuration. Check your environment variables.')
  }
}

export const env = validatedEnv

// Helper functions for common checks
export const isDevelopment = import.meta.env.DEV
export const isProduction = import.meta.env.PROD

// Feature flags with safe defaults
export const featureFlags = {
  hollywoodLanding: env.VITE_ENABLE_HOLLYWOOD_LANDING,
  dashboardV2: env.VITE_ENABLE_DASHBOARD_V2,
  assistant: env.VITE_ENABLE_ASSISTANT,
}

// Legacy feature flags object for backward compatibility
export const features = {
  assistant: env.VITE_ENABLE_ASSISTANT,
  onboarding: true, // Always enabled for now
  landing: env.VITE_ENABLE_HOLLYWOOD_LANDING,
  sofiaFirefly: true, // Core feature
  emotionalMessages: true, // Core feature
  achievements: true, // Core feature
}
