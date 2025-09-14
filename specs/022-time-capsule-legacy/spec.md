# Time Capsule Legacy - Video Messages and Scheduled Delivery

- Implementation of comprehensive time capsule system for emotional legacy preservation
- Builds on Hollywood's proven time capsule architecture with enhanced security and emotional design
- Integrates with Family Shield, Document Vault, and Sofia AI for complete legacy experience
- Prerequisites: 001-reboot-foundation, 003-hollywood-migration, 031-sofia-ai-system, 006-document-vault, 025-family-collaboration, 020-emergency-access completed

## Goals

### Video Recording & Processing Focus

- **Advanced Video Recording**: Implement MediaRecorder API with cross-browser compatibility and real-time preview
- **Video Processing Pipeline**: Build comprehensive encoding, compression, and quality optimization system
- **Mobile Video Recording**: Enable native camera integration for React Native mobile applications
- **Video Accessibility**: Ensure WCAG 2.1 AA compliance with screen reader support and keyboard navigation
- **Quality Validation**: Implement file size, duration, and quality checks with user feedback

### Scheduled Delivery System

- **Date-based Scheduling**: Create robust calendar integration with validation and conflict resolution
- **Family Shield Integration**: Implement emergency activation triggers for immediate delivery
- **Cron Job Automation**: Build Supabase Edge Functions for reliable background processing
- **Delivery Status Tracking**: Provide real-time delivery confirmation and error handling
- **Email Delivery System**: Integrate Resend API with premium templates and delivery tracking

### Video Encryption & Privacy

- **Client-side Encryption**: Implement TweetNaCl for zero-knowledge encryption architecture
- **Key Management System**: Build secure key derivation, rotation, and backup mechanisms
- **Privacy Controls**: Create granular access controls with token expiration and revocation
- **Audit Logging**: Implement comprehensive encryption/decryption tracking for compliance
- **Secure Storage**: Ensure encrypted file storage with user-based access policies

### Legacy Preservation Features

- **Versioned Snapshots**: Implement Phase 2G legacy content management with diff capabilities
- **Legacy Views**: Create UI for browsing and restoring legacy content with read-only access
- **Retention Policies**: Build data lifecycle management with configurable archival rules
- **Legacy Analytics**: Track usage patterns and emotional impact metrics
- **Content Migration**: Ensure smooth transition from Hollywood legacy data

### Emotional Support System

- **Sofia AI Integration**: Provide contextual guidance throughout creation and viewing process
- **Emotional Guidance**: Implement milestone celebrations and user confidence building
- **Recording Support**: Offer tips and encouragement during video recording sessions
- **Recipient Experience**: Create premium viewing experience with emotional impact design
- **User Sentiment Tracking**: Monitor emotional responses and system effectiveness

### Delivery Testing & Validation

- **Automated Testing**: Build comprehensive test suites for delivery system reliability
- **Preview Functionality**: Implement test preview system for user confidence validation
- **Error Handling**: Create robust retry logic and failure recovery mechanisms
- **Performance Monitoring**: Track delivery success rates and system performance metrics
- **Integration Testing**: Validate end-to-end delivery workflows across all scenarios

### Legacy Analytics & Monitoring

- **Usage Analytics**: Track creation patterns, delivery success, and user engagement
- **Emotional Impact Metrics**: Measure recipient responses and legacy value perception
- **Performance Monitoring**: Monitor video processing, delivery times, and system reliability
- **Security Monitoring**: Track access patterns and potential security incidents
- **Business Intelligence**: Provide insights for feature optimization and user experience improvement

### Mobile Video Recording

- **React Native Integration**: Implement native camera APIs for high-quality mobile recording
- **Cross-platform Compatibility**: Ensure consistent experience across iOS and Android devices
- **Offline Capabilities**: Enable recording and storage without internet connectivity
- **Quality Optimization**: Implement mobile-specific compression and quality settings
- **Touch Interactions**: Design mobile-first interface with gesture-based controls

### Legacy Content Management

- **Content Organization**: Build hierarchical organization with tags, categories, and search
- **Version Control**: Implement snapshot management with diff visualization
- **Access Management**: Create role-based permissions for legacy content sharing
- **Archival System**: Develop automated archival and cleanup processes
- **Migration Tools**: Provide tools for importing and organizing legacy Hollywood content

## Non-Goals (out of scope)

- Real-time video calls or live streaming capabilities
- Third-party video processing or advanced editing tools
- Social media integration or public capsule sharing
- Multi-language video recording (English only initially)
- Advanced AI video analysis beyond basic metadata extraction
- Real-time collaboration on capsule creation
- Third-party integrations beyond core Schwalbe services

## Review & Acceptance

