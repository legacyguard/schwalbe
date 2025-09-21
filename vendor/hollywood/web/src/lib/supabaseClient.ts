
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { useAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';

// Get Supabase configuration from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables');
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

// Session storage keys
const SUPABASE_SESSION_KEY = 'supabase.auth.session';
const SUPABASE_REFRESH_TOKEN_KEY = 'supabase.auth.refreshToken';

// Create singleton Supabase client with session persistence
export const supabaseClient = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      // Use localStorage for session persistence
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: SUPABASE_SESSION_KEY,
      // Enable automatic token refresh
      autoRefreshToken: true,
      // Persist session across browser tabs
      persistSession: true,
      // Detect session from URL (for OAuth redirects)
      detectSessionInUrl: true,
      // Flow type for auth (implicit is faster for SPAs)
      flowType: 'implicit',
    },
    // Enable real-time subscriptions
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    // Global fetch options
    global: {
      // Add custom headers if needed
      headers: {
        'x-application-name': 'legacyguard',
      },
    },
  }
);

// Hook to get Supabase client with Clerk auth token
export function useSupabaseClient() {
  const { getToken, isSignedIn } = useAuth();
  const [client, setClient] = useState(supabaseClient);

  useEffect(() => {
    if (!isSignedIn) {
      setClient(supabaseClient);
      return;
    }

    // Create authenticated client with Clerk JWT
    const createAuthedClient = async () => {
      try {
        const token = await getToken({ template: 'supabase' });

        if (!token) {
          setClient(supabaseClient);
          return;
        }

        // Create new client instance with auth header
        const authedClient = createClient<Database>(
          SUPABASE_URL,
          SUPABASE_ANON_KEY,
          {
            auth: {
              storage: window.localStorage,
              storageKey: SUPABASE_SESSION_KEY,
              autoRefreshToken: true,
              persistSession: true,
              detectSessionInUrl: true,
              flowType: 'implicit',
            },
            realtime: {
              params: {
                eventsPerSecond: 10,
              },
            },
            global: {
              headers: {
                'x-application-name': 'legacyguard',
                Authorization: `Bearer ${token}`,
              },
            },
          }
        );

        setClient(authedClient);
      } catch (error) {
        console.error('Error creating authenticated Supabase client:', error);
        setClient(supabaseClient);
      }
    };

    createAuthedClient();
  }, [getToken, isSignedIn]);

  return client;
}

// Hook to manage Supabase session
export function useSupabaseSession() {
  const client = useSupabaseClient();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    client.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);

      // Handle session persistence
      if (session) {
        // Store refresh token separately for better security
        if (session.refresh_token) {
          localStorage.setItem(
            SUPABASE_REFRESH_TOKEN_KEY,
            session.refresh_token
          );
        }
      } else {
        // Clear stored tokens on logout
        localStorage.removeItem(SUPABASE_REFRESH_TOKEN_KEY);
        localStorage.removeItem(SUPABASE_SESSION_KEY);
      }
    });

    return () => subscription.unsubscribe();
  }, [client]);

  // Function to refresh session manually
  const refreshSession = async () => {
    try {
      const refreshToken = localStorage.getItem(SUPABASE_REFRESH_TOKEN_KEY);

      if (!refreshToken) {
        console.warn('No refresh token available');
        return null;
      }

      const { data, error } = await client.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) {
        console.error('Failed to refresh session:', error);
        return null;
      }

      setSession(data.session);
      return data.session;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return null;
    }
  };

  // Function to sign out
  const signOut = async () => {
    try {
      await client.auth.signOut();
      setSession(null);
      // Clear all stored auth data
      localStorage.removeItem(SUPABASE_REFRESH_TOKEN_KEY);
      localStorage.removeItem(SUPABASE_SESSION_KEY);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return {
    session,
    loading,
    refreshSession,
    signOut,
    isAuthenticated: !!session,
  };
}

// Utility function to handle Supabase errors
export function handleSupabaseError(error: any): string {
  if (error?.message) {
    return error.message;
  }
  if (error?.error_description) {
    return error.error_description;
  }
  if (error?.error) {
    return typeof error.error === 'string' ? error.error : 'An error occurred';
  }
  return 'An unexpected error occurred';
}

// Export default client for backward compatibility
export default supabaseClient;
