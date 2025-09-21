import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabaseClient } from '@schwalbe/shared';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, options?: { name?: string }) => Promise<boolean>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: true,

      initialize: async () => {
        try {
          // Get initial session
          const { data: { session }, error } = await supabaseClient.auth.getSession();

          if (error) {
            console.error('Session initialization failed:', error);
            set({ isLoading: false });
            return;
          }

          if (session?.user) {
            set({
              session,
              user: session.user,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({
              session: null,
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }

          // Listen for auth changes
          supabaseClient.auth.onAuthStateChange((event: string, session: Session | null) => {
            try {
              if (event === 'SIGNED_IN' && session?.user) {
                set({
                  session,
                  user: session.user,
                  isAuthenticated: true,
                  isLoading: false,
                });
              } else if (event === 'SIGNED_OUT') {
                set({
                  session: null,
                  user: null,
                  isAuthenticated: false,
                  isLoading: false,
                });
              } else if (event === 'TOKEN_REFRESHED' && session) {
                set({
                  session,
                  user: session.user,
                  isAuthenticated: true,
                  isLoading: false,
                });
              }
            } catch (error) {
              console.error('Auth state change failed:', error);
            }
          });
        } catch (error) {
          console.error('Auth initialization failed:', error);
          set({
            session: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      signIn: async (email: string, password: string) => {
        try {
          // Input validation
          if (!email?.trim() || !password?.trim()) {
            console.error('Sign in failed: Missing email or password');
            return false;
          }

          set({ isLoading: true });

          const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

          if (error) {
            console.error('Sign in failed:', error.message);
            set({ isLoading: false });
            return false;
          }

          if (data.session?.user) {
            set({
              session: data.session,
              user: data.session.user,
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          }

          set({ isLoading: false });
          return false;
        } catch (error) {
          console.error('Sign in failed:', error);
          set({ isLoading: false });
          return false;
        }
      },

      signUp: async (email: string, password: string, options?: { name?: string }) => {
        try {
          if (!email?.trim() || !password?.trim()) {
            console.error('Sign up failed: Missing email or password');
            return false;
          }

          set({ isLoading: true });

          const { data, error } = await supabaseClient.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: {
                full_name: options?.name || '',
              },
            },
          });

          if (error) {
            console.error('Sign up failed:', error.message);
            set({ isLoading: false });
            return false;
          }

          if (data.session?.user) {
            set({
              session: data.session,
              user: data.session.user,
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          }

          // Account created but needs email confirmation
          set({ isLoading: false });
          return true;
        } catch (error) {
          console.error('Sign up failed:', error);
          set({ isLoading: false });
          return false;
        }
      },

      signOut: async () => {
        try {
          await supabaseClient.auth.signOut();
          set({
            session: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (error) {
          console.error('Sign out error:', error);
        }
      },

      resetPassword: async (email: string) => {
        try {
          if (!email?.trim()) {
            console.error('Password reset failed: Missing email');
            return false;
          }

          const { error } = await supabaseClient.auth.resetPasswordForEmail(
            email.trim(),
            {
              redirectTo: `${window.location.origin}/auth/reset-password`,
            }
          );

          if (error) {
            console.error('Password reset failed:', error.message);
            return false;
          }

          return true;
        } catch (error) {
          console.error('Password reset failed:', error);
          return false;
        }
      },

      setSession: (session: Session | null) => {
        set({
          session,
          user: session?.user || null,
          isAuthenticated: !!session,
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist authentication status, not sensitive session data
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);