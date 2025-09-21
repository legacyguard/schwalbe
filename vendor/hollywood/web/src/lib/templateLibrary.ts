
/**
 * Template Library
 * Manages will templates for different jurisdictions and languages
 */

import {
  CZ_SK_JURISDICTIONS,
  type Jurisdiction,
  type LanguageCode,
  type TemplateLibrary,
  type ValidationError,
  type WillJurisdictionConfig,
  type WillTemplate,
  type WillTemplateType,
  type WillUserData,
  type WillValidationResult,
} from '../types/will-templates';

class TemplateLibraryImpl implements TemplateLibrary {
  private templates: Map<string, WillTemplate> = new Map();
  private configs: Map<Jurisdiction, WillJurisdictionConfig> = new Map();

  constructor() {
    this.initializeConfigs();
    this.loadTemplates();
  }

  /**
   * Initialize jurisdiction configurations
   */
  private initializeConfigs() {
    // Load Czech Republic and Slovakia configurations
    this.configs.set('CZ', CZ_SK_JURISDICTIONS.CZ);
    this.configs.set('SK', CZ_SK_JURISDICTIONS.SK);
  }

  /**
   * Load available templates
   */
  private async loadTemplates() {
    // Czech Republic templates
    await this.loadTemplate('CZ', 'holographic', 'cs');
    await this.loadTemplate('CZ', 'witnessed', 'cs');
    await this.loadTemplate('CZ', 'notarial', 'cs');

    // Slovakia templates
    await this.loadTemplate('SK', 'holographic', 'sk');
    await this.loadTemplate('SK', 'witnessed', 'sk');
    await this.loadTemplate('SK', 'notarial', 'sk');

    // Future templates will be loaded here as they're added
  }

  /**
   * Load a specific template configuration
   */
  private async loadTemplate(
    jurisdiction: Jurisdiction,
    type: WillTemplateType,
    language: LanguageCode
  ) {
    try {
      const configPath = `/content/templates/${jurisdiction.toLowerCase()}/${type}/config.json`;
      const response = await fetch(configPath);

      if (!response.ok) {
        console.warn(`Template config not found: ${configPath}`);
        return;
      }

      const config = await response.json();
      const templateId = `${jurisdiction.toLowerCase()}-${type}-${language}`;

      const template: WillTemplate = {
        id: templateId,
        jurisdiction,
        type,
        language,
        version: config.version,
        metadata: config.metadata,
        structure: {
          header: {
            id: 'header',
            title: 'Document Header',
            content: '',
            order: 0,
            required: true,
          },
          sections: config.sections || [],
          footer: {
            id: 'footer',
            title: 'Document Footer',
            content: '',
            order: 999,
            required: true,
          },
          executionInstructions: config.executionInstructions,
        },
        variables: config.variables,
        validationRules: config.validationRules,
        legalClauses: config.legalClauses,
      };

      this.templates.set(templateId, template);
      // console.log(`Loaded template: ${templateId}`);
    } catch (error) {
      console.error(
        `Failed to load template ${jurisdiction}-${type}-${language}:`,
        error
      );
    }
  }

  /**
   * Get a specific template
   */
  async getTemplate(
    jurisdiction: Jurisdiction,
    type: WillTemplateType,
    language: LanguageCode
  ): Promise<WillTemplate> {
    const templateId = `${jurisdiction.toLowerCase()}-${type}-${language}`;
    let template = this.templates.get(templateId);

    if (!template) {
      // Try to load the template dynamically
      await this.loadTemplate(jurisdiction, type, language);
      template = this.templates.get(templateId);
    }

    if (!template) {
      // Fallback to English if specific language not available
      if (language !== 'en') {
        return this.getTemplate(jurisdiction, type, 'en');
      }
      throw new Error(`Template not found: ${templateId}`);
    }

    return template;
  }

  /**
   * Get all available templates
   */
  async getAllTemplates(): Promise<WillTemplate[]> {
    return Array.from(this.templates.values());
  }

  /**
   * Get jurisdiction configuration
   */
  async getJurisdictionConfig(
    jurisdiction: Jurisdiction
  ): Promise<WillJurisdictionConfig> {
    const config = this.configs.get(jurisdiction);
    if (!config) {
      throw new Error(`Jurisdiction not supported: ${jurisdiction}`);
    }
    return config;
  }

