# Database Types - API Contracts

## Overview

This directory contains the API contracts and interface definitions for the database types system. These contracts define the expected behavior, data structures, and integration points for all database-related operations.

## Contract Files

### 1. database-migration-api.yaml

**Purpose**: Defines the contract for database migration operations

**Key Endpoints**:

- `POST /api/migrations/apply` - Apply pending migrations
- `POST /api/migrations/rollback` - Rollback migrations
- `GET /api/migrations/status` - Get migration status
- `GET /api/migrations/history` - Get migration history

**Data Structures**:

```yaml
MigrationRequest:
  type: object
  properties:
    migrationId:
      type: string
      description: Unique migration identifier
    targetVersion:
      type: string
      description: Target schema version
    dryRun:
      type: boolean
      description: Whether to perform dry run
      default: false

MigrationStatus:
  type: object
  properties:
    status:
      type: string
      enum: [pending, running, completed, failed]
    currentVersion:
      type: string
    targetVersion:
      type: string
    progress:
      type: number
      minimum: 0
      maximum: 100
```

### 2. type-generation-api.yaml

**Purpose**: Defines the contract for TypeScript type generation

**Key Endpoints**:

- `POST /api/types/generate` - Generate types from schema
- `GET /api/types/status` - Get generation status
- `GET /api/types/download` - Download generated types
- `POST /api/types/validate` - Validate generated types

**Data Structures**:

```yaml
TypeGenerationRequest:
  type: object
  properties:
    schemaVersion:
      type: string
      description: Database schema version
    includeViews:
      type: boolean
      description: Include database views
      default: true
    includeFunctions:
      type: boolean
      description: Include database functions
      default: false
    outputFormat:
      type: string
      enum: [typescript, json]
      default: typescript

TypeValidationResult:
  type: object
  properties:
    isValid:
      type: boolean
    errors:
      type: array
      items:
        type: object
        properties:
          file:
            type: string
          line:
            type: number
          column:
            type: number
          message:
            type: string
          severity:
            type: string
            enum: [error, warning, info]
```

### 3. schema-validation-api.yaml

**Purpose**: Defines the contract for schema validation operations

**Key Endpoints**:

- `POST /api/schema/validate` - Validate schema integrity
- `GET /api/schema/constraints` - Get schema constraints
- `POST /api/schema/check-integrity` - Check data integrity
- `GET /api/schema/reports` - Get validation reports

**Data Structures**:

```yaml
SchemaValidationRequest:
  type: object
  properties:
    tables:
      type: array
      items:
        type: string
      description: Tables to validate
    checkConstraints:
      type: boolean
      default: true
    checkReferences:
      type: boolean
      default: true
    checkDataTypes:
      type: boolean
      default: true

ValidationReport:
  type: object
  properties:
    timestamp:
      type: string
      format: date-time
    status:
      type: string
      enum: [passed, failed, warning]
    checks:
      type: array
      items:
        type: object
        properties:
          checkType:
            type: string
          table:
            type: string
          status:
            type: string
            enum: [passed, failed, warning]
          message:
            type: string
          details:
            type: object
```

### 4. data-migration-api.yaml

**Purpose**: Defines the contract for data migration operations

**Key Endpoints**:

- `POST /api/data/migrate` - Execute data migration
- `POST /api/data/transform` - Transform data
- `GET /api/data/status` - Get migration status
- `POST /api/data/rollback` - Rollback data changes

**Data Structures**:

```yaml
DataMigrationRequest:
  type: object
  properties:
    migrationType:
      type: string
      enum: [full, incremental, selective]
    sourceTables:
      type: array
      items:
        type: string
    targetTables:
      type: array
      items:
        type: string
    transformationRules:
      type: object
      description: Data transformation rules
    batchSize:
      type: number
      default: 1000

MigrationProgress:
  type: object
  properties:
    totalRecords:
      type: number
    processedRecords:
      type: number
    failedRecords:
      type: number
    currentTable:
      type: string
    estimatedTimeRemaining:
      type: number
    status:
      type: string
      enum: [running, completed, failed, paused]
```