- [ ] **Delivery Testing**: Automated delivery system tested with date-based and emergency triggers
- [ ] **Encryption Validation**: Client-side encryption verified with zero-knowledge architecture
- [ ] **Emotional Impact**: User testing validates emotional connection and legacy preservation value
- [ ] **Time Capsule Creation**: Multi-step wizard with recipient selection, delivery settings, and recording
- [ ] **Video Processing**: High-quality video encoding, compression, and secure storage
- [ ] **Scheduled Delivery**: Robust scheduling system for future delivery of time capsules
- [ ] All time capsule tables have RLS enabled; policies tested (owner vs guardian) per 005-auth-rls-baseline
- [ ] Hashed, single-use tokens with expiry; no raw tokens stored or logged
- [ ] Observability baseline: structured logs in Supabase Edge Functions; critical alerts via Resend; no Sentry
- [ ] **Integration Testing**: Seamless integration with Family Shield, Document Vault, and Sofia AI
- [ ] **Performance**: 60fps animations, efficient media handling, and responsive interactions
- [ ] **Error Handling**: Comprehensive error states and recovery flows for delivery failures
- [ ] **Accessibility**: WCAG 2.1 AA compliance for all user interactions

## Dependencies

### Core Dependencies

- **001-reboot-foundation**: Monorepo structure, TypeScript configuration, CI/CD pipeline
- **002-hollywood-migration**: Core packages migration, shared services, and UI components
- **005-sofia-ai-system**: AI-powered guidance for time capsule creation and emotional support
- **006-document-vault**: Encrypted storage patterns, key management, and zero-knowledge architecture
- **008-family-collaboration**: Guardian network integration and recipient management
- **010-emergency-access**: Family Shield integration and emergency delivery triggers

### Supporting Dependencies

- **007-will-creation-system**: Legal document integration for comprehensive legacy planning
- **009-professional-network**: Professional consultation features for complex legacy scenarios
- **011-mobile-app**: Cross-platform mobile implementation and offline capabilities
- **012-animations-microinteractions**: Emotional design animations and micro-interactions

## High-level Architecture

### System Components

```text
┌─────────────────────────────────────────────────────────────────┐
│                    Time Capsule Legacy System                   │
├─────────────────────────────────────────────────────────────────┤
│  Video Recording & Processing Core                              │
│  ├── MediaRecorder API (Cross-browser video/audio capture)     │
│  ├── Real-time encoding (WebRTC/WebCodecs optimization)        │
│  ├── Compression pipeline (WebM/OGG with quality presets)      │
│  ├── Thumbnail generation (Canvas API with accessibility)      │
│  ├── Quality validation (File size/duration/quality checks)    │
│  └── Mobile recording (React Native Camera integration)        │
├─────────────────────────────────────────────────────────────────┤
│  Video Encryption & Privacy System                              │
│  ├── Client-side encryption (TweetNaCl implementation)         │
│  ├── Zero-knowledge architecture (Server cannot decrypt)       │
│  ├── Key management (Secure key derivation & rotation)         │
│  ├── Privacy controls (Access token expiration & revocation)   │
│  └── Audit logging (Complete encryption/decryption tracking)   │
├─────────────────────────────────────────────────────────────────┤
│  Scheduled Delivery System                                       │
│  ├── Date-based scheduling (Calendar integration & validation) │
│  ├── Family Shield triggers (Emergency activation system)      │
│  ├── Cron job processing (Supabase Edge Functions automation)  │
│  ├── Email delivery (Resend API with premium templates)        │
│  └── Status tracking (Real-time delivery confirmation)         │
├─────────────────────────────────────────────────────────────────┤
│  Legacy Preservation & Analytics                                │
│  ├── Versioned snapshots (Phase 2G legacy content management)  │
│  ├── Emotional support (Sofia AI contextual guidance)          │
│  ├── Legacy analytics (Usage patterns & emotional impact)      │
│  ├── Content lifecycle (Retention policies & archival)         │
│  └── Accessibility features (WCAG 2.1 AA video compliance)      │
├─────────────────────────────────────────────────────────────────┤
│  Hollywood Migration Components                                 │
│  ├── time-capsule-delivery (Automated delivery processing)      │
│  ├── time-capsule-test-preview (User confidence testing)       │
│  ├── family-shield-time-capsule-trigger (Emergency integration) │
│  ├── time_capsules table (Database schema with delivery fields) │
│  ├── time_capsule_storage bucket (Encrypted media storage)      │
│  └── UI Components (Wizard, List, View with premium design)     │
└─────────────────────────────────────────────────────────────────┘
```

### Key Technical Decisions

