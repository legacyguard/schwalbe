
/**
 * Document Categorization Service
 * Advanced AI-powered document analysis and categorization
 */

import type {
  DocumentCategorizationResult,
  DocumentType,
  ExtractedDocument,
} from '@/types/gmail';

export interface DocumentPattern {
  contentPatterns: RegExp[];
  filenamePatterns: RegExp[];
  keywords: string[];
  weight: number;
}

export interface CategoryDefinition {
  description: string;
  familyRelevance: 'high' | 'low' | 'medium';
  name: string;
  patterns: DocumentPattern[];
  suggestedActions: string[];
  type: DocumentType;
  urgencyLevel: number; // 1-5, higher = more urgent
}

export class DocumentCategorizationService {
  private static instance: DocumentCategorizationService;
  private categoryDefinitions: CategoryDefinition[];

  private constructor() {
    this.categoryDefinitions = this.initializeCategoryDefinitions();
  }

  public static getInstance(): DocumentCategorizationService {
    if (!DocumentCategorizationService.instance) {
      DocumentCategorizationService.instance =
        new DocumentCategorizationService();
    }
    return DocumentCategorizationService.instance;
  }

  /**
   * Initialize comprehensive category definitions
   */
  private initializeCategoryDefinitions(): CategoryDefinition[] {
    return [
      {
        type: 'will',
        name: 'Will & Testament',
        description:
          'Legal documents specifying distribution of assets after death',
        patterns: [
          {
            keywords: [
              'will',
              'testament',
              'last will',
              'executor',
              'beneficiary',
              'bequest',
              'inherit',
            ],
            filenamePatterns: [/will/i, /testament/i, /last_will/i, /lwt/i],
            contentPatterns: [
              /last\s+will\s+and\s+testament/i,
              /being\s+of\s+sound\s+mind/i,
              /executor/i,
              /beneficiary/i,
              /bequeath/i,
            ],
            weight: 1.0,
          },
        ],
        familyRelevance: 'high',
        urgencyLevel: 5,
        suggestedActions: [
          'Schedule professional legal review',
          'Verify executor contact information',
          'Share with trusted family member',
        ],
      },
      {
        type: 'trust',
        name: 'Trust Documents',
        description: 'Legal arrangements for managing assets',
        patterns: [
          {
            keywords: [
              'trust',
              'trustee',
              'grantor',
              'settlor',
              'living trust',
              'revocable trust',
            ],
            filenamePatterns: [/trust/i, /living_trust/i, /revocable/i],
            contentPatterns: [
              /trust\s+agreement/i,
              /trustee/i,
              /grantor/i,
              /settlor/i,
              /living\s+trust/i,
            ],
            weight: 1.0,
          },
        ],
        familyRelevance: 'high',
        urgencyLevel: 4,
        suggestedActions: [
          'Review trust terms with attorney',
          'Update trustee information',
          'Verify asset transfer',
        ],
      },
      {
        type: 'insurance',
        name: 'Insurance Documents',
        description: 'Insurance policies and coverage documents',
        patterns: [
          {
            keywords: [
              'insurance',
              'policy',
              'premium',
              'coverage',
              'claim',
              'deductible',
              'beneficiary',
            ],
            filenamePatterns: [/insurance/i, /policy/i, /coverage/i],
            contentPatterns: [
              /policy\s+number/i,
              /premium/i,
              /coverage/i,
              /deductible/i,
              /insurance\s+company/i,
            ],
            weight: 0.9,
          },
        ],
        familyRelevance: 'high',
        urgencyLevel: 3,
        suggestedActions: [
          'Verify current coverage limits',
          'Check beneficiary information',
          'Review policy terms',
        ],
      },
      {
        type: 'property_deed',
        name: 'Property Documents',
        description: 'Real estate deeds, mortgages, and property records',
        patterns: [
          {
            keywords: [
              'deed',
              'property',
              'real estate',
              'mortgage',
              'title',
              'ownership',
            ],
            filenamePatterns: [/deed/i, /property/i, /mortgage/i, /title/i],
            contentPatterns: [
              /property\s+deed/i,
              /real\s+estate/i,
              /mortgage/i,
              /title/i,
              /ownership/i,
            ],
            weight: 0.9,
          },
        ],
        familyRelevance: 'high',
        urgencyLevel: 3,
        suggestedActions: [
          'Verify property ownership',
          'Check mortgage status',
          'Update property insurance',
        ],
      },
      {
        type: 'investment',
        name: 'Investment Records',
        description:
          'Investment accounts, portfolios, and financial statements',
        patterns: [
          {
            keywords: [
              'investment',
              'portfolio',
              'stocks',
              'bonds',
              'mutual fund',
              'retirement',
              '401k',
              'ira',
            ],
            filenamePatterns: [
              /investment/i,
              /portfolio/i,
              /401k/i,
              /ira/i,
              /retirement/i,
            ],
            contentPatterns: [
              /investment\s+account/i,
              /portfolio/i,
              /401\(k\)/i,
              /traditional\s+ira/i,
              /roth\s+ira/i,
            ],
            weight: 0.8,
          },
        ],
        familyRelevance: 'high',
        urgencyLevel: 2,
        suggestedActions: [
          'Review account beneficiaries',
          'Update investment allocations',
          'Consider estate planning impact',
        ],
      },
      {
        type: 'bank_statement',
        name: 'Bank Statements',
        description: 'Bank account statements and financial records',
        patterns: [
          {
            keywords: [
              'statement',
              'account',
              'balance',
              'transaction',
              'deposit',
              'withdrawal',
              'bank',
            ],
            filenamePatterns: [/statement/i, /account/i, /bank/i],
            contentPatterns: [
              /account\s+balance/i,
              /statement\s+period/i,
              /transaction/i,
              /deposit/i,
              /withdrawal/i,
            ],
            weight: 0.7,
          },
        ],
        familyRelevance: 'medium',
        urgencyLevel: 2,
        suggestedActions: [
          'Review recent transactions',
          'Verify account access',
          'Check for automatic payments',
        ],
      },
      {
        type: 'tax_document',
        name: 'Tax Documents',
        description: 'Tax returns, W-2s, and tax-related documents',
        patterns: [
          {
            keywords: [
              'tax',
              'return',
              'w2',
              'w-2',
              '1040',
              'refund',
              'deduction',
              'irs',
            ],
            filenamePatterns: [/tax/i, /w2/i, /w-2/i, /1040/i],
            contentPatterns: [
              /tax\s+return/i,
              /form\s+1040/i,
              /w-2/i,
              /refund/i,
              /deduction/i,
            ],
            weight: 0.8,
          },
        ],
        familyRelevance: 'medium',
        urgencyLevel: 2,
        suggestedActions: [
          'File for record keeping',
          'Check for missing documents',
          'Prepare for next tax season',
        ],
      },
      {
        type: 'medical',
        name: 'Medical Records',
        description: 'Medical records, prescriptions, and health documents',
        patterns: [
          {
            keywords: [
              'medical',
              'health',
              'prescription',
              'doctor',
              'hospital',
              'diagnosis',
              'treatment',
            ],
            filenamePatterns: [
              /medical/i,
              /health/i,
              /prescription/i,
              /doctor/i,
            ],
            contentPatterns: [
              /medical\s+record/i,
              /prescription/i,
              /diagnosis/i,
              /treatment/i,
              /patient/i,
            ],
            weight: 0.7,
          },
        ],
        familyRelevance: 'medium',
        urgencyLevel: 3,
        suggestedActions: [
          'Share with healthcare proxy',
          'Update medical directives',
          'Organize by priority',
        ],
      },
      {
        type: 'identification',
        name: 'Identification Documents',
        description:
          'ID cards, passports, certificates, and official documents',
        patterns: [
          {
            keywords: [
              'passport',
              'license',
              'certificate',
              'birth',
              'marriage',
              'social security',
            ],
            filenamePatterns: [
              /passport/i,
              /license/i,
              /certificate/i,
              /birth/i,
              /marriage/i,
            ],
            contentPatterns: [
              /passport/i,
              /driver.{0,10}license/i,
              /birth\s+certificate/i,
              /marriage\s+certificate/i,
              /social\s+security/i,
            ],
            weight: 0.8,
          },
        ],
        familyRelevance: 'medium',
        urgencyLevel: 2,
        suggestedActions: [
          'Check expiration dates',
          'Make secure copies',
          'Store in safe location',
        ],
      },
    ];
  }

