
import { toast } from 'sonner';

// OCR configuration check
interface OcrConfig {
  apiKey?: string;
  isAvailable: boolean;
  message?: string;
  projectId?: string;
  provider: 'google-vision' | 'none' | 'tesseract';
}

// Check OCR availability at runtime
export function checkOcrAvailability(): OcrConfig {
  const googleVisionKey = import.meta.env.VITE_GOOGLE_VISION_API_KEY;
  const googleProjectId = import.meta.env.VITE_GOOGLE_CLOUD_PROJECT_ID;

  // Check for Google Vision API
  if (googleVisionKey && googleProjectId) {
    return {
      isAvailable: true,
      provider: 'google-vision',
      apiKey: googleVisionKey,
      projectId: googleProjectId,
    };
  }

  // Check for alternative OCR providers (future expansion)
  // const tesseractEndpoint = import.meta.env.VITE_TESSERACT_ENDPOINT;
  // if (tesseractEndpoint) {
  //   return {
  //     isAvailable: true,
  //     provider: 'tesseract',
  //   };
  // }

  // OCR not configured
  console.warn(
    'OCR service not configured. Please set up Google Vision API credentials.'
  );

  return {
    isAvailable: false,
    provider: 'none',
    message:
      'OCR service is temporarily unavailable. You can still upload documents manually.',
  };
}

// OCR result type
export interface OcrResult {
  confidence?: number;
  error?: string;
  provider?: string;
  success: boolean;
  text?: string;
}

// Main OCR service class with fallback handling
export class OcrService {
  private config: OcrConfig;

  constructor() {
    this.config = checkOcrAvailability();
  }

  // Check if OCR is available
  public isAvailable(): boolean {
    return this.config.isAvailable;
  }

  // Get OCR status message
  public getStatusMessage(): string {
    if (this.config.isAvailable) {
      return `OCR powered by ${this.config.provider}`;
    }
    return this.config.message || 'OCR service unavailable';
  }

  // Perform OCR with graceful fallback
  public async performOcr(
    file: Blob | File,
    options?: {
      enhanceQuality?: boolean;
      language?: string;
    }
  ): Promise<OcrResult> {
    // Check if OCR is available
    if (!this.config.isAvailable) {
      console.warn('OCR service not available, returning fallback response');
      return {
        success: false,
        error: this.config.message,
        provider: 'none',
      };
    }

    try {
      switch (this.config.provider) {
        case 'google-vision':
          return await this.performGoogleVisionOcr(file, options);

        // Future providers can be added here
        // case 'tesseract':
        //   return await this.performTesseractOcr(file, options);

        default:
          return {
            success: false,
            error: 'OCR provider not implemented',
            provider: this.config.provider,
          };
      }
    } catch (error) {
      console.error('OCR processing error:', error);

      // Return graceful error
      return {
        success: false,
        error: error instanceof Error ? error.message : 'OCR processing failed',
        provider: this.config.provider,
      };
    }
  }

  // Google Vision OCR implementation
  private async performGoogleVisionOcr(
    file: Blob | File,
    options?: {
      enhanceQuality?: boolean;
      language?: string;
    }
  ): Promise<OcrResult> {
    try {
      // Convert file to base64
      const base64 = await this.fileToBase64(file);

      // Prepare request body
      const requestBody = {
        requests: [
          {
            image: {
              content: base64.split(',')[1], // Remove data URL prefix
            },
            features: [
              {
                type: 'DOCUMENT_TEXT_DETECTION',
                maxResults: 1,
              },
            ],
            imageContext: options?.language
              ? {
                  languageHints: [options.language],
                }
              : undefined,
          },
        ],
      };

      // Call Google Vision API
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${this.config.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message ||
            `Google Vision API error: ${response.status}`
        );
      }

      const data = await response.json();
      const fullTextAnnotation = data.responses?.[0]?.fullTextAnnotation;

      if (!fullTextAnnotation) {
        return {
          success: false,
          error: 'No text detected in document',
          provider: 'google-vision',
        };
      }

      return {
        success: true,
        text: fullTextAnnotation.text,
        confidence: this.calculateConfidence(fullTextAnnotation),
        provider: 'google-vision',
      };
    } catch (error) {
      console.error('Google Vision OCR error:', error);
      throw error;
    }
  }

  // Convert file to base64
  private fileToBase64(file: Blob | File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  // Calculate confidence score from OCR response
  private calculateConfidence(annotation: Record<string, any>): number {
    // Simple confidence calculation based on detected blocks
    if (!annotation.pages?.length) return 0;

    let totalConfidence = 0;
    let blockCount = 0;

    annotation.pages.forEach((page: Record<string, any>) => {
      page.blocks?.forEach((block: Record<string, any>) => {
        if (block?.confidence) {
          totalConfidence += (block.confidence as number) || 0;
          blockCount++;
        }
      });
    });

    return blockCount > 0 ? totalConfidence / blockCount : 0.5;
  }
}

// Singleton instance
let ocrServiceInstance: null | OcrService = null;

// Get OCR service instance
export function getOcrService(): OcrService {
  if (!ocrServiceInstance) {
    ocrServiceInstance = new OcrService();
  }
  return ocrServiceInstance;
}

// React hook for OCR service
export function useOcrService() {
  const service = getOcrService();

  const performOcrWithFeedback = async (
    file: Blob | File,
    options?: {
      enhanceQuality?: boolean;
      language?: string;
      onProgress?: (message: string) => void;
    }
  ): Promise<OcrResult> => {
    // Check availability first
    if (!service.isAvailable()) {
      toast.warning('OCR temporarily unavailable', {
        description: 'Please enter document details manually',
      });

      return {
        success: false,
        error: service.getStatusMessage(),
        provider: 'none',
      };
    }

    // Show progress
    options?.onProgress?.('Processing document...');

    try {
      const result = await service.performOcr(file, options);

      if (result.success) {
        toast.success('Document processed successfully');
      } else {
        toast.error('OCR processing failed', {
          description: result.error || 'Please enter details manually',
        });
      }

      return result;
    } catch (error) {
      console.error('OCR error:', error);

      toast.error('OCR service error', {
        description: 'Please try again or enter details manually',
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'OCR processing failed',
        provider: 'none',
      };
    }
  };

  return {
    isAvailable: service.isAvailable(),
    statusMessage: service.getStatusMessage(),
    performOcr: performOcrWithFeedback,
  };
}
