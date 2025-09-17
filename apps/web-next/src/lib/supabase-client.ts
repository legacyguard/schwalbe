import { createClient } from '@supabase/supabase-js'

// Client-side Supabase client for use in Client Components
export function createClientComponentClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
