# Time Capsule Legacy System - Quick Start Guide

## Overview

This guide provides quick start instructions for testing and validating the Time Capsule Legacy System implementation. It includes user flows, testing scenarios, and validation checklists.

### Security notes

- The Supabase service role key must be used only in server-side contexts (e.g., Edge Functions); never expose it to the browser.
- Use your deployment platform's secret manager for production.
- Do not log Authorization or token headers.

### Security & RLS verification

- Confirm all time capsule tables have RLS enabled and policies in place; write owner vs guardian tests per 005-auth-rls-baseline.
- Verify tokens are stored as hashes (no raw tokens) and are single-use with enforced expiry.
- Ensure structured logs in Edge Functions include a correlation ID; simulate a critical error and confirm a Resend email alert; no Sentry.

## Prerequisites

### Environment Setup

- [ ] Schwalbe development environment running
- [ ] Supabase project configured with time capsule migrations
- [ ] Resend email service configured for test mode
- [ ] Test user accounts created
- [ ] Browser with MediaRecorder API support (Chrome, Firefox, Safari)

### Test Data Setup

- [ ] Create test guardians for recipient selection
- [ ] Set up Family Shield test scenarios
- [ ] Configure test email addresses for delivery validation
- [ ] Prepare sample video/audio files for testing

## Time Capsule Testing Scenarios

### 1) Video Recording & Processing - record and process video message

**Objective**: Validate complete video recording pipeline with processing and accessibility

**Steps**:

1. Access RecordingStep component with MediaRecorder API
2. Grant camera/microphone permissions for cross-browser compatibility
3. Start/stop/pause video recording with real-time preview
4. Process video with encoding, compression, and thumbnail generation
5. Validate file size, duration, and quality with accessibility features
6. Test mobile video recording on React Native app

**Expected Results**:

- [ ] MediaRecorder API initializes across Chrome, Firefox, Safari
- [ ] Real-time preview displays with <2s initialization time
- [ ] Video compression works (WebM/OGG formats under 100MB)
- [ ] Thumbnail generation completes with Canvas API
- [ ] Quality validation passes (duration 10s-5min, size limits)
- [ ] Screen reader support and keyboard navigation functional
- [ ] Mobile recording works with native camera integration

### 2) Video Recording - record video message

**Objective**: Test MediaRecorder API integration and video processing

**Steps**:

1. Access RecordingStep component
2. Grant camera/microphone permissions
3. Start/stop/pause video recording
4. Preview recorded content
5. Process video with compression

**Expected Results**:

- [ ] MediaRecorder API initializes
- [ ] Real-time preview displays
- [ ] Recording controls functional
- [ ] Video compression works
- [ ] File size optimization applied

### 3) Scheduled Delivery System - configure and test delivery scheduling

**Objective**: Validate comprehensive scheduling system with date-based and emergency triggers

**Steps**:

1. Access DeliveryStep component with calendar integration
2. Set future delivery date with validation (no past dates)
3. Configure Family Shield emergency activation trigger
4. Test cron job scheduling via Supabase Edge Functions
5. Validate email delivery system with Resend API integration
6. Monitor delivery status tracking and confirmation

**Expected Results**:

- [ ] Date picker functional with calendar integration
- [ ] Family Shield integration triggers emergency delivery
- [ ] Cron job automation processes scheduled deliveries
- [ ] Email delivery via Resend with premium templates
- [ ] Real-time status tracking shows delivery progress
- [ ] Error handling and retry logic functional

### 4) Delivery Testing - test delivery system

**Objective**: Validate time-capsule-delivery Edge Function

**Steps**:

1. Create capsule with immediate delivery
2. Trigger time-capsule-delivery function
3. Monitor delivery status
4. Check email delivery via Resend
5. Verify recipient access with token

**Expected Results**:

- [ ] Edge function executes
- [ ] Delivery status updates
- [ ] Email sent successfully
- [ ] Access token generated
- [ ] TimeCapsuleView loads correctly

### 5) Video Processing - test video processing pipeline

**Objective**: Test complete video processing workflow

**Steps**:

1. Upload video file to time_capsule_storage
2. Process with encoding/compression
3. Generate thumbnail automatically
4. Validate video quality and metadata
5. Store encrypted content

