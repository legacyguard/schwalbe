/**
 * Document Service Tests
 * Test document upload, processing, and management with Supabase integration
 */

import { DocumentService, Document } from '../../services/documentService';

// Mock Supabase
const mockSupabase = {
  from: jest.fn(),
  storage: {
    from: jest.fn()
  }
};

// Mock logger
const mockLogger = {
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
};

jest.mock('../../supabase/client', () => ({
  supabase: mockSupabase
}));

jest.mock('../../lib/logger', () => ({
  logger: mockLogger
}));

describe('DocumentService', () => {
  let mockSelect: jest.Mock;
  let mockInsert: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockDelete: jest.Mock;
  let mockEq: jest.Mock;
  let mockOrder: jest.Mock;
  let mockSingle: jest.Mock;
  let mockOr: jest.Mock;
  let mockUpload: jest.Mock;
  let mockGetPublicUrl: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup query builder mocks
    mockSelect = jest.fn().mockReturnThis();
    mockInsert = jest.fn().mockReturnThis();
    mockUpdate = jest.fn().mockReturnThis();
    mockDelete = jest.fn().mockReturnThis();
    mockEq = jest.fn().mockReturnThis();
    mockOrder = jest.fn().mockReturnThis();
    mockSingle = jest.fn().mockReturnThis();
    mockOr = jest.fn().mockReturnThis();

    // Setup storage mocks
    mockUpload = jest.fn();
    mockGetPublicUrl = jest.fn();

    // Chain mocks for Supabase queries
    const queryBuilder = {
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      eq: mockEq,
      order: mockOrder,
      single: mockSingle,
      or: mockOr
    };

    mockSupabase.from.mockReturnValue(queryBuilder);

    // Storage mock
    const storageBucket = {
      upload: mockUpload,
      getPublicUrl: mockGetPublicUrl
    };
    mockSupabase.storage.from.mockReturnValue(storageBucket);
  });

  describe('getDocuments', () => {
    const mockUserId = 'user-123';
    const mockDocuments: Document[] = [
      {
        id: 'doc-1',
        userId: mockUserId,
        name: 'Test Document 1',
        category: 'personal',
        createdAt: '2025-09-22T10:00:00Z',
        updatedAt: '2025-09-22T10:00:00Z',
        filePath: '/uploads/doc1.pdf',
        fileSize: 1024,
        mimeType: 'application/pdf',
        isEncrypted: false,
        metadata: { pages: 2 },
        notes: 'Important document',
        tags: ['important', 'legal']
      },
      {
        id: 'doc-2',
        userId: mockUserId,
        name: 'Test Document 2',
        category: 'financial',
        createdAt: '2025-09-22T09:00:00Z',
        updatedAt: '2025-09-22T09:00:00Z',
        filePath: '/uploads/doc2.pdf',
        fileSize: 2048,
        mimeType: 'application/pdf'
      }
    ];

    it('should fetch all documents for user successfully', async () => {
      mockOrder.mockResolvedValue({
        data: mockDocuments,
        error: null
      });

      const result = await DocumentService.getDocuments(mockUserId);

      expect(result).toEqual(mockDocuments);
      expect(mockSupabase.from).toHaveBeenCalledWith('documents');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('userId', mockUserId);
      expect(mockOrder).toHaveBeenCalledWith('createdAt', { ascending: false });
    });

    it('should return empty array when no documents exist', async () => {
      mockOrder.mockResolvedValue({
        data: null,
        error: null
      });

      const result = await DocumentService.getDocuments(mockUserId);

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      const mockError = { message: 'Database connection failed', code: 'PGRST301' };
      mockOrder.mockResolvedValue({
        data: null,
        error: mockError
      });

      await expect(DocumentService.getDocuments(mockUserId)).rejects.toEqual(mockError);
      expect(mockLogger.error).toHaveBeenCalledWith('Error fetching documents:', mockError);
    });

    it('should validate userId parameter', async () => {
      await expect(DocumentService.getDocuments('')).rejects.toThrow();
    });

    it('should handle large number of documents efficiently', async () => {
      const largeDocumentList = Array.from({ length: 1000 }, (_, i) => ({
        id: `doc-${i}`,
        userId: mockUserId,
        name: `Document ${i}`,
        category: 'general',
        createdAt: '2025-09-22T10:00:00Z',
        updatedAt: '2025-09-22T10:00:00Z'
      }));

      mockOrder.mockResolvedValue({
        data: largeDocumentList,
        error: null
      });

      const result = await DocumentService.getDocuments(mockUserId);
      expect(result).toHaveLength(1000);
    });
  });

  describe('getDocument', () => {
    const mockDocumentId = 'doc-123';
    const mockDocument: Document = {
      id: mockDocumentId,
      userId: 'user-123',
      name: 'Single Test Document',
      category: 'personal',
      createdAt: '2025-09-22T10:00:00Z',
      updatedAt: '2025-09-22T10:00:00Z'
    };

    it('should fetch single document successfully', async () => {
      mockSingle.mockResolvedValue({
        data: mockDocument,
        error: null
      });

      const result = await DocumentService.getDocument(mockDocumentId);

      expect(result).toEqual(mockDocument);
      expect(mockSupabase.from).toHaveBeenCalledWith('documents');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('id', mockDocumentId);
      expect(mockSingle).toHaveBeenCalled();
    });

    it('should return null when document not found', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'No rows returned', code: 'PGRST116' }
      });

      await expect(DocumentService.getDocument(mockDocumentId)).rejects.toEqual({
        message: 'No rows returned',
        code: 'PGRST116'
      });
    });

    it('should handle database errors', async () => {
      const mockError = { message: 'Permission denied', code: 'PGRST301' };
      mockSingle.mockResolvedValue({
        data: null,
        error: mockError
      });

      await expect(DocumentService.getDocument(mockDocumentId)).rejects.toEqual(mockError);
      expect(mockLogger.error).toHaveBeenCalledWith('Error fetching document:', mockError);
    });

    it('should validate documentId parameter', async () => {
      await expect(DocumentService.getDocument('')).rejects.toThrow();
    });
  });

  describe('createDocument', () => {
    const mockNewDocument: Partial<Document> = {
      userId: 'user-123',
      name: 'New Test Document',
      category: 'personal',
      filePath: '/uploads/new-doc.pdf',
      fileSize: 1024,
      mimeType: 'application/pdf'
    };

    const mockCreatedDocument: Document = {
      id: 'doc-new',
      ...mockNewDocument,
      createdAt: '2025-09-22T10:00:00Z',
      updatedAt: '2025-09-22T10:00:00Z'
    } as Document;

    it('should create document successfully', async () => {
      mockSingle.mockResolvedValue({
        data: mockCreatedDocument,
        error: null
      });

      const result = await DocumentService.createDocument(mockNewDocument);

      expect(result).toEqual(mockCreatedDocument);
      expect(mockSupabase.from).toHaveBeenCalledWith('documents');
      expect(mockInsert).toHaveBeenCalledWith([mockNewDocument]);
      expect(mockSelect).toHaveBeenCalled();
      expect(mockSingle).toHaveBeenCalled();
    });

    it('should handle creation errors', async () => {
      const mockError = { message: 'Constraint violation', code: 'PGRST202' };
      mockSingle.mockResolvedValue({
        data: null,
        error: mockError
      });

      await expect(DocumentService.createDocument(mockNewDocument)).rejects.toEqual(mockError);
      expect(mockLogger.error).toHaveBeenCalledWith('Error creating document:', mockError);
    });

    it('should validate required fields', async () => {
      const invalidDocument = { name: 'Test' }; // Missing required fields

      // Mock will be called, but validation should happen at database level
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Missing required field: userId', code: 'PGRST202' }
      });

      await expect(DocumentService.createDocument(invalidDocument)).rejects.toEqual({
        message: 'Missing required field: userId',
        code: 'PGRST202'
      });
    });

    it('should handle metadata and tags correctly', async () => {
      const documentWithMetadata: Partial<Document> = {
        ...mockNewDocument,
        metadata: {
          extractedText: 'Sample extracted text',
          ocrConfidence: 0.95,
          pageCount: 3
        },
        tags: ['important', 'financial', 'tax']
      };

      const expectedDocument = {
        id: 'doc-meta',
        ...documentWithMetadata,
        createdAt: '2025-09-22T10:00:00Z',
        updatedAt: '2025-09-22T10:00:00Z'
      } as Document;

      mockSingle.mockResolvedValue({
        data: expectedDocument,
        error: null
      });

      const result = await DocumentService.createDocument(documentWithMetadata);

      expect(result).toEqual(expectedDocument);
      expect(mockInsert).toHaveBeenCalledWith([documentWithMetadata]);
    });
  });

  describe('updateDocument', () => {
    const mockDocumentId = 'doc-123';
    const mockUpdates: Partial<Document> = {
      name: 'Updated Document Name',
      category: 'updated',
      notes: 'Updated notes'
    };

    const mockUpdatedDocument: Document = {
      id: mockDocumentId,
      userId: 'user-123',
      name: 'Updated Document Name',
      category: 'updated',
      notes: 'Updated notes',
      createdAt: '2025-09-22T10:00:00Z',
      updatedAt: '2025-09-22T11:00:00Z'
    };

    it('should update document successfully', async () => {
      mockSingle.mockResolvedValue({
        data: mockUpdatedDocument,
        error: null
      });

      const result = await DocumentService.updateDocument(mockDocumentId, mockUpdates);

      expect(result).toEqual(mockUpdatedDocument);
      expect(mockSupabase.from).toHaveBeenCalledWith('documents');
      expect(mockUpdate).toHaveBeenCalledWith(mockUpdates);
      expect(mockEq).toHaveBeenCalledWith('id', mockDocumentId);
      expect(mockSelect).toHaveBeenCalled();
      expect(mockSingle).toHaveBeenCalled();
    });

    it('should handle update errors', async () => {
      const mockError = { message: 'Document not found', code: 'PGRST116' };
      mockSingle.mockResolvedValue({
        data: null,
        error: mockError
      });

      await expect(DocumentService.updateDocument(mockDocumentId, mockUpdates)).rejects.toEqual(mockError);
      expect(mockLogger.error).toHaveBeenCalledWith('Error updating document:', mockError);
    });

    it('should validate documentId parameter', async () => {
      await expect(DocumentService.updateDocument('', mockUpdates)).rejects.toThrow();
    });

    it('should handle partial updates', async () => {
      const partialUpdate = { name: 'New Name Only' };
      const expectedDocument = { ...mockUpdatedDocument, name: 'New Name Only' };

      mockSingle.mockResolvedValue({
        data: expectedDocument,
        error: null
      });

      const result = await DocumentService.updateDocument(mockDocumentId, partialUpdate);

      expect(result).toEqual(expectedDocument);
      expect(mockUpdate).toHaveBeenCalledWith(partialUpdate);
    });

    it('should handle empty updates gracefully', async () => {
      const emptyUpdate = {};

      mockSingle.mockResolvedValue({
        data: mockUpdatedDocument,
        error: null
      });

      const result = await DocumentService.updateDocument(mockDocumentId, emptyUpdate);
      expect(result).toEqual(mockUpdatedDocument);
      expect(mockUpdate).toHaveBeenCalledWith(emptyUpdate);
    });
  });

  describe('deleteDocument', () => {
    const mockDocumentId = 'doc-123';

    it('should delete document successfully', async () => {
      mockDelete.mockResolvedValue({
        error: null
      });

      await DocumentService.deleteDocument(mockDocumentId);

      expect(mockSupabase.from).toHaveBeenCalledWith('documents');
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', mockDocumentId);
    });

    it('should handle deletion errors', async () => {
      const mockError = { message: 'Document not found', code: 'PGRST116' };
      mockDelete.mockResolvedValue({
        error: mockError
      });

      await expect(DocumentService.deleteDocument(mockDocumentId)).rejects.toEqual(mockError);
      expect(mockLogger.error).toHaveBeenCalledWith('Error deleting document:', mockError);
    });

    it('should validate documentId parameter', async () => {
      await expect(DocumentService.deleteDocument('')).rejects.toThrow();
    });

    it('should handle permission errors', async () => {
      const permissionError = { message: 'Permission denied', code: 'PGRST301' };
      mockDelete.mockResolvedValue({
        error: permissionError
      });

      await expect(DocumentService.deleteDocument(mockDocumentId)).rejects.toEqual(permissionError);
    });
  });

  describe('uploadFile', () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const mockPath = 'user-123/documents/test.pdf';
    const mockUploadResponse = {
      path: mockPath,
      id: 'upload-id',
      fullPath: `documents/${mockPath}`
    };
    const mockPublicUrl = 'https://storage.supabase.co/object/public/documents/user-123/documents/test.pdf';

    it('should upload file successfully', async () => {
      mockUpload.mockResolvedValue({
        data: mockUploadResponse,
        error: null
      });

      mockGetPublicUrl.mockReturnValue({
        data: { publicUrl: mockPublicUrl }
      });

      const result = await DocumentService.uploadFile(mockFile, mockPath);

      expect(result).toEqual({
        path: mockPath,
        url: mockPublicUrl
      });

      expect(mockSupabase.storage.from).toHaveBeenCalledWith('documents');
      expect(mockUpload).toHaveBeenCalledWith(mockPath, mockFile, {
        cacheControl: '3600',
        upsert: false
      });
      expect(mockGetPublicUrl).toHaveBeenCalledWith(mockPath);
    });

    it('should handle upload errors', async () => {
      const mockError = { message: 'Storage quota exceeded', code: 'STORAGE001' };
      mockUpload.mockResolvedValue({
        data: null,
        error: mockError
      });

      await expect(DocumentService.uploadFile(mockFile, mockPath)).rejects.toEqual(mockError);
      expect(mockLogger.error).toHaveBeenCalledWith('Error uploading file:', mockError);
    });

    it('should handle different file types', async () => {
      const imageFile = new File(['image content'], 'image.jpg', { type: 'image/jpeg' });
      const imagePath = 'user-123/images/image.jpg';

      mockUpload.mockResolvedValue({
        data: { path: imagePath },
        error: null
      });

      mockGetPublicUrl.mockReturnValue({
        data: { publicUrl: 'https://storage.supabase.co/object/public/documents/user-123/images/image.jpg' }
      });

      const result = await DocumentService.uploadFile(imageFile, imagePath);

      expect(result.path).toBe(imagePath);
      expect(mockUpload).toHaveBeenCalledWith(imagePath, imageFile, expect.any(Object));
    });

    it('should handle Blob uploads', async () => {
      const blob = new Blob(['blob content'], { type: 'text/plain' });
      const blobPath = 'user-123/text/blob.txt';

      mockUpload.mockResolvedValue({
        data: { path: blobPath },
        error: null
      });

      mockGetPublicUrl.mockReturnValue({
        data: { publicUrl: 'https://storage.supabase.co/object/public/documents/user-123/text/blob.txt' }
      });

      const result = await DocumentService.uploadFile(blob, blobPath);

      expect(result.path).toBe(blobPath);
      expect(mockUpload).toHaveBeenCalledWith(blobPath, blob, expect.any(Object));
    });

    it('should validate file and path parameters', async () => {
      await expect(DocumentService.uploadFile(null as any, mockPath)).rejects.toThrow();
      await expect(DocumentService.uploadFile(mockFile, '')).rejects.toThrow();
    });

    it('should handle large file uploads', async () => {
      const largeFile = new File([new ArrayBuffer(50 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' }); // 50MB

      mockUpload.mockResolvedValue({
        data: { path: mockPath },
        error: null
      });

      mockGetPublicUrl.mockReturnValue({
        data: { publicUrl: mockPublicUrl }
      });

      const result = await DocumentService.uploadFile(largeFile, mockPath);
      expect(result.path).toBe(mockPath);
    });
  });

  describe('getDocumentsByCategory', () => {
    const mockUserId = 'user-123';
    const mockCategory = 'financial';
    const mockCategoryDocuments: Document[] = [
      {
        id: 'doc-fin-1',
        userId: mockUserId,
        name: 'Financial Document 1',
        category: mockCategory,
        createdAt: '2025-09-22T10:00:00Z',
        updatedAt: '2025-09-22T10:00:00Z'
      },
      {
        id: 'doc-fin-2',
        userId: mockUserId,
        name: 'Financial Document 2',
        category: mockCategory,
        createdAt: '2025-09-22T09:00:00Z',
        updatedAt: '2025-09-22T09:00:00Z'
      }
    ];

    it('should fetch documents by category successfully', async () => {
      mockOrder.mockResolvedValue({
        data: mockCategoryDocuments,
        error: null
      });

      const result = await DocumentService.getDocumentsByCategory(mockUserId, mockCategory);

      expect(result).toEqual(mockCategoryDocuments);
      expect(mockSupabase.from).toHaveBeenCalledWith('documents');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('userId', mockUserId);
      expect(mockEq).toHaveBeenCalledWith('category', mockCategory);
      expect(mockOrder).toHaveBeenCalledWith('createdAt', { ascending: false });
    });

    it('should return empty array for category with no documents', async () => {
      mockOrder.mockResolvedValue({
        data: [],
        error: null
      });

      const result = await DocumentService.getDocumentsByCategory(mockUserId, 'empty-category');
      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      const mockError = { message: 'Database error', code: 'PGRST301' };
      mockOrder.mockResolvedValue({
        data: null,
        error: mockError
      });

      await expect(DocumentService.getDocumentsByCategory(mockUserId, mockCategory)).rejects.toEqual(mockError);
      expect(mockLogger.error).toHaveBeenCalledWith('Error fetching documents by category:', mockError);
    });

    it('should validate parameters', async () => {
      await expect(DocumentService.getDocumentsByCategory('', mockCategory)).rejects.toThrow();
      await expect(DocumentService.getDocumentsByCategory(mockUserId, '')).rejects.toThrow();
    });
  });

  describe('searchDocuments', () => {
    const mockUserId = 'user-123';
    const mockQuery = 'financial report';
    const mockSearchResults: Document[] = [
      {
        id: 'doc-search-1',
        userId: mockUserId,
        name: 'Annual Financial Report',
        category: 'financial',
        notes: 'Important financial report for tax purposes',
        createdAt: '2025-09-22T10:00:00Z',
        updatedAt: '2025-09-22T10:00:00Z'
      }
    ];

    it('should search documents successfully', async () => {
      mockOrder.mockResolvedValue({
        data: mockSearchResults,
        error: null
      });

      const result = await DocumentService.searchDocuments(mockUserId, mockQuery);

      expect(result).toEqual(mockSearchResults);
      expect(mockSupabase.from).toHaveBeenCalledWith('documents');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('userId', mockUserId);
      expect(mockOr).toHaveBeenCalledWith(`name.ilike.%${mockQuery}%,notes.ilike.%${mockQuery}%`);
      expect(mockOrder).toHaveBeenCalledWith('createdAt', { ascending: false });
    });

    it('should return empty array when no matches found', async () => {
      mockOrder.mockResolvedValue({
        data: [],
        error: null
      });

      const result = await DocumentService.searchDocuments(mockUserId, 'nonexistent');
      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      const mockError = { message: 'Search error', code: 'PGRST301' };
      mockOrder.mockResolvedValue({
        data: null,
        error: mockError
      });

      await expect(DocumentService.searchDocuments(mockUserId, mockQuery)).rejects.toEqual(mockError);
      expect(mockLogger.error).toHaveBeenCalledWith('Error searching documents:', mockError);
    });

    it('should validate parameters', async () => {
      await expect(DocumentService.searchDocuments('', mockQuery)).rejects.toThrow();
      await expect(DocumentService.searchDocuments(mockUserId, '')).rejects.toThrow();
    });

    it('should handle special characters in search query', async () => {
      const specialQuery = "document with 'quotes' and %wildcards%";

      mockOrder.mockResolvedValue({
        data: [],
        error: null
      });

      await DocumentService.searchDocuments(mockUserId, specialQuery);

      expect(mockOr).toHaveBeenCalledWith(`name.ilike.%${specialQuery}%,notes.ilike.%${specialQuery}%`);
    });

    it('should handle very long search queries', async () => {
      const longQuery = 'a'.repeat(1000);

      mockOrder.mockResolvedValue({
        data: [],
        error: null
      });

      await DocumentService.searchDocuments(mockUserId, longQuery);
      expect(mockOr).toHaveBeenCalledWith(`name.ilike.%${longQuery}%,notes.ilike.%${longQuery}%`);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle network timeouts', async () => {
      const timeoutError = { message: 'Request timeout', code: 'TIMEOUT' };
      mockOrder.mockRejectedValue(timeoutError);

      await expect(DocumentService.getDocuments('user-123')).rejects.toEqual(timeoutError);
    });

    it('should handle malformed responses', async () => {
      mockOrder.mockResolvedValue({
        data: 'invalid-data-format',
        error: null
      });

      // This should not crash, but return the malformed data
      const result = await DocumentService.getDocuments('user-123');
      expect(result).toBe('invalid-data-format');
    });

    it('should handle null responses gracefully', async () => {
      mockOrder.mockResolvedValue(null);

      // This might throw depending on implementation
      await expect(DocumentService.getDocuments('user-123')).rejects.toThrow();
    });

    it('should handle concurrent operations', async () => {
      const mockDocument: Partial<Document> = {
        userId: 'user-123',
        name: 'Concurrent Test',
        category: 'test'
      };

      mockSingle.mockResolvedValue({
        data: { id: 'doc-concurrent', ...mockDocument },
        error: null
      });

      // Simulate concurrent document creation
      const promises = Array.from({ length: 10 }, (_, i) =>
        DocumentService.createDocument({ ...mockDocument, name: `Concurrent Test ${i}` })
      );

      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      expect(mockInsert).toHaveBeenCalledTimes(10);
    });
  });

  describe('Performance and Memory Tests', () => {
    it('should handle batch operations efficiently', async () => {
      const startTime = Date.now();

      // Mock fast responses
      mockOrder.mockResolvedValue({
        data: [],
        error: null
      });

      // Perform multiple operations
      const operations = Array.from({ length: 100 }, (_, i) =>
        DocumentService.getDocuments(`user-${i}`)
      );

      await Promise.all(operations);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time (less than 1 second for 100 operations)
      expect(duration).toBeLessThan(1000);
    });

    it('should handle large document metadata', async () => {
      const largeMetadata = {
        extractedText: 'Very long extracted text content...'.repeat(1000),
        ocrData: Array.from({ length: 1000 }, (_, i) => ({ word: `word${i}`, confidence: 0.95 })),
        processingResults: {
          entities: Array.from({ length: 100 }, (_, i) => ({ name: `entity${i}`, type: 'PERSON' })),
          classifications: Array.from({ length: 50 }, (_, i) => ({ category: `cat${i}`, confidence: 0.8 }))
        }
      };

      const documentWithLargeMetadata: Partial<Document> = {
        userId: 'user-123',
        name: 'Large Metadata Document',
        category: 'test',
        metadata: largeMetadata
      };

      mockSingle.mockResolvedValue({
        data: { id: 'doc-large', ...documentWithLargeMetadata },
        error: null
      });

      const result = await DocumentService.createDocument(documentWithLargeMetadata);
      expect(result.metadata).toEqual(largeMetadata);
    });
  });
});