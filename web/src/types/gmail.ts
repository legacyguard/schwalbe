
/**
 * Gmail API Integration Types
 * Comprehensive TypeScript interfaces for Gmail API integration
 */

export interface GmailAuthConfig {
  clientId: string;
  redirectUri: string;
  scopes: string[];
}

export interface GmailTokens {
  accessToken: string;
  expiryDate?: number;
  refreshToken?: string;
  tokenType: string;
}

export interface GmailMessage {
  historyId: string;
  id: string;
  internalDate: string;
  labelIds: string[];
  payload: GmailPayload;
  sizeEstimate: number;
  snippet: string;
  threadId: string;
}

export interface GmailPayload {
  body?: GmailBody;
  filename?: string;
  headers: GmailHeader[];
  mimeType: string;
  partId: string;
  parts?: GmailPayload[];
}

export interface GmailHeader {
  name: string;
  value: string;
}

export interface GmailBody {
  attachmentId?: string;
  data?: string;
  size: number;
}

export interface GmailAttachment {
  data?: string; // Base64 encoded
  filename: string;
  mimeType: string;
  partId: string;
  size: number;
}

export interface ExtractedDocument {
  confidence?: number;
  content: ArrayBuffer;
  documentType?: DocumentType;
  extractedText?: string;
  filename: string;
  id: string;
  metadata: {
    date: string;
    fromEmail: string;
    messageId: string;
    subject: string;
  };
  mimeType: string;
  size: number;
}

export type DocumentType =
  | 'bank_statement'
  | 'identification'
  | 'insurance'
  | 'investment'
  | 'medical'
  | 'other'
  | 'property_deed'
  | 'tax_document'
  | 'trust'
  | 'will';

export interface DocumentCategorizationResult {
  confidence: number;
  expiryDate?: Date;
  familyRelevance: 'high' | 'low' | 'medium';
  insights: string[];
  suggestedName: string;
  type: DocumentType;
}

export interface EmailImportSession {
  completedAt?: Date;
  errors: string[];
  foundDocuments: ExtractedDocument[];
  id: string;
  processedEmails: number;
  startedAt: Date;
  status: 'completed' | 'failed' | 'processing' | 'scanning';
  totalEmails: number;
}

export interface EmailImportConfig {
  dateRange: {
    from: Date;
    to: Date;
  };
  includeTypes: string[];
  maxDocuments: number;
  sizeLimit: number; // in bytes
}

export interface BulkImportResult {
  categorizations: DocumentCategorizationResult[];
  documents: ExtractedDocument[];
  duplicates: number;
  protectionIncrease: number; // percentage increase in family protection
  session: EmailImportSession;
  timeSaved: number; // estimated time saved in minutes
}
