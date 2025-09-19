
import { createClient } from '@supabase/supabase-js';

// Environment variables with fallbacks for different environments
const supabaseUrl =
  process.env['NEXT_PUBLIC_SUPABASE_URL'] ||
  process.env['EXPO_PUBLIC_SUPABASE_URL'] ||
  process.env['VITE_SUPABASE_URL'] || // Add Vite support
  '';

const supabaseAnonKey =
  process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ||
  process.env['EXPO_PUBLIC_SUPABASE_ANON_KEY'] ||
  process.env['VITE_SUPABASE_ANON_KEY'] || // Add Vite support
  '';

// Check for placeholder values
const isPlaceholder = (value: string) =>
  !value ||
  value.includes('your-project.supabase.co') ||
  value.includes('your-anon-key') ||
  value.includes('placeholder');

const hasValidConfig = supabaseUrl && supabaseAnonKey &&
  !isPlaceholder(supabaseUrl) && !isPlaceholder(supabaseAnonKey);

if (!hasValidConfig) {
  console.warn(
    'Missing or placeholder Supabase environment variables. Database features will not work.',
    {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      urlValid: !isPlaceholder(supabaseUrl),
      keyValid: !isPlaceholder(supabaseAnonKey)
    }
  );
}

// Create Supabase client with optimized session handling or mock client
export const supabaseClient = hasValidConfig ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    flowType: 'pkce', // Use PKCE flow for better security
  },
  global: {
    headers: {
      'X-Client-Info': 'schwalbe-web',
    },
  },
}) : {
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

// Backward compatibility export
export const supabase = supabaseClient;
