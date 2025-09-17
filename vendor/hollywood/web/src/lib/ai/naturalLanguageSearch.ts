
/**
 * Natural Language Query Processing for Document Search
 * Enables intelligent document search using natural language queries
 */

export interface SearchQuery {
  entities: QueryEntity[];
  filters: SearchFilter[];
  id: string;
  intent: QueryIntent;
  originalQuery: string;
  processedQuery: ProcessedQuery;
  timestamp: string;
}

export interface ProcessedQuery {
  concepts: string[];
  confidence: number;
  keywords: string[];
  semanticEmbedding?: number[];
  synonyms: string[];
}

export interface QueryIntent {
  action: QueryAction;
  confidence: number;
  parameters: Record<string, any>;
  target: QueryTarget;
  type: IntentType;
}

export interface QueryEntity {
  confidence: number;
  context: string;
  normalizedValue: string;
  type: EntityType;
  value: string;
}

export interface SearchFilter {
  boost?: number;
  field: string;
  operator: FilterOperator;
  value: any;
}

export interface SearchResult {
  documentId: string;
  highlights: Highlight[];
  matches: SearchMatch[];
  metadata: DocumentMetadata;
  relevanceScore: number;
  semanticScore: number;
  snippet: string;
  title: string;
}

export interface SearchMatch {
  context: string;
  field: string;
  position: number;
  score: number;
  type: 'concept' | 'entity' | 'keyword' | 'semantic';
  value: string;
}

export interface Highlight {
  field: string;
  fragments: string[];
  maxScore: number;
}

export interface DocumentMetadata {
  category: string;
  createdAt: string;
  importance: string;
  modifiedAt: string;
  size: number;
  tags: string[];
  type: string;
}

export type IntentType =
  | 'analyze'
  | 'compare'
  | 'filter'
  | 'find'
  | 'list'
  | 'recommend'
  | 'search'
  | 'summarize';

export type QueryAction =
  | 'aggregate'
  | 'count'
  | 'delete'
  | 'group'
  | 'retrieve'
  | 'sort'
  | 'update';

export type QueryTarget =
  | 'categories'
  | 'documents'
  | 'entities'
  | 'insights'
  | 'metadata'
  | 'relationships';

export type EntityType =
  | 'amount'
  | 'category'
  | 'date'
  | 'document_type'
  | 'keyword'
  | 'location'
  | 'organization'
  | 'person';

export type FilterOperator =
  | 'between'
  | 'contains'
  | 'ends_with'
  | 'equals'
  | 'exists'
  | 'greater_than'
  | 'in'
  | 'less_than'
  | 'starts_with';

class NaturalLanguageSearchService {
  private readonly synonyms = new Map<string, string[]>();
  private readonly concepts = new Map<string, string[]>();

  constructor() {
    this.initializeSynonyms();
    this.initializeConcepts();
  }