1. **Client-side Encryption**: All media files encrypted before upload using TweetNaCl
2. **Zero-knowledge Architecture**: Server cannot access decrypted content
3. **Dual Delivery Modes**: Date-based scheduling and Family Shield activation
4. **Premium UI Design**: "Seal" metaphor with unique capsule IDs and gradient styling
5. **Edge Function Automation**: Background processing for delivery and notifications
6. **Test Preview System**: Complete email simulation for user confidence
7. **Mobile-first Design**: Responsive web with native mobile app integration

## Security Features

## Baseline Notes: Identity, RLS, Tokens, Observability

- Identity: Supabase Auth is the identity provider; see 005-auth-rls-baseline for conventions and any bridging guidance.
- RLS: Enable RLS on all time capsule tables; default owner-only access; minimal guardian access proved via joins; write positive/negative policy tests.
- Tokens: Store only hashed tokens with `expires_at` and `used_at`; tokens are single-use; URLs contain opaque tokens only; never log tokens.
- Observability: Use structured logs in Supabase Edge Functions and critical email alerts via Resend. Do not use Sentry in this project.

### Authentication & Authorization

- **Supabase Auth**: JWT-based user authentication with session management
- **Row Level Security**: PostgreSQL RLS policies ensure users only access their own capsules
- **Access Tokens**: UUID-based secure tokens for public capsule viewing
- **Guardian Verification**: Multi-step verification for emergency access

### Data Protection

- **Client-side Encryption**: Media files encrypted using TweetNaCl before storage
- **Secure File Storage**: Private Supabase storage bucket with user-based folder structure
- **Encrypted Metadata**: Sensitive capsule information encrypted at rest
- **Temporary Access**: Viewing links expire after 30 days from delivery

### Privacy & Compliance

- **Audit Logging**: Complete tracking of all delivery attempts and access events
- **Data Isolation**: Complete separation between user data and secure access controls
- **GDPR Compliance**: User consent management and data minimization
- **Legal Compliance**: Jurisdiction-aware access controls and retention policies

## User Experience Flow

### Time Capsule Creation Journey

```text
1. Access Creation Flow
   ├── User clicks "Create Time Capsule" from dashboard
   ├── Opens premium wizard modal with progress indicator
   └── Shows emotional guidance from Sofia AI

2. Recipient Selection (Step 1/4)
   ├── Choose from existing guardians or add new recipient
   ├── Validate email format and required fields
   ├── Show relationship context for emotional connection
   └── Sofia AI provides guidance on recipient selection

3. Delivery Settings (Step 2/4)
   ├── Select "On Specific Date" with date picker
   ├── Select "Family Shield Activation" for emergency delivery
   ├── Validate future dates and logical constraints
   └── Preview delivery scenarios with Sofia AI

4. Recording Experience (Step 3/4)
   ├── Choose video or audio recording mode
   ├── Grant camera/microphone permissions
   ├── Real-time preview with recording controls
   ├── Add message title and preview text
   └── Sofia AI provides emotional recording guidance

5. Review & Seal (Step 4/4)
   ├── Complete capsule preview with all details
   ├── Editable fields for final adjustments
   ├── Test preview option to see recipient experience
   ├── Seal animation with unique capsule ID generation
   └── Success confirmation with next steps

6. Post-Creation Management
   ├── Capsule appears in management dashboard
   ├── Status tracking (Pending, Delivered, Failed)
   ├── Test preview functionality
   ├── Edit/delete options (before delivery)
   └── Integration with broader legacy planning
```text

### Recipient Experience Flow

```text
1. Email Notification
   ├── Receives beautifully designed HTML email
   ├── Clear subject line with message title
   ├── Secure viewing link with access token
   └── Sender information and delivery context

2. Secure Viewing Page
   ├── Token-based authentication
   ├── Loads TimeCapsuleView component
   ├── Validates access permissions
   └── Shows premium presentation

3. Media Experience
   ├── Custom video/audio player
   ├── Poster image for videos
   ├── Full playback controls
   ├── Responsive design for all devices
   └── Download prevention for security

4. Emotional Connection
   ├── Message title and sender information
   ├── Creation date and delivery context
   ├── Personal message preview
   └── Premium design maintaining emotional impact
```text

## Integration Points

### Family Shield Integration

- **Emergency Trigger**: Automatic delivery upon Family Shield activation
- **Guardian Network**: Recipients can be existing guardians
- **Emergency Access**: Integration with emergency document release protocols
- **Audit Logging**: Combined audit trails for security compliance

### Document Vault Integration

- **Encryption Patterns**: Consistent client-side encryption approach
- **Storage Architecture**: Shared Supabase Storage bucket patterns
- **Key Management**: Integration with existing key management systems
- **Security Policies**: Unified RLS policies and access controls

### Sofia AI Integration

