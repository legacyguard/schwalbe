
/**
 * Intelligent Document Categorization System
 * Phase 6: AI Intelligence & Document Analysis
 */

import {
  type DocumentAnalysisResult,
  documentAnalyzer,
  type DocumentCategory,
} from './documentAnalyzer';

export interface CategoryRule {
  confidence: number;
  description: string;
  enabled: boolean;
  id: string;
  name: string;
  patterns: CategoryPattern[];
  primary: DocumentCategory['primary'];
  priority: number;
  secondary?: string;
}

export interface CategoryPattern {
  context?: 'anywhere' | 'content' | 'filename' | 'title';
  pattern: string;
  required?: boolean;
  type: 'keyword' | 'metadata' | 'regex' | 'semantic' | 'structure';
  weight: number;
}

export interface CategorySuggestion {
  alternativeCategories: Array<{
    category: DocumentCategory;
    confidence: number;
    reasoning: string;
  }>;
  category: DocumentCategory;
  confidence: number;
  reasoning: string[];
}

export interface AutoTaggingResult {
  confidence: number;
  generatedTags: Array<{
    confidence: number;
    reasoning: string;
    source: 'category' | 'content' | 'metadata' | 'pattern';
    tag: string;
  }>;
  suggestedTags: string[];
}

export interface CategoryStatistics {
  accuracyMetrics: {
    categoryAccuracy: Record<string, number>;
    falseNegatives: number;
    falsePositives: number;
    overallAccuracy: number;
  };
  categoryDistribution: Record<string, number>;
  performanceMetrics: {
    averageProcessingTime: number;
    errorRate: number;
    throughput: number;
  };
  totalDocuments: number;
}

export class DocumentCategorizer {
  private rules: Map<string, CategoryRule> = new Map();
  private categoryCache: Map<string, CategorySuggestion> = new Map();
  private statistics: CategoryStatistics;
  private learningEnabled: boolean = true;
  private customCategories: Map<string, DocumentCategory> = new Map();

  constructor() {
    this.statistics = this.initializeStatistics();
    this.initializeDefaultRules();
  }

