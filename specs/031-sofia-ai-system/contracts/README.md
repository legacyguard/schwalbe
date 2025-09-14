# Sofia AI System - API Contracts

This directory contains API contracts and specifications for the Sofia AI system components.

## Contract Files

### AI Service Contracts

- `ai-service-api.yaml` - OpenAI/Anthropic API integration contracts
- `sofia-core-api.yaml` - Sofia AI core service API contracts
- `personality-api.yaml` - Personality system API contracts
- `memory-api.yaml` - Memory system API contracts

### Animation System Contracts

- `firefly-animation-api.yaml` - Firefly animation system contracts
- `celebration-api.yaml` - Celebration animation system contracts
- `animation-state-api.yaml` - Animation state management contracts

### Context & Guidance Contracts

- `context-detection-api.yaml` - Context detection system contracts
- `guidance-flow-api.yaml` - Guidance flow system contracts
- `proactive-suggestion-api.yaml` - Proactive suggestion system contracts

### Integration Contracts

- `sofia-context-provider-api.yaml` - Sofia context provider contracts
- `sofia-chat-api.yaml` - Sofia chat interface contracts
- `analytics-api.yaml` - Sofia analytics and monitoring contracts

## Contract Standards

All contracts follow OpenAPI 3.0 specification and include:

- Request/response schemas
- Error handling specifications
- Authentication requirements
- Rate limiting information
- Performance requirements
- Accessibility considerations

## Usage

These contracts are used to:

- Generate TypeScript types for client-side integration
- Validate API responses and requests
- Document Sofia AI system capabilities
- Ensure consistency across different implementations
- Support testing and validation

## Validation

All contracts are validated against:

- OpenAPI 3.0 specification
- Sofia AI system requirements
- Performance and accessibility standards
- Security and privacy requirements
