
import {
  type BoundingBox,
  DOCUMENT_PATTERNS,
  type DocumentClassification,
  type DocumentMetadata,
  type DocumentType,
  type ExtractedEntity,
  type OCRProcessingConfig,
  type OCRResult,
  type ProcessedDocument,
  type TextBlock,
} from '@/types/ocr';
// Google Cloud Vision AI client configuration
interface GoogleCloudVisionResponse {
  responses: Array<{
    fullTextAnnotation: {
      pages: Array<{
        blocks: Array<{
          boundingBox: {
            vertices: Array<{ x: number; y: number }>;
          };
          confidence: number;
          paragraphs: Array<{
            boundingBox: {
              vertices: Array<{ x: number; y: number }>;
            };
            confidence: number;
            words: Array<{
              boundingBox: {
                vertices: Array<{ x: number; y: number }>;
              };
              confidence: number;
              symbols: Array<{
                boundingBox: {
                  vertices: Array<{ x: number; y: number }>;
                };
                confidence: number;
                text: string;
              }>;
            }>;
          }>;
        }>;
        confidence: number;
        height: number;
        width: number;
      }>;
      text: string;
    };
    textAnnotations: Array<{
      boundingPoly: {
        vertices: Array<{ x: number; y: number }>;
      };
      description: string;
      locale?: string;
    }>;
  }>;
}

