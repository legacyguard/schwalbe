
/**
 * Duplicate Detection Service
 * Advanced algorithms for detecting duplicate documents during import
 */

import type { ExtractedDocument } from '@/types/gmail';

export interface DuplicateMatch {
  confidence: 'high' | 'low' | 'medium';
  document: ExtractedDocument;
  existingDocument: ExistingDocument;
  matchReasons: DuplicateReason[];
  recommendation: 'keep_both' | 'rename' | 'replace' | 'skip';
  similarity: number;
}

export interface ExistingDocument {
  checksum?: string;
  filename: string;
  id: string;
  metadata?: {
    date?: string;
    fromEmail?: string;
    subject?: string;
  };
  mimeType: string;
  size: number;
  uploadDate: Date;
}

export interface DuplicateReason {
  description: string;
  similarity: number;
  type: 'content_hash' | 'filename' | 'metadata' | 'semantic' | 'size';
}

export interface DuplicateDetectionResult {
  duplicateCount: number;
  duplicates: DuplicateMatch[];
  totalProcessed: number;
  uniqueDocuments: ExtractedDocument[];
}

export interface DuplicateResolutionChoice {
  action: 'keep_both' | 'rename' | 'replace' | 'skip';
  documentId: string;
  newFilename?: string;
}

export class DuplicateDetectionService {
  private static instance: DuplicateDetectionService;
  private existingDocuments: ExistingDocument[] = [];

  private constructor() {
    // In production, this would load from the user's document vault
    this.loadExistingDocuments();
  }

  public static getInstance(): DuplicateDetectionService {
    if (!DuplicateDetectionService.instance) {
      DuplicateDetectionService.instance = new DuplicateDetectionService();
    }
    return DuplicateDetectionService.instance;
  }

  /**
   * Load existing documents from user's vault (mock implementation)
   */
  private loadExistingDocuments(): void {
    // Mock existing documents - in production, this would come from the database
    this.existingDocuments = [
      {
        id: 'doc_1',
        filename: 'will_template_2024.pdf',
        size: 245760,
        mimeType: 'application/pdf',
        uploadDate: new Date('2024-01-15'),
        checksum: 'abc123def456',
        metadata: {
          fromEmail: 'lawyer@example.com',
          subject: 'Your Will Template',
          date: '2024-01-15',
        },
      },
      {
        id: 'doc_2',
        filename: 'insurance_policy.pdf',
        size: 1048576,
        mimeType: 'application/pdf',
        uploadDate: new Date('2024-02-01'),
        checksum: 'def456ghi789',
        metadata: {
          fromEmail: 'insurance@company.com',
          subject: 'Policy Documents',
          date: '2024-02-01',
        },
      },
      {
        id: 'doc_3',
        filename: 'bank_statement_jan2024.pdf',
        size: 512000,
        mimeType: 'application/pdf',
        uploadDate: new Date('2024-02-05'),
        metadata: {
          fromEmail: 'statements@bank.com',
          subject: 'January 2024 Statement',
          date: '2024-01-31',
        },
      },
    ];
  }

  /**
   * Detect duplicates in a batch of imported documents
   */
  public async detectDuplicates(
    documents: ExtractedDocument[],
    onProgress?: (processed: number, total: number) => void
  ): Promise<DuplicateDetectionResult> {
    const duplicates: DuplicateMatch[] = [];
    const uniqueDocuments: ExtractedDocument[] = [];
    let processed = 0;

    for (const document of documents) {
      const matches = await this.findDuplicateMatches(document);

      if (matches.length > 0) {
        // Get the best match
        const bestMatch = matches.sort(
          (a, b) => b.similarity - a.similarity
        )[0];
        duplicates.push(bestMatch);
      } else {
        uniqueDocuments.push(document);
      }

      processed++;
      if (onProgress) {
        onProgress(processed, documents.length);
      }
    }

    return {
      duplicates,
      uniqueDocuments,
      totalProcessed: documents.length,
      duplicateCount: duplicates.length,
    };
  }

