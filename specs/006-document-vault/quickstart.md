# Document Vault - Quickstart Guide

## Overview

This document provides end-to-end user flows, implementation examples, and testing scenarios for the Document Vault system.

## User Flows

### 1. First Document Upload - Encryption Flow

#### User Journey
1. **User Registration**: User creates account and sets up master password
2. **Key Generation**: System generates encryption key pair
3. **Document Selection**: User selects document to upload
4. **Encryption Process**: Document encrypted client-side before upload
5. **Upload to Storage**: Encrypted document uploaded to Supabase Storage
6. **Metadata Storage**: Document metadata stored in PostgreSQL
7. **Confirmation**: User receives upload confirmation

#### Technical Implementation
```typescript
// 1. Initialize encryption service
const encryptionService = new EncryptionService();
await encryptionService.initializeWithPassword(userPassword);

// 2. Generate encryption keys
const keyPair = await encryptionService.generateKeyPair();
await encryptionService.storeKeys(keyPair);

// 3. Encrypt document
const encryptedDocument = await encryptionService.encryptDocument(file, keyPair.publicKey);

// 4. Upload to storage
const uploadResult = await supabase.storage
  .from('user_documents')
  .upload(`${userId}/${fileId}`, encryptedDocument.blob);

// 5. Store metadata
await supabase.from('documents').insert({
  user_id: userId,
  file_name: file.name,
  file_path: uploadResult.data.path,
  file_size: file.size,
  mime_type: file.type,
  encryption_nonce: encryptedDocument.nonce,
  uploaded_at: new Date().toISOString()
});
```

#### Testing Scenarios
- **Happy Path**: Upload 1MB PDF document successfully
- **Large File**: Upload 50MB image file with progress tracking
- **Multiple Files**: Upload 5 documents simultaneously
- **Network Failure**: Test upload retry logic
- **Storage Quota**: Test upload when quota exceeded

### 2. Document Download - Decryption Flow

#### User Journey
1. **Document Selection**: User selects document from list
2. **Authentication**: System verifies user access permissions
3. **Key Retrieval**: User's encryption keys retrieved from secure storage
4. **Document Download**: Encrypted document downloaded from storage
5. **Decryption Process**: Document decrypted client-side
6. **File Delivery**: Decrypted document provided to user

#### Technical Implementation
```typescript
// 1. Retrieve document metadata
const { data: document } = await supabase
  .from('documents')
  .select('*')
  .eq('id', documentId)
  .single();

// 2. Download encrypted document
const { data: encryptedBlob } = await supabase.storage
  .from('user_documents')
  .download(document.file_path);

// 3. Retrieve encryption keys
const keyPair = await encryptionService.getKeys();

// 4. Decrypt document
const decryptedDocument = await encryptionService.decryptDocument(
  encryptedBlob,
  keyPair.privateKey,
  document.encryption_nonce
);

// 5. Create download link
const url = URL.createObjectURL(decryptedDocument);
const link = document.createElement('a');
link.href = url;
link.download = document.file_name;
link.click();
```

#### Testing Scenarios
- **Happy Path**: Download and decrypt 1MB PDF successfully
- **Large File**: Download 100MB video file with progress tracking
- **Corrupted File**: Test download of corrupted encrypted file
- **Access Denied**: Test download without proper permissions
- **Network Failure**: Test download retry logic

### 3. Document Versioning - Version Management

#### User Journey
1. **Document Update**: User uploads new version of existing document
2. **Version Detection**: System detects potential version relationship
3. **Version Linking**: New document linked to previous version
4. **Version History**: User can view complete version history
5. **Version Comparison**: User can compare different versions
6. **Version Restoration**: User can restore previous version

