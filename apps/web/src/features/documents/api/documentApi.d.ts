export type DocumentRow = {
    id: string;
    user_id: string;
    file_name: string;
    file_path: string | null;
    file_type: string | null;
    file_size: number | null;
    document_type: string | null;
    created_at: string;
    updated_at: string;
    title: string | null;
    description: string | null;
    category: string | null;
    tags: string[] | null;
    is_important: boolean | null;
    ocr_text: string | null;
    ocr_confidence: number | null;
    extracted_entities: any | null;
    classification_confidence: number | null;
    extracted_metadata: any | null;
    processing_status: 'pending' | 'processing' | 'completed' | 'failed' | 'manual';
    expires_at: string | null;
    expiration_date: string | null;
    ai_extracted_text: string | null;
    ai_confidence: number | null;
    ai_suggested_tags: string[] | null;
    ai_key_data: any | null;
    ai_processing_id: string | null;
    ai_reasoning: any | null;
};
export type AnalysisResult = {
    extractedText: string;
    confidence: number;
    suggestedCategory: {
        category: string;
        confidence: number;
        icon: string;
        reasoning: string;
    };
    suggestedTitle: {
        title: string;
        confidence: number;
        reasoning: string;
    };
    expirationDate: {
        date: string | null;
        confidence: number;
        originalText?: string | null;
        reasoning: string;
    };
    keyData: Array<{
        label: string;
        value: string;
        confidence: number;
        type: string;
    }>;
    suggestedTags: string[];
    processingId: string;
    processingTime: number;
};
export declare function listDocuments(): Promise<DocumentRow[]>;
export declare function getDocument(id: string): Promise<DocumentRow | null>;
export declare function updateDocument(id: string, patch: Partial<DocumentRow>): Promise<DocumentRow>;
export declare function uploadDocumentAndAnalyze(file: File): Promise<{
    document: DocumentRow;
    analysis?: AnalysisResult;
}>;
//# sourceMappingURL=documentApi.d.ts.map