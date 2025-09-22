/**
 * Document Management Feature Configuration
 * Controls which document management features are enabled in production
 */

export interface DocumentFeatureFlags {
  documentAnalysis: boolean;
  ocrEnabled: boolean;
  aiAnalysis: boolean;
  bundleIntelligence: boolean;
  documentVersioning: boolean;
  autoReminders: boolean;
  maxFileSizeMB: number;
  allowedFileTypes: string[];
  enableCaching: boolean;
}

export const DEFAULT_DOCUMENT_FEATURES: DocumentFeatureFlags = {
  documentAnalysis: true,
  ocrEnabled: true,
  aiAnalysis: true,
  bundleIntelligence: true,
  documentVersioning: true,
  autoReminders: true,
  maxFileSizeMB: 50,
  allowedFileTypes: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/tiff',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  enableCaching: true,
};

/**
 * Get document feature configuration from environment variables
 */
import { config } from '@/lib/env';

export function getDocumentFeatures(): DocumentFeatureFlags {
  return {
    documentAnalysis: config.features.documentAnalysis,
    ocrEnabled: config.features.ocr,
    aiAnalysis: config.features.aiAnalysis,
    bundleIntelligence: config.features.bundleIntelligence,
    documentVersioning: config.features.documentVersioning,
    autoReminders: config.features.autoReminders,
    maxFileSizeMB: config.documents.maxFileSizeMB,
    allowedFileTypes: config.documents.allowedFileTypes,
    enableCaching: config.features.documentCaching,
  };
}

/**
 * Check if a file type is allowed
 */
export function isFileTypeAllowed(fileType: string): boolean {
  const features = getDocumentFeatures();
  return features.allowedFileTypes.includes(fileType);
}

/**
 * Check if a file size is within limits
 */
export function isFileSizeAllowed(fileSizeBytes: number): boolean {
  const features = getDocumentFeatures();
  const maxSizeBytes = features.maxFileSizeMB * 1024 * 1024;
  return fileSizeBytes <= maxSizeBytes;
}

/**
 * Get user-friendly file size limit message
 */
export function getFileSizeLimitMessage(): string {
  const features = getDocumentFeatures();
  return `Maximum file size: ${features.maxFileSizeMB}MB`;
}

/**
 * Get user-friendly file type message
 */
export function getAllowedFileTypesMessage(): string {
  const features = getDocumentFeatures();
  const typeNames = features.allowedFileTypes.map(type => {
    switch (type) {
      case 'application/pdf': return 'PDF';
      case 'image/jpeg': return 'JPEG';
      case 'image/png': return 'PNG';
      case 'image/tiff': return 'TIFF';
      case 'image/gif': return 'GIF';
      case 'application/msword': return 'DOC';
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': return 'DOCX';
      default: return type;
    }
  });

  return `Supported formats: ${typeNames.join(', ')}`;
}

/**
 * Document analysis feature availability for UI
 */
export function getDocumentAnalysisCapabilities() {
  const features = getDocumentFeatures();

  return {
    canUpload: features.documentAnalysis,
    canExtractText: features.ocrEnabled,
    canCategorize: features.aiAnalysis,
    canSuggestBundles: features.bundleIntelligence,
    canDetectVersions: features.documentVersioning,
    canCreateReminders: features.autoReminders,
    maxFileSize: features.maxFileSizeMB,
    supportedTypes: features.allowedFileTypes,
  };
}

/**
 * Get appropriate error messages for feature limitations
 */
export function getFeatureLimitationMessage(feature: keyof DocumentFeatureFlags): string {
  const messages = {
    documentAnalysis: 'Document analysis is currently disabled. Please contact support to enable this feature.',
    ocrEnabled: 'Text extraction from images and PDFs is currently disabled.',
    aiAnalysis: 'AI-powered document categorization is currently disabled.',
    bundleIntelligence: 'Smart document bundling is not available. Documents will be organized manually.',
    documentVersioning: 'Automatic version detection is currently disabled.',
    autoReminders: 'Automatic reminder creation is currently disabled.',
    maxFileSizeMB: 'File size exceeds the maximum allowed limit.',
    allowedFileTypes: 'File type is not supported.',
    enableCaching: 'Document caching is disabled, which may affect performance.',
  };

  return messages[feature] || 'This feature is currently not available.';
}

/**
 * Check if premium features are available
 * (Bundle intelligence and document versioning are considered premium)
 */
export function isPremiumFeaturesEnabled(): boolean {
  const features = getDocumentFeatures();
  return features.bundleIntelligence || features.documentVersioning;
}

/**
 * Get configuration for document upload component
 */
export function getUploadConfiguration() {
  const features = getDocumentFeatures();

  return {
    maxFileSize: features.maxFileSizeMB * 1024 * 1024, // Convert to bytes
    allowedTypes: features.allowedFileTypes,
    enableAnalysis: features.documentAnalysis && features.aiAnalysis,
    enableOCR: features.documentAnalysis && features.ocrEnabled,
    showPremiumFeatures: isPremiumFeaturesEnabled(),
  };
}