
/**
 * Will Generation Service
 * Core service for automated will generation with Sofia AI integration
 */

import type {
  BeneficiaryInfo,
  ChildInfo,
  ExecutorInfo,
  GeneratedWill,
  GuardianshipInfo,
  Jurisdiction,
  LanguageCode,
  SofiaWillAssistant,
  SpecialInstruction,
  TemplateLibrary,
  WillGenerationRequest,
  WillTemplate,
  WillUserData,
} from '../types/will-templates';
import type { Guardian } from '../types/guardian';

// Internal interfaces for will generation
interface AddressData {
  city?: string;
  country?: string;
  postalCode?: string;
  street?: string;
}

interface AssetData {
  description: string;
  id: string;
  location?: string;
  type: string;
  value?: number;
}
import { templateLibrary } from '../lib/templateLibrary';
import { sofiaAI } from '../lib/sofiaAI';
import { guardianService } from './guardianService';

export class WillGenerationService {
  private templateLibrary: TemplateLibrary;
  private sofiaAssistant: SofiaWillAssistant;

  constructor() {
    this.templateLibrary = templateLibrary;
    this.sofiaAssistant = sofiaAI;
  }

  /**
   * Generate a complete will document
   */
  async generateWill(request: WillGenerationRequest): Promise<GeneratedWill> {
    try {
      // 1. Load appropriate template
      const template = await this.templateLibrary.getTemplate(
        request.jurisdiction,
        request.willType,
        request.language
      );

      // 2. Enhance user data with Sofia AI suggestions
      const enhancedUserData = await this.enhanceUserData(
        request.userData,
        request.jurisdiction
      );

      // 3. Validate data against template requirements
      const validationResult = await this.templateLibrary.validateWillData(
        enhancedUserData,
        template
      );

      // 4. Generate AI suggestions for improvements
      const aiSuggestions = await this.sofiaAssistant.generateWillSuggestions(
        enhancedUserData,
        request.jurisdiction
      );

      // 5. Generate the will content
      const willContent = await this.generateWillContent(
        template,
        enhancedUserData,
        request.preferences
      );

      // 6. Create the final will object
      const generatedWill: GeneratedWill = {
        id: this.generateWillId(),
        templateId: template.id,
        userId: request.userId,
        jurisdiction: request.jurisdiction,
        language: request.language,
        type: request.willType,
        content: willContent,
        metadata: {
          generationDate: new Date().toISOString(),
          version: template.version,
          wordCount: this.countWords(willContent.text),
          pageCount: this.estimatePageCount(willContent.text),
          checksum: this.generateChecksum(willContent.text),
        },
        validationResult,
        aiSuggestions,
        executionInstructions: template.structure.executionInstructions,
        legalDisclaimer: this.generateLegalDisclaimer(
          request.jurisdiction,
          request.language
        ),
      };

      // 7. Final optimization with Sofia AI
      const optimizedWill =
        await this.sofiaAssistant.optimizeWillContent(generatedWill);

      // 8. Save to database if needed
      await this.saveWillToDatabase(optimizedWill);

      return optimizedWill;
    } catch (error) {
      console.error('Error generating will:', error);
      throw new Error(
        `Will generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Enhance user data with AI assistance and guardian integration
   */
  private async enhanceUserData(
    userData: WillUserData,
    jurisdiction: Jurisdiction
  ): Promise<WillUserData> {
    const enhanced = { ...userData };

    // Integrate guardian data
    if (userData.personal.fullName) {
      try {
        const userGuardians = await guardianService.getGuardians();
        enhanced.executors = this.mapGuardiansToExecutors(userGuardians);
        enhanced.guardians = this.mapGuardiansToGuardianship(
          userGuardians,
          userData.family.children
        );
      } catch (error) {
        console.warn('Failed to load guardian data:', error);
      }
    }

    // AI-enhanced beneficiary optimization
    if (enhanced.beneficiaries.length > 0 && enhanced.assets.length > 0) {
      const optimizations =
        await this.sofiaAssistant.suggestBeneficiaryOptimizations(
          enhanced.beneficiaries,
          enhanced.assets
        );

      // Apply non-breaking optimizations
      enhanced.beneficiaries = this.applyBeneficiaryOptimizations(
        enhanced.beneficiaries,
        optimizations
      );
    }

    // Validate forced heirship compliance
    if (this.hasForcedHeirship(jurisdiction)) {
      enhanced.beneficiaries = await this.ensureForcedHeirshipCompliance(
        enhanced.beneficiaries
      );
    }

    return enhanced;
  }

  /**
   * Generate will content from template and data
   */
  private async generateWillContent(
    template: WillTemplate,
    userData: WillUserData,
    preferences: any
  ): Promise<{ html: string; pdf?: ArrayBuffer; text: string }> {
    // Load template content
    const templateContent = await this.loadTemplateContent(template);

    // Prepare template variables
    const variables = this.prepareTemplateVariables(userData, template);

    // Process template with Handlebars-like syntax
    const processedText = this.processTemplate(templateContent, variables);

    // Generate HTML version
    const htmlContent = this.convertToHtml(processedText);

    // Generate PDF if requested
    let pdfContent: ArrayBuffer | undefined;
    if (preferences.generatePdf) {
      pdfContent = await this.generatePdf();
    }

    return {
      text: processedText,
      html: htmlContent,
      pdf: pdfContent,
    };
  }

  /**
   * Load template content from filesystem or database
   */
  private async loadTemplateContent(template: WillTemplate): Promise<string> {
    const templatePath = `/content/templates/${template.jurisdiction.toLowerCase()}/${template.type}/${template.language}.md`;

    try {
      const response = await fetch(templatePath);
      if (!response.ok) {
        throw new Error(`Template not found: ${templatePath}`);
      }
      return await response.text();
    } catch (error) {
      console.error('Failed to load template:', error);
      throw new Error(`Could not load template: ${template.id}`);
    }
  }

  /**
   * Prepare variables for template processing
   */
  private prepareTemplateVariables(
    userData: WillUserData,
    template: WillTemplate
  ): Record<string, any> {
    const variables: Record<string, any> = {
      // Personal information
      testatorName: userData.personal.fullName,
      birthDate: this.formatDate(userData.personal.dateOfBirth),
      birthPlace: userData.personal.placeOfBirth,
      personalId: userData.personal.personalId || '',
      address: this.formatAddress(userData.personal.address),
      citizenship: userData.personal.citizenship,
      age: this.calculateAge(userData.personal.dateOfBirth),
      maritalStatus: userData.personal.maritalStatus,

      // Family information
      spouse: userData.family.spouse,
      spouseName: userData.family.spouse?.fullName || '',
      children: userData.family.children || [],
      hasMinorChildren: this.hasMinorChildren(userData.family.children || []),
      minorChildren: this.getMinorChildren(userData.family.children || []),
      adultChildren: this.getAdultChildren(userData.family.children || []),

      // Assets
      realEstate: this.mapAssetsByType(userData.assets, 'real_estate'),
      bankAccounts: this.mapAssetsByType(userData.assets, 'bank_account'),
      vehicles: this.mapAssetsByType(userData.assets, 'vehicle'),
      personalProperty: this.mapAssetsByType(
        userData.assets,
        'personal_property'
      ),

      // Beneficiaries
      beneficiaries: userData.beneficiaries,
      residuaryBeneficiary: this.getResiduaryBeneficiary(
        userData.beneficiaries
      ),

      // Executors
      hasExecutor: userData.executors && userData.executors.length > 0,
      executorName: userData.executors?.[0]?.name || '',
      executorAddress: userData.executors?.[0]
        ? this.formatAddress(userData.executors[0].address)
        : '',
      backupExecutor: userData.executors?.[1]?.name || '',

      // Guardianship
      primaryGuardian: userData.guardians?.[0]?.primaryGuardian,
      backupGuardian: userData.guardians?.[0]?.alternateGuardian,
      guardianshipInstructions:
        userData.guardians?.[0]?.specialInstructions || '',

      // Special instructions
      funeralWishes: this.getFuneralWishes(userData.specialInstructions),
      organDonation: this.getOrganDonation(userData.specialInstructions),
      digitalAssets: this.getDigitalAssets(userData.specialInstructions),
      personalMessages: this.getPersonalMessages(userData.specialInstructions),
      charitableBequests: this.getCharitableBequests(
        userData.specialInstructions
      ),

      // System variables
      currentDate: this.formatDate(new Date().toISOString()),
      forcedHeirsNotice: this.shouldShowForcedHeirsNotice(userData, template),

      // Template configuration
      willType: {
        holographic: template.type === 'holographic',
        witnessed:
          template.type === 'witnessed' || template.type === 'allographic',
        notarial: template.type === 'notarial',
      },
    };

    return variables;
  }

  /**
   * Process template with variable substitution
   */
  private processTemplate(
    template: string,
    variables: Record<string, any>
  ): string {
    let processed = template;

    // Simple variable substitution {{variable}}
    processed = processed.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = this.getNestedValue(variables, key);
      return value !== undefined ? String(value) : match;
    });

    // Conditional blocks {{#if condition}}...{{/if}}
    processed = this.processConditionals(processed, variables);

    // Array iteration {{#each array}}...{{/each}}
    processed = this.processArrays(processed, variables);

    return processed;
  }

  /**
   * Process conditional template blocks
   */
  private processConditionals(
    template: string,
    variables: Record<string, any>
  ): string {
    return template.replace(
      /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
      (_match, condition, content) => {
        const value = this.getNestedValue(variables, condition);
        const isTrue = Boolean(value) && value !== '' && value !== 0;
        return isTrue ? content : '';
      }
    );
  }

  /**
   * Process array iteration blocks
   */
  private processArrays(
    template: string,
    variables: Record<string, any>
  ): string {
    return template.replace(
      /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g,
      (_match, arrayName, itemTemplate) => {
        const array = this.getNestedValue(variables, arrayName);
        if (!Array.isArray(array)) return '';

        return array
          .map(item => {
            let itemContent = itemTemplate;
            // Replace {{property}} with item.property
            itemContent = itemContent.replace(
              /\{\{(\w+)\}\}/g,
              (_match: string, prop: string) => {
                return (item as any)[prop] !== undefined
                  ? String((item as any)[prop])
                  : _match;
              }
            );
            return itemContent;
          })
          .join('');
      }
    );
  }

  /**
   * Convert text to HTML with basic formatting
   */
  private convertToHtml(text: string): string {
    let html = text
      // Convert headers
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')

      // Convert emphasis
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')

      // Convert horizontal rules
      .replace(/^---$/gm, '<hr>')

      // Convert line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');

    // Wrap in paragraphs
    html = `<div class="will-document"><p>${html}</p></div>`;

    return html;
  }

  /**
   * Generate PDF from HTML content
   */
  private async generatePdf(): Promise<ArrayBuffer> {
    // This would integrate with a PDF generation library like Puppeteer or jsPDF
    // For now, return empty buffer as placeholder
    return new ArrayBuffer(0);
  }

  /**
   * Map guardians to executors
   */
  private mapGuardiansToExecutors(guardians: Guardian[]): ExecutorInfo[] {
    return guardians
      .filter(g => g.is_will_executor)
      .map((guardian, index) => ({
        id: guardian.id,
        type: (index === 0 ? 'primary' : 'alternate') as
          | 'alternate'
          | 'co_executor'
          | 'primary',
        name: guardian.name,
        relationship: guardian.relationship || 'guardian',
        address: {
          street: '',
          city: '',
          postalCode: '',
          country: '',
        },
        contactInfo: {
          email: guardian.email,
          phone: guardian.phone || undefined,
        },
        isProfessional: false,
        compensation: undefined,
        powerLimitations: [],
      }));
  }

  /**
   * Map guardians to guardianship info
   */
  private mapGuardiansToGuardianship(
    guardians: Guardian[],
    children: ChildInfo[]
  ): GuardianshipInfo[] {
    const childGuardians = guardians.filter(g => g.is_child_guardian);
    if (childGuardians.length === 0 || !children) return [];

    return children
      .filter(_child => _child.isMinor)
      .filter(_child => childGuardians.length > 0)
      .map(_child => ({
        childId: `child-${Math.random().toString(36).substr(2, 9)}`,
        primaryGuardian: {
          id: childGuardians[0].id,
          type: 'primary' as const,
          name: childGuardians[0].name,
          relationship: childGuardians[0].relationship || 'guardian',
          address: {
            street: '',
            city: '',
            postalCode: '',
            country: '',
          },
          contactInfo: {
            email: childGuardians[0].email,
            phone: childGuardians[0].phone || undefined,
          },
          isProfessional: false,
          powerLimitations: [],
        },
        alternateGuardian: childGuardians[1]
          ? {
              id: childGuardians[1].id,
              type: 'alternate' as const,
              name: childGuardians[1].name,
              relationship: childGuardians[1].relationship || 'guardian',
              address: {
                street: '',
                city: '',
                postalCode: '',
                country: '',
              },
              contactInfo: {
                email: childGuardians[1].email,
                phone: childGuardians[1].phone || undefined,
              },
              isProfessional: false,
              powerLimitations: [],
            }
          : undefined,
        specialInstructions: childGuardians[0]?.notes || undefined,
      }));
  }

  /**
   * Utility methods
   */
  private generateWillId(): string {
    return `will-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateChecksum(content: string): string {
    // Simple checksum - in production, use a proper hashing algorithm
    return btoa(content).substr(0, 16);
  }

  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  private estimatePageCount(text: string): number {
    // Rough estimate: 250 words per page
    const words = this.countWords(text);
    return Math.ceil(words / 250);
  }

  private formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  private formatAddress(address: AddressData): string {
    if (!address) return '';
    return `${address.street}, ${address.city}, ${address.postalCode}, ${address.country}`;
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

  private hasMinorChildren(children: ChildInfo[]): boolean {
    return children.some(child => child.isMinor);
  }

  private getMinorChildren(children: ChildInfo[]) {
    return children.filter(child => child.isMinor);
  }

  private getAdultChildren(children: ChildInfo[]) {
    return children.filter(child => !child.isMinor);
  }

  private mapAssetsByType(assets: AssetData[], type: string) {
    return assets.filter(asset => asset.type === type);
  }

  private getResiduaryBeneficiary(beneficiaries: BeneficiaryInfo[]) {
    const residuary = beneficiaries.find(b => b.share.type === 'remainder');
    return residuary?.name || beneficiaries[0]?.name || 'my heirs';
  }

  private getFuneralWishes(instructions: SpecialInstruction[]) {
    const funeral = instructions.find(i => i.type === 'funeral');
    return funeral?.content || '';
  }

  private getOrganDonation(instructions: SpecialInstruction[]) {
    const organ = instructions.find(i => i.type === 'organ_donation');
    if (!organ) return null;

    return {
      yes: organ.content.includes('yes') || organ.content.includes('donate'),
      no: organ.content.includes('no') || organ.content.includes('not donate'),
      family_decides:
        organ.content.includes('family') || organ.content.includes('decide'),
    };
  }

  private getDigitalAssets(instructions: SpecialInstruction[]) {
    const digital = instructions.find(i => i.type === 'digital_assets');
    return digital?.content || '';
  }

  private getPersonalMessages(instructions: SpecialInstruction[]) {
    return instructions
      .filter(i => i.type === 'personal_message')
      .map(i => ({
        recipient: i.recipient || 'family',
        message: i.content,
      }));
  }

  private getCharitableBequests(instructions: SpecialInstruction[]) {
    return instructions
      .filter(i => i.type === 'charitable_giving')
      .map(i => ({
        organization: i.title,
        amount: i.content.match(/\d+/)
          ? parseInt(i.content.match(/\d+/)?.[0] || '0')
          : 0,
        purpose: i.content,
      }));
  }

  private shouldShowForcedHeirsNotice(
    userData: WillUserData,
    template: WillTemplate
  ): boolean {
    if (!this.hasForcedHeirship(template.jurisdiction)) return false;

    const hasSpouse = userData.family.spouse !== undefined;
    const hasChildren =
      userData.family.children && userData.family.children.length > 0;

    return hasSpouse || hasChildren;
  }

  private hasForcedHeirship(jurisdiction: Jurisdiction): boolean {
    const forcedHeirshipJurisdictions: Jurisdiction[] = [
      'CZ',
      'SK',
      'FR',
      'ES',
      'IT',
      'DE',
      'AT',
      'PL',
    ];
    return forcedHeirshipJurisdictions.includes(jurisdiction);
  }

  private getNestedValue(obj: Record<string, any>, path: string): unknown {
    return path
      .split('.')
      .reduce((current: any, prop: string) => current?.[prop], obj);
  }

  private async ensureForcedHeirshipCompliance(
    beneficiaries: BeneficiaryInfo[]
  ): Promise<BeneficiaryInfo[]> {
    // Implementation would check and adjust beneficiary shares to comply with forced heirship rules
    return beneficiaries;
  }

  private applyBeneficiaryOptimizations(
    beneficiaries: BeneficiaryInfo[],
    optimizations?: any
  ): BeneficiaryInfo[] {
    // Implementation would apply non-breaking AI optimization suggestions
    if (optimizations) {
      // Process optimizations here when needed
      // For now, just return the beneficiaries as-is
    }
    return beneficiaries;
  }

  private generateLegalDisclaimer(
    jurisdiction: Jurisdiction,
    language: LanguageCode
  ): string {
    const disclaimers: Record<string, Record<string, string>> = {
      CZ: {
        cs: 'Tento dokument je generován na základě současného českého práva. Pro personalizované právní poradenstvo se obraťte na kvalifikovaného českého právníka.',
        en: 'This document is generated based on current Czech law. For personalized legal advice, consult a qualified Czech attorney.',
      },
      SK: {
        sk: 'Tento dokument je generovaný na základe súčasného slovenského práva. Pre personalizované právne poradenstvo sa obráťte na kvalifikovaného slovenského právnika.',
        en: 'This document is generated based on current Slovak law. For personalized legal advice, consult a qualified Slovak attorney.',
      },
    };

    return (
      disclaimers[jurisdiction]?.[language] ||
      disclaimers[jurisdiction]?.en ||
      'This document is generated based on applicable law. Consult a qualified attorney for legal advice.'
    );
  }

  private async saveWillToDatabase(_will: GeneratedWill): Promise<void> {
    // Implementation would save to Supabase database
    // Saving will to database: ${will.id}
  }
}

// Export singleton instance
export const willGenerationService = new WillGenerationService();