  /**
   * Categorize a single document using advanced analysis
   */
  public async categorizeDocument(
    document: ExtractedDocument
  ): Promise<DocumentCategorizationResult> {
    try {
      // Extract text content if available
      const extractedText = await this.extractTextContent(document);

      // Analyze filename and content against all category patterns
      const categoryScores = await this.calculateCategoryScores(
        document,
        extractedText
      );

      // Determine best category match
      const bestMatch = this.getBestCategoryMatch(categoryScores);

      // Generate insights and suggestions
      const insights = this.generateInsights(
        bestMatch.category,
        document,
        extractedText
      );

      return {
        type: bestMatch.category.type,
        confidence: bestMatch.score,
        suggestedName: this.generateSuggestedName(bestMatch.category, document),
        expiryDate: this.extractExpiryDate(extractedText),
        familyRelevance: bestMatch.category.familyRelevance,
        insights: insights,
      };
    } catch (error) {
      console.error('Document categorization failed:', error);
      return this.createFallbackCategorization(document);
    }
  }

  /**
   * Extract text content from document based on type
   */
  private async extractTextContent(
    document: ExtractedDocument
  ): Promise<string> {
    if (document.extractedText) {
      return document.extractedText;
    }

    // For now, return empty string - would integrate with OCR/PDF extraction services
    return '';
  }

