// Centralized, minimal env validation for Next.js (apps/web-next)
// Throws on missing required variables in CI/build to fail fast.

const get = (name: string, options?: { required?: boolean; default?: string }) => {
  const value = process.env[name];
  if (!value || value.length === 0) {
    if (options?.required) {
      throw new Error(`Missing required environment variable: ${name}`);
    }
    return options?.default ?? '';
  }
  return value;
};

export const ENV = {
  SUPABASE_URL: get('NEXT_PUBLIC_SUPABASE_URL', { required: true }),
  SUPABASE_ANON_KEY: get('NEXT_PUBLIC_SUPABASE_ANON_KEY', { required: true }),
  APP_URL: get('NEXT_PUBLIC_APP_URL', { default: 'http://localhost:3001' }),
};

export type Env = typeof ENV;