**Expected Results**:

- [ ] Video upload completes
- [ ] Processing pipeline executes
- [ ] Thumbnail generation works
- [ ] Quality validation passes
- [ ] Encrypted storage confirmed

### 6) Video Encryption & Privacy - test zero-knowledge architecture

**Objective**: Validate comprehensive video encryption and privacy protection system

**Steps**:

1. Upload video content through secure file upload system
2. Verify TweetNaCl client-side encryption applied before storage
3. Test key derivation from user passphrase with secure algorithms
4. Validate zero-knowledge architecture (server cannot decrypt content)
5. Test decryption process for authorized access with access tokens
6. Check RLS policies enforcement and audit logging
7. Validate key rotation and backup mechanisms
8. Test privacy controls with token expiration and revocation

**Expected Results**:

- [ ] Client-side TweetNaCl encryption applied before upload
- [ ] Secure key derivation from user passphrase functional
- [ ] Zero-knowledge architecture maintained (server cannot decrypt)
- [ ] Authorized decryption works with proper access tokens
- [ ] RLS policies prevent unauthorized access
- [ ] Comprehensive audit logging captures all access events
- [ ] Key rotation and backup mechanisms operational
- [ ] Privacy controls with token expiration functional

### 7) Legacy Preservation Features - test Phase 2G legacy content management

**Objective**: Validate comprehensive legacy preservation system with versioned snapshots

**Steps**:

1. Create versioned snapshot of time capsule with timestamp and label
2. Access legacy view interface with diff capabilities
3. Test snapshot restoration and read-only legacy access
4. Verify legacy content organization with tags and categories
5. Check retention policies and data lifecycle management
6. Test legacy analytics tracking usage patterns
7. Validate legacy content migration from Hollywood

**Expected Results**:

- [ ] Versioned snapshots created with proper metadata
- [ ] Legacy views accessible with diff visualization
- [ ] Read-only access controls enforced
- [ ] Content organization with hierarchical structure
- [ ] Retention policies applied automatically
- [ ] Legacy analytics track usage patterns
- [ ] Hollywood migration preserves legacy data integrity

### 8) Emotional Support System - test Sofia AI integration and guidance

**Objective**: Validate comprehensive emotional support system throughout user journey

**Steps**:

1. Access creation wizard with Sofia AI personality system
2. Test contextual guidance during recipient selection and delivery setup
3. Verify emotional support prompts during video recording process
4. Check milestone celebrations and user confidence building
5. Validate user sentiment tracking and adaptive personality responses
6. Test recording tips and encouragement during video capture
7. Verify premium recipient experience with emotional impact design

**Expected Results**:

- [ ] Sofia AI contextual guidance appears at each step
- [ ] Adaptive personality system (empathetic/pragmatic) functional
- [ ] Emotional support prompts relevant to user emotional state
- [ ] Milestone celebrations trigger with appropriate animations
- [ ] User sentiment tracking captures emotional responses
- [ ] Recording encouragement and tips provided during capture
- [ ] Premium recipient experience maintains emotional connection

### 9) Hollywood Integration - test migrated components

**Objective**: Validate Hollywood time capsule system integration

**Steps**:

1. Test time-capsule-test-preview function
2. Verify family-shield-time-capsule-trigger
3. Check TimeCapsuleList component
4. Test time_capsules table operations
5. Validate storage bucket policies

**Expected Results**:

- [ ] Test preview function works
- [ ] Emergency trigger functional
- [ ] UI components render correctly
- [ ] Database operations successful
- [ ] Storage policies enforced

### 10) Delivery Testing & Validation - comprehensive delivery system testing

**Objective**: Validate automated delivery system with error handling and monitoring

**Steps**:

1. Create capsule with future delivery date and trigger configuration
2. Test time-capsule-delivery Edge Function with cron job automation
3. Verify email delivery via Resend API with premium templates
4. Test family-shield-time-capsule-trigger for emergency activation
5. Check recipient access with secure token validation
6. Validate delivery status tracking and error handling
7. Test retry logic and failure recovery mechanisms
8. Monitor delivery performance metrics and success rates

**Expected Results**:

