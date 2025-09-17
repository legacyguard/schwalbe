
/**
 * AI-Powered Document Analysis Service
 * Phase 6: AI Intelligence & Document Analysis
 */

export interface DocumentAnalysisResult {
  analysisVersion: string;
  // Document Classification
  category: DocumentCategory;
  confidence: number;

  importanceLevel: 'critical' | 'high' | 'low' | 'medium';
  // AI Insights
  insights: DocumentInsight[];

  // Content Analysis
  keyInformation: KeyInformation;

  // Metadata Extraction
  metadata: DocumentMetadata;
  piiDetected: PIIDetection[];

  // Processing Info
  processingTime: number;

  // Recommendations
  recommendations: DocumentRecommendation[];
  // Privacy & Security
  sensitivityLevel: 'confidential' | 'private' | 'public' | 'restricted';

  subcategory: string;
  tags: string[];
  timestamp: number;
}

export interface DocumentCategory {
  primary:
    | 'business'
    | 'education'
    | 'financial'
    | 'government'
    | 'insurance'
    | 'legal'
    | 'medical'
    | 'other'
    | 'personal'
    | 'property';
  secondary?: string;
  tertiary?: string;
}

export interface KeyInformation {
  accounts: string[];
  // Contact Information
  addresses: ExtractedAddress[];
  // Financial Information
  amounts: ExtractedAmount[];

  // Legal Information
  contractTerms: string[];
  effectiveDate?: Date;

  emails: string[];
  expirationDate?: Date;

  // Dates
  importantDates: ExtractedDate[];
  obligations: string[];
  organizations: string[];

  // People & Entities
  people: ExtractedPerson[];
  phoneNumbers: string[];
  rights: string[];
}

export interface DocumentMetadata {
  creationDate?: Date;
  description: string;
  documentType: string;
  jurisdiction?: string;
  language: string;
  lastModified?: Date;
  pageCount?: number;
  title: string;
  wordCount?: number;
}

export interface DocumentInsight {
  actionRequired?: boolean;
  confidence: number;
  description: string;
  dueDate?: Date;
  title: string;
  type: 'info' | 'opportunity' | 'reminder' | 'warning';
}

export interface DocumentRecommendation {
  description: string;
  estimatedEffort: 'extensive' | 'moderate' | 'quick';
  priority: 'high' | 'low' | 'medium';
  title: string;
  type: 'action' | 'organization' | 'renewal' | 'security' | 'sharing';
}

export interface PIIDetection {
  confidence: number;
  content: string;
  location: { line?: number; page?: number; position?: number };
  redacted: boolean;
  type:
    | 'address'
    | 'bank_account'
    | 'credit_card'
    | 'email'
    | 'license'
    | 'name'
    | 'passport'
    | 'phone'
    | 'ssn';
}

export interface ExtractedDate {
  confidence: number;
  context: string;
  date: Date;
  type:
    | 'birth'
    | 'created'
    | 'due'
    | 'effective'
    | 'event'
    | 'expiration'
    | 'modified';
}

export interface ExtractedPerson {
  confidence: number;
  name: string;
  relationship?: string;
  role?: string;
}

export interface ExtractedAmount {
  amount: number;
  confidence: number;
  context: string;
  currency: string;
  type:
    | 'benefit'
    | 'fee'
    | 'limit'
    | 'payment'
    | 'penalty'
    | 'salary'
    | 'value';
}

export interface ExtractedAddress {
  city?: string;
  confidence: number;
  country?: string;
  fullAddress: string;
  state?: string;
  street?: string;
  type?: 'billing' | 'home' | 'mailing' | 'property' | 'work';
  zipCode?: string;
}

export interface AnalysisOptions {
  anonymizeResults: boolean;
  // Custom Categories
  customCategories?: string[];
  detectPII: boolean;

  // Analysis Depth
  enableDeepAnalysis: boolean;
  extractMetadata: boolean;

