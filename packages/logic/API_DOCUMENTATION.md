# LegacyGuard Centralized API Documentation

## Overview

The LegacyGuard API layer provides a centralized, strongly-typed interface for all backend operations. This eliminates scattered API calls throughout the codebase and ensures consistent error handling, validation, and response transformation.

## Key Benefits

✅ **Type Safety**: Full TypeScript support with Supabase-generated types  
✅ **Error Handling**: Consistent error handling with retry logic  
✅ **Validation**: Automatic request validation and data type checking  
✅ **Single Source of Truth**: All API definitions in one place  
✅ **Better Developer Experience**: Auto-completion and inline documentation  

## Installation & Setup

```typescript
import { createLegacyGuardAPI } from '@legacyguard/logic';
import { apiClient } from './your-api-client';

// Create the centralized API instance
const legacyGuardAPI = createLegacyGuardAPI(apiClient);

// Use individual services
const { documents, guardians, profile, will, legacyItems, analytics } = legacyGuardAPI;
```

## Services Overview

### 1. Document Service (`documents`)

Handles all document-related operations with comprehensive validation and error handling.

#### Document Service Methods

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `upload(request)` | Upload a new document | `DocumentUploadRequest` | `Document` |
| `getAll(params?)` | Get all user documents | `GetDocumentsParams` | `Document[]` |
| `getById(id)` | Get document by ID | `string` (UUID) | `Document` |
| `update(id, data)` | Update document metadata | `string`, `Partial<DocumentUpdate>` | `Document` |
| `delete(id)` | Delete a document | `string` (UUID) | `void` |
| `getByCategory(category)` | Get documents by category | `string` | `Document[]` |
| `getByType(documentType)` | Get documents by type | `string` | `Document[]` |
| `search(query)` | Search documents | `string` (min 2 chars) | `Document[]` |

#### Document Service Usage Examples

```typescript
// Upload a document
const uploadedDocument = await documents.upload({
  file: {
    base64: 'data:application/pdf;base64,JVBERi0xLjQ...',
    mimeType: 'application/pdf',
    fileName: 'will-document.pdf'
  },
  documentType: 'will',
  category: 'legal'
});

// Get all documents with pagination
const userDocuments = await documents.getAll({
  limit: 10,
  offset: 0,
  documentType: 'will'
});

// Get specific document
const document = await documents.getById('123e4567-e89b-12d3-a456-426614174000');

// Update document
const updatedDocument = await documents.update(documentId, {
  title: 'Updated Document Title',
  is_important: true,
  tags: ['urgent', 'review-needed']
});

// Search documents
const searchResults = await documents.search('insurance policy');

// Get documents by category
const legalDocuments = await documents.getByCategory('legal');
```

#### Document Service Error Handling

The Document Service includes comprehensive error handling:

- **Validation Errors** (400): Invalid parameters, missing required fields
- **Authentication Errors** (401/403): Invalid or expired tokens
- **Not Found Errors** (404): Document doesn't exist
- **Server Errors** (500+): Automatic retry with exponential backoff

```typescript
try {
  const document = await documents.getById(invalidId);
} catch (error) {
  if (error instanceof LegacyGuardApiError) {
    console.log('Status:', error.status);
    console.log('Message:', error.message);
    
    if (error.isAuthError()) {
      // Handle authentication error
      redirectToLogin();
    } else if (error.isRetryable()) {
      // Could retry the operation
      showRetryButton();
    }
  }
}
```

### 2. Guardian Service (`guardians`)

Manages trusted circle members and guardians.

#### Guardian Service Methods

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `getAll(params?)` | Get all guardians | `GetGuardiansParams` | `Guardian[]` |
| `create(data)` | Create new guardian | `GuardianInsert` | `Guardian` |
| `update(id, data)` | Update guardian | `string`, `Partial<GuardianUpdate>` | `Guardian` |
| `delete(id)` | Delete guardian | `string` | `void` |
| `getById(id)` | Get guardian by ID | `string` | `Guardian` |
| `setActive(id, isActive)` | Activate/deactivate guardian | `string`, `boolean` | `Guardian` |
| `getActive()` | Get only active guardians | none | `Guardian[]` |

