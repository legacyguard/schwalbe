
/**
 * Smart Document Search and Recommendations System
 * Phase 6: AI Intelligence & Document Analysis
 */

import type {
  DocumentAnalysisResult,
  DocumentCategory,
} from './documentAnalyzer';

export interface SmartSearchQuery {
  filters?: SearchFilters;
  options?: SearchOptions;
  query: string;
}

export interface SearchFilters {
  categories?: DocumentCategory['primary'][];
  dateRange?: {
    end: Date;
    field: 'created' | 'effective' | 'expiration' | 'modified';
    start: Date;
  };
  fileTypes?: string[];
  hasAmounts?: boolean;
  hasExpiration?: boolean;
  hasPeople?: boolean;
  importanceLevel?: ('critical' | 'high' | 'low' | 'medium')[];
  sensitivityLevel?: ('confidential' | 'private' | 'public' | 'restricted')[];
  sizeRange?: {
    maxSize?: number;
    minSize?: number;
  };
  tags?: string[];
}

export interface SearchOptions {
  // AI enhancement
  expandQuery?: boolean;
  // Search behavior
  fuzzyMatch?: boolean;
  includeContent?: boolean;
  includeMetadata?: boolean;

  // Result options
  maxResults?: number;
  offset?: number;
  personalizeResults?: boolean;
  semanticSearch?: boolean;

  sortBy?: 'alphabetical' | 'date' | 'importance' | 'relevance';
  sortOrder?: 'asc' | 'desc';
  suggestAlternatives?: boolean;
}

export interface SearchResult {
  analysis?: DocumentAnalysisResult;
  category: DocumentCategory;
  documentId: string;
  filename?: string;
  highlightedExcerpts: SearchHighlight[];
  lastModified: Date;
  matchedFields: string[];
  relevanceScore: number;
  size?: number;
  title: string;
}

export interface SearchHighlight {
  endPosition: number;
  excerpt: string;
  field: 'content' | 'metadata' | 'tags' | 'title';
  matchedTerms: string[];
  startPosition: number;
}

export interface SmartSearchResults {
  facets?: SearchFacets;
  queryExpansion?: string[];
  recommendations?: DocumentRecommendation[];
  results: SearchResult[];
  searchTime: number;
  suggestedQueries?: string[];
  totalResults: number;
}

export interface SearchFacets {
  categories: Record<string, number>;
  dateRanges: Record<string, number>;
  fileTypes: Record<string, number>;
  importanceLevels: Record<string, number>;
  tags: Record<string, number>;
}

export interface DocumentRecommendation {
  confidence: number;
  description: string;
  documents: SearchResult[];
  reasoning: string[];
  title: string;
  type: 'action' | 'completion' | 'related' | 'similar' | 'update';
}

export interface SearchIndex {
  analysis: DocumentAnalysisResult;
  content: string;
  documentId: string;
  embedding?: number[];
  lastIndexed: Date;
  metadata: Record<string, any>;
  tags: string[];
  title: string;
}

export interface QuerySuggestion {
  category?: string;
  confidence: number;
  description: string;
  exampleResults: number;
  query: string;
}

export class SmartSearchService {
  private searchIndex: Map<string, SearchIndex> = new Map();
  private queryHistory: string[] = [];
  private ___userPreferences: SearchPreferences = {};
  private searchAnalytics: SearchAnalytics = {
    totalQueries: 0,
    topQueries: {},
    averageResponseTime: 0,
    clickThroughRate: 0,
  };

  constructor() {
    this.initializeSearchService();
  }