export class OCRService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey =
      (import.meta as Record<string, any>)['env']['VITE_GOOGLE_CLOUD_API_KEY'] || '';
    this.apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${this.apiKey}`;
  }

  /**
   * Process document with Google Cloud Vision AI
   */
  async processDocument(
    fileData: string,
    fileName: string,
    config: OCRProcessingConfig
  ): Promise<ProcessedDocument> {
    const processingId = this.generateProcessingId();

    try {
      // Step 1: Perform OCR using Google Cloud Vision
      const ocrResult = await this.performOCR(fileData, config);

      // Step 2: Extract entities from OCR text
      let extractedEntities: ExtractedEntity[] = [];
      if (config.enableEntityExtraction) {
        extractedEntities = this.extractEntities(ocrResult.text);
      }

      // Step 3: Classify document type
      let classification: DocumentClassification = {
        category: 'other',
        type: 'other',
        confidence: 0,
        reasons: ['No classification performed'],
        suggestedTags: [],
      };

      if (config.enableDocumentClassification) {
        classification = this.classifyDocument(
          ocrResult.text,
          extractedEntities
        );
      }

      // Step 4: Extract structured metadata
      let extractedMetadata: DocumentMetadata = {};
      if (config.enableMetadataExtraction) {
        extractedMetadata = this.extractMetadata(
          ocrResult.text,
          classification.type,
          extractedEntities
        );
      }

      // Step 5: Create processed document
      const processedDocument: ProcessedDocument = {
        id: processingId,
        originalFileName: fileName,
        ocrResult: {
          ...ocrResult,
          metadata: {
            ...ocrResult.metadata,
            extractedEntities,
          },
        },
        classification,
        extractedMetadata,
        processingStatus: 'completed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return processedDocument;
    } catch (error) {
      console.error('OCR processing failed:', error);

      return {
        id: processingId,
        originalFileName: fileName,
        ocrResult: {
          text: '',
          confidence: 0,
          boundingBoxes: [],
          detectedLanguage: 'en',
          metadata: {
            processingTime: 0,
            imageSize: { width: 0, height: 0 },
            textBlocks: [],
            extractedEntities: [],
          },
        },
        classification: {
          category: 'other',
          type: 'other',
          confidence: 0,
          reasons: ['Processing failed'],
          suggestedTags: [],
        },
        extractedMetadata: {},
        processingStatus: 'failed',
        processingError:
          error instanceof Error ? error.message : 'Unknown error',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Perform OCR using Google Cloud Vision API
   */
  private async performOCR(
    fileData: string,
    config: OCRProcessingConfig
  ): Promise<OCRResult> {
    const startTime = Date.now();

    const request = {
      requests: [
        {
          image: {
            content: fileData, // base64 encoded image
          },
          features: [
            {
              type: 'TEXT_DETECTION',
              maxResults: 1,
            },
            {
              type: 'DOCUMENT_TEXT_DETECTION',
              maxResults: 1,
            },
          ],
          imageContext: {
            languageHints: config.languageHints || ['en'],
          },
        },
      ],
    };

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Google Cloud Vision API error: ${response.statusText}`);
    }

    const data: GoogleCloudVisionResponse = await response.json();
    const processingTime = Date.now() - startTime;

    if (!data.responses || data.responses.length === 0) {
      throw new Error('No response from Google Cloud Vision API');
    }

    const visionResponse = data.responses[0];

    if (!visionResponse) {
      throw new Error('No valid response from Google Cloud Vision API');
    }

    // Handle API errors
    if ('error' in visionResponse) {
      const errorResponse = visionResponse as { error: { message: string } };
      throw new Error(`Vision API error: ${errorResponse.error.message}`);
    }

    // Extract text and metadata
    const fullText = visionResponse.fullTextAnnotation?.text || '';
    const detectedLanguage =
      visionResponse.textAnnotations?.[0]?.locale || 'en';

    // Extract bounding boxes and text blocks
    const boundingBoxes: BoundingBox[] = [];
    const textBlocks: TextBlock[] = [];

    if (visionResponse.fullTextAnnotation?.pages) {
      const page = visionResponse.fullTextAnnotation.pages[0];
      if (!page) {
        throw new Error('No page data in Vision API response');
      }

      page.blocks?.forEach(block => {
        const bbox = this.convertVertexToBoundingBox(
          block.boundingBox.vertices
        );
        boundingBoxes.push(bbox);

        block.paragraphs?.forEach(paragraph => {
          const paragraphBbox = this.convertVertexToBoundingBox(
            paragraph.boundingBox.vertices
          );
          const paragraphText = this.extractTextFromParagraph(paragraph);

          textBlocks.push({
            text: paragraphText,
            confidence: paragraph?.confidence,
            boundingBox: paragraphBbox,
            type: 'paragraph',
          });
        });
      });
    }

    return {
      text: fullText,
      confidence: this.calculateAverageConfidence(textBlocks),
      boundingBoxes,
      detectedLanguage,
      metadata: {
        processingTime,
        imageSize: {
          width: visionResponse.fullTextAnnotation?.pages?.[0]?.width || 0,
          height: visionResponse.fullTextAnnotation?.pages?.[0]?.height || 0,
        },
        textBlocks,
        extractedEntities: [], // Will be populated later
      },
    };
  }

  /**
   * Extract entities from text using pattern matching
   */
  private extractEntities(text: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];

    // Email pattern
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = text.match(emailPattern) || [];
    emails.forEach(email => {
      entities.push({
        type: 'email',
        value: email,
        confidence: 0.9,
      });
    });

    // Phone pattern
    const phonePattern =
      /(?:\+1\s?)?(?:\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}/g;
    const phones = text.match(phonePattern) || [];
    phones.forEach(phone => {
      entities.push({
        type: 'phone',
        value: phone,
        confidence: 0.85,
      });
    });

    // Date patterns
    const datePatterns = [
      /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, // MM/DD/YYYY
      /\b\d{1,2}-\d{1,2}-\d{2,4}\b/g, // MM-DD-YYYY
      /\b[A-Za-z]+ \d{1,2},? \d{4}\b/g, // Month DD, YYYY
    ];

    datePatterns.forEach(pattern => {
      const dates = text.match(pattern) || [];
      dates.forEach(date => {
        entities.push({
          type: 'date',
          value: date,
          confidence: 0.8,
        });
      });
    });

    // SSN pattern
    const ssnPattern = /\b\d{3}-\d{2}-\d{4}\b/g;
    const ssns = text.match(ssnPattern) || [];
    ssns.forEach(ssn => {
      entities.push({
        type: 'ssn',
        value: ssn,
        confidence: 0.9,
      });
    });

    // Amount pattern
    const amountPattern = /\$[\d,]+\.?\d*/g;
    const amounts = text.match(amountPattern) || [];
    amounts.forEach(amount => {
      entities.push({
        type: 'amount',
        value: amount,
        confidence: 0.7,
      });
    });

    // Account number pattern (generic)
    const accountPattern = /(?:account|acct)[\s#:]*([0-9-]{8,20})/gi;
    const accountMatches = [...text.matchAll(accountPattern)];
    accountMatches.forEach(match => {
      if (match[1]) {
        entities.push({
          type: 'account_number',
          value: match[1],
          confidence: 0.75,
        });
      }
    });

    return entities;
  }

  /**
   * Classify document based on content analysis
   */
  private classifyDocument(
    text: string,
    entities: ExtractedEntity[]
  ): DocumentClassification {
    // const textLower = text.toLowerCase();
    const scores: Record<DocumentType, number> = {} as Record<
      DocumentType,
      number
    >;

    // Score each document type based on keywords and patterns
    Object.entries(DOCUMENT_PATTERNS).forEach(([type, pattern]) => {
      let score = 0;

      // Keyword matching
      pattern.keywords.forEach(keyword => {
        const keywordRegex = new RegExp(
          `\\b${keyword.replace(/\s+/g, '\\s+')}\\b`,
          'i'
        );
        if (keywordRegex.test(text)) {
          score += 10;
        }
      });

      // Pattern matching
      pattern.patterns.forEach(regex => {
        if (regex.test(text)) {
          score += 15;
        }
      });

      // Required entities bonus
      if (pattern.requiredEntities) {
        const foundEntities = pattern.requiredEntities.filter(entityType =>
          entities.some(entity => entity.type === entityType)
        );
        score += foundEntities.length * 5;
      }

      scores[type as DocumentType] = score;
    });

    // Find best match
    const sortedScores = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .filter(([, score]) => score > 0);

    if (sortedScores.length === 0) {
      return {
        category: 'other',
        type: 'other',
        confidence: 0,
        reasons: ['No matching patterns found'],
        suggestedTags: this.generateSuggestedTags(text),
      };
    }

    const [bestType, bestScore] = sortedScores[0] || ['other', 0];
    const confidence = Math.min(bestScore / 50, 1); // Normalize to 0-1

    const pattern = DOCUMENT_PATTERNS[bestType as DocumentType];
    const reasons = [
      `Matched ${pattern.keywords.length} keywords`,
      `Matched ${pattern.patterns.length} patterns`,
      `Found ${entities.length} relevant entities`,
    ].filter(reason => !reason.includes('0'));

    return {
      category: pattern.category,
      type: bestType as DocumentType,
      confidence,
      reasons,
      suggestedTags: this.generateSuggestedTags(text),
    };
  }

  /**
   * Extract structured metadata based on document type
   */
  private extractMetadata(
    text: string,
    docType: DocumentType,
    entities: ExtractedEntity[]
  ): DocumentMetadata {
    const metadata: DocumentMetadata = {};

    // Extract common metadata
    const dateEntities = entities.filter(e => e.type === 'date');
    if (dateEntities.length > 0 && dateEntities[0]) {
      metadata.date = dateEntities[0].value;
    }

    const amountEntities = entities.filter(e => e.type === 'amount');
    if (amountEntities.length > 0 && amountEntities[0]) {
      metadata.amount = amountEntities[0].value;
    }

    // Document-specific metadata extraction
    switch (docType) {
      case 'bank_statement': {
        const accountEntities = entities.filter(
          e => e.type === 'account_number'
        );
        if (accountEntities.length > 0 && accountEntities[0]) {
          metadata.accountNumber = accountEntities[0].value;
        }

        // Try to extract institution name
        const bankPattern =
          /(?:bank|credit union|financial)\s+(?:of\s+)?([A-Za-z\s]+)/i;
        const bankMatch = text.match(bankPattern);
        if (bankMatch && bankMatch[1]) {
          metadata.institutionName = bankMatch[1].trim();
        }
        break;
      }

      case 'life_insurance':
      case 'auto_insurance':
      case 'home_insurance': {
        // Extract policy number
        const policyPattern = /policy\s*(?:number|#)?:?\s*([A-Z0-9-]+)/i;
        const policyMatch = text.match(policyPattern);
        if (policyMatch && policyMatch[1]) {
          metadata.policyNumber = policyMatch[1];
        }
        break;
      }

      case 'medical_record': {
        // Extract patient name (simple heuristic)
        const patientPattern = /patient\s*(?:name)?:?\s*([A-Za-z\s,]+)/i;
        const patientMatch = text.match(patientPattern);
        if (patientMatch && patientMatch[1]) {
          metadata.patientName = patientMatch[1].trim();
        }
        break;
      }
    }

    return metadata;
  }

  /**
   * Generate suggested tags based on content
   */
  private generateSuggestedTags(text: string): string[] {
    const tags: string[] = [];
    // const textLower = text.toLowerCase();

    // Common tag patterns
    const tagPatterns = {
      important: /important|urgent|critical|priority/i,
      expires: /expir|due|deadline|valid until/i,
      legal: /legal|attorney|court|law/i,
      financial: /financial|money|payment|account|loan/i,
      medical: /medical|health|doctor|hospital/i,
      insurance: /insurance|policy|coverage|premium/i,
      tax: /tax|irs|revenue|deduction/i,
      personal: /personal|private|confidential/i,
    };

    Object.entries(tagPatterns).forEach(([tag, pattern]) => {
      if (pattern.test(text)) {
        tags.push(tag);
      }
    });

    return tags.slice(0, 5); // Limit to 5 tags
  }

  /**
   * Helper methods
   */
  private generateProcessingId(): string {
    return `ocr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private convertVertexToBoundingBox(
    vertices: Array<{ x: number; y: number }>
  ): BoundingBox {
    const xs = vertices.map(v => v.x);
    const ys = vertices.map(v => v.y);

    return {
      x: Math.min(...xs),
      y: Math.min(...ys),
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys),
    };
  }

  private extractTextFromParagraph(paragraph: {
    words?: Array<{
      symbols?: Array<{ text: string }>;
    }>;
  }): string {
    let text = '';
    paragraph.words?.forEach(word => {
      word.symbols?.forEach(symbol => {
        text += symbol.text;
      });
      text += ' ';
    });
    return text.trim();
  }

  private calculateAverageConfidence(textBlocks: TextBlock[]): number {
    if (textBlocks.length === 0) return 0;
    const totalConfidence = textBlocks.reduce(
      (sum, block) => sum + block?.confidence,
      0
    );
    return totalConfidence / textBlocks.length;
  }
}

// Singleton instance
export const ocrService = new OCRService();