  /**
   * Calculate confidence scores for each category
   */
  private async calculateCategoryScores(
    document: ExtractedDocument,
    content: string
  ): Promise<Array<{ category: CategoryDefinition; score: number }>> {
    const scores: Array<{ category: CategoryDefinition; score: number }> = [];

    for (const category of this.categoryDefinitions) {
      let totalScore = 0;
      let totalWeight = 0;

      for (const pattern of category.patterns) {
        const patternScore = this.calculatePatternScore(
          document,
          content,
          pattern
        );
        totalScore += patternScore * pattern.weight;
        totalWeight += pattern.weight;
      }

      const normalizedScore = totalWeight > 0 ? totalScore / totalWeight : 0;
      scores.push({ category, score: normalizedScore });
    }

    return scores.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate score for a specific pattern match
   */
  private calculatePatternScore(
    document: ExtractedDocument,
    content: string,
    pattern: DocumentPattern
  ): number {
    let score = 0;
    const filename = document.filename.toLowerCase();
    const lowerContent = content.toLowerCase();

    // Filename pattern matching
    const filenameMatches = pattern.filenamePatterns.filter(regex =>
      regex.test(filename)
    ).length;
    score += filenameMatches * 0.3;

    // Keyword matching in filename
    const filenameKeywordMatches = pattern.keywords.filter(keyword =>
      filename.includes(keyword.toLowerCase())
    ).length;
    score += filenameKeywordMatches * 0.2;

    // Content pattern matching (if content available)
    if (content) {
      const contentPatternMatches = pattern.contentPatterns.filter(regex =>
        regex.test(lowerContent)
      ).length;
      score += contentPatternMatches * 0.3;

      // Keyword matching in content
      const contentKeywordMatches = pattern.keywords.filter(keyword =>
        lowerContent.includes(keyword.toLowerCase())
      ).length;
      score += contentKeywordMatches * 0.1;
    }

    // MIME type bonus
    if (this.getMimeTypeBonus(document.mimeType, pattern)) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Get MIME type relevance bonus
   */
  private getMimeTypeBonus(
    mimeType: string,
    pattern: DocumentPattern
  ): boolean {
    // PDF bonus for legal documents
    if (mimeType === 'application/pdf') {
      const legalKeywords = ['will', 'trust', 'insurance', 'deed', 'contract'];
      return pattern.keywords.some(keyword => legalKeywords.includes(keyword));
    }

    // Image bonus for scanned documents
    if (mimeType.startsWith('image/')) {
      const scannedKeywords = [
        'certificate',
        'license',
        'passport',
        'identification',
      ];
      return pattern.keywords.some(keyword =>
        scannedKeywords.includes(keyword)
      );
    }

    return false;
  }

  /**
   * Get the best category match from scores
   */
  private getBestCategoryMatch(
    scores: Array<{ category: CategoryDefinition; score: number }>
  ): { category: CategoryDefinition; score: number } {
    const bestMatch = scores[0];

    // Apply minimum confidence threshold
    if (bestMatch.score < 0.2) {
      // Return 'other' category if confidence too low
      const otherCategory: CategoryDefinition = {
        type: 'other',
        name: 'Other Documents',
        description: 'Uncategorized documents',
        patterns: [],
        familyRelevance: 'low',
        urgencyLevel: 1,
        suggestedActions: ['Review and categorize manually'],
      };
      return { category: otherCategory, score: 0.1 };
    }

    return bestMatch;
  }

  /**
   * Generate suggested name for document
   */
  private generateSuggestedName(
    category: CategoryDefinition,
    document: ExtractedDocument
  ): string {
    const date = new Date(document.metadata.date);
    const year = date.getFullYear();
    const month = date.toLocaleDateString('en-US', { month: 'short' });

    const baseName = category.name;

    // Extract sender organization for more specific naming
    const senderEmail = document.metadata.fromEmail;
    const domain = senderEmail.split('@')[1]?.split('.')[0];
    const organization = domain ? this.capitalizeFirst(domain) : '';

    // Generate contextual names
    switch (category.type) {
      case 'will':
        return `Last Will and Testament - ${year}`;
      case 'trust':
        return `Trust Agreement - ${year}`;
      case 'insurance':
        return organization
          ? `${organization} Insurance Policy - ${year}`
          : `Insurance Policy - ${year}`;
      case 'bank_statement':
        return organization
          ? `${organization} Statement - ${month} ${year}`
          : `Bank Statement - ${month} ${year}`;
      case 'investment':
        return organization
          ? `${organization} Investment Statement - ${year}`
          : `Investment Statement - ${year}`;
      case 'tax_document':
        return `Tax Documents - ${year}`;
      case 'property_deed':
        return `Property Deed - ${year}`;
      case 'medical':
        return `Medical Records - ${month} ${year}`;
      case 'identification':
        return `ID Documents - ${year}`;
      default:
        return `${baseName} - ${month} ${year}`;
    }
  }

  /**
   * Extract expiry date from document content
   */
  private extractExpiryDate(content: string): Date | undefined {
    if (!content) return undefined;

    // Common expiry date patterns
    const expiryPatterns = [
      /expir(?:es?|ation)\s*(?:date)?:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{4})/i,
      /valid\s+(?:until|through):?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{4})/i,
      /renewal\s+date:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{4})/i,
      /due\s+date:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{4})/i,
    ];

    for (const pattern of expiryPatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        const dateStr = match[1];
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate.getTime()) && parsedDate > new Date()) {
          return parsedDate;
        }
      }
    }

    return undefined;
  }

  /**
   * Generate insights based on document category and content
   */
  private generateInsights(
    category: CategoryDefinition,
    document: ExtractedDocument,
    _content: string
  ): string[] {
    const insights: string[] = [];

    // Add category-specific insights
    insights.push(...category.suggestedActions);

    // Add time-based insights
    const documentDate = new Date(document.metadata.date);
    const monthsOld =
      (Date.now() - documentDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

    if (monthsOld > 12 && category.familyRelevance === 'high') {
      insights.push(
        'Document is over a year old - consider reviewing for updates'
      );
    }

    // Add size-based insights
    if (document.size > 5 * 1024 * 1024) {
      // > 5MB
      insights.push(
        'Large file - may contain detailed information worth reviewing'
      );
    }

    // Add sender-based insights
    if (
      document.metadata.fromEmail.includes('attorney') ||
      document.metadata.fromEmail.includes('law') ||
      document.metadata.fromEmail.includes('legal')
    ) {
      insights.push(
        'Received from legal professional - likely important for estate planning'
      );
    }

    return insights.slice(0, 3); // Limit to top 3 insights
  }

  /**
   * Create fallback categorization for failed analysis
   */
  private createFallbackCategorization(
    document: ExtractedDocument
  ): DocumentCategorizationResult {
    return {
      type: 'other',
      confidence: 0.1,
      suggestedName: document.filename,
      familyRelevance: 'medium',
      insights: [
        'Document could not be automatically categorized',
        'Manual review recommended',
      ],
    };
  }

  /**
   * Utility function to capitalize first letter
   */
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Batch categorize multiple documents with progress tracking
   */
  public async batchCategorizeDocuments(
    documents: ExtractedDocument[],
    onProgress?: (processed: number, total: number) => void
  ): Promise<DocumentCategorizationResult[]> {
    const results: DocumentCategorizationResult[] = [];

    for (let i = 0; i < documents.length; i++) {
      const document = documents[i];
      const categorization = await this.categorizeDocument(document);
      results.push(categorization);

      if (onProgress) {
        onProgress(i + 1, documents.length);
      }
    }

    return results;
  }
}

export const documentCategorizationService =
  DocumentCategorizationService.getInstance();
