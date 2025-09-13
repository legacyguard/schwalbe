# i18n & Country Rules - API Contracts

This directory contains API contracts and specifications for the i18n & Country Rules system components.

## Contract Files

### i18n System Contracts

- `i18n-system-api.yaml` - Core i18n system API contracts
- `locale-management-api.yaml` - Locale loading and management contracts
- `translation-key-api.yaml` - Translation key validation and management contracts
- `i18n-health-check-api.yaml` - i18n health check and validation contracts

### Country Rules Contracts

- `country-rules-api.yaml` - Country-specific rules engine contracts
- `language-matrix-api.yaml` - Language availability matrix contracts
- `compliance-validation-api.yaml` - Compliance checking and reporting contracts
- `rule-enforcement-api.yaml` - Rule application and enforcement contracts

### Language Detection Contracts

- `language-detection-api.yaml` - Language detection system contracts
- `geolocation-api.yaml` - IP-based geolocation services contracts
- `auto-switching-api.yaml` - Automatic language switching contracts
- `preference-management-api.yaml` - User language preference contracts

### Translation Management Contracts

- `google-translate-api.yaml` - Google Translate API integration contracts
- `translation-generation-api.yaml` - Background translation generation contracts
- `translation-review-api.yaml` - Human review and approval workflows
- `translation-management-api.yaml` - Admin translation management interface

### Testing & Validation Contracts

- `i18n-testing-api.yaml` - i18n testing framework contracts
- `country-rules-testing-api.yaml` - Country rules testing contracts
- `translation-testing-api.yaml` - Translation quality testing contracts
- `performance-testing-api.yaml` - i18n performance testing contracts

## Contract Standards

All contracts follow OpenAPI 3.0 specification and include:

- Request/response schemas with TypeScript type generation
- Error handling specifications with standardized error codes
- Authentication requirements using existing Clerk integration
- Rate limiting information for translation API calls
- Performance requirements (response times, bundle sizes)
- Accessibility considerations for i18n features
- Localization requirements for API error messages

## Usage

These contracts are used to:

- Generate TypeScript types for client-side i18n integration
- Validate API responses and requests in testing
- Document i18n system capabilities and limitations
- Ensure consistency across different implementation components
- Support automated testing and validation
- Provide API documentation for external integrations

## Validation

All contracts are validated against:

- OpenAPI 3.0 specification compliance
- i18n system requirements and constraints
- Performance and accessibility standards
- Security and privacy requirements
- Country rules compliance requirements
- TypeScript type generation compatibility

## Integration Points

Contracts integrate with existing systems:

- **Supabase**: Database schemas for translations and user preferences
- **Clerk**: Authentication for admin translation management
- **Google Translate API**: External translation service integration
- **Next.js**: App Router and middleware integration points
- **CI/CD**: Automated validation and health checks
