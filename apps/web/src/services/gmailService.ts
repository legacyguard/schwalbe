/**
 * Gmail API Service - Adapted for Main App
 * Secure client-side service that communicates with server-side Gmail API
 */

import type {
  DocumentCategorizationResult,
  DocumentType,
  EmailImportConfig,
  ExtractedDocument,
  GmailAttachment,
  GmailMessage,
  GmailPayload,
} from '@/types/gmail';

export class GmailService {
  private static instance: GmailService;
  private apiEndpoint: string;
  private isAuthorized: boolean = false;

  private constructor() {
    this.apiEndpoint = '/api/gmail';
  }

  public static getInstance(): GmailService {
    if (!GmailService.instance) {
      GmailService.instance = new GmailService();
    }
    return GmailService.instance;
  }

  /**
   * Get authorization token (using app's auth system)
   */
  private async getAuthToken(): Promise<string> {
    // Integration with app's auth system
    const response = await fetch('/api/auth/token');
    if (!response.ok) {
      throw new Error('Authentication required');
    }
    const { token } = await response.json();
    return token;
  }

  /**
   * Initialize OAuth2 authentication flow
   */
  public async authenticate(): Promise<boolean> {
    try {
      const token = await this.getAuthToken();

      const authUrlResponse = await fetch(
        `${this.apiEndpoint}?action=auth-url`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!authUrlResponse.ok) {
        throw new Error('Failed to get authorization URL');
      }

      const { authUrl } = await authUrlResponse.json();

      const authWindow = window.open(
        authUrl,
        'gmail-auth',
        'width=500,height=600'
      );

      return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
          try {
            if (authWindow?.closed) {
              clearInterval(checkInterval);
              this.checkAuthStatus()
                .then(authorized => {
                  this.isAuthorized = authorized;
                  resolve(authorized);
                })
                .catch(reject);
            }
          } catch (error) {
            clearInterval(checkInterval);
            reject(error);
          }
        }, 1000);
      });
    } catch (error) {
      console.error('Gmail authentication failed:', error);
      throw error;
    }
  }

  /**
   * Check if user has authorized Gmail access
   */
  private async checkAuthStatus(): Promise<boolean> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${this.apiEndpoint}?action=status`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const { authorized } = await response.json();
        return authorized || false;
      }
      return false;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Search for emails with potential documents
   */
  public async searchEmails(
    config: EmailImportConfig
  ): Promise<GmailMessage[]> {
    if (!this.isAuthorized) {
      throw new Error('Not authenticated. Please call authenticate() first.');
    }

    try {
      const token = await this.getAuthToken();
      const query = this.buildSearchQuery(config);

      const response = await fetch(`${this.apiEndpoint}?action=search`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          maxResults: Math.min(config.maxDocuments, 100),
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.isAuthorized = false;
          throw new Error(
            'Gmail authorization expired. Please re-authenticate.'
          );
        }
        throw new Error('Failed to search emails');
      }

      const { messages } = await response.json();
      return messages || [];
    } catch (error) {
      console.error('Failed to search emails:', error);
      throw error;
    }
  }

  /**
   * Build Gmail search query from config
   */
  private buildSearchQuery(config: EmailImportConfig): string {
    const queries: string[] = [];

    const fromDate = config.dateRange.from
      .toISOString()
      .split('T')[0]
      .replace(/-/g, '/');
    const toDate = config.dateRange.to
      .toISOString()
      .split('T')[0]
      .replace(/-/g, '/');
    queries.push(`after:${fromDate}`);
    queries.push(`before:${toDate}`);

    queries.push('has:attachment');

    const fileExtensions = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'tiff'];
    const extensionQuery = fileExtensions
      .map(ext => `filename:${ext}`)
      .join(' OR ');
    queries.push(`(${extensionQuery})`);

    return queries.join(' ');
  }

  /**
   * Extract attachments from Gmail messages
   */
  public async extractAttachments(
    messages: GmailMessage[]
  ): Promise<ExtractedDocument[]> {
    const documents: ExtractedDocument[] = [];

    for (const message of messages) {
      try {
        const attachments = this.findAttachments(message.payload);

        for (const attachment of attachments) {
          if (this.isDocumentAttachment(attachment)) {
            const extractedDoc = await this.downloadAttachment(
              message,
              attachment
            );
            documents.push(extractedDoc);
          }
        }
      } catch (error) {
        console.warn(
          `Failed to extract attachments from message ${message.id}:`,
          error
        );
      }
    }

    return documents;
  }

  /**
   * Recursively find attachments in message payload
   */
  private findAttachments(
    payload: GmailPayload,
    attachments: GmailAttachment[] = []
  ): GmailAttachment[] {
    if (payload.body && payload.body.attachmentId && payload.filename) {
      attachments.push({
        partId: payload.partId,
        filename: payload.filename,
        mimeType: payload.mimeType,
        size: payload.body.size,
      });
    }

    if (payload.parts) {
      payload.parts.forEach((part: GmailPayload) => {
        this.findAttachments(part, attachments);
      });
    }

    return attachments;
  }

  /**
   * Check if attachment is a document we're interested in
   */
  private isDocumentAttachment(attachment: GmailAttachment): boolean {
    const supportedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/tiff',
    ];

    return (
      supportedTypes.includes(attachment.mimeType) &&
      attachment.size < 10 * 1024 * 1024
    );
  }

  /**
   * Download attachment content through server
   */
  private async downloadAttachment(
    message: GmailMessage,
    attachment: GmailAttachment
  ): Promise<ExtractedDocument> {
    try {
      const token = await this.getAuthToken();

      const response = await fetch(`${this.apiEndpoint}?action=attachment`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId: message.id,
          attachmentId: attachment.partId,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to download attachment: ${response.statusText}`
        );
      }

      const { data, size } = await response.json();

      const base64Data = data.replace(/-/g, '+').replace(/_/g, '/');
      const paddedData =
        base64Data + '=='.slice(0, (4 - (base64Data.length % 4)) % 4);
      const binaryString = atob(paddedData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const fromHeader = message.payload.headers.find(h => h.name === 'From');
      const subjectHeader = message.payload.headers.find(
        h => h.name === 'Subject'
      );
      const dateHeader = message.payload.headers.find(h => h.name === 'Date');

      return {
        id: `${message.id}_${attachment.partId}`,
        filename: attachment.filename,
        mimeType: attachment.mimeType,
        size: size || attachment.size,
        content: bytes.buffer,
        metadata: {
          fromEmail: fromHeader?.value || '',
          subject: subjectHeader?.value || '',
          date: dateHeader?.value || message.internalDate,
          messageId: message.id,
        },
      };
    } catch (error) {
      console.error(
        `Failed to download attachment ${attachment.filename}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Categorize documents using AI analysis
   */
  public async categorizeDocuments(
    documents: ExtractedDocument[]
  ): Promise<DocumentCategorizationResult[]> {
    const results: DocumentCategorizationResult[] = [];

    for (const document of documents) {
      try {
        const categorization = await this.analyzeDocument(document);
        results.push(categorization);
      } catch (error) {
        console.warn(
          `Failed to categorize document ${document.filename}:`,
          error
        );
        results.push({
          type: 'other',
          confidence: 0.1,
          suggestedName: document.filename,
          familyRelevance: 'medium',
          insights: ['Unable to analyze document automatically'],
        });
      }
    }

    return results;
  }

  /**
   * Analyze document content for categorization
   */
  private async analyzeDocument(
    document: ExtractedDocument
  ): Promise<DocumentCategorizationResult> {
    const type = this.categorizeByContent(document.filename, '');
    const confidence = this.calculateConfidence(type, document.filename, '');
    const suggestedName = this.generateSuggestedName(
      type,
      document.filename,
      document.metadata
    );

    return {
      type,
      confidence,
      suggestedName,
      familyRelevance: this.assessFamilyRelevance(type, ''),
      insights: this.generateInsights(type, '', document.metadata),
    };
  }

  /**
   * Categorize document by analyzing filename
   */
  private categorizeByContent(filename: string, content: string): DocumentType {
    const lowerFilename = filename.toLowerCase();
    const lowerContent = content.toLowerCase();

    if (
      lowerFilename.includes('will') ||
      lowerFilename.includes('testament') ||
      lowerContent.includes('last will') ||
      lowerContent.includes('testament')
    ) {
      return 'will';
    }

    if (
      lowerFilename.includes('trust') ||
      lowerContent.includes('trust agreement') ||
      lowerContent.includes('living trust')
    ) {
      return 'trust';
    }

    if (
      lowerFilename.includes('insurance') ||
      lowerFilename.includes('policy') ||
      lowerContent.includes('policy number') ||
      lowerContent.includes('premium')
    ) {
      return 'insurance';
    }

    if (
      lowerFilename.includes('statement') ||
      lowerFilename.includes('bank') ||
      lowerContent.includes('account balance') ||
      lowerContent.includes('transaction')
    ) {
      return 'bank_statement';
    }

    if (
      lowerFilename.includes('deed') ||
      lowerFilename.includes('property') ||
      lowerFilename.includes('mortgage') ||
      lowerContent.includes('property deed')
    ) {
      return 'property_deed';
    }

    if (
      lowerFilename.includes('tax') ||
      lowerFilename.includes('1040') ||
      lowerFilename.includes('w2') ||
      lowerContent.includes('tax return')
    ) {
      return 'tax_document';
    }

    return 'other';
  }

  /**
   * Calculate confidence score for categorization
   */
  private calculateConfidence(
    type: DocumentType,
    filename: string,
    content: string
  ): number {
    let confidence = 0.3;

    if (type !== 'other') {
      confidence += 0.3;
    }

    const typeKeywords = this.getTypeKeywords(type);
    const filenameMatches = typeKeywords.filter(keyword =>
      filename.toLowerCase().includes(keyword)
    ).length;
    confidence += filenameMatches * 0.1;

    if (content) {
      const contentMatches = typeKeywords.filter(keyword =>
        content.toLowerCase().includes(keyword)
      ).length;
      confidence += contentMatches * 0.05;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Get keywords associated with document type
   */
  private getTypeKeywords(type: DocumentType): string[] {
    const keywords: Record<DocumentType, string[]> = {
      will: ['will', 'testament', 'executor', 'beneficiary', 'bequest'],
      trust: ['trust', 'trustee', 'grantor', 'beneficiary'],
      insurance: ['insurance', 'policy', 'premium', 'coverage', 'claim'],
      bank_statement: [
        'statement',
        'balance',
        'transaction',
        'deposit',
        'withdrawal',
      ],
      investment: ['investment', 'portfolio', 'stocks', 'bonds', 'mutual fund'],
      property_deed: ['deed', 'property', 'real estate', 'mortgage', 'title'],
      tax_document: ['tax', '1040', 'w2', 'deduction', 'refund'],
      medical: ['medical', 'health', 'doctor', 'prescription', 'diagnosis'],
      identification: ['id', 'passport', 'license', 'certificate', 'birth'],
      other: [],
    };

    return keywords[type] || [];
  }

  /**
   * Generate suggested name for document
   */
  private generateSuggestedName(
    type: DocumentType,
    originalName: string,
    metadata: { date: string }
  ): string {
    const date = new Date(metadata.date);
    const year = date.getFullYear();

    const typeNames: Record<DocumentType, string> = {
      will: `Závet ${year}`,
      trust: `Trust dokument ${year}`,
      insurance: `Poistenie ${year}`,
      bank_statement: `Bankový výpis ${year}`,
      investment: `Investícia ${year}`,
      property_deed: `Vlastnícky list ${year}`,
      tax_document: `Daňové priznaie ${year}`,
      medical: `Zdravotný dokument ${year}`,
      identification: `Doklad totožnosti ${year}`,
      other: originalName,
    };

    return typeNames[type];
  }

  /**
   * Assess family relevance of document
   */
  private assessFamilyRelevance(
    type: DocumentType,
    content: string
  ): 'high' | 'low' | 'medium' {
    const highRelevanceTypes: DocumentType[] = [
      'will',
      'trust',
      'insurance',
      'property_deed',
    ];
    const mediumRelevanceTypes: DocumentType[] = [
      'investment',
      'tax_document',
      'medical',
    ];

    if (highRelevanceTypes.includes(type)) {
      return 'high';
    }

    if (mediumRelevanceTypes.includes(type)) {
      return 'medium';
    }

    if (
      content.toLowerCase().includes('family') ||
      content.toLowerCase().includes('spouse') ||
      content.toLowerCase().includes('children')
    ) {
      return 'high';
    }

    return 'low';
  }

  /**
   * Generate insights about the document
   */
  private generateInsights(
    type: DocumentType,
    _content: string,
    metadata: { date: string }
  ): string[] {
    const insights: string[] = [];

    switch (type) {
      case 'will':
        insights.push('Dôležitý dokument pre dedenie');
        insights.push('Odporúčame právne preskúmanie');
        break;
      case 'trust':
        insights.push('Trust dokument na ochranu majetku');
        insights.push('Môže vyžadovať pravidelné aktualizácie');
        break;
      case 'insurance':
        insights.push('Dokumentácia poistného krytia');
        insights.push('Skontrolujte dátumy expirácie');
        break;
      case 'tax_document':
        insights.push('Daňový dokument');
        insights.push('Uchovajte pre účely auditu');
        break;
      default:
        insights.push('Dokument importovaný z emailu');
    }

    const documentDate = new Date(metadata.date);
    const monthsOld =
      (Date.now() - documentDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

    if (monthsOld > 12) {
      insights.push('Dokument je starý viac ako rok - zvážte aktualizáciu');
    }

    return insights;
  }

  /**
   * Revoke Gmail authorization
   */
  public async signOut(): Promise<void> {
    try {
      const token = await this.getAuthToken();

      await fetch(`${this.apiEndpoint}?action=revoke`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      this.isAuthorized = false;
    } catch (error) {
      console.error('Failed to revoke Gmail authorization:', error);
      this.isAuthorized = false;
    }
  }

  /**
   * Check if user is authenticated with Gmail
   */
  public isAuthenticated(): boolean {
    return this.isAuthorized;
  }
}

export const gmailService = GmailService.getInstance();