#### Technical Implementation
```typescript
// 1. Check for potential versions
const potentialVersions = await supabase.rpc('find_potential_document_versions', {
  p_user_id: userId,
  p_bundle_id: bundleId,
  p_file_name: newFile.name,
  p_ai_extracted_text: extractedText
});

// 2. Create version relationship
if (potentialVersions.data.length > 0) {
  await supabase.rpc('archive_document_and_create_version', {
    p_old_document_id: potentialVersions.data[0].document_id,
    p_new_document_id: newDocumentId,
    p_archive_reason: 'version_update'
  });
}

// 3. Get version history
const versionHistory = await supabase.rpc('get_document_version_history', {
  p_document_id: documentId
});

// 4. Compare versions
const diff = await documentService.compareDocumentVersions(
  documentId,
  version1Id,
  version2Id
);
```

#### Testing Scenarios
- **Happy Path**: Upload new version of existing document
- **Version Detection**: Test automatic version detection
- **Version History**: Test version history display
- **Version Comparison**: Test diff visualization
- **Version Restoration**: Test restoring previous version

### 4. Metadata Extraction - OCR Processing

#### User Journey
1. **Document Upload**: User uploads document (PDF, image)
2. **OCR Trigger**: System automatically triggers OCR processing
3. **Text Extraction**: OCR extracts text from document
4. **AI Analysis**: Sofia AI analyzes extracted text
5. **Metadata Generation**: System generates document metadata
6. **Search Indexing**: Document indexed for search

#### Technical Implementation
```typescript
// 1. Trigger OCR processing
const ocrResult = await metadataExtractionService.extractTextFromDocument(document);

// 2. AI analysis with Sofia
const analysis = await sofiaAI.analyzeDocument({
  text: ocrResult.text,
  metadata: document.metadata,
  userContext: userContext
});

// 3. Update document with extracted metadata
await supabase.from('documents').update({
  ocr_text: ocrResult.text,
  ocr_confidence: ocrResult.confidence,
  category: analysis.category,
  extracted_entities: analysis.entities,
  classification_confidence: analysis.confidence,
  processing_status: 'completed'
}).eq('id', documentId);

// 4. Update search index
await searchService.indexDocument(documentId, {
  text: ocrResult.text,
  metadata: analysis.metadata
});
```

#### Testing Scenarios
- **Happy Path**: OCR processing of clear PDF document
- **Low Quality**: OCR processing of scanned document
- **Multiple Languages**: OCR processing of multilingual document
- **OCR Failure**: Test handling of OCR processing failures
- **AI Analysis**: Test Sofia AI categorization accuracy

### 5. Document Search - Search Functionality

#### User Journey
1. **Search Query**: User enters search terms
2. **Query Processing**: System processes search query
3. **Index Search**: Search performed across document indexes
4. **Result Ranking**: Results ranked by relevance
5. **Result Display**: Search results displayed to user
6. **Result Interaction**: User can filter, sort, and access results

#### Technical Implementation
```typescript
// 1. Process search query
const searchQuery = {
  query: userInput,
  filters: {
    category: selectedCategory,
    dateRange: dateFilter,
    tags: selectedTags
  },
  sortBy: { field: 'relevance', direction: 'desc' },
  limit: 20,
  offset: 0
};

// 2. Execute search
const searchResults = await searchService.searchDocuments(searchQuery);

// 3. Rank results
const rankedResults = await searchService.rankResults(
  searchResults.documents,
  searchQuery.query
);

// 4. Return results with metadata
return {
  documents: rankedResults,
  totalCount: searchResults.totalCount,
  searchTime: searchResults.searchTime,
  suggestions: searchResults.suggestions
};
```

#### Testing Scenarios
- **Happy Path**: Search for "contract" returns relevant documents
- **No Results**: Search for non-existent terms
- **Filtered Search**: Search with category and date filters
- **Performance**: Search across 10,000 documents in <500ms
- **Spell Correction**: Search with misspelled terms

### 6. Document Sharing - Secure Sharing

#### User Journey
1. **Share Request**: User initiates document sharing
2. **Permission Setup**: User sets sharing permissions
3. **Recipient Selection**: User selects recipient
4. **Key Encryption**: Document key encrypted for recipient
5. **Share Link Generation**: Secure share link generated
6. **Recipient Access**: Recipient accesses shared document

