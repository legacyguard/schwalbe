import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { config, isProduction } from '@/lib/env';

type AuthStub = {
  getUser: () => Promise<{ data: { user: null }; error: null }>;
  signInWithPassword: () => Promise<{ data: null; error: { message: string } }>;
  signInWithOAuth: () => Promise<{ data: null; error: { message: string } }>;
  signUp: () => Promise<{ data: null; error: { message: string } }>;
  resetPasswordForEmail: () => Promise<{ error: { message: string } }>;
  signOut: () => Promise<{ error: null }>;
  onAuthStateChange: () => { data: { subscription: { unsubscribe: () => void } } };
};

type SupabaseStub = {
  auth: AuthStub;
  from: () => {
    select: () => Promise<{ data: unknown[]; error: null }>;
    insert: () => Promise<{ data: null; error: { message: string } }>;
    update: () => Promise<{ data: null; error: { message: string } }>;
    delete: () => Promise<{ data: null; error: { message: string } }>;
  };
};

function createStubClient(): SupabaseStub {
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({ data: null, error: { message: 'Authentication disabled in demo mode.' } }),
      signInWithOAuth: async () => ({ data: null, error: { message: 'OAuth authentication disabled in demo mode.' } }),
      signUp: async () => ({ data: null, error: { message: 'Sign up disabled in demo mode.' } }),
      resetPasswordForEmail: async () => ({ error: { message: 'Password reset disabled in demo mode.' } }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: async () => ({ data: [], error: null }),
      insert: async () => ({ data: null, error: { message: 'Database write disabled in demo mode.' } }),
      update: async () => ({ data: null, error: { message: 'Database write disabled in demo mode.' } }),
      delete: async () => ({ data: null, error: { message: 'Database write disabled in demo mode.' } })
    })
  };
}

let client: SupabaseClient | SupabaseStub;

// The validation in main.tsx ensures these values are present in production.
// The stub is now only used for development environments if credentials are missing.
if (config.supabase.url && config.supabase.anonKey) {
  client = createClient(config.supabase.url, config.supabase.anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  });
} else {
  if (isProduction) {
    // This should not happen due to the validation in main.tsx, but as a safeguard:
    throw new Error('Supabase configuration is missing in production.');
  }
  client = createStubClient();
}

// Export a consistent interface for the rest of the app.
export const supabase = client;