  /**
   * Get supported languages for a jurisdiction
   */
  async getSupportedLanguages(
    jurisdiction: Jurisdiction
  ): Promise<LanguageCode[]> {
    const config = await this.getJurisdictionConfig(jurisdiction);
    return config.supportedLanguages;
  }

  /**
   * Validate will data against template requirements
   */
  async validateWillData(
    data: WillUserData,
    template: WillTemplate
  ): Promise<WillValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const missingRequired: string[] = [];

    // Validate required variables
    for (const variable of template.variables) {
      if (variable.required) {
        const value = this.getDataValue(
          data,
          variable.key,
          variable.dataSource || 'user'
        );

        if (this.isEmpty(value)) {
          missingRequired.push(variable.key);
          errors.push({
            field: variable.key,
            code: 'REQUIRED_FIELD_MISSING',
            message: `${variable.label} is required`,
            severity: 'error',
          });
        }
      }
    }

    // Apply validation rules
    for (const rule of template.validationRules) {
      if (!rule.field) continue; // Skip rules without field specified
      const fieldValue = this.getDataValue(data, rule.field, 'user');
      const validationError = this.applyValidationRule(rule, fieldValue);

      if (validationError) {
        if (validationError.severity === 'error') {
          errors.push(validationError);
        } else {
          warnings.push(validationError);
        }
      }
    }

    // Legal compliance checks
    const jurisdictionConfig = await this.getJurisdictionConfig(
      template.jurisdiction
    );
    const legalErrors = await this.validateLegalCompliance(
      data,
      jurisdictionConfig
    );
    errors.push(...legalErrors);

    // Calculate completeness score
    const totalRequired = template.variables.filter(v => v.required).length;
    const completedRequired = totalRequired - missingRequired.length;
    const completenessScore =
      totalRequired > 0 ? (completedRequired / totalRequired) * 100 : 100;