#### Technical Implementation
```typescript
// 1. Generate share permissions
const sharePermissions = {
  canRead: true,
  canDownload: true,
  canShare: false,
  canDelete: false,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
};

// 2. Encrypt document key for recipient
const recipientPublicKey = await getRecipientPublicKey(recipientId);
const encryptedDocumentKey = await encryptionService.encryptForRecipient(
  documentKey,
  recipientPublicKey
);

// 3. Create share access record
await supabase.from('document_access').insert({
  document_id: documentId,
  recipient_public_key: recipientPublicKey,
  encrypted_document_key: encryptedDocumentKey,
  permissions: sharePermissions,
  expires_at: sharePermissions.expiresAt
});

// 4. Generate share link
const shareLink = await generateSecureShareLink(documentId, recipientId);
```

#### Testing Scenarios
- **Happy Path**: Share document with read-only access
- **Permission Levels**: Test different permission combinations
- **Expiration**: Test share link expiration
- **Revocation**: Test share revocation
- **Multiple Recipients**: Test sharing with multiple recipients

### 7. Error Recovery - Backup/Restore

#### User Journey
1. **Error Detection**: System detects encryption or storage error
2. **Error Classification**: Error classified by type and severity
3. **Recovery Attempt**: System attempts automatic recovery
4. **User Notification**: User notified of error and recovery status
5. **Manual Recovery**: User guided through manual recovery if needed
6. **Recovery Validation**: Recovery success validated

#### Technical Implementation
```typescript
// 1. Error detection and classification
const errorHandler = new DocumentVaultErrorHandler();
const errorClassification = await errorHandler.classifyError(error);

// 2. Automatic recovery attempt
if (errorClassification.retryable) {
  const recoveryResult = await errorHandler.attemptRecovery(error);
  if (recoveryResult.success) {
    return recoveryResult.data;
  }
}

// 3. User notification and guidance
await notificationService.notifyUser({
  type: 'error',
  message: errorClassification.userMessage,
  recoverySteps: errorClassification.recoverySteps,
  supportContact: errorClassification.supportContact
});

// 4. Manual recovery flow
if (errorClassification.requiresManualRecovery) {
  await recoveryService.initiateManualRecovery(error, userId);
}
```

#### Testing Scenarios
- **Network Error**: Test recovery from network failures
- **Encryption Error**: Test recovery from encryption failures
- **Storage Error**: Test recovery from storage failures
- **Key Loss**: Test recovery from key loss scenarios
- **Data Corruption**: Test recovery from corrupted data

### 8. Performance Test - Large Files

#### User Journey
1. **Large File Selection**: User selects large file (>100MB)
2. **Progress Tracking**: System shows encryption progress
3. **Chunked Upload**: File uploaded in chunks with retry logic
4. **Storage Optimization**: File stored with compression
5. **Download Test**: User downloads file to verify integrity
6. **Performance Metrics**: System records performance metrics

#### Technical Implementation
```typescript
// 1. Large file handling
const chunkSize = 10 * 1024 * 1024; // 10MB chunks
const fileChunks = await splitFileIntoChunks(file, chunkSize);

// 2. Parallel encryption
const encryptionPromises = fileChunks.map(async (chunk, index) => {
  const encryptedChunk = await encryptionService.encryptChunk(chunk, key);
  return { index, encryptedChunk };
});

const encryptedChunks = await Promise.all(encryptionPromises);

// 3. Parallel upload with progress tracking
const uploadPromises = encryptedChunks.map(async ({ index, encryptedChunk }) => {
  const progress = (index / encryptedChunks.length) * 100;
  updateProgress(progress);
  
  return await supabase.storage
    .from('user_documents')
    .upload(`${userId}/${fileId}/chunk_${index}`, encryptedChunk);
});

await Promise.all(uploadPromises);
```

#### Testing Scenarios
- **100MB File**: Upload and download 100MB video file
- **1GB File**: Upload and download 1GB archive file
- **Multiple Large Files**: Upload 5 large files simultaneously
- **Network Interruption**: Test large file upload with network issues
- **Storage Quota**: Test large file upload with quota limits

