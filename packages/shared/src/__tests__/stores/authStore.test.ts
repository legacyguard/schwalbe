/**
 * Auth Store Tests
 * Test Zustand-based authentication state management with Supabase integration
 */

import { useAuthStore } from '../../stores/authStore';
import type { User, Session } from '@supabase/supabase-js';

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getSession: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    onAuthStateChange: jest.fn()
  }
};

// Mock logger
const mockLogger = {
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
};

jest.mock('@schwalbe/shared', () => ({
  supabaseClient: mockSupabaseClient
}));

jest.mock('@schwalbe/shared/lib/logger', () => ({
  logger: mockLogger
}));

// Mock localStorage for persist middleware
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('useAuthStore', () => {
  let store: ReturnType<typeof useAuthStore.getState>;
  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    created_at: '2025-09-22T10:00:00Z',
    updated_at: '2025-09-22T10:00:00Z',
    aud: 'authenticated',
    app_metadata: {},
    user_metadata: { full_name: 'Test User' }
  };

  const mockSession: Session = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    expires_at: Date.now() / 1000 + 3600,
    token_type: 'bearer',
    user: mockUser
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);

    // Reset store state
    useAuthStore.setState({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: true
    });

    store = useAuthStore.getState();
  });

  describe('Store Initialization', () => {
    it('should have correct initial state', () => {
      expect(store.user).toBeNull();
      expect(store.session).toBeNull();
      expect(store.isAuthenticated).toBe(false);
      expect(store.isLoading).toBe(true);
    });

    it('should have all required methods', () => {
      expect(typeof store.initialize).toBe('function');
      expect(typeof store.signIn).toBe('function');
      expect(typeof store.signUp).toBe('function');
      expect(typeof store.signOut).toBe('function');
      expect(typeof store.resetPassword).toBe('function');
      expect(typeof store.setSession).toBe('function');
    });
  });

  describe('initialize', () => {
    it('should initialize with existing session successfully', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: {} }
      });

      await store.initialize();

      const newState = useAuthStore.getState();
      expect(newState.user).toEqual(mockUser);
      expect(newState.session).toEqual(mockSession);
      expect(newState.isAuthenticated).toBe(true);
      expect(newState.isLoading).toBe(false);
    });

    it('should initialize without session', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      });

      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: {} }
      });

      await store.initialize();

      const newState = useAuthStore.getState();
      expect(newState.user).toBeNull();
      expect(newState.session).toBeNull();
      expect(newState.isAuthenticated).toBe(false);
      expect(newState.isLoading).toBe(false);
    });

    it('should handle getSession error', async () => {
      const mockError = { message: 'Session error', code: 'SESSION_ERROR' };
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: mockError
      });

      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: {} }
      });

      await store.initialize();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Session initialization failed',
        { metadata: { error: mockError.message } }
      );

      const newState = useAuthStore.getState();
      expect(newState.isLoading).toBe(false);
    });

    it('should set up auth state change listener', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      });

      const mockCallback = jest.fn();
      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: {} }
      });

      await store.initialize();

      expect(mockSupabaseClient.auth.onAuthStateChange).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });

    it('should handle initialization errors gracefully', async () => {
      mockSupabaseClient.auth.getSession.mockRejectedValue(new Error('Network error'));

      await store.initialize();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Auth initialization failed',
        { metadata: { error: 'Network error' } }
      );

      const newState = useAuthStore.getState();
      expect(newState.user).toBeNull();
      expect(newState.session).toBeNull();
      expect(newState.isAuthenticated).toBe(false);
      expect(newState.isLoading).toBe(false);
    });
  });

  describe('Auth State Change Listener', () => {
    let authStateChangeCallback: (event: string, session: Session | null) => void;

    beforeEach(async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      });

      mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateChangeCallback = callback;
        return { data: { subscription: {} } };
      });

      await store.initialize();
    });

    it('should handle SIGNED_IN event', () => {
      authStateChangeCallback('SIGNED_IN', mockSession);

      const newState = useAuthStore.getState();
      expect(newState.user).toEqual(mockUser);
      expect(newState.session).toEqual(mockSession);
      expect(newState.isAuthenticated).toBe(true);
      expect(newState.isLoading).toBe(false);
    });

    it('should handle SIGNED_OUT event', () => {
      // First sign in
      authStateChangeCallback('SIGNED_IN', mockSession);

      // Then sign out
      authStateChangeCallback('SIGNED_OUT', null);

      const newState = useAuthStore.getState();
      expect(newState.user).toBeNull();
      expect(newState.session).toBeNull();
      expect(newState.isAuthenticated).toBe(false);
      expect(newState.isLoading).toBe(false);
    });

    it('should handle TOKEN_REFRESHED event', () => {
      const refreshedSession = { ...mockSession, access_token: 'new-access-token' };

      authStateChangeCallback('TOKEN_REFRESHED', refreshedSession);

      const newState = useAuthStore.getState();
      expect(newState.session).toEqual(refreshedSession);
      expect(newState.user).toEqual(mockUser);
      expect(newState.isAuthenticated).toBe(true);
      expect(newState.isLoading).toBe(false);
    });

    it('should handle auth state change errors', () => {
      // Mock an error in the callback
      const originalConsoleError = console.error;
      console.error = jest.fn();

      // This should trigger the error handling in the callback
      jest.spyOn(useAuthStore, 'setState').mockImplementationOnce(() => {
        throw new Error('State update error');
      });

      authStateChangeCallback('SIGNED_IN', mockSession);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Auth state change failed',
        { metadata: { error: 'State update error' } }
      );

      console.error = originalConsoleError;
    });
  });

  describe('signIn', () => {
    it('should sign in successfully with valid credentials', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      const result = await store.signIn('test@example.com', 'password123');

      expect(result).toBe(true);
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });

      const newState = useAuthStore.getState();
      expect(newState.user).toEqual(mockUser);
      expect(newState.session).toEqual(mockSession);
      expect(newState.isAuthenticated).toBe(true);
      expect(newState.isLoading).toBe(false);
    });

    it('should handle sign in failure', async () => {
      const mockError = { message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' };
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { session: null },
        error: mockError
      });

      const result = await store.signIn('test@example.com', 'wrongpassword');

      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Sign in failed',
        { metadata: { error: mockError.message } }
      );

      const newState = useAuthStore.getState();
      expect(newState.isLoading).toBe(false);
    });

    it('should validate input credentials', async () => {
      // Test empty email
      let result = await store.signIn('', 'password');
      expect(result).toBe(false);
      expect(mockLogger.warn).toHaveBeenCalledWith('Sign in attempt missing credentials');

      // Test empty password
      result = await store.signIn('test@example.com', '');
      expect(result).toBe(false);

      // Test whitespace-only email
      result = await store.signIn('   ', 'password');
      expect(result).toBe(false);

      expect(mockSupabaseClient.auth.signInWithPassword).not.toHaveBeenCalled();
    });

    it('should trim email input', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      await store.signIn('  test@example.com  ', 'password');

      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password'
      });
    });

    it('should set loading state during sign in', async () => {
      let resolveSignIn: (value: any) => void;
      const signInPromise = new Promise(resolve => {
        resolveSignIn = resolve;
      });

      mockSupabaseClient.auth.signInWithPassword.mockReturnValue(signInPromise);

      const signInCall = store.signIn('test@example.com', 'password');

      // Check loading state is set
      let currentState = useAuthStore.getState();
      expect(currentState.isLoading).toBe(true);

      // Resolve the promise
      resolveSignIn!({
        data: { session: mockSession },
        error: null
      });

      await signInCall;

      // Check loading state is cleared
      currentState = useAuthStore.getState();
      expect(currentState.isLoading).toBe(false);
    });

    it('should handle network errors', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockRejectedValue(new Error('Network error'));

      const result = await store.signIn('test@example.com', 'password');

      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Sign in failed',
        { metadata: { error: 'Network error' } }
      );

      const newState = useAuthStore.getState();
      expect(newState.isLoading).toBe(false);
    });
  });

  describe('signUp', () => {
    it('should sign up successfully with valid credentials', async () => {
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      const result = await store.signUp('newuser@example.com', 'password123', { name: 'New User' });

      expect(result).toBe(true);
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'password123',
        options: {
          data: {
            full_name: 'New User'
          }
        }
      });

      const newState = useAuthStore.getState();
      expect(newState.user).toEqual(mockUser);
      expect(newState.session).toEqual(mockSession);
      expect(newState.isAuthenticated).toBe(true);
      expect(newState.isLoading).toBe(false);
    });

    it('should handle sign up without name', async () => {
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      const result = await store.signUp('newuser@example.com', 'password123');

      expect(result).toBe(true);
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'password123',
        options: {
          data: {
            full_name: ''
          }
        }
      });
    });

    it('should handle sign up requiring email confirmation', async () => {
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { session: null, user: mockUser }, // User created but no session
        error: null
      });

      const result = await store.signUp('newuser@example.com', 'password123');

      expect(result).toBe(true); // Still successful, just needs confirmation

      const newState = useAuthStore.getState();
      expect(newState.session).toBeNull();
      expect(newState.isAuthenticated).toBe(false);
      expect(newState.isLoading).toBe(false);
    });

    it('should handle sign up errors', async () => {
      const mockError = { message: 'Email already registered', code: 'EMAIL_EXISTS' };
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { session: null },
        error: mockError
      });

      const result = await store.signUp('existing@example.com', 'password');

      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Sign up failed',
        { metadata: { error: mockError.message } }
      );
    });

    it('should validate sign up credentials', async () => {
      const result = await store.signUp('', 'password');
      expect(result).toBe(false);
      expect(mockLogger.warn).toHaveBeenCalledWith('Sign up attempt missing credentials');
      expect(mockSupabaseClient.auth.signUp).not.toHaveBeenCalled();
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      // First set up authenticated state
      useAuthStore.setState({
        user: mockUser,
        session: mockSession,
        isAuthenticated: true,
        isLoading: false
      });

      mockSupabaseClient.auth.signOut.mockResolvedValue({ error: null });

      await store.signOut();

      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();

      const newState = useAuthStore.getState();
      expect(newState.user).toBeNull();
      expect(newState.session).toBeNull();
      expect(newState.isAuthenticated).toBe(false);
      expect(newState.isLoading).toBe(false);
    });

    it('should handle sign out errors gracefully', async () => {
      useAuthStore.setState({
        user: mockUser,
        session: mockSession,
        isAuthenticated: true
      });

      mockSupabaseClient.auth.signOut.mockRejectedValue(new Error('Sign out failed'));

      await store.signOut();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Sign out error',
        { metadata: { error: 'Sign out failed' } }
      );

      // State should still be cleared even if API call fails
      const newState = useAuthStore.getState();
      expect(newState.user).toBeNull();
      expect(newState.session).toBeNull();
      expect(newState.isAuthenticated).toBe(false);
    });
  });

  describe('resetPassword', () => {
    it('should send password reset email successfully', async () => {
      // Mock window.location
      Object.defineProperty(window, 'location', {
        value: { origin: 'https://app.example.com' },
        writable: true
      });

      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({ error: null });

      const result = await store.resetPassword('test@example.com');

      expect(result).toBe(true);
      expect(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        { redirectTo: 'https://app.example.com/auth/reset-password' }
      );
    });

    it('should handle password reset errors', async () => {
      const mockError = { message: 'Email not found', code: 'EMAIL_NOT_FOUND' };
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({ error: mockError });

      const result = await store.resetPassword('notfound@example.com');

      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Password reset failed',
        { metadata: { error: mockError.message } }
      );
    });

    it('should validate email input', async () => {
      const result = await store.resetPassword('');
      expect(result).toBe(false);
      expect(mockLogger.warn).toHaveBeenCalledWith('Password reset missing email');
      expect(mockSupabaseClient.auth.resetPasswordForEmail).not.toHaveBeenCalled();
    });

    it('should trim email input', async () => {
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({ error: null });

      await store.resetPassword('  test@example.com  ');

      expect(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.any(Object)
      );
    });

    it('should handle network errors', async () => {
      mockSupabaseClient.auth.resetPasswordForEmail.mockRejectedValue(new Error('Network error'));

      const result = await store.resetPassword('test@example.com');

      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Password reset failed',
        { metadata: { error: 'Network error' } }
      );
    });
  });

  describe('setSession', () => {
    it('should set session and user state', () => {
      store.setSession(mockSession);

      const newState = useAuthStore.getState();
      expect(newState.session).toEqual(mockSession);
      expect(newState.user).toEqual(mockUser);
      expect(newState.isAuthenticated).toBe(true);
    });

    it('should clear state when session is null', () => {
      // First set a session
      store.setSession(mockSession);

      // Then clear it
      store.setSession(null);

      const newState = useAuthStore.getState();
      expect(newState.session).toBeNull();
      expect(newState.user).toBeNull();
      expect(newState.isAuthenticated).toBe(false);
    });

    it('should handle session without user', () => {
      const sessionWithoutUser = { ...mockSession, user: null } as any;

      store.setSession(sessionWithoutUser);

      const newState = useAuthStore.getState();
      expect(newState.session).toEqual(sessionWithoutUser);
      expect(newState.user).toBeNull();
      expect(newState.isAuthenticated).toBe(true); // Session exists
    });
  });

  describe('Persistence', () => {
    it('should only persist isAuthenticated flag', () => {
      useAuthStore.setState({
        user: mockUser,
        session: mockSession,
        isAuthenticated: true,
        isLoading: false
      });

      // Check what gets persisted
      const persistedState = {
        isAuthenticated: true
      };

      // The persist middleware should only save isAuthenticated
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'auth-storage',
        JSON.stringify({ state: persistedState, version: 0 })
      );
    });

    it('should not persist sensitive session data', () => {
      useAuthStore.setState({
        user: mockUser,
        session: mockSession,
        isAuthenticated: true
      });

      // Verify sensitive data is not in localStorage calls
      const setItemCalls = localStorageMock.setItem.mock.calls;
      setItemCalls.forEach(call => {
        const [, value] = call;
        const parsedValue = JSON.parse(value);
        expect(parsedValue.state.session).toBeUndefined();
        expect(parsedValue.state.user).toBeUndefined();
      });
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent sign in attempts', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      const promises = [
        store.signIn('test1@example.com', 'password1'),
        store.signIn('test2@example.com', 'password2'),
        store.signIn('test3@example.com', 'password3')
      ];

      const results = await Promise.all(promises);

      // All should complete
      results.forEach(result => expect(result).toBe(true));

      // State should be consistent
      const finalState = useAuthStore.getState();
      expect(finalState.isLoading).toBe(false);
    });

    it('should handle rapid state changes', async () => {
      const operations = [
        () => store.setSession(mockSession),
        () => store.setSession(null),
        () => store.setSession(mockSession),
        () => store.setSession(null)
      ];

      // Execute operations rapidly
      operations.forEach(op => op());

      const finalState = useAuthStore.getState();
      expect(finalState.session).toBeNull();
      expect(finalState.isAuthenticated).toBe(false);
    });
  });

  describe('Error Recovery', () => {
    it('should recover from initialization errors', async () => {
      // First initialization fails
      mockSupabaseClient.auth.getSession.mockRejectedValueOnce(new Error('Network error'));

      await store.initialize();

      let state = useAuthStore.getState();
      expect(state.isLoading).toBe(false);
      expect(mockLogger.error).toHaveBeenCalled();

      // Second initialization succeeds
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: {} }
      });

      await store.initialize();

      state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should maintain state integrity during partial failures', async () => {
      // Set initial authenticated state
      useAuthStore.setState({
        user: mockUser,
        session: mockSession,
        isAuthenticated: true,
        isLoading: false
      });

      // Sign out API fails but state should still be cleared
      mockSupabaseClient.auth.signOut.mockRejectedValue(new Error('API Error'));

      await store.signOut();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.session).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });
});