// Updated API client for mobile app using centralized @legacyguard/logic definitions

import { createLegacyGuardAPI, type LegacyGuardAPI } from '@legacyguard/logic';
import { apiClient } from './apiClient';

/**
 * Create centralized API instance for the mobile app
 * This replaces the scattered API calls with a single, typed interface
 */
export const legacyGuardAPI: LegacyGuardAPI = createLegacyGuardAPI(apiClient);

// Export convenient access to individual services
export const { documents, guardians, profile, will, legacyItems, analytics } =
  legacyGuardAPI;

/**
 * Usage Examples:
 *
 * // Documents
 * const userDocuments = await documents.getAll({ limit: 10 });
 * const document = await documents.getById('doc-uuid');
 * const uploadedDoc = await documents.upload({ file: { base64, mimeType, fileName } });
 *
 * // Guardians
 * const guardians = await guardians.getAll();
 * const newGuardian = await guardians.create({ name: 'John Doe', email: 'john@example.com' });
 *
 * // Profile
 * const userProfile = await profile.get();
 * await profile.update({ full_name: 'Updated Name' });
 *
 * // Will
 * const willData = await will.get();
 * await will.addBeneficiary({ name: 'Jane Doe', relationship: 'daughter', percentage: 50 });
 *
 * // Analytics
 * const insights = await analytics.getInsights();
 * const milestones = await analytics.getMilestones();
 */

export default legacyGuardAPI;
