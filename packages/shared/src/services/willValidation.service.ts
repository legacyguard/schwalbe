/**
 * Will Validation Service
 * Comprehensive validation for will generation and legal compliance
 * Migrated from Hollywood codebase with enhancements
 */

import type {
  AssetInfo,
  BeneficiaryInfo,
  Jurisdiction,
  ValidationError,
  WillJurisdictionConfig,
  WillTemplate,
  WillUserData,
  WillValidationResult,
  FamilyInfo,
  PersonalInfo,
  ExecutorInfo,
  GuardianshipInfo,
} from '../types/will';
import { logger } from '../lib/logger';

export class WillValidationService {
  /**
   * Comprehensive will validation
   */
  async validateWillData(
    userData: WillUserData,
    template: WillTemplate,
    jurisdictionConfig: WillJurisdictionConfig
  ): Promise<WillValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const missingRequired: string[] = [];

    try {
      logger.info('Starting will validation', {
        userId: userData.personal.userId,
        jurisdiction: jurisdictionConfig.jurisdiction
      });

      // 1. Personal Information Validation
      const personalErrors = this.validatePersonalInformation(
        userData.personal,
        jurisdictionConfig
      );
      errors.push(...personalErrors.errors);
      warnings.push(...personalErrors.warnings);
      missingRequired.push(...personalErrors.missing);

      // 2. Family Information Validation
      const familyErrors = this.validateFamilyInformation(userData.family);
      errors.push(...familyErrors.errors);
      warnings.push(...familyErrors.warnings);

      // 3. Beneficiary Validation
      const beneficiaryErrors = this.validateBeneficiaries(
        userData.beneficiaries,
        userData.family,
        jurisdictionConfig
      );
      errors.push(...beneficiaryErrors.errors);
      warnings.push(...beneficiaryErrors.warnings);

      // 4. Asset Validation
      const assetErrors = this.validateAssets(userData.assets);
      errors.push(...assetErrors.errors);
      warnings.push(...assetErrors.warnings);

      // 5. Executor Validation
      const executorErrors = this.validateExecutors(userData.executors);
      errors.push(...executorErrors.errors);
      warnings.push(...executorErrors.warnings);

      // 6. Guardian Validation (for minor children)
      const guardianErrors = this.validateGuardians(
        userData.guardians || [],
        userData.family
      );
      errors.push(...guardianErrors.errors);
      warnings.push(...guardianErrors.warnings);

      // 7. Legal Compliance Validation
      const legalErrors = await this.validateLegalCompliance(
        userData,
        jurisdictionConfig
      );
      errors.push(...legalErrors.errors);
      warnings.push(...legalErrors.warnings);

      // 8. Template-specific validation
      const templateErrors = this.validateTemplateRequirements(
        userData,
        template
      );
      errors.push(...templateErrors.errors);
      warnings.push(...templateErrors.warnings);
      missingRequired.push(...templateErrors.missing);

      // Calculate completeness score
      const totalRequiredFields = this.getTotalRequiredFields(template);
      const completedFields = totalRequiredFields - missingRequired.length;
      const completenessScore =
        totalRequiredFields > 0
          ? (completedFields / totalRequiredFields) * 100
          : 100;

      const result = {
        isValid: errors.length === 0,
        completenessScore: Math.round(completenessScore * 100) / 100,
        errors: this.deduplicateErrors(errors),
        warnings: this.deduplicateErrors(warnings),
        legalRequirementsMet: legalErrors.errors.length === 0,
        missingRequiredFields: [...new Set(missingRequired)],
        suggestedImprovements: this.generateSuggestedImprovements(
          userData,
          errors,
          warnings
        ),
      };

      logger.info('Will validation completed', {
        userId: userData.personal.userId,
        isValid: result.isValid,
        completenessScore: result.completenessScore,
        errorCount: result.errors.length,
        warningCount: result.warnings.length
      });

      return result;
    } catch (error) {
      logger.error('Will validation failed', {
        userId: userData.personal?.userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Validate personal information
   */
  private validatePersonalInformation(
    personal: PersonalInfo,
    config: WillJurisdictionConfig
  ) {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const missing: string[] = [];

    // Required fields
    if (!personal.fullName?.trim()) {
      missing.push('fullName');
      errors.push({
        field: 'personal.fullName',
        code: 'REQUIRED_FIELD',
        message: 'Full name is required',
        severity: 'error',
      });
    }

    if (!personal.dateOfBirth) {
      missing.push('dateOfBirth');
      errors.push({
        field: 'personal.dateOfBirth',
        code: 'REQUIRED_FIELD',
        message: 'Date of birth is required',
        severity: 'error',
      });
    } else {
      // Age validation
      const age = this.calculateAge(personal.dateOfBirth);
      if (age < config.legalRequirements.minimumAge) {
        errors.push({
          field: 'personal.dateOfBirth',
          code: 'LEGAL_AGE_REQUIREMENT',
          message: `Must be at least ${config.legalRequirements.minimumAge} years old to create a will`,
          severity: 'error',
          legalReference: `Minimum age requirement for ${config.jurisdiction}`,
        });
      }

      if (age > 100) {
        warnings.push({
          field: 'personal.dateOfBirth',
          code: 'UNUSUAL_AGE',
          message: 'Please verify the date of birth is correct',
          severity: 'warning',
        });
      }
    }

    if (!personal.address || !this.validateAddress(personal.address)) {
      missing.push('address');
      errors.push({
        field: 'personal.address',
        code: 'REQUIRED_FIELD',
        message: 'Valid address is required',
        severity: 'error',
      });
    }

    if (!personal.citizenship) {
      missing.push('citizenship');
      errors.push({
        field: 'personal.citizenship',
        code: 'REQUIRED_FIELD',
        message: 'Citizenship is required',
        severity: 'error',
      });
    }

    // Personal ID validation (jurisdiction specific)
    if (config.jurisdiction === 'CZ' || config.jurisdiction === 'SK') {
      if (
        personal.personalId &&
        !this.validatePersonalId(personal.personalId, config.jurisdiction)
      ) {
        errors.push({
          field: 'personal.personalId',
          code: 'INVALID_FORMAT',
          message: `Invalid ${config.jurisdiction === 'CZ' ? 'rodné číslo' : 'rodné číslo'} format`,
          severity: 'error',
        });
      }
    }

    return { errors, warnings, missing };
  }

  /**
   * Validate family information
   */
  private validateFamilyInformation(family: FamilyInfo) {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Validate spouse information
    if (family.spouse) {
      if (!family.spouse.fullName?.trim()) {
        errors.push({
          field: 'family.spouse.fullName',
          code: 'REQUIRED_FIELD',
          message: 'Spouse name is required if spouse is specified',
          severity: 'error',
        });
      }
    }

    // Validate children information
    if (family.children && Array.isArray(family.children)) {
      family.children.forEach((child, index) => {
        if (!child.fullName?.trim()) {
          errors.push({
            field: `family.children[${index}].fullName`,
            code: 'REQUIRED_FIELD',
            message: `Child ${index + 1} name is required`,
            severity: 'error',
          });
        }

        if (!child.dateOfBirth) {
          errors.push({
            field: `family.children[${index}].dateOfBirth`,
            code: 'REQUIRED_FIELD',
            message: `Child ${index + 1} date of birth is required`,
            severity: 'error',
          });
        } else {
          const age = this.calculateAge(child.dateOfBirth);
          child.isMinor = age < 18; // Set minor status
        }
      });
    }

    return { errors, warnings };
  }

  /**
   * Validate beneficiaries
   */
  private validateBeneficiaries(
    beneficiaries: BeneficiaryInfo[],
    family: FamilyInfo,
    config: WillJurisdictionConfig
  ) {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    if (!beneficiaries || beneficiaries.length === 0) {
      errors.push({
        field: 'beneficiaries',
        code: 'REQUIRED_FIELD',
        message: 'At least one beneficiary must be specified',
        severity: 'error',
      });
      return { errors, warnings };
    }

    let totalPercentage = 0;
    const percentageBeneficiaries = beneficiaries.filter(
      b => b.share.type === 'percentage'
    );

    beneficiaries.forEach((beneficiary, index) => {
      // Required fields
      if (!beneficiary.name?.trim()) {
        errors.push({
          field: `beneficiaries[${index}].name`,
          code: 'REQUIRED_FIELD',
          message: `Beneficiary ${index + 1} name is required`,
          severity: 'error',
        });
      }

      if (!beneficiary.relationship?.trim()) {
        errors.push({
          field: `beneficiaries[${index}].relationship`,
          code: 'REQUIRED_FIELD',
          message: `Beneficiary ${index + 1} relationship is required`,
          severity: 'error',
        });
      }

      // Share validation
      if (!beneficiary.share.type) {
        errors.push({
          field: `beneficiaries[${index}].share.type`,
          code: 'REQUIRED_FIELD',
          message: `Beneficiary ${index + 1} share type is required`,
          severity: 'error',
        });
      }

      if (beneficiary.share.type === 'percentage') {
        const percentage = Number(beneficiary.share.value);
        if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
          errors.push({
            field: `beneficiaries[${index}].share.value`,
            code: 'INVALID_PERCENTAGE',
            message: `Beneficiary ${index + 1} percentage must be between 1 and 100`,
            severity: 'error',
          });
        } else {
          totalPercentage += percentage;
        }
      }

      // Contact information validation
      if (
        beneficiary.contactInfo?.email &&
        !this.validateEmail(beneficiary.contactInfo.email)
      ) {
        errors.push({
          field: `beneficiaries[${index}].contactInfo.email`,
          code: 'INVALID_EMAIL',
          message: `Beneficiary ${index + 1} email format is invalid`,
          severity: 'error',
        });
      }
    });

    // Total percentage validation
    if (percentageBeneficiaries.length > 0 && totalPercentage > 100) {
      errors.push({
        field: 'beneficiaries',
        code: 'PERCENTAGE_OVERFLOW',
        message: `Total percentage (${totalPercentage}%) exceeds 100%`,
        severity: 'error',
      });
    } else if (percentageBeneficiaries.length > 0 && totalPercentage < 100) {
      warnings.push({
        field: 'beneficiaries',
        code: 'PERCENTAGE_UNDERFLOW',
        message: `Total percentage (${totalPercentage}%) is less than 100%. Remaining will go to residuary estate.`,
        severity: 'warning',
      });
    }

    // Forced heirship validation
    if (config.legalRequirements.forcedHeirship) {
      const forcedHeirshipErrors = this.validateForcedHeirship(
        beneficiaries,
        family,
        config
      );
      errors.push(...forcedHeirshipErrors);
    }

    return { errors, warnings };
  }

  /**
   * Validate forced heirship requirements
   */
  private validateForcedHeirship(
    beneficiaries: BeneficiaryInfo[],
    family: FamilyInfo,
    config: WillJurisdictionConfig
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    if (config.jurisdiction === 'CZ' || config.jurisdiction === 'SK') {
      const hasSpouse = family.spouse !== undefined;
      const hasChildren = family.children && family.children.length > 0;
      const hasMinorChildren = family.children?.some(c => c.isMinor);

      // Czech/Slovak forced heirship rules
      if (hasSpouse || hasChildren) {
        const spouseBeneficiary = beneficiaries.find(
          b => b.relationship === 'spouse'
        );
        const childrenBeneficiaries = beneficiaries.filter(
          b => b.relationship === 'child'
        );

        if (hasSpouse && !spouseBeneficiary) {
          errors.push({
            field: 'beneficiaries',
            code: 'FORCED_HEIRSHIP_VIOLATION',
            message:
              'Spouse must be included as a beneficiary under forced heirship rules',
            severity: 'error',
            legalReference: 'Forced heirship provisions',
          });
        }

        if (hasMinorChildren && childrenBeneficiaries.length === 0) {
          errors.push({
            field: 'beneficiaries',
            code: 'FORCED_HEIRSHIP_VIOLATION',
            message:
              'Minor children must be included as beneficiaries under forced heirship rules',
            severity: 'error',
            legalReference: 'Protection of minor heirs',
          });
        }
      }
    }

    return errors;
  }

  /**
   * Validate assets
   */
  private validateAssets(assets: AssetInfo[]) {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    if (!assets || assets.length === 0) {
      warnings.push({
        field: 'assets',
        code: 'NO_ASSETS',
        message:
          'No assets specified. Consider adding asset information for comprehensive estate planning.',
        severity: 'warning',
      });
      return { errors, warnings };
    }

    assets.forEach((asset, index) => {
      if (!asset.description?.trim()) {
        errors.push({
          field: `assets[${index}].description`,
          code: 'REQUIRED_FIELD',
          message: `Asset ${index + 1} description is required`,
          severity: 'error',
        });
      }

      if (!asset.type) {
        errors.push({
          field: `assets[${index}].type`,
          code: 'REQUIRED_FIELD',
          message: `Asset ${index + 1} type is required`,
          severity: 'error',
        });
      }

      if (
        asset.value !== undefined &&
        (isNaN(asset.value) || asset.value < 0)
      ) {
        errors.push({
          field: `assets[${index}].value`,
          code: 'INVALID_VALUE',
          message: `Asset ${index + 1} value must be a positive number`,
          severity: 'error',
        });
      }

      if (
        asset.ownershipPercentage !== undefined &&
        (isNaN(asset.ownershipPercentage) ||
          asset.ownershipPercentage <= 0 ||
          asset.ownershipPercentage > 100)
      ) {
        errors.push({
          field: `assets[${index}].ownershipPercentage`,
          code: 'INVALID_PERCENTAGE',
          message: `Asset ${index + 1} ownership percentage must be between 1 and 100`,
          severity: 'error',
        });
      }
    });

    return { errors, warnings };
  }

  /**
   * Validate executors
   */
  private validateExecutors(executors: ExecutorInfo[]) {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    if (!executors || executors.length === 0) {
      warnings.push({
        field: 'executors',
        code: 'NO_EXECUTOR',
        message: 'Consider appointing an executor to manage your estate',
        severity: 'warning',
      });
      return { errors, warnings };
    }

    const primaryExecutors = executors.filter(e => e.type === 'primary');
    if (primaryExecutors.length === 0) {
      errors.push({
        field: 'executors',
        code: 'NO_PRIMARY_EXECUTOR',
        message: 'At least one primary executor must be appointed',
        severity: 'error',
      });
    } else if (primaryExecutors.length > 1) {
      warnings.push({
        field: 'executors',
        code: 'MULTIPLE_PRIMARY_EXECUTORS',
        message:
          'Multiple primary executors may complicate estate administration',
        severity: 'warning',
      });
    }

    executors.forEach((executor, index) => {
      if (!executor.name?.trim()) {
        errors.push({
          field: `executors[${index}].name`,
          code: 'REQUIRED_FIELD',
          message: `Executor ${index + 1} name is required`,
          severity: 'error',
        });
      }

      if (!executor.contactInfo?.email && !executor.contactInfo?.phone) {
        errors.push({
          field: `executors[${index}].contactInfo`,
          code: 'REQUIRED_CONTACT',
          message: `Executor ${index + 1} must have email or phone contact information`,
          severity: 'error',
        });
      }

      if (
        executor.contactInfo?.email &&
        !this.validateEmail(executor.contactInfo.email)
      ) {
        errors.push({
          field: `executors[${index}].contactInfo.email`,
          code: 'INVALID_EMAIL',
          message: `Executor ${index + 1} email format is invalid`,
          severity: 'error',
        });
      }
    });

    return { errors, warnings };
  }

  /**
   * Validate guardians for minor children
   */
  private validateGuardians(
    guardians: GuardianshipInfo[],
    family: FamilyInfo
  ) {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    const hasMinorChildren = family.children?.some(child => child.isMinor);

    if (hasMinorChildren && (!guardians || guardians.length === 0)) {
      errors.push({
        field: 'guardians',
        code: 'MINOR_CHILDREN_NO_GUARDIAN',
        message: 'Guardians must be appointed for minor children',
        severity: 'error',
        legalReference: 'Guardian appointment for minors',
      });
      return { errors, warnings };
    }

    if (guardians && guardians.length > 0) {
      guardians.forEach((guardianship, index) => {
        if (!guardianship.primaryGuardian) {
          errors.push({
            field: `guardians[${index}].primaryGuardian`,
            code: 'REQUIRED_FIELD',
            message: `Primary guardian must be specified for guardianship ${index + 1}`,
            severity: 'error',
          });
        } else {
          if (!guardianship.primaryGuardian.name?.trim()) {
            errors.push({
              field: `guardians[${index}].primaryGuardian.name`,
              code: 'REQUIRED_FIELD',
              message: `Primary guardian name is required for guardianship ${index + 1}`,
              severity: 'error',
            });
          }
        }

        if (!guardianship.alternateGuardian) {
          warnings.push({
            field: `guardians[${index}].alternateGuardian`,
            code: 'NO_BACKUP_GUARDIAN',
            message: `Consider appointing an alternate guardian for guardianship ${index + 1}`,
            severity: 'warning',
          });
        }
      });
    }

    return { errors, warnings };
  }

  /**
   * Validate legal compliance
   */
  private async validateLegalCompliance(
    _userData: WillUserData,
    config: WillJurisdictionConfig
  ) {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Mental capacity reminder
    warnings.push({
      field: 'legalCompliance',
      code: 'MENTAL_CAPACITY_REMINDER',
      message: 'Ensure you are of sound mind when signing the will',
      severity: 'info',
      legalReference: 'Mental capacity requirement',
    });

    // Witness requirements
    if (config.legalRequirements.witnessRequirements.required) {
      warnings.push({
        field: 'execution',
        code: 'WITNESS_REQUIREMENT',
        message: `This jurisdiction requires ${config.legalRequirements.witnessRequirements.minimumCount} witnesses for will execution`,
        severity: 'warning',
        legalReference: 'Witness requirements',
      });
    }

    return { errors, warnings };
  }

  /**
   * Validate template-specific requirements
   */
  private validateTemplateRequirements(
    userData: WillUserData,
    template: WillTemplate
  ) {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const missing: string[] = [];

    // Check all template variables
    template.variables.forEach(variable => {
      if (variable.required) {
        const value = this.getDataValue(
          userData,
          variable.key,
          variable.dataSource || 'user'
        );
        if (this.isEmpty(value)) {
          missing.push(variable.key);
          errors.push({
            field: variable.key,
            code: 'TEMPLATE_REQUIRED_FIELD',
            message: `${variable.label} is required for this template`,
            severity: 'error',
          });
        }
      }
    });

    return { errors, warnings, missing };
  }

  /**
   * Utility methods
   */
  private calculateAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  }

  private validateAddress(address: any): boolean {
    if (typeof address === 'string') {
      return address.trim().length > 0;
    }

    return !!(
      address &&
      typeof address.street === 'string' &&
      address.street.trim() &&
      typeof address.city === 'string' &&
      address.city.trim() &&
      typeof address.country === 'string' &&
      address.country.trim()
    );
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private validatePersonalId(
    personalId: string,
    jurisdiction: Jurisdiction
  ): boolean {
    if (jurisdiction === 'CZ' || jurisdiction === 'SK') {
      // Czech/Slovak rodné číslo format: RRMMDD/XXXX or RRMMDDD/XXX
      const regex = /^\d{6}\/\d{3,4}$/;
      return regex.test(personalId);
    }
    return true; // Other jurisdictions
  }

  private isEmpty(value: any): boolean {
    return (
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'object' && Object.keys(value).length === 0)
    );
  }

  private getDataValue(
    data: WillUserData,
    key: string,
    source: string
  ): unknown {
    switch (source) {
      case 'user':
        return (
          this.getNestedValue(data.personal, key) ||
          this.getNestedValue(data.family, key)
        );
      case 'beneficiary':
        return data.beneficiaries;
      case 'asset':
        return data.assets;
      case 'guardian':
        return data.guardians;
      case 'executor':
        return data.executors;
      default:
        return null;
    }
  }

  private getNestedValue(obj: Record<string, any>, path: string): unknown {
    if (!obj || !path) return null;
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  private getTotalRequiredFields(template: WillTemplate): number {
    return template.variables.filter(v => v.required).length;
  }

  private deduplicateErrors(errors: ValidationError[]): ValidationError[] {
    const seen = new Set();
    return errors.filter(error => {
      const key = `${error.field}-${error.code}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private generateSuggestedImprovements(
    _userData: WillUserData,
    errors: ValidationError[],
    warnings: ValidationError[]
  ): string[] {
    const suggestions: string[] = [];

    // Based on common issues
    if (errors.some(e => e.field.includes('executor'))) {
      suggestions.push(
        'Ensure all executor information is complete and accurate'
      );
    }

    if (warnings.some(w => w.code === 'NO_EXECUTOR')) {
      suggestions.push('Consider appointing a trusted person as executor');
    }

    if (warnings.some(w => w.code === 'NO_BACKUP_GUARDIAN')) {
      suggestions.push('Add backup guardians for better protection');
    }

    if (errors.some(e => e.code === 'FORCED_HEIRSHIP_VIOLATION')) {
      suggestions.push(
        'Review beneficiary structure to comply with forced heirship laws'
      );
    }

    return suggestions;
  }
}

// Export singleton instance
export const willValidationService = new WillValidationService();