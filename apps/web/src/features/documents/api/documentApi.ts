export type DocumentStatus = 'processing' | 'completed' | 'manual';

export interface DocumentRow {
  id: string;
  file_name: string;
  created_at: string;
  title: string | null;
  category: string | null;
  ocr_text: string | null;
  processing_status: DocumentStatus;
}

export interface AnalysisResult {
  suggestedCategory?: {
    category: string;
    confidence: number;
  };
  suggestedTitle?: {
    title: string;
    confidence: number;
  };
  confidence?: number;
  extractedData?: Record<string, any>;
}

let documents: DocumentRow[] = [
  {
    id: 'doc-1',
    file_name: 'last-will.pdf',
    created_at: new Date().toISOString(),
    title: 'Last will and testament',
    category: 'Estate planning',
    ocr_text: 'I, Jane Citizen, declare this to be my final will…',
    processing_status: 'completed'
  }
];

export async function listDocuments(): Promise<DocumentRow[]> {
  return documents;
}

export async function getDocument(id: string): Promise<DocumentRow | null> {
  return documents.find((doc) => doc.id === id) ?? null;
}

export async function updateDocument(id: string, patch: Partial<DocumentRow>): Promise<DocumentRow> {
  const current = documents.find((doc) => doc.id === id);
  if (!current) {
    throw new Error('Document not found');
  }
  const updated = { ...current, ...patch };
  documents = documents.map((doc) => (doc.id === id ? updated : doc));
  return updated;
}

export async function uploadDocumentAndAnalyze(file: File): Promise<{ document: DocumentRow; analysis?: AnalysisResult }> {
  const newDocument: DocumentRow = {
    id: `doc-${Date.now()}`,
    file_name: file.name,
    created_at: new Date().toISOString(),
    title: file.name,
    category: null,
    ocr_text: null,
    processing_status: 'processing'
  };
  documents = [newDocument, ...documents];

  // Mock analysis result - in a real implementation, this would call an AI service
  const analysis: AnalysisResult = {
    suggestedCategory: {
      category: 'Identity Document',
      confidence: 0.85
    },
    suggestedTitle: {
      title: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
      confidence: 0.9
    },
    confidence: 0.87,
    extractedData: {
      documentType: 'ID Card',
      extractedText: 'Mock extracted text from document analysis'
    }
  };

  return { document: newDocument, analysis };
}