- [ ] Automated delivery triggered by cron jobs
- [ ] Email delivery via Resend with premium templates
- [ ] Emergency triggers activate immediate delivery
- [ ] Secure token-based recipient access functional
- [ ] Real-time status tracking and updates
- [ ] Error handling with retry logic operational
- [ ] Performance monitoring captures delivery metrics
- [ ] Audit logs track all delivery events

### 11) Video Accessibility Features - WCAG 2.1 AA compliance testing

**Objective**: Validate video accessibility features and screen reader support

**Steps**:

1. Access video recording interface with screen reader enabled
2. Test keyboard navigation for all video controls
3. Verify ARIA labels and descriptions for video elements
4. Test high contrast mode and reduced motion preferences
5. Validate video player controls with accessibility features
6. Check thumbnail generation includes alt text and descriptions
7. Test video playback with screen reader announcements

**Expected Results**:

- [ ] Screen reader support for all video interfaces
- [ ] Full keyboard navigation without mouse dependency
- [ ] ARIA labels and descriptions properly implemented
- [ ] High contrast mode compatibility verified
- [ ] Reduced motion preferences respected
- [ ] Video player accessible with proper controls
- [ ] Thumbnail alt text and descriptions functional

### 12) Legacy Analytics & Monitoring - usage tracking and insights

**Objective**: Validate comprehensive analytics and monitoring system

**Steps**:

1. Track creation patterns and user engagement metrics
2. Monitor video processing performance and delivery times
3. Analyze emotional impact through recipient response tracking
4. Test security monitoring for access patterns and incidents
5. Validate business intelligence for feature optimization
6. Check system performance monitoring and alerting
7. Test usage analytics for legacy content interactions

**Expected Results**:

- [ ] Creation patterns and engagement metrics tracked
- [ ] Video processing performance monitored
- [ ] Emotional impact analytics functional
- [ ] Security monitoring detects access patterns
- [ ] Business intelligence provides actionable insights
- [ ] System performance monitoring operational
- [ ] Legacy content usage analytics working

### 13) Mobile Video Recording - React Native camera integration

**Objective**: Validate mobile video recording with native camera capabilities

**Steps**:

1. Access mobile app video recording on iOS and Android devices
2. Test native camera integration with React Native Camera
3. Verify cross-platform compatibility and consistent UX
4. Test offline recording capabilities without internet connectivity
5. Validate mobile-specific compression and quality optimization
6. Check touch interactions and gesture-based controls
7. Test mobile video upload and synchronization

**Expected Results**:

- [ ] Native camera integration functional on both platforms
- [ ] Cross-platform compatibility maintained
- [ ] Offline recording works without connectivity
- [ ] Mobile-optimized compression and quality settings
- [ ] Touch interactions and gestures responsive
- [ ] Video upload and sync with main application

### 14) Legacy Content Management - content organization and archival

**Objective**: Validate legacy content management with organization and lifecycle features

**Steps**:

1. Test hierarchical content organization with tags and categories
2. Verify version control with snapshot management and diff visualization
3. Check role-based permissions for legacy content sharing
4. Test automated archival processes and cleanup mechanisms
5. Validate legacy content migration tools from Hollywood
6. Test search and filtering capabilities for legacy content
7. Check retention policies and data lifecycle management

**Expected Results**:

- [ ] Hierarchical organization with tags and categories
- [ ] Version control with snapshot diff visualization
- [ ] Role-based permissions for content sharing
- [ ] Automated archival and cleanup processes
- [ ] Hollywood migration tools preserve data integrity
- [ ] Search and filtering capabilities functional
- [ ] Retention policies applied correctly

### 15) End-to-End Test - complete legacy workflow

**Objective**: Test complete time capsule legacy journey

**Steps**:

1. Create time capsule with all features
2. Configure delivery and encryption
3. Record emotional video message
4. Test preview functionality
5. Trigger and verify delivery
6. Confirm recipient emotional experience

**Expected Results**:

- [ ] Complete workflow functional
- [ ] All Hollywood components integrated
- [ ] Video processing pipeline complete
- [ ] Scheduling system operational
- [ ] Legacy preservation achieved
- [ ] Emotional impact validated

### Test Scenario 2: Test Preview Functionality

**Objective**: Validate test preview email functionality

**Steps**:

