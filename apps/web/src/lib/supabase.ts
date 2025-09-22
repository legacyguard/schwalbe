import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/env';

// Graceful fallback for demo/development without Supabase configuration
let supabase: any;

if (!config.supabase.url || !config.supabase.anonKey) {
  if (config.isProd) {
    throw new Error('Missing required Supabase environment variables in production. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  console.warn('Missing Supabase environment variables. Using demo mode.');
  // Create a mock client for demo purposes
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Demo mode - authentication disabled' } }),
      signUp: () => Promise.resolve({ data: null, error: { message: 'Demo mode - authentication disabled' } }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: null, error: { message: 'Demo mode - database disabled' } }),
      update: () => ({ data: null, error: { message: 'Demo mode - database disabled' } }),
      delete: () => ({ data: null, error: { message: 'Demo mode - database disabled' } })
    })
  } as any;
} else {
  supabase = createClient(config.supabase.url, config.supabase.anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });
}

export { supabase };