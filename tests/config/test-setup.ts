/**
 * Comprehensive Test Setup and Configuration
 * Configures all testing frameworks and utilities
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';

// Clean up after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});

// Mock environment variables for testing
beforeAll(() => {
  process.env.VITE_CLERK_PUBLISHABLE_KEY = 'pk_test_mock_key';
  process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
  process.env.VITE_SUPABASE_ANON_KEY = 'eyJtest_mock_key';
  process.env.VITE_APP_ENV = 'test';
  process.env.VITE_ENABLE_ENCRYPTION = 'false';
  process.env.VITE_ENABLE_RATE_LIMITING = 'false';
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock crypto API
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
    randomUUID: () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    },
    subtle: {
      encrypt: vi.fn(),
      decrypt: vi.fn(),
      generateKey: vi.fn(),
      importKey: vi.fn(),
      exportKey: vi.fn(),
      deriveKey: vi.fn(),
      deriveBits: vi.fn(),
      sign: vi.fn(),
      verify: vi.fn(),
      digest: vi.fn((_algorithm, _data) => {
        // Simple mock implementation
        return Promise.resolve(new ArrayBuffer(32));
      }),
    },
  },
});

// Mock fetch for API tests
global.fetch = vi.fn();

// Setup console mocks to reduce noise in tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = vi.fn((...args) => {
    // Only log actual errors, not expected ones
    if (!args[0]?.includes?.('Expected')) {
      originalError(...args);
    }
  });

  console.warn = vi.fn((...args) => {
    // Only log actual warnings, not expected ones
    if (!args[0]?.includes?.('Expected')) {
      originalWarn(...args);
    }
  });
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Custom test utilities
export const testUtils = {
  /**
   * Wait for async operations
   */
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Create mock user
   */
  createMockUser: (overrides = {}) => ({
    id: 'user_test_123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    imageUrl: 'https://example.com/avatar.jpg',
    ...overrides,
  }),

  /**
   * Create mock document
   */
  createMockDocument: (overrides = {}) => ({
    id: 'doc_test_123',
    name: 'Test Document',
    category: 'financial',
    filePath: '/test/document.pdf',
    fileSize: 1024,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }),

  /**
   * Mock API response
   */
  mockApiResponse: (data: Record<string, any>, status = 200) => {
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  },

  /**
   * Mock Supabase client
   */
  createMockSupabaseClient: () => ({
    auth: {
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        download: vi.fn(),
        remove: vi.fn(),
        list: vi.fn(),
      })),
    },
  }),

  /**
   * Mock Clerk
   */
  createMockClerk: () => ({
    user: testUtils.createMockUser(),
    isLoaded: true,
    isSignedIn: true,
    signIn: vi.fn(),
    signOut: vi.fn(),
    openSignIn: vi.fn(),
    openSignUp: vi.fn(),
  }),
};

// Export test utilities
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
export { testUtils };