  /**
   * Find potential duplicate matches for a single document
   */
  private async findDuplicateMatches(
    document: ExtractedDocument
  ): Promise<DuplicateMatch[]> {
    const matches: DuplicateMatch[] = [];

    for (const existingDoc of this.existingDocuments) {
      const similarity = await this.calculateSimilarity(document, existingDoc);

      if (similarity.overall > 0.3) {
        // 30% similarity threshold
        const match: DuplicateMatch = {
          document,
          existingDocument: existingDoc,
          similarity: similarity.overall,
          matchReasons: similarity.reasons,
          confidence: this.getConfidenceLevel(similarity.overall),
          recommendation: this.getRecommendation(
            similarity.overall,
            similarity.reasons
          ),
        };

        matches.push(match);
      }
    }

    return matches;
  }

  /**
   * Calculate similarity between two documents
   */
  private async calculateSimilarity(
    document: ExtractedDocument,
    existingDoc: ExistingDocument
  ): Promise<{ overall: number; reasons: DuplicateReason[] }> {
    const reasons: DuplicateReason[] = [];
    let totalScore = 0;
    let totalWeight = 0;

    // 1. Exact filename match (highest weight)
    const filenameMatch = this.calculateFilenameMatch(
      document.filename,
      existingDoc.filename
    );
    if (filenameMatch.similarity > 0) {
      reasons.push(filenameMatch);
      totalScore += filenameMatch.similarity * 0.4;
      totalWeight += 0.4;
    }

    // 2. File size similarity
    const sizeMatch = this.calculateSizeMatch(document.size, existingDoc.size);
    if (sizeMatch.similarity > 0) {
      reasons.push(sizeMatch);
      totalScore += sizeMatch.similarity * 0.2;
      totalWeight += 0.2;
    }

    // 3. MIME type match
    if (document.mimeType === existingDoc.mimeType) {
      const mimeReason: DuplicateReason = {
        type: 'content_hash',
        similarity: 1.0,
        description: 'Same file type',
      };
      reasons.push(mimeReason);
      totalScore += 1.0 * 0.1;
      totalWeight += 0.1;
    }

    // 4. Metadata similarity (email sender, subject, date)
    if (existingDoc.metadata && document.metadata) {
      const metadataMatch = this.calculateMetadataMatch(
        document.metadata,
        existingDoc.metadata
      );
      if (metadataMatch.similarity > 0) {
        reasons.push(metadataMatch);
        totalScore += metadataMatch.similarity * 0.2;
        totalWeight += 0.2;
      }
    }

    // 5. Semantic filename similarity (fuzzy matching)
    const semanticMatch = this.calculateSemanticMatch(
      document.filename,
      existingDoc.filename
    );
    if (semanticMatch.similarity > 0) {
      reasons.push(semanticMatch);
      totalScore += semanticMatch.similarity * 0.1;
      totalWeight += 0.1;
    }

    const overall = totalWeight > 0 ? totalScore / totalWeight : 0;

    return { overall, reasons };
  }

  /**
   * Calculate filename similarity
   */
  private calculateFilenameMatch(
    filename1: string,
    filename2: string
  ): DuplicateReason {
    const name1 = filename1.toLowerCase();
    const name2 = filename2.toLowerCase();

    // Exact match
    if (name1 === name2) {
      return {
        type: 'filename',
        similarity: 1.0,
        description: 'Identical filename',
      };
    }

    // Remove extensions and compare
    const base1 = name1.replace(/\.[^/.]+$/, '');
    const base2 = name2.replace(/\.[^/.]+$/, '');

    if (base1 === base2) {
      return {
        type: 'filename',
        similarity: 0.9,
        description: 'Same filename, different extension',
      };
    }

    return {
      type: 'filename',
      similarity: 0,
      description: 'Different filename',
    };
  }

