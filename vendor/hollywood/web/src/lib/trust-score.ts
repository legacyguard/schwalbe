
/**
 * Trust Score Calculation System for LegacyGuard
 * Calculates family protection level based on multiple factors
 */

import type {
  ProfessionalReview,
  TrustFactor,
  TrustScore,
  WillData,
} from '@/types/will';
import type { ValidationResult } from './will-legal-validator';

interface TrustScoreInput {
  documentsCount: number;
  emergencyContactsCount: number;
  familyMembersCount: number;
  professionalReview?: ProfessionalReview;
  validationResults: ValidationResult[];
  willData: WillData;
}

/**
 * Calculate comprehensive trust score (0-100)
 * Higher score = Better family protection
 */
export function calculateTrustScore(input: TrustScoreInput): TrustScore {
  const factors: TrustFactor[] = [];

  // 1. Document Completeness (30% weight)
  const completenessScore = calculateCompletenessScore(
    input.willData,
    input.documentsCount
  );
  factors.push({
    name: 'Document Completeness',
    score: completenessScore,
    weight: 0.3,
    description: `You have ${input.documentsCount} important documents secured`,
    improvement_suggestion:
      completenessScore < 80
        ? 'Add more essential documents like insurance policies, property deeds'
        : undefined,
  });

  // 2. Legal Validation (25% weight)
  const validationScore = calculateValidationScore(input.validationResults);
  factors.push({
    name: 'Legal Validation',
    score: validationScore,
    weight: 0.25,
    description:
      validationScore > 90
        ? 'All legal requirements met'
        : 'Some validation issues detected',
    improvement_suggestion:
      validationScore < 90 ? 'Review and fix validation warnings' : undefined,
  });

  // 3. Professional Review (20% weight)
  const professionalScore = calculateProfessionalScore(
    input.professionalReview
  );
  factors.push({
    name: 'Professional Review',
    score: professionalScore,
    weight: 0.2,
    description: input.professionalReview
      ? 'Professionally reviewed by legal expert'
      : 'No professional review yet',
    improvement_suggestion: !input.professionalReview
      ? 'Get professional legal review for maximum confidence'
      : undefined,
  });

  // 4. Family Protection Setup (15% weight)
  const familyScore = calculateFamilyProtectionScore(
    input.familyMembersCount,
    input.emergencyContactsCount
  );
  factors.push({
    name: 'Family Protection',
    score: familyScore,
    weight: 0.15,
    description: `${input.familyMembersCount} family members and ${input.emergencyContactsCount} emergency contacts configured`,
    improvement_suggestion:
      familyScore < 80
        ? 'Add more emergency contacts and family member access'
        : undefined,
  });

  // 5. Will Specific Factors (10% weight)
  const willScore = calculateWillSpecificScore(input.willData);
  factors.push({
    name: 'Will Completeness',
    score: willScore,
    weight: 0.1,
    description: 'Essential will components coverage',
    improvement_suggestion:
      willScore < 90
        ? 'Complete all will sections for full protection'
        : undefined,
  });

  // Calculate weighted overall score
  const overallScore = Math.round(
    factors.reduce((sum, factor) => sum + factor.score * factor.weight, 0)
  );

  // Calculate individual component scores
  const validationScore_component = Math.round(validationScore);
  const professionalScore_component = Math.round(professionalScore);
  const completenessScore_component = Math.round(completenessScore);
  const familyProtectionScore_component = Math.round(familyScore);

  return {
    overall_score: overallScore,
    validation_score: validationScore_component,
    professional_score: professionalScore_component,
    completeness_score: completenessScore_component,
    family_protection_score: familyProtectionScore_component,
    last_updated: new Date().toISOString(),
    factors,
  };
}

/**
 * Calculate document completeness score (0-100)
 */