  /**
   * Perform intelligent document search
   */
  async search(searchQuery: SmartSearchQuery): Promise<SmartSearchResults> {
    const startTime = performance.now();

    try {
      // Expand and enhance the query
      const enhancedQuery = await this.enhanceQuery(searchQuery);

      // Perform the search
      const rawResults = await this.executeSearch(enhancedQuery);

      // Re-rank and personalize results
      const rankedResults = await this.rankResults(rawResults, enhancedQuery);

      // Generate recommendations
      const recommendations = await this.generateRecommendations(
        rankedResults,
        enhancedQuery
      );

      // Generate facets
      const facets = this.generateFacets(rawResults);

      // Generate query suggestions
      const suggestedQueries = await this.generateQuerySuggestions(
        searchQuery.query
      );

      // Update analytics
      const searchTime = performance.now() - startTime;
      this.updateSearchAnalytics(
        searchQuery.query,
        searchTime,
        rankedResults.length
      );

      return {
        results: rankedResults.slice(
          0,
          enhancedQuery.options?.maxResults || 50
        ),
        totalResults: rawResults.length,
        searchTime,
        queryExpansion: enhancedQuery.expandedTerms,
        suggestedQueries: suggestedQueries.map(s => s.query),
        facets,
        recommendations,
      };
    } catch (error) {
      throw new Error(
        `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get search suggestions based on partial query
   */
  async getSuggestions(
    partialQuery: string,
    limit = 10
  ): Promise<QuerySuggestion[]> {
    const suggestions: QuerySuggestion[] = [];

    // Historical query suggestions
    const historicalSuggestions = this.getHistoricalSuggestions(partialQuery);
    suggestions.push(...historicalSuggestions);

    // Content-based suggestions
    const contentSuggestions =
      await this.getContentBasedSuggestions(partialQuery);
    suggestions.push(...contentSuggestions);

    // Category-based suggestions
    const categorySuggestions = this.getCategorySuggestions(partialQuery);
    suggestions.push(...categorySuggestions);

    // Remove duplicates and sort by confidence
    const uniqueSuggestions = this.deduplicateSuggestions(suggestions);
    return uniqueSuggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  }

  /**
   * Add document to search index
   */
  async indexDocument(
    documentId: string,
    title: string,
    content: string,
    analysis: DocumentAnalysisResult,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    const indexEntry: SearchIndex = {
      documentId,
      title,
      content,
      metadata,
      analysis,
      tags: analysis.tags,
      embedding: await this.generateEmbedding(content),
      lastIndexed: new Date(),
    };

    this.searchIndex.set(documentId, indexEntry);
  }

  /**
   * Remove document from search index
   */
  removeFromIndex(documentId: string): boolean {
    return this.searchIndex.delete(documentId);
  }

  /**
   * Update document in search index
   */
  async updateIndex(
    documentId: string,
    updates: Partial<
      Pick<
        SearchIndex,
        'analysis' | 'content' | 'embedding' | 'metadata' | 'tags' | 'title'
      >
    >
  ): Promise<void> {
    const existing = this.searchIndex.get(documentId);
    if (!existing) {
      throw new Error(`Document ${documentId} not found in index`);
    }

    const updated: SearchIndex = {
      ...existing,
      ...updates,
      lastIndexed: new Date(),
    };

    // Regenerate embedding if content changed
    if (updates.content) {
      updated.embedding = await this.generateEmbedding(updates.content);
    }

    this.searchIndex.set(documentId, updated);
  }

  /**
   * Get similar documents with enhanced type constraints
   */
  async findSimilarDocuments(
    documentId: string,
    options?: {
      categories?: DocumentCategory['primary'][];
      includeAnalysis?: boolean;
      limit?: number;
      threshold?: number;
    }
  ): Promise<SearchResult[]> {
    const {
      limit = 10,
      threshold = 0.7,
      categories,
      includeAnalysis: _includeAnalysis = false,
    } = options || {};
    const targetDoc = this.searchIndex.get(documentId);
    if (!targetDoc) {
      throw new Error(`Document ${documentId} not found in index`);
    }

    const similarities: Array<{ doc: SearchIndex; score: number }> = [];

    for (const [id, doc] of this.searchIndex.entries()) {
      if (id === documentId) continue;

      // Filter by categories if specified
      if (categories && !categories.includes(doc.analysis.category.primary)) {
        continue;
      }

      const similarity = this.calculateDocumentSimilarity(targetDoc, doc);
      if (similarity >= threshold) {
        similarities.push({ doc, score: similarity });
      }
    }

    // Sort by similarity and convert to search results
    return similarities
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ doc, score }) =>
        this.convertToSearchResult(doc, score, ['similarity'])
      );
  }

  /**
   * Get document recommendations based on user behavior
   */
  async getRecommendations(
    _userId?: string,
    _context?: 'expiring' | 'important' | 'recent' | 'related',
    limit = 10
  ): Promise<DocumentRecommendation[]> {
    const recommendations: DocumentRecommendation[] = [];

    // Expiring documents
    const expiringDocs = this.findExpiringDocuments();
    if (expiringDocs.length > 0) {
      recommendations.push({
        type: 'action',
        title: 'Documents Expiring Soon',
        description:
          'These documents require attention due to upcoming expiration dates',
        documents: expiringDocs.slice(0, 5),
        confidence: 0.9,
        reasoning: ['Documents with expiration dates within 60 days'],
      });
    }

    // Incomplete document sets
    const incompleteSets = await this.findIncompleteDocumentSets();
    recommendations.push(...incompleteSets);

    // Frequently accessed categories
    const trendingCategories = this.getTrendingCategories();
    if (trendingCategories.length > 0) {
      const trendingDocs = this.getDocumentsByCategories(trendingCategories);
      recommendations.push({
        type: 'related',
        title: 'Trending Document Categories',
        description: 'Popular document categories based on recent activity',
        documents: trendingDocs.slice(0, 5),
        confidence: 0.7,
        reasoning: ['Based on recent search and access patterns'],
      });
    }

    return recommendations.slice(0, limit);
  }

  /**
   * Export search analytics
   */
  getSearchAnalytics(): SearchAnalytics {
    return { ...this.searchAnalytics };
  }

  /**
   * Get search index statistics
   */
  getIndexStatistics(): {
    averageDocumentSize: number;
    categories: Record<string, number>;
    lastIndexed: Date;
    totalContent: number;
    totalDocuments: number;
  } {
    const docs = Array.from(this.searchIndex.values());

    const categories: Record<string, number> = {};
    let totalContentLength = 0;
    let lastIndexed = new Date(0);

    for (const doc of docs) {
      const category = doc.analysis.category.primary;
      categories[category] = (categories[category] || 0) + 1;
      totalContentLength += doc.content.length;
      if (doc.lastIndexed > lastIndexed) {
        lastIndexed = doc.lastIndexed;
      }
    }

    return {
      totalDocuments: docs.length,
      totalContent: totalContentLength,
      categories,
      averageDocumentSize:
        docs.length > 0 ? totalContentLength / docs.length : 0,
      lastIndexed,
    };
  }

  // Private methods

  private initializeSearchService(): void {
    // Initialize any required search components
    // Smart search service initialized
  }

  private async enhanceQuery(query: SmartSearchQuery): Promise<EnhancedQuery> {
    const enhanced: EnhancedQuery = {
      ...query,
      expandedTerms: [],
      synonyms: [],
      corrections: [],
    };

    // Query expansion
    if (query.options?.expandQuery !== false) {
      enhanced.expandedTerms = await this.expandQuery(query.query);
    }

    // Add synonyms
    enhanced.synonyms = this.findSynonyms(query.query);

    // Auto-correct common typos
    enhanced.corrections = this.correctSpelling(query.query);

    return enhanced;
  }

  private async executeSearch(query: EnhancedQuery): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const searchTerms = this.extractSearchTerms(query.query);

    for (const [_documentId, indexEntry] of this.searchIndex.entries()) {
      const relevanceScore = this.calculateRelevance(
        indexEntry,
        searchTerms,
        query
      );

      if (relevanceScore > 0) {
        const result = this.convertToSearchResult(
          indexEntry,
          relevanceScore,
          this.findMatchedFields(indexEntry, searchTerms)
        );
        results.push(result);
      }
    }

    return results;
  }

  private async rankResults(
    results: SearchResult[],
    query: EnhancedQuery
  ): Promise<SearchResult[]> {
    // Apply machine learning ranking if available
    const rankedResults = [...results];

    // Sort by relevance score
    rankedResults.sort((a, b) => {
      switch (query.options?.sortBy) {
        case 'date':
          return query.options.sortOrder === 'asc'
            ? a.lastModified.getTime() - b.lastModified.getTime()
            : b.lastModified.getTime() - a.lastModified.getTime();
        case 'importance': {
          const importanceOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          const aImportance =
            importanceOrder[a.analysis?.importanceLevel || 'low'];
          const bImportance =
            importanceOrder[b.analysis?.importanceLevel || 'low'];
          return query.options.sortOrder === 'asc'
            ? aImportance - bImportance
            : bImportance - aImportance;
        }
        case 'alphabetical': {
          return query.options.sortOrder === 'asc'
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        }
        case 'relevance':
        default: {
          return b.relevanceScore - a.relevanceScore;
        }
      }
    });

    // Apply personalization
    if (query.options?.personalizeResults) {
      return this.personalizeResults(rankedResults);
    }

    return rankedResults;
  }

  private async generateRecommendations(
    results: SearchResult[],
    _query: EnhancedQuery
  ): Promise<DocumentRecommendation[]> {
    const recommendations: DocumentRecommendation[] = [];

    // Similar documents recommendation
    if (results.length > 0) {
      const topResult = results[0];
      const similarDocs = await this.findSimilarDocuments(
        topResult.documentId,
        { limit: 3, threshold: 0.6 }
      );

      if (similarDocs.length > 0) {
        recommendations.push({
          type: 'similar',
          title: 'Similar Documents',
          description: `Documents similar to "${topResult.title}"`,
          documents: similarDocs,
          confidence: 0.8,
          reasoning: ['Based on content and category similarity'],
        });
      }
    }

    // Category completion recommendations
    const categoryCompletions = this.findCategoryCompletions(results);
    recommendations.push(...categoryCompletions);

    return recommendations;
  }

  private generateFacets(results: SearchResult[]): SearchFacets {
    const facets: SearchFacets = {
      categories: {},
      tags: {},
      dateRanges: {},
      importanceLevels: {},
      fileTypes: {},
    };

    for (const result of results) {
      // Categories
      const category = result.category.primary;
      facets.categories[category] = (facets.categories[category] || 0) + 1;

      // Tags
      if (result.analysis?.tags) {
        for (const tag of result.analysis.tags) {
          facets.tags[tag] = (facets.tags[tag] || 0) + 1;
        }
      }

      // Importance levels
      if (result.analysis?.importanceLevel) {
        const importance = result.analysis.importanceLevel;
        facets.importanceLevels[importance] =
          (facets.importanceLevels[importance] || 0) + 1;
      }

      // Date ranges (simplified)
      const now = new Date();
      const monthsAgo = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate()
      );
      const yearAgo = new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        now.getDate()
      );

      if (result.lastModified > monthsAgo) {
        facets.dateRanges['recent'] = (facets.dateRanges['recent'] || 0) + 1;
      } else if (result.lastModified > yearAgo) {
        facets.dateRanges['this-year'] =
          (facets.dateRanges['this-year'] || 0) + 1;
      } else {
        facets.dateRanges['older'] = (facets.dateRanges['older'] || 0) + 1;
      }

      // File types
      if (result.filename) {
        const ext = result.filename.split('.').pop()?.toLowerCase();
        if (ext) {
          facets.fileTypes[ext] = (facets.fileTypes[ext] || 0) + 1;
        }
      }
    }

    return facets;
  }

  private async generateQuerySuggestions(
    _query: string
  ): Promise<QuerySuggestion[]> {
    const suggestions: QuerySuggestion[] = [];

    // Related terms based on indexed content
    const relatedTerms = this.findRelatedTerms(_query);
    for (const term of relatedTerms) {
      suggestions.push({
        query: term,
        description: `Search for documents containing "${term}"`,
        confidence: 0.7,
        exampleResults: this.estimateResults(term),
      });
    }

    // Category-specific suggestions
    const categoryQueries = this.generateCategoryQueries(_query);
    suggestions.push(...categoryQueries);

    return suggestions.slice(0, 8); // Limit suggestions
  }

  private calculateRelevance(
    indexEntry: SearchIndex,
    searchTerms: string[],
    query: EnhancedQuery
  ): number {
    let score = 0;

    // Title matching (highest weight)
    const titleMatches = this.countMatches(
      indexEntry.title.toLowerCase(),
      searchTerms
    );
    score += titleMatches * 3;

    // Content matching
    const contentMatches = this.countMatches(
      indexEntry.content.toLowerCase(),
      searchTerms
    );
    score += contentMatches * 1;

    // Tag matching
    const tagMatches = indexEntry.tags.reduce((matches, tag) => {
      return matches + this.countMatches(tag.toLowerCase(), searchTerms);
    }, 0);
    score += tagMatches * 2;

    // Category matching
    const categoryText = `${indexEntry.analysis.category.primary} ${indexEntry.analysis.category.secondary || ''}`;
    const categoryMatches = this.countMatches(
      categoryText.toLowerCase(),
      searchTerms
    );
    score += categoryMatches * 1.5;

    // Apply filters
    if (query.filters) {
      if (!this.passesFilters(indexEntry, query.filters)) {
        return 0;
      }
    }

    // Boost recent documents slightly
    const daysSinceModified =
      (Date.now() - new Date(indexEntry.metadata.lastModified || 0).getTime()) /
      (1000 * 60 * 60 * 24);
    if (daysSinceModified < 30) {
      score *= 1.1;
    }

    // Boost important documents
    const importanceBoost = {
      critical: 1.5,
      high: 1.3,
      medium: 1.1,
      low: 1.0,
    };
    score *= importanceBoost[indexEntry.analysis.importanceLevel] || 1.0;

    return score;
  }

  private countMatches(text: string, terms: string[]): number {
    let matches = 0;
    for (const term of terms) {
      const regex = new RegExp(
        `\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
        'gi'
      );
      const termMatches = text.match(regex);
      matches += termMatches ? termMatches.length : 0;
    }
    return matches;
  }

