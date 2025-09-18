import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

function getEnv(name: string): string {
  const v = process.env[name];
  if (!v || v.length === 0) {
    // Be resilient in test environments to keep unit tests green
    if (process.env.JEST_WORKER_ID || process.env.NODE_ENV === 'test') {
      if (name.includes('URL')) return 'http://localhost:54321';
      return 'anon-public-placeholder';
    }
    throw new Error(`[apps/mobile] Missing required environment variable: ${name}`);
  }
  return v;
}

const supabaseUrl = getEnv('EXPO_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
