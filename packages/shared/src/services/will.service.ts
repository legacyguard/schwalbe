/**
 * Will Generation Service
 * Core service for will creation, validation, and management
 * Integrates with WillEngine from @schwalbe/logic
 */

import type { WillInput, DraftResult, WillEngine } from '@schwalbe/logic/will/engine';
import type { Guardian } from '../types/guardian';
import type {
  BeneficiaryInfo,
  ExecutorInfo,
  GuardianshipInfo,
  WillUserData,
  AssetInfo,
  WillValidationResult,
  WillTemplate,
  WillJurisdictionConfig
} from '../types/will';
import { supabaseClient } from '../supabase/client';
import { logger } from '../lib/logger';

export interface CreateWillRequest {
  userData: WillUserData;
  template: WillTemplate;
  jurisdiction: 'CZ' | 'SK';
  language: 'cs' | 'sk' | 'en';
}

export interface SavedWill {
  id: string;
  user_id: string;
  title: string;
  content: string;
  jurisdiction: 'CZ' | 'SK';
  language: 'cs' | 'sk' | 'en';
  version: number;
  status: 'draft' | 'completed' | 'executed';
  validation_result: WillValidationResult;
  user_data: WillUserData;
  template_id: string;
  created_at: string;
  updated_at: string;
  executed_at?: string;
}

export class WillService {
  /**
   * Generate a new will based on user data
   */
  async generateWill(request: CreateWillRequest): Promise<DraftResult> {
    try {
      logger.info('Generating will', {
        userId: request.userData.personal.userId,
        metadata: {
          jurisdiction: request.jurisdiction,
          language: request.language
        }
      });

      // Convert user data to WillEngine input format
      const willInput: WillInput = this.convertToWillInput(request);

      // Import WillEngine dynamically to avoid circular dependencies
      const { WillEngine } = await import('@schwalbe/logic/will/engine');
      const willEngine = new WillEngine();

      // Generate the will
      const result = willEngine.generate(willInput);

      logger.info('Will generated successfully', {
        userId: request.userData.personal.userId,
        isValid: result.validation.isValid,
        errorCount: result.validation.errors.length,
        warningCount: result.validation.warnings.length
      });

      return result;
    } catch (error) {
      logger.error('Failed to generate will', {
        userId: request.userData.personal?.userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Save will to database
   */
  async saveWill(
    userId: string,
    willData: DraftResult,
    userData: WillUserData,
    templateId: string,
    title?: string
  ): Promise<SavedWill> {
    try {
      const { data, error } = await supabaseClient
        .from('wills')
        .insert({
          user_id: userId,
          title: title || `Will - ${new Date().toLocaleDateString()}`,
          content: willData.content,
          jurisdiction: willData.jurisdiction,
          language: willData.language,
          validation_result: willData.validation,
          user_data: userData,
          template_id: templateId,
          status: willData.validation.isValid ? 'completed' : 'draft',
          version: 1
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to save will: ${error.message}`);
      }

      logger.info('Will saved successfully', {
        userId,
        willId: data.id,
        status: data.status
      });

      return data;
    } catch (error) {
      logger.error('Failed to save will', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get user's wills
   */
  async getUserWills(userId: string): Promise<SavedWill[]> {
    try {
      const { data, error } = await supabaseClient
        .from('wills')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to get user wills: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      logger.error('Failed to get user wills', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get will by ID
   */
  async getWill(willId: string, userId: string): Promise<SavedWill | null> {
    try {
      const { data, error } = await supabaseClient
        .from('wills')
        .select('*')
        .eq('id', willId)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Failed to get will: ${error.message}`);
      }

      return data;
    } catch (error) {
      logger.error('Failed to get will', {
        willId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Update will
   */
  async updateWill(
    willId: string,
    userId: string,
    updates: Partial<SavedWill>
  ): Promise<SavedWill> {
    try {
      const { data, error } = await supabaseClient
        .from('wills')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', willId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update will: ${error.message}`);
      }

      logger.info('Will updated successfully', {
        willId,
        userId
      });

      return data;
    } catch (error) {
      logger.error('Failed to update will', {
        willId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Delete will
   */
  async deleteWill(willId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabaseClient
        .from('wills')
        .delete()
        .eq('id', willId)
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to delete will: ${error.message}`);
      }

      logger.info('Will deleted successfully', {
        willId,
        userId
      });
    } catch (error) {
      logger.error('Failed to delete will', {
        willId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Mark will as executed
   */
  async executeWill(willId: string, userId: string): Promise<SavedWill> {
    try {
      const { data, error } = await supabaseClient
        .from('wills')
        .update({
          status: 'executed',
          executed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', willId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to execute will: ${error.message}`);
      }

      logger.info('Will executed successfully', {
        willId,
        userId
      });

      return data;
    } catch (error) {
      logger.error('Failed to execute will', {
        willId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Convert user data to WillEngine input format
   */
  private convertToWillInput(request: CreateWillRequest): WillInput {
    const { userData, jurisdiction, language } = request;

    // Convert beneficiaries
    const beneficiaries = userData.beneficiaries?.map(b => ({
      id: b.id || crypto.randomUUID(),
      name: b.name,
      relationship: b.relationship
    })) || [];

    // Convert witnesses if any
    const witnesses = userData.witnesses?.map(w => ({
      id: w.id || crypto.randomUUID(),
      fullName: w.name,
      age: w.age
    })) || [];

    return {
      jurisdiction,
      language: language as 'en' | 'cs' | 'sk',
      form: 'typed', // Default to typed form
      testator: {
        id: userData.personal.userId || crypto.randomUUID(),
        fullName: userData.personal.fullName,
        address: userData.personal.address ?
          this.formatAddress(userData.personal.address) : undefined
      },
      beneficiaries,
      executorName: userData.executors?.[0]?.name,
      signatures: {
        testatorSigned: false, // Will be signed later
        witnessesSigned: false
      },
      witnesses
    };
  }

  /**
   * Format address from object to string
   */
  private formatAddress(address: any): string {
    if (typeof address === 'string') return address;

    const parts = [
      address.street,
      address.city,
      address.postalCode,
      address.country
    ].filter(Boolean);

    return parts.join(', ');
  }
}

// Export singleton instance
export const willService = new WillService();