import { createClient } from '@supabase/supabase-js';
import { ENV } from '@/lib/env';

// Client-side Supabase client
export function createClientComponentClient() {
  return createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);
}

// Default export for backward compatibility
export const supabase = createClientComponentClient();