  /**
   * Calculate file size similarity
   */
  private calculateSizeMatch(size1: number, size2: number): DuplicateReason {
    // Exact size match
    if (size1 === size2) {
      return {
        type: 'size',
        similarity: 1.0,
        description: 'Identical file size',
      };
    }

    // Similar size (within 5%)
    const difference = Math.abs(size1 - size2);
    const maxSize = Math.max(size1, size2);
    const percentDifference = difference / maxSize;

    if (percentDifference <= 0.05) {
      return {
        type: 'size',
        similarity: 0.8,
        description: 'Very similar file size',
      };
    }

    // Somewhat similar size (within 20%)
    if (percentDifference <= 0.2) {
      return {
        type: 'size',
        similarity: 0.4,
        description: 'Similar file size',
      };
    }

    return {
      type: 'size',
      similarity: 0,
      description: 'Different file size',
    };
  }

  /**
   * Calculate metadata similarity
   */
  private calculateMetadataMatch(
    metadata1: { date: string; fromEmail: string; subject: string },
    metadata2: { date?: string; fromEmail?: string; subject?: string }
  ): DuplicateReason {
    let matches = 0;
    let total = 0;

    // Email sender match
    if (metadata2.fromEmail) {
      total++;
      if (
        metadata1.fromEmail.toLowerCase() === metadata2.fromEmail.toLowerCase()
      ) {
        matches++;
      }
    }

    // Subject similarity
    if (metadata2.subject) {
      total++;
      const subject1 = metadata1.subject.toLowerCase();
      const subject2 = metadata2.subject.toLowerCase();

      if (
        subject1 === subject2 ||
        subject1.includes(subject2) ||
        subject2.includes(subject1)
      ) {
        matches++;
      }
    }

    // Date proximity (same date or within a few days)
    if (metadata2.date) {
      total++;
      const date1 = new Date(metadata1.date);
      const date2 = new Date(metadata2.date);
      const daysDifference =
        Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24);

      if (daysDifference <= 7) {
        // Within a week
        matches++;
      }
    }

    const similarity = total > 0 ? matches / total : 0;