### 9. Security Test - RLS Validation

#### User Journey
1. **Access Attempt**: User attempts to access another user's document
2. **Permission Check**: System checks user permissions
3. **Access Denial**: System denies unauthorized access
4. **Audit Logging**: Access attempt logged for security monitoring
5. **Security Alert**: Security team notified of suspicious activity
6. **User Notification**: User notified of access denial

#### Technical Implementation
```typescript
// 1. RLS policy enforcement
const { data: document, error } = await supabase
  .from('documents')
  .select('*')
  .eq('id', documentId)
  .single();

// 2. Access control check
if (error || document.user_id !== currentUserId) {
  // 3. Log unauthorized access attempt
  await supabase.from('security_logs').insert({
    user_id: currentUserId,
    action: 'unauthorized_access_attempt',
    resource_id: documentId,
    ip_address: request.ip,
    user_agent: request.headers['user-agent'],
    timestamp: new Date()
  });

  // 4. Notify security team
  await securityService.notifySuspiciousActivity({
    userId: currentUserId,
    action: 'unauthorized_document_access',
    documentId: documentId
  });

  throw new UnauthorizedAccessError('Access denied');
}
```

#### Testing Scenarios
- **Cross-User Access**: Test accessing another user's document
- **Admin Access**: Test admin access to user documents
- **API Bypass**: Test direct API access without authentication
- **Session Hijacking**: Test access with stolen session token
- **Privilege Escalation**: Test privilege escalation attempts

### 10. End-to-End Test - Complete Workflow

#### User Journey
1. **Account Setup**: User creates account and sets master password
2. **Document Upload**: User uploads various document types
3. **Document Organization**: User organizes documents into bundles
4. **Search and Discovery**: User searches and discovers documents
5. **Document Sharing**: User shares documents with others
6. **Version Management**: User manages document versions
7. **Recovery Testing**: User tests backup and recovery
8. **Performance Validation**: System performance validated

### 11. OCR Processing Test - Document Analysis

#### User Journey
1. **Image Upload**: User uploads scanned document images
2. **OCR Processing**: System processes images with Google Vision API
3. **Text Extraction**: OCR extracts text with confidence scoring
4. **Quality Assessment**: System assesses OCR quality and accuracy
5. **Metadata Generation**: System generates document metadata
6. **AI Analysis**: Sofia AI analyzes extracted content
7. **Categorization**: Documents automatically categorized
8. **Search Integration**: Extracted text made searchable

### 12. AI Analysis Test - Sofia Integration

#### User Journey
1. **Document Upload**: User uploads various document types
2. **AI Processing**: Sofia AI analyzes document content
3. **Entity Extraction**: Names, dates, and amounts extracted
4. **Smart Categorization**: Documents automatically categorized
5. **Importance Scoring**: Documents scored for importance
6. **Smart Tagging**: AI suggests relevant tags
7. **Insights Generation**: Sofia provides document insights
8. **User Guidance**: Sofia guides user through document management

### 13. Document Bundle Test - Organization

#### User Journey
1. **Bundle Creation**: User creates document bundles
2. **Automatic Categorization**: System suggests bundle categories
3. **Document Grouping**: Related documents grouped automatically
4. **Bundle Management**: User manages bundle settings
5. **Bundle Search**: User searches within bundles
6. **Bundle Sharing**: User shares entire bundles
7. **Bundle Analytics**: System provides bundle insights
8. **Bundle Cleanup**: System suggests bundle optimization

### 14. Document Versioning Test - Version Management

#### User Journey
1. **Initial Upload**: User uploads first version of document
2. **Version Detection**: System detects new version upload
3. **Version Linking**: New version linked to previous version
4. **Version History**: User views complete version history
5. **Version Comparison**: User compares different versions
6. **Version Restoration**: User restores previous version
7. **Version Cleanup**: System manages old versions
8. **Version Analytics**: System provides version insights

### 15. Document Sharing Test - Secure Sharing

