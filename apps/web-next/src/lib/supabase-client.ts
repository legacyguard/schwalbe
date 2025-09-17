import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'
import { ENV } from '@/lib/env'

// Client-side Supabase client for use in Client Components
export function createClientComponentClient() {
  return createBrowserClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY)
}

// Server-side Supabase client for use in Server Components and API routes
export function createServerComponentClient() {
  return createClient(
    ENV.SUPABASE_URL,
    ENV.SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false
      }
    }
  )
}
