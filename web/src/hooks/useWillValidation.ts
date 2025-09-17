
import { useEffect, useMemo, useState } from 'react';
import {
  type ComplianceReport,
  legalValidator,
  type ValidationResult,
} from '@/lib/will-legal-validator';
import type { WillData } from '@/components/legacy/WillWizard';

interface UseWillValidationProps {
  enableRealTime?: boolean;
  jurisdiction?: string;
  willData: WillData;
  willType: string;
}

export const useWillValidation = ({
  willData,
  willType,
  jurisdiction = 'Slovakia',
  enableRealTime = true,
}: UseWillValidationProps) => {
  const [complianceReport, setComplianceReport] =
    useState<ComplianceReport | null>(null);
  const [fieldValidations, setFieldValidations] = useState<
    Map<string, ValidationResult>
  >(new Map());
  const [isValidating, setIsValidating] = useState(false);

  // Set jurisdiction on validator
  useEffect(() => {
    if (jurisdiction) {
      legalValidator['jurisdiction'] = jurisdiction;
    }
  }, [jurisdiction]);

  // Real-time validation function
  const validateDocument = useMemo(() => {
    if (!enableRealTime) return () => {};

    return () => {
      setIsValidating(true);

      // Use setTimeout to debounce rapid changes
      const timeoutId = setTimeout(() => {
        try {
          const report = legalValidator.validateWillDocument(
            willData,
            willType
          );
          setComplianceReport(report);

          // Update field-specific validations
          const newFieldValidations = new Map<string, ValidationResult>();

          // Add field-specific validations
          report.validationResults.forEach(result => {
            if (result.field) {
              newFieldValidations.set(result.field, result);
            }
          });

          // Add forced heirs validations
          report.forcedHeirsIssues.forEach(result => {
            if (result.field) {
              newFieldValidations.set(result.field, result);
            }
          });

          // Add legal conflicts
          report.legalConflicts.forEach(result => {
            if (result.field) {
              newFieldValidations.set(result.field, result);
            }
          });

          setFieldValidations(newFieldValidations);
        } catch (error) {
          console.error('Validation error:', error);
        } finally {
          setIsValidating(false);
        }
      }, 300); // 300ms debounce

      return () => clearTimeout(timeoutId);
    };
  }, [willData, willType, enableRealTime]);

  // Trigger validation when data changes
  useEffect(() => {
    if (enableRealTime) {
      const cleanup = validateDocument();
      return cleanup;
    }
  }, [validateDocument, enableRealTime]);

  // Manual validation trigger
  const triggerValidation = () => {
    validateDocument();
  };

  // Get validation for specific field
  const getFieldValidation = (
    fieldName: string
  ): undefined | ValidationResult => {
    return fieldValidations.get(fieldName);
  };

  // Get validation for beneficiary by index
  const getBeneficiaryValidation = (
    index: number
  ): undefined | ValidationResult => {
    return fieldValidations.get(`beneficiaries[${index}]`);
  };

  // Check if field has specific validation level
  const hasFieldError = (fieldName: string): boolean => {
    const validation = fieldValidations.get(fieldName);
    return validation?.level === 'error';
  };

  const hasFieldWarning = (fieldName: string): boolean => {
    const validation = fieldValidations.get(fieldName);
    return validation?.level === 'warning';
  };

  // Get summary statistics
  const validationSummary = useMemo(() => {
    if (!complianceReport) {
      return {
        total: 0,
        errors: 0,
        warnings: 0,
        successes: 0,
        overall: 'unknown',
      };
    }

    const allValidations = [
      ...complianceReport.validationResults,
      ...complianceReport.forcedHeirsIssues,
      ...complianceReport.legalConflicts,
    ];

    return {
      total: allValidations.length,
      errors: allValidations.filter(v => v.level === 'error').length,
      warnings: allValidations.filter(v => v.level === 'warning').length,
      successes: allValidations.filter(v => v.level === 'success').length,
      overall: complianceReport.overall,
    };
  }, [complianceReport]);

  // Check if will is ready for generation
  const isWillValid = useMemo(() => {
    return validationSummary.errors === 0 && validationSummary.total > 0;
  }, [validationSummary]);

  // Get validation messages for display
  const getValidationMessages = (level?: ValidationResult['level']) => {
    if (!complianceReport) return [];

    const allValidations = [
      ...complianceReport.validationResults,
      ...complianceReport.forcedHeirsIssues,
      ...complianceReport.legalConflicts,
    ];

    if (level) {
      return allValidations.filter(v => v.level === level);
    }

    return allValidations;
  };

  // Get jurisdiction-specific guidance
  const getJurisdictionGuidance = () => {
    switch (jurisdiction) {
      case 'Slovakia':
        return {
          forcedHeirs:
            'Slovak law protects certain family members (forced heirs) who must receive minimum inheritance shares.',
          witnesses:
            'Holographic wills require no witnesses, but alographic wills need exactly 2 witnesses present simultaneously.',
          revocation: 'Previous wills must be explicitly revoked.',
          notarization:
            'Consider notarial form for maximum legal security and NCRza registration.',
        };
      case 'Czech-Republic':
        return {
          forcedHeirs:
            'Czech law protects reserved heirs (forced heirs) with minimum inheritance rights.',
          witnesses:
            'Handwritten wills need no witnesses, but typed wills require 2 witnesses.',
          revocation: 'Previous wills should be explicitly revoked.',
          notarization: 'Notarial wills provide highest legal certainty.',
        };
      default:
        return {
          forcedHeirs: 'Check local laws regarding protected family members.',
          witnesses: 'Witness requirements vary by jurisdiction.',
          revocation: 'Previous wills should typically be revoked.',
          notarization: 'Consider professional legal advice.',
        };
    }
  };

  return {
    // Core validation data
    complianceReport,
    fieldValidations,
    isValidating,

    // Summary and status
    validationSummary,
    isWillValid,

    // Utility functions
    triggerValidation,
    getFieldValidation,
    getBeneficiaryValidation,
    hasFieldError,
    hasFieldWarning,
    getValidationMessages,
    getJurisdictionGuidance,

    // Raw validation results for custom processing
    allValidations: complianceReport
      ? [
          ...complianceReport.validationResults,
          ...complianceReport.forcedHeirsIssues,
          ...complianceReport.legalConflicts,
        ]
      : [],
  };
};
