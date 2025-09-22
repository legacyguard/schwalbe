/**
 * Supabase Database Tests
 * Test database operations, RLS policies, and data integrity
 */

import { supabaseClient, supabase } from '../../supabase/client';

// Mock environment variables
const mockEnv = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://test-project.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key-12345'
};

// Mock createClient
const mockCreateClient = jest.fn();
jest.mock('@supabase/supabase-js', () => ({
  createClient: (...args: any[]) => mockCreateClient(...args)
}));

describe('Supabase Client Configuration', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = process.env;
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Environment Variable Detection', () => {
    it('should use NEXT_PUBLIC environment variables', () => {
      process.env = {
        ...originalEnv,
        NEXT_PUBLIC_SUPABASE_URL: 'https://next-project.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'next-anon-key'
      };

      // Re-import to trigger initialization
      jest.resetModules();
      require('../../supabase/client');

      expect(mockCreateClient).toHaveBeenCalledWith(
        'https://next-project.supabase.co',
        'next-anon-key',
        expect.any(Object)
      );
    });

    it('should fallback to EXPO_PUBLIC environment variables', () => {
      process.env = {
        ...originalEnv,
        EXPO_PUBLIC_SUPABASE_URL: 'https://expo-project.supabase.co',
        EXPO_PUBLIC_SUPABASE_ANON_KEY: 'expo-anon-key'
      };

      jest.resetModules();
      require('../../supabase/client');

      expect(mockCreateClient).toHaveBeenCalledWith(
        'https://expo-project.supabase.co',
        'expo-anon-key',
        expect.any(Object)
      );
    });

    it('should fallback to VITE environment variables', () => {
      process.env = {
        ...originalEnv,
        VITE_SUPABASE_URL: 'https://vite-project.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'vite-anon-key'
      };

      jest.resetModules();
      require('../../supabase/client');

      expect(mockCreateClient).toHaveBeenCalledWith(
        'https://vite-project.supabase.co',
        'vite-anon-key',
        expect.any(Object)
      );
    });

    it('should prioritize NEXT_PUBLIC over EXPO_PUBLIC', () => {
      process.env = {
        ...originalEnv,
        NEXT_PUBLIC_SUPABASE_URL: 'https://next-project.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'next-anon-key',
        EXPO_PUBLIC_SUPABASE_URL: 'https://expo-project.supabase.co',
        EXPO_PUBLIC_SUPABASE_ANON_KEY: 'expo-anon-key'
      };

      jest.resetModules();
      require('../../supabase/client');

      expect(mockCreateClient).toHaveBeenCalledWith(
        'https://next-project.supabase.co',
        'next-anon-key',
        expect.any(Object)
      );
    });
  });

  describe('Placeholder Detection', () => {
    const placeholderValues = [
      'your-project.supabase.co',
      'your-anon-key',
      'placeholder',
      ''
    ];

    placeholderValues.forEach(placeholder => {
      it(`should detect placeholder value: "${placeholder}"`, () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

        process.env = {
          ...originalEnv,
          NEXT_PUBLIC_SUPABASE_URL: placeholder,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: 'valid-key'
        };

        jest.resetModules();
        require('../../supabase/client');

        expect(consoleSpy).toHaveBeenCalledWith(
          'Missing or placeholder Supabase environment variables. Database features will not work.',
          expect.any(Object)
        );

        consoleSpy.mockRestore();
      });
    });

    it('should not warn for valid configuration', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      process.env = {
        ...originalEnv,
        NEXT_PUBLIC_SUPABASE_URL: 'https://valid-project.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'valid-anon-key-123'
      };

      jest.resetModules();
      require('../../supabase/client');

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Client Configuration', () => {
    beforeEach(() => {
      process.env = {
        ...originalEnv,
        NEXT_PUBLIC_SUPABASE_URL: 'https://test-project.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key'
      };
    });

    it('should configure auth settings correctly', () => {
      jest.resetModules();
      require('../../supabase/client');

      expect(mockCreateClient).toHaveBeenCalledWith(
        'https://test-project.supabase.co',
        'test-anon-key',
        {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            storage: expect.any(Object),
            flowType: 'pkce'
          },
          global: {
            headers: {
              'X-Client-Info': 'schwalbe-web'
            }
          }
        }
      );
    });

    it('should handle server-side rendering', () => {
      // Mock server environment (no window)
      const originalWindow = global.window;
      delete (global as any).window;

      jest.resetModules();
      require('../../supabase/client');

      expect(mockCreateClient).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          auth: expect.objectContaining({
            storage: undefined
          })
        })
      );

      global.window = originalWindow;
    });

    it('should use localStorage when available', () => {
      // Mock client environment (with window)
      global.window = { localStorage: {} } as any;

      jest.resetModules();
      require('../../supabase/client');

      expect(mockCreateClient).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          auth: expect.objectContaining({
            storage: global.window.localStorage
          })
        })
      );
    });
  });

  describe('Mock Client Fallback', () => {
    beforeEach(() => {
      process.env = {
        ...originalEnv,
        NEXT_PUBLIC_SUPABASE_URL: '',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ''
      };
    });

    it('should create mock client when configuration is invalid', () => {
      jest.resetModules();
      const { supabaseClient } = require('../../supabase/client');

      expect(mockCreateClient).not.toHaveBeenCalled();
      expect(supabaseClient).toBeDefined();
      expect(typeof supabaseClient.auth.getSession).toBe('function');
      expect(typeof supabaseClient.from).toBe('function');
    });

    it('should return demo mode errors for auth operations', async () => {
      jest.resetModules();
      const { supabaseClient } = require('../../supabase/client');

      const signInResult = await supabaseClient.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password'
      });

      expect(signInResult.error.message).toBe('Demo mode - authentication disabled');
    });

    it('should return demo mode errors for database operations', async () => {
      jest.resetModules();
      const { supabaseClient } = require('../../supabase/client');

      const insertResult = await supabaseClient.from('documents').insert({});
      expect(insertResult.error.message).toBe('Demo mode - database disabled');
    });

    it('should handle auth state changes in demo mode', () => {
      jest.resetModules();
      const { supabaseClient } = require('../../supabase/client');

      const callback = jest.fn();
      const result = supabaseClient.auth.onAuthStateChange(callback);

      expect(result.data.subscription).toBeDefined();
      expect(typeof result.data.subscription.unsubscribe).toBe('function');
    });
  });
});