  /**
   * Process natural language query and return search results
   */
  async search(
    query: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<{
    query: SearchQuery;
    results: SearchResult[];
    suggestions: string[];
    totalCount: number;
  }> {
    // Parse and process the query
    const searchQuery = await this.processQuery(query);

    // Execute search
    const results = await this.executeSearch(searchQuery, options);

    // Generate suggestions
    const suggestions = await this.generateSuggestions(searchQuery, results);

    return {
      results: results.results,
      totalCount: results.totalCount,
      query: searchQuery,
      suggestions,
    };
  }

  /**
   * Process natural language query into structured search query
   */
  private async processQuery(originalQuery: string): Promise<SearchQuery> {
    const intent = await this.analyzeIntent(originalQuery);
    const entities = await this.extractEntities(originalQuery);
    const processedQuery = await this.processQueryText(originalQuery);
    const filters = await this.generateFilters(intent, entities);

    return {
      id: this.generateId(),
      originalQuery,
      processedQuery,
      intent,
      entities,
      filters,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Analyze query intent
   */
  private async analyzeIntent(query: string): Promise<QueryIntent> {
    const lowerQuery = query.toLowerCase();

    // Simple intent classification (in production, would use ML model)
    let type: IntentType = 'search';
    let action: QueryAction = 'retrieve';
    const target: QueryTarget = 'documents';

    if (lowerQuery.includes('show me') || lowerQuery.includes('find')) {
      type = 'search';
    } else if (
      lowerQuery.includes('how many') ||
      lowerQuery.includes('count')
    ) {
      action = 'count';
    } else if (lowerQuery.includes('list') || lowerQuery.includes('all')) {
      type = 'list';
    } else if (lowerQuery.includes('compare')) {
      type = 'compare';
    } else if (lowerQuery.includes('summarize')) {
      type = 'summarize';
    }

    return {
      type,
      action,
      target,
      confidence: 0.8,
      parameters: {},
    };
  }

  /**
   * Extract entities from query
   */
  private async extractEntities(query: string): Promise<QueryEntity[]> {
    const entities: QueryEntity[] = [];

    // Extract dates
    const datePattern =
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b|\b\d{4}\b|\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}\b/gi;
    const dateMatches = query.match(datePattern) || [];

    for (const match of dateMatches) {
      entities.push({
        type: 'date',
        value: match,
        normalizedValue: this.normalizeDate(match),
        confidence: 0.9,
        context: this.getContext(query, match),
      });
    }

    // Extract amounts
    const amountPattern =
      /\$[\d,]+\.?\d*|\b\d+\s*(dollars?|k|thousand|million)\b/gi;
    const amountMatches = query.match(amountPattern) || [];

    for (const match of amountMatches) {
      entities.push({
        type: 'amount',
        value: match,
        normalizedValue: this.normalizeAmount(match),
        confidence: 0.9,
        context: this.getContext(query, match),
      });
    }

    // Extract document types
    const docTypePattern =
      /\b(will|insurance|tax|contract|deed|policy|certificate|statement|report)\b/gi;
    const docTypeMatches = query.match(docTypePattern) || [];

    for (const match of docTypeMatches) {
      entities.push({
        type: 'document_type',
        value: match,
        normalizedValue: match.toLowerCase(),
        confidence: 0.8,
        context: this.getContext(query, match),
      });
    }

    return entities;
  }

  /**
   * Process query text for keywords and concepts
   */
  private async processQueryText(query: string): Promise<ProcessedQuery> {
    // Extract keywords
    const words = query.toLowerCase().match(/\b\w+\b/g) || [];
    const keywords = words.filter(
      word => word.length > 2 && !this.isStopWord(word)
    );

    // Expand with synonyms
    const synonyms: string[] = [];
    for (const keyword of keywords) {
      const keywordSynonyms = this.synonyms.get(keyword) || [];
      synonyms.push(...keywordSynonyms);
    }

    // Extract concepts
    const concepts: string[] = [];
    for (const keyword of keywords) {
      const keywordConcepts = this.concepts.get(keyword) || [];
      concepts.push(...keywordConcepts);
    }

    return {
      keywords: [...new Set(keywords)],
      synonyms: [...new Set(synonyms)],
      concepts: [...new Set(concepts)],
      confidence: 0.8,
    };
  }

  /**
   * Generate search filters from intent and entities
   */
  private async generateFilters(
    _intent: QueryIntent,
    entities: QueryEntity[]
  ): Promise<SearchFilter[]> {
    const filters: SearchFilter[] = [];

    for (const entity of entities) {
      switch (entity.type) {
        case 'date':
          filters.push({
            field: 'created_date',
            operator: 'contains',
            value: entity.normalizedValue,
            boost: 1.2,
          });
          break;
        case 'amount':
          filters.push({
            field: 'content',
            operator: 'contains',
            value: entity.value,
            boost: 1.5,
          });
          break;
        case 'document_type':
          filters.push({
            field: 'category',
            operator: 'equals',
            value: entity.normalizedValue,
            boost: 2.0,
          });
          break;
      }
    }

    return filters;
  }

  /**
   * Execute search query
   */
  private async executeSearch(
    _query: SearchQuery,
    _options: { limit?: number; offset?: number }
  ): Promise<{ results: SearchResult[]; totalCount: number }> {
    // This would integrate with actual search engine (Elasticsearch, etc.)
    // For demo purposes, return mock results

    const mockResults: SearchResult[] = [
      {
        documentId: '1',
        title: 'Last Will and Testament',
        snippet:
          'I, John Doe, being of sound mind and body, hereby declare this to be my last will and testament...',
        relevanceScore: 0.95,
        semanticScore: 0.88,
        matches: [
          {
            type: 'keyword',
            field: 'title',
            value: 'will',
            score: 0.9,
            position: 5,
            context: 'Last Will and Testament',
          },
        ],
        metadata: {
          category: 'legal',
          type: 'will',
          createdAt: '2023-01-15T10:00:00Z',
          modifiedAt: '2023-01-15T10:00:00Z',
          tags: ['estate', 'legal', 'important'],
          importance: 'critical',
          size: 2048,
        },
        highlights: [
          {
            field: 'content',
            fragments: [
              '<em>will</em> and testament',
              'hereby declare this to be my last <em>will</em>',
            ],
            maxScore: 0.9,
          },
        ],
      },
    ];

    return {
      results: mockResults,
      totalCount: mockResults.length,
    };
  }

  /**
   * Generate search suggestions
   */
  private async generateSuggestions(
    _query: SearchQuery,
    results: { results: SearchResult[]; totalCount: number }
  ): Promise<string[]> {
    const suggestions: string[] = [];

    // Suggest related queries based on results
    if (results.totalCount === 0) {
      // Suggest broader searches
      suggestions.push(
        'Try searching for "documents"',
        'Search for "important papers"',
        'Look for "legal documents"'
      );
    } else if (results.totalCount > 10) {
      // Suggest more specific searches
      const topCategory = this.getMostCommonCategory(results.results);
      suggestions.push(
        `Narrow down to ${topCategory} documents`,
        'Add date range to your search',
        'Search within specific document types'
      );
    }

    return suggestions.slice(0, 3);
  }

  /**
   * Initialize synonym mappings
   */
  private initializeSynonyms(): void {
    const synonymMappings = {
      will: ['testament', 'last will', 'estate plan'],
      insurance: ['policy', 'coverage', 'protection'],
      tax: ['taxes', 'irs', 'filing', 'return'],
      contract: ['agreement', 'deal', 'terms'],
      important: ['critical', 'essential', 'vital'],
      money: ['cash', 'funds', 'amount', 'dollars'],
      document: ['file', 'paper', 'record'],
    };

    for (const [key, values] of Object.entries(synonymMappings)) {
      this.synonyms.set(key, values);
    }
  }

  /**
   * Initialize concept mappings
   */
  private initializeConcepts(): void {
    const conceptMappings = {
      legal: ['will', 'contract', 'agreement', 'court', 'attorney'],
      financial: ['money', 'bank', 'account', 'investment', 'tax'],
      medical: ['health', 'doctor', 'hospital', 'prescription', 'insurance'],
      family: ['spouse', 'children', 'beneficiary', 'relative'],
    };

    for (const [concept, keywords] of Object.entries(conceptMappings)) {
      this.concepts.set(concept, keywords);
    }
  }

  /**
   * Helper methods
   */
  private normalizeDate(dateStr: string): string {
    try {
      return new Date(dateStr).toISOString().split('T')[0];
    } catch {
      return dateStr;
    }
  }

  private normalizeAmount(amountStr: string): string {
    const numStr = amountStr.replace(/[$,]/g, '').toLowerCase();

    if (numStr.includes('k') || numStr.includes('thousand')) {
      return (parseFloat(numStr) * 1000).toString();
    }
    if (numStr.includes('million')) {
      return (parseFloat(numStr) * 1000000).toString();
    }

    return parseFloat(numStr).toString();
  }

  private getContext(
    text: string,
    term: string,
    contextLength: number = 50
  ): string {
    const index = text.toLowerCase().indexOf(term.toLowerCase());
    if (index === -1) return '';

    const start = Math.max(0, index - contextLength);
    const end = Math.min(text.length, index + term.length + contextLength);

    return text.substring(start, end);
  }

  private isStopWord(word: string): boolean {
    const stopWords = [
      'the',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
      'a',
      'an',
      'is',
      'are',
      'was',
      'were',
      'be',
      'been',
      'being',
      'have',
      'has',
      'had',
      'do',
      'does',
      'did',
      'will',
      'would',
      'could',
      'should',
      'may',
      'might',
      'must',
      'i',
      'you',
      'he',
      'she',
      'it',
      'we',
      'they',
      'me',
      'him',
      'her',
      'us',
      'them',
    ];

    return stopWords.includes(word.toLowerCase());
  }

  private getMostCommonCategory(results: SearchResult[]): string {
    const categories = results.map(r => r.metadata.category);
    const counts = categories.reduce(
      (acc, cat) => {
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return (
      Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      'documents'
    );
  }

  private generateId(): string {
    return crypto.randomUUID();
  }
}

// Export singleton instance
export const naturalLanguageSearch = new NaturalLanguageSearchService();
export default naturalLanguageSearch;
