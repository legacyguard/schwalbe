
/**
 * API Adapter for Web Components
 * Provides a bridge between legacy API calls and the new centralized API services
 */

import {
  type AnalyticsService,
  type ApiClientInterface,
  createLegacyGuardAPI,
  type DocumentService,
  type GuardianService,
  type LegacyItemService,
  type ProfileService,
  type WillService,
} from '@legacyguard/logic';
import { createClient } from '@supabase/supabase-js';

// Environment configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const API_BASE_URL = import.meta.env['VITE_API_URL'] || '/api';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Web API Client implementation
 * Implements the ApiClientInterface for web environment
 */
class WebApiClient implements ApiClientInterface {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get authentication token from Supabase
   */
  private async getAuthToken(): Promise<null | string> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token || null;
  }

  /**
   * Build headers for authenticated requests
   */
  private async buildHeaders(): Promise<HeadersInit> {
    const token = await this.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Handle response and extract data
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.text().catch(() => 'Request failed');
      throw new Error(`API Error (${response.status}): ${error}`);
    }

    try {
      return await response.json();
    } catch {
      // Return empty object for responses without body
      return {} as T;
    }
  }

  /**
   * GET request
   */
  async get<T = unknown>(endpoint: string): Promise<T> {
    const headers = await this.buildHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });
    return this.handleResponse<T>(response);
  }

  /**
   * POST request
   */
  async post<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    const headers = await this.buildHeaders();
    const requestInit: RequestInit = {
      method: 'POST',
      headers,
      credentials: 'include',
    };

    if (data) {
      requestInit.body = JSON.stringify(data);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, requestInit);
    return this.handleResponse<T>(response);
  }

  /**
   * PUT request
   */
  async put<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    const headers = await this.buildHeaders();
    const requestInit: RequestInit = {
      method: 'PUT',
      headers,
      credentials: 'include',
    };

    if (data) {
      requestInit.body = JSON.stringify(data);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, requestInit);
    return this.handleResponse<T>(response);
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(endpoint: string): Promise<T> {
    const headers = await this.buildHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });
    return this.handleResponse<T>(response);
  }

  /**
   * Upload file
   */
  async uploadFile(
    endpoint: string,
    file: {
      base64: string;
      fileName: string;
      mimeType: string;
    }
  ): Promise<unknown> {
    const headers = await this.buildHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        image: file.base64,
        mimeType: file.mimeType,
        fileName: file.fileName,
      }),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }
}

// Create singleton instance of the API client
const webApiClient = new WebApiClient();

// Create and export the centralized API instance
export const api = createLegacyGuardAPI(webApiClient);

// Export individual services for direct use
export const documentService = api.documents;
export const guardianService = api.guardians;
export const profileService = api.profile;
export const willService = api.will;
export const legacyItemService = api.legacyItems;
export const analyticsService = api.analytics;

/**
 * Legacy API wrapper for backward compatibility
 * Maps old API calls to new service methods
 */
export const legacyApi = {
  // Document operations
  uploadDocument: (file: {
    base64: string;
    fileName: string;
    mimeType: string;
  }) => documentService.upload({ file }),

  getDocuments: (params?: { limit?: number; offset?: number }) =>
    documentService.getAll(params),

  getDocument: (id: string) => documentService.getById(id),

  deleteDocument: (id: string) => documentService.delete(id),

  // User operations
  getUserProfile: () => profileService.get(),

  updateUserProfile: (data: any) => profileService.update(data),

  // Will operations
  getWill: () => willService.get(),

  updateWill: (data: any) => willService.createOrUpdate(data),

  // Guardian operations
  getGuardians: () => guardianService.getAll(),

  addGuardian: (data: any) => guardianService.create(data),

  updateGuardian: (id: string, data: any) => guardianService.update(id, data),

  deleteGuardian: (id: string) => guardianService.delete(id),
};

// Export types for use in components
export type {
  AnalyticsService,
  DocumentService,
  GuardianService,
  LegacyItemService,
  ProfileService,
  WillService,
};

// Export a hook for React components
export function useApi() {
  return {
    api,
    documents: documentService,
    guardians: guardianService,
    profile: profileService,
    will: willService,
    legacyItems: legacyItemService,
    analytics: analyticsService,
    legacy: legacyApi,
  };
}

/**
 * Error boundary for API calls
 */
export async function withApiErrorHandling<T>(
  operation: () => Promise<T>,
  errorMessage: string = 'API operation failed'
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error(`[API Error] ${errorMessage}:`, error);

    // You can add custom error handling here
    // For example, show a toast notification

    throw error;
  }
}