    return {
      isValid: errors.length === 0,
      completenessScore,
      errors,
      warnings,
      legalRequirementsMet: legalErrors.length === 0,
      missingRequiredFields: missingRequired,
      suggestedImprovements: this.generateSuggestedImprovements(data),
    };
  }

  /**
   * Get data value based on source and key
   */
  private getDataValue(
    data: WillUserData,
    key: string,
    source: string
  ): unknown {
    switch (source) {
      case 'user':
        return (
          this.getNestedValue(data.personal, key) ||
          this.getNestedValue(data.family, key) ||
          this.getNestedValue(data.specialInstructions, key)
        );
      case 'beneficiary':
        return data.beneficiaries;
      case 'asset':
        return data.assets;
      case 'guardian':
        return data.guardians;
      case 'system':
        if (key === 'currentDate') return new Date().toISOString();
        return null;
      default:
        return null;
    }
  }

  /**
   * Apply validation rule to field value
   */
  private applyValidationRule(
    rule: Record<string, any>,
    value: unknown
  ): null | ValidationError {
    switch (rule.type) {
      case 'required':
        if (this.isEmpty(value)) {
          return {
            field: rule.field,
            code: 'REQUIRED',
            message: rule.message,
            severity: rule.severity || 'error',
          };
        }
        break;

      case 'minLength':
        if (typeof value === 'string' && value.length < rule.value) {
          return {
            field: rule.field,
            code: 'MIN_LENGTH',
            message: rule.message,
            severity: rule.severity || 'error',
          };
        }
        break;

      case 'pattern':
        if (typeof value === 'string' && !new RegExp(rule.value).test(value)) {
          return {
            field: rule.field,
            code: 'PATTERN_MISMATCH',
            message: rule.message,
            severity: rule.severity || 'error',
          };
        }
        break;

      case 'legal':
        if (
          rule.field === 'age' &&
          typeof value === 'number' &&
          value < rule.value
        ) {
          return {
            field: rule.field,
            code: 'LEGAL_REQUIREMENT',
            message: rule.message,
            severity: 'error',
            legalReference: 'Minimum age requirement',
          };
        }
        break;

      case 'custom':
        // Handle custom validation rules
        if (rule.field === 'beneficiaries' && rule.condition === 'length > 0') {
          if (!Array.isArray(value) || value.length === 0) {
            return {
              field: rule.field,
              code: 'CUSTOM_VALIDATION',
              message: rule.message,
              severity: rule.severity || 'error',
            };
          }
        }
        break;
    }

    return null;
  }

  /**
   * Validate legal compliance
   */
  private async validateLegalCompliance(
    data: WillUserData,
    config: WillJurisdictionConfig
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Age requirement
    const age = this.calculateAge(data.personal.dateOfBirth);
    if (age < config.legalRequirements.minimumAge) {
      errors.push({
        field: 'age',
        code: 'LEGAL_AGE_REQUIREMENT',
        message: `Testator must be at least ${config.legalRequirements.minimumAge} years old`,
        severity: 'error',
        legalReference: 'Minimum age for will creation',
      });
    }

    // Forced heirship compliance (if applicable)
    if (config.legalRequirements.forcedHeirship) {
      const forcedHeirErrors = this.validateForcedHeirship(data);
      errors.push(...forcedHeirErrors);
    }

    return errors;
  }

  /**
   * Validate forced heirship requirements
   */
  private validateForcedHeirship(data: WillUserData): ValidationError[] {
    const errors: ValidationError[] = [];

    // This is a simplified check - in practice, this would be more complex
    const hasSpouse = data.family.spouse !== undefined;
    const hasChildren = data.family.children && data.family.children.length > 0;

    if (hasSpouse || hasChildren) {
      // Check if beneficiaries respect forced heirship
      const totalPercentage = data.beneficiaries.reduce((sum, b) => {
        if (
          b.share.type === 'percentage' &&
          typeof b.share.value === 'number'
        ) {
          return sum + b.share.value;
        }
        return sum;
      }, 0);

      if (totalPercentage > 100) {
        errors.push({
          field: 'beneficiaries',
          code: 'FORCED_HEIRSHIP_VIOLATION',
          message:
            'Distribution percentages exceed 100% - may violate forced heirship rules',
          severity: 'warning',
          legalReference: 'Forced heirship provisions',
          suggestedFix:
            'Review beneficiary percentages to ensure compliance with mandatory inheritance shares',
        });
      }
    }

    return errors;
  }

  /**
   * Generate suggested improvements
   */
  private generateSuggestedImprovements(data: WillUserData): string[] {
    const suggestions: string[] = [];

    // Check for executors
    if (!data.executors || data.executors.length === 0) {
      suggestions.push('Consider appointing an executor to manage your estate');
    } else if (data.executors.length === 1) {
      suggestions.push(
        'Consider appointing a backup executor in case the primary executor cannot serve'
      );
    }

    // Check for guardianship
    const hasMinorChildren = data.family.children?.some(child => child.isMinor);
    if (hasMinorChildren && (!data.guardians || data.guardians.length === 0)) {
      suggestions.push('Appoint guardians for your minor children');
    }

    // Check for assets documentation
    if (data.assets.length === 0) {
      suggestions.push(
        'Consider adding asset information to ensure comprehensive estate planning'
      );
    }

    // Check for digital assets
    const hasDigitalAssets = data.specialInstructions.some(
      i => i.type === 'digital_assets'
    );
    if (!hasDigitalAssets) {
      suggestions.push(
        'Consider including instructions for digital assets and online accounts'
      );
    }

    return suggestions;
  }

  /**
   * Utility methods
   */
  private isEmpty(value: any): boolean {
    return (
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'object' && Object.keys(value).length === 0)
    );
  }

  private getNestedValue(obj: Record<string, any>, path: string): unknown {
    if (!obj || !path) return null;
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

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

  /**
   * Get available jurisdictions
   */
  getAvailableJurisdictions(): Jurisdiction[] {
    return Array.from(this.configs.keys());
  }

  /**
   * Get available template types for jurisdiction
   */
  getAvailableTemplateTypes(jurisdiction: Jurisdiction): WillTemplateType[] {
    const config = this.configs.get(jurisdiction);
    return config?.supportedWillTypes || [];
  }

  /**
   * Check if template exists
   */
  hasTemplate(
    jurisdiction: Jurisdiction,
    type: WillTemplateType,
    language: LanguageCode
  ): boolean {
    const templateId = `${jurisdiction.toLowerCase()}-${type}-${language}`;
    return this.templates.has(templateId);
  }
}

// Export singleton instance
export const templateLibrary = new TemplateLibraryImpl();
