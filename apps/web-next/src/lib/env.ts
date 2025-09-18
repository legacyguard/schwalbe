// Centralized, minimal env validation for Next.js (apps/web-next)
// Throws on missing required variables in CI/build to fail fast.

const E2E = process.env.NEXT_PUBLIC_E2E === '1';

const get = (name: string, options?: { required?: boolean; default?: string }) => {
  const value = process.env[name];
  if (!value || value.length === 0) {
    // During E2E runs we want to avoid hard-crashes from missing envs
    if (options?.required && !E2E) {
      throw new Error(`Missing required environment variable: ${name}`);
    }
    return options?.default ?? '';
  }
  return value;
};

export const ENV = {
  // In E2E, fall back to safe local defaults if not provided by the runner
  SUPABASE_URL: get('NEXT_PUBLIC_SUPABASE_URL', {
    required: !E2E,
    default: E2E ? 'http://localhost:54321' : ''
  }),
  SUPABASE_ANON_KEY: get('NEXT_PUBLIC_SUPABASE_ANON_KEY', {
    required: !E2E,
    default: E2E ? 'anon-public-placeholder' : ''
  }),
  APP_URL: get('NEXT_PUBLIC_APP_URL', { default: 'http://localhost:3001' }),
};

export type Env = typeof ENV;
