import { create } from 'zustand';
import { logger } from '@schwalbe/shared/lib/logger';
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
            logger.error('Error getting session:', error);
            set({ isLoading: false });
            return;
          }

          if (session) {
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
          supabase.auth.onAuthStateChange((event: string, session: Session | null) => {
            if (event === 'SIGNED_IN' && session) {
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
            }
          });
        } catch (error) {
          logger.error('Error initializing auth:', error);
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
          set({ isLoading: true });
          
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            logger.error('Sign in error:', error);
            set({ isLoading: false });
            return false;
          }

          if (data.session) {
            set({
              session: data.session,
              user: data.user,
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          }

          set({ isLoading: false });
          return false;
        } catch (error) {
          logger.error('Sign in error:', error);
          set({ isLoading: false });
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
          logger.error('Sign out error:', error);
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