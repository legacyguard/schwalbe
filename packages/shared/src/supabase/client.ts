
import { createClient } from '@supabase/supabase-js';
import { logger } from '../lib/logger';

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

if (!supabaseUrl || !supabaseAnonKey) {
  logger.warn(
    'Missing Supabase environment variables. Database features will not work.',
    {
      metadata: {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey
      }
    }
  );
}

// Create Supabase client with optimized session handling
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
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
});

// Backward compatibility export
export const supabase = supabaseClient;
