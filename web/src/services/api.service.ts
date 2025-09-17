
import { useAuth } from '@clerk/clerk-react';

// Base API URL - in production this will be your Vercel deployment URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic fetch wrapper with error handling
async function fetchApi<T = unknown>(
  endpoint: string,
  options: globalThis.RequestInit = {},
  token?: null | string
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: globalThis.HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add auth token if provided
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      if (!response.ok) {
        throw new ApiError(
          `HTTP error! status: ${response.status}`,
          response.status
        );
      }
      return response.text() as any;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error || `HTTP error! status: ${response.status}`,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new ApiError('Network error - please check your connection', 0);
    }

    throw new ApiError(
      error instanceof Error ? error.message : 'An unexpected error occurred'
    );
  }
}

// Key Management Service
export const keyManagementService = {
  // Generate new encryption keys
  async generateKeys(
    password: string,
    token: string
  ): Promise<{
    message: string;
    publicKey: string;
    success: boolean;
  }> {
    return fetchApi(
      '/keys-generate',
      {
        method: 'POST',
        body: JSON.stringify({ password }),
      },
      token
    );
  },

  // Retrieve encryption keys
  async retrieveKeys(
    password: string,
    token: string
  ): Promise<{
    message: string;
    privateKey: string;
    publicKey: string;
    success: boolean;
  }> {
    return fetchApi(
      '/keys-retrieve',
      {
        method: 'POST',
        body: JSON.stringify({ password }),
      },
      token
    );
  },

  // Get public key only (no password required)
  async getPublicKey(token: string): Promise<{
    metadata?: any;
    publicKey: string;
    success: boolean;
  }> {
    return fetchApi(
      '/keys-retrieve',
      {
        method: 'GET',
      },
      token
    );
  },

  // Rotate encryption keys
  async rotateKeys(
    currentPassword: string,
    newPassword: string | undefined,
    token: string
  ): Promise<{
    message: string;
    newPublicKey: string;
    success: boolean;
  }> {
    return fetchApi(
      '/keys-rotate',
      {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      },
      token
    );
  },

  // Check if key rotation is needed
  async checkRotationNeeded(token: string): Promise<{
    message: string;
    rotationNeeded: boolean;
    success: boolean;
  }> {
    return fetchApi(
      '/keys-rotate',
      {
        method: 'GET',
      },
      token
    );
  },

  // Check key status
  async checkKeyStatus(token: string): Promise<{
    hasKeys: boolean;
    isCompromised?: boolean;
    isLocked?: boolean;
    lockedUntil?: null | string;
  }> {
    return fetchApi(
      '/keys-status',
      {
        method: 'GET',
      },
      token
    );
  },
};

// Hook to use API services with authentication
export function useApiService() {
  const { getToken } = useAuth();

  // Wrapper to get token and call service
  const callWithAuth = async <T extends any[], R>(
    serviceFn: (...args: [...T, string]) => Promise<R>,
    ...args: T
  ): Promise<R> => {
    try {
      const token = await getToken();
      if (!token) {
        throw new ApiError('Authentication required', 401);
      }
      return serviceFn(...args, token);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    }
  };

  return {
    keyManagement: {
      generateKeys: (password: string) =>
        callWithAuth(keyManagementService.generateKeys, password),
      retrieveKeys: (password: string) =>
        callWithAuth(keyManagementService.retrieveKeys, password),
      getPublicKey: () => callWithAuth(keyManagementService.getPublicKey),
      rotateKeys: (currentPassword: string, newPassword?: string) =>
        callWithAuth(
          keyManagementService.rotateKeys,
          currentPassword,
          newPassword
        ),
      checkRotationNeeded: () =>
        callWithAuth(keyManagementService.checkRotationNeeded),
      checkKeyStatus: () => callWithAuth(keyManagementService.checkKeyStatus),
    },
  };
}

// Export types for use in components
export type KeyGenerationResponse = Awaited<
  ReturnType<typeof keyManagementService.generateKeys>
>;
export type KeyRetrievalResponse = Awaited<
  ReturnType<typeof keyManagementService.retrieveKeys>
>;
export type PublicKeyResponse = Awaited<
  ReturnType<typeof keyManagementService.getPublicKey>
>;
export type KeyRotationResponse = Awaited<
  ReturnType<typeof keyManagementService.rotateKeys>
>;
export type KeyStatusResponse = Awaited<
  ReturnType<typeof keyManagementService.checkKeyStatus>
>;
