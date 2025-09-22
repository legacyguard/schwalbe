/**
 * Duplicate Detection Service - Adapted for Main App
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
    this.loadExistingDocuments();
  }

  public static getInstance(): DuplicateDetectionService {
    if (!DuplicateDetectionService.instance) {
      DuplicateDetectionService.instance = new DuplicateDetectionService();
    }
    return DuplicateDetectionService.instance;
  }

  /**
   * Load existing documents from database
   */
  private async loadExistingDocuments(): Promise<void> {
    try {
      // In production, this would fetch from Supabase documents table
      const response = await fetch('/api/documents/list');
      if (response.ok) {
        this.existingDocuments = await response.json();
      }
    } catch (error) {
      console.warn('Failed to load existing documents:', error);
      // Fallback to empty list
      this.existingDocuments = [];
    }
  }

  /**
   * Detect duplicates in a batch of imported documents
   */
  public async detectDuplicates(
    documents: ExtractedDocument[],
    onProgress?: (processed: number, total: number) => void
  ): Promise<DuplicateDetectionResult> {
    // Ensure existing documents are loaded
    await this.loadExistingDocuments();

    const duplicates: DuplicateMatch[] = [];
    const uniqueDocuments: ExtractedDocument[] = [];
    let processed = 0;

    for (const document of documents) {
      const matches = await this.findDuplicateMatches(document);

      if (matches.length > 0) {
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

    // Filename match
    const filenameMatch = this.calculateFilenameMatch(
      document.filename,
      existingDoc.filename
    );
    if (filenameMatch.similarity > 0) {
      reasons.push(filenameMatch);
      totalScore += filenameMatch.similarity * 0.4;
      totalWeight += 0.4;
    }

    // File size similarity
    const sizeMatch = this.calculateSizeMatch(document.size, existingDoc.size);
    if (sizeMatch.similarity > 0) {
      reasons.push(sizeMatch);
      totalScore += sizeMatch.similarity * 0.2;
      totalWeight += 0.2;
    }

    // MIME type match
    if (document.mimeType === existingDoc.mimeType) {
      const mimeReason: DuplicateReason = {
        type: 'content_hash',
        similarity: 1.0,
        description: 'Rovnaký typ súboru',
      };
      reasons.push(mimeReason);
      totalScore += 1.0 * 0.1;
      totalWeight += 0.1;
    }

    // Metadata similarity
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

    // Semantic filename similarity
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

    if (name1 === name2) {
      return {
        type: 'filename',
        similarity: 1.0,
        description: 'Identické názvy súborov',
      };
    }

    const base1 = name1.replace(/\.[^/.]+$/, '');
    const base2 = name2.replace(/\.[^/.]+$/, '');

    if (base1 === base2) {
      return {
        type: 'filename',
        similarity: 0.9,
        description: 'Rovnaký názov, iná prípona',
      };
    }

    return {
      type: 'filename',
      similarity: 0,
      description: 'Rôzne názvy súborov',
    };
  }

  /**
   * Calculate file size similarity
   */
  private calculateSizeMatch(size1: number, size2: number): DuplicateReason {
    if (size1 === size2) {
      return {
        type: 'size',
        similarity: 1.0,
        description: 'Identická veľkosť súboru',
      };
    }

    const difference = Math.abs(size1 - size2);
    const maxSize = Math.max(size1, size2);
    const percentDifference = difference / maxSize;

    if (percentDifference <= 0.05) {
      return {
        type: 'size',
        similarity: 0.8,
        description: 'Veľmi podobná veľkosť súboru',
      };
    }

    if (percentDifference <= 0.2) {
      return {
        type: 'size',
        similarity: 0.4,
        description: 'Podobná veľkosť súboru',
      };
    }

    return {
      type: 'size',
      similarity: 0,
      description: 'Rôzna veľkosť súboru',
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

    if (metadata2.fromEmail) {
      total++;
      if (
        metadata1.fromEmail.toLowerCase() === metadata2.fromEmail.toLowerCase()
      ) {
        matches++;
      }
    }

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

    if (metadata2.date) {
      total++;
      const date1 = new Date(metadata1.date);
      const date2 = new Date(metadata2.date);
      const daysDifference =
        Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24);

      if (daysDifference <= 7) {
        matches++;
      }
    }

    const similarity = total > 0 ? matches / total : 0;

    return {
      type: 'metadata',
      similarity,
      description: `${matches}/${total} metadáta sa zhodujú`,
    };
  }

  /**
   * Calculate semantic similarity using string comparison
   */
  private calculateSemanticMatch(
    filename1: string,
    filename2: string
  ): DuplicateReason {
    const name1 = filename1.toLowerCase().replace(/[_\-\s]/g, '');
    const name2 = filename2.toLowerCase().replace(/[_\-\s]/g, '');

    const distance = this.levenshteinDistance(name1, name2);
    const maxLength = Math.max(name1.length, name2.length);
    const similarity = maxLength > 0 ? 1 - distance / maxLength : 0;

    if (similarity > 0.7) {
      return {
        type: 'semantic',
        similarity,
        description: 'Veľmi podobná štruktúra názvu',
      };
    } else if (similarity > 0.4) {
      return {
        type: 'semantic',
        similarity,
        description: 'Podobná štruktúra názvu',
      };
    }

    return {
      type: 'semantic',
      similarity: 0,
      description: 'Rôzna štruktúra názvu',
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
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
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
    if (similarity >= 0.9) {
      const hasExactFilename = reasons.some(
        r => r.type === 'filename' && r.similarity === 1.0
      );
      const hasExactSize = reasons.some(
        r => r.type === 'size' && r.similarity === 1.0
      );

      if (hasExactFilename && hasExactSize) {
        return 'skip';
      }
      return 'replace';
    }

    if (similarity >= 0.6) {
      return 'rename';
    }

    if (similarity >= 0.4) {
      return 'keep_both';
    }

    return 'keep_both';
  }

  /**
   * Get duplicate resolution suggestions
   */
  public getDuplicateResolutionSuggestions(match: DuplicateMatch): string[] {
    const suggestions: string[] = [];

    switch (match.recommendation) {
      case 'skip':
        suggestions.push('Toto vyzerá ako presný duplikát - preskočiť import');
        suggestions.push('Existujúci dokument je už vo vašom úložisku');
        break;

      case 'replace':
        suggestions.push('Toto môže byť novšia verzia existujúceho dokumentu');
        suggestions.push('Zvážte nahradenie starej verzie');
        suggestions.push('Skontrolujte dátumy na potvrdenie ktorý je novší');
        break;

      case 'keep_both':
        suggestions.push('Tieto dokumenty sú podobné ale pravdepodobne rôzne');
        suggestions.push('Zvážte premenovanie jedného aby sa predišlo zmätku');
        suggestions.push('Oba dokumenty môžu byť užitočné na uchovanie');
        break;

      case 'rename':
        suggestions.push('Zistené podobné dokumenty');
        suggestions.push('Zvážte premenovanie jedného aby sa predišlo zmätku');
        suggestions.push('Oba dokumenty môžu mať rôzny obsah alebo verzie');
        break;
    }

    const hasFilenameMatch = match.matchReasons.some(
      r => r.type === 'filename'
    );
    const hasMetadataMatch = match.matchReasons.some(
      r => r.type === 'metadata'
    );

    if (hasFilenameMatch && hasMetadataMatch) {
      suggestions.push('Silné indikátory naznačujú že je to ten istý dokument');
    }

    if (match?.confidence === 'high') {
      suggestions.push('Vysoká spoľahlivosť detekcie duplikátov');
    } else if (match?.confidence === 'low') {
      suggestions.push('Nízka spoľahlivosť - dokumenty môžu byť nesúvisiace');
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
        continue;
      }

      if (choice.action === 'keep_both' || choice.action === 'replace') {
        let document = duplicate.document;

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

    return `${baseName}_importovany_${timestamp}${extension}`;
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