  languageModel: 'claude-3' | 'gemini-pro' | 'gpt-4' | 'local';
  // Privacy Options
  localProcessing: boolean;

  maxPages: number;
  organizationContext?: string;

  // Performance Options
  timeout: number;
  // AI Model Preferences
  useAdvancedModels: boolean;
}

export class DocumentAnalyzer {
  private config: AnalysisOptions;
  private analysisCache: Map<string, DocumentAnalysisResult> = new Map();

  constructor(config: AnalysisOptions) {
    this.config = config;
  }

  /**
   * Analyze a document and extract insights
   */
  async analyzeDocument(
    content: Blob | File | string,
    filename?: string,
    mimeType?: string
  ): Promise<DocumentAnalysisResult> {
    const startTime = performance.now();

    try {
      // Generate cache key
      const cacheKey = await this.generateCacheKey(content, filename);

      // Check cache first
      if (this.analysisCache.has(cacheKey)) {
        return this.analysisCache.get(cacheKey)!;
      }

      // Extract text content
      const textContent = await this.extractTextContent(content, mimeType);

      // Perform analysis
      const result = await this.performAnalysis(textContent, filename);

      // Add processing metadata
      result.processingTime = performance.now() - startTime;
      result.analysisVersion = '1.0.0';
      result.timestamp = Date.now();

      // Cache result
      this.analysisCache.set(cacheKey, result);

      return result;
    } catch (error) {
      throw new Error(
        `Document analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Classify documents into categories
   */
  async classifyDocument(
    content: string,
    _filename?: string
  ): Promise<DocumentCategory> {
    const patterns = this.getClassificationPatterns();

    // Analyze content for classification signals
    const contentLower = content.toLowerCase();
    const scores: Record<string, number> = {};

    // Score each category
    for (const [category, pattern] of Object.entries(patterns)) {
      scores[category] = this.calculateCategoryScore(contentLower, pattern);
    }

    // Find best match
    const bestCategory = Object.entries(scores).reduce((a, b) =>
      scores[a[0]] > scores[b[0]] ? a : b
    )[0];

    return {
      primary: bestCategory as DocumentCategory['primary'],
      secondary: this.getSubcategory(bestCategory, content),
    };
  }

  /**
   * Extract key information from document
   */
  async extractKeyInformation(content: string): Promise<KeyInformation> {
    return {
      importantDates: this.extractDates(content),
      people: this.extractPeople(content),
      organizations: this.extractOrganizations(content),
      amounts: this.extractAmounts(content),
      accounts: this.extractAccountNumbers(content),
      contractTerms: this.extractContractTerms(content),
      obligations: this.extractObligations(content),
      rights: this.extractRights(content),
      addresses: this.extractAddresses(content),
      phoneNumbers: this.extractPhoneNumbers(content),
      emails: this.extractEmails(content),
    };
  }

  /**
   * Generate insights about the document
   */
  async generateInsights(
    _content: string,
    keyInfo: KeyInformation,
    category: DocumentCategory
  ): Promise<DocumentInsight[]> {
    const insights: DocumentInsight[] = [];

    // Expiration warnings
    for (const date of keyInfo.importantDates) {
      if (date.type === 'expiration' && this.isExpiringSoon(date.date)) {
        insights.push({
          type: 'warning',
          title: 'Document Expiring Soon',
          description: `This document expires on ${date.date.toLocaleDateString()}`,
          confidence: date.confidence,
          actionRequired: true,
          dueDate: date.date,
        });
      }
    }

    // Missing information warnings
    if (category.primary === 'legal' && keyInfo.contractTerms.length === 0) {
      insights.push({
        type: 'warning',
        title: 'Contract Terms Not Clearly Identified',
        description:
          'Consider reviewing this legal document to ensure all terms are understood',
        confidence: 0.7,
        actionRequired: false,
      });
    }

    // Opportunity insights
    if (category.primary === 'financial' && keyInfo.amounts.length > 0) {
      const hasLargeAmounts = keyInfo.amounts.some(
        amount => amount.amount > 10000
      );
      if (hasLargeAmounts) {
        insights.push({
          type: 'opportunity',
          title: 'High-Value Financial Document',
          description:
            'This document contains significant financial information that may require special attention',
          confidence: 0.8,
        });
      }
    }

    return insights;
  }

  /**
   * Detect personally identifiable information
   */
  async detectPII(content: string): Promise<PIIDetection[]> {
    const piiPatterns = {
      ssn: /\b\d{3}-?\d{2}-?\d{4}\b/g,
      credit_card: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
    };

    const detections: PIIDetection[] = [];

    for (const [type, pattern] of Object.entries(piiPatterns)) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        if (match.index !== undefined) {
          detections.push({
            type: type as PIIDetection['type'],
            content: this.maskPII(match[0], type),
            confidence: this.calculatePIIConfidence(match[0], type),
            location: { position: match.index },
            redacted: true,
          });
        }
      }
    }

    return detections;
  }

  /**
   * Extract text content from various file types
   */
  private async extractTextContent(
    content: Blob | File | string,
    _mimeType?: string
  ): Promise<string> {
    if (typeof content === 'string') {
      return content;
    }

    // For File/Blob objects, we would typically use libraries like:
    // - pdf-parse for PDFs
    // - mammoth for Word documents
    // - xlsx for Excel files
    // For now, we'll simulate this functionality

    if (content instanceof File) {
      const text = await content.text();
      return text;
    }

    return 'Simulated extracted text content';
  }

  /**
   * Perform the main document analysis
   */
  private async performAnalysis(
    textContent: string,
    filename?: string
  ): Promise<DocumentAnalysisResult> {
    // Classify document
    const category = await this.classifyDocument(textContent, filename);

    // Extract key information
    const keyInformation = await this.extractKeyInformation(textContent);

    // Generate metadata
    const metadata = this.generateMetadata(textContent, filename);

    // Generate insights
    const insights = await this.generateInsights(
      textContent,
      keyInformation,
      category
    );

    // Detect PII
    const piiDetected = this.config.detectPII
      ? await this.detectPII(textContent)
      : [];

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      category,
      keyInformation,
      insights
    );

    // Generate tags
    const tags = this.generateTags(category, keyInformation, textContent);

    return {
      category,
      subcategory: category.secondary || 'General',
      confidence: 0.85, // Would be calculated based on analysis quality
      keyInformation,
      importanceLevel: this.calculateImportanceLevel(
        category,
        keyInformation,
        insights
      ),
      metadata,
      insights,
      tags,
      recommendations,
      sensitivityLevel: this.calculateSensitivityLevel(piiDetected, category),
      piiDetected,
      processingTime: 0, // Will be set by caller
      analysisVersion: '',
      timestamp: 0,
    };
  }

  /**
   * Generate cache key for analysis results
   */
  private async generateCacheKey(
    content: Blob | File | string,
    filename?: string
  ): Promise<string> {
    const contentStr =
      typeof content === 'string'
        ? content
        : await this.getContentHash(content);
    return `${contentStr}-${filename || 'unknown'}-${this.config.useAdvancedModels}`;
  }

  private async getContentHash(content: Blob | File): Promise<string> {
    const buffer = await content.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Get classification patterns for different document types
   */
  private getClassificationPatterns(): Record<string, RegExp[]> {
    return {
      legal: [
        /contract|agreement|terms|conditions|legal|law|court|attorney|lawyer/i,
        /whereas|therefore|party|parties|obligations|rights|liability/i,
        /witness|signature|notary|jurisdiction|governing law/i,
      ],
      financial: [
        /bank|account|financial|money|payment|transaction|invoice|receipt/i,
        /tax|irs|income|deduction|investment|loan|mortgage|credit/i,
        /statement|balance|deposit|withdrawal|interest|fee/i,
      ],
      medical: [
        /medical|health|patient|doctor|physician|hospital|clinic|treatment/i,
        /diagnosis|medication|prescription|insurance|healthcare|procedure/i,
        /symptoms|condition|therapy|examination|test results/i,
      ],
      insurance: [
        /insurance|policy|coverage|claim|premium|deductible|beneficiary/i,
        /policyholder|insured|insurer|liability|coverage|benefit/i,
        /accident|damage|loss|protection|risk|underwriter/i,
      ],
      property: [
        /property|real estate|deed|title|mortgage|lease|rental|landlord/i,
        /tenant|property tax|zoning|appraisal|inspection|closing/i,
        /homeowners|property line|easement|covenant/i,
      ],
    };
  }

  private calculateCategoryScore(content: string, patterns: RegExp[]): number {
    let score = 0;
    for (const pattern of patterns) {
      const matches = content.match(pattern);
      score += matches ? matches.length : 0;
    }
    return score;
  }

  private getSubcategory(
    category: string,
    content: string
  ): string | undefined {
    const subcategories: Record<string, Record<string, RegExp>> = {
      legal: {
        'Employment Contract': /employment|job|work|salary|employee|employer/i,
        'Service Agreement': /service|provider|client|consultant|freelance/i,
        'Lease Agreement': /lease|rent|tenant|landlord|property/i,
        'Purchase Agreement': /purchase|buy|sell|sale|acquisition/i,
      },
      financial: {
        'Bank Statement': /statement|balance|transaction|deposit|withdrawal/i,
        'Tax Document': /tax|irs|1040|w2|1099|deduction/i,
        Investment: /investment|stock|bond|portfolio|mutual fund/i,
        'Loan Document': /loan|mortgage|credit|financing|debt/i,
      },
    };

    if (subcategories[category]) {
      for (const [subcat, pattern] of Object.entries(subcategories[category])) {
        if (pattern.test(content)) {
          return subcat;
        }
      }
    }

    return undefined;
  }

  // Additional helper methods for information extraction
  private extractDates(content: string): ExtractedDate[] {
    const datePatterns = [
      { pattern: /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, format: 'MM/DD/YYYY' },
      { pattern: /\b\d{4}-\d{2}-\d{2}\b/g, format: 'YYYY-MM-DD' },
      { pattern: /\b\d{1,2}-\d{1,2}-\d{4}\b/g, format: 'MM-DD-YYYY' },
    ];

    const dates: ExtractedDate[] = [];

    for (const { pattern, format: _format } of datePatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const dateStr = match[0];
        const date = new Date(dateStr);

        if (!isNaN(date.getTime())) {
          dates.push({
            date,
            type: this.inferDateType(content, match.index || 0),
            confidence: 0.8,
            context: this.getContextAroundPosition(
              content,
              match.index || 0,
              50
            ),
          });
        }
      }
    }

    return dates;
  }

  private extractPeople(content: string): ExtractedPerson[] {
    // Simple name extraction (in production, would use NLP libraries)
    const namePattern = /\b([A-Z][a-z]+ [A-Z][a-z]+)\b/g;
    const people: ExtractedPerson[] = [];

    const matches = content.matchAll(namePattern);
    for (const match of matches) {
      people.push({
        name: match[1],
        confidence: 0.7,
        role: this.inferPersonRole(content, match.index || 0),
      });
    }

    return people;
  }

  private extractOrganizations(content: string): string[] {
    // Simple organization extraction
    const orgPatterns = [
      /\b([A-Z][a-z]+ (?:Inc|LLC|Corp|Corporation|Company|Co|Ltd)\.?)\b/g,
      /\b([A-Z][a-z]+ [A-Z][a-z]+ (?:Inc|LLC|Corp|Corporation|Company|Co|Ltd)\.?)\b/g,
    ];

    const organizations: string[] = [];

    for (const pattern of orgPatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        organizations.push(match[1]);
      }
    }

    return [...new Set(organizations)]; // Remove duplicates
  }

  private extractAmounts(content: string): ExtractedAmount[] {
    const amountPattern = /\$[\d,]+\.?\d*/g;
    const amounts: ExtractedAmount[] = [];

    const matches = content.matchAll(amountPattern);
    for (const match of matches) {
      const amountStr = match[0].replace(/[$,]/g, '');
      const amount = parseFloat(amountStr);

      if (!isNaN(amount)) {
        amounts.push({
          amount,
          currency: 'USD',
          type: this.inferAmountType(content, match.index || 0),
          context: this.getContextAroundPosition(content, match.index || 0, 30),
          confidence: 0.9,
        });
      }
    }

    return amounts;
  }

  private extractAccountNumbers(content: string): string[] {
    const accountPattern = /(?:account|acct)[\s#:]*(\d{8,})/gi;
    const accounts: string[] = [];

    const matches = content.matchAll(accountPattern);
    for (const match of matches) {
      accounts.push(match[1]);
    }

    return accounts;
  }

  private extractContractTerms(content: string): string[] {
    const termPatterns = [
      /term(?:s)?.*?(?:\.|;|\n)/gi,
      /condition(?:s)?.*?(?:\.|;|\n)/gi,
      /obligation(?:s)?.*?(?:\.|;|\n)/gi,
    ];

    const terms: string[] = [];

    for (const pattern of termPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        terms.push(...matches.map(term => term.trim()));
      }
    }

    return terms;
  }

  private extractObligations(content: string): string[] {
    const obligationPattern =
      /(?:shall|must|will|agrees? to|required to|obligated to).*?(?:\.|;|\n)/gi;
    const matches = content.match(obligationPattern);
    return matches ? matches.map(obligation => obligation.trim()) : [];
  }

  private extractRights(content: string): string[] {
    const rightsPattern =
      /(?:right to|entitled to|may|permitted to).*?(?:\.|;|\n)/gi;
    const matches = content.match(rightsPattern);
    return matches ? matches.map(right => right.trim()) : [];
  }

  private extractAddresses(content: string): ExtractedAddress[] {
    const addressPattern =
      /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd)(?:,\s*[A-Za-z\s]+,?\s*\d{5})?/g;
    const addresses: ExtractedAddress[] = [];

    const matches = content.matchAll(addressPattern);
    for (const match of matches) {
      addresses.push({
        fullAddress: match[0],
        confidence: 0.8,
        type: this.inferAddressType(content, match.index || 0),
      });
    }

    return addresses;
  }

  private extractPhoneNumbers(content: string): string[] {
    const phonePattern = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
    const matches = content.match(phonePattern);
    return matches || [];
  }

  private extractEmails(content: string): string[] {
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const matches = content.match(emailPattern);
    return matches || [];
  }

  // Helper methods for analysis
  private generateMetadata(
    content: string,
    filename?: string
  ): DocumentMetadata {
    return {
      title: this.extractTitle(content, filename),
      description: this.generateDescription(content),
      documentType: this.inferDocumentType(content, filename),
      language: 'en', // Would be detected in production
      wordCount: content.split(/\s+/).length,
      pageCount: Math.ceil(content.length / 3000), // Rough estimate
    };
  }

  private extractTitle(content: string, filename?: string): string {
    // Try to extract title from content
    const titlePatterns = [/^([A-Z][^.\n]+)/m, /title:\s*(.+)/i, /^(.{1,100})/];

    for (const pattern of titlePatterns) {
      const match = content.match(pattern);
      if (match && match[1].trim().length > 0) {
        return match[1].trim();
      }
    }

    return filename ? filename.replace(/\.[^/.]+$/, '') : 'Untitled Document';
  }

  private generateDescription(content: string): string {
    // Extract first meaningful sentence or paragraph
    const sentences = content.split(/[.!?]+/);
    const meaningfulSentences = sentences.filter(s => s.trim().length > 20);
    return (
      meaningfulSentences[0]?.trim() || 'Document content analysis available'
    );
  }

  private inferDocumentType(_content: string, filename?: string): string {
    if (filename) {
      const ext = filename.split('.').pop()?.toLowerCase();
      if (ext) {
        const typeMap: Record<string, string> = {
          pdf: 'PDF Document',
          doc: 'Word Document',
          docx: 'Word Document',
          txt: 'Text Document',
          rtf: 'Rich Text Document',
        };
        if (typeMap[ext]) {
          return typeMap[ext];
        }
      }
    }

    return 'Document';
  }

  private generateRecommendations(
    category: DocumentCategory,
    keyInfo: KeyInformation,
    _insights: DocumentInsight[]
  ): DocumentRecommendation[] {
    const recommendations: DocumentRecommendation[] = [];

    // Expiration-based recommendations
    if (keyInfo.importantDates.some(d => d.type === 'expiration')) {
      recommendations.push({
        type: 'renewal',
        title: 'Set Renewal Reminders',
        description:
          'Consider setting up automatic reminders for document renewals',
        priority: 'medium',
        estimatedEffort: 'quick',
      });
    }

    // Security recommendations for sensitive documents
    if (category.primary === 'financial' || category.primary === 'legal') {
      recommendations.push({
        type: 'security',
        title: 'Secure Storage',
        description:
          'This document contains sensitive information and should be stored securely',
        priority: 'high',
        estimatedEffort: 'quick',
      });
    }

    return recommendations;
  }

  private generateTags(
    category: DocumentCategory,
    keyInfo: KeyInformation,
    _content: string
  ): string[] {
    const tags: string[] = [];

    // Category-based tags
    tags.push(category.primary);
    if (category.secondary) {
      tags.push(category.secondary.toLowerCase().replace(/\s+/g, '-'));
    }

    // Content-based tags
    if (keyInfo.importantDates.length > 0) {
      tags.push('dated');
    }

    if (keyInfo.amounts.length > 0) {
      tags.push('financial-amounts');
    }

    if (keyInfo.people.length > 0) {
      tags.push('personal-info');
    }

    return tags;
  }

  private calculateImportanceLevel(
    category: DocumentCategory,
    keyInfo: KeyInformation,
    insights: DocumentInsight[]
  ): 'critical' | 'high' | 'low' | 'medium' {
    let score = 0;

    // Category importance
    const categoryWeights: Record<string, number> = {
      legal: 3,
      financial: 3,
      medical: 2,
      insurance: 2,
      property: 2,
      government: 2,
      personal: 1,
      business: 1,
      education: 1,
      other: 0,
    };

    score += categoryWeights[category.primary] || 0;

    // Large amounts increase importance
    if (keyInfo.amounts.some(a => a.amount > 10000)) {
      score += 2;
    }

    // Critical insights increase importance
    if (insights.some(i => i.type === 'warning' && i.actionRequired)) {
      score += 2;
    }

    if (score >= 6) return 'critical';
    if (score >= 4) return 'high';
    if (score >= 2) return 'medium';
    return 'low';
  }

  private calculateSensitivityLevel(
    piiDetected: PIIDetection[],
    category: DocumentCategory
  ): 'confidential' | 'private' | 'public' | 'restricted' {
    if (
      piiDetected.some(pii => pii.type === 'ssn' || pii.type === 'credit_card')
    ) {
      return 'restricted';
    }

    if (category.primary === 'legal' || category.primary === 'financial') {
      return 'confidential';
    }

    if (piiDetected.length > 0) {
      return 'private';
    }

    return 'public';
  }

  private maskPII(content: string, type: string): string {
    switch (type) {
      case 'ssn':
        return content.replace(/\d(?=\d{4})/g, '*');
      case 'credit_card':
        return content.replace(/\d(?=\d{4})/g, '*');
      case 'email': {
        const [local, domain] = content.split('@');
        return `${local.slice(0, 2)}***@${domain}`;
      }
      default:
        return content.replace(/./g, '*');
    }
  }

  private calculatePIIConfidence(content: string, type: string): number {
    // Simple confidence calculation based on pattern matching
    switch (type) {
      case 'ssn':
        return /^\d{3}-\d{2}-\d{4}$/.test(content) ? 0.95 : 0.7;
      case 'credit_card':
        return content.replace(/\D/g, '').length === 16 ? 0.9 : 0.6;
      case 'email':
        return /@.+\..+/.test(content) ? 0.95 : 0.7;
      default:
        return 0.5;
    }
  }

  // Context and inference helper methods
  private getContextAroundPosition(
    content: string,
    position: number,
    radius: number
  ): string {
    const start = Math.max(0, position - radius);
    const end = Math.min(content.length, position + radius);
    return content.slice(start, end).trim();
  }

  private inferDateType(
    content: string,
    position: number
  ): ExtractedDate['type'] {
    const context = this.getContextAroundPosition(
      content,
      position,
      30
    ).toLowerCase();

    if (context.includes('expir')) return 'expiration';
    if (context.includes('effective') || context.includes('start'))
      return 'effective';
    if (context.includes('birth')) return 'birth';
    if (context.includes('due')) return 'due';

    return 'event';
  }

  private inferPersonRole(
    content: string,
    position: number
  ): string | undefined {
    const context = this.getContextAroundPosition(
      content,
      position,
      50
    ).toLowerCase();

    if (context.includes('attorney') || context.includes('lawyer'))
      return 'attorney';
    if (context.includes('client')) return 'client';
    if (context.includes('witness')) return 'witness';
    if (context.includes('doctor') || context.includes('physician'))
      return 'doctor';

    return undefined;
  }

  private inferAmountType(
    content: string,
    position: number
  ): ExtractedAmount['type'] {
    const context = this.getContextAroundPosition(
      content,
      position,
      30
    ).toLowerCase();

    if (context.includes('fee') || context.includes('charge')) return 'fee';
    if (context.includes('payment') || context.includes('pay'))
      return 'payment';
    if (context.includes('salary') || context.includes('wage')) return 'salary';
    if (context.includes('benefit')) return 'benefit';
    if (context.includes('penalty') || context.includes('fine'))
      return 'penalty';
    if (context.includes('limit')) return 'limit';

    return 'value';
  }

  private inferAddressType(
    content: string,
    position: number
  ): ExtractedAddress['type'] | undefined {
    const context = this.getContextAroundPosition(
      content,
      position,
      50
    ).toLowerCase();

    if (context.includes('home') || context.includes('residence'))
      return 'home';
    if (
      context.includes('work') ||
      context.includes('office') ||
      context.includes('business')
    )
      return 'work';
    if (context.includes('billing')) return 'billing';
    if (context.includes('mailing') || context.includes('mail'))
      return 'mailing';
    if (context.includes('property')) return 'property';

    return undefined;
  }

  private isExpiringSoon(date: Date, daysAhead: number = 60): boolean {
    const now = new Date();
    const timeDiff = date.getTime() - now.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    return daysDiff >= 0 && daysDiff <= daysAhead;
  }
}

// Create and export default analyzer instance
export const documentAnalyzer = new DocumentAnalyzer({
  enableDeepAnalysis: true,
  extractMetadata: true,
  detectPII: true,
  useAdvancedModels: false, // Start with local processing
  languageModel: 'local',
  localProcessing: true,
  anonymizeResults: true,
  timeout: 30000, // 30 seconds
  maxPages: 100,
});

// Export convenience functions
export const analyzeDocument = (
  content: Blob | File | string,
  filename?: string,
  mimeType?: string
) => {
  return documentAnalyzer.analyzeDocument(content, filename, mimeType);
};

export const classifyDocument = (content: string, filename?: string) => {
  return documentAnalyzer.classifyDocument(content, filename);
};

export const extractKeyInformation = (content: string) => {
  return documentAnalyzer.extractKeyInformation(content);
};
