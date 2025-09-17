// src/api/apiClient.ts

import { AuthenticationService } from '../services/AuthenticationService';

// Define response types (kept for potential future use)
interface _ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
}

// API configuration
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://api.legacyguard.com';

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Main API client class
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get authentication headers
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await AuthenticationService.getSupabaseToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorMessage = await response.text().catch(() => 'Request failed');
      throw new ApiError(response.status, errorMessage);
    }

    try {
      return await response.json();
    } catch {
      // Return empty object if response has no body
      return {} as T;
    }
  }

  /**
   * Make authenticated GET request
   */
  async get<T = unknown>(endpoint: string): Promise<T> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Make authenticated POST request
   */
  async post<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Make authenticated PUT request
   */
  async put<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Make authenticated DELETE request
   */
  async delete<T = unknown>(endpoint: string): Promise<T> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Upload file with authentication
   */
  async uploadFile(
    endpoint: string,
    file: {
      base64: string;
      fileName: string;
      mimeType: string;
    }
  ): Promise<unknown> {
    const token = await AuthenticationService.getSupabaseToken();

    if (!token) {
      throw new ApiError(401, 'Authentication required');
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        image: file.base64,
        mimeType: file.mimeType,
        fileName: file.fileName,
      }),
    });

    return this.handleResponse(response);
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export specific API methods for common operations
export const api = {
  // Document operations
  documents: {
    upload: (file: { base64: string; fileName: string; mimeType: string }) =>
      apiClient.uploadFile('/api/analyze-document', file),

    list: () => apiClient.get('/api/documents'),

    get: (id: string) => apiClient.get(`/api/documents/${id}`),

    delete: (id: string) => apiClient.delete(`/api/documents/${id}`),
  },

  // User operations
  user: {
    getProfile: () => apiClient.get('/api/user/profile'),

    updateProfile: (data: unknown) => apiClient.put('/api/user/profile', data),
  },

  // Will operations
  will: {
    create: (data: unknown) => apiClient.post('/api/will', data),

    get: () => apiClient.get('/api/will'),

    update: (data: unknown) => apiClient.put('/api/will', data),
  },
};
