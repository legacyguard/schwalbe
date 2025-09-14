# Schwalbe: Time Capsule Legacy System (013)

## Overview

The Time Capsule Legacy System implements a comprehensive solution for creating, storing, and delivering personal video/audio messages that preserve emotional legacy. This premium feature allows users to record meaningful messages for loved ones, scheduled for delivery on specific dates or upon Family Shield activation.

## Key Features

- **Personal Recording**: In-browser video/audio recording with MediaRecorder API
- **Secure Storage**: Encrypted file storage with zero-knowledge architecture
- **Dual Delivery Modes**: Date-based scheduling or Family Shield activation
- **Emotional Design**: Premium UI with "seal" design and unique capsule IDs
- **Test Preview**: Full email preview functionality for user confidence
- **Automated Delivery**: Background processing via Supabase Edge Functions
- **Legacy Preservation**: Emotional impact through video messages and personal stories

## Dependencies

- **001-reboot-foundation**: Monorepo structure and build system
- **003-hollywood-migration**: Core packages and shared services
- **031-sofia-ai-system**: AI-powered guidance and emotional intelligence
- **006-document-vault**: Encrypted storage and key management
- **007-will-creation-system**: Legal document integration
- **025-family-collaboration**: Guardian network management
- **026-professional-network**: Professional consultation features
- **020-emergency-access**: Emergency protocols and document release
- **029-mobile-app**: Cross-platform mobile implementation
- **013-animations-microinteractions**: Emotional design and animations

## Architecture

### System Components

```text
┌─────────────────────────────────────────────────────────────────┐
│                    Time Capsule Legacy System                   │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (React/TypeScript)                                   │
│  ├── TimeCapsuleWizard.tsx (Creation Flow)                     │
│  ├── TimeCapsuleList.tsx (Management Interface)                │
│  ├── TimeCapsuleView.tsx (Public Viewing)                      │
│  └── Wizard Steps (Recipient, Delivery, Recording, Review)     │
├─────────────────────────────────────────────────────────────────┤
│  Database (Supabase PostgreSQL)                                │
│  ├── time_capsules table                                       │
│  ├── storage.objects (encrypted media files)                   │
│  └── RLS Policies for security                                 │
├─────────────────────────────────────────────────────────────────┤
│  Backend Services (Supabase Edge Functions)                    │
│  ├── time-capsule-delivery (Automated delivery)                │
│  └── time-capsule-test-preview (Preview functionality)         │
├─────────────────────────────────────────────────────────────────┤
│  External Services                                              │
│  ├── Resend (Email delivery)                                   │
│  └── MediaRecorder API (Recording)                             │
└─────────────────────────────────────────────────────────────────┘
```

## User Experience Flow

### Creating a Time Capsule

1. **Recipient Selection**: Choose from existing guardians or add new recipient
2. **Delivery Settings**: Select date-based or Family Shield activation
3. **Recording**: In-browser video/audio recording with real-time preview
4. **Review & Seal**: Final review before creating the capsule
5. **Management**: View and manage created capsules with test preview option

### Viewing a Delivered Time Capsule

1. **Email Notification**: Beautiful HTML template with secure viewing link
2. **Secure Access**: Token-based authentication for capsule viewing
3. **Media Playback**: Custom video/audio player with controls
4. **Emotional Experience**: Premium presentation matching email design

## Security Features

- **Client-side Encryption**: All media files encrypted before upload
- **Zero-knowledge Architecture**: Server cannot access decrypted content
- **Row Level Security**: PostgreSQL RLS policies ensure data isolation (owner-first; minimal guardian access via joins; see 005-auth-rls-baseline)
- **Secure File Storage**: Private Supabase storage bucket with user-based access
- **Access Tokens**: UUID-based tokens for secure capsule viewing
- **Audit Logging**: Complete delivery and access tracking

## Success Metrics

### User Experience Metrics

- **Completion Rate**: >70% of users complete time capsule creation
- **Emotional Impact**: >80% of recipients report emotional connection
- **Test Preview Usage**: >60% of creators use test preview feature
- **Delivery Success**: >95% successful automated deliveries

### Technical Metrics

- **Recording Performance**: <2 second recording start time
- **Upload Success**: >98% successful file uploads
- **Delivery Reliability**: >99.5% email delivery success
- **Security Incidents**: Zero data breaches or unauthorized access

## Implementation Status

- [ ] Database schema and migrations
- [ ] Edge Functions for delivery and preview
- [ ] Frontend components and wizard
- [ ] Security implementation and encryption
- [ ] Email templates and notifications
- [ ] Testing and validation
- [ ] Documentation and deployment

## Files in This Specification

- [`spec.md`](spec.md) - Main technical specification
- [`plan.md`](plan.md) - Implementation plan and timeline
- [`data-model.md`](data-model.md) - Database schema and API contracts
- [`quickstart.md`](quickstart.md) - User flows and testing scenarios
- [`tasks.md`](tasks.md) - Detailed development checklist
- [`contracts/`](contracts/) - Interface definitions and contracts

## Related Documentation

- [High-level Plan Phase 10 — Time Capsules](../../docs/high-level-plan.md)
- [Hollywood Time Capsule Implementation](../../hollywood/docs/TIME_CAPSULE_DOCUMENTATION.md)
- [Family Shield Emergency Access](../020-emergency-access/)
- [Document Vault Encryption](../006-document-vault/)
- [Sofia AI Emotional Intelligence](../031-sofia-ai-system/)
