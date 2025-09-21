
// Real-Time Legal Validation Engine for Will Creation
// Provides live legal compliance checking as users type

import type { WillData } from '@/components/legacy/WillWizard';

// Export enum for ValidationLevel
export enum ValidationLevel {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  SUCCESS = 'success',
}

export interface ValidationResult {
  autoSuggestion?: string;
  field?: string;
  isValid: boolean;
  level: ValidationLevel;
  message: string;
  messageKey: string;
}

export interface ComplianceReport {
  forcedHeirsIssues: ValidationResult[];
  forcedHeirsProtected: string[];
  isCompliant: boolean;
  legalConflicts: ValidationResult[];
  overall: 'compliant' | 'non-compliant' | 'partial';
  validationResults: ValidationResult[];
}

export interface ConflictAlert {
  affectedFields: string[];
  message: string;
  severity: 'critical' | 'high' | 'low' | 'medium';
  suggestion: string;
  type:
    | 'forced_heirs'
    | 'jurisdiction_conflict'
    | 'percentage_conflict'
    | 'witness_conflict';
}

// Jurisdiction-specific legal rules
const JURISDICTION_RULES = {
  Slovakia: {
    forcedHeirsMinimum: {
      minorChildren: 0.5, // 50% minimum for minor children
      adultChildren: 0.25, // 25% minimum for adult children
      spouse: 0.25, // 25% minimum for spouse
      parents: 0.125, // 12.5% minimum for parents (if no children/spouse)
    },
    witnessRequirements: {
      holographic: 0,
      alographic: 2,
      notarial: 0,
    },
    legalCapacityAge: 18,
    revocationRules: {
      requiresExplicitRevocation: true,
      allowsPartialRevocation: false,
    },
  },
  'Czech-Republic': {
    forcedHeirsMinimum: {
      minorChildren: 0.5, // 50% minimum for minor children
      adultChildren: 0.25, // 25% minimum for adult children
      spouse: 0.5, // 50% minimum for spouse
      parents: 0.25, // 25% minimum for parents (if no children/spouse)
    },
    witnessRequirements: {
      holographic: 0,
      alographic: 2,
      notarial: 0,
    },
    legalCapacityAge: 18,
    revocationRules: {
      requiresExplicitRevocation: true,
      allowsPartialRevocation: true,
    },
  },
  'US-General': {
    forcedHeirsMinimum: {
      spouse: 0.33, // Varies by state, using general rule
    },
    witnessRequirements: {
      holographic: 0, // Some states don't recognize holographic wills
      alographic: 2,
      notarial: 0,
    },
    legalCapacityAge: 18,
    revocationRules: {
      requiresExplicitRevocation: false,
      allowsPartialRevocation: true,
    },
  },
};

export class LegalValidator {
  private jurisdiction: string;
  private rules: (typeof JURISDICTION_RULES)[keyof typeof JURISDICTION_RULES];

  constructor(jurisdiction: string = 'Slovakia') {
    this.jurisdiction = jurisdiction;
    this.rules =
      JURISDICTION_RULES[jurisdiction as keyof typeof JURISDICTION_RULES] ||
      JURISDICTION_RULES['Slovakia'];
  }

  /**
   * Validates beneficiary shares for legal compliance
   */
  validateBeneficiaryShares(
    beneficiaries: WillData['beneficiaries'],
    _jurisdiction: string
  ): ValidationResult {
    const totalShares = beneficiaries.reduce((sum, b) => sum + b.percentage, 0);

    if (totalShares !== 100) {
      return {
        isValid: false,
        level: ValidationLevel.ERROR,
        message: `Beneficiary shares must total exactly 100%. Current total: ${totalShares}%`,
        messageKey: 'shares_total_invalid',
        field: 'beneficiaries',
        autoSuggestion:
          totalShares < 100
            ? `Add ${100 - totalShares}% to existing beneficiaries`
            : `Reduce shares by ${totalShares - 100}%`,
      };
    }

    return {
      isValid: true,
      level: ValidationLevel.SUCCESS,
      message: 'Beneficiary shares are correctly distributed',
      messageKey: 'shares_valid',
    };
  }

