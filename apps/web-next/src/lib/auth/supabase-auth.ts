/**
 * Supabase Authentication Service
 * Handles all authentication operations using Supabase Auth
 */

import { createClient } from '@supabase/supabase-js';
import { logger } from '@schwalbe/shared/lib/logger';
import { emailService } from '@schwalbe/shared/lib/resend';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface User {
  id: string;
  email: string;
  name?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface SignUpData {
  email: string;
  password: string;
  name?: string;
  metadata?: Record<string, any>;
}

export interface SignInData {
  email: string;
  password: string;
}

class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Sign up a new user
   */
  async signUp({ email, password, name, metadata }: SignUpData): Promise<{ user?: User; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            ...metadata,
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      });

      if (error) {
        logger.warn('Sign up failed', {
          action: 'auth_signup_failed',
          metadata: { error: error.message },
        });
        return { error: error.message };
      }

      if (!data.user) {
        return { error: 'Failed to create user' };
      }

      // Create user profile in database
      await this.createUserProfile(data.user.id, email, name);

      // Send welcome email
      await emailService.sendWelcomeEmail(email, {
        name: name || email.split('@')[0],
        loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
      });

      logger.info('User signed up successfully', {
        action: 'auth_signup_success',
        userId: data.user.id,
      });

      return {
        user: this.mapSupabaseUser(data.user),
      };
    } catch (error: any) {
      logger.error('Sign up error', {
        action: 'auth_signup_error',
        metadata: { error: error.message },
      });
      return { error: 'Failed to sign up' };
    }
  }

  /**
   * Sign in an existing user
   */
  async signIn({ email, password }: SignInData): Promise<{ user?: User; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logger.warn('Sign in failed', {
          action: 'auth_signin_failed',
          metadata: { error: error.message },
        });
        return { error: error.message };
      }

      if (!data.user) {
        return { error: 'Invalid credentials' };
      }

      logger.info('User signed in successfully', {
        action: 'auth_signin_success',
        userId: data.user.id,
      });

      return {
        user: this.mapSupabaseUser(data.user),
      };
    } catch (error: any) {
      logger.error('Sign in error', {
        action: 'auth_signin_error',
        metadata: { error: error.message },
      });
      return { error: 'Failed to sign in' };
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        logger.warn('Sign out failed', {
          action: 'auth_signout_failed',
          metadata: { error: error.message },
        });
        return { error: error.message };
      }

      logger.info('User signed out successfully', {
        action: 'auth_signout_success',
      });

      return {};
    } catch (error: any) {
      logger.error('Sign out error', {
        action: 'auth_signout_error',
        metadata: { error: error.message },
      });
      return { error: 'Failed to sign out' };
    }
  }

  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      return this.mapSupabaseUser(user);
    } catch (error: any) {
      logger.error('Get current user error', {
        action: 'auth_get_user_error',
        metadata: { error: error.message },
      });
      return null;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
      });

      if (error) {
        logger.warn('Password reset email failed', {
          action: 'auth_password_reset_failed',
          metadata: { error: error.message },
        });
        return { error: error.message };
      }

      logger.info('Password reset email sent', {
        action: 'auth_password_reset_sent',
        metadata: { email },
      });

      return {};
    } catch (error: any) {
      logger.error('Password reset error', {
        action: 'auth_password_reset_error',
        metadata: { error: error.message },
      });
      return { error: 'Failed to send password reset email' };
    }
  }

  /**
   * Update user password
   */
  async updatePassword(newPassword: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        logger.warn('Password update failed', {
          action: 'auth_password_update_failed',
          metadata: { error: error.message },
        });
        return { error: error.message };
      }

      logger.info('Password updated successfully', {
        action: 'auth_password_update_success',
      });

      return {};
    } catch (error: any) {
      logger.error('Password update error', {
        action: 'auth_password_update_error',
        metadata: { error: error.message },
      });
      return { error: 'Failed to update password' };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: { name?: string; metadata?: Record<string, any> }): Promise<{ user?: User; error?: string }> {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates,
      });

      if (error) {
        logger.warn('Profile update failed', {
          action: 'auth_profile_update_failed',
          metadata: { error: error.message },
        });
        return { error: error.message };
      }

      if (!data.user) {
        return { error: 'Failed to update profile' };
      }

      logger.info('Profile updated successfully', {
        action: 'auth_profile_update_success',
        userId: data.user.id,
      });

      return {
        user: this.mapSupabaseUser(data.user),
      };
    } catch (error: any) {
      logger.error('Profile update error', {
        action: 'auth_profile_update_error',
        metadata: { error: error.message },
      });
      return { error: 'Failed to update profile' };
    }
  }

  /**
   * Verify email with OTP
   */
  async verifyEmail(email: string, token: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });

      if (error) {
        logger.warn('Email verification failed', {
          action: 'auth_email_verify_failed',
          metadata: { error: error.message },
        });
        return { error: error.message };
      }

      logger.info('Email verified successfully', {
        action: 'auth_email_verify_success',
        metadata: { email },
      });

      return {};
    } catch (error: any) {
      logger.error('Email verification error', {
        action: 'auth_email_verify_error',
        metadata: { error: error.message },
      });
      return { error: 'Failed to verify email' };
    }
  }

  /**
   * Sign in with OAuth provider
   */
  async signInWithProvider(provider: 'google' | 'github' | 'facebook'): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      });

      if (error) {
        logger.warn('OAuth sign in failed', {
          action: 'auth_oauth_failed',
          metadata: { provider, error: error.message },
        });
        return { error: error.message };
      }

      logger.info('OAuth sign in initiated', {
        action: 'auth_oauth_initiated',
        metadata: { provider },
      });

      return {};
    } catch (error: any) {
      logger.error('OAuth sign in error', {
        action: 'auth_oauth_error',
        metadata: { provider, error: error.message },
      });
      return { error: `Failed to sign in with ${provider}` };
    }
  }

  /**
   * Create user profile in database
   */
  private async createUserProfile(userId: string, email: string, name?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          email,
          name: name || email.split('@')[0],
          created_at: new Date().toISOString(),
        });

      if (error) {
        logger.error('Failed to create user profile', {
          action: 'auth_profile_create_failed',
          userId,
          metadata: { error: error.message },
        });
      }
    } catch (error: any) {
      logger.error('User profile creation error', {
        action: 'auth_profile_create_error',
        userId,
        metadata: { error: error.message },
      });
    }
  }

  /**
   * Map Supabase user to our User interface
   */
  private mapSupabaseUser(supabaseUser: any): User {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email!,
      name: supabaseUser.user_metadata?.name,
      emailVerified: !!supabaseUser.email_confirmed_at,
      createdAt: new Date(supabaseUser.created_at),
      updatedAt: new Date(supabaseUser.updated_at || supabaseUser.created_at),
      metadata: supabaseUser.user_metadata,
    };
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        callback(this.mapSupabaseUser(session.user));
      } else {
        callback(null);
      }
    });

    return () => subscription.unsubscribe();
  }

  /**
   * Get session
   */
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  /**
   * Refresh session
   */
  async refreshSession() {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    
    if (error) {
      logger.error('Session refresh failed', {
        action: 'auth_session_refresh_failed',
        metadata: { error: error.message },
      });
      return null;
    }

    return session;
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();

// Export Supabase client for direct use if needed
export { supabase };

// Export convenience functions
export const signUp = (data: SignUpData) => authService.signUp(data);
export const signIn = (data: SignInData) => authService.signIn(data);
export const signOut = () => authService.signOut();
export const getCurrentUser = () => authService.getCurrentUser();
export const sendPasswordResetEmail = (email: string) => authService.sendPasswordResetEmail(email);
export const updatePassword = (newPassword: string) => authService.updatePassword(newPassword);
export const updateProfile = (updates: any) => authService.updateProfile(updates);
export const verifyEmail = (email: string, token: string) => authService.verifyEmail(email, token);
export const signInWithProvider = (provider: 'google' | 'github' | 'facebook') => authService.signInWithProvider(provider);
export const onAuthStateChange = (callback: (user: User | null) => void) => authService.onAuthStateChange(callback);

export default authService;