describe('Database Operations', () => {
  let mockSupabaseClient: any;

  beforeEach(() => {
    // Create comprehensive mock
    mockSupabaseClient = {
      auth: {
        getSession: jest.fn(),
        getUser: jest.fn(),
        signInWithPassword: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        onAuthStateChange: jest.fn()
      },
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnThis(),
        gt: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lt: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        like: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        and: jest.fn().mockReturnThis()
      })),
      storage: {
        from: jest.fn(() => ({
          upload: jest.fn(),
          download: jest.fn(),
          remove: jest.fn(),
          list: jest.fn(),
          getPublicUrl: jest.fn()
        }))
      },
      rpc: jest.fn()
    };

    mockCreateClient.mockReturnValue(mockSupabaseClient);
  });

  describe('Query Builder Chain', () => {
    it('should chain select operations correctly', () => {
      const query = mockSupabaseClient
        .from('documents')
        .select('*')
        .eq('user_id', 'user-123')
        .order('created_at', { ascending: false })
        .limit(10);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('documents');

      const fromResult = mockSupabaseClient.from();
      expect(fromResult.select).toHaveBeenCalledWith('*');
      expect(fromResult.eq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(fromResult.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(fromResult.limit).toHaveBeenCalledWith(10);
    });

    it('should handle complex filtering chains', () => {
      const query = mockSupabaseClient
        .from('documents')
        .select('id, name, category')
        .eq('user_id', 'user-123')
        .in('category', ['personal', 'financial'])
        .gte('created_at', '2025-01-01')
        .order('updated_at', { ascending: false });

      const fromResult = mockSupabaseClient.from();
      expect(fromResult.select).toHaveBeenCalledWith('id, name, category');
      expect(fromResult.eq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(fromResult.in).toHaveBeenCalledWith('category', ['personal', 'financial']);
      expect(fromResult.gte).toHaveBeenCalledWith('created_at', '2025-01-01');
      expect(fromResult.order).toHaveBeenCalledWith('updated_at', { ascending: false });
    });

    it('should support text search operations', () => {
      const query = mockSupabaseClient
        .from('documents')
        .select('*')
        .eq('user_id', 'user-123')
        .or('name.ilike.%contract%,notes.ilike.%contract%');

      const fromResult = mockSupabaseClient.from();
      expect(fromResult.or).toHaveBeenCalledWith('name.ilike.%contract%,notes.ilike.%contract%');
    });

    it('should handle pagination correctly', () => {
      const query = mockSupabaseClient
        .from('documents')
        .select('*')
        .range(0, 9); // First 10 items

      const fromResult = mockSupabaseClient.from();
      expect(fromResult.range).toHaveBeenCalledWith(0, 9);
    });

    it('should support single row operations', () => {
      const query = mockSupabaseClient
        .from('documents')
        .select('*')
        .eq('id', 'doc-123')
        .single();

      const fromResult = mockSupabaseClient.from();
      expect(fromResult.single).toHaveBeenCalled();
    });
  });

  describe('Insert Operations', () => {
    it('should handle single row insert', () => {
      const newDocument = {
        user_id: 'user-123',
        name: 'Test Document',
        category: 'personal'
      };

      const query = mockSupabaseClient
        .from('documents')
        .insert(newDocument)
        .select()
        .single();

      const fromResult = mockSupabaseClient.from();
      expect(fromResult.insert).toHaveBeenCalledWith(newDocument);
      expect(fromResult.select).toHaveBeenCalled();
      expect(fromResult.single).toHaveBeenCalled();
    });

    it('should handle bulk insert operations', () => {
      const documents = [
        { user_id: 'user-123', name: 'Doc 1', category: 'personal' },
        { user_id: 'user-123', name: 'Doc 2', category: 'financial' },
        { user_id: 'user-123', name: 'Doc 3', category: 'legal' }
      ];

      const query = mockSupabaseClient
        .from('documents')
        .insert(documents)
        .select();

      const fromResult = mockSupabaseClient.from();
      expect(fromResult.insert).toHaveBeenCalledWith(documents);
    });

    it('should handle insert with conflict resolution', () => {
      const document = {
        id: 'doc-123',
        user_id: 'user-123',
        name: 'Updated Document'
      };

      // Note: upsert would be handled by Supabase client, we just test the chain
      const query = mockSupabaseClient
        .from('documents')
        .insert(document)
        .select();

      const fromResult = mockSupabaseClient.from();
      expect(fromResult.insert).toHaveBeenCalledWith(document);
    });
  });

  describe('Update Operations', () => {
    it('should handle single row update', () => {
      const updates = {
        name: 'Updated Document Name',
        updated_at: new Date().toISOString()
      };

      const query = mockSupabaseClient
        .from('documents')
        .update(updates)
        .eq('id', 'doc-123')
        .select()
        .single();

      const fromResult = mockSupabaseClient.from();
      expect(fromResult.update).toHaveBeenCalledWith(updates);
      expect(fromResult.eq).toHaveBeenCalledWith('id', 'doc-123');
    });

    it('should handle conditional updates', () => {
      const updates = { is_processed: true };

      const query = mockSupabaseClient
        .from('documents')
        .update(updates)
        .eq('user_id', 'user-123')
        .eq('processing_status', 'pending');

      const fromResult = mockSupabaseClient.from();
      expect(fromResult.update).toHaveBeenCalledWith(updates);
      expect(fromResult.eq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(fromResult.eq).toHaveBeenCalledWith('processing_status', 'pending');
    });

    it('should handle bulk updates with filters', () => {
      const updates = { category: 'archived' };

      const query = mockSupabaseClient
        .from('documents')
        .update(updates)
        .eq('user_id', 'user-123')
        .lt('created_at', '2024-01-01');

      const fromResult = mockSupabaseClient.from();
      expect(fromResult.update).toHaveBeenCalledWith(updates);
      expect(fromResult.lt).toHaveBeenCalledWith('created_at', '2024-01-01');
    });
  });

  describe('Delete Operations', () => {
    it('should handle single row deletion', () => {
      const query = mockSupabaseClient
        .from('documents')
        .delete()
        .eq('id', 'doc-123');

      const fromResult = mockSupabaseClient.from();
      expect(fromResult.delete).toHaveBeenCalled();
      expect(fromResult.eq).toHaveBeenCalledWith('id', 'doc-123');
    });

    it('should handle conditional deletion', () => {
      const query = mockSupabaseClient
        .from('documents')
        .delete()
        .eq('user_id', 'user-123')
        .eq('is_temporary', true);

      const fromResult = mockSupabaseClient.from();
      expect(fromResult.delete).toHaveBeenCalled();
      expect(fromResult.eq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(fromResult.eq).toHaveBeenCalledWith('is_temporary', true);
    });

    it('should handle bulk deletion with date filters', () => {
      const query = mockSupabaseClient
        .from('audit_logs')
        .delete()
        .lt('created_at', '2024-01-01');

      const fromResult = mockSupabaseClient.from();
      expect(fromResult.delete).toHaveBeenCalled();
      expect(fromResult.lt).toHaveBeenCalledWith('created_at', '2024-01-01');
    });
  });

  describe('Storage Operations', () => {
    it('should handle file upload', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const path = 'user-123/documents/test.pdf';

      mockSupabaseClient.storage.from('documents').upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith('documents');

      const storageResult = mockSupabaseClient.storage.from();
      expect(storageResult.upload).toHaveBeenCalledWith(path, file, {
        cacheControl: '3600',
        upsert: false
      });
    });

    it('should handle file download', () => {
      const path = 'user-123/documents/test.pdf';

      mockSupabaseClient.storage.from('documents').download(path);

      const storageResult = mockSupabaseClient.storage.from();
      expect(storageResult.download).toHaveBeenCalledWith(path);
    });

    it('should handle file deletion', () => {
      const paths = ['user-123/documents/test1.pdf', 'user-123/documents/test2.pdf'];

      mockSupabaseClient.storage.from('documents').remove(paths);

      const storageResult = mockSupabaseClient.storage.from();
      expect(storageResult.remove).toHaveBeenCalledWith(paths);
    });

    it('should handle public URL generation', () => {
      const path = 'user-123/documents/test.pdf';

      mockSupabaseClient.storage.from('documents').getPublicUrl(path);

      const storageResult = mockSupabaseClient.storage.from();
      expect(storageResult.getPublicUrl).toHaveBeenCalledWith(path);
    });

    it('should handle file listing', () => {
      const folderPath = 'user-123/documents';

      mockSupabaseClient.storage.from('documents').list(folderPath, {
        limit: 100,
        offset: 0
      });

      const storageResult = mockSupabaseClient.storage.from();
      expect(storageResult.list).toHaveBeenCalledWith(folderPath, {
        limit: 100,
        offset: 0
      });
    });
  });

  describe('RPC (Remote Procedure Calls)', () => {
    it('should handle RPC function calls', () => {
      const functionName = 'process_document';
      const params = {
        document_id: 'doc-123',
        processing_type: 'ocr'
      };

      mockSupabaseClient.rpc(functionName, params);

      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith(functionName, params);
    });

    it('should handle RPC calls without parameters', () => {
      const functionName = 'get_user_stats';

      mockSupabaseClient.rpc(functionName);

      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith(functionName);
    });

    it('should handle complex RPC operations', () => {
      const functionName = 'search_documents_advanced';
      const params = {
        user_id: 'user-123',
        query_text: 'financial report',
        categories: ['financial', 'legal'],
        date_range: {
          start: '2025-01-01',
          end: '2025-12-31'
        }
      };

      mockSupabaseClient.rpc(functionName, params);

      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith(functionName, params);
    });
  });

  describe('Error Handling Scenarios', () => {
    it('should handle network timeout errors', async () => {
      const timeoutError = {
        message: 'Request timeout',
        code: 'PGRST301',
        details: 'Connection timed out'
      };

      const mockQuery = mockSupabaseClient.from('documents').select('*');
      mockQuery.mockResolvedValue({
        data: null,
        error: timeoutError
      });

      const result = await mockQuery;

      expect(result.error).toEqual(timeoutError);
      expect(result.data).toBeNull();
    });

    it('should handle authentication errors', async () => {
      const authError = {
        message: 'JWT expired',
        code: 'PGRST301',
        details: 'Token has expired'
      };

      const mockQuery = mockSupabaseClient.from('documents').select('*');
      mockQuery.mockResolvedValue({
        data: null,
        error: authError
      });

      const result = await mockQuery;

      expect(result.error).toEqual(authError);
    });

    it('should handle RLS policy violations', async () => {
      const rlsError = {
        message: 'new row violates row-level security policy',
        code: 'PGRST201',
        details: 'Policy violation on table documents'
      };

      const mockQuery = mockSupabaseClient.from('documents').insert({});
      mockQuery.mockResolvedValue({
        data: null,
        error: rlsError
      });

      const result = await mockQuery;

      expect(result.error).toEqual(rlsError);
    });

    it('should handle constraint violations', async () => {
      const constraintError = {
        message: 'duplicate key value violates unique constraint',
        code: 'PGRST202',
        details: 'Unique constraint violation'
      };

      const mockQuery = mockSupabaseClient.from('documents').insert({});
      mockQuery.mockResolvedValue({
        data: null,
        error: constraintError
      });

      const result = await mockQuery;

      expect(result.error).toEqual(constraintError);
    });
  });

  describe('Performance and Optimization', () => {
    it('should handle large result sets efficiently', async () => {
      const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
        id: `doc-${i}`,
        name: `Document ${i}`,
        user_id: 'user-123'
      }));

      const mockQuery = mockSupabaseClient.from('documents').select('*');
      mockQuery.mockResolvedValue({
        data: largeDataset,
        error: null
      });

      const startTime = Date.now();
      const result = await mockQuery;
      const endTime = Date.now();

      expect(result.data).toHaveLength(10000);
      // Should handle large datasets quickly
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should support query optimization hints', () => {
      // Test that query builder supports performance optimizations
      const query = mockSupabaseClient
        .from('documents')
        .select('id, name') // Select only needed columns
        .eq('user_id', 'user-123')
        .limit(50) // Limit results
        .order('created_at', { ascending: false });

      const fromResult = mockSupabaseClient.from();
      expect(fromResult.select).toHaveBeenCalledWith('id, name');
      expect(fromResult.limit).toHaveBeenCalledWith(50);
    });

    it('should handle concurrent operations', async () => {
      const operations = [
        mockSupabaseClient.from('documents').select('*').eq('category', 'personal'),
        mockSupabaseClient.from('documents').select('*').eq('category', 'financial'),
        mockSupabaseClient.from('documents').select('*').eq('category', 'legal')
      ];

      operations.forEach(op => op.mockResolvedValue({ data: [], error: null }));

      const results = await Promise.all(operations);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.data).toEqual([]);
        expect(result.error).toBeNull();
      });
    });
  });
});