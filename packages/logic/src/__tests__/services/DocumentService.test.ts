/**
 * Unit tests for DocumentService
 * Tests all methods with success cases, error cases, and edge cases
 */

import { DocumentService } from '../../api-definitions';
import type { ApiClientInterface } from '../../types/api';
import type { Document } from '../../types/supabase';

// Mock API client
class MockApiClient implements ApiClientInterface {
  get = jest.fn();
  post = jest.fn();
  put = jest.fn();
  delete = jest.fn();
  uploadFile = jest.fn();
}

describe('DocumentService', () => {
  let service: DocumentService;
  let mockClient: MockApiClient;

  beforeEach(() => {
    mockClient = new MockApiClient();
    service = new DocumentService(mockClient);
    jest.clearAllMocks();
  });

  describe('upload', () => {
    const validRequest = {
      file: {
        base64: 'data:image/png;base64,iVBORw0KG...',
        mimeType: 'image/png',
        fileName: 'test.png',
      },
    };

    const mockDocument: Document = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      user_id: 'user123',
      file_name: 'test.png',
      file_path: '/uploads/test.png',
      file_type: 'image/png',
      file_size: 1024,
      document_type: 'personal',
      category: 'photo',
      extracted_metadata: null,
      is_important: false,
      ocr_text: null,
      ocr_confidence: null,
      extracted_entities: null,
      classification_confidence: null,
      processing_status: 'completed',
      completion_percentage: null,
      expires_at: null,
      encrypted_at: null,
      last_notification_sent_at: null,
      professional_review_status: null,
      professional_review_score: null,
      professional_review_date: null,
      professional_reviewer_id: null,
      review_findings: null,
      review_recommendations: null,
      title: null,
      description: null,
      tags: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    it('should upload document successfully', async () => {
      mockClient.uploadFile.mockResolvedValue({ document: mockDocument });

      const result = await service.upload(validRequest);

      expect(result).toEqual(mockDocument);
      expect(mockClient.uploadFile).toHaveBeenCalledWith(
        '/api/analyze-document',
        validRequest.file
      );
    });

    it('should throw error if file is missing', async () => {
      const invalidRequest = { file: null } as unknown;

      await expect(service.upload(invalidRequest)).rejects.toThrow(
        'File is required'
      );
      expect(mockClient.uploadFile).not.toHaveBeenCalled();
    });

    it('should throw error if base64 format is invalid', async () => {
      const invalidRequest = {
        file: {
          base64: 'invalid-base64',
          mimeType: 'image/png',
          fileName: 'test.png',
        },
      };

      await expect(service.upload(invalidRequest)).rejects.toThrow(
        'Invalid base64 format'
      );
      expect(mockClient.uploadFile).not.toHaveBeenCalled();
    });

    it('should throw error if required fields are missing', async () => {
      const invalidRequest = {
        file: {
          base64: 'data:image/png;base64,iVBORw0KG...',
          mimeType: 'image/png',
          // fileName missing
        },
      } as unknown;

      await expect(service.upload(invalidRequest)).rejects.toThrow();
      expect(mockClient.uploadFile).not.toHaveBeenCalled();
    });

    it('should retry on network failure', async () => {
      mockClient.uploadFile
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ document: mockDocument });

      const result = await service.upload(validRequest);

      expect(result).toEqual(mockDocument);
      expect(mockClient.uploadFile).toHaveBeenCalledTimes(3);
    });

    it('should throw error if document is not returned', async () => {
      mockClient.uploadFile.mockResolvedValue({ success: true });

      await expect(service.upload(validRequest)).rejects.toThrow(
        'Document upload succeeded but no document was returned'
      );
    });
  });

  describe('getAll', () => {
    const mockDocuments: Document[] = [
      {
        id: '1',
        user_id: 'user123',
        file_name: 'doc1.pdf',
        file_path: '/uploads/doc1.pdf',
        file_type: 'application/pdf',
        file_size: 2048,
        document_type: 'legal',
        category: 'contract',
        extracted_metadata: null,
        is_important: true,
        ocr_text: null,
        ocr_confidence: null,
        extracted_entities: null,
        classification_confidence: null,
        processing_status: 'completed',
        completion_percentage: null,
        expires_at: null,
        encrypted_at: null,
        last_notification_sent_at: null,
        professional_review_status: null,
        professional_review_score: null,
        professional_review_date: null,
        professional_reviewer_id: null,
        review_findings: null,
        review_recommendations: null,
        title: null,
        description: null,
        tags: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        user_id: 'user123',
        file_name: 'doc2.pdf',
        file_path: '/uploads/doc2.pdf',
        file_type: 'application/pdf',
        file_size: 4096,
        document_type: 'financial',
        category: 'invoice',
        extracted_metadata: null,
        is_important: false,
        ocr_text: null,
        ocr_confidence: null,
        extracted_entities: null,
        classification_confidence: null,
        processing_status: 'completed',
        completion_percentage: null,
        expires_at: null,
        encrypted_at: null,
        last_notification_sent_at: null,
        professional_review_status: null,
        professional_review_score: null,
        professional_review_date: null,
        professional_reviewer_id: null,
        review_findings: null,
        review_recommendations: null,
        title: null,
        description: null,
        tags: null,
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      },
    ];

    it('should fetch all documents successfully', async () => {
      mockClient.get.mockResolvedValue({ documents: mockDocuments });

      const result = await service.getAll();

      expect(result).toEqual(mockDocuments);
      expect(mockClient.get).toHaveBeenCalledWith('/api/documents');
    });

    it('should fetch documents with pagination', async () => {
      mockClient.get.mockResolvedValue({ documents: [mockDocuments[0]] });

      const result = await service.getAll({ limit: 1, offset: 0 });

      expect(result).toEqual([mockDocuments[0]]);
      expect(mockClient.get).toHaveBeenCalledWith(
        '/api/documents?limit=1&offset=0'
      );
    });

    it('should fetch documents with filters', async () => {
      mockClient.get.mockResolvedValue({ documents: [mockDocuments[0]] });

      const result = await service.getAll({
        documentType: 'legal',
        category: 'contract',
      });

      expect(result).toEqual([mockDocuments[0]]);
      expect(mockClient.get).toHaveBeenCalledWith(
        '/api/documents?document_type=legal&category=contract'
      );
    });

    it('should throw error for invalid limit', async () => {
      await expect(service.getAll({ limit: -1 })).rejects.toThrow(
        'Limit must be a positive number'
      );
      expect(mockClient.get).not.toHaveBeenCalled();
    });

    it('should throw error for invalid offset', async () => {
      await expect(service.getAll({ offset: -1 })).rejects.toThrow(
        'Offset must be a non-negative number'
      );
      expect(mockClient.get).not.toHaveBeenCalled();
    });

    it('should throw error if response format is invalid', async () => {
      mockClient.get.mockResolvedValue({ data: 'invalid' });

      await expect(service.getAll()).rejects.toThrow(
        'Invalid response format - documents array expected'
      );
    });

    it('should handle empty documents array', async () => {
      mockClient.get.mockResolvedValue({ documents: [] });

      const result = await service.getAll();

      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    const mockDocument: Document = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      user_id: 'user123',
      file_name: 'test.pdf',
      file_path: '/uploads/test.pdf',
      file_type: 'application/pdf',
      file_size: 1024,
      document_type: 'personal',
      category: 'document',
      extracted_metadata: null,
      is_important: false,
      ocr_text: null,
      ocr_confidence: null,
      extracted_entities: null,
      classification_confidence: null,
      processing_status: 'completed',
      completion_percentage: null,
      expires_at: null,
      encrypted_at: null,
      last_notification_sent_at: null,
      professional_review_status: null,
      professional_review_score: null,
      professional_review_date: null,
      professional_reviewer_id: null,
      review_findings: null,
      review_recommendations: null,
      title: null,
      description: null,
      tags: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    it('should fetch document by ID successfully', async () => {
      mockClient.get.mockResolvedValue({ document: mockDocument });

      const result = await service.getById(
        '123e4567-e89b-12d3-a456-426614174000'
      );

      expect(result).toEqual(mockDocument);
      expect(mockClient.get).toHaveBeenCalledWith(
        '/api/documents/123e4567-e89b-12d3-a456-426614174000'
      );
    });

    it('should throw error for invalid UUID', async () => {
      await expect(service.getById('invalid-id')).rejects.toThrow(
        'Document ID must be a valid UUID'
      );
      expect(mockClient.get).not.toHaveBeenCalled();
    });

    it('should throw error if document not found', async () => {
      mockClient.get.mockResolvedValue({});

      await expect(
        service.getById('123e4567-e89b-12d3-a456-426614174000')
      ).rejects.toThrow('Document with ID');
    });

    it('should throw error if ID is empty', async () => {
      await expect(service.getById('')).rejects.toThrow();
      expect(mockClient.get).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const mockDocument: Document = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      user_id: 'user123',
      file_name: 'updated.pdf',
      file_path: '/uploads/test.pdf',
      file_type: 'application/pdf',
      file_size: 1024,
      document_type: 'personal',
      category: 'document',
      extracted_metadata: null,
      is_important: true,
      ocr_text: null,
      ocr_confidence: null,
      extracted_entities: null,
      classification_confidence: null,
      processing_status: 'completed',
      completion_percentage: null,
      expires_at: null,
      encrypted_at: null,
      last_notification_sent_at: null,
      professional_review_status: null,
      professional_review_score: null,
      professional_review_date: null,
      professional_reviewer_id: null,
      review_findings: null,
      review_recommendations: null,
      title: null,
      description: null,
      tags: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    };

    it('should update document successfully', async () => {
      mockClient.put.mockResolvedValue({ document: mockDocument });

      const result = await service.update(
        '123e4567-e89b-12d3-a456-426614174000',
        { file_name: 'updated.pdf', is_important: true }
      );

      expect(result).toEqual(mockDocument);
      expect(mockClient.put).toHaveBeenCalledWith(
        '/api/documents/123e4567-e89b-12d3-a456-426614174000',
        { file_name: 'updated.pdf', is_important: true }
      );
    });

    it('should throw error for empty update data', async () => {
      await expect(
        service.update('123e4567-e89b-12d3-a456-426614174000', {})
      ).rejects.toThrow('Update data cannot be empty');
      expect(mockClient.put).not.toHaveBeenCalled();
    });

    it('should throw error for invalid field types', async () => {
      await expect(
        service.update('123e4567-e89b-12d3-a456-426614174000', {
          file_name: 123 as unknown,
        })
      ).rejects.toThrow('File name must be a string');
      expect(mockClient.put).not.toHaveBeenCalled();
    });

    it('should throw error for invalid boolean field', async () => {
      await expect(
        service.update('123e4567-e89b-12d3-a456-426614174000', {
          is_important: 'true' as unknown,
        })
      ).rejects.toThrow('is_important must be a boolean');
      expect(mockClient.put).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete document successfully', async () => {
      mockClient.delete.mockResolvedValue({});

      await service.delete('123e4567-e89b-12d3-a456-426614174000');

      expect(mockClient.delete).toHaveBeenCalledWith(
        '/api/documents/123e4567-e89b-12d3-a456-426614174000'
      );
    });

    it('should throw error for invalid UUID', async () => {
      await expect(service.delete('invalid-id')).rejects.toThrow(
        'Document ID must be a valid UUID'
      );
      expect(mockClient.delete).not.toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
      mockClient.delete.mockRejectedValue(new Error('Not found'));

      await expect(
        service.delete('123e4567-e89b-12d3-a456-426614174000')
      ).rejects.toThrow();
    });
  });

  describe('getByCategory', () => {
    it('should fetch documents by category', async () => {
      const mockDocuments: Document[] = [];
      mockClient.get.mockResolvedValue({ documents: mockDocuments });

      const result = await service.getByCategory('legal');

      expect(result).toEqual(mockDocuments);
      expect(mockClient.get).toHaveBeenCalledWith(
        '/api/documents?category=legal'
      );
    });

    it('should throw error for empty category', async () => {
      await expect(service.getByCategory('')).rejects.toThrow();
      expect(mockClient.get).not.toHaveBeenCalled();
    });
  });

  describe('getByType', () => {
    it('should fetch documents by type', async () => {
      const mockDocuments: Document[] = [];
      mockClient.get.mockResolvedValue({ documents: mockDocuments });

      const result = await service.getByType('financial');

      expect(result).toEqual(mockDocuments);
      expect(mockClient.get).toHaveBeenCalledWith(
        '/api/documents?document_type=financial'
      );
    });

    it('should throw error for empty type', async () => {
      await expect(service.getByType('')).rejects.toThrow();
      expect(mockClient.get).not.toHaveBeenCalled();
    });
  });

  describe('search', () => {
    it('should search documents successfully', async () => {
      const mockDocuments: Document[] = [];
      mockClient.get.mockResolvedValue({ documents: mockDocuments });

      const result = await service.search('test query');

      expect(result).toEqual(mockDocuments);
      expect(mockClient.get).toHaveBeenCalledWith(
        '/api/documents/search?q=test%20query'
      );
    });

    it('should throw error for short query', async () => {
      await expect(service.search('a')).rejects.toThrow(
        'Search query must be at least 2 characters long'
      );
      expect(mockClient.get).not.toHaveBeenCalled();
    });

    it('should handle special characters in query', async () => {
      mockClient.get.mockResolvedValue({ documents: [] });

      await service.search('test & query');

      expect(mockClient.get).toHaveBeenCalledWith(
        '/api/documents/search?q=test%20%26%20query'
      );
    });
  });
});
