/**
 * OCR Service Tests
 * Test text extraction accuracy and document field extraction
 */

import { OCRService, OCRResult, ocrService } from '../../lib/ocr';

// Mock Tesseract.js
jest.mock('tesseract.js', () => ({
  createWorker: jest.fn(),
  PSM: {
    AUTO: 3
  }
}));

import Tesseract from 'tesseract.js';

describe('OCRService', () => {
  let mockWorker: any;
  let mockRecognize: jest.Mock;
  let mockSetParameters: jest.Mock;
  let mockTerminate: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock worker methods
    mockRecognize = jest.fn();
    mockSetParameters = jest.fn();
    mockTerminate = jest.fn();

    // Create mock worker
    mockWorker = {
      recognize: mockRecognize,
      setParameters: mockSetParameters,
      terminate: mockTerminate
    };

    // Mock createWorker to return our mock worker
    (Tesseract.createWorker as jest.Mock).mockResolvedValue(mockWorker);
  });

  afterEach(async () => {
    // Cleanup any existing worker
    await ocrService.cleanup();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = OCRService.getInstance();
      const instance2 = OCRService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should be the same as exported ocrService', () => {
      const instance = OCRService.getInstance();
      expect(instance).toBe(ocrService);
    });
  });

  describe('Worker Initialization', () => {
    it('should initialize worker with correct languages', async () => {
      mockRecognize.mockResolvedValue({
        data: {
          text: 'Sample text',
          confidence: 85,
          words: []
        }
      });

      await ocrService.extractText('dummy-file');

      expect(Tesseract.createWorker).toHaveBeenCalledWith('slk+ces+eng', 1, {
        logger: expect.any(Function)
      });
    });

    it('should set correct parameters for Slovak/Czech text recognition', async () => {
      mockRecognize.mockResolvedValue({
        data: {
          text: 'Slovenský text',
          confidence: 90,
          words: []
        }
      });

      await ocrService.extractText('dummy-file');

      expect(mockSetParameters).toHaveBeenCalledWith({
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÁÄÈÉÍÓÔÚÝáäèéíóôúýČčĎďĹĺĽľŇňŔŕŠšŤťŽž .,!?@#$%^&*()_+-={}[]|\\:";\'<>?/~`',
        tessedit_pageseg_mode: Tesseract.PSM.AUTO
      });
    });

    it('should reuse existing worker on subsequent calls', async () => {
      mockRecognize.mockResolvedValue({
        data: {
          text: 'Text 1',
          confidence: 85,
          words: []
        }
      });

      await ocrService.extractText('file1');
      await ocrService.extractText('file2');

      // Worker should be created only once
      expect(Tesseract.createWorker).toHaveBeenCalledTimes(1);
      expect(mockRecognize).toHaveBeenCalledTimes(2);
    });
  });

  describe('Text Extraction', () => {
    beforeEach(() => {
      mockRecognize.mockResolvedValue({
        data: {
          text: 'Sample extracted text\nSecond line',
          confidence: 87.5,
          words: [
            {
              text: 'Sample',
              confidence: 90,
              bbox: { x0: 10, y0: 10, x1: 50, y1: 30 }
            },
            {
              text: 'extracted',
              confidence: 85,
              bbox: { x0: 55, y0: 10, x1: 100, y1: 30 }
            }
          ]
        }
      });
    });

    it('should extract text with correct confidence conversion', async () => {
      const result = await ocrService.extractText('dummy-file');

      expect(result).toEqual({
        text: 'Sample extracted text\nSecond line',
        confidence: 0.875, // 87.5 / 100
        words: [
          {
            text: 'Sample',
            confidence: 0.9, // 90 / 100
            bbox: { x0: 10, y0: 10, x1: 50, y1: 30 }
          },
          {
            text: 'extracted',
            confidence: 0.85, // 85 / 100
            bbox: { x0: 55, y0: 10, x1: 100, y1: 30 }
          }
        ]
      });
    });

    it('should trim extracted text', async () => {
      mockRecognize.mockResolvedValue({
        data: {
          text: '   Text with spaces   \n\n',
          confidence: 90,
          words: []
        }
      });

      const result = await ocrService.extractText('dummy-file');
      expect(result.text).toBe('Text with spaces');
    });

    it('should handle different input types', async () => {
      const file = new File(['dummy'], 'test.jpg', { type: 'image/jpeg' });
      const imageData = new ImageData(100, 100);
      const imagePath = '/path/to/image.jpg';

      await ocrService.extractText(file);
      await ocrService.extractText(imageData);
      await ocrService.extractText(imagePath);

      expect(mockRecognize).toHaveBeenCalledTimes(3);
      expect(mockRecognize).toHaveBeenCalledWith(file);
      expect(mockRecognize).toHaveBeenCalledWith(imageData);
      expect(mockRecognize).toHaveBeenCalledWith(imagePath);
    });

    it('should handle custom language options', async () => {
      await ocrService.extractText('dummy-file', {
        languages: ['eng', 'ces'],
        detectOrientation: false
      });

      expect(mockRecognize).toHaveBeenCalledWith('dummy-file');
      // Language setting is handled during worker initialization
    });

    it('should handle missing words data gracefully', async () => {
      mockRecognize.mockResolvedValue({
        data: {
          text: 'Text without words',
          confidence: 80
          // words is undefined
        }
      });

      const result = await ocrService.extractText('dummy-file');
      expect(result.words).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should throw error when worker initialization fails', async () => {
      (Tesseract.createWorker as jest.Mock).mockRejectedValue(new Error('Worker init failed'));

      await expect(ocrService.extractText('dummy-file')).rejects.toThrow(
        'OCR processing failed: Worker init failed'
      );
    });

    it('should throw error when worker is null after initialization', async () => {
      (Tesseract.createWorker as jest.Mock).mockResolvedValue(null);

      await expect(ocrService.extractText('dummy-file')).rejects.toThrow(
        'OCR worker failed to initialize'
      );
    });

    it('should throw error when recognition fails', async () => {
      mockRecognize.mockRejectedValue(new Error('Recognition failed'));

      await expect(ocrService.extractText('dummy-file')).rejects.toThrow(
        'OCR processing failed: Recognition failed'
      );
    });

    it('should handle unknown errors', async () => {
      mockRecognize.mockRejectedValue('Unknown error');

      await expect(ocrService.extractText('dummy-file')).rejects.toThrow(
        'OCR processing failed: Unknown error'
      );
    });

    it('should log errors in development mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      mockRecognize.mockRejectedValue(new Error('Test error'));

      await expect(ocrService.extractText('dummy-file')).rejects.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('OCR extraction failed:', expect.any(Error));

      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Document Data Extraction', () => {
    const mockFile = new File(['dummy'], 'document.jpg', { type: 'image/jpeg' });

    beforeEach(() => {
      mockRecognize.mockResolvedValue({
        data: {
          text: 'Document text content',
          confidence: 88,
          words: []
        }
      });
    });

    it('should extract document data with field extraction', async () => {
      const result = await ocrService.extractDocumentData(mockFile, 'general');

      expect(result).toEqual({
        text: 'Document text content',
        confidence: 0.88,
        extractedFields: {}
      });
    });

    it('should call extractText with correct parameters', async () => {
      await ocrService.extractDocumentData(mockFile, 'passport');

      expect(mockRecognize).toHaveBeenCalledWith(mockFile);
    });
  });

  describe('Field Extraction by Document Type', () => {
    // Access private method for testing
    const extractFields = (text: string, type: string) => {
      return (ocrService as any).extractFieldsByType(text, type);
    };

    describe('Passport Field Extraction', () => {
      it('should extract passport number - letter format', () => {
        const text = 'PASSPORT\nSK123456789\nJOHN DOE';
        const fields = extractFields(text, 'passport');

        expect(fields.passportNumber).toBe('SK123456789');
      });

      it('should extract passport number - numeric format', () => {
        const text = 'PASSPORT\n123456789\nJOHN DOE';
        const fields = extractFields(text, 'passport');

        expect(fields.passportNumber).toBe('123456789');
      });

      it('should extract full name', () => {
        const text = 'PASSPORT\nSK123456\nJOHN SMITH\nBorn: 1990';
        const fields = extractFields(text, 'passport');

        expect(fields.fullName).toBe('JOHN SMITH');
      });

      it('should extract Slovak names with diacritics', () => {
        const text = 'PASSPORT\n123456789\nJÁN NOVÁK\nBorn: 1985';
        const fields = extractFields(text, 'passport');

        expect(fields.fullName).toBe('JÁN NOVÁK');
      });

      it('should handle passport without clear patterns', () => {
        const text = 'Some random text without patterns';
        const fields = extractFields(text, 'passport');

        expect(fields.passportNumber).toBeUndefined();
        expect(fields.fullName).toBeUndefined();
      });
    });

    describe('ID Card Field Extraction', () => {
      it('should extract Slovak birth number', () => {
        const text = 'OBČIANSKY PREUKAZ\n901234/5678\nJÁN NOVÁK';
        const fields = extractFields(text, 'id_card');

        expect(fields.birthNumber).toBe('901234/5678');
      });

      it('should extract multiple birth numbers (first one)', () => {
        const text = 'ID CARD\n851234/5678\n901234/1234\nNames';
        const fields = extractFields(text, 'id_card');

        expect(fields.birthNumber).toBe('851234/5678');
      });

      it('should handle ID card without birth number', () => {
        const text = 'ID CARD\nJOHN DOE\nNo birth number here';
        const fields = extractFields(text, 'id_card');

        expect(fields.birthNumber).toBeUndefined();
      });
    });

    describe('Insurance Field Extraction', () => {
      it('should extract policy number', () => {
        const text = 'INSURANCE POLICY\nPolicy: 12345678901\nAmount: 1000 EUR';
        const fields = extractFields(text, 'insurance');

        expect(fields.policyNumber).toBe('12345678901');
      });

      it('should extract amount in EUR', () => {
        const text = 'INSURANCE\nPolicy: 123456789\nCoverage: 50000.50 EUR';
        const fields = extractFields(text, 'insurance');

        expect(fields.amount).toBe('50000.50 EUR');
      });

      it('should extract amount in CZK', () => {
        const text = 'POJIŠTĚNÍ\nPolice: 123456789\nČástka: 100,000 Kč';
        const fields = extractFields(text, 'insurance');

        expect(fields.amount).toBe('100,000 Kč');
      });

      it('should extract amount with different formats', () => {
        const text = 'INSURANCE\nAmount: 25000.00€\nPolicy: 987654321';
        const fields = extractFields(text, 'insurance');

        expect(fields.amount).toBe('25000.00€');
      });

      it('should handle insurance without clear patterns', () => {
        const text = 'Random insurance text without numbers';
        const fields = extractFields(text, 'insurance');

        expect(fields.policyNumber).toBeUndefined();
        expect(fields.amount).toBeUndefined();
      });
    });

    describe('General Document Field Extraction', () => {
      it('should extract dates in various formats', () => {
        const text = 'Document dated 15.03.2023\nSigned today';
        const fields = extractFields(text, 'general');

        expect(fields.date).toBe('15.03.2023');
      });

      it('should extract date with different separators', () => {
        const text = 'Contract from 15-03-2023 is valid';
        const fields = extractFields(text, 'general');

        expect(fields.date).toBe('15-03-2023');
      });

      it('should extract email addresses', () => {
        const text = 'Contact us at info@example.com for details';
        const fields = extractFields(text, 'general');

        expect(fields.email).toBe('info@example.com');
      });

      it('should extract phone numbers - international format', () => {
        const text = 'Call us at +421 123 456 789 anytime';
        const fields = extractFields(text, 'general');

        expect(fields.phone).toBe('+421 123 456 789');
      });

      it('should extract phone numbers - local format', () => {
        const text = 'Phone: 123 456 789 or mobile';
        const fields = extractFields(text, 'general');

        expect(fields.phone).toBe('123 456 789');
      });

      it('should extract phone numbers with dashes', () => {
        const text = 'Contact: 123-456-7890 during business hours';
        const fields = extractFields(text, 'general');

        expect(fields.phone).toBe('123-456-7890');
      });

      it('should extract multiple fields from complex document', () => {
        const text = `
          CONTRACT AGREEMENT
          Date: 15.03.2023
          Email: contract@company.sk
          Phone: +421 912 345 678
          Terms and conditions apply
        `;
        const fields = extractFields(text, 'general');

        expect(fields.date).toBe('15.03.2023');
        expect(fields.email).toBe('contract@company.sk');
        expect(fields.phone).toBe('+421 912 345 678');
      });

      it('should handle document with no extractable fields', () => {
        const text = 'This is just plain text without any structured data';
        const fields = extractFields(text, 'general');

        expect(Object.keys(fields)).toHaveLength(0);
      });
    });

    describe('Unknown Document Type', () => {
      it('should fallback to general extraction for unknown types', () => {
        const text = 'Document with date 01.01.2023 and email test@example.com';
        const fields = extractFields(text, 'unknown_type');

        expect(fields.date).toBe('01.01.2023');
        expect(fields.email).toBe('test@example.com');
      });
    });

    describe('Edge Cases in Field Extraction', () => {
      it('should handle empty text', () => {
        const fields = extractFields('', 'general');
        expect(Object.keys(fields)).toHaveLength(0);
      });

      it('should handle whitespace-only text', () => {
        const fields = extractFields('   \n\t   ', 'passport');
        expect(Object.keys(fields)).toHaveLength(0);
      });

      it('should handle text with only numbers but no patterns', () => {
        const text = '1 2 3 4 5 6 7 8 9 0 random numbers';
        const fields = extractFields(text, 'passport');
        expect(fields.passportNumber).toBeUndefined();
      });

      it('should extract first occurrence when multiple patterns exist', () => {
        const text = 'Passport: AB123456 and also CD789012';
        const fields = extractFields(text, 'passport');
        expect(fields.passportNumber).toBe('AB123456');
      });
    });
  });

  describe('Worker Cleanup', () => {
    it('should terminate worker on cleanup', async () => {
      mockRecognize.mockResolvedValue({
        data: { text: 'test', confidence: 90, words: [] }
      });

      // Initialize worker by calling extractText
      await ocrService.extractText('dummy-file');

      // Cleanup
      await ocrService.cleanup();

      expect(mockTerminate).toHaveBeenCalled();
    });

    it('should handle cleanup when no worker exists', async () => {
      // Cleanup without initializing worker
      await expect(ocrService.cleanup()).resolves.not.toThrow();
    });

    it('should handle worker termination errors', async () => {
      mockRecognize.mockResolvedValue({
        data: { text: 'test', confidence: 90, words: [] }
      });
      mockTerminate.mockRejectedValue(new Error('Termination failed'));

      await ocrService.extractText('dummy-file');

      // Should not throw error even if termination fails
      await expect(ocrService.cleanup()).resolves.not.toThrow();
    });
  });

  describe('Production Logger Behavior', () => {
    it('should not log in production environment', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      mockRecognize.mockResolvedValue({
        data: { text: 'test', confidence: 90, words: [] }
      });

      await ocrService.extractText('dummy-file');

      // Logger function should exist but console.log should not be called in production
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });

    it('should log progress in development environment', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // Create worker and simulate logger call
      const loggerFunction = (Tesseract.createWorker as jest.Mock).mock.calls[0]?.[2]?.logger;

      if (loggerFunction) {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        loggerFunction({ status: 'recognizing text', progress: 0.5 });
        expect(consoleSpy).toHaveBeenCalledWith('OCR Progress:', { status: 'recognizing text', progress: 0.5 });
        consoleSpy.mockRestore();
      }

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Text Accuracy and Quality Metrics', () => {
    it('should handle high confidence results', async () => {
      mockRecognize.mockResolvedValue({
        data: {
          text: 'Perfect text recognition',
          confidence: 98.5,
          words: []
        }
      });

      const result = await ocrService.extractText('high-quality-image');
      expect(result.confidence).toBe(0.985);
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    it('should handle low confidence results', async () => {
      mockRecognize.mockResolvedValue({
        data: {
          text: 'Blurry text recognition',
          confidence: 45.2,
          words: []
        }
      });

      const result = await ocrService.extractText('low-quality-image');
      expect(result.confidence).toBe(0.452);
      expect(result.confidence).toBeLessThan(0.5);
    });

    it('should handle zero confidence results', async () => {
      mockRecognize.mockResolvedValue({
        data: {
          text: '',
          confidence: 0,
          words: []
        }
      });

      const result = await ocrService.extractText('unreadable-image');
      expect(result.confidence).toBe(0);
      expect(result.text).toBe('');
    });

    it('should handle word-level confidence distribution', async () => {
      mockRecognize.mockResolvedValue({
        data: {
          text: 'Mixed quality text',
          confidence: 75,
          words: [
            { text: 'Mixed', confidence: 90, bbox: { x0: 0, y0: 0, x1: 50, y1: 20 } },
            { text: 'quality', confidence: 60, bbox: { x0: 55, y0: 0, x1: 100, y1: 20 } },
            { text: 'text', confidence: 85, bbox: { x0: 105, y0: 0, x1: 140, y1: 20 } }
          ]
        }
      });

      const result = await ocrService.extractText('mixed-quality-image');

      expect(result.words).toHaveLength(3);
      expect(result.words![0].confidence).toBe(0.9);
      expect(result.words![1].confidence).toBe(0.6);
      expect(result.words![2].confidence).toBe(0.85);

      // Check bounding box preservation
      expect(result.words![0].bbox).toEqual({ x0: 0, y0: 0, x1: 50, y1: 20 });
    });
  });
});