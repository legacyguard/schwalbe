import type {
  ApiClientInterface,
  CreateLegacyItemParams,
  DocumentUploadRequest,
  GetDocumentsParams,
  GetGuardiansParams,
  WillData,
} from './types/api';

import {
  LegacyGuardApiError,
  validateRequired,
  validateTypes,
  validators,
  withErrorHandling,
  withRetry,
} from './utils/api-error-handler';

// Import Supabase types for strong typing
import type {
  Document,
  DocumentUpdate,
  Guardian,
  GuardianInsert,
  GuardianUpdate,
  Json,
  LegacyItem,
  LegacyItemUpdate,
  LegacyMilestone,
  Profile,
  ProfileUpdate,
  QuickInsight,
} from './types/supabase';

/**
 * Document Service - Handles all document-related API operations
 * Provides comprehensive document management with validation and error handling
 */
export class DocumentService {
  constructor(private apiClient: ApiClientInterface) {}

  /**
   * Upload a new document with validation and error handling
   */
  async upload(request: DocumentUploadRequest): Promise<Document> {
    return withErrorHandling(async () => {
      // Validate required fields
      if (!request.file) {
        throw new LegacyGuardApiError(400, 'File is required');
      }

      const fileData = request.file as unknown as Record<string, unknown>;
      validateRequired(fileData, ['base64', 'mimeType', 'fileName']);

      // Validate data types
      validateTypes(fileData, {
        base64: validators.isString,
        mimeType: validators.isString,
        fileName: validators.isString,
      });

      // Additional validation
      if (!request.file.base64.startsWith('data:')) {
        throw new LegacyGuardApiError(
          400,
          'Invalid base64 format - must include data URL prefix'
        );
      }

      const response = await withRetry(
        () => this.apiClient.uploadFile('/api/analyze-document', request.file),
        3,
        1000,
        'document upload'
      );

      const responseData = response as { document?: Document };
      if (!responseData.document) {
        throw new LegacyGuardApiError(
          500,
          'Document upload succeeded but no document was returned'
        );
      }

      return responseData.document;
    }, 'Document upload');
  }

