# Mobile App API Contracts

This directory contains the API contract specifications for the LegacyGuard mobile application.

## API Contract Files

### mobile-app-api.yaml

Complete OpenAPI 3.0 specification for the mobile application APIs including:

- Authentication endpoints (Clerk integration)
- Document management APIs
- Emergency access protocols
- Push notification services
- Offline sync endpoints
- Biometric authentication APIs

### offline-sync-api.yaml

Detailed specification for offline data synchronization:

- Sync status and conflict resolution
- Background sync protocols
- Data versioning and merging strategies
- Offline queue management
- Network status detection

### push-notification-api.yaml

Push notification service contracts:

- Notification registration and management
- Rich notification content and actions
- Scheduling and delivery tracking
- Platform-specific notification handling
- Privacy and consent management

### biometric-auth-api.yaml

Biometric authentication specifications:

- Device capability detection
- Biometric enrollment and verification
- Fallback authentication methods
- Security key management
- Session binding and timeout

### mobile-security-api.yaml

Security-related API contracts:

- End-to-end encryption protocols
- Key exchange and rotation
- Certificate pinning specifications
- Security audit logging
- Threat detection and response

## Usage

These API contracts serve as the single source of truth for:

- Mobile app backend integration
- API testing and validation
- Documentation generation
- Contract testing implementation
- Cross-platform consistency

## Validation

All API contracts are validated against:

- OpenAPI 3.0 specification compliance
- Security best practices
- Mobile platform requirements
- Offline capability requirements
- Performance and scalability constraints

## Versioning

API contracts follow semantic versioning:

- Major version: Breaking changes
- Minor version: New features (backward compatible)
- Patch version: Bug fixes and documentation updates

## Testing

Contract testing is implemented using:

- Dredd for API contract validation
- Postman/Newman for automated testing
- Custom mobile app integration tests
- Offline sync simulation testing