  private passesFilters(
    indexEntry: SearchIndex,
    filters: SearchFilters
  ): boolean {
    // Category filter
    if (
      filters.categories &&
      !filters.categories.includes(indexEntry.analysis.category.primary)
    ) {
      return false;
    }

    // Tag filter
    if (
      filters.tags &&
      !filters.tags.some(tag => indexEntry.tags.includes(tag))
    ) {
      return false;
    }

    // Importance level filter
    if (
      filters.importanceLevel &&
      !filters.importanceLevel.includes(indexEntry.analysis.importanceLevel)
    ) {
      return false;
    }

    // Sensitivity level filter
    if (
      filters.sensitivityLevel &&
      !filters.sensitivityLevel.includes(indexEntry.analysis.sensitivityLevel)
    ) {
      return false;
    }

    // Date range filter
    if (filters.dateRange) {
      const targetDate = this.getDateFromEntry(
        indexEntry,
        filters.dateRange.field
      );
      if (
        targetDate &&
        (targetDate < filters.dateRange.start ||
          targetDate > filters.dateRange.end)
      ) {
        return false;
      }
    }

    // Content-based filters
    if (
      filters.hasAmounts &&
      indexEntry.analysis.keyInformation.amounts.length === 0
    ) {
      return false;
    }

    if (
      filters.hasPeople &&
      indexEntry.analysis.keyInformation.people.length === 0
    ) {
      return false;
    }

    if (
      filters.hasExpiration &&
      !indexEntry.analysis.keyInformation.importantDates.some(
        d => d.type === 'expiration'
      )
    ) {
      return false;
    }

    return true;
  }

