
/**
 * Secure Environment Configuration Manager
 * Handles environment variables with validation, type safety, and security checks
 */

import { z } from 'zod';

// Environment variable schema with strict validation
const envSchema = z.object({
  // Clerk Authentication
  VITE_CLERK_PUBLISHABLE_KEY: z
    .string()
    .min(1, 'Clerk publishable key is required')
    .regex(/^pk_(test|live)_/, 'Invalid Clerk publishable key format'),

  // Supabase Configuration
  VITE_SUPABASE_URL: z
    .string()
    .url('Invalid Supabase URL')
    .regex(/^https:\/\//, 'Supabase URL must use HTTPS'),

  VITE_SUPABASE_ANON_KEY: z
    .string()
    .min(1, 'Supabase anon key is required')
    .regex(/^eyJ/, 'Invalid Supabase key format'),

  // Optional: Sentry Configuration
  VITE_SENTRY_DSN: z
    .string()
    .url()
    .optional()
    .refine(
      val => !val || val.startsWith('https://'),
      'Sentry DSN must use HTTPS'
    ),

  // App Configuration
  VITE_APP_VERSION: z.string().default('1.0.0'),
  VITE_APP_ENV: z
    .enum(['development', 'staging', 'production'])
    .default('development'),

  // Feature Flags
  VITE_ENABLE_2FA: z
    .string()
    .transform(val => val === 'true')
    .default('false'),

  VITE_ENABLE_RATE_LIMITING: z
    .string()
    .transform(val => val === 'true')
    .default('true'),

  VITE_ENABLE_ENCRYPTION: z
    .string()
    .transform(val => val === 'true')
    .default('true'),
});

// Type inference from schema
export type EnvConfig = z.infer<typeof envSchema>;

class EnvironmentConfigManager {
  private static instance: EnvironmentConfigManager;
  private config: EnvConfig | null = null;
  private ___validationErrors: null | z.ZodError = null;

  private constructor() {
    this.validateAndLoadConfig();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): EnvironmentConfigManager {
    if (!EnvironmentConfigManager.instance) {
      EnvironmentConfigManager.instance = new EnvironmentConfigManager();
    }
    return EnvironmentConfigManager.instance;
  }

  /**
   * Validate and load environment configuration
   */
  private validateAndLoadConfig(): void {
    try {
      // Parse and validate environment variables
      const env = {
        VITE_CLERK_PUBLISHABLE_KEY: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
        VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
        VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
        VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
        VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION,
        VITE_APP_ENV: import.meta.env.VITE_APP_ENV || 'development',
        VITE_ENABLE_2FA: import.meta.env.VITE_ENABLE_2FA,
        VITE_ENABLE_RATE_LIMITING: import.meta.env.VITE_ENABLE_RATE_LIMITING,
        VITE_ENABLE_ENCRYPTION: import.meta.env.VITE_ENABLE_ENCRYPTION,
      };

      this.config = envSchema.parse(env);

      // Security checks
      this.performSecurityChecks();
    } catch (error) {
      if (error instanceof z.ZodError) {
        this.___validationErrors = error;
        console.error(
          '❌ Environment configuration validation failed:',
          error.errors
        );

        // In production, fail fast
        if (import.meta.env.PROD) {
          throw new Error('Critical: Invalid environment configuration');
        }
      }
      throw error;
    }
  }

  /**
   * Perform security checks on configuration
   */
  private performSecurityChecks(): void {
    if (!this.config) return;

    // Check for production keys in development
    if (this.config.VITE_APP_ENV === 'development') {
      if (this.config.VITE_CLERK_PUBLISHABLE_KEY.includes('pk_live')) {
        console.warn(
          '⚠️  Warning: Using production Clerk key in development environment'
        );
      }
    }

    // Check for test keys in production
    if (this.config.VITE_APP_ENV === 'production') {
      if (this.config.VITE_CLERK_PUBLISHABLE_KEY.includes('pk_test')) {
        throw new Error(
          '❌ Critical: Test keys detected in production environment'
        );
      }

      // Ensure security features are enabled in production
      if (!this.config.VITE_ENABLE_RATE_LIMITING) {
        console.error(
          '❌ Critical: Rate limiting must be enabled in production'
        );
      }

      if (!this.config.VITE_ENABLE_ENCRYPTION) {
        console.error('❌ Critical: Encryption must be enabled in production');
      }
    }

    // Check for HTTPS in production URLs
    if (this.config.VITE_APP_ENV === 'production') {
      if (!this.config.VITE_SUPABASE_URL.startsWith('https://')) {
        throw new Error(
          '❌ Critical: Supabase URL must use HTTPS in production'
        );
      }
    }
  }

  /**
   * Get validated configuration
   */
  public getConfig(): EnvConfig {
    if (!this.config) {
      throw new Error('Environment configuration not loaded');
    }
    return this.config;
  }

  /**
   * Get specific configuration value
   */
  public get<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
    const config = this.getConfig();
    return config[key];
  }

  /**
   * Check if environment is production
   */
  public isProduction(): boolean {
    return this.get('VITE_APP_ENV') === 'production';
  }

  /**
   * Check if environment is development
   */
  public isDevelopment(): boolean {
    return this.get('VITE_APP_ENV') === 'development';
  }

  /**
   * Check if environment is staging
   */
  public isStaging(): boolean {
    return this.get('VITE_APP_ENV') === 'staging';
  }

  /**
   * Get secure Clerk configuration
   */
  public getClerkConfig() {
    return {
      publishableKey: this.get('VITE_CLERK_PUBLISHABLE_KEY'),
      enable2FA: this.get('VITE_ENABLE_2FA'),
    };
  }

  /**
   * Get secure Supabase configuration
   */
  public getSupabaseConfig() {
    return {
      url: this.get('VITE_SUPABASE_URL'),
      anonKey: this.get('VITE_SUPABASE_ANON_KEY'),
    };
  }

  /**
   * Get security feature flags
   */
  public getSecurityFeatures() {
    return {
      enable2FA: this.get('VITE_ENABLE_2FA'),
      enableRateLimiting: this.get('VITE_ENABLE_RATE_LIMITING'),
      enableEncryption: this.get('VITE_ENABLE_ENCRYPTION'),
    };
  }

  /**
   * Validate configuration for production readiness
   */
  public validateForProduction(): { errors: string[]; valid: boolean } {
    const errors: string[] = [];

    if (!this.config) {
      return { valid: false, errors: ['Configuration not loaded'] };
    }

    // Check for production environment
    if (this.config.VITE_APP_ENV !== 'production') {
      errors.push('Not in production environment');
    }

    // Check for production keys
    if (!this.config.VITE_CLERK_PUBLISHABLE_KEY.includes('pk_live')) {
      errors.push('Not using production Clerk key');
    }

    // Check security features
    if (!this.config.VITE_ENABLE_2FA) {
      errors.push('2FA is not enabled');
    }

    if (!this.config.VITE_ENABLE_RATE_LIMITING) {
      errors.push('Rate limiting is not enabled');
    }

    if (!this.config.VITE_ENABLE_ENCRYPTION) {
      errors.push('Encryption is not enabled');
    }

    // Check for Sentry configuration
    if (!this.config.VITE_SENTRY_DSN) {
      errors.push('Sentry error tracking not configured');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get sanitized configuration for logging (removes sensitive data)
   */
  public getSanitizedConfig(): Record<string, any> {
    if (!this.config) return {};

    return {
      VITE_APP_ENV: this.config.VITE_APP_ENV,
      VITE_APP_VERSION: this.config.VITE_APP_VERSION,
      VITE_ENABLE_2FA: this.config.VITE_ENABLE_2FA,
      VITE_ENABLE_RATE_LIMITING: this.config.VITE_ENABLE_RATE_LIMITING,
      VITE_ENABLE_ENCRYPTION: this.config.VITE_ENABLE_ENCRYPTION,
      VITE_CLERK_CONFIGURED: !!this.config.VITE_CLERK_PUBLISHABLE_KEY,
      VITE_SUPABASE_CONFIGURED: !!this.config.VITE_SUPABASE_URL,
      VITE_SENTRY_CONFIGURED: !!this.config.VITE_SENTRY_DSN,
    };
  }
}

// Export singleton instance
export const envConfig = EnvironmentConfigManager.getInstance();

// Export helper functions
export const getEnvConfig = () => envConfig.getConfig();
export const isProduction = () => envConfig.isProduction();
export const isDevelopment = () => envConfig.isDevelopment();
export const isStaging = () => envConfig.isStaging();

// Export validation function for CI/CD
export const validateProductionConfig = () => {
  const result = envConfig.validateForProduction();
  if (!result.valid) {
    console.error('❌ Production configuration validation failed:');
    result.errors.forEach(error => console.error(`  - ${error}`));
    return false;
  }
  console.log('✅ Production configuration validated successfully');
  return true;
};