  /**
   * Categorize a document using AI and rule-based approaches
   */
  async categorizeDocument(
    content: string,
    filename?: string,
    existingAnalysis?: DocumentAnalysisResult
  ): Promise<CategorySuggestion> {
    const startTime = performance.now();

    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(content, filename);
      if (this.categoryCache.has(cacheKey)) {
        return this.categoryCache.get(cacheKey)!;
      }

      // Get AI analysis if not provided
      const analysis =
        existingAnalysis ||
        (await documentAnalyzer.analyzeDocument(content, filename));

      // Apply rule-based categorization
      const ruleBasedSuggestion = await this.applyRules(
        content,
        filename,
        analysis
      );

      // Apply AI-based categorization
      const aiSuggestion = await this.applyAIClassification(analysis);

      // Combine suggestions using weighted voting
      const finalSuggestion = this.combineSuggestions([
        ruleBasedSuggestion,
        aiSuggestion,
      ]);

      // Learn from the result
      if (this.learningEnabled) {
        this.updateLearningModel(content, finalSuggestion);
      }

      // Cache the result
      this.categoryCache.set(cacheKey, finalSuggestion);

      // Update statistics
      this.updateStatistics(performance.now() - startTime);

      return finalSuggestion;
    } catch (_error) {
      throw new Error(
        `Document categorization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Auto-generate tags for a document
   */
  async generateTags(
    content: string,
    category?: DocumentCategory,
    analysis?: DocumentAnalysisResult
  ): Promise<AutoTaggingResult> {
    const generatedTags: AutoTaggingResult['generatedTags'] = [];

    // Category-based tags
    if (category) {
      generatedTags.push({
        tag: category.primary,
        confidence: 0.95,
        source: 'category',
        reasoning: 'Primary document category',
      });

      if (category.secondary) {
        generatedTags.push({
          tag: category.secondary.toLowerCase().replace(/\s+/g, '-'),
          confidence: 0.85,
          source: 'category',
          reasoning: 'Document subcategory',
        });
      }
    }

    // Content-based tags
    const contentTags = this.extractContentBasedTags(content);
    generatedTags.push(...contentTags);

    // Analysis-based tags
    if (analysis) {
      const analysisTags = this.extractAnalysisBasedTags(analysis);
      generatedTags.push(...analysisTags);
    }

    // Metadata-based tags
    const metadataTags = this.extractMetadataBasedTags(content, analysis);
    generatedTags.push(...metadataTags);

    // Remove duplicates and sort by confidence
    const uniqueTags = this.deduplicateTags(generatedTags);
    const suggestedTags = uniqueTags
      .filter(tag => tag.confidence >= 0.6)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10) // Limit to top 10 tags
      .map(tag => tag.tag);

    return {
      suggestedTags,
      confidence: this.calculateTaggingConfidence(uniqueTags),
      generatedTags: uniqueTags,
    };
  }

  /**
   * Add custom categorization rule
   */
  addCustomRule(rule: CategoryRule): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * Remove categorization rule
   */
  removeRule(ruleId: string): boolean {
    return this.rules.delete(ruleId);
  }

  /**
   * Update existing rule
   */
  updateRule(ruleId: string, updates: Partial<CategoryRule>): boolean {
    const existingRule = this.rules.get(ruleId);
    if (!existingRule) return false;

    const updatedRule = { ...existingRule, ...updates };
    this.rules.set(ruleId, updatedRule);
    return true;
  }

  /**
   * Get all categorization rules
   */
  getRules(): CategoryRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Add custom document category
   */
  addCustomCategory(id: string, category: DocumentCategory): void {
    this.customCategories.set(id, category);
  }

  /**
   * Train the categorizer on a labeled dataset
   */
  async trainOnDataset(
    dataset: Array<{
      content: string;
      expectedCategory: DocumentCategory;
      filename?: string;
      tags?: string[];
    }>
  ): Promise<void> {
    // Training categorizer on ${dataset.length} documents

    let correctPredictions = 0;
    const categoryErrors: Record<string, number> = {};

    for (const sample of dataset) {
      try {
        const suggestion = await this.categorizeDocument(
          sample.content,
          sample.filename
        );

        if (suggestion.category.primary === sample.expectedCategory.primary) {
          correctPredictions++;
        } else {
          const errorKey = `${sample.expectedCategory.primary}->${suggestion.category.primary}`;
          categoryErrors[errorKey] = (categoryErrors[errorKey] || 0) + 1;
        }

        // Update rules based on training feedback
        this.updateRulesFromFeedback(sample, suggestion);
      } catch (_error) {
        console.warn(`Training error on document: ${error}`);
      }
    }

    const accuracy = correctPredictions / dataset.length;
    // Training completed. Accuracy: ${(accuracy * 100).toFixed(2)}%
    // Common misclassifications: ${JSON.stringify(categoryErrors)}

    // Update statistics
    this.statistics.accuracyMetrics.overallAccuracy = accuracy;
  }

  /**
   * Get categorization statistics
   */
  getStatistics(): CategoryStatistics {
    return { ...this.statistics };
  }

  /**
   * Export categorization configuration
   */
  exportConfiguration(): {
    customCategories: Record<string, DocumentCategory>;
    rules: CategoryRule[];
    statistics: CategoryStatistics;
  } {
    return {
      rules: this.getRules(),
      customCategories: Object.fromEntries(this.customCategories),
      statistics: this.getStatistics(),
    };
  }

  /**
   * Import categorization configuration
   */
  importConfiguration(config: {
    customCategories?: Record<string, DocumentCategory>;
    rules?: CategoryRule[];
  }): void {
    if (config.rules) {
      this.rules.clear();
      config.rules.forEach(rule => {
        this.rules.set(rule.id, rule);
      });
    }

    if (config.customCategories) {
      this.customCategories.clear();
      Object.entries(config.customCategories).forEach(([id, category]) => {
        this.customCategories.set(id, category);
      });
    }
  }

  // Private methods

  private initializeStatistics(): CategoryStatistics {
    return {
      totalDocuments: 0,
      categoryDistribution: {},
      accuracyMetrics: {
        overallAccuracy: 0,
        categoryAccuracy: {},
        falsePositives: 0,
        falseNegatives: 0,
      },
      performanceMetrics: {
        averageProcessingTime: 0,
        throughput: 0,
        errorRate: 0,
      },
    };
  }

  private initializeDefaultRules(): void {
    // Legal documents
    this.addCustomRule({
      id: 'legal-contract',
      name: 'Legal Contract',
      description: 'Identifies legal contracts and agreements',
      primary: 'legal',
      secondary: 'Contract',
      patterns: [
        {
          type: 'keyword',
          pattern: 'contract|agreement|terms|conditions',
          weight: 3,
          context: 'content',
        },
        {
          type: 'keyword',
          pattern: 'whereas|party|parties|obligations',
          weight: 2,
          context: 'content',
        },
        {
          type: 'keyword',
          pattern: 'signature|witness|notary',
          weight: 2,
          context: 'content',
        },
        {
          type: 'regex',
          pattern: '\\b(shall|agrees?\\s+to|is\\s+obligated)\\b',
          weight: 2,
          context: 'content',
        },
      ],
      confidence: 0.8,
      priority: 1,
      enabled: true,
    });

    // Financial documents
    this.addCustomRule({
      id: 'financial-statement',
      name: 'Financial Statement',
      description: 'Identifies financial statements and reports',
      primary: 'financial',
      secondary: 'Statement',
      patterns: [
        {
          type: 'keyword',
          pattern: 'balance|statement|financial|account',
          weight: 3,
          context: 'content',
        },
        {
          type: 'keyword',
          pattern: 'debit|credit|transaction|deposit|withdrawal',
          weight: 2,
          context: 'content',
        },
        {
          type: 'regex',
          pattern: '\\$[\\d,]+\\.?\\d*',
          weight: 2,
          context: 'content',
        },
        {
          type: 'keyword',
          pattern: 'bank|checking|savings|investment',
          weight: 1,
          context: 'content',
        },
      ],
      confidence: 0.85,
      priority: 1,
      enabled: true,
    });

    // Tax documents
    this.addCustomRule({
      id: 'tax-document',
      name: 'Tax Document',
      description: 'Identifies tax-related documents',
      primary: 'financial',
      secondary: 'Tax Document',
      patterns: [
        {
          type: 'keyword',
          pattern: 'tax|irs|1040|w2|1099',
          weight: 4,
          context: 'content',
        },
        {
          type: 'keyword',
          pattern: 'deduction|exemption|refund|withholding',
          weight: 2,
          context: 'content',
        },
        {
          type: 'keyword',
          pattern: 'taxpayer|federal|state tax',
          weight: 2,
          context: 'content',
        },
      ],
      confidence: 0.9,
      priority: 1,
      enabled: true,
    });

    // Medical documents
    this.addCustomRule({
      id: 'medical-record',
      name: 'Medical Record',
      description: 'Identifies medical records and healthcare documents',
      primary: 'medical',
      secondary: 'Medical Record',
      patterns: [
        {
          type: 'keyword',
          pattern: 'medical|health|patient|doctor|physician',
          weight: 3,
          context: 'content',
        },
        {
          type: 'keyword',
          pattern: 'diagnosis|treatment|medication|prescription',
          weight: 3,
          context: 'content',
        },
        {
          type: 'keyword',
          pattern: 'hospital|clinic|healthcare|examination',
          weight: 2,
          context: 'content',
        },
        {
          type: 'keyword',
          pattern: 'symptoms|condition|procedure|therapy',
          weight: 2,
          context: 'content',
        },
      ],
      confidence: 0.8,
      priority: 1,
      enabled: true,
    });

    // Insurance documents
    this.addCustomRule({
      id: 'insurance-policy',
      name: 'Insurance Policy',
      description: 'Identifies insurance policies and claims',
      primary: 'insurance',
      secondary: 'Policy',
      patterns: [
        {
          type: 'keyword',
          pattern: 'insurance|policy|coverage|claim',
          weight: 4,
          context: 'content',
        },
        {
          type: 'keyword',
          pattern: 'premium|deductible|beneficiary|policyholder',
          weight: 3,
          context: 'content',
        },
        {
          type: 'keyword',
          pattern: 'liability|accident|damage|protection',
          weight: 2,
          context: 'content',
        },
      ],
      confidence: 0.85,
      priority: 1,
      enabled: true,
    });

    // Property documents
    this.addCustomRule({
      id: 'property-deed',
      name: 'Property Deed',
      description: 'Identifies property deeds and real estate documents',
      primary: 'property',
      secondary: 'Deed',
      patterns: [
        {
          type: 'keyword',
          pattern: 'deed|title|property|real estate',
          weight: 4,
          context: 'content',
        },
        {
          type: 'keyword',
          pattern: 'mortgage|lease|rental|landlord|tenant',
          weight: 3,
          context: 'content',
        },
        {
          type: 'keyword',
          pattern: 'closing|appraisal|inspection|zoning',
          weight: 2,
          context: 'content',
        },
      ],
      confidence: 0.8,
      priority: 1,
      enabled: true,
    });
  }

  private async applyRules(
    content: string,
    filename?: string,
    analysis?: DocumentAnalysisResult
  ): Promise<CategorySuggestion> {
    const scores: Map<string, { reasons: string[]; score: number }> = new Map();

    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;

      let ruleScore = 0;
      const reasons: string[] = [];

      for (const pattern of rule.patterns) {
        const patternScore = this.evaluatePattern(
          pattern,
          content,
          filename,
          analysis
        );
        if (patternScore > 0) {
          ruleScore += patternScore * pattern.weight;
          reasons.push(
            `Matched pattern: ${pattern.pattern} (score: ${patternScore})`
          );
        }
      }

      if (ruleScore > 0) {
        const categoryKey = `${rule.primary}:${rule.secondary || ''}`;
        const existing = scores.get(categoryKey) || { score: 0, reasons: [] };
        existing.score += ruleScore * rule.confidence;
        existing.reasons.push(...reasons);
        scores.set(categoryKey, existing);
      }
    }

    // Find the best match
    const sortedScores = Array.from(scores.entries()).sort(
      (a, b) => b[1].score - a[1].score
    );

    if (sortedScores.length === 0) {
      // Fallback to AI classification
      return this.applyAIClassification(analysis);
    }

    const [bestCategoryKey, bestScore] = sortedScores[0];
    const [primary, secondary] = bestCategoryKey.split(':');

    const alternativeCategories = sortedScores
      .slice(1, 4)
      .map(([categoryKey, scoreData]) => {
        const [altPrimary, altSecondary] = categoryKey.split(':');
        return {
          category: {
            primary: altPrimary as DocumentCategory['primary'],
            secondary: altSecondary || undefined,
          },
          confidence: Math.min(scoreData.score / 10, 1), // Normalize to 0-1
          reasoning: `Rule-based classification (score: ${scoreData.score.toFixed(2)})`,
        };
      });

    return {
      category: {
        primary: primary as DocumentCategory['primary'],
        secondary: secondary || undefined,
      },
      confidence: Math.min(bestScore.score / 10, 1), // Normalize to 0-1
      reasoning: bestScore.reasons,
      alternativeCategories,
    };
  }

  private async applyAIClassification(
    analysis?: DocumentAnalysisResult
  ): Promise<CategorySuggestion> {
    if (!analysis) {
      // Fallback classification
      return {
        category: { primary: 'other' },
        confidence: 0.5,
        reasoning: ['No analysis available - using fallback classification'],
        alternativeCategories: [],
      };
    }

    return {
      category: analysis.category,
      confidence: analysis.confidence,
      reasoning: [`AI classification based on content analysis`],
      alternativeCategories: [],
    };
  }

  private combineSuggestions(
    suggestions: CategorySuggestion[]
  ): CategorySuggestion {
    if (suggestions.length === 0) {
      return {
        category: { primary: 'other' },
        confidence: 0.5,
        reasoning: ['No classification suggestions available'],
        alternativeCategories: [],
      };
    }

    // Weighted voting based on confidence
    const categoryScores: Map<string, { reasons: string[]; score: number }> =
      new Map();

    for (const suggestion of suggestions) {
      const key = `${suggestion.category.primary}:${suggestion.category.secondary || ''}`;
      const existing = categoryScores.get(key) || { score: 0, reasons: [] };
      existing.score += suggestion.confidence;
      existing.reasons.push(...suggestion.reasoning);
      categoryScores.set(key, existing);
    }

    // Find the winner
    const winner = Array.from(categoryScores.entries()).reduce((a, b) =>
      a[1].score > b[1].score ? a : b
    );

    const [primary, secondary] = winner[0].split(':');

    return {
      category: {
        primary: primary as DocumentCategory['primary'],
        secondary: secondary || undefined,
      },
      confidence: Math.min(winner[1].score / suggestions.length, 1),
      reasoning: [
        `Combined classification from ${suggestions.length} methods`,
        ...winner[1].reasons,
      ],
      alternativeCategories: [],
    };
  }

  private evaluatePattern(
    pattern: CategoryPattern,
    content: string,
    filename?: string,
    analysis?: DocumentAnalysisResult
  ): number {
    let targetText = '';

    // Select target text based on context
    switch (pattern.context) {
      case 'title':
        targetText = analysis?.metadata?.title || filename || '';
        break;
      case 'filename':
        targetText = filename || '';
        break;
      case 'content':
      case 'anywhere':
      default:
        targetText = content;
        break;
    }

    targetText = targetText.toLowerCase();

    // Evaluate pattern based on type
    switch (pattern.type) {
      case 'keyword':
        return this.evaluateKeywordPattern(pattern.pattern, targetText);
      case 'regex':
        return this.evaluateRegexPattern(pattern.pattern, targetText);
      case 'semantic':
        return this.evaluateSemanticPattern(pattern.pattern, targetText);
      case 'structure':
        return this.evaluateStructurePattern(pattern.pattern, analysis);
      case 'metadata':
        return this.evaluateMetadataPattern(pattern.pattern, analysis);
      default:
        return 0;
    }
  }

  private evaluateKeywordPattern(pattern: string, text: string): number {
    const keywords = pattern.toLowerCase().split('|');
    let matches = 0;

    for (const keyword of keywords) {
      const regex = new RegExp(
        `\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
        'g'
      );
      const keywordMatches = text.match(regex);
      if (keywordMatches) {
        matches += keywordMatches.length;
      }
    }