  private getDateFromEntry(
    indexEntry: SearchIndex,
    field: 'created' | 'effective' | 'expiration' | 'modified'
  ): Date | null {
    switch (field) {
      case 'created':
        return indexEntry.metadata.created
          ? new Date(indexEntry.metadata.created)
          : null;
      case 'modified':
        return indexEntry.metadata.lastModified
          ? new Date(indexEntry.metadata.lastModified)
          : null;
      case 'expiration': {
        const expirationDate =
          indexEntry.analysis.keyInformation.importantDates.find(
            d => d.type === 'expiration'
          );
        return expirationDate ? expirationDate.date : null;
      }
      case 'effective': {
        const effectiveDate =
          indexEntry.analysis.keyInformation.importantDates.find(
            d => d.type === 'effective'
          );
        return effectiveDate ? effectiveDate.date : null;
      }
      default:
        return null;
    }
  }

  private convertToSearchResult(
    indexEntry: SearchIndex,
    relevanceScore: number,
    matchedFields: string[]
  ): SearchResult {
    return {
      documentId: indexEntry.documentId,
      title: indexEntry.title,
      filename: indexEntry.metadata.filename,
      category: indexEntry.analysis.category,
      relevanceScore,
      matchedFields,
      highlightedExcerpts: this.generateHighlights(indexEntry, matchedFields),
      analysis: indexEntry.analysis,
      lastModified: new Date(
        indexEntry.metadata.lastModified || indexEntry.lastIndexed
      ),
      size: indexEntry.metadata.size,
    };
  }