#### Guardian Service Usage Examples

```typescript
// Create a new guardian
const newGuardian = await guardians.create({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1-555-0123',
  relationship: 'Brother',
  is_active: true,
  emergency_contact_priority: 1
});

// Get all active guardians
const activeGuardians = await guardians.getActive();

// Update guardian information
const updatedGuardian = await guardians.update(guardianId, {
  phone: '+1-555-0456',
  notes: 'Updated contact information'
});

// Deactivate a guardian
await guardians.setActive(guardianId, false);
```

### 3. Profile Service (`profile`)

Handles user profile and preferences management.

#### Profile Service Methods

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `get()` | Get current user profile | none | `Profile` |
| `update(data)` | Update profile | `Partial<ProfileUpdate>` | `Profile` |
| `updateAvatar(file)` | Update profile avatar | `FileUpload` | `Profile` |
| `updateEmergencyContacts(contacts)` | Update emergency contacts | `any[]` | `Profile` |
| `updatePreferences(preferences)` | Update user preferences | `any` | `Profile` |

#### Profile Service Usage Examples

```typescript
// Get current user profile
const userProfile = await profile.get();

// Update profile information
const updatedProfile = await profile.update({
  full_name: 'John Smith',
  phone: '+1-555-0123',
  date_of_birth: '1980-01-01'
});

// Update emergency contacts
await profile.updateEmergencyContacts([
  {
    name: 'Jane Doe',
    relationship: 'Spouse',
    phone: '+1-555-0456',
    email: 'jane@example.com'
  }
]);

// Update preferences
await profile.updatePreferences({
  theme: 'dark',
  notifications: true,
  language: 'en'
});
```

### 4. Will Service (`will`)

Manages will and testament data.

#### Will Service Methods

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `get()` | Get current user's will | none | `WillData` |
| `createOrUpdate(data)` | Create or update will | `WillData` | `WillData` |
| `addBeneficiary(beneficiary)` | Add beneficiary | `BeneficiaryData` | `WillData` |
| `removeBeneficiary(name)` | Remove beneficiary | `string` | `WillData` |
| `setExecutor(executor)` | Set will executor | `ExecutorData` | `WillData` |

#### Will Service Usage Examples

```typescript
// Get current will
const currentWill = await will.get();

// Add a beneficiary
await will.addBeneficiary({
  name: 'Sarah Smith',
  relationship: 'Daughter',
  percentage: 50
});

// Set executor
await will.setExecutor({
  name: 'Robert Johnson',
  email: 'robert@example.com',
  phone: '+1-555-0789'
});

// Update entire will
const updatedWill = await will.createOrUpdate({
  beneficiaries: [
    { name: 'Sarah Smith', relationship: 'Daughter', percentage: 60 },
    { name: 'Michael Smith', relationship: 'Son', percentage: 40 }
  ],
  executor: {
    name: 'Robert Johnson',
    email: 'robert@example.com'
  },
  wishes: 'I want to be remembered for my kindness and generosity.'
});
```

### 5. Legacy Items Service (`legacyItems`)

Manages legacy planning tasks and items.

#### Legacy Items Service Methods

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `getAll()` | Get all legacy items | none | `LegacyItem[]` |
| `create(data)` | Create new legacy item | `CreateLegacyItemParams` | `LegacyItem` |
| `update(id, data)` | Update legacy item | `string`, `Partial<LegacyItemUpdate>` | `LegacyItem` |
| `delete(id)` | Delete legacy item | `string` | `void` |
| `getByCategory(category)` | Get items by category | `LegacyItemCategory` | `LegacyItem[]` |
| `getByStatus(status)` | Get items by status | `LegacyItemStatus` | `LegacyItem[]` |
| `markCompleted(id)` | Mark item as completed | `string` | `LegacyItem` |

#### Legacy Items Service Usage Examples