- **Creation Guidance**: Step-by-step emotional guidance during creation
- **Recording Support**: Encouragement and tips for meaningful recordings
- **Emotional Context**: Understanding user intent and providing appropriate support
- **Legacy Planning**: Integration with broader legacy planning conversations

## Success Metrics

### User Experience Metrics

- **Creation Completion**: >70% of users complete full time capsule creation
- **Emotional Impact**: >80% of recipients report strong emotional connection
- **Test Preview Usage**: >60% of creators use test preview feature
- **Mobile Usage**: >40% of creations happen on mobile devices
- **Satisfaction Score**: >4.2/5 average user satisfaction rating

### Technical Metrics

- **Recording Performance**: <2 second recording initialization time
- **Upload Success Rate**: >98% successful file uploads
- **Delivery Reliability**: >99.5% successful email deliveries
- **Viewing Page Load**: <3 second average load time
- **Security Incidents**: Zero data breaches or unauthorized access

### Business Metrics

- **Feature Adoption**: >25% of premium users create at least one time capsule
- **Legacy Planning**: >60% of time capsule creators also create wills
- **Professional Network**: >15% of complex cases involve professional consultation
- **Retention Impact**: >80% monthly active users with active time capsules

## Risks & Mitigations

### Delivery Failures
- **Email Delivery Issues**: SMTP failures, spam filters, or recipient email problems
  - *Mitigation*: Multiple delivery attempts, fallback notification methods, delivery status tracking
- **Scheduling System Failures**: Cron job failures or timing issues with delivery triggers
  - *Mitigation*: Redundant scheduling systems, manual trigger capabilities, comprehensive logging
- **Edge Function Timeouts**: Supabase Edge Functions timing out during delivery processing
  - *Mitigation*: Optimize function performance, implement retry logic, monitor execution times

### Encryption Issues
- **Client-side Encryption Failures**: Browser compatibility issues with encryption libraries
  - *Mitigation*: Progressive enhancement, fallback encryption methods, comprehensive testing
- **Key Management Problems**: Loss of encryption keys or key derivation failures
  - *Mitigation*: Secure key backup systems, multiple key derivation methods, user education
- **Storage Encryption Bypass**: Potential vulnerabilities in encrypted file storage
  - *Mitigation*: Regular security audits, encryption validation, zero-knowledge architecture

### Emotional Distress
- **User Emotional Overload**: Creating legacy content can be emotionally challenging
  - *Mitigation*: Sofia AI emotional support, optional creation pauses, professional counseling resources
- **Recipient Impact**: Unexpected emotional impact on recipients receiving legacy content
  - *Mitigation*: Clear content warnings, recipient preparation guidance, support resources
- **Privacy Concerns**: Users worried about sensitive legacy content security
  - *Mitigation*: Transparent security explanations, privacy controls, consent management

## References

- **Video Processing**: WebRTC standards, MediaRecorder API, video encoding best practices
- **Scheduling Systems**: Cron job implementations, temporal workflows, reliable scheduling patterns
- **Encryption Standards**: TweetNaCl documentation, client-side encryption patterns, zero-knowledge architecture
- **Hollywood Implementation**: `/Users/luborfedak/Documents/Github/hollywood/docs/TIME_CAPSULE_DOCUMENTATION.md`
- **High-level Plan**: `../../docs/high-level-plan.md` (Phase 10 — Time Capsules, Phase 2G — Time Capsule Plan)
- **Phase 2G Plan**: `../../docs/phase-2G-time-capsule-plan.md` (Legacy features migration)
- **Family Shield Integration**: `../010-emergency-access/spec.md`
- **Document Vault Security**: `../006-document-vault/spec.md`
- **Sofia AI Guidance**: `../005-sofia-ai-system/spec.md`
- **Video Processing Dependencies**: MediaRecorder API, WebRTC, browser compatibility
- **Scheduling Dependencies**: Supabase Edge Functions, cron jobs, temporal patterns

## Cross-links

- See `../001-reboot-foundation/spec.md` for monorepo architecture and build system
- See `../003-hollywood-migration/spec.md` for core package migration and shared services
- See `../031-sofia-ai-system/spec.md` for AI-powered guidance integration
- See `../006-document-vault/spec.md` for encrypted storage patterns
- See `../025-family-collaboration/spec.md` for guardian network integration
- See `../020-emergency-access/spec.md` for emergency delivery triggers
- See `../029-mobile-app/spec.md` for mobile implementation details
- See `../013-animations-microinteractions/spec.md` for emotional design animations

## Linked design docs

- See `plan.md` for detailed implementation phases and timeline
- See `data-model.md` for database schema and API contracts
- See `quickstart.md` for user flows and testing scenarios
- See `tasks.md` for detailed development checklist and acceptance criteria
- See `contracts/` for interface definitions and type contracts