  private generateHighlights(
    indexEntry: SearchIndex,
    matchedFields: string[]
  ): SearchHighlight[] {
    const highlights: SearchHighlight[] = [];

    // This is a simplified implementation
    // In production, would generate proper highlights with context

    if (matchedFields.includes('title')) {
      highlights.push({
        field: 'title',
        excerpt: indexEntry.title,
        matchedTerms: [],
        startPosition: 0,
        endPosition: indexEntry.title.length,
      });
    }

    if (matchedFields.includes('content')) {
      // Generate content excerpt
      const excerpt = indexEntry.content.substring(0, 200) + '...';
      highlights.push({
        field: 'content',
        excerpt,
        matchedTerms: [],
        startPosition: 0,
        endPosition: 200,
      });
    }

    return highlights;
  }

  private findMatchedFields(
    indexEntry: SearchIndex,
    searchTerms: string[]
  ): string[] {
    const matched: string[] = [];

    if (this.countMatches(indexEntry.title.toLowerCase(), searchTerms) > 0) {
      matched.push('title');
    }

    if (this.countMatches(indexEntry.content.toLowerCase(), searchTerms) > 0) {
      matched.push('content');
    }

    const tagsText = indexEntry.tags.join(' ').toLowerCase();
    if (this.countMatches(tagsText, searchTerms) > 0) {
      matched.push('tags');
    }

    return matched;
  }