  /**
   * Checks compliance with forced/reserved heirs laws
   */
  checkForcedHeirsCompliance(
    willData: WillData,
    jurisdiction: string
  ): ComplianceReport {
    const results: ValidationResult[] = [];
    const forcedHeirsIssues: ValidationResult[] = [];

    // Identify potential forced heirs from beneficiaries and guardian data
    const children = willData.beneficiaries.filter(b =>
      ['child', 'son', 'daughter'].includes(b.relationship.toLowerCase())
    );
    const spouse = willData.beneficiaries.find(b =>
      ['spouse', 'husband', 'wife', 'partner'].includes(
        b.relationship.toLowerCase()
      )
    );
    const parents = willData.beneficiaries.filter(b =>
      ['parent', 'mother', 'father'].includes(b.relationship.toLowerCase())
    );

    // Check children's forced heir rights
    if (children.length > 0) {
      const childrenTotalShare = children.reduce(
        (sum, child) => sum + child.percentage,
        0
      );
      const requiredMinimum = ('minorChildren' in this.rules.forcedHeirsMinimum ? this.rules.forcedHeirsMinimum.minorChildren : 0) * 100;

      if (childrenTotalShare < requiredMinimum) {
        forcedHeirsIssues.push({
          isValid: false,
          level: ValidationLevel.ERROR,
          message: `${jurisdiction} law requires children to receive minimum ${requiredMinimum}% share. Currently: ${childrenTotalShare}%`,
          messageKey: 'forced_heirs_children_violation',
          field: 'beneficiaries',
          autoSuggestion: `Increase children's total share to at least ${requiredMinimum}%`,
        });
      } else {
        results.push({
          isValid: true,
          level: ValidationLevel.SUCCESS,
          message: "Children's forced heir rights are respected",
          messageKey: 'forced_heirs_children_compliant',
        });
      }
    }

    // Check spouse's forced heir rights
    if (spouse && this.rules.forcedHeirsMinimum.spouse) {
      const requiredMinimum = this.rules.forcedHeirsMinimum.spouse * 100;
      if (spouse.percentage < requiredMinimum) {
        forcedHeirsIssues.push({
          isValid: false,
          level: ValidationLevel.ERROR,
          message: `${jurisdiction} law requires spouse to receive minimum ${requiredMinimum}% share. Currently: ${spouse.percentage}%`,
          messageKey: 'forced_heirs_spouse_violation',
          field: 'beneficiaries',
          autoSuggestion: `Increase spouse's share to at least ${requiredMinimum}%`,
        });
      }
    }

    // Determine overall compliance
    const hasErrors = forcedHeirsIssues.some(issue => issue.level === 'error');
    const hasWarnings = forcedHeirsIssues.some(
      issue => issue.level === 'warning'
    );

    // Build list of protected forced heirs
    const forcedHeirsProtected: string[] = [];
    if (children.length > 0) forcedHeirsProtected.push('child');
    if (spouse) forcedHeirsProtected.push('spouse');
    if (parents.length > 0) forcedHeirsProtected.push('parent');

    return {
      overall: hasErrors
        ? 'non-compliant'
        : hasWarnings
          ? 'partial'
          : 'compliant',
      isCompliant: !hasErrors,
      forcedHeirsProtected,
      validationResults: results,
      forcedHeirsIssues,
      legalConflicts: [],
    };
  }