### 5. database-testing-api.yaml

**Purpose**: Defines the contract for database testing operations

**Key Endpoints**:

- `POST /api/test/run` - Run database tests
- `GET /api/test/results` - Get test results
- `POST /api/test/performance` - Run performance tests
- `GET /api/test/coverage` - Get test coverage

**Data Structures**:

```yaml
TestSuite:
  type: object
  properties:
    name:
      type: string
    type:
      type: string
      enum: [unit, integration, performance, security]
    tests:
      type: array
      items:
        type: object
        properties:
          name:
            type: string
          sql:
            type: string
          expectedResult:
            type: any
          timeout:
            type: number
            default: 30000

TestResult:
  type: object
  properties:
    suiteName:
      type: string
    testName:
      type: string
    status:
      type: string
      enum: [passed, failed, skipped, error]
    duration:
      type: number
    error:
      type: string
    actualResult:
      type: any
    expectedResult:
      type: any
```

## Contract Compliance

### Request/Response Format

All API endpoints follow these conventions:

**Request Format**:

```json
{
  "requestId": "uuid",
  "timestamp": "2025-01-25T10:00:00Z",
  "data": {
    // Request-specific data
  }
}
```

**Response Format**:

```json
{
  "requestId": "uuid",
  "timestamp": "2025-01-25T10:00:00Z",
  "status": "success|error",
  "data": {
    // Response data
  },
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {}
  }
}
```

### Error Handling

**Standard Error Codes**:

- `VALIDATION_ERROR` - Input validation failed
- `DATABASE_ERROR` - Database operation failed
- `MIGRATION_ERROR` - Migration operation failed
- `TYPE_ERROR` - Type generation/validation failed
- `PERMISSION_ERROR` - Insufficient permissions
- `TIMEOUT_ERROR` - Operation timed out

### Authentication & Authorization

All endpoints require authentication via JWT token in Authorization header:

```http
Authorization: Bearer <jwt_token>
```

**Required Permissions**:

- `database:migrate` - Migration operations
- `database:read` - Read operations
- `database:admin` - Administrative operations

## Implementation Notes

### TypeScript Integration

All contracts are designed to work seamlessly with TypeScript:

```typescript
// Generated from contracts
import { MigrationRequest, MigrationStatus } from '@schwalbe/database-types';

// Usage
const request: MigrationRequest = {
  migrationId: 'migration-001',
  targetVersion: '1.2.0',
  dryRun: false
};
```

### Validation

Contracts include runtime validation using Zod schemas:

```typescript
import { z } from 'zod';

export const MigrationRequestSchema = z.object({
  migrationId: z.string().uuid(),
  targetVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
  dryRun: z.boolean().default(false)
});
```

### Testing

Each contract includes comprehensive test scenarios:

```typescript
describe('Migration API', () => {
  it('should apply migration successfully', async () => {
    const request: MigrationRequest = {
      migrationId: 'test-migration',
      targetVersion: '1.0.0'
    };

    const response = await applyMigration(request);
    expect(response.status).toBe('success');
  });
});
```

## Versioning

Contracts follow semantic versioning:

- **MAJOR**: Breaking changes to API structure
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, no API changes

Current version: `1.0.0`

## Future Extensions

### Planned Contracts

1. **real-time-api.yaml** - Real-time database subscriptions
2. **analytics-api.yaml** - Database analytics and monitoring
3. **backup-api.yaml** - Database backup and restore operations
4. **audit-api.yaml** - Database audit logging and compliance

### Extension Points

Contracts include extension points for future enhancements:

```yaml
extensions:
  customValidations:
    type: array
    items:
      type: object
      properties:
        name: string
        rule: string
        severity: string
```

## Support

For questions about these contracts:

- **Technical Issues**: Check implementation in `packages/shared/src/database/`
- **API Documentation**: See generated OpenAPI specs
- **Examples**: Review test files in `packages/shared/src/database/__tests__/`
- **Updates**: Monitor changes in this directory