```typescript
// Create a new legacy item
const newItem = await legacyItems.create({
  title: 'Create Digital Asset Inventory',
  description: 'Document all online accounts and digital assets',
  category: 'asset',
  priority: 'high',
  due_date: '2024-03-31',
  tags: ['digital', 'urgent']
});

// Get items by status
const draftItems = await legacyItems.getByStatus('draft');
const completedItems = await legacyItems.getByStatus('completed');

// Mark item as completed
await legacyItems.markCompleted(itemId);

// Get all document-related items
const documentItems = await legacyItems.getByCategory('document');
```

### 6. Analytics Service (`analytics`)

Provides insights and analytics data.

#### Analytics Service Methods

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `getInsights()` | Get AI-generated insights | none | `QuickInsight[]` |
| `getMilestones()` | Get legacy milestones | none | `LegacyMilestone[]` |
| `getProtectionScore()` | Get protection score | none | `{ score: number; trends: any }` |
| `getCompletionPercentage()` | Get completion percentage | none | `{ percentage: number; breakdown: any }` |

#### Analytics Service Usage Examples

```typescript
// Get AI insights
const insights = await analytics.getInsights();
const urgentInsights = insights.filter(insight => insight.priority === 'urgent');

// Get completion milestones
const milestones = await analytics.getMilestones();
const incompleteMilestones = milestones.filter(m => !m.criteria_is_complete);

// Get protection score
const { score, trends } = await analytics.getProtectionScore();
console.log(`Current protection score: ${score}/100`);

// Get overall completion
const { percentage, breakdown } = await analytics.getCompletionPercentage();
console.log(`Overall completion: ${percentage}%`);
```

## Error Handling

### LegacyGuardApiError Class

All API operations use the `LegacyGuardApiError` class for consistent error handling:

```typescript
import { LegacyGuardApiError } from '@legacyguard/logic';

try {
  const result = await documents.getAll();
} catch (error) {
  if (error instanceof LegacyGuardApiError) {
    // Check error type
    if (error.isNetworkError()) {
      showNetworkErrorMessage();
    } else if (error.isAuthError()) {
      redirectToLogin();
    } else if (error.isClientError()) {
      showValidationErrorMessage(error.message);
    }
    
    // Get error details
    console.log('Status:', error.status);
    console.log('Message:', error.message);
    console.log('Details:', error.details);
  }
}
```

### Error Types

| Error Type | Status Codes | Description | Retryable |
|------------|--------------|-------------|-----------|
| Network Error | 0, 500+ | Connection issues | ✅ Yes |
| Authentication Error | 401, 403 | Invalid/expired tokens | ❌ No |
| Client Error | 400-499 | Invalid requests | ❌ No |
| Rate Limit | 429 | Too many requests | ✅ Yes |
| Server Error | 500+ | Server-side issues | ✅ Yes |

### Retry Logic

Failed API calls are automatically retried with exponential backoff:

```typescript
// Automatic retry for retryable errors
const result = await withRetry(
  () => documents.getAll(),
  3, // max retries
  1000, // initial delay (ms)
  'get documents'
);
```

## Validation

### Request Validation

All API methods include comprehensive validation:

- **Required Field Validation**: Ensures all required parameters are provided
- **Type Validation**: Checks data types match expected formats
- **Format Validation**: Validates UUIDs, emails, URLs, dates
- **Business Logic Validation**: Enforces business rules (e.g., search query length)

### Validation Examples

```typescript
// This will throw a validation error
try {
  await documents.getById(''); // Empty ID
} catch (error) {
  // LegacyGuardApiError: Missing required fields: id
}

try {
  await documents.getById('invalid-uuid'); // Invalid UUID format
} catch (error) {
  // LegacyGuardApiError: Document ID must be a valid UUID
}

try {
  await documents.search('a'); // Query too short
} catch (error) {
  // LegacyGuardApiError: Search query must be at least 2 characters long
}
```

## Migration Guide

### Before (Old API Usage)

```typescript
// Scattered API calls throughout the codebase
import { api } from './api/apiClient';

// Documents
const documents = await api.documents.list();
const document = await api.documents.get(id);
await api.documents.upload(file);

// User profile
const profile = await api.user.getProfile();
await api.user.updateProfile(data);
```