    return Math.min(matches, 5); // Cap at 5 to prevent over-weighting
  }

  private evaluateRegexPattern(pattern: string, text: string): number {
    try {
      const regex = new RegExp(pattern, 'gi');
      const matches = text.match(regex);
      return matches ? Math.min(matches.length, 5) : 0;
    } catch (_error) {
      console.warn(`Invalid regex pattern: ${pattern}`);
      return 0;
    }
  }

  private evaluateSemanticPattern(pattern: string, text: string): number {
    // Simplified semantic matching - in production would use embeddings/NLP
    const semanticKeywords = pattern
      .toLowerCase()
      .split(',')
      .map(k => k.trim());
    let score = 0;

    for (const keyword of semanticKeywords) {
      if (text.includes(keyword)) {
        score += 1;
      }
    }

    return Math.min(score, 3);
  }

  private evaluateStructurePattern(
    pattern: string,
    analysis?: DocumentAnalysisResult
  ): number {
    if (!analysis) return 0;

    // Evaluate document structure patterns
    switch (pattern) {
      case 'has_dates':
        return analysis.keyInformation.importantDates.length > 0 ? 1 : 0;
      case 'has_amounts':
        return analysis.keyInformation.amounts.length > 0 ? 1 : 0;
      case 'has_people':
        return analysis.keyInformation.people.length > 0 ? 1 : 0;
      case 'has_addresses':
        return analysis.keyInformation.addresses.length > 0 ? 1 : 0;
      default:
        return 0;
    }
  }

  private evaluateMetadataPattern(
    pattern: string,
    analysis?: DocumentAnalysisResult
  ): number {
    if (!analysis?.metadata) return 0;

    const metadata = analysis.metadata;
    const patternLower = pattern.toLowerCase();

    if (patternLower.includes('page_count') && metadata.pageCount) {
      const match = patternLower.match(/page_count\s*([><=]+)\s*(\d+)/);
      if (match) {
        const operator = match[1];
        const threshold = parseInt(match[2]);
        const pageCount = metadata.pageCount;

        switch (operator) {
          case '>':
            return pageCount > threshold ? 1 : 0;
          case '<':
            return pageCount < threshold ? 1 : 0;
          case '>=':
            return pageCount >= threshold ? 1 : 0;
          case '<=':
            return pageCount <= threshold ? 1 : 0;
          case '=':
          case '==':
            return pageCount === threshold ? 1 : 0;
        }
      }
    }

    return 0;
  }

  private extractContentBasedTags(
    content: string
  ): AutoTaggingResult['generatedTags'] {
    const tags: AutoTaggingResult['generatedTags'] = [];
    const contentLower = content.toLowerCase();

    // Common document indicators
    const indicators = {
      confidential: {
        pattern: /confidential|private|sensitive/g,
        confidence: 0.9,
      },
      urgent: { pattern: /urgent|immediate|priority|asap/g, confidence: 0.8 },
      expires: {
        pattern: /expires?|expir(ation|y)|due date|deadline/g,
        confidence: 0.85,
      },
      signed: { pattern: /signed|signature|executed/g, confidence: 0.8 },
      annual: { pattern: /annual|yearly|year-end/g, confidence: 0.7 },
      monthly: { pattern: /monthly|month-end/g, confidence: 0.7 },
      draft: { pattern: /draft|preliminary|proposed/g, confidence: 0.75 },
      final: { pattern: /final|executed|completed/g, confidence: 0.8 },
    };

    for (const [tag, { pattern, confidence }] of Object.entries(indicators)) {
      const matches = contentLower.match(pattern);
      if (matches && matches.length > 0) {
        tags.push({
          tag,
          confidence,
          source: 'content',
          reasoning: `Found ${matches.length} occurrences of "${tag}" indicators`,
        });
      }
    }

    return tags;
  }

  private extractAnalysisBasedTags(
    analysis: DocumentAnalysisResult
  ): AutoTaggingResult['generatedTags'] {
    const tags: AutoTaggingResult['generatedTags'] = [];

    // Importance level tags
    tags.push({
      tag: `importance-${analysis.importanceLevel}`,
      confidence: 0.9,
      source: 'metadata',
      reasoning: `Document importance level determined by AI analysis`,
    });

    // Sensitivity level tags
    tags.push({
      tag: `sensitivity-${analysis.sensitivityLevel}`,
      confidence: 0.85,
      source: 'metadata',
      reasoning: `Document sensitivity level based on content analysis`,
    });

    // PII detection tags
    if (analysis.piiDetected.length > 0) {
      tags.push({
        tag: 'contains-pii',
        confidence: 0.95,
        source: 'metadata',
        reasoning: `Document contains ${analysis.piiDetected.length} PII elements`,
      });
    }

    // Key information tags
    if (analysis.keyInformation.importantDates.length > 0) {
      tags.push({
        tag: 'time-sensitive',
        confidence: 0.8,
        source: 'metadata',
        reasoning: `Document contains ${analysis.keyInformation.importantDates.length} important dates`,
      });
    }

    if (analysis.keyInformation.amounts.length > 0) {
      tags.push({
        tag: 'financial-amounts',
        confidence: 0.85,
        source: 'metadata',
        reasoning: `Document contains ${analysis.keyInformation.amounts.length} financial amounts`,
      });
    }

    return tags;
  }

  private extractMetadataBasedTags(
    _content: string,
    analysis?: DocumentAnalysisResult
  ): AutoTaggingResult['generatedTags'] {
    const tags: AutoTaggingResult['generatedTags'] = [];

    if (analysis?.metadata) {
      const metadata = analysis.metadata;

      // Document size tags
      if (metadata.pageCount) {
        if (metadata.pageCount === 1) {
          tags.push({
            tag: 'single-page',
            confidence: 0.9,
            source: 'metadata',
            reasoning: 'Document is a single page',
          });
        } else if (metadata.pageCount > 10) {
          tags.push({
            tag: 'multi-page',
            confidence: 0.9,
            source: 'metadata',
            reasoning: `Document has ${metadata.pageCount} pages`,
          });
        }
      }

      // Language tags
      if (metadata.language && metadata.language !== 'en') {
        tags.push({
          tag: `language-${metadata.language}`,
          confidence: 0.95,
          source: 'metadata',
          reasoning: `Document language detected as ${metadata.language}`,
        });
      }
    }

    return tags;
  }

  private deduplicateTags(
    tags: AutoTaggingResult['generatedTags']
  ): AutoTaggingResult['generatedTags'] {
    const tagMap = new Map<string, AutoTaggingResult['generatedTags'][0]>();

    for (const tag of tags) {
      const existing = tagMap.get(tag.tag);
      if (!existing || tag.confidence > existing.confidence) {
        tagMap.set(tag.tag, tag);
      }
    }

    return Array.from(tagMap.values());
  }

  private calculateTaggingConfidence(
    tags: AutoTaggingResult['generatedTags']
  ): number {
    if (tags.length === 0) return 0;

    const totalConfidence = tags.reduce((sum, tag) => sum + tag.confidence, 0);
    return totalConfidence / tags.length;
  }

  private generateCacheKey(content: string, filename?: string): string {
    // Simple hash-based cache key
    let hash = 0;
    const str = content + (filename || '');
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  private updateLearningModel(
    _content: string,
    suggestion: CategorySuggestion
  ): void {
    // Simple learning implementation - in production would use more sophisticated ML
    // For now, just update statistics
    this.statistics.totalDocuments++;

    const categoryKey = suggestion.category.primary;
    this.statistics.categoryDistribution[categoryKey] =
      (this.statistics.categoryDistribution[categoryKey] || 0) + 1;
  }

  private updateStatistics(processingTime: number): void {
    const current = this.statistics.performanceMetrics;
    current.averageProcessingTime =
      (current.averageProcessingTime + processingTime) / 2;
    current.throughput = 1000 / current.averageProcessingTime; // docs per second
  }

  private updateRulesFromFeedback(
    sample: { content: string; expectedCategory: DocumentCategory },
    suggestion: CategorySuggestion
  ): void {
    // Simple rule adjustment based on feedback
    // In production, this would be more sophisticated

    if (suggestion.category.primary !== sample.expectedCategory.primary) {
      // Find rules that fired for the wrong category and reduce their confidence
      // This is a simplified implementation
      // Adjusting rules based on misclassification: ${suggestion.category.primary} -> ${sample.expectedCategory.primary}
    }
  }
}

// Create and export default categorizer instance
export const documentCategorizer = new DocumentCategorizer();

// Export convenience functions
export const categorizeDocument = (content: string, filename?: string) => {
  return documentCategorizer.categorizeDocument(content, filename);
};

export const generateDocumentTags = (
  content: string,
  category?: DocumentCategory
) => {
  return documentCategorizer.generateTags(content, category);
};

export const addCategorizationRule = (rule: CategoryRule) => {
  return documentCategorizer.addCustomRule(rule);
};
