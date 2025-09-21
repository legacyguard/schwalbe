
/**
 * Will API Service
 * Handles all database operations and API calls for will management
 */

import { supabase } from '../integrations/supabase/client';
import type {
  GeneratedWill,
  Jurisdiction,
  LanguageCode,
  WillTemplateType,
  WillUserData,
} from '../types/will-templates';
import { type Will } from '../types/will';
import { willGenerationService } from './willGenerationService';
import { willGuardianIntegration } from './willGuardianIntegration';

export class WillApiService {
  /**
   * Create a new will in database
   */
  async createWill(
    userData: WillUserData,
    jurisdiction: Jurisdiction,
    language: LanguageCode,
    willType: WillTemplateType
  ): Promise<string> {
    try {
      const userId = await this.getCurrentUserId();

      // Generate the will
      const generatedWill = await willGenerationService.generateWill({
        userId,
        jurisdiction,
        language,
        willType,
        userData,
        preferences: {
          includeOptionalClauses: true,
          detailLevel: 'detailed',
          languageStyle: 'formal',
          includeLegalExplanations: true,
          generateMultipleLanguages: false,
        },
      });

      // Prepare will data for database
      const willData = {
        user_id: userId,
        will_type: this.mapToDbWillType(willType),
        status: 'draft',
        jurisdiction,
        language,
        legal_framework: `${jurisdiction} Civil Code`,

        // Personal information stored in declarations
        declarations: [
          {
            id: 'identity',
            type: 'identity' as const,
            content: `I, ${userData.personal.fullName}, born on ${userData.personal.dateOfBirth}, residing at ${this.formatAddress(userData.personal.address)}`,
            is_mandatory: true,
            order: 1,
          },
        ],

        // Beneficiaries
        beneficiaries: userData.beneficiaries.map(b => ({
          id: b.id,
          type: this.mapBeneficiaryType(b.relationship),
          full_name: b.name,
          relationship: b.relationship,
          date_of_birth: b.dateOfBirth || '',
          contact_info: b.contactInfo,
          share_percentage:
            b.share.type === 'percentage' ? Number(b.share.value) : undefined,
          conditions: b.conditions || '',
        })),

        // Assets
        asset_distributions: userData.assets.map(asset => ({
          id: asset.id,
          asset_type: asset.type,
          description: asset.description,
          estimated_value: asset.value,
          currency: asset.currency || 'EUR',
          location: asset.location,
          beneficiary_ids: [], // Will be populated based on beneficiary assignments
          distribution_type: 'equal' as const,
          distribution_details: {},
        })),

        // Executors
        executor_appointments:
          userData.executors?.map(executor => ({
            id: executor.id,
            type: executor.type,
            full_name: executor.name,
            relationship: executor.relationship,
            contact_info: executor.contactInfo,
            professional: executor.isProfessional,
            compensation: executor.compensation,
            powers_granted: [],
          })) || [],

        // Guardianship
        guardianship_appointments:
          userData.guardians?.map(guardianship => ({
            id: guardianship.childId,
            child_name: '',
            child_date_of_birth: '',
            primary_guardian: {
              full_name: guardianship.primaryGuardian.name,
              relationship: guardianship.primaryGuardian.relationship,
              contact_info: guardianship.primaryGuardian.contactInfo,
            },
            alternate_guardian: guardianship.alternateGuardian
              ? {
                  full_name: guardianship.alternateGuardian.name,
                  relationship: guardianship.alternateGuardian.relationship,
                  contact_info: guardianship.alternateGuardian.contactInfo,
                }
              : undefined,
            special_instructions: guardianship.specialInstructions,
          })) || [],

        // Special instructions
        special_instructions: userData.specialInstructions.map(instruction => ({
          id: instruction.id,
          category: instruction.type,
          title: instruction.title,
          content: instruction.content,
          priority: instruction.priority,
        })),

        // AI data
        ai_suggestions: generatedWill.aiSuggestions.map(suggestion => ({
          id: suggestion.id,
          type:
            suggestion.type === 'optimization'
              ? 'improvement'
              : suggestion.type === 'legal_consideration'
                ? 'legal_requirement'
                : (suggestion.type as
                    | 'improvement'
                    | 'legal_requirement'
                    | 'missing'
                    | 'warning'),
          category: suggestion.category,
          title: suggestion.title,
          description: suggestion.description,
          suggested_action: suggestion.suggestedAction,
          priority: suggestion.priority,
          jurisdiction_specific: suggestion.isJurisdictionSpecific,
          created_at: new Date().toISOString(),
        })),

        validation_errors: generatedWill.validationResult.errors.map(error => ({
          field: error.field,
          message: error.message,
          severity: error.severity,
          legal_reference: error.legalReference,
        })),

        completeness_score: generatedWill.validationResult.completenessScore,
      };

      // Insert into database
      const { data, error } = await supabase
        .from('wills')
        .insert(willData)
        .select('id')
        .single();

      if (error) {
        console.error('Error creating will:', error);
        throw new Error(`Failed to create will: ${error.message}`);
      }

      // Store generated content separately (as it can be large)
      await this.saveWillContent(data.id, generatedWill);

      // Sync with guardians
      await willGuardianIntegration.syncBeneficiariesWithGuardians(
        userId,
        userData.beneficiaries
      );
      if (userData.executors) {
        await willGuardianIntegration.syncExecutorsWithGuardians(
          userId,
          userData.executors
        );
      }
      if (userData.guardians) {
        await willGuardianIntegration.syncChildGuardiansWithGuardians(
          userId,
          userData.guardians
        );
      }

      // Create guidance entry
      await willGuardianIntegration.createWillGuidanceEntry(userId, userData);

      return data.id;
    } catch (error) {
      console.error('Error in createWill:', error);
      throw error;
    }
  }