#### User Journey
1. **Share Request**: User initiates document sharing
2. **Permission Setup**: User sets sharing permissions
3. **Recipient Selection**: User selects recipients
4. **Key Encryption**: Document keys encrypted for recipients
5. **Share Link Generation**: Secure share links generated
6. **Access Control**: Recipients access shared documents
7. **Permission Management**: User manages sharing permissions
8. **Share Analytics**: System tracks sharing activity

#### Technical Implementation
```typescript
// Complete end-to-end test
describe('Document Vault End-to-End', () => {
  it('should complete full user workflow', async () => {
    // 1. Account setup
    const user = await createTestUser();
    await setupEncryptionKeys(user.id, 'testPassword123');

    // 2. Document upload
    const documents = await uploadTestDocuments(user.id, [
      'contract.pdf',
      'invoice.jpg',
      'report.docx'
    ]);

    // 3. Document organization
    const bundle = await createDocumentBundle(user.id, 'Legal Documents');
    await addDocumentsToBundle(documents, bundle.id);

    // 4. Search and discovery
    const searchResults = await searchDocuments(user.id, 'contract');
    expect(searchResults.documents).toHaveLength(1);

    // 5. Document sharing
    const shareLink = await shareDocument(documents[0].id, 'read-only');
    expect(shareLink).toBeDefined();

    // 6. Version management
    const newVersion = await uploadDocumentVersion(documents[0].id, 'contract_v2.pdf');
    const versionHistory = await getDocumentVersions(documents[0].id);
    expect(versionHistory).toHaveLength(2);

    // 7. Recovery testing
    await testBackupRecovery(user.id);
    await testGuardianRecovery(user.id);

    // 8. Performance validation
    const performanceMetrics = await getPerformanceMetrics();
    expect(performanceMetrics.encryptionTime).toBeLessThan(2000);
    expect(performanceMetrics.searchTime).toBeLessThan(500);
  });
});
```

#### Testing Scenarios
- **Complete Workflow**: Test entire user journey from setup to recovery
- **Multi-User**: Test multiple users with shared documents
- **Load Testing**: Test system under high load
- **Failover Testing**: Test system recovery from failures
- **Data Integrity**: Test data integrity across all operations

## Implementation Examples

### React Hook for Document Management
```typescript
export const useDocumentVault = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadDocument = async (file: File, metadata: DocumentUploadMetadata) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const document = await documentService.uploadDocument(file, metadata);
      setDocuments(prev => [...prev, document]);
      return document;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const downloadDocument = async (documentId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const blob = await documentService.downloadDocument(documentId);
      return blob;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const searchDocuments = async (query: string, filters?: DocumentFilters) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const results = await documentService.searchDocuments({ query, filters });
      return results;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    documents,
    isLoading,
    error,
    uploadDocument,
    downloadDocument,
    searchDocuments
  };
};
```

### Sofia AI Integration
```typescript
export const useSofiaAI = () => {
  const analyzeDocument = async (document: Document) => {
    const analysis = await sofiaAI.analyzeDocument({
      text: document.ocrText,
      metadata: document.extractedMetadata,
      userContext: await getUserContext(document.userId)
    });

    return {
      category: analysis.category,
      importance: analysis.importance,
      summary: analysis.summary,
      suggestions: analysis.suggestions,
      confidence: analysis.confidence
    };
  };

  const generateInsights = async (documents: Document[]) => {
    const insights = await sofiaAI.generateInsights({
      documents,
      userContext: await getUserContext(documents[0].userId)
    });

    return insights;
  };

  const provideGuidance = async (userAction: string, context: any) => {
    const guidance = await sofiaAI.provideGuidance({
      action: userAction,
      context,
      userPreferences: await getUserPreferences(context.userId)
    });

    return guidance;
  };

  return {
    analyzeDocument,
    generateInsights,
    provideGuidance
  };
};
```

