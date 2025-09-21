# API Versioning Strategy

## Overview

The LegacyGuard API implements semantic versioning with full backward compatibility support. This ensures that existing clients continue to work as the API evolves.

## Version Format

We follow Semantic Versioning (SemVer): `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes that are not backward compatible
- **MINOR**: New features that are backward compatible
- **PATCH**: Bug fixes and minor improvements

## Current Versions

- **Current Version**: 2.1.0
- **Minimum Supported**: 1.0.0
- **Available Versions**:
  - v1.0.0 (Legacy)
  - v2.0.0 (Stable)
  - v2.1.0 (Current)

## Implementation

### Client-Side Usage

#### Basic Usage

```typescript
import { createVersionedClient, API_VERSIONS } from '@packages/logic';

// Use current version (default)
const apiClient = createVersionedClient(baseClient);

// Use specific version
const v1Client = createVersionedClient(baseClient, API_VERSIONS.v1);
```

#### Version Headers

All API requests include version headers:

```http
API-Version: 2.1.0
Accept: application/vnd.legacyguard.v2+json
X-API-Version: 2.1.0
X-Min-Version: 1.0.0
```

### Version Negotiation

The API automatically negotiates the best compatible version:

```typescript
import { VersionNegotiator } from '@packages/logic';

const negotiator = new VersionNegotiator();
const bestVersion = negotiator.negotiate('2.0.0');
```

### Deprecation Management

Track and warn about deprecated features:

```typescript
import { DeprecationManager } from '@packages/logic';

const deprecations = new DeprecationManager();

// Mark feature as deprecated
deprecations.deprecate(
  '/api/v1/documents',
  { major: 2, minor: 0, patch: 0 },
  'This endpoint is deprecated',
  '/api/v2/documents'
);

// Check and warn
deprecations.warn('/api/v1/documents');
// Output: [DEPRECATED] /api/v1/documents: This endpoint is deprecated. Use /api/v2/documents instead. (Deprecated since v2.0.0)
```

### Response Transformation

Automatic transformation for backward compatibility:

```typescript
import { VersionedResponseTransformer } from '@packages/logic';

// Transform v2 response for v1 client
const transformedData = VersionedResponseTransformer.transform(
  responseData,
  clientVersion,
  serverVersion
);
```

## Migration Guide

### Migrating from v1 to v2

#### 1. Update Client Initialization

```typescript
// Old (v1)
const client = new ApiClient();

// New (v2)
import { createVersionedClient, API_VERSIONS } from '@packages/logic';
const client = createVersionedClient(baseClient, API_VERSIONS.v2);
```

#### 2. Handle Field Changes

**v1 Format:**

```json
{
  "user_id": "123",
  "document_id": "456"
}
```

**v2 Format:**

```json
{
  "userId": "123",
  "documentId": "456",
  "newFeature": "value"
}
```

#### 3. Update Endpoint Paths

- v1: `/api/documents` → v2: `/api/v2/documents`
- v1: `/api/users` → v2: `/api/v2/users`
- v1: `/api/will` → v2: `/api/v2/will`

## Backward Compatibility

### Automatic Field Mapping

The system automatically maps fields between versions:

- `userId` ↔ `user_id`
- `documentId` ↔ `document_id`
- `createdAt` ↔ `created_at`

### Feature Detection

Check if features are available:

```typescript
if (version.major >= 2) {
  // Use v2 features
  await api.documents.searchWithAI(query);
} else {
  // Fall back to v1 features
  await api.documents.search(query);
}
```

## Version Lifecycle

### Version Support Timeline

- **v1.0.0**: Legacy (Deprecated, supported until 2025-01-01)
- **v2.0.0**: Stable (Long-term support)
- **v2.1.0**: Current (Active development)

### Deprecation Policy

1. Features are marked deprecated with at least 6 months notice
2. Deprecated features continue to work but log warnings
3. Major version changes require migration guide
4. Breaking changes only in major versions

## Testing

### Version Compatibility Tests

```typescript
describe('API Version Compatibility', () => {
  it('should handle v1 client with v2 server', async () => {
    const v1Client = createVersionedClient(baseClient, API_VERSIONS.v1);
    const response = await v1Client.get('/api/documents');
    expect(response).toHaveV1Format();
  });

  it('should negotiate best version', () => {
    const negotiator = new VersionNegotiator();
    const version = negotiator.negotiate('1.5.0');
    expect(version).toEqual(API_VERSIONS.v1);
  });
});
```

## Best Practices

1. **Always specify version in production**

   ```typescript
   const client = createVersionedClient(baseClient, API_VERSIONS.v2);
   ```

2. **Handle version mismatch errors**

   ```typescript
   try {
     const data = await api.getData();
   } catch (error) {
     if (error.message.includes('version mismatch')) {
       // Handle version incompatibility
     }
   }
   ```

3. **Monitor deprecation warnings**

   ```typescript
   // Set up deprecation monitoring
   console.warn = (message) => {
     if (message.includes('[DEPRECATED]')) {
       // Log to monitoring service
       monitoring.logDeprecation(message);
     }
   };
   ```

4. **Test with multiple versions**

   ```typescript
   const versions = [API_VERSIONS.v1, API_VERSIONS.v2, API_VERSIONS.current];
   versions.forEach(version => {
     test(`works with version ${formatVersion(version)}`, async () => {
       const client = createVersionedClient(baseClient, version);
       // Test functionality
     });
   });
   ```

## Server-Side Implementation

### Express Middleware Example

```typescript
app.use((req, res, next) => {
  const requestedVersion = req.headers['api-version'] || req.headers['x-api-version'];
  const negotiator = new VersionNegotiator();
  const version = negotiator.negotiate(requestedVersion);
  
  // Set version in response headers
  res.setHeader('X-API-Version', formatVersion(version));
  res.setHeader('X-Supported-Versions', negotiator.getSupportedVersionStrings().join(', '));
  
  req.apiVersion = version;
  next();
});
```

### Version-Specific Routes

```typescript
// v1 routes
app.use('/api/v1', requireVersion('1.0.0'), v1Routes);

// v2 routes
app.use('/api/v2', requireVersion('2.0.0'), v2Routes);

// Latest (with version negotiation)
app.use('/api', versionNegotiationMiddleware, currentRoutes);
```

## Monitoring

### Version Usage Metrics

Track which versions are being used:

```typescript
const versionMetrics = {
  'v1.0.0': 0,
  'v2.0.0': 0,
  'v2.1.0': 0
};

// In request handler
versionMetrics[formatVersion(req.apiVersion)]++;
```

### Deprecation Tracking

Monitor deprecated feature usage:

```typescript
const deprecationUsage = new Map();

// Track usage
if (isDeprecated(endpoint)) {
  deprecationUsage.set(endpoint, (deprecationUsage.get(endpoint) || 0) + 1);
}
```

## FAQ

**Q: How do I know which version to use?**
A: Use the current version for new implementations. Use specific versions only for backward compatibility.

**Q: What happens if I don't specify a version?**
A: The API defaults to the current version, but it's recommended to explicitly specify the version.

**Q: How are breaking changes handled?**
A: Breaking changes only occur in major versions. The API maintains backward compatibility within major versions.

**Q: Can I use features from different versions?**
A: No, you must use a consistent version across all API calls in a session.

**Q: How long are old versions supported?**
A: Major versions are supported for at least 12 months after deprecation announcement.

---

*Last Updated: September 2, 2024*
*Version: 2.1.0*