  /**
   * Get user's wills
   */
  async getUserWills(): Promise<Will[]> {
    try {
      const userId = await this.getCurrentUserId();

      const { data, error } = await supabase
        .from('wills')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching wills:', error);
        throw new Error(`Failed to fetch wills: ${error.message}`);
      }

      return (data || []).map(will => this.convertDbWillToWill(will));
    } catch (error) {
      console.error('Error in getUserWills:', error);
      throw error;
    }
  }

  /**
   * Get specific will by ID
   */
  async getWill(willId: string): Promise<null | Will> {
    try {
      const userId = await this.getCurrentUserId();

      const { data, error } = await supabase
        .from('wills')
        .select('*')
        .eq('id', willId)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        console.error('Error fetching will:', error);
        throw new Error(`Failed to fetch will: ${error.message}`);
      }

      return data ? this.convertDbWillToWill(data) : null;
    } catch (error) {
      console.error('Error in getWill:', error);
      throw error;
    }
  }

  /**
   * Update will
   */
  async updateWill(willId: string, updates: Partial<Will>): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();

      const { error } = await supabase
        .from('wills')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        } as Record<string, any>)
        .eq('id', willId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating will:', error);
        throw new Error(`Failed to update will: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in updateWill:', error);
      throw error;
    }
  }

  /**
   * Delete will
   */
  async deleteWill(willId: string): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();

      const { error } = await supabase
        .from('wills')
        .delete()
        .eq('id', willId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting will:', error);
        throw new Error(`Failed to delete will: ${error.message}`);
      }

      // Also delete stored content
      await this.deleteWillContent(willId);
    } catch (error) {
      console.error('Error in deleteWill:', error);
      throw error;
    }
  }

  /**
   * Generate and update will content
   */
  async regenerateWill(willId: string): Promise<GeneratedWill> {
    try {
      const will = await this.getWill(willId);
      if (!will) {
        throw new Error('Will not found');
      }

      // Convert database will back to userData format
      // const identityDeclaration = will.declarations?.find(
      //   d => d.type === 'identity'
      // );
      const userData: WillUserData = {
        personal: {
          fullName: 'Testator Name', // Extract from identity declaration if needed
          dateOfBirth: '1970-01-01',
          placeOfBirth: 'Unknown',
          citizenship: 'Unknown',
          address: {
            street: '',
            city: '',
            postalCode: '',
            country: '',
          },
          maritalStatus: 'single' as const,
        },
        family: {
          children: [],
        },
        beneficiaries: will.beneficiaries.map(b => {
          const beneficiary: any = {
            id: b.id,
            name: b.full_name,
            relationship: b.relationship,
            dateOfBirth: b.date_of_birth,
            share: {
              type: b.share_percentage ? 'percentage' : 'remainder',
              value: b.share_percentage || 0,
            },
            conditions: b.conditions || '',
            address: {
              street: '',
              city: '',
              postalCode: '',
              country: '',
            },
          };

          // Only add contactInfo if it exists and has valid data
          if (b.contact_info && (b.contact_info.email || b.contact_info.phone)) {
            beneficiary.contactInfo = {
              email: b.contact_info.email,
              phone: b.contact_info.phone,
            };
          }

          return beneficiary;
        }),
        assets: will.asset_distributions.map(a => {
          const assetTypeMap: Record<string, any> = {
            personal: 'personal_property',
            financial: 'bank_account',
            digital: 'digital_asset',
            real_estate: 'real_estate',
            business: 'business',
            vehicle: 'vehicle',
            investment: 'investment',
            other: 'other',
          };
          return {
            id: a.id,
            type: assetTypeMap[a.asset_type as string] || 'other',
            description: a.description,
            value: a.estimated_value || 0,
            currency: a.currency || 'EUR',
            location: a.location || '',
            ownershipPercentage: 100,
          } as any;
        }),
        executors: will.executor_appointments.map(e => {
          const executorTypeMap: Record<string, any> = {
            'co-executor': 'co_executor',
            'primary': 'primary',
            'alternate': 'alternate',
          };
          return {
            id: e.id,
            type: executorTypeMap[e.type as string] || 'primary',
            name: e.full_name,
            relationship: e.relationship,
            address: {
              street: '',
              city: '',
              postalCode: '',
              country: '',
            },
            contactInfo: e.contact_info,
            isProfessional: e.professional || false,
            compensation: e.compensation || '',
          } as any;
        }),
        guardians:
          will.guardianship_appointments?.map(g => ({
            childId: g.id,
            primaryGuardian: {
              id: 'primary',
              type: 'primary' as const,
              name: g.primary_guardian.full_name,
              relationship: g.primary_guardian.relationship,
              address: {
                street: '',
                city: '',
                postalCode: '',
                country: '',
              },
              contactInfo: g.primary_guardian.contact_info,
              isProfessional: false,
            },
            alternateGuardian: g.alternate_guardian
              ? {
                  id: 'alternate',
                  type: 'alternate' as const,
                  name: g.alternate_guardian.full_name,
                  relationship: g.alternate_guardian.relationship,
                  address: {
                    street: '',
                    city: '',
                    postalCode: '',
                    country: '',
                  },
                  contactInfo: g.alternate_guardian.contact_info,
                  isProfessional: false,
                }
              : null,
            specialInstructions: g.special_instructions || '',
          })) || [] as any,
        specialInstructions:
          will.special_instructions?.map(s => ({
            id: s.id,
            type:
              s.category === 'pets'
                ? 'pet_care'
                : s.category === 'business'
                  ? 'business_succession'
                  : s.category === 'debts'
                    ? 'other'
                    : s.category === 'taxes'
                      ? 'other'
                      : s.category === 'charity'
                        ? 'charitable_giving'
                        : s.category === 'other'
                          ? 'other'
                          : 'other',
            title: s.title,
            content: s.content,
            priority: s.priority,
          })) || [],
      };

      // Regenerate will
      const generatedWill = await willGenerationService.generateWill({
        userId: will.user_id,
        jurisdiction: will.jurisdiction as Jurisdiction,
        language: will.language as LanguageCode,
        willType: this.mapFromDbWillType(will.will_type),
        userData,
        preferences: {
          includeOptionalClauses: true,
          detailLevel: 'detailed',
          languageStyle: 'formal',
          includeLegalExplanations: true,
          generateMultipleLanguages: false,
        },
      });

      // Update database with new validation results
      await this.updateWill(willId, {
        validation_errors: generatedWill.validationResult.errors.map(error => ({
          field: error.field,
          message: error.message,
          severity: error.severity,
          legal_reference: error.legalReference || '',
        })),
        completeness_score: generatedWill.validationResult.completenessScore,
        ai_suggestions: generatedWill.aiSuggestions.map(suggestion => {
          const typeMap: Record<string, 'improvement' | 'legal_requirement' | 'missing' | 'warning'> = {
            legal_consideration: 'legal_requirement',
            missing: 'missing',
            optimization: 'improvement',
            warning: 'warning',
          };
          return {
            id: suggestion.id,
            type: typeMap[suggestion.type] || 'improvement',
            category: suggestion.category,
            title: suggestion.title,
            description: suggestion.description,
            suggested_action: suggestion.suggestedAction,
            priority: suggestion.priority,
            jurisdiction_specific: suggestion.isJurisdictionSpecific,
            created_at: new Date().toISOString(),
          };
        }),
      });

      // Save new content
      await this.saveWillContent(willId, generatedWill);

      return generatedWill;
    } catch (error) {
      console.error('Error in regenerateWill:', error);
      throw error;
    }
  }

  /**
   * Get will content (text, HTML, PDF)
   */
  async getWillContent(
    willId: string
  ): Promise<{ html: string; pdf?: ArrayBuffer; text: string }> {
    try {
      const { data, error } = await supabase.storage
        .from('user_documents')
        .download(`wills/${willId}/content.json`);

      if (error) {
        console.error('Error fetching will content:', error);
        throw new Error(`Failed to fetch will content: ${error.message}`);
      }

      const content = JSON.parse(await data.text());
      return content;
    } catch (error) {
      console.error('Error in getWillContent:', error);
      // Return empty content if not found
      return { text: '', html: '' };
    }
  }

  /**
   * Save will content to storage
   */
  private async saveWillContent(
    willId: string,
    generatedWill: GeneratedWill
  ): Promise<void> {
    try {
      const content = {
        text: generatedWill.content.text,
        html: generatedWill.content.html,
        metadata: generatedWill.metadata,
      };

      const { error } = await supabase.storage
        .from('user_documents')
        .upload(
          `wills/${willId}/content.json`,
          JSON.stringify(content, null, 2),
          {
            contentType: 'application/json',
            upsert: true,
          }
        );

      if (error) {
        console.error('Error saving will content:', error);
      }
    } catch (error) {
      console.error('Error in saveWillContent:', error);
    }
  }

  /**
   * Delete will content from storage
   */
  private async deleteWillContent(willId: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from('user_documents')
        .remove([`wills/${willId}/content.json`]);

      if (error) {
        console.error('Error deleting will content:', error);
      }
    } catch (error) {
      console.error('Error in deleteWillContent:', error);
    }
  }

  /**
   * Get current user ID from Clerk
   */
  private async getCurrentUserId(): Promise<string> {
    // This would integrate with your existing Clerk authentication
    // For now, we'll use a placeholder
    const user = await this.getCurrentUser();
    if (!user?.id) {
      throw new Error('User not authenticated');
    }
    return user.id;
  }

  /**
   * Get current user (placeholder for Clerk integration)
   */
  private async getCurrentUser(): Promise<null | { id: string }> {
    // This would integrate with your existing Clerk auth system
    // Return mock user for now
    return { id: 'user-123' };
  }

  /**
   * Utility methods for data mapping
   */
  private mapToDbWillType(
    willType: WillTemplateType
  ): 'detailed' | 'international' | 'simple' | 'trust' {
    const mapping: Record<
      WillTemplateType,
      'detailed' | 'international' | 'simple' | 'trust'
    > = {
      holographic: 'simple',
      allographic: 'detailed',
      witnessed: 'detailed',
      notarial: 'international',
    };
    return mapping[willType] || 'simple';
  }

  private mapFromDbWillType(dbType: string): WillTemplateType {
    const mapping: Record<string, WillTemplateType> = {
      simple: 'holographic',
      detailed: 'allographic',
      international: 'notarial',
      trust: 'notarial',
    };
    return mapping[dbType] || 'holographic';
  }

  private mapBeneficiaryType(
    relationship: string
  ): 'charitable' | 'contingent' | 'primary' | 'secondary' {
    const familyRelationships = ['spouse', 'child', 'parent'];
    const otherRelationships = ['sibling', 'friend'];

    if (familyRelationships.includes(relationship)) {
      return 'primary';
    } else if (otherRelationships.includes(relationship)) {
      return 'secondary';
    } else if (relationship === 'charity') {
      return 'charitable';
    }
    return 'contingent';
  }

  private formatAddress(address: any): string {
    if (!address) return '';
    return `${address.street || ''}, ${address.city || ''}, ${address.postalCode || ''}, ${address.country || ''}`
      .replace(/,\s*,/g, ',')
      .trim();
  }

  /**
   * Convert database will record to Will interface
   */
  private convertDbWillToWill(dbWill: any): Will {
    return {
      id: dbWill.id,
      user_id: dbWill.user_id,
      will_type: dbWill.will_type,
      status: dbWill.status,
      version: dbWill.version || 1,
      jurisdiction: dbWill.jurisdiction,
      language: dbWill.language || 'en',
      legal_framework: dbWill.legal_framework || '',
      declarations: Array.isArray(dbWill.testator_data)
        ? dbWill.testator_data
        : [],
      beneficiaries: Array.isArray(dbWill.beneficiaries)
        ? dbWill.beneficiaries
        : [],
      asset_distributions: Array.isArray(dbWill.assets) ? dbWill.assets : [],
      executor_appointments: Array.isArray(dbWill.executors)
        ? dbWill.executors
        : [],
      guardianship_appointments: [],
      special_instructions: Array.isArray(dbWill.special_instructions)
        ? dbWill.special_instructions
        : [],
      validation_errors: [],
      completeness_score: dbWill.completeness_score || 0,
      ai_suggestions: Array.isArray(dbWill.ai_suggestions)
        ? dbWill.ai_suggestions
        : [],
      created_at: dbWill.created_at,
      updated_at: dbWill.updated_at,
    };
  }
}

// Export singleton instance
export const willApiService = new WillApiService();
          // Removed maritalStatus and family fields as they are not used or needed here.