  /**
   * Detects legal conflicts between assets and beneficiaries
   */
  detectLegalConflicts(
    assets: WillData['assets'],
    beneficiaries: WillData['beneficiaries']
  ): ConflictAlert[] {
    const conflicts: ConflictAlert[] = [];

    // Check for witness-beneficiary conflicts (witnesses shouldn't be beneficiaries)
    // This would be checked against witness data if available

    // Check for percentage conflicts
    const totalPercentage = beneficiaries.reduce(
      (sum, b) => sum + b.percentage,
      0
    );
    if (totalPercentage > 100) {
      conflicts.push({
        type: 'percentage_conflict',
        severity: 'critical',
        message: `Total beneficiary percentages exceed 100% (${totalPercentage}%)`,
        affectedFields: ['beneficiaries'],
        suggestion: `Reduce total allocation by ${totalPercentage - 100}%`,
      });
    }

    // Check for conflicting asset assignments
    const assetRecipients = new Map<string, string[]>();

    // Collect specific asset assignments
    assets.personalProperty?.forEach(item => {
      if (item.recipient) {
        const recipients = assetRecipients.get(item.description) || [];
        recipients.push(item.recipient);
        assetRecipients.set(item.description, recipients);
      }
    });

    // Detect multiple recipients for same asset
    assetRecipients.forEach((recipients, asset) => {
      if (recipients.length > 1) {
        conflicts.push({
          type: 'percentage_conflict',
          severity: 'high',
          message: `Asset "${asset}" is assigned to multiple recipients: ${recipients.join(', ')}`,
          affectedFields: ['assets.personalProperty'],
          suggestion:
            'Assign each asset to only one specific recipient, or specify shared ownership percentages',
        });
      }
    });

    return conflicts;
  }

  /**
   * Validates executor appointment
   */
  validateExecutor(
    executorData: WillData['executor_data'],
    beneficiaries: WillData['beneficiaries']
  ): ValidationResult[] {
    const results: ValidationResult[] = [];

    if (!executorData.primaryExecutor?.name) {
      results.push({
        isValid: false,
        level: ValidationLevel.WARNING,
        message: 'Consider appointing an executor to manage your estate',
        messageKey: 'executor_missing',
        field: 'executor_data',
        autoSuggestion: 'Add a trusted person as executor',
      });
    } else {
      // Check if executor is also a major beneficiary (potential conflict)
      const executorIsBeneficiary = beneficiaries.some(
        b =>
          b.name.toLowerCase() ===
            executorData.primaryExecutor!.name.toLowerCase() &&
          b.percentage > 50
      );

      if (executorIsBeneficiary) {
        results.push({
          isValid: true,
          level: ValidationLevel.WARNING,
          message:
            'Your executor is also a major beneficiary. Consider appointing a neutral executor or backup executor',
          messageKey: 'executor_beneficiary_conflict',
          field: 'executor_data',
          autoSuggestion: 'Add an independent backup executor',
        });
      } else {
        results.push({
          isValid: true,
          level: ValidationLevel.SUCCESS,
          message: 'Executor appointment looks good',
          messageKey: 'executor_valid',
        });
      }
    }

    return results;
  }

  /**
   * Validates witness requirements based on will type and jurisdiction
   */
  validateWitnessRequirements(
    willType: string,
    witnessData?: any
  ): ValidationResult {
    // Map 'witnessed' to 'alographic' for consistency
    const mappedWillType = willType === 'witnessed' ? 'alographic' : willType;
    const requiredWitnesses =
      this.rules.witnessRequirements[
        mappedWillType as keyof typeof this.rules.witnessRequirements
      ];

    if (requiredWitnesses === undefined) {
      return {
        isValid: false,
        level: ValidationLevel.WARNING,
        message: `Unknown will type: ${willType}`,
        messageKey: 'unknown_will_type',
        field: 'will_type',
      };
    }

    if (requiredWitnesses === 0) {
      return {
        isValid: true,
        level: ValidationLevel.SUCCESS,
        message: 'No witnesses required for this will type',
        messageKey: 'witnesses_not_required',
      };
    }

    const actualWitnesses = witnessData?.length || 0;

    if (actualWitnesses < requiredWitnesses) {
      return {
        isValid: false,
        level: ValidationLevel.ERROR,
        message: `${this.jurisdiction} law requires ${requiredWitnesses} witnesses for ${willType} wills. You have ${actualWitnesses}`,
        messageKey: 'witnesses_insufficient',
        field: 'witnesses',
        autoSuggestion: `Add ${requiredWitnesses - actualWitnesses} more witness${requiredWitnesses - actualWitnesses > 1 ? 'es' : ''}`,
      };
    }

    if (actualWitnesses > requiredWitnesses) {
      return {
        isValid: true,
        level: ValidationLevel.WARNING,
        message: `You have more witnesses than required (${actualWitnesses} vs ${requiredWitnesses}). This is allowed but not necessary`,
        messageKey: 'witnesses_excess',
        field: 'witnesses',
      };
    }

    return {
      isValid: true,
      level: ValidationLevel.SUCCESS,
      message: 'Witness requirements satisfied',
      messageKey: 'witnesses_valid',
    };
  }