### After (New Centralized API)

```typescript
// Single import, strongly typed, with error handling
import { legacyGuardAPI } from './api/legacyGuardAPI';

// Documents - fully typed with validation
const documents = await legacyGuardAPI.documents.getAll();
const document = await legacyGuardAPI.documents.getById(id);
await legacyGuardAPI.documents.upload({ file });

// Profile - consistent interface
const profile = await legacyGuardAPI.profile.get();
await legacyGuardAPI.profile.update(data);
```

## Best Practices

### 1. Always Handle Errors

```typescript
// ✅ Good
try {
  const documents = await legacyGuardAPI.documents.getAll();
  setDocuments(documents);
} catch (error) {
  if (error instanceof LegacyGuardApiError) {
    setErrorMessage(error.message);
  }
}

// ❌ Bad
const documents = await legacyGuardAPI.documents.getAll(); // Unhandled errors
```

### 2. Use TypeScript Features

```typescript
// ✅ Good - leverage TypeScript types
import type { Document, Guardian } from '@legacyguard/logic';

const processDocuments = (docs: Document[]) => {
  return docs.filter(doc => doc.is_important);
};

// ✅ Good - use type guards
if (error instanceof LegacyGuardApiError && error.isAuthError()) {
  handleAuthError();
}
```

### 3. Destructure Services for Cleaner Code

```typescript
// ✅ Good
const { documents, guardians, profile } = legacyGuardAPI;

const userDocuments = await documents.getAll();
const userProfile = await profile.get();

// ❌ Less clean
const userDocuments = await legacyGuardAPI.documents.getAll();
const userProfile = await legacyGuardAPI.profile.get();
```

### 4. Use Specific Methods

```typescript
// ✅ Good - use specific methods
const activeGuardians = await guardians.getActive();
const legalDocuments = await documents.getByCategory('legal');

// ❌ Less efficient - filter on client
const allGuardians = await guardians.getAll();
const activeGuardians = allGuardians.filter(g => g.is_active);
```

## Development and Testing

### Mock API for Testing

```typescript
// Create mock API for testing
import { createLegacyGuardAPI } from '@legacyguard/logic';

const mockApiClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  uploadFile: jest.fn()
};

const mockAPI = createLegacyGuardAPI(mockApiClient);

// Use in tests
test('should get documents', async () => {
  mockApiClient.get.mockResolvedValue({ documents: [] });
  const result = await mockAPI.documents.getAll();
  expect(result).toEqual([]);
});
```

### Environment-Specific Configuration

```typescript
// Different API clients for different environments
const apiClient = process.env.NODE_ENV === 'test' 
  ? mockApiClient 
  : productionApiClient;

const legacyGuardAPI = createLegacyGuardAPI(apiClient);
```

## Performance Considerations

### Caching

Consider implementing caching for frequently accessed data:

```typescript
const cache = new Map();

const getCachedDocuments = async () => {
  const cacheKey = 'user-documents';
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const documents = await legacyGuardAPI.documents.getAll();
  cache.set(cacheKey, documents);
  
  return documents;
};
```

### Pagination

Use pagination for large datasets:

```typescript
const getDocumentsPaginated = async (page: number, pageSize: number = 10) => {
  return legacyGuardAPI.documents.getAll({
    limit: pageSize,
    offset: page * pageSize
  });
};
```

## Support and Troubleshooting

### Common Issues

1. **Import Errors**: Ensure `@legacyguard/logic` is properly installed and built
2. **Type Errors**: Run `npm run build` in the logic package to regenerate types
3. **Network Errors**: Check API client configuration and network connectivity
4. **Validation Errors**: Review the error message for specific field requirements

### Debugging

Enable detailed logging:

```typescript
// The API layer includes comprehensive logging
// Check browser console or server logs for detailed error information

try {
  await legacyGuardAPI.documents.upload(invalidData);
} catch (error) {
  // Error details are automatically logged
  console.log('Full error details:', error.toJSON());
}
```

This centralized API approach provides a robust, type-safe, and maintainable foundation for all LegacyGuard backend operations.
