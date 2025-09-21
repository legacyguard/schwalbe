
/**
 * Guardian Service Stub
 * Basic service to provide guardian functionality for will generation
 */

import type { CreateGuardianRequest, Guardian } from '../types/guardian';

export const guardianService = {
  /**
   * Get guardians for a user
   */
  async getGuardians(userId?: string): Promise<Guardian[]> {
    // Stub implementation - return empty array for now
    // TODO: Implement actual guardian retrieval logic using userId
    // console.log('Getting guardians for user:', userId);
    return [];
  },

  /**
   * Create a new guardian
   */
  async createGuardian(
    guardianRequest: CreateGuardianRequest,
    userId: string
  ): Promise<Guardian> {
    // Stub implementation
    // guardianService.createGuardian called with stub implementation
    return {
      id: 'stub-id',
      user_id: userId,
      name: guardianRequest.name,
      email: guardianRequest.email,
      phone: guardianRequest.phone || '',
      relationship: guardianRequest.relationship || '',
      notes: guardianRequest.notes || '',
      can_trigger_emergency: guardianRequest.can_trigger_emergency || false,
      can_access_health_docs: guardianRequest.can_access_health_docs || false,
      can_access_financial_docs:
        guardianRequest.can_access_financial_docs || false,
      is_child_guardian: guardianRequest.is_child_guardian || false,
      is_will_executor: guardianRequest.is_will_executor || false,
      emergency_contact_priority:
        guardianRequest.emergency_contact_priority || 999,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  /**
   * Update an existing guardian
   */
  async updateGuardian(
    guardianId: string,
    updates: Partial<Guardian>
  ): Promise<void> {
    // Stub implementation
    // TODO: Implement actual guardian update logic
    // console.log('Updating guardian:', guardianId, 'with updates:', updates);
  },
};