  /**
   * Get all user documents with optional filtering
   */
  async getAll(params: GetDocumentsParams = {}): Promise<Document[]> {
    return withErrorHandling(async () => {
      // Validate parameters
      if (
        params.limit !== undefined &&
        (!validators.isNumber(params.limit) || params.limit <= 0)
      ) {
        throw new LegacyGuardApiError(400, 'Limit must be a positive number');
      }
      if (
        params.offset !== undefined &&
        (!validators.isNumber(params.offset) || params.offset < 0)
      ) {
        throw new LegacyGuardApiError(
          400,
          'Offset must be a non-negative number'
        );
      }

      const queryParams = new URLSearchParams();
      if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
      if (params.offset !== undefined) queryParams.append('offset', params.offset.toString());
      if (params.documentType)
        queryParams.append('document_type', params.documentType);
      if (params.category) queryParams.append('category', params.category);

      const endpoint = `/api/documents${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await this.apiClient.get<{ documents: Document[] }>(
        endpoint
      );

      if (!response.documents || !Array.isArray(response.documents)) {
        throw new LegacyGuardApiError(
          500,
          'Invalid response format - documents array expected'
        );
      }

      return response.documents;
    }, 'Get documents');
  }

  /**
   * Get a single document by ID
   */
  async getById(id: string): Promise<Document> {
    return withErrorHandling(async () => {
      validateRequired({ id }, ['id']);
      validateTypes({ id }, { id: validators.isString });

      if (!validators.isUuid(id)) {
        throw new LegacyGuardApiError(400, 'Document ID must be a valid UUID');
      }

      const response = await this.apiClient.get<{ document: Document }>(
        `/api/documents/${id}`
      );

      if (!response.document) {
        throw new LegacyGuardApiError(404, `Document with ID ${id} not found`);
      }

      return response.document;
    }, 'Get document by ID');
  }

  /**
   * Update document metadata
   */
  async update(id: string, data: Partial<DocumentUpdate>): Promise<Document> {
    return withErrorHandling(async () => {
      validateRequired({ id }, ['id']);
      validateTypes({ id }, { id: validators.isString });

      if (!validators.isUuid(id)) {
        throw new LegacyGuardApiError(400, 'Document ID must be a valid UUID');
      }

      if (!data || Object.keys(data).length === 0) {
        throw new LegacyGuardApiError(400, 'Update data cannot be empty');
      }

      // Validate specific fields if present
      if (
        data.file_name !== undefined &&
        !validators.isString(data.file_name)
      ) {
        throw new LegacyGuardApiError(400, 'File name must be a string');
      }
      if (
        data.is_important !== undefined &&
        !validators.isBoolean(data.is_important)
      ) {
        throw new LegacyGuardApiError(400, 'is_important must be a boolean');
      }

      const response = await this.apiClient.put<{ document: Document }>(
        `/api/documents/${id}`,
        data
      );

      if (!response.document) {
        throw new LegacyGuardApiError(
          500,
          'Document update succeeded but no document was returned'
        );
      }

      return response.document;
    }, 'Update document');
  }

  /**
   * Delete a document
   */
  async delete(id: string): Promise<void> {
    return withErrorHandling(async () => {
      validateRequired({ id }, ['id']);
      validateTypes({ id }, { id: validators.isString });

      if (!validators.isUuid(id)) {
        throw new LegacyGuardApiError(400, 'Document ID must be a valid UUID');
      }

      await this.apiClient.delete(`/api/documents/${id}`);
    }, 'Delete document');
  }

  /**
   * Get documents by category
   */
  async getByCategory(category: string): Promise<Document[]> {
    return withErrorHandling(async () => {
      validateRequired({ category }, ['category']);
      validateTypes({ category }, { category: validators.isString });

      return this.getAll({ category });
    }, 'Get documents by category');
  }

  /**
   * Get documents by type
   */
  async getByType(documentType: string): Promise<Document[]> {
    return withErrorHandling(async () => {
      validateRequired({ documentType }, ['documentType']);
      validateTypes({ documentType }, { documentType: validators.isString });

      return this.getAll({ documentType });
    }, 'Get documents by type');
  }

  /**
   * Search documents by text
   */
  async search(query: string): Promise<Document[]> {
    return withErrorHandling(async () => {
      validateRequired({ query }, ['query']);
      validateTypes({ query }, { query: validators.isString });

      if (query.trim().length < 2) {
        throw new LegacyGuardApiError(
          400,
          'Search query must be at least 2 characters long'
        );
      }

      const response = await this.apiClient.get<{ documents: Document[] }>(
        `/api/documents/search?q=${encodeURIComponent(query)}`
      );

      if (!response.documents || !Array.isArray(response.documents)) {
        throw new LegacyGuardApiError(
          500,
          'Invalid search response format - documents array expected'
        );
      }

      return response.documents;
    }, 'Search documents');
  }
}

/**
 * Guardian Service - Handles trusted circle/guardian operations
 */
export class GuardianService {
  constructor(private apiClient: ApiClientInterface) {}

  /**
   * Get all guardians
   */
  async getAll(params: GetGuardiansParams = {}): Promise<Guardian[]> {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());
    if (params.activeOnly) queryParams.append('active_only', 'true');

    const endpoint = `/api/guardians${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await this.apiClient.get<{ guardians: Guardian[] }>(
      endpoint
    );
    return response.guardians;
  }

  /**
   * Create a new guardian
   */
  async create(data: GuardianInsert): Promise<Guardian> {
    const response = await this.apiClient.post<{ guardian: Guardian }>(
      '/api/guardians',
      data
    );
    return response.guardian;
  }

  /**
   * Update an existing guardian
   */
  async update(id: string, data: Partial<GuardianUpdate>): Promise<Guardian> {
    const response = await this.apiClient.put<{ guardian: Guardian }>(
      `/api/guardians/${id}`,
      data
    );
    return response.guardian;
  }

  /**
   * Delete a guardian
   */
  async delete(id: string): Promise<void> {
    await this.apiClient.delete(`/api/guardians/${id}`);
  }

  /**
   * Get guardian by ID
   */
  async getById(id: string): Promise<Guardian> {
    const response = await this.apiClient.get<{ guardian: Guardian }>(
      `/api/guardians/${id}`
    );
    return response.guardian;
  }

  /**
   * Activate/deactivate guardian
   */
  async setActive(id: string, isActive: boolean): Promise<Guardian> {
    return this.update(id, { is_active: isActive });
  }

  /**
   * Get active guardians only
   */
  async getActive(): Promise<Guardian[]> {
    return this.getAll({ activeOnly: true });
  }
}

/**
 * Profile Service - Handles user profile operations
 */
export class ProfileService {
  constructor(private apiClient: ApiClientInterface) {}

  /**
   * Get current user profile
   */
  async get(): Promise<Profile> {
    const response = await this.apiClient.get<{ profile: Profile }>(
      '/api/user/profile'
    );
    return response.profile;
  }

  /**
   * Update user profile
   */
  async update(data: Partial<ProfileUpdate>): Promise<Profile> {
    const response = await this.apiClient.put<{ profile: Profile }>(
      '/api/user/profile',
      data
    );
    return response.profile;
  }

  /**
   * Update avatar
   */
  async updateAvatar(file: {
    base64: string;
    fileName: string;
    mimeType: string;
  }): Promise<Profile> {
    const response = await this.apiClient.uploadFile('/api/user/avatar', file);
    const responseData = response as { profile: Profile };
    return responseData.profile;
  }

  /**
   * Update emergency contacts
   */
  async updateEmergencyContacts(contacts: unknown[]): Promise<Profile> {
    return this.update({ emergency_contacts: contacts as unknown as Json });
  }

  /**
   * Update preferences
   */
  async updatePreferences(preferences: Record<string, unknown>): Promise<Profile> {
    return this.update({ preferences: preferences as unknown as Json });
  }
}

/**
 * Will Service - Handles will/testament operations
 */
export class WillService {
  constructor(private apiClient: ApiClientInterface) {}

  /**
   * Get current user's will
   */
  async get(): Promise<WillData> {
    const response = await this.apiClient.get<{ will: WillData }>('/api/will');
    return response.will;
  }

  /**
   * Create or update will
   */
  async createOrUpdate(data: WillData): Promise<WillData> {
    const response = await this.apiClient.put<{ will: WillData }>(
      '/api/will',
      data
    );
    return response.will;
  }

  /**
   * Add beneficiary
   */
  async addBeneficiary(beneficiary: {
    name: string;
    percentage: number;
    relationship: string;
  }): Promise<WillData> {
    const currentWill = await this.get();
    const beneficiaries = currentWill.beneficiaries || [];
    beneficiaries.push(beneficiary);
    return this.createOrUpdate({ ...currentWill, beneficiaries });
  }

  /**
   * Remove beneficiary
   */
  async removeBeneficiary(beneficiaryName: string): Promise<WillData> {
    const currentWill = await this.get();
    const beneficiaries = (currentWill.beneficiaries || []).filter(
      b => b.name !== beneficiaryName
    );
    return this.createOrUpdate({ ...currentWill, beneficiaries });
  }

  /**
   * Set executor
   */
  async setExecutor(executor: {
    email: string;
    name: string;
    phone?: string;
  }): Promise<WillData> {
    const currentWill = await this.get();
    return this.createOrUpdate({ ...currentWill, executor });
  }
}

/**
 * Legacy Items Service - Handles legacy planning items
 */
export class LegacyItemService {
  constructor(private apiClient: ApiClientInterface) {}

  /**
   * Get all legacy items
   */
  async getAll(): Promise<LegacyItem[]> {
    const response = await this.apiClient.get<{ items: LegacyItem[] }>(
      '/api/legacy-items'
    );
    return response.items;
  }

  /**
   * Create new legacy item
   */
  async create(data: CreateLegacyItemParams): Promise<LegacyItem> {
    const response = await this.apiClient.post<{ item: LegacyItem }>(
      '/api/legacy-items',
      data
    );
    return response.item;
  }

  /**
   * Update legacy item
   */
  async update(
    id: string,
    data: Partial<LegacyItemUpdate>
  ): Promise<LegacyItem> {
    const response = await this.apiClient.put<{ item: LegacyItem }>(
      `/api/legacy-items/${id}`,
      data
    );
    return response.item;
  }

  /**
   * Delete legacy item
   */
  async delete(id: string): Promise<void> {
    await this.apiClient.delete(`/api/legacy-items/${id}`);
  }

  /**
   * Get items by category
   */
  async getByCategory(category: LegacyItem['category']): Promise<LegacyItem[]> {
    const response = await this.apiClient.get<{ items: LegacyItem[] }>(
      `/api/legacy-items?category=${category}`
    );
    return response.items;
  }

  /**
   * Get items by status
   */
  async getByStatus(status: LegacyItem['status']): Promise<LegacyItem[]> {
    const response = await this.apiClient.get<{ items: LegacyItem[] }>(
      `/api/legacy-items?status=${status}`
    );
    return response.items;
  }

  /**
   * Mark item as completed
   */
  async markCompleted(id: string): Promise<LegacyItem> {
    return this.update(id, { status: 'completed' });
  }
}

/**
 * Analytics Service - Handles insights and analytics
 */
export class AnalyticsService {
  constructor(private apiClient: ApiClientInterface) {}

  /**
   * Get quick insights
   */
  async getInsights(): Promise<QuickInsight[]> {
    const response = await this.apiClient.get<{ insights: QuickInsight[] }>(
      '/api/analytics/insights'
    );
    return response.insights;
  }

  /**
   * Get legacy milestones
   */
  async getMilestones(): Promise<LegacyMilestone[]> {
    const response = await this.apiClient.get<{
      milestones: LegacyMilestone[];
    }>('/api/analytics/milestones');
    return response.milestones;
  }

  /**
   * Get protection score
   */
  async getProtectionScore(): Promise<{ score: number; trends: unknown }> {
    const response = await this.apiClient.get<{
      score: number;
      trends: unknown;
    }>('/api/analytics/protection-score');
    return response;
  }

  /**
   * Get completion percentage
   */
  async getCompletionPercentage(): Promise<{
    breakdown: unknown;
    percentage: number;
  }> {
    const response = await this.apiClient.get<{
      breakdown: unknown;
      percentage: number;
    }>('/api/analytics/completion');
    return response;
  }
}

/**
 * Main LegacyGuard API class - Combines all services
 */
export class LegacyGuardAPI {
  public documents: DocumentService;
  public guardians: GuardianService;
  public profile: ProfileService;
  public will: WillService;
  public legacyItems: LegacyItemService;
  public analytics: AnalyticsService;

  constructor(apiClient: ApiClientInterface) {
    this.documents = new DocumentService(apiClient);
    this.guardians = new GuardianService(apiClient);
    this.profile = new ProfileService(apiClient);
    this.will = new WillService(apiClient);
    this.legacyItems = new LegacyItemService(apiClient);
    this.analytics = new AnalyticsService(apiClient);
  }
}

/**
 * Factory function to create API instance with client
 */
export function createLegacyGuardAPI(
  apiClient: ApiClientInterface
): LegacyGuardAPI {
  return new LegacyGuardAPI(apiClient);
}
