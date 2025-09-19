/**
 * Will-Guardian Integration Service
 * Bridges the will generation system with the existing Guardian system
 * Migrated from Hollywood codebase with Supabase integration
 */

import type {
  BeneficiaryInfo,
  ExecutorInfo,
  GuardianshipInfo,
  WillUserData,
  Guardian,
} from '../types/will';
import { supabaseClient } from '../supabase/client';
import { logger } from '../lib/logger';

export interface CreateGuardianRequest {
  name: string;
  email: string;
  phone: string;
  relationship?: string;
  notes?: string;
  can_trigger_emergency: boolean;
  can_access_health_docs: boolean;
  can_access_financial_docs: boolean;
  is_child_guardian: boolean;
  is_will_executor: boolean;
  emergency_contact_priority: number;
}

export class WillGuardianIntegrationService {
  /**
   * Sync beneficiaries with guardians system
   */
  async syncBeneficiariesWithGuardians(
    userId: string,
    beneficiaries: BeneficiaryInfo[]
  ): Promise<void> {
    try {
      logger.info('Syncing beneficiaries with guardians', {
        userId,
        beneficiaryCount: beneficiaries.length
      });

      const existingGuardians = await this.getGuardians(userId);
      const existingGuardianEmails = new Set(
        existingGuardians.map(g => g.email)
      );

      for (const beneficiary of beneficiaries) {
        if (
          beneficiary.contactInfo?.email &&
          !existingGuardianEmails.has(beneficiary.contactInfo.email)
        ) {
          // Create guardian for beneficiary if they have contact info
          const guardianRequest: CreateGuardianRequest = {
            name: beneficiary.name,
            email: beneficiary.contactInfo.email,
            phone: beneficiary.contactInfo.phone || '',
            relationship: beneficiary.relationship,
            notes: `Added from will beneficiaries - ${beneficiary.share.type}: ${beneficiary.share.value}`,
            can_trigger_emergency: false,
            can_access_health_docs: false,
            can_access_financial_docs: false,
            is_child_guardian: false,
            is_will_executor: false,
            emergency_contact_priority: 999,
          };

          await this.createGuardian(guardianRequest, userId);
        }
      }

      logger.info('Beneficiaries synced with guardians successfully', { userId });
    } catch (error) {
      logger.error('Error syncing beneficiaries with guardians', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Sync executors with guardians system
   */
  async syncExecutorsWithGuardians(
    userId: string,
    executors: ExecutorInfo[]
  ): Promise<void> {
    try {
      logger.info('Syncing executors with guardians', {
        userId,
        executorCount: executors.length
      });

      const existingGuardians = await this.getGuardians(userId);

      for (const executor of executors) {
        const existingGuardian = existingGuardians.find(
          g => g.email === executor.contactInfo.email
        );

        if (existingGuardian) {
          // Update existing guardian to mark as executor
          await this.updateGuardian(existingGuardian.id, {
            is_will_executor: true,
            emergency_contact_priority: executor.type === 'primary' ? 1 : 2,
            notes: `Will executor (${executor.type}) - ${executor.specialization || 'General'}`,
          });
        } else if (executor.contactInfo.email) {
          // Create new guardian for executor
          const guardianRequest: CreateGuardianRequest = {
            name: executor.name,
            email: executor.contactInfo.email,
            phone: executor.contactInfo.phone || '',
            relationship: executor.relationship,
            notes: `Will executor (${executor.type}) - ${executor.specialization || 'General'}`,
            can_trigger_emergency: true,
            can_access_health_docs: true,
            can_access_financial_docs: true,
            is_child_guardian: false,
            is_will_executor: true,
            emergency_contact_priority: executor.type === 'primary' ? 1 : 2,
          };

          await this.createGuardian(guardianRequest, userId);
        }
      }

      logger.info('Executors synced with guardians successfully', { userId });
    } catch (error) {
      logger.error('Error syncing executors with guardians', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Sync child guardians with guardians system
   */
  async syncChildGuardiansWithGuardians(
    userId: string,
    guardianships: GuardianshipInfo[]
  ): Promise<void> {
    try {
      logger.info('Syncing child guardians with guardians', {
        userId,
        guardianshipCount: guardianships.length
      });

      const existingGuardians = await this.getGuardians(userId);

      for (const guardianship of guardianships) {
        // Primary guardian
        if (guardianship.primaryGuardian) {
          await this.syncSingleChildGuardian(
            userId,
            guardianship.primaryGuardian,
            existingGuardians,
            true,
            guardianship.specialInstructions
          );
        }

        // Alternate guardian
        if (guardianship.alternateGuardian) {
          await this.syncSingleChildGuardian(
            userId,
            guardianship.alternateGuardian,
            existingGuardians,
            false,
            guardianship.specialInstructions
          );
        }
      }

      logger.info('Child guardians synced with guardians successfully', { userId });
    } catch (error) {
      logger.error('Error syncing child guardians with guardians', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Sync a single child guardian
   */
  private async syncSingleChildGuardian(
    userId: string,
    guardian: ExecutorInfo,
    existingGuardians: Guardian[],
    isPrimary: boolean,
    specialInstructions?: string
  ): Promise<void> {
    const existingGuardian = existingGuardians.find(
      g => g.email === guardian.contactInfo.email
    );

    if (existingGuardian) {
      // Update existing guardian
      await this.updateGuardian(existingGuardian.id, {
        is_child_guardian: true,
        emergency_contact_priority: isPrimary ? 1 : 2,
        notes: `Child guardian (${isPrimary ? 'primary' : 'alternate'}) - ${specialInstructions || ''}`,
      });
    } else if (guardian.contactInfo.email) {
      // Create new guardian for child guardian
      const guardianRequest: CreateGuardianRequest = {
        name: guardian.name,
        email: guardian.contactInfo.email,
        phone: guardian.contactInfo.phone || '',
        relationship: guardian.relationship,
        notes: `Child guardian (${isPrimary ? 'primary' : 'alternate'}) - ${specialInstructions || ''}`,
        can_trigger_emergency: true,
        can_access_health_docs: true,
        can_access_financial_docs: isPrimary,
        is_child_guardian: true,
        is_will_executor: false,
        emergency_contact_priority: isPrimary ? 1 : 2,
      };

      await this.createGuardian(guardianRequest, userId);
    }
  }

  /**
   * Get guardians suitable for will roles
   */
  async getGuardiansForWillRoles(userId: string): Promise<{
    emergencyContacts: Guardian[];
    potentialChildGuardians: Guardian[];
    potentialExecutors: Guardian[];
  }> {
    try {
      const allGuardians = await this.getGuardians(userId);

      return {
        potentialExecutors: allGuardians.filter(
          g =>
            g.is_active &&
            (g.is_will_executor ||
              g.relationship === 'lawyer' ||
              g.relationship === 'financial_advisor')
        ),
        potentialChildGuardians: allGuardians.filter(
          g =>
            g.is_active &&
            (g.is_child_guardian ||
              g.relationship === 'sibling' ||
              g.relationship === 'friend')
        ),
        emergencyContacts: allGuardians
          .filter(g => g.is_active && g.can_trigger_emergency)
          .sort(
            (a, b) =>
              a.emergency_contact_priority - b.emergency_contact_priority
          ),
      };
    } catch (error) {
      logger.error('Error getting guardians for will roles', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return {
        potentialExecutors: [],
        potentialChildGuardians: [],
        emergencyContacts: [],
      };
    }
  }

  /**
   * Suggest will roles based on existing guardians
   */
  async suggestWillRoles(userId: string): Promise<{
    suggestedBackupChildGuardian?: Guardian;
    suggestedBackupExecutor?: Guardian;
    suggestedChildGuardian?: Guardian;
    suggestedExecutor?: Guardian;
  }> {
    try {
      const guardians = await this.getGuardiansForWillRoles(userId);

      // Sort executors by suitability
      const sortedExecutors = guardians.potentialExecutors.sort((a, b) => {
        // Prioritize existing will executors, then lawyers, then financial advisors
        const aScore =
          (a.is_will_executor ? 3 : 0) +
          (a.relationship === 'lawyer' ? 2 : 0) +
          (a.relationship === 'financial_advisor' ? 1 : 0);
        const bScore =
          (b.is_will_executor ? 3 : 0) +
          (b.relationship === 'lawyer' ? 2 : 0) +
          (b.relationship === 'financial_advisor' ? 1 : 0);
        return bScore - aScore;
      });

      // Sort child guardians by suitability
      const sortedChildGuardians = guardians.potentialChildGuardians.sort(
        (a, b) => {
          // Prioritize existing child guardians, then family members
          const aScore =
            (a.is_child_guardian ? 2 : 0) +
            (['spouse', 'sibling', 'parent'].includes(a.relationship || '')
              ? 1
              : 0);
          const bScore =
            (b.is_child_guardian ? 2 : 0) +
            (['spouse', 'sibling', 'parent'].includes(b.relationship || '')
              ? 1
              : 0);
          return bScore - aScore;
        }
      );

      const result: {
        suggestedBackupChildGuardian?: Guardian;
        suggestedBackupExecutor?: Guardian;
        suggestedChildGuardian?: Guardian;
        suggestedExecutor?: Guardian;
      } = {};

      if (sortedExecutors[0]) result.suggestedExecutor = sortedExecutors[0];
      if (sortedExecutors[1])
        result.suggestedBackupExecutor = sortedExecutors[1];
      if (sortedChildGuardians[0])
        result.suggestedChildGuardian = sortedChildGuardians[0];
      if (sortedChildGuardians[1])
        result.suggestedBackupChildGuardian = sortedChildGuardians[1];

      return result;
    } catch (error) {
      logger.error('Error suggesting will roles', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return {};
    }
  }

  /**
   * Create will-related guardians entry for family guidance
   */
  async createWillGuidanceEntry(
    userId: string,
    willData: WillUserData
  ): Promise<void> {
    try {
      // Create guidance entry for will-related information
      const guidanceContent = this.buildWillGuidanceContent(willData);

      await supabaseClient.from('family_guidance_entries').insert({
        user_id: userId,
        entry_type: 'document_locations',
        title: 'Last Will and Testament Information',
        content: guidanceContent,
        is_completed: true,
        priority: 1,
        tags: ['will', 'legal', 'inheritance'],
        is_auto_generated: true,
      });

      logger.info('Will guidance entry created', { userId });
    } catch (error) {
      logger.error('Error creating will guidance entry', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Build guidance content for will information
   */
  private buildWillGuidanceContent(willData: WillUserData): string {
    const content = [];

    content.push('# Will and Testament Information');
    content.push('');
    content.push(
      'This document contains important information about the will and testament.'
    );
    content.push('');

    if (willData.executors && willData.executors.length > 0) {
      content.push('## Executors');
      willData.executors.forEach(executor => {
        content.push(
          `**${executor.type === 'primary' ? 'Primary' : 'Alternate'} Executor:**`
        );
        content.push(`- Name: ${executor.name}`);
        content.push(`- Relationship: ${executor.relationship}`);
        content.push(
          `- Email: ${executor.contactInfo.email || 'Not provided'}`
        );
        content.push(
          `- Phone: ${executor.contactInfo.phone || 'Not provided'}`
        );
        if (executor.specialization) {
          content.push(`- Specialization: ${executor.specialization}`);
        }
        content.push('');
      });
    }

    if (willData.guardians && willData.guardians.length > 0) {
      content.push('## Child Guardians');
      willData.guardians.forEach(guardianship => {
        if (guardianship.primaryGuardian) {
          content.push('**Primary Guardian:**');
          content.push(`- Name: ${guardianship.primaryGuardian.name}`);
          content.push(
            `- Relationship: ${guardianship.primaryGuardian.relationship}`
          );
          content.push(
            `- Email: ${guardianship.primaryGuardian.contactInfo.email || 'Not provided'}`
          );
          content.push(
            `- Phone: ${guardianship.primaryGuardian.contactInfo.phone || 'Not provided'}`
          );
          content.push('');
        }

        if (guardianship.alternateGuardian) {
          content.push('**Alternate Guardian:**');
          content.push(`- Name: ${guardianship.alternateGuardian.name}`);
          content.push(
            `- Relationship: ${guardianship.alternateGuardian.relationship}`
          );
          content.push(
            `- Email: ${guardianship.alternateGuardian.contactInfo.email || 'Not provided'}`
          );
          content.push(
            `- Phone: ${guardianship.alternateGuardian.contactInfo.phone || 'Not provided'}`
          );
          content.push('');
        }

        if (guardianship.specialInstructions) {
          content.push('**Special Instructions:**');
          content.push(guardianship.specialInstructions);
          content.push('');
        }
      });
    }

    if (willData.beneficiaries && willData.beneficiaries.length > 0) {
      content.push('## Beneficiaries');
      willData.beneficiaries.forEach(beneficiary => {
        content.push(`**${beneficiary.name}**`);
        content.push(`- Relationship: ${beneficiary.relationship}`);
        content.push(
          `- Share: ${beneficiary.share.type} - ${beneficiary.share.value}`
        );
        if (beneficiary.contactInfo?.email) {
          content.push(`- Email: ${beneficiary.contactInfo.email}`);
        }
        if (beneficiary.contactInfo?.phone) {
          content.push(`- Phone: ${beneficiary.contactInfo.phone}`);
        }
        if (beneficiary.conditions) {
          content.push(`- Conditions: ${beneficiary.conditions}`);
        }
        content.push('');
      });
    }

    content.push('## Important Notes');
    content.push('- Keep the original will in a safe place');
    content.push('- Inform executors and guardians of their appointments');
    content.push('- Review and update the will regularly');
    content.push('- Consider legal review for complex situations');

    return content.join('\n');
  }

  /**
   * Validate guardian compatibility with will requirements
   */
  async validateGuardianWillCompatibility(
    userId: string,
    willData: WillUserData
  ): Promise<{
    issues: string[];
    isValid: boolean;
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      const guardians = await this.getGuardians(userId);

      // Check executor availability
      if (willData.executors && willData.executors.length > 0) {
        for (const executor of willData.executors) {
          const matchingGuardian = guardians.find(
            g => g.email === executor.contactInfo.email
          );
          if (!matchingGuardian?.is_active) {
            issues.push(
              `Executor ${executor.name} is not active in guardian system`
            );
          }
        }
      }

      // Check child guardian availability
      const hasMinorChildren = willData.family.children?.some(
        child => child.isMinor
      );
      if (hasMinorChildren) {
        const activeChildGuardians = guardians.filter(
          g => g.is_active && g.is_child_guardian
        );
        if (activeChildGuardians.length === 0) {
          issues.push('No active guardians available for minor children');
          recommendations.push('Add at least one guardian for minor children');
        } else if (activeChildGuardians.length === 1) {
          recommendations.push(
            'Consider adding a backup guardian for minor children'
          );
        }
      }

      // Check emergency contact coverage
      const emergencyContacts = guardians.filter(
        g => g.is_active && g.can_trigger_emergency
      );
      if (emergencyContacts.length === 0) {
        issues.push('No guardians can trigger emergency procedures');
        recommendations.push(
          'Designate at least one guardian to handle emergencies'
        );
      }

      return {
        isValid: issues.length === 0,
        issues,
        recommendations,
      };
    } catch (error) {
      logger.error('Error validating guardian-will compatibility', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return {
        isValid: false,
        issues: ['Unable to validate guardian compatibility'],
        recommendations: ['Please check guardian system connectivity'],
      };
    }
  }

  /**
   * Guardian management methods
   */
  private async getGuardians(userId: string): Promise<Guardian[]> {
    const { data, error } = await supabaseClient
      .from('guardians')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to get guardians: ${error.message}`);
    }

    return data || [];
  }

  private async createGuardian(
    guardianRequest: CreateGuardianRequest,
    userId: string
  ): Promise<Guardian> {
    const { data, error } = await supabaseClient
      .from('guardians')
      .insert({
        ...guardianRequest,
        user_id: userId,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create guardian: ${error.message}`);
    }

    return data;
  }

  private async updateGuardian(
    guardianId: string,
    updates: Partial<Guardian>
  ): Promise<Guardian> {
    const { data, error } = await supabaseClient
      .from('guardians')
      .update(updates)
      .eq('id', guardianId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update guardian: ${error.message}`);
    }

    return data;
  }
}

// Export singleton instance
export const willGuardianIntegration = new WillGuardianIntegrationService();