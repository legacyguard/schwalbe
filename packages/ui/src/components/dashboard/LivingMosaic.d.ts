/**
 * Living Mosaic Visualization
 * Document tiles as organic growing mosaic stones
 */
import React from 'react';
export interface Document {
    id: string;
    title: string;
    category: DocumentCategory;
    type: 'pdf' | 'image' | 'text' | 'scan';
    uploadedAt: Date;
    lastModified: Date;
    size: number;
    tags: string[];
    isProcessed: boolean;
    confidence: number;
    previewUrl?: string;
    extractedText?: string;
    metadata: DocumentMetadata;
}
export interface DocumentCategory {
    id: string;
    name: string;
    color: string;
    icon: React.ReactNode;
    description: string;
}
export interface DocumentMetadata {
    extractedData: Record<string, any>;
    ocrConfidence: number;
    pageCount?: number;
    language?: string;
}
interface LivingMosaicProps {
    documents: Document[];
    categories: DocumentCategory[];
    onDocumentClick: (document: Document) => void;
    onDocumentEdit: (documentId: string) => void;
    onAddDocument: () => void;
    searchQuery?: string;
    selectedCategory?: string;
    className?: string;
    variant?: 'grid' | 'masonry' | 'organic';
}
export declare function LivingMosaic({ documents, categories, onDocumentClick, onDocumentEdit, onAddDocument, searchQuery, selectedCategory, className, variant }: LivingMosaicProps): import("react/jsx-runtime").JSX.Element;
export declare const DEFAULT_DOCUMENT_CATEGORIES: DocumentCategory[];
export {};
//# sourceMappingURL=LivingMosaic.d.ts.map