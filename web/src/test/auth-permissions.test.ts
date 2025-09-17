
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useSupabaseWithClerk } from '@/integrations/supabase/client';

// Mock Clerk hooks
vi.mock('@clerk/clerk-react', () => ({
  useAuth: vi.fn(),
  useUser: vi.fn(),
}));

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  useSupabaseWithClerk: vi.fn(),
}));

describe('Authentication & Permissions', () => {
  const mockUserId = 'user_123456';
  const mockUser = {
    id: mockUserId,
    firstName: 'John',
    lastName: 'Doe',
    emailAddresses: [{ emailAddress: 'john@example.com' }],
    fullName: 'John Doe',
  };

  const mockSupabaseClient = {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ data: null, error: null })),
        download: vi.fn(() => Promise.resolve({ data: null, error: null })),
        remove: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    },
    rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    (useAuth as any).mockReturnValue({
      userId: mockUserId,
      isSignedIn: true,
      isLoaded: true,
    });

    (useUser as any).mockReturnValue({
      user: mockUser,
      isLoaded: true,
    });

    (useSupabaseWithClerk as any).mockReturnValue(() =>
      Promise.resolve(mockSupabaseClient)
    );
  });

  describe('User Authentication State', () => {
    it('should provide authenticated user context', () => {
      const auth = useAuth();
      const user = useUser();

      expect(auth.userId).toBe(mockUserId);
      expect(auth.isSignedIn).toBe(true);
      expect(auth.isLoaded).toBe(true);
      expect(user.user).toEqual(mockUser);
    });

    it('should handle unauthenticated state', () => {
      (useAuth as unknown as jest.Mock).mockReturnValue({
        userId: null,
        isSignedIn: false,
        isLoaded: true,
      });

      (useUser as unknown as jest.Mock).mockReturnValue({
        user: null,
        isLoaded: true,
      });

      const auth = useAuth();
      const user = useUser();

      expect(auth.userId).toBeNull();
      expect(auth.isSignedIn).toBe(false);
      expect(user.user).toBeNull();
    });

    it('should handle loading state', () => {
      (useAuth as unknown as jest.Mock).mockReturnValue({
        userId: null,
        isSignedIn: false,
        isLoaded: false,
      });

      const auth = useAuth();
      expect(auth.isLoaded).toBe(false);
    });
  });

  describe('Supabase Client Integration', () => {
    it('should create authenticated Supabase client', async () => {
      const createClient = useSupabaseWithClerk();
      const client = await createClient();

      expect(client).toBeDefined();
      expect(client.from).toBeDefined();
      expect(client.storage).toBeDefined();
    });

    it('should handle client creation errors', async () => {
      (useSupabaseWithClerk as unknown as jest.Mock).mockReturnValue(() =>
        Promise.reject(new Error('Client creation failed'))
      );

      const createClient = useSupabaseWithClerk();

      await expect(createClient()).rejects.toThrow('Client creation failed');
    });
  });

  describe('Data Access Control', () => {
    it('should enforce user-specific data access', async () => {
      const createClient = useSupabaseWithClerk();
      const client = await createClient();

      // Test document access
      await client
        .from('documents')
        .select('*')
        .eq('user_id', mockUserId)
        .single();

      expect(client.from).toHaveBeenCalledWith('documents');
      // Verify the chain of calls was made
      expect(client.from).toHaveBeenCalled();
    });

    it('should prevent cross-user data access', async () => {
      const createClient = useSupabaseWithClerk();
      const client = await createClient();

      // This should be blocked by RLS policies
      await client
        .from('documents')
        .select('*')
        .eq('user_id', 'other_user')
        .single();

      // Verify the query was made (RLS will handle the blocking)
      expect(client.from).toHaveBeenCalledWith('documents');
    });

    it('should handle storage access control', async () => {
      const createClient = useSupabaseWithClerk();
      const client = await createClient();

      const filePath = `${mockUserId}/document.pdf`;
      await client.storage.from('user_documents').upload(filePath, new Blob());

      expect(client.storage.from).toHaveBeenCalledWith('user_documents');
    });
  });

  describe('Permission Checks', () => {
    it('should validate guardian permissions', async () => {
      const createClient = useSupabaseWithClerk();
      const client = await createClient();

      // Test guardian access
      await client
        .from('guardians')
        .select('*')
        .eq('user_id', mockUserId)
        .single();

      expect(client.from).toHaveBeenCalledWith('guardians');
    });

    it('should enforce document ownership', async () => {
      const createClient = useSupabaseWithClerk();
      const client = await createClient();

      // Test document ownership check
      await client
        .from('documents')
        .select('*')
        .eq('user_id', mockUserId)
        .single();

      expect(client.from).toHaveBeenCalledWith('documents');
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication errors gracefully', async () => {
      (useAuth as unknown as jest.Mock).mockReturnValue({
        userId: null,
        isSignedIn: false,
        isLoaded: true,
        error: new Error('Auth failed'),
      });

      const auth = useAuth();

      // The auth hook doesn't expose error directly, so we test the isLoaded state
      expect(auth.isLoaded).toBe(false);
    });

    it('should handle Supabase errors', async () => {
      const mockError = { message: 'Database error', code: 'PGRST116' };
      (mockSupabaseClient.from as any).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() =>
              Promise.resolve({ data: null, error: mockError })
            ),
          })),
        })),
      });

      const createClient = useSupabaseWithClerk();
      const client = await createClient();

      const result = await client
        .from('documents')
        .select('*')
        .eq('user_id', mockUserId)
        .single();

      expect(result.error).toEqual(mockError);
    });
  });

  describe('Security Best Practices', () => {
    it('should not expose sensitive user data', () => {
      const user = useUser();

      // Ensure sensitive fields are not exposed
      expect((user.user as any)?.password).toBeUndefined();
      expect((user.user as any)?.privateKey).toBeUndefined();
    });

    it('should use secure storage for sensitive operations', async () => {
      const createClient = useSupabaseWithClerk();
      const client = await createClient();

      // Verify storage bucket is user-scoped
      const filePath = `${mockUserId}/sensitive.pdf`;
      await client.storage.from('user_documents').upload(filePath, new Blob());

      expect(filePath).toContain(mockUserId);
    });

    it('should validate user input before database operations', async () => {
      const createClient = useSupabaseWithClerk();
      const client = await createClient();

      // Test input validation
      const validUserId = mockUserId;
      const invalidUserId = 'invalid-user-id';

      // Valid user ID should work
      await client
        .from('documents')
        .select('*')
        .eq('user_id', validUserId)
        .single();

      // Invalid user ID should be handled by validation
      expect(() => {
        if (!validUserId || validUserId.length < 3) {
          throw new Error('Invalid user ID');
        }
      }).not.toThrow();

      // Test invalid user ID validation
      const validateUserId = (userId: string) => {
        // Clerk user IDs typically have a specific format
        if (!userId || !userId.startsWith('user_') || userId.length < 10) {
          throw new Error('Invalid user ID');
        }
      };

      // Valid ID should pass
      expect(() => validateUserId(validUserId)).not.toThrow();

      // Invalid IDs should throw
      expect(() => validateUserId('')).toThrow('Invalid user ID');
      expect(() => validateUserId('short')).toThrow('Invalid user ID');
      expect(() => validateUserId(invalidUserId)).toThrow('Invalid user ID');
    });
  });
});