    return {
      type: 'metadata',
      similarity,
      description: `${matches}/${total} metadata fields match`,
    };
  }

  /**
   * Calculate semantic similarity using simple string comparison
   */
  private calculateSemanticMatch(
    filename1: string,
    filename2: string
  ): DuplicateReason {
    const name1 = filename1.toLowerCase().replace(/[_\-\s]/g, '');
    const name2 = filename2.toLowerCase().replace(/[_\-\s]/g, '');

    // Calculate Levenshtein distance
    const distance = this.levenshteinDistance(name1, name2);
    const maxLength = Math.max(name1.length, name2.length);
    const similarity = maxLength > 0 ? 1 - distance / maxLength : 0;

    if (similarity > 0.7) {
      return {
        type: 'semantic',
        similarity,
        description: 'Very similar filename structure',
      };
    } else if (similarity > 0.4) {
      return {
        type: 'semantic',
        similarity,
        description: 'Similar filename structure',
      };
    }

    return {
      type: 'semantic',
      similarity: 0,
      description: 'Different filename structure',
    };
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Get confidence level based on similarity score
   */
  private getConfidenceLevel(similarity: number): 'high' | 'low' | 'medium' {
    if (similarity >= 0.8) return 'high';
    if (similarity >= 0.5) return 'medium';
    return 'low';
  }

  /**
   * Get recommendation based on similarity and reasons
   */
  private getRecommendation(
    similarity: number,
    reasons: DuplicateReason[]
  ): 'keep_both' | 'rename' | 'replace' | 'skip' {
    // High confidence duplicates
    if (similarity >= 0.9) {
      // Check if it's an exact match
      const hasExactFilename = reasons.some(
        r => r.type === 'filename' && r.similarity === 1.0
      );
      const hasExactSize = reasons.some(
        r => r.type === 'size' && r.similarity === 1.0
      );

      if (hasExactFilename && hasExactSize) {
        return 'skip'; // Definitely a duplicate
      }
      return 'replace'; // Very likely the same document, possibly updated
    }

    // Medium confidence
    if (similarity >= 0.6) {
      return 'rename'; // Similar enough to warrant keeping both with different names
    }

    // Lower confidence
    if (similarity >= 0.4) {
      return 'keep_both'; // Likely different documents with some similarities
    }

    return 'keep_both'; // Default to keeping both
  }

  /**
   * Get duplicate resolution suggestions
   */
  public getDuplicateResolutionSuggestions(match: DuplicateMatch): string[] {
    const suggestions: string[] = [];

    switch (match.recommendation) {
      case 'skip':
        suggestions.push(
          'This appears to be an exact duplicate - skip importing'
        );
        suggestions.push('The existing document is already in your vault');
        break;

      case 'replace':
        suggestions.push(
          'This might be a newer version of the existing document'
        );
        suggestions.push('Consider replacing the old version');
        suggestions.push('Check the dates to confirm which is more recent');
        break;

      case 'keep_both':
        suggestions.push('These documents are similar but likely different');
        suggestions.push('Consider renaming one to avoid confusion');
        suggestions.push('Both documents might be useful to keep');
        break;

      case 'rename':
        suggestions.push('Similar documents detected');
        suggestions.push('Consider renaming one to avoid confusion');
        suggestions.push(
          'Both documents might have different content or versions'
        );
        break;
    }

    // Add specific suggestions based on match reasons
    const hasFilenameMatch = match.matchReasons.some(
      r => r.type === 'filename'
    );
    const hasMetadataMatch = match.matchReasons.some(
      r => r.type === 'metadata'
    );

    if (hasFilenameMatch && hasMetadataMatch) {
      suggestions.push('Strong indicators suggest this is the same document');
    }

    if (match?.confidence === 'high') {
      suggestions.push('High confidence duplicate detection');
    } else if (match?.confidence === 'low') {
      suggestions.push('Low confidence - documents may be unrelated');
    }

    return suggestions;
  }

  /**
   * Apply duplicate resolution choices
   */
  public async applyResolution(
    duplicates: DuplicateMatch[],
    choices: DuplicateResolutionChoice[]
  ): Promise<ExtractedDocument[]> {
    const resolvedDocuments: ExtractedDocument[] = [];

    for (const duplicate of duplicates) {
      const choice = choices.find(c => c.documentId === duplicate.document.id);

      if (!choice || choice.action === 'skip') {
        // Skip this document
        continue;
      }

      if (choice.action === 'keep_both' || choice.action === 'replace') {
        let document = duplicate.document;

        // Apply filename change if specified
        if (choice.newFilename) {
          document = {
            ...document,
            filename: choice.newFilename,
          };
        }

        resolvedDocuments.push(document);
      }

      if (choice.action === 'rename') {
        const document = {
          ...duplicate.document,
          filename:
            choice.newFilename ||
            this.generateUniqueFilename(duplicate.document.filename),
        };

        resolvedDocuments.push(document);
      }
    }

    return resolvedDocuments;
  }

  /**
   * Generate a unique filename by adding a suffix
   */
  private generateUniqueFilename(originalFilename: string): string {
    const extension = originalFilename.substring(
      originalFilename.lastIndexOf('.')
    );
    const baseName = originalFilename.substring(
      0,
      originalFilename.lastIndexOf('.')
    );
    const timestamp = new Date().toISOString().slice(0, 10);

    return `${baseName}_imported_${timestamp}${extension}`;
  }

  /**
   * Calculate space savings from skipping duplicates
   */
  public calculateSpaceSavings(duplicates: DuplicateMatch[]): {
    duplicateSize: number;
    percentSaved: number;
    spaceSaved: number;
    totalSize: number;
  } {
    const duplicateSize = duplicates.reduce(
      (total, match) => total + match.document.size,
      0
    );
    const totalSize = duplicates.reduce(
      (total, match) => total + match.document.size,
      0
    );

    return {
      totalSize,
      duplicateSize,
      spaceSaved: duplicateSize,
      percentSaved: totalSize > 0 ? (duplicateSize / totalSize) * 100 : 0,
    };
  }
}

export const duplicateDetectionService =
  DuplicateDetectionService.getInstance();
