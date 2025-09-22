/**
 * Gmail integration types
 * Copy of vendor types with adjustments for main app
 */

export interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  payload: GmailPayload;
  internalDate: string;
}

export interface GmailPayload {
  partId: string;
  mimeType: string;
  filename: string;
  headers: GmailHeader[];
  body: GmailBody;
  parts?: GmailPayload[];
}

export interface GmailHeader {
  name: string;
  value: string;
}

export interface GmailBody {
  attachmentId?: string;
  size: number;
  data?: string;
}

export interface GmailAttachment {
  partId: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface ExtractedDocument {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  content: ArrayBuffer;
  metadata: {
    fromEmail: string;
    subject: string;
    date: string;
    messageId: string;
  };
}

export interface EmailImportConfig {
  dateRange: {
    from: Date;
    to: Date;
  };
  includeTypes: string[];
  maxDocuments: number;
  sizeLimit: number;
}

export interface EmailImportSession {
  id: string;
  status: 'scanning' | 'processing' | 'completed' | 'failed';
  totalEmails: number;
  processedEmails: number;
  foundDocuments: ExtractedDocument[];
  errors: string[];
  startedAt: Date;
  completedAt?: Date;
}

export type DocumentType =
  | 'will'
  | 'trust'
  | 'insurance'
  | 'bank_statement'
  | 'investment'
  | 'property_deed'
  | 'tax_document'
  | 'medical'
  | 'identification'
  | 'other';

export interface DocumentCategorizationResult {
  type: DocumentType;
  confidence: number;
  suggestedName: string;
  familyRelevance: 'high' | 'medium' | 'low';
  insights: string[];
}

export interface BulkImportResult {
  session: EmailImportSession;
  documents: ExtractedDocument[];
  categorizations: DocumentCategorizationResult[];
  duplicates: number;
  timeSaved: number; // in minutes
  protectionIncrease: number; // percentage
}