function calculateCompletenessScore(
  willData: WillData,
  documentsCount: number
): number {
  let score = 0;

  // Base documents count (40 points max)
  const documentScore = Math.min(40, (documentsCount / 10) * 40);
  score += documentScore;

  // Essential will components (60 points)
  if (willData.testatorInfo && willData.testatorInfo.fullName) score += 10;
  if (willData.beneficiaries && willData.beneficiaries.length > 0) score += 15;
  if (willData.executors && willData.executors.length > 0) score += 10;
  if (willData.assets && Object.keys(willData.assets).length > 0) score += 10;
  if (willData.witnesses && willData.witnesses.length >= 2) score += 10;
  if (willData.guardianship && willData.guardianship.length > 0) score += 5;

  return Math.min(100, score);
}

/**
 * Calculate legal validation score (0-100)
 */
function calculateValidationScore(
  validationResults: ValidationResult[]
): number {
  if (validationResults.length === 0) return 85; // Assume good if no validation run

  const errors = validationResults.filter(r => r.level === 'error').length;
  const warnings = validationResults.filter(r => r.level === 'warning').length;

  let score = 100;
  score -= errors * 15; // Each error -15 points
  score -= warnings * 5; // Each warning -5 points

  return Math.max(0, score);
}

/**
 * Calculate professional review score (0-100)
 */
function calculateProfessionalScore(
  professionalReview?: ProfessionalReview
): number {
  if (!professionalReview) return 0;

  switch (professionalReview.status) {
    case 'approved':
      return Math.max(85, professionalReview.legal_compliance_score || 85);
    case 'needs_revision':
      return 60;
    case 'in_review':
      return 50;
    case 'pending':
      return 25;
    case 'rejected':
      return 10;
    default:
      return 0;
  }
}

/**
 * Calculate family protection setup score (0-100)
 */
function calculateFamilyProtectionScore(
  familyMembers: number,
  emergencyContacts: number
): number {
  let score = 0;

  // Family members (50 points max)
  score += Math.min(50, familyMembers * 12.5);

  // Emergency contacts (50 points max)
  score += Math.min(50, emergencyContacts * 16.5);

  return Math.min(100, score);
}

/**
 * Calculate will-specific completeness score (0-100)
 */
function calculateWillSpecificScore(willData: WillData): number {
  let score = 0;
  const maxScore = 100;

  // Essential components
  if (willData.testator_data?.fullName) score += 20;
  if (willData.beneficiaries && willData.beneficiaries.length > 0) score += 25;
  if (willData.assets && Object.keys(willData.assets).length > 0) score += 20;
  if (willData.executors && willData.executors.length > 0) score += 15;
  if (willData.guardianship && willData.guardianship.length > 0) score += 10;
  if (willData.specialProvisions && willData.specialProvisions.length > 0)
    score += 10;

  return Math.min(maxScore, score);
}

/**
 * Get family protection level based on trust score
 */
export function getFamilyProtectionLevel(
  trustScore: number
): 'basic' | 'comprehensive' | 'premium' | 'standard' {
  if (trustScore >= 90) return 'comprehensive';
  if (trustScore >= 75) return 'premium';
  if (trustScore >= 60) return 'standard';
  return 'basic';
}

/**
 * Get trust score color theme for UI
 */
export function getTrustScoreTheme(score: number): {
  bg: string;
  border: string;
  color: string;
  text: string;
} {
  if (score >= 90) {
    return {
      color: 'emerald',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
    };
  } else if (score >= 75) {
    return {
      color: 'green',
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
    };
  } else if (score >= 60) {
    return {
      color: 'yellow',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
    };
  } else {
    return {
      color: 'orange',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-800',
    };
  }
}

/**
 * Generate family impact message based on trust score
 */
export function getFamilyImpactMessage(
  score: number,
  familyMembersCount: number
): string {
  const members = familyMembersCount || 'Your family';

  if (score >= 90) {
    return `${members} ${familyMembersCount > 1 ? 'are' : 'is'} comprehensively protected with professional-grade security.`;
  } else if (score >= 75) {
    return `${members} ${familyMembersCount > 1 ? 'have' : 'has'} strong protection with clear guidance for any situation.`;
  } else if (score >= 60) {
    return `${members} ${familyMembersCount > 1 ? 'have' : 'has'} good basic protection, with room for improvement.`;
  } else {
    return `${members} ${familyMembersCount > 1 ? 'need' : 'needs'} more protection - let's secure what matters most.`;
  }
}
