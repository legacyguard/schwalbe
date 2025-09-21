import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, _get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: true,

      initialize: async () => {
        try {
          // Get initial session
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error) {
            console.error('Session initialization failed');
            set(state => ({ ...state, isLoading: false }));
            return;
          }

          if (session?.user) {
            set(state => ({
              ...state,
              session,
              user: session.user,
              isAuthenticated: true,
              isLoading: false,
            }));
          } else {
            set(state => ({
              ...state,
              session: null,
              user: null,
              isAuthenticated: false,
              isLoading: false,
            }));
          }

          // Listen for auth changes
          supabase.auth.onAuthStateChange((event: string, session: Session | null) => {
            try {
              if (event === 'SIGNED_IN' && session?.user) {
                set(state => ({
                  ...state,
                  session,
                  user: session.user,
                  isAuthenticated: true,
                  isLoading: false,
                }));
              } else if (event === 'SIGNED_OUT') {
                set(state => ({
                  ...state,
                  session: null,
                  user: null,
                  isAuthenticated: false,
                  isLoading: false,
                }));
              }
            } catch (error) {
              console.error('Auth state change failed');
            }
          });
        } catch (error) {
          console.error('Auth initialization failed');
          set(state => ({
            ...state,
            session: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
          }));
        }
      },

      signIn: async (email: string, password: string) => {
        try {
          // Input validation
          if (!email?.trim() || !password?.trim()) {
            console.error('Sign in failed: Missing email or password');
            return false;
          }

          set(state => ({ ...state, isLoading: true }));

          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

          if (error) {
            console.error('Sign in failed');
            set(state => ({ ...state, isLoading: false }));
            return false;
          }

          if (data.session?.user) {
            set(state => ({
              ...state,
              session: data.session,
              user: data.session.user,
              isAuthenticated: true,
              isLoading: false,
            }));
            return true;
          }

          set(state => ({ ...state, isLoading: false }));
          return false;
        } catch (error) {
          console.error('Sign in failed');
          set(state => ({ ...state, isLoading: false }));
          return false;
        }
      },

      signOut: async () => {
        try {
          await supabase.auth.signOut();
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
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        // Only persist non-sensitive data
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);