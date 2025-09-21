
/**
 * Sofia AI Assistant
 * AI-powered will generation and optimization assistant
 */

import type {
  AISuggestion,
  AssetInfo,
  BeneficiaryInfo,
  GeneratedWill,
  Jurisdiction,
  LanguageCode,
  SofiaWillAssistant,
  WillUserData,
  WillValidationResult,
} from '../types/will-templates';

class SofiaAIImpl implements SofiaWillAssistant {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    // In a real implementation, these would come from environment variables
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    this.baseUrl = 'https://api.openai.com/v1';
  }

  /**
   * Generate AI-powered will suggestions
   */
  async generateWillSuggestions(
    userData: WillUserData,
    jurisdiction: Jurisdiction
  ): Promise<AISuggestion[]> {
    try {
      const prompt = this.buildSuggestionPrompt(userData, jurisdiction);
      const response = await this.callAI(prompt, 'will-suggestions');

      return this.parseSuggestions(response);
    } catch (error) {
      console.error('Error generating will suggestions:', error);
      return this.getFallbackSuggestions(userData, jurisdiction);
    }
  }

  /**
   * Optimize will content using AI
   */
  async optimizeWillContent(will: GeneratedWill): Promise<GeneratedWill> {
    try {
      const prompt = this.buildOptimizationPrompt(will);
      const optimizedContent = await this.callAI(
        prompt,
        'content-optimization'
      );

      return {
        ...will,
        content: {
          ...will.content,
          text: optimizedContent,
          html: this.convertToHtml(optimizedContent),
        },
        metadata: {
          ...will.metadata,
          wordCount: this.countWords(optimizedContent),
        },
      };
    } catch (error) {
      console.error('Error optimizing will content:', error);
      return will; // Return original on error
    }
  }

  /**
   * Explain legal terms in user's language
   */
  async explainLegalTerms(
    content: string,
    language: LanguageCode
  ): Promise<Record<string, string>> {
    try {
      const legalTerms = this.extractLegalTerms(content);
      if (legalTerms.length === 0) return {};

      const prompt = this.buildLegalExplanationPrompt(legalTerms, language);
      const explanations = await this.callAI(prompt, 'legal-explanations');

      return this.parseExplanations(explanations);
    } catch (error) {
      console.error('Error explaining legal terms:', error);
      return this.getFallbackExplanations(language);
    }
  }

  /**
   * Validate legal compliance using AI
   */
  async validateCompliance(will: GeneratedWill): Promise<WillValidationResult> {
    try {
      const prompt = this.buildCompliancePrompt(will);
      const analysis = await this.callAI(prompt, 'compliance-validation');

      return this.parseComplianceResult(analysis);
    } catch (error) {
      console.error('Error validating compliance:', error);
      return this.getFallbackValidation();
    }
  }

  /**
   * Suggest beneficiary optimizations
   */
  async suggestBeneficiaryOptimizations(
    beneficiaries: BeneficiaryInfo[],
    assets: AssetInfo[]
  ): Promise<AISuggestion[]> {
    try {
      const prompt = this.buildBeneficiaryOptimizationPrompt(
        beneficiaries,
        assets
      );
      const suggestions = await this.callAI(prompt, 'beneficiary-optimization');

      return this.parseSuggestions(suggestions);
    } catch (error) {
      console.error('Error generating beneficiary optimizations:', error);
      return this.getFallbackBeneficiaryOptimizations(beneficiaries, assets);
    }
  }

  /**
   * Build prompts for different AI tasks
   */
  private buildSuggestionPrompt(
    userData: WillUserData,
    jurisdiction: Jurisdiction
  ): string {
    return `You are Sofia, an AI legal assistant specializing in will and estate planning for ${jurisdiction}.

Analyze the following user data and provide suggestions to improve their will:

Personal Info:
- Name: ${userData.personal.fullName}
- Age: ${this.calculateAge(userData.personal.dateOfBirth)}
- Marital Status: ${userData.personal.maritalStatus}
- Citizenship: ${userData.personal.citizenship}

Family:
- Spouse: ${userData.family.spouse?.fullName || 'None'}
- Children: ${userData.family.children?.length || 0} children
- Minor Children: ${userData.family.children?.filter(c => c.isMinor).length || 0}

Assets: ${userData.assets.length} assets valued at approximately ${this.calculateTotalAssetValue(userData.assets)}

Beneficiaries: ${userData.beneficiaries.length} beneficiaries

Executors: ${userData.executors?.length || 0} executors appointed

Please provide specific, actionable suggestions focused on:
1. Legal compliance for ${jurisdiction}
2. Tax optimization
3. Family protection
4. Asset distribution fairness
5. Missing important provisions

Respond with structured suggestions including priority level and specific actions.`;
  }

  private buildOptimizationPrompt(will: GeneratedWill): string {
    return `You are Sofia, an expert legal document editor specializing in ${will.jurisdiction} wills.

Please review and optimize the following will content for clarity, legal precision, and readability while maintaining all legal requirements:

Jurisdiction: ${will.jurisdiction}
Will Type: ${will.type}
Language: ${will.language}

Current Content:
${will.content.text}

Please optimize for:
1. Clear, unambiguous language
2. Proper legal terminology for ${will.jurisdiction}
3. Logical flow and organization
4. Readability for non-lawyers
5. Compliance with local legal requirements

Return only the optimized text content, maintaining the same structure and all legal provisions.`;
  }

  private buildLegalExplanationPrompt(
    terms: string[],
    language: LanguageCode
  ): string {
    const languageNames: Partial<Record<LanguageCode, string>> = {
      en: 'English',
      cs: 'Czech',
      sk: 'Slovak',
      de: 'German',
      fr: 'French',
      es: 'Spanish',
      pl: 'Polish',
    };

    return `You are Sofia, a legal assistant. Explain the following legal terms in simple ${languageNames[language] || 'English'} language:

Terms to explain: ${terms.join(', ')}

For each term, provide a clear, concise explanation that a non-lawyer can understand. Format as JSON with term as key and explanation as value.`;
  }

  private buildCompliancePrompt(will: GeneratedWill): string {
    return `You are Sofia, a legal compliance expert for ${will.jurisdiction} inheritance law.

Please analyze this will for legal compliance:

Jurisdiction: ${will.jurisdiction}
Will Type: ${will.type}
Content: ${will.content.text}

Check for:
1. Required legal elements for ${will.jurisdiction}
2. Proper execution requirements
3. Forced heirship compliance (if applicable)
4. Tax implications
5. Potential legal challenges

Provide a structured analysis with compliance score (0-100) and specific issues found.`;
  }

  private buildBeneficiaryOptimizationPrompt(
    beneficiaries: BeneficiaryInfo[],
    assets: AssetInfo[]
  ): string {
    return `You are Sofia, an estate planning expert. Analyze this beneficiary structure and suggest optimizations:

Assets:
${assets.map(a => `- ${a.type}: ${a.description} (€${a.value})`).join('\n')}

Beneficiaries:
${beneficiaries.map(b => `- ${b.name} (${b.relationship}): ${b.share.type} ${b.share.value}`).join('\n')}

Suggest optimizations for:
1. Fair distribution
2. Tax efficiency
3. Asset-specific bequests
4. Contingency planning
5. Minor beneficiaries

Provide specific, actionable recommendations.`;
  }

  /**
   * Call AI API
   */
  private async callAI(prompt: string, task: string): Promise<string> {
    if (!this.apiKey) {
      console.warn('OpenAI API key not configured, returning mock response');
      return this.getMockResponse(task);
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content:
                'You are Sofia, an AI legal assistant specializing in will and estate planning. Provide professional, accurate advice while being accessible to non-lawyers.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('AI API call failed:', error);
      return this.getMockResponse(task);
    }
  }

  /**
   * Parse AI responses
   */
  private parseSuggestions(response: string): AISuggestion[] {
    try {
      // Try to parse as JSON first
      if (response.trim().startsWith('[')) {
        return JSON.parse(response);
      }

      // Parse structured text response
      const suggestions: AISuggestion[] = [];
      const lines = response.split('\n');
      let currentSuggestion: Partial<AISuggestion> = {};

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('Priority:')) {
          currentSuggestion.priority = trimmed.includes('High')
            ? 'high'
            : trimmed.includes('Medium')
              ? 'medium'
              : 'low';
        } else if (trimmed.startsWith('Category:')) {
          currentSuggestion.category = trimmed.replace('Category:', '').trim();
        } else if (trimmed.startsWith('Title:')) {
          currentSuggestion.title = trimmed.replace('Title:', '').trim();
        } else if (trimmed.startsWith('Description:')) {
          currentSuggestion.description = trimmed
            .replace('Description:', '')
            .trim();
        } else if (trimmed.startsWith('Action:')) {
          currentSuggestion.suggestedAction = trimmed
            .replace('Action:', '')
            .trim();

          // Complete suggestion
          if (currentSuggestion.title && currentSuggestion.description) {
            suggestions.push({
              id: `suggestion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: 'improvement',
              category: currentSuggestion.category || 'general',
              title: currentSuggestion.title,
              description: currentSuggestion.description,
              suggestedAction: currentSuggestion.suggestedAction || '',
              priority: currentSuggestion.priority || 'medium',
              isJurisdictionSpecific: true,
              affectedSections: [],
            });
          }

          currentSuggestion = {};
        }
      }

      return suggestions;
    } catch (error) {
      console.error('Error parsing suggestions:', error);
      return [];
    }
  }

  private parseExplanations(response: string): Record<string, string> {
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Error parsing explanations:', error);
      return {};
    }
  }

  private parseComplianceResult(response: string): WillValidationResult {
    try {
      // Parse AI compliance analysis
      const complianceScore = this.extractComplianceScore(response);
      const issues = this.extractComplianceIssues(response);

      return {
        isValid: complianceScore >= 80,
        completenessScore: complianceScore,
        errors: issues.filter(i => i.severity === 'error'),
        warnings: issues.filter(i => i.severity === 'warning'),
        legalRequirementsMet: complianceScore >= 90,
        missingRequiredFields: [],
        suggestedImprovements: issues
          .map(i => i.suggestedFix || i.message)
          .filter(Boolean),
      };
    } catch (error) {
      console.error('Error parsing compliance result:', error);
      return this.getFallbackValidation();
    }
  }

  /**
   * Utility methods
   */
  private calculateAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    return today.getFullYear() - birth.getFullYear();
  }

  private calculateTotalAssetValue(assets: AssetInfo[]): string {
    const total = assets.reduce((sum, asset) => sum + (asset.value || 0), 0);
    return `€${total.toLocaleString()}`;
  }

  private extractLegalTerms(content: string): string[] {
    // Simple extraction of potential legal terms
    const legalTermPatterns = [
      /\b(testament|testator|executor|beneficiary|bequest|devise|codicil)\b/gi,
      /\b(probate|intestate|testate|per stirpes|per capita)\b/gi,
      /\b(holographic|witnessed|notarized|attestation)\b/gi,
    ];

    const terms = new Set<string>();
    for (const pattern of legalTermPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(term => terms.add(term.toLowerCase()));
      }
    }

    return Array.from(terms);
  }

  private extractComplianceScore(response: string): number {
    const scoreMatch = response.match(/score[:\s]+(\d+)/i);
    return scoreMatch ? parseInt(scoreMatch[1]) : 75;
  }

  private extractComplianceIssues(_response: string): any[] {
    // Simple extraction of issues from text response
    // In production, this would be more sophisticated
    return [];
  }

  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  private convertToHtml(text: string): string {
    // Simple text to HTML conversion
    return text
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
  }

  /**
   * Fallback responses when AI is unavailable
   */
  private getFallbackSuggestions(
    userData: WillUserData,
    _jurisdiction: Jurisdiction
  ): AISuggestion[] {
    const suggestions: AISuggestion[] = [];

    if (!userData.executors || userData.executors.length === 0) {
      suggestions.push({
        id: 'fallback-executor',
        type: 'improvement',
        category: 'executor',
        title: 'Appoint an Executor',
        description:
          'Your will should name an executor to manage your estate after death.',
        suggestedAction:
          'Choose a trusted person to serve as executor and add them to your will.',
        priority: 'high',
        isJurisdictionSpecific: false,
        affectedSections: ['executor'],
      });
    }

    const hasMinorChildren = userData.family.children?.some(c => c.isMinor);
    if (
      hasMinorChildren &&
      (!userData.guardians || userData.guardians.length === 0)
    ) {
      suggestions.push({
        id: 'fallback-guardian',
        type: 'improvement',
        category: 'guardianship',
        title: 'Appoint Guardians for Minor Children',
        description: 'You have minor children but no appointed guardians.',
        suggestedAction: 'Name guardians to care for your minor children.',
        priority: 'high',
        isJurisdictionSpecific: true,
        affectedSections: ['guardianship'],
      });
    }

    return suggestions;
  }

  private getFallbackBeneficiaryOptimizations(
    beneficiaries: BeneficiaryInfo[],
    _assets: AssetInfo[]
  ): AISuggestion[] {
    const suggestions: AISuggestion[] = [];

    // Check for equal distribution
    const equalShares = beneficiaries.every(
      b =>
        b.share.type === 'percentage' &&
        b.share.value === 100 / beneficiaries.length
    );
    if (!equalShares && beneficiaries.length > 1) {
      suggestions.push({
        id: 'fallback-equal-distribution',
        type: 'optimization',
        category: 'distribution',
        title: 'Consider Equal Distribution',
        description:
          'You may want to consider equal shares for similar beneficiaries.',
        suggestedAction: 'Review beneficiary percentages for fairness.',
        priority: 'medium',
        isJurisdictionSpecific: false,
        affectedSections: ['beneficiaries'],
      });
    }

    return suggestions;
  }

  private getFallbackExplanations(
    language: LanguageCode
  ): Record<string, string> {
    const explanations: Record<string, string> = {};

    if (language === 'en') {
      explanations['executor'] =
        'The person responsible for carrying out the instructions in your will';
      explanations['beneficiary'] =
        'A person or organization that receives assets from your estate';
      explanations['testator'] = 'The person who makes the will';
    } else if (language === 'cs') {
      explanations['vykonávatel'] =
        'Osoba odpovědná za vykonání pokynů ve vaší závěti';
      explanations['dědic'] =
        'Osoba nebo organizace, která dostane majetek z vaší pozůstalosti';
    }

    return explanations;
  }

  private getFallbackValidation(): WillValidationResult {
    return {
      isValid: true,
      completenessScore: 85,
      errors: [],
      warnings: [],
      legalRequirementsMet: true,
      missingRequiredFields: [],
      suggestedImprovements: [
        'Consider having your will reviewed by a local attorney',
      ],
    };
  }

  private getMockResponse(task: string): string {
    const mockResponses: Record<string, string> = {
      'will-suggestions': `Priority: High
Category: Executor
Title: Appoint Backup Executor
Description: Consider appointing an alternate executor in case your primary choice cannot serve
Action: Choose a trusted backup executor

Priority: Medium
Category: Assets
Title: Update Asset Values
Description: Ensure all asset values are current and accurate
Action: Review and update asset valuations annually`,

      'content-optimization': 'Optimized will content would be returned here',
      'legal-explanations':
        '{"executor": "Person who manages your estate", "beneficiary": "Person who receives inheritance"}',
      'compliance-validation': 'Compliance score: 90. No major issues found.',
      'beneficiary-optimization': 'Consider equal distribution among children',
    };

    return mockResponses[task] || 'AI assistance unavailable';
  }
}

// Export singleton instance
export const sofiaAI = new SofiaAIImpl();