  /**
   * Comprehensive validation of entire will document
   */
  validateWillDocument(willData: WillData, willType: string): ComplianceReport {
    const allResults: ValidationResult[] = [];
    const forcedHeirsReport = this.checkForcedHeirsCompliance(
      willData,
      this.jurisdiction
    );
    const legalConflicts = this.detectLegalConflicts(
      willData.assets,
      willData.beneficiaries
    );

    // Basic validations
    allResults.push(
      this.validateBeneficiaryShares(willData.beneficiaries, this.jurisdiction)
    );
    allResults.push(this.validateWitnessRequirements(willType));
    allResults.push(
      ...this.validateExecutor(willData.executor_data, willData.beneficiaries)
    );

    // Personal data validation
    if (!willData.testator_data.fullName) {
      allResults.push({
        isValid: false,
        level: ValidationLevel.ERROR,
        message: 'Full name is required',
        messageKey: 'testator_name_required',
        field: 'testator_data.fullName',
      });
    }

    if (!willData.testator_data.dateOfBirth) {
      allResults.push({
        isValid: false,
        level: ValidationLevel.ERROR,
        message: 'Date of birth is required',
        messageKey: 'testator_dob_required',
        field: 'testator_data.dateOfBirth',
      });
    }

    if (!willData.testator_data.address) {
      allResults.push({
        isValid: false,
        level: ValidationLevel.ERROR,
        message: 'Address is required',
        messageKey: 'testator_address_required',
        field: 'testator_data.address',
      });
    }

    // Combine all results
    const combinedResults = [
      ...allResults,
      ...forcedHeirsReport.validationResults,
      ...forcedHeirsReport.forcedHeirsIssues,
    ];

    const hasErrors =
      combinedResults.some(r => r.level === 'error') ||
      legalConflicts.some(c => c.severity === 'critical');
    const hasWarnings =
      combinedResults.some(r => r.level === 'warning') ||
      legalConflicts.some(c => c.severity === 'high');

    return {
      overall: hasErrors
        ? 'non-compliant'
        : hasWarnings
          ? 'partial'
          : 'compliant',
      validationResults: combinedResults,
      forcedHeirsIssues: forcedHeirsReport.forcedHeirsIssues,
      forcedHeirsProtected: forcedHeirsReport.forcedHeirsProtected || [],
      isCompliant: !hasErrors,
      legalConflicts: legalConflicts.map(conflict => ({
        isValid: false,
        level: conflict.severity === 'critical' ? ValidationLevel.ERROR : ValidationLevel.WARNING,
        message: conflict.message,
        messageKey: `conflict_${conflict.type}`,
        field: conflict.affectedFields[0],
        autoSuggestion: conflict.suggestion,
      })),
    };
  }