  private extractSearchTerms(query: string): string[] {
    // Simple tokenization - in production would use proper NLP
    return query
      .toLowerCase()
      .split(/\s+/)
      .filter(term => term.length > 2)
      .map(term => term.replace(/[^\w]/g, ''));
  }

  // Additional helper methods would go here...
  private async expandQuery(query: string): Promise<string[]> {
    // Simplified query expansion
    const expansions: string[] = [];

    // Add plural/singular forms
    const words = query.split(/\s+/);
    for (const word of words) {
      if (word.endsWith('s')) {
        expansions.push(word.slice(0, -1));
      } else {
        expansions.push(word + 's');
      }
    }

    return expansions;
  }

  private findSynonyms(query: string): string[] {
    const synonymMap: Record<string, string[]> = {
      contract: ['agreement', 'deal', 'arrangement'],
      document: ['file', 'record', 'paper'],
      financial: ['monetary', 'economic', 'fiscal'],
      medical: ['health', 'healthcare', 'clinical'],
    };

    const synonyms: string[] = [];
    const words = query.toLowerCase().split(/\s+/);

    for (const word of words) {
      if (synonymMap[word]) {
        synonyms.push(...synonymMap[word]);
      }
    }

    return synonyms;
  }

  private correctSpelling(query: string): string[] {
    // Simplified spell correction
    const corrections: string[] = [];

    const commonCorrections: Record<string, string> = {
      docuemnt: 'document',
      recrod: 'record',
      finacial: 'financial',
      contarct: 'contract',
    };

    const words = query.split(/\s+/);
    for (const word of words) {
      if (commonCorrections[word.toLowerCase()]) {
        corrections.push(commonCorrections[word.toLowerCase()]);
      }
    }

    return corrections;
  }

