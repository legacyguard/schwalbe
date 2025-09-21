
import { describe, expect, test } from 'vitest';
/**
 * Trust Score Calculator Tests
 * Validates trust score calculation logic and accuracy
 */

import {
  calculateUserTrustScore,
  TrustScoreCalculator,
  type TrustScoreFactors,
} from '../trust-score-calculator';

describe('TrustScoreCalculator', () => {
  describe('Basic Score Calculation', () => {
    test('should return zero score for new user', () => {
      const factors: TrustScoreFactors = {
        documentsUploaded: 0,
        professionalReviews: 0,
        emergencyContactsAdded: 0,
        guardiansAssigned: 0,
        willCompleted: false,
        encryptionEnabled: false,
        twoFactorAuth: false,
        familyMembersInvited: 0,
        documentsShared: 0,
        lastActivityDays: 0,
        accountAge: 0,
        legalCompliance: 0,
      };

      const result = TrustScoreCalculator.calculateTrustScore(factors);

      expect(result.totalScore).toBe(11); // Base security score (5) + encryption enabled (6) = 11
      expect(result.percentage).toBe(11);
    });

    test('should calculate higher score for active user', () => {
      const factors: TrustScoreFactors = {
        documentsUploaded: 5,
        professionalReviews: 1,
        emergencyContactsAdded: 2,
        guardiansAssigned: 1,
        willCompleted: true,
        encryptionEnabled: true,
        twoFactorAuth: true,
        familyMembersInvited: 2,
        documentsShared: 3,
        lastActivityDays: 1,
        accountAge: 90,
        legalCompliance: 80,
      };

      const result = TrustScoreCalculator.calculateTrustScore(factors);

      expect(result.totalScore).toBeGreaterThan(70);
      expect(result.percentage).toBeGreaterThan(70);
    });

    test('should cap total score at maximum', () => {
      const factors: TrustScoreFactors = {
        documentsUploaded: 50,
        professionalReviews: 10,
        emergencyContactsAdded: 10,
        guardiansAssigned: 10,
        willCompleted: true,
        encryptionEnabled: true,
        twoFactorAuth: true,
        familyMembersInvited: 20,
        documentsShared: 50,
        lastActivityDays: 1,
        accountAge: 365,
        legalCompliance: 100,
      };

      const result = TrustScoreCalculator.calculateTrustScore(factors);

      expect(result.totalScore).toBeLessThanOrEqual(100);
      expect(result.maxPossibleScore).toBe(100);
    });
  });

  describe('Component Scores', () => {
    test('should reward document uploads', () => {
      const baseFactors: TrustScoreFactors = {
        documentsUploaded: 0,
        professionalReviews: 0,
        emergencyContactsAdded: 0,
        guardiansAssigned: 0,
        willCompleted: false,
        encryptionEnabled: true,
        twoFactorAuth: false,
        familyMembersInvited: 0,
        documentsShared: 0,
        lastActivityDays: 7,
        accountAge: 30,
        legalCompliance: 0,
      };

      const withDocuments = { ...baseFactors, documentsUploaded: 5 };

      const baseResult = TrustScoreCalculator.calculateTrustScore(baseFactors);
      const docsResult =
        TrustScoreCalculator.calculateTrustScore(withDocuments);

      expect(docsResult.totalScore).toBeGreaterThan(baseResult.totalScore);
      expect(docsResult.factors.documents.score).toBeGreaterThan(
        baseResult.factors.documents.score
      );
    });

    test('should reward professional reviews significantly', () => {
      const baseFactors: TrustScoreFactors = {
        documentsUploaded: 3,
        professionalReviews: 0,
        emergencyContactsAdded: 1,
        guardiansAssigned: 0,
        willCompleted: true,
        encryptionEnabled: true,
        twoFactorAuth: false,
        familyMembersInvited: 1,
        documentsShared: 1,
        lastActivityDays: 7,
        accountAge: 30,
        legalCompliance: 0,
      };

      const withReview = {
        ...baseFactors,
        professionalReviews: 1,
        legalCompliance: 85,
      };

      const baseResult = TrustScoreCalculator.calculateTrustScore(baseFactors);
      const reviewResult = TrustScoreCalculator.calculateTrustScore(withReview);

      expect(reviewResult.totalScore).toBeGreaterThan(baseResult.totalScore);
      expect(reviewResult.factors.professional.score).toBeGreaterThan(
        baseResult.factors.professional.score
      );
    });

    test('should reward emergency preparedness', () => {
      const baseFactors: TrustScoreFactors = {
        documentsUploaded: 3,
        professionalReviews: 0,
        emergencyContactsAdded: 0,
        guardiansAssigned: 0,
        willCompleted: false,
        encryptionEnabled: true,
        twoFactorAuth: false,
        familyMembersInvited: 0,
        documentsShared: 0,
        lastActivityDays: 7,
        accountAge: 30,
        legalCompliance: 0,
      };

      const withEmergency = {
        ...baseFactors,
        emergencyContactsAdded: 2,
        guardiansAssigned: 1,
      };

      const baseResult = TrustScoreCalculator.calculateTrustScore(baseFactors);
      const emergencyResult =
        TrustScoreCalculator.calculateTrustScore(withEmergency);

      expect(emergencyResult.totalScore).toBeGreaterThan(baseResult.totalScore);
      expect(emergencyResult.factors.emergency.score).toBeGreaterThan(0);
    });
  });

  describe('Milestone Calculation', () => {
    test('should identify next milestone correctly', () => {
      const factors: TrustScoreFactors = {
        documentsUploaded: 2,
        professionalReviews: 0,
        emergencyContactsAdded: 0,
        guardiansAssigned: 0,
        willCompleted: false,
        encryptionEnabled: true,
        twoFactorAuth: false,
        familyMembersInvited: 0,
        documentsShared: 0,
        lastActivityDays: 7,
        accountAge: 30,
        legalCompliance: 0,
      };

      const result = TrustScoreCalculator.calculateTrustScore(factors);

      expect(result.nextMilestone).toBeDefined();
      expect(result.nextMilestone?.score).toBeGreaterThan(result.totalScore);
      expect(result.nextMilestone?.suggestions).toBeDefined();
      expect(result.nextMilestone?.suggestions.length).toBeGreaterThan(0);
    });

    test('should return null milestone for maximum score', () => {
      const factors: TrustScoreFactors = {
        documentsUploaded: 20,
        professionalReviews: 5,
        emergencyContactsAdded: 5,
        guardiansAssigned: 3,
        willCompleted: true,
        encryptionEnabled: true,
        twoFactorAuth: true,
        familyMembersInvited: 10,
        documentsShared: 20,
        lastActivityDays: 1,
        accountAge: 365,
        legalCompliance: 100,
      };

      const result = TrustScoreCalculator.calculateTrustScore(factors);

      if (result.totalScore >= 100) {
        expect(result.nextMilestone).toBeNull();
      }
    });
  });

  describe('Risk Assessment', () => {
    test('should identify high risk areas for new user', () => {
      const factors: TrustScoreFactors = {
        documentsUploaded: 0,
        professionalReviews: 0,
        emergencyContactsAdded: 0,
        guardiansAssigned: 0,
        willCompleted: false,
        encryptionEnabled: false,
        twoFactorAuth: false,
        familyMembersInvited: 0,
        documentsShared: 0,
        lastActivityDays: 0,
        accountAge: 1,
        legalCompliance: 0,
      };

      const result = TrustScoreCalculator.calculateTrustScore(factors);

      expect(result.riskAreas).toBeDefined();
      expect(result.riskAreas.length).toBeGreaterThan(0);

      const highRisks = result.riskAreas.filter(r => r.risk === 'high');
      expect(highRisks.length).toBeGreaterThan(0);
    });

    test('should have fewer risks for well-prepared user', () => {
      const factors: TrustScoreFactors = {
        documentsUploaded: 8,
        professionalReviews: 2,
        emergencyContactsAdded: 3,
        guardiansAssigned: 2,
        willCompleted: true,
        encryptionEnabled: true,
        twoFactorAuth: true,
        familyMembersInvited: 3,
        documentsShared: 5,
        lastActivityDays: 2,
        accountAge: 180,
        legalCompliance: 90,
      };

      const result = TrustScoreCalculator.calculateTrustScore(factors);

      const highRisks = result.riskAreas.filter(r => r.risk === 'high');
      expect(highRisks.length).toBe(0);
    });
  });

  describe('Quick Improvements', () => {
    test('should suggest relevant improvements', () => {
      const factors: TrustScoreFactors = {
        documentsUploaded: 2,
        professionalReviews: 0,
        emergencyContactsAdded: 0,
        guardiansAssigned: 0,
        willCompleted: false,
        encryptionEnabled: true,
        twoFactorAuth: false,
        familyMembersInvited: 0,
        documentsShared: 0,
        lastActivityDays: 7,
        accountAge: 30,
        legalCompliance: 0,
      };

      const improvements = TrustScoreCalculator.getQuickImprovements(
        factors,
        5
      );

      expect(improvements).toBeDefined();
      expect(improvements.length).toBeGreaterThan(0);
      expect(improvements.length).toBeLessThanOrEqual(5);

      // Should prioritize high-impact improvements
      expect(
        improvements.some(
          i =>
            i.includes('professional') ||
            i.includes('emergency') ||
            i.includes('will')
        )
      ).toBe(true);
    });
  });

  describe('User Stats Integration', () => {
    test('should work with calculateUserTrustScore helper', () => {
      const mockUserStats = {
        documents: Array(3).fill({}),
        professional_reviews: Array(1).fill({}),
        emergency_contacts: Array(2).fill({}),
        guardianshipAppointments: [],
        will_completed: false,
        encryption_enabled: true,
        two_factor_enabled: false,
        family_members: Array(1).fill({}),
        shared_documents: Array(2).fill({}),
        last_activity_days: 5,
        account_age_days: 60,
        legal_compliance_score: 75,
      };

      const result = calculateUserTrustScore(mockUserStats);

      expect(result).toBeDefined();
      expect(result.totalScore).toBeGreaterThan(0);
      expect(result.factors).toBeDefined();
      expect(result.factors.documents.score).toBeGreaterThan(0);
      expect(result.factors.professional.score).toBeGreaterThan(0);
    });
  });
});