  /**
   * Get real-time validation for a specific field
   */
  validateField(
    fieldName: string,
    value: any,
    _willData: WillData
  ): ValidationResult {
    switch (fieldName) {
      case 'beneficiaries':
        return this.validateBeneficiaryShares(value, this.jurisdiction);

      case 'testator.personalInfo.name':
      case 'testator_data.fullName':
        return {
          isValid: !!value && value.length > 0,
          level: value && value.length > 0 ? ValidationLevel.SUCCESS : ValidationLevel.ERROR,
          message:
            value && value.length > 0 ? 'Valid name' : 'Full name is required',
          messageKey:
            value && value.length > 0 ? 'name_valid' : 'name_required',
          field: fieldName,
        };

      case 'executor_data.primaryExecutor.name':
        if (!value) {
          return {
            isValid: false,
            level: ValidationLevel.WARNING,
            message: 'Consider appointing an executor',
            messageKey: 'executor_recommended',
            field: fieldName,
            autoSuggestion: 'Add a trusted person as executor',
          };
        }
        return {
          isValid: true,
          level: ValidationLevel.SUCCESS,
          message: 'Executor appointed',
          messageKey: 'executor_valid',
          field: fieldName,
        };

      default:
        return {
          isValid: true,
          level: ValidationLevel.INFO,
          message: 'Field validation not implemented',
          messageKey: 'validation_not_implemented',
          field: fieldName,
        };
    }
  }
}

// Export singleton instance
export const legalValidator = new LegalValidator();

// Utility functions for UI components
// Add additional validation functions
export const validateTestatorAge = (dateOfBirth: string): ValidationResult => {
  const birthDate = new Date(dateOfBirth);
  const age = new Date().getFullYear() - birthDate.getFullYear();

  if (age < 18) {
    return {
      isValid: false,
      level: ValidationLevel.ERROR,
      message: 'Testator must be at least 18 years old to create a valid will',
      messageKey: 'testator_age_invalid',
      field: 'testator_data.dateOfBirth',
      autoSuggestion: 'Verify the date of birth is correct',
    };
  }

  return {
    isValid: true,
    level: ValidationLevel.SUCCESS,
    message: 'Testator age is valid',
    messageKey: 'testator_age_valid',
  };
};

export const validateGuardianship = (guardianship: any): ValidationResult => {
  if (
    !guardianship ||
    (!guardianship.guardian && !guardianship.alternateGuardian)
  ) {
    return {
      isValid: false,
      level: ValidationLevel.WARNING,
      message: 'Consider appointing a guardian for any minor children',
      messageKey: 'guardianship_recommended',
      field: 'guardianship',
      autoSuggestion: 'Add a trusted person as guardian',
    };
  }

  return {
    isValid: true,
    level: ValidationLevel.SUCCESS,
    message: 'Guardianship provisions are complete',
    messageKey: 'guardianship_valid',
  };
};

export const validateSpecialProvisions = (
  specialProvisions: string[]
): ValidationResult => {
  if (!specialProvisions || specialProvisions.length === 0) {
    return {
      isValid: true,
      level: ValidationLevel.INFO,
      message: 'No special provisions specified',
      messageKey: 'special_provisions_none',
    };
  }

  return {
    isValid: true,
    level: ValidationLevel.SUCCESS,
    message: `${specialProvisions.length} special provision(s) specified`,
    messageKey: 'special_provisions_valid',
  };
};

export const getValidationIcon = (level: ValidationResult['level']): string => {
  switch (level) {
    case 'error':
      return '❌';
    case 'warning':
      return '⚠️';
    case 'success':
      return '✅';
    case 'info':
      return 'ℹ️';
    default:
      return '';
  }
};

export const getValidationColor = (
  level: ValidationResult['level']
): string => {
  switch (level) {
    case 'error':
      return 'text-red-600 border-red-200 bg-red-50';
    case 'warning':
      return 'text-yellow-600 border-yellow-200 bg-yellow-50';
    case 'success':
      return 'text-green-600 border-green-200 bg-green-50';
    case 'info':
      return 'text-blue-600 border-blue-200 bg-blue-50';
    default:
      return 'text-gray-600';
  }
};