  private async generateEmbedding(content: string): Promise<number[]> {
    // Simplified embedding generation
    // In production would use actual embedding models
    const hash = this.simpleHash(content);
    return Array.from({ length: 100 }, (_, i) => ((hash + i) % 1000) / 1000);
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private calculateDocumentSimilarity(
    doc1: SearchIndex,
    doc2: SearchIndex
  ): number {
    // Category similarity
    let similarity = 0;
    if (doc1.analysis.category.primary === doc2.analysis.category.primary) {
      similarity += 0.3;
      if (
        doc1.analysis.category.secondary === doc2.analysis.category.secondary
      ) {
        similarity += 0.2;
      }
    }

    // Tag similarity
    const commonTags = doc1.tags.filter(tag => doc2.tags.includes(tag));
    similarity +=
      (commonTags.length / Math.max(doc1.tags.length, doc2.tags.length)) * 0.3;

    // Content similarity (simplified)
    const commonWords = this.findCommonWords(doc1.content, doc2.content);
    similarity += Math.min(commonWords / 100, 0.2);

    return similarity;
  }

  private findCommonWords(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    let common = 0;
    for (const word of words1) {
      if (words2.has(word)) {
        common++;
      }
    }

    return common;
  }

  // Additional methods for completeness...
  private updateSearchAnalytics(
    query: string,
    responseTime: number,
    _resultCount: number
  ): void {
    this.searchAnalytics.totalQueries++;
    this.searchAnalytics.topQueries[query] =
      (this.searchAnalytics.topQueries[query] || 0) + 1;
    this.searchAnalytics.averageResponseTime =
      (this.searchAnalytics.averageResponseTime + responseTime) / 2;

    this.queryHistory.push(query);
    if (this.queryHistory.length > 1000) {
      this.queryHistory.shift();
    }
  }

  private getHistoricalSuggestions(partialQuery: string): QuerySuggestion[] {
    return this.queryHistory
      .filter(q => q.toLowerCase().includes(partialQuery.toLowerCase()))
      .slice(0, 5)
      .map(query => ({
        query,
        description: 'From your search history',
        confidence: 0.8,
        exampleResults: this.estimateResults(query),
      }));
  }

  private async getContentBasedSuggestions(
    _partialQuery: string
  ): Promise<QuerySuggestion[]> {
    // Extract common terms from indexed content
    const suggestions: QuerySuggestion[] = [];
    // Implementation would analyze indexed content for related terms
    return suggestions;
  }

  private getCategorySuggestions(partialQuery: string): QuerySuggestion[] {
    const categories = [
      'legal',
      'financial',
      'medical',
      'insurance',
      'property',
    ];
    return categories
      .filter(cat => cat.includes(partialQuery.toLowerCase()))
      .map(category => ({
        query: `category:${category}`,
        description: `Search within ${category} documents`,
        confidence: 0.9,
        category,
        exampleResults: this.estimateResults(`category:${category}`),
      }));
  }

  private deduplicateSuggestions(
    suggestions: QuerySuggestion[]
  ): QuerySuggestion[] {
    const seen = new Set();
    return suggestions.filter(suggestion => {
      if (seen.has(suggestion.query)) {
        return false;
      }
      seen.add(suggestion.query);
      return true;
    });
  }

  private estimateResults(query: string): number {
    // Simplified result estimation
    const terms = this.extractSearchTerms(query);
    let estimate = 0;

    for (const indexEntry of this.searchIndex.values()) {
      if (
        this.calculateRelevance(indexEntry, terms, { query } as EnhancedQuery) >
        0
      ) {
        estimate++;
      }
    }

    return estimate;
  }

  private findExpiringDocuments(daysAhead = 60): SearchResult[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + daysAhead);

    const expiring: SearchResult[] = [];

    for (const indexEntry of this.searchIndex.values()) {
      const expirationDates =
        indexEntry.analysis.keyInformation.importantDates.filter(
          d => d.type === 'expiration'
        );

      for (const dateInfo of expirationDates) {
        if (dateInfo.date <= cutoffDate) {
          expiring.push(
            this.convertToSearchResult(indexEntry, 1.0, ['expiration'])
          );
          break;
        }
      }
    }

    return expiring;
  }

