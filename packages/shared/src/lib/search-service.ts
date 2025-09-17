/**
 * Privacy-preserving search service using hashed tokens
 * No plaintext search terms are stored or transmitted
 */

import { createHmac } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface SearchResult {
  documentId: string;
  documentName: string;
  documentType: string;
  relevanceScore: number;
  snippet?: string;
  createdAt: Date;
  fileSize?: number;
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  documentTypes?: string[];
  dateFrom?: Date;
  dateTo?: Date;
}

class SearchService {
  private static instance: SearchService;
  private searchSalt: string;

  private constructor() {
    // Use environment variable or fallback to a default (should be from env in production)
    this.searchSalt = process.env.SEARCH_INDEX_SALT || 'default-salt-change-in-production';
    
    if (this.searchSalt === 'default-salt-change-in-production') {
      logger.warn('Using default search salt - configure SEARCH_INDEX_SALT in production');
    }
  }

  public static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  /**
   * Hash a search token using HMAC-SHA256
   */
  private hashToken(token: string): string {
    return createHmac('sha256', this.searchSalt)
      .update(token.toLowerCase().trim())
      .digest('hex');
  }

  /**
   * Tokenize search query into individual terms
   */
  private tokenizeQuery(query: string): string[] {
    // Basic tokenization - split on whitespace and punctuation
    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2); // Ignore very short tokens
  }

  /**
   * Search documents using hashed tokens
   */
  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    try {
      // Tokenize and hash the search query
      const tokens = this.tokenizeQuery(query);
      const hashedTokens = tokens.map(token => this.hashToken(token));

      if (hashedTokens.length === 0) {
        return [];
      }

      // Search for documents containing these hashed tokens
      let searchQuery = supabase
        .from('hashed_tokens')
        .select(`
          doc_id,
          hash,
          tf,
          documents!inner (
            id,
            name,
            type,
            created_at,
            file_size,
            user_id
          )
        `)
        .in('hash', hashedTokens);

      // Apply filters
      if (options.documentTypes && options.documentTypes.length > 0) {
        searchQuery = searchQuery.in('documents.type', options.documentTypes);
      }

      if (options.dateFrom) {
        searchQuery = searchQuery.gte('documents.created_at', options.dateFrom.toISOString());
      }

      if (options.dateTo) {
        searchQuery = searchQuery.lte('documents.created_at', options.dateTo.toISOString());
      }

      // Execute search
      const { data, error } = await searchQuery;

      if (error) {
        logger.error('Search query failed', {
          action: 'search_error',
          metadata: { error: error.message },
        });
        throw error;
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Aggregate results by document and calculate relevance scores
      const documentScores = new Map<string, any>();

      data.forEach((row: any) => {
        const docId = row.doc_id;
        
        if (!documentScores.has(docId)) {
          documentScores.set(docId, {
            documentId: row.documents.id,
            documentName: row.documents.name,
            documentType: row.documents.type,
            createdAt: new Date(row.documents.created_at),
            fileSize: row.documents.file_size,
            matchCount: 0,
            totalTf: 0,
          });
        }

        const doc = documentScores.get(docId);
        doc.matchCount++;
        doc.totalTf += row.tf;
      });

      // Convert to array and calculate relevance scores
      const results: SearchResult[] = Array.from(documentScores.values())
        .map(doc => ({
          documentId: doc.documentId,
          documentName: doc.documentName,
          documentType: doc.documentType,
          createdAt: doc.createdAt,
          fileSize: doc.fileSize,
          relevanceScore: (doc.matchCount / hashedTokens.length) * Math.log(1 + doc.totalTf),
        }))
        .sort((a, b) => b.relevanceScore - a.relevanceScore);

      // Apply limit and offset
      const limit = options.limit || 20;
      const offset = options.offset || 0;
      
      logger.info('Search completed', {
        action: 'search_success',
        metadata: {
          queryTokens: tokens.length,
          resultsFound: results.length,
          limit,
          offset,
        },
      });

      return results.slice(offset, offset + limit);
    } catch (error: any) {
      logger.error('Search service error', {
        action: 'search_service_error',
        metadata: { error: error.message },
      });
      throw error;
    }
  }

  /**
   * Index a document for searching
   */
  async indexDocument(documentId: string, content: string): Promise<void> {
    try {
      // Tokenize the content
      const tokens = this.tokenizeQuery(content);
      
      // Count token frequencies
      const tokenFrequencies = new Map<string, { count: number; positions: number[] }>();
      
      tokens.forEach((token, position) => {
        if (!tokenFrequencies.has(token)) {
          tokenFrequencies.set(token, { count: 0, positions: [] });
        }
        const freq = tokenFrequencies.get(token)!;
        freq.count++;
        freq.positions.push(position);
      });

      // Prepare batch insert data
      const indexData = Array.from(tokenFrequencies.entries()).map(([token, freq]) => ({
        doc_id: documentId,
        hash: this.hashToken(token),
        tf: freq.count,
        positions: freq.positions.slice(0, 10), // Store first 10 positions only
      }));

      // Delete existing index for this document
      const { error: deleteError } = await supabase
        .from('hashed_tokens')
        .delete()
        .eq('doc_id', documentId);

      if (deleteError) {
        logger.error('Failed to delete old index', {
          action: 'index_delete_error',
          metadata: { documentId, error: deleteError.message },
        });
      }

      // Insert new index data
      if (indexData.length > 0) {
        const { error: insertError } = await supabase
          .from('hashed_tokens')
          .insert(indexData);

        if (insertError) {
          logger.error('Failed to index document', {
            action: 'index_insert_error',
            metadata: { documentId, error: insertError.message },
          });
          throw insertError;
        }
      }

      logger.info('Document indexed successfully', {
        action: 'index_success',
        metadata: {
          documentId,
          tokensIndexed: indexData.length,
        },
      });
    } catch (error: any) {
      logger.error('Document indexing error', {
        action: 'index_error',
        metadata: { documentId, error: error.message },
      });
      throw error;
    }
  }

  /**
   * Remove document from search index
   */
  async removeFromIndex(documentId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('hashed_tokens')
        .delete()
        .eq('doc_id', documentId);

      if (error) {
        logger.error('Failed to remove document from index', {
          action: 'index_removal_error',
          metadata: { documentId, error: error.message },
        });
        throw error;
      }

      logger.info('Document removed from index', {
        action: 'index_removal_success',
        metadata: { documentId },
      });
    } catch (error: any) {
      logger.error('Index removal error', {
        action: 'index_removal_error',
        metadata: { documentId, error: error.message },
      });
      throw error;
    }
  }

  /**
   * Get search suggestions (returns generic suggestions, not based on actual data)
   */
  async getSuggestions(prefix: string): Promise<string[]> {
    // For privacy, we don't expose actual indexed terms
    // Return generic category-based suggestions
    const suggestions = [
      'contracts',
      'invoices',
      'receipts',
      'insurance',
      'medical',
      'property',
      'financial',
      'personal',
      'legal',
      'tax documents',
    ];

    return suggestions
      .filter(s => s.toLowerCase().startsWith(prefix.toLowerCase()))
      .slice(0, 5);
  }
}

// Export singleton instance
export const searchService = SearchService.getInstance();

// Export convenience functions
export const search = (query: string, options?: SearchOptions) => searchService.search(query, options);
export const indexDocument = (documentId: string, content: string) => searchService.indexDocument(documentId, content);
export const removeFromIndex = (documentId: string) => searchService.removeFromIndex(documentId);
export const getSuggestions = (prefix: string) => searchService.getSuggestions(prefix);

export default searchService;