1. Create a time capsule (follow Scenario 1)
2. In the capsule list, find the new capsule
3. Click the "Test Preview" button
4. Check test email in inbox
5. Click the viewing link in the email
6. Verify capsule content displays correctly

**Expected Results**:

- [ ] Test preview email sent successfully
- [ ] Email formatting matches design specifications
- [ ] Viewing link works and loads capsule
- [ ] Media plays correctly in browser
- [ ] Security token validation works

### Test Scenario 3: Scheduled Delivery

**Objective**: Test automated delivery system

**Steps**:

1. Create time capsule with delivery date set to current time + 1 minute
2. Wait for delivery processing (or trigger manually)
3. Check recipient email for delivery notification
4. Click viewing link and verify access
5. Check capsule status in management interface

**Expected Results**:

- [ ] Delivery triggers at correct time
- [ ] Email notification sent to recipient
- [ ] Capsule status updates to "DELIVERED"
- [ ] Viewing link provides secure access
- [ ] Audit logs record delivery event

### Test Scenario 4: Family Shield Integration

**Objective**: Test emergency delivery activation

**Steps**:

1. Create time capsule with "Family Shield Activation" delivery
2. Simulate Family Shield activation (or trigger manually)
3. Verify capsule delivery is triggered
4. Check emergency notification emails
5. Validate guardian access to capsule

**Expected Results**:

- [ ] Family Shield activation triggers delivery
- [ ] Emergency notifications sent appropriately
- [ ] Guardians receive access notifications
- [ ] Capsule status updates correctly
- [ ] Audit trail captures emergency activation

## Component Testing

### TimeCapsuleWizard Component

**Test Cases**:

- [ ] **Step Navigation**: Forward/backward navigation works correctly
- [ ] **Form Validation**: Required fields validated, error messages clear
- [ ] **Progress Indicator**: Visual progress updates with step changes
- [ ] **Responsive Design**: Works on mobile and desktop screens
- [ ] **Error Handling**: Network errors handled gracefully
- [ ] **State Persistence**: Form data preserved on navigation

### RecordingStep Component

**Test Cases**:

- [ ] **Permissions**: Camera/microphone permission requests work
- [ ] **Recording Start**: Recording begins immediately after permission
- [ ] **Real-time Preview**: Live video feed displays during recording
- [ ] **Controls**: Play/pause/stop controls function correctly
- [ ] **File Validation**: Size limits enforced, format validation works
- [ ] **Thumbnail Generation**: Video thumbnails created automatically

### TimeCapsuleList Component

**Test Cases**:

- [ ] **Visual Design**: Seal design displays correctly
- [ ] **Status Display**: Pending/Delivered/Failed states show properly
- [ ] **Actions**: Test Preview, Edit, Delete buttons functional
- [ ] **Filtering**: Status and date filtering works
- [ ] **Pagination**: Large lists paginate correctly
- [ ] **Empty State**: Proper messaging when no capsules exist

## API Testing

### Time Capsule CRUD Operations

**Create Capsule**:

```bash
POST /time_capsules
{
  "user_id": "test-user-id",
  "recipient_name": "Test Recipient",
  "recipient_email": "test@example.com",
  "delivery_condition": "ON_DATE",
  "delivery_date": "2024-12-25T00:00:00Z",
  "message_title": "Test Capsule",
  "message_preview": "Test message preview"
}
```

**Expected Response**:

- Status: 201 Created
- Body contains capsule ID and all submitted data
- Database record created with correct values

**Retrieve Capsules**:

```bash
GET /time_capsules?user_id=test-user-id
```

**Expected Response**:

- Status: 200 OK
- Array of user's capsules
- Proper data structure and field mapping

### File Upload Testing

**Upload Recording**:

```bash
POST /storage/time-capsules
Content-Type: multipart/form-data
Body: video_file, metadata
```

**Expected Results**:

- [ ] File uploaded successfully to Supabase Storage
- [ ] Proper file naming convention (user_id/timestamp.ext)
- [ ] Encryption applied if configured
- [ ] Database storage_path updated correctly

### Edge Function Testing

**Delivery Function**:

```bash
POST /functions/time-capsule-delivery
```

**Expected Results**:

- [ ] Function executes without errors
- [ ] Ready capsules identified correctly
- [ ] Email notifications sent
- [ ] Database status updated
- [ ] Audit logs created

## Security Testing

### Access Control Testing

**Unauthorized Access**:

- [ ] Users cannot access other users' capsules
- [ ] Invalid tokens return 403 Forbidden
- [ ] Expired tokens properly rejected
- [ ] RLS policies prevent data leakage

**File Security**:

- [ ] Storage policies enforce user-based access
- [ ] Encrypted files cannot be accessed without proper keys
- [ ] Signed URLs expire correctly
- [ ] Public access limited to delivered capsules

### Encryption Validation

**Client-side Encryption**:

- [ ] Files encrypted before upload
- [ ] Encryption keys properly derived
- [ ] Decryption works for authorized access
- [ ] Key rotation handled correctly

## Performance Testing

### Load Testing Scenarios

**Concurrent Users**:

- [ ] 10 users creating capsules simultaneously
- [ ] File upload performance under load
- [ ] Database query performance
- [ ] Edge function execution times

**Media Operations**:

- [ ] Recording initialization < 2 seconds
- [ ] File upload completion < 30 seconds for 100MB
- [ ] Page load times < 3 seconds
- [ ] Media playback starts < 1 second

### Browser Compatibility

**Supported Browsers**:

- [ ] Chrome: Full functionality
- [ ] Firefox: Full functionality
- [ ] Safari: Full functionality
- [ ] Edge: Full functionality

**Mobile Browsers**:

- [ ] iOS Safari: Core functionality
- [ ] Chrome Mobile: Core functionality
- [ ] Samsung Internet: Core functionality

## Error Handling Validation

### Network Error Scenarios

**Upload Failures**:

- [ ] Network interruption during upload
- [ ] Server error responses
- [ ] File size exceeded
- [ ] Invalid file format

**Recovery Mechanisms**:

- [ ] Automatic retry logic
- [ ] User-friendly error messages
- [ ] Partial upload resumption
- [ ] Graceful degradation

### Validation Error Scenarios

**Form Validation**:

- [ ] Required fields missing
- [ ] Invalid email formats
- [ ] Past delivery dates
- [ ] File size violations

**Business Logic Errors**:

- [ ] Duplicate capsule creation
- [ ] Invalid recipient data
- [ ] Delivery condition conflicts
- [ ] Storage quota exceeded

## Integration Testing

### Sofia AI Integration

**Creation Guidance**:

- [ ] AI provides contextual help during creation
- [ ] Emotional support messages appear appropriately
- [ ] Recording tips offered at correct times
- [ ] Progress encouragement messages

### Document Vault Integration

**Encryption Consistency**:

- [ ] Same encryption patterns used
- [ ] Key management integration works
- [ ] Storage policies aligned
- [ ] Access controls consistent

### Family Collaboration Integration

**Guardian Selection**:

- [ ] Existing guardians appear in dropdown
- [ ] Guardian data populates correctly
- [ ] Emergency access integration works
- [ ] Notification preferences respected

## Automated Testing Setup

### Unit Test Structure

```text
specs/013-time-capsule-legacy/
├── __tests__/
│   ├── components/
│   │   ├── TimeCapsuleWizard.test.tsx
│   │   ├── RecordingStep.test.tsx
│   │   └── TimeCapsuleList.test.tsx
│   ├── services/
│   │   ├── TimeCapsuleService.test.ts
│   │   ├── StorageService.test.ts
│   │   └── EmailService.test.ts
│   ├── utils/
│   │   ├── encryption.test.ts
│   │   ├── validation.test.ts
│   │   └── fileProcessing.test.ts
│   └── integration/
│       ├── delivery-flow.test.ts
│       └── security.test.ts
```

### Test Data Fixtures

**Sample Capsule Data**:

```typescript
export const sampleCapsule = {
  id: 'test-capsule-id',
  user_id: 'test-user-id',
  recipient_name: 'Test Recipient',
  recipient_email: 'test@example.com',
  delivery_condition: 'ON_DATE',
  delivery_date: '2024-12-25T00:00:00Z',
  message_title: 'Test Time Capsule',
  message_preview: 'This is a test message',
  storage_path: 'test-user-id/1234567890.webm',
  file_type: 'video',
  status: 'PENDING'
};
```

### Mock Services

**Supabase Mock**:

```typescript
export const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn().mockResolvedValue({ data: [], error: null }),
    insert: jest.fn().mockResolvedValue({ data: [sampleCapsule], error: null }),
    update: jest.fn().mockResolvedValue({ data: [sampleCapsule], error: null }),
    delete: jest.fn().mockResolvedValue({ data: null, error: null })
  })),
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
      createSignedUrl: jest.fn().mockResolvedValue({ data: { signedUrl: 'test-url' }, error: null })
    }))
  }
};
```

## End-to-End Test Scenarios

### Complete User Journey

**Happy Path Test**:

1. User logs in
2. Navigates to Time Capsules
3. Creates new capsule
4. Completes all wizard steps
5. Uploads recording successfully
6. Capsule appears in list
7. Test preview works
8. Scheduled delivery triggers
9. Recipient receives email
10. Recipient views capsule successfully

**Error Path Test**:

1. User attempts creation without permissions
2. Network fails during upload
3. Invalid file format uploaded
4. Delivery fails and retries
5. User recovers from errors gracefully

## Monitoring & Debugging

### Key Metrics to Monitor

**Performance Metrics**:

- Page load times
- Recording initialization time
- File upload duration
- Database query execution time
- Edge function execution time

**Error Metrics**:

- Failed uploads percentage
- Delivery failure rate
- Authentication errors
- File access denied errors

**Usage Metrics**:

- Capsules created per day
- Test previews sent
- Delivery success rate
- User session duration

### Debugging Tools

**Browser Developer Tools**:

- Network tab for API calls
- Console for JavaScript errors
- Application tab for storage inspection
- Performance tab for timing analysis

**Supabase Dashboard**:

- Database query logs
- Edge function logs
- Storage bucket monitoring
- Real-time metrics

**Email Service Monitoring**:

- Delivery status tracking
- Bounce and complaint rates
- Open and click tracking

## Troubleshooting Guide

### Common Issues

**Recording Not Working**:

- Check browser permissions
- Verify HTTPS in production
- Test MediaRecorder API support
- Check camera/microphone access

**Upload Failures**:

- Verify file size limits
- Check network connectivity
- Validate Supabase configuration
- Check storage bucket permissions

**Email Delivery Issues**:

- Verify Resend API key
- Check email address format
- Review spam filters
- Validate domain configuration

**Access Denied Errors**:

- Check RLS policies
- Verify user authentication
- Validate access tokens
- Review storage permissions

### Emergency Procedures

**Data Recovery**:

1. Check database backups
2. Verify file integrity in storage
3. Restore from redundant systems
4. Communicate with affected users

**System Outage**:

1. Identify root cause
2. Implement temporary workaround
3. Deploy fix to staging
4. Roll out to production with monitoring

**Security Incident**:

1. Isolate affected systems
2. Preserve evidence for investigation
3. Notify affected users
4. Implement security patches

## Success Criteria Checklist

### Functional Completeness

- [ ] All user flows work end-to-end
- [ ] Error handling covers all scenarios
- [ ] Security requirements fully implemented
- [ ] Performance benchmarks achieved
- [ ] Accessibility standards met

### Quality Assurance

- [ ] Unit test coverage >85%
- [ ] Integration tests passing
- [ ] Cross-browser compatibility verified
- [ ] Mobile responsiveness confirmed
- [ ] Security audit completed

### User Experience

- [ ] Intuitive interface design
- [ ] Clear error messages and help text
- [ ] Responsive performance
- [ ] Emotional impact validated
- [ ] Accessibility features working

### Technical Excellence

- [ ] Clean, maintainable code
- [ ] Comprehensive documentation
- [ ] Proper error handling and logging
- [ ] Scalable architecture
- [ ] Security best practices followed

## Conclusion

This quick start guide provides comprehensive testing and validation procedures for the Time Capsule Legacy System. Following these procedures ensures:

1. **Complete functionality** across all user scenarios
2. **Robust error handling** for production reliability
3. **Security validation** meeting all requirements
4. **Performance optimization** for excellent user experience
5. **Quality assurance** through systematic testing

Regular execution of these test scenarios and monitoring of key metrics will ensure the system maintains high quality and reliability in production.