### Error Handling and Recovery
```typescript
export class DocumentVaultErrorHandler {
  async handleError(error: Error, context: ErrorContext): Promise<ErrorHandlingResult> {
    const errorClassification = await this.classifyError(error, context);
    
    if (errorClassification.retryable) {
      const recoveryResult = await this.attemptRecovery(error, context);
      if (recoveryResult.success) {
        return { success: true, data: recoveryResult.data };
      }
    }

    if (errorClassification.requiresManualRecovery) {
      await this.initiateManualRecovery(error, context);
    }

    await this.logError(error, context, errorClassification);
    await this.notifyUser(error, context, errorClassification);

    return { success: false, error: errorClassification };
  }

  private async classifyError(error: Error, context: ErrorContext): Promise<ErrorClassification> {
    if (error instanceof NetworkError) {
      return {
        type: 'network',
        retryable: true,
        userMessage: 'Network connection lost. Retrying...',
        recoverySteps: ['Check internet connection', 'Try again in a moment'],
        requiresManualRecovery: false
      };
    }

    if (error instanceof EncryptionError) {
      return {
        type: 'encryption',
        retryable: false,
        userMessage: 'Document encryption failed. Please try again.',
        recoverySteps: ['Check file integrity', 'Try uploading again'],
        requiresManualRecovery: true
      };
    }

    if (error instanceof StorageError) {
      return {
        type: 'storage',
        retryable: true,
        userMessage: 'Storage service temporarily unavailable.',
        recoverySteps: ['Retrying upload...', 'Contact support if issue persists'],
        requiresManualRecovery: false
      };
    }

    return {
      type: 'unknown',
      retryable: false,
      userMessage: 'An unexpected error occurred.',
      recoverySteps: ['Contact support for assistance'],
      requiresManualRecovery: true
    };
  }
}
```

## Performance Benchmarks

### Encryption Performance
- **Small files (<1MB)**: <500ms encryption time
- **Medium files (1-10MB)**: <2s encryption time
- **Large files (10-100MB)**: <10s encryption time
- **Very large files (>100MB)**: <30s encryption time

### Storage Performance
- **Upload speed**: >10MB/s for files <100MB
- **Download speed**: >20MB/s for files <100MB
- **Metadata queries**: <100ms response time
- **Search queries**: <500ms response time

### User Experience Metrics
- **Page load time**: <2s for document list
- **Upload progress**: Real-time updates every 100ms
- **Search results**: Displayed within 500ms
- **Document preview**: Generated within 1s

## Security Testing

### Encryption Validation
- **Key generation**: Cryptographically secure random keys
- **Encryption strength**: XSalsa20-Poly1305 with 256-bit keys
- **Key derivation**: PBKDF2 with 100,000 iterations
- **Nonce uniqueness**: Unique nonces for each encryption operation

### Access Control Testing
- **RLS policies**: All policies tested and validated
- **Authentication**: JWT token validation
- **Authorization**: Role-based access control
- **Session management**: Secure session handling

### Data Protection
- **Data encryption**: All sensitive data encrypted
- **Key storage**: Keys stored securely with proper access controls
- **Audit logging**: All operations logged and monitored
- **Data retention**: Proper data lifecycle management

## Load Testing

### Concurrent Users
- **100 concurrent users**: System handles without degradation
- **500 concurrent users**: System maintains performance
- **1000 concurrent users**: System degrades gracefully

### File Operations
- **100 simultaneous uploads**: All complete successfully
- **500 simultaneous downloads**: All complete within 30s
- **1000 simultaneous searches**: All complete within 1s

### Storage Operations
- **10GB total storage**: System handles efficiently
- **100GB total storage**: System maintains performance
- **1TB total storage**: System scales appropriately

## Monitoring and Alerting

### Key Metrics
- **System health**: CPU, memory, disk usage
- **Performance**: Response times, throughput
- **Errors**: Error rates, failure patterns
- **Security**: Failed access attempts, suspicious activity

### Alerting Thresholds
- **Performance**: Response time > 5s
- **Errors**: Error rate > 1%
- **Storage**: Quota utilization > 80%
- **Security**: Failed access attempts > 5

### Dashboard Metrics
- **User engagement**: Active users, document counts
- **System performance**: Response times, throughput
- **Storage usage**: Total storage, growth rate
- **Security events**: Failed access, suspicious activity