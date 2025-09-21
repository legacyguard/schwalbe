import { LegalValidator } from '../will-legal-validator';
import type { WillData } from '@/components/legacy/WillWizard';

describe('Slovak Jurisdiction Witness Validation', () => {
  let validator: LegalValidator;

  beforeEach(() => {
    validator = new LegalValidator('Slovakia');
  });

  describe('Witness Requirements', () => {
    it('should require 0 witnesses for holographic will', () => {
      const result = validator.validateWitnessRequirements('holographic');

      expect(result.isValid).toBe(true);
      expect(result.message).toContain('No witnesses required');
    });

    it('should require 2 witnesses for witnessed will', () => {
      const result = validator.validateWitnessRequirements('witnessed', []);

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('2 witnesses');
      expect(result.message).toContain('Slovakia');
    });

    it('should accept exactly 2 witnesses for witnessed will', () => {
      const witnesses = [
        { name: 'John Doe', age: 30 },
        { name: 'Jane Smith', age: 35 },
      ];
      const result = validator.validateWitnessRequirements(
        'witnessed',
        witnesses
      );

      expect(result.isValid).toBe(true);
      expect(result.message).toContain('satisfied');
    });

    it('should warn about excess witnesses for witnessed will', () => {
      const witnesses = [
        { name: 'John Doe', age: 30 },
        { name: 'Jane Smith', age: 35 },
        { name: 'Bob Johnson', age: 40 },
      ];
      const result = validator.validateWitnessRequirements(
        'witnessed',
        witnesses
      );

      expect(result.isValid).toBe(true);
      expect(result.level).toBe('warning');
      expect(result.message).toContain('more witnesses than required');
    });

    it('should require 0 witnesses for notarial will', () => {
      const result = validator.validateWitnessRequirements('notarial');

      expect(result.isValid).toBe(true);
      expect(result.message).toContain('No witnesses required');
    });

    // Test backward compatibility with 'alographic' terminology
    it('should handle alographic will type (legacy support)', () => {
      const witnesses = [
        { name: 'John Doe', age: 30 },
        { name: 'Jane Smith', age: 35 },
      ];
      const result = validator.validateWitnessRequirements(
        'alographic',
        witnesses
      );

      expect(result.isValid).toBe(true);
      expect(result.message).toContain('satisfied');
    });
  });

  describe('Full Will Document Validation', () => {
    const baseWillData: WillData = {
      testator_data: {
        fullName: 'Jan Novák',
        dateOfBirth: '1970-01-01',
        placeOfBirth: 'Bratislava',
        address: 'Hlavná 1, 811 01 Bratislava',
        personalId: '700101/1234',
      },
      family_status: {
        spouse: {
          name: 'Mária Nováková',
          birthDate: '1972-05-15',
        },
        children: [
          {
            name: 'Peter Novák',
            birthDate: '2010-03-20',
            isMinor: true,
          },
        ],
      },
      assets: {
        realEstate: [],
        bankAccounts: [],
        personalProperty: [],
      },
      beneficiaries: [
        {
          name: 'Mária Nováková',
          relationship: 'spouse',
          percentage: 50,
        },
        {
          name: 'Peter Novák',
          relationship: 'child',
          percentage: 50,
        },
      ],
      executor_data: {
        primaryExecutor: {
          name: 'Jozef Novák',
          relationship: 'brother',
        },
      },
      guardianship: {
        primaryGuardian: {
          name: 'Jozef Novák',
          relationship: 'brother',
        },
      },
      special_wishes: {},
    };

    it('should validate witnessed will with proper witness requirements', () => {
      const report = validator.validateWillDocument(baseWillData, 'witnessed');

      // Find witness validation result
      const witnessValidation = report.validationResults.find(
        r => r.field === 'witnesses'
      );

      expect(witnessValidation).toBeDefined();
      expect(witnessValidation?.isValid).toBe(false);
      expect(witnessValidation?.message).toContain('2 witnesses');
    });

    it('should validate holographic will without witness requirements', () => {
      const report = validator.validateWillDocument(
        baseWillData,
        'holographic'
      );

      // Find witness validation result
      const witnessValidation = report.validationResults.find(
        r => r.field === 'witnesses'
      );

      // Should either not have witness validation or it should be valid
      if (witnessValidation) {
        expect(witnessValidation.isValid).toBe(true);
      }
    });

    it('should respect forced heirship for Slovakia', () => {
      const invalidBeneficiaries: WillData = {
        ...baseWillData,
        beneficiaries: [
          {
            name: 'Charity Organization',
            relationship: 'other',
            percentage: 90,
          },
          {
            name: 'Peter Novák',
            relationship: 'child',
            percentage: 10, // Too low for forced heir (should be at least 50%)
          },
        ],
      };

      const report = validator.validateWillDocument(
        invalidBeneficiaries,
        'holographic'
      );

      expect(report.forcedHeirsIssues.length).toBeGreaterThan(0);
      expect(report.forcedHeirsIssues[0].message).toContain(
        'minimum 50% share'
      );
    });
  });

  describe('Czech Republic Comparison', () => {
    let czechValidator: LegalValidator;

    beforeEach(() => {
      czechValidator = new LegalValidator('Czech-Republic');
    });

    it('should have same witness requirements for Czech Republic', () => {
      const skResult = validator.validateWitnessRequirements('witnessed', []);
      const czResult = czechValidator.validateWitnessRequirements(
        'witnessed',
        []
      );

      // Both should require 2 witnesses
      expect(skResult.message).toContain('2 witnesses');
      expect(czResult.message).toContain('2 witnesses');
    });
  });
});
