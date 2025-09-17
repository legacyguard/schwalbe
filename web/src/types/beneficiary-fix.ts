
/**
 * Beneficiary Interface Fixes and Extensions
 * This file provides compatibility fixes for the Beneficiary interface
 */

import type { Beneficiary as OriginalBeneficiary } from './will';

// Extended Beneficiary interface with legacy compatibility
export interface Beneficiary extends OriginalBeneficiary {
  conditions?: string;
  dateOfBirth?: string;
  // Additional properties for component compatibility
  fullName?: string;
  // Legacy compatibility properties
  name?: string;
  percentage?: number;

  relationshipText?: string;
  share?: number;
  specificGifts?: string[];
}

// Helper function to convert legacy Beneficiary to new format
export const normalizeBeneficiary = (
  beneficiary: Record<string, any>
): Beneficiary => {
  return {
    id: (beneficiary.id as string) || '',
    type:
      (beneficiary.type as
        | 'charitable'
        | 'contingent'
        | 'primary'
        | 'secondary') || 'primary',
    full_name:
      (beneficiary.full_name as string) || (beneficiary.name as string) || '',
    relationship: (beneficiary.relationship as string) || '',
    date_of_birth:
      (beneficiary.date_of_birth as string) ||
      (beneficiary.dateOfBirth as string) ||
      undefined,
    share_percentage:
      (beneficiary.share_percentage as number) ||
      (beneficiary.percentage as number) ||
      undefined,
    specific_bequests:
      (beneficiary.specific_bequests as string[]) ||
      (beneficiary.specificGifts as string[]) ||
      [],
    conditions: (beneficiary.conditions as string) || '',
    contact_info: (beneficiary.contact_info as {
      address?: string;
      email?: string;
      phone?: string;
    }) || {
      email: (beneficiary.email as string) || '',
      phone: (beneficiary.phone as string) || '',
      address: (beneficiary.address as string) || '',
    },
    // Legacy compatibility
    name:
      (beneficiary.name as string) || (beneficiary.full_name as string) || '',
    dateOfBirth:
      (beneficiary.date_of_birth as string) ||
      (beneficiary.dateOfBirth as string) ||
      '',
    percentage:
      (beneficiary.share_percentage as number) ||
      (beneficiary.percentage as number) ||
      0,
    specificGifts: (beneficiary.specific_bequests as string[]) || [],
  };
};

// Type guard for Beneficiary
export const isValidBeneficiary = (obj: any): obj is Beneficiary => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as any).id === 'string' &&
    typeof (obj as any).full_name === 'string' &&
    typeof (obj as any).relationship === 'string'
  );
};