  private async findIncompleteDocumentSets(): Promise<
    DocumentRecommendation[]
  > {
    // Simplified implementation
    // In production would analyze document relationships and completeness
    return [];
  }

  private getTrendingCategories(): DocumentCategory['primary'][] {
    // Simplified trending calculation
    const categoryCounts: Record<string, number> = {};

    for (const indexEntry of this.searchIndex.values()) {
      const category = indexEntry.analysis.category.primary;
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    }

    return Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category as DocumentCategory['primary']);
  }

  private getDocumentsByCategories(
    categories: DocumentCategory['primary'][]
  ): SearchResult[] {
    const results: SearchResult[] = [];

    for (const indexEntry of this.searchIndex.values()) {
      if (categories.includes(indexEntry.analysis.category.primary)) {
        results.push(this.convertToSearchResult(indexEntry, 1.0, ['category']));
      }
    }

    return results.slice(0, 10);
  }

  private personalizeResults(_results: SearchResult[]): SearchResult[] {
    // Simplified personalization based on user preferences
    // In production would use ML models and user behavior data
    return _results;
  }

  private findCategoryCompletions(
    _results: SearchResult[]
  ): DocumentRecommendation[] {
    // Analyze results for potential document set completions
    return [];
  }

  private findRelatedTerms(query: string): string[] {
    // Extract related terms from content
  // const __relatedTerms: string[] = []; // Unused
    const queryTerms = this.extractSearchTerms(query);

    // Simple co-occurrence analysis
    const cooccurrenceMap: Record<string, number> = {};

    for (const indexEntry of this.searchIndex.values()) {
      const contentWords = this.extractSearchTerms(indexEntry.content);
      let hasQueryTerm = false;

      for (const queryTerm of queryTerms) {
        if (contentWords.includes(queryTerm)) {
          hasQueryTerm = true;
          break;
        }
      }

      if (hasQueryTerm) {
        for (const word of contentWords) {
          if (!queryTerms.includes(word)) {
            cooccurrenceMap[word] = (cooccurrenceMap[word] || 0) + 1;
          }
        }
      }
    }

    return Object.entries(cooccurrenceMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([term]) => term);
  }

  private generateCategoryQueries(query: string): QuerySuggestion[] {
    const categories = [
      'legal',
      'financial',
      'medical',
      'insurance',
      'property',
    ];
    return categories.map(category => ({
      query: `${query} category:${category}`,
      description: `Search for "${query}" in ${category} documents`,
      confidence: 0.6,
      category,
      exampleResults: this.estimateResults(`${query} category:${category}`),
    }));
  }
}

// Supporting interfaces
interface EnhancedQuery extends SmartSearchQuery {
  corrections: string[];
  expandedTerms: string[];
  synonyms: string[];
}

interface SearchPreferences {
  favoriteCategories?: DocumentCategory['primary'][];
  resultPreferences?: {
    defaultSort?: SearchOptions['sortBy'];
    itemsPerPage?: number;
    showPreviews?: boolean;
  };
  searchHistory?: string[];
}

interface SearchAnalytics {
  averageResponseTime: number;
  clickThroughRate: number;
  topQueries: Record<string, number>;
  totalQueries: number;
}

// Create and export default search service instance
export const smartSearchService = new SmartSearchService();

// Export convenience functions
export const searchDocuments = (query: SmartSearchQuery) => {
  return smartSearchService.search(query);
};

export const getSearchSuggestions = (partialQuery: string, limit?: number) => {
  return smartSearchService.getSuggestions(partialQuery, limit);
};

export const indexDocument = (
  documentId: string,
  title: string,
  content: string,
  analysis: DocumentAnalysisResult,
  metadata?: Record<string, any>
) => {
  return smartSearchService.indexDocument(
    documentId,
    title,
    content,
    analysis,
    metadata
  );
};
