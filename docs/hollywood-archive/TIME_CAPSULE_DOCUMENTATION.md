# Time Capsule System Documentation

## Overview

The Time Capsule system is a premium feature of LegacyGuard that allows users to create personal video or audio messages to be delivered to recipients at specific future dates or upon activation of the Family Shield (in case of death). This feature transforms digital messages into emotional, secure "time capsules" that can carry personal messages, final words, or future celebrations to loved ones.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Database Schema](#database-schema)
3. [Frontend Components](#frontend-components)
4. [Backend Services](#backend-services)
5. [User Experience Flow](#user-experience-flow)
6. [Security Features](#security-features)
7. [Email Templates](#email-templates)
8. [API Endpoints](#api-endpoints)
9. [Testing & Quality Assurance](#testing--quality-assurance)
10. [Deployment & Configuration](#deployment--configuration)

## Architecture Overview

### System Components

```text
┌─────────────────────────────────────────────────────────────────┐
│                    Time Capsule System                         │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (React/TypeScript)                                   │
│  ├── TimeCapsule.tsx (Main Dashboard)                          │
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

### Key Features

- **Personal Recording**: In-browser video/audio recording with MediaRecorder API
- **Secure Storage**: Encrypted file storage with Supabase Storage
- **Dual Delivery Modes**: Date-based or Family Shield activation
- **Premium UI**: Visual "seal" design with unique capsule IDs
- **Test Preview**: Full email preview functionality for user confidence
- **Automated Delivery**: Background processing via Edge Functions
- **Responsive Design**: Mobile-first approach with elegant animations

## Database Schema

### Main Table: `time_capsules`

```sql
CREATE TABLE time_capsules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES guardians(id) ON DELETE SET NULL,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  delivery_condition delivery_condition NOT NULL, -- 'ON_DATE' | 'ON_DEATH'
  delivery_date TIMESTAMP WITH TIME ZONE,
  message_title TEXT NOT NULL,
  message_preview TEXT,
  storage_path TEXT NOT NULL,
  file_type VARCHAR(10) NOT NULL CHECK (file_type IN ('video', 'audio')),
  file_size_bytes BIGINT,
  duration_seconds INTEGER,
  thumbnail_path TEXT,
  access_token UUID DEFAULT gen_random_uuid(),
  status capsule_status DEFAULT 'PENDING', -- 'PENDING' | 'DELIVERED' | 'FAILED' | 'CANCELLED'
  is_delivered BOOLEAN DEFAULT false,
  delivered_at TIMESTAMP WITH TIME ZONE,
  delivery_attempts INTEGER DEFAULT 0,
  last_delivery_attempt TIMESTAMP WITH TIME ZONE,
  delivery_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Storage Bucket: `time-capsules`

- **Private bucket** with 100MB file size limit
- **Allowed MIME types**: video/webm, video/mp4, audio/ogg, audio/wav, audio/mp3, image/jpeg, image/png
- **Folder structure**: `{user_id}/{capsule_id}/recording.{ext}`
- **Thumbnail storage**: `{user_id}/{capsule_id}/thumbnail.jpg`

### Row Level Security (RLS)

```sql
-- Users can only access their own capsules
CREATE POLICY "Users can view own time capsules" ON time_capsules
  FOR SELECT USING (auth.uid() = user_id);

-- Public access for delivered capsules (controlled by application logic)
CREATE POLICY "Public access with valid token" ON time_capsules
  FOR SELECT USING (true);

-- Storage policies for user-specific access
CREATE POLICY "Users can upload their own time capsule files"
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'time-capsules' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## Frontend Components

### 1. TimeCapsule.tsx (Main Dashboard)

**Purpose**: Main Time Capsule dashboard with statistics and management interface.

**Key Features**:

- Real-time statistics display (total, pending, delivered, failed)
- Responsive stats cards with purple-pink gradient theming
- Wizard integration for capsule creation
- Empty state with demo video link
- Error handling and loading states

**Props**: None (uses hooks for data fetching)

**Hooks Used**:

- `useAuth()` - Clerk authentication
- `usePageTitle()` - Sets page title
- `useSupabaseWithClerk()` - Database client

### 2. TimeCapsuleWizard.tsx (Creation Flow)

**Purpose**: Multi-step wizard for creating Time Capsules.

**Steps**:

1. **Recipient Selection**: Choose from existing guardians or add new recipient
2. **Delivery Settings**: Select date-based or Family Shield activation
3. **Recording**: In-browser video/audio recording with real-time preview
4. **Review & Seal**: Final review before creating the capsule

**Key Features**:

- Step navigation with progress indicator
- Form validation and error handling
- MediaRecorder API integration
- File upload to Supabase Storage
- Elegant animations and transitions

### 3. TimeCapsuleList.tsx (Management Interface)

**Purpose**: Display and manage created Time Capsules with premium visual design.

**Key Features**:

- **Visual Seal Design**: Each capsule displays as an elegant sealed card
- **Unique Capsule IDs**: 8-character unique identifiers for authenticity
- **Gradient Styling**: Purple-pink gradients with hover effects
- **Status Management**: Pending, Delivered, Failed states
- **Test Preview**: Send test emails to see recipient experience
- **Grouped Display**: Organized by delivery status

**Visual Elements**:

- Seal corner badge with "SEALED" text and shield icon
- Premium gradient borders and animations
- Enhanced avatars with gradient backgrounds
- Delivery information cards with elegant icons

### 4. TimeCapsuleView.tsx (Public Viewing)

**Purpose**: Public viewing page for delivered Time Capsules.

**Key Features**:

- Secure token-based access
- Custom video/audio player with controls
- Beautiful presentation matching email design
- Responsive design for all devices
- Error handling for invalid tokens

### 5. Wizard Steps Components

#### RecipientStep.tsx

- Guardian selection from existing contacts
- New recipient form with validation
- Email format validation
- Relationship field for context

#### DeliveryStep.tsx

- Date picker for scheduled delivery
- Family Shield activation option
- Delivery condition validation
- Future date enforcement

#### RecordingStep.tsx

- MediaRecorder API integration
- Video/audio format selection
- Real-time preview during recording
- File size and duration limits (5 min, 100MB)
- Thumbnail generation for videos

#### ReviewStep.tsx

- Complete capsule preview
- Editable message title and preview
- Recipient and delivery confirmation
- Final submission with loading states

## Backend Services

### 1. time-capsule-delivery Edge Function

**Purpose**: Automated delivery system that runs on schedule to deliver ready capsules.

**Functionality**:

- Checks for capsules ready for delivery (date-based or Family Shield activated)
- Generates secure viewing URLs
- Sends beautifully designed email notifications
- Updates delivery status and tracking
- Handles delivery failures with retry logic

**Trigger**: Cron job or manual invocation
**Location**: `supabase/functions/time-capsule-delivery/index.ts`

### 2. time-capsule-test-preview Edge Function

**Purpose**: Sends test preview emails to users so they can see exactly how their capsule will look when delivered.

**Functionality**:

- Retrieves capsule information
- Generates test email with "TEST PREVIEW" branding
- Uses same template as actual delivery
- Sends to capsule creator's email
- Provides complete recipient experience preview

**Trigger**: User action from frontend
**Location**: `supabase/functions/time-capsule-test-preview/index.ts`

## User Experience Flow

### Creating a Time Capsule

```text
1. User clicks "Create Time Capsule" button
   ├── Opens TimeCapsuleWizard modal
   └── Shows step 1: Recipient Selection

2. Recipient Selection
   ├── Choose existing guardian OR
   └── Add new recipient (name, email, relationship)

3. Delivery Settings
   ├── Select "On Specific Date" (shows date picker) OR
   └── Select "Family Shield Activation" (automatic)

4. Recording
   ├── Choose video or audio recording
   ├── Grant microphone/camera permissions
   ├── Record message (max 5 minutes)
   ├── Preview recording with playback controls
   └── Generate thumbnail (for videos)

5. Review & Seal
   ├── Add message title and preview text
   ├── Review all capsule details
   ├── Click "Seal Time Capsule"
   └── Show success confirmation with unique ID

6. Management
   ├── Capsule appears in list with "SEALED" badge
   ├── Shows delivery date/condition
   ├── Options: Preview Recording, Send Test Preview, Delete
   └── Test Preview sends email showing exact recipient experience
```

### Viewing a Delivered Time Capsule

```text
1. Recipient receives email notification
   ├── Beautiful HTML template with capsule details
   └── Secure viewing link with access token

2. Click viewing link
   ├── Loads TimeCapsuleView.tsx page
   ├── Validates access token
   └── Shows capsule information and media player

3. Media Playback
   ├── Custom player with standard controls
   ├── Video with poster image OR audio with waveform
   ├── Play/pause, seek, volume controls
   └── Full-screen support for videos

4. Capsule Information
   ├── Message title and sender information
   ├── Creation date and delivery information
   └── Personal message preview text
```

## Security Features

### Authentication & Authorization

1. **User Authentication**: Clerk-based authentication with JWT tokens
2. **Row Level Security**: PostgreSQL RLS policies ensure users only access their own data
3. **Secure File Storage**: Private Supabase storage bucket with user-based folder structure
4. **Access Tokens**: UUID-based tokens for secure capsule viewing

### Data Protection

1. **Encrypted Storage**: All media files stored with encryption at rest
2. **Secure URLs**: Pre-signed URLs for temporary media access
3. **Token Validation**: Server-side validation of all access tokens
4. **CORS Protection**: Proper CORS headers on all API endpoints

### Privacy Features

1. **Token Masking**: Access tokens partially masked in emails (first 8 + last 4 characters)
2. **Temporary Access**: Viewing links expire after reasonable time
3. **Audit Logging**: All delivery attempts and access logged
4. **Data Isolation**: Complete separation between user data

## Email Templates

### 1. Delivery Notification Email

**Purpose**: Notify recipient that a Time Capsule has been delivered.

**Design Features**:

- **Premium Design**: Purple-pink gradient header with heart icon
- **Personal Touch**: Recipient name and message title prominently displayed
- **Metadata Box**: Delivery type, creation date, and capsule details
- **Security Notice**: Information about encryption and temporary access
- **Call-to-Action**: Large, prominent button to open Time Capsule

**Template Location**: `supabase/functions/time-capsule-delivery/index.ts` (generateEmailTemplate)

### 2. Test Preview Email

**Purpose**: Show capsule creator exactly how the delivery email will look.

**Design Features**:

- **Test Banner**: Prominent red banner indicating "TEST PREVIEW"
- **Identical Layout**: Same design as actual delivery email
- **Security Info**: Masked access token display
- **Test Warning**: Clear indication this is not actual delivery
- **Preview Experience**: Complete recipient experience simulation

**Template Location**: `supabase/functions/time-capsule-test-preview/index.ts` (generateTestPreviewEmailTemplate)

## API Endpoints

### Frontend API Calls

1. **Capsule Management**:
   - `GET /time_capsules` - Fetch user's capsules
   - `POST /time_capsules` - Create new capsule
   - `DELETE /time_capsules/{id}` - Delete capsule (before delivery only)

2. **File Upload**:
   - `POST /storage/objects` - Upload media files
   - `GET /storage/objects/{path}` - Retrieve media files

3. **Edge Functions**:
   - `POST /functions/time-capsule-delivery` - Trigger delivery process
   - `POST /functions/time-capsule-test-preview` - Send test preview

### Database Functions

```sql
-- Get capsules ready for delivery
get_time_capsules_ready_for_delivery()
RETURNS TABLE(capsule_id, user_id, recipient_name, recipient_email, ...)

-- Mark capsule as delivered
mark_capsule_delivered(capsule_uuid UUID)
RETURNS BOOLEAN

-- Increment delivery attempts
increment_delivery_attempt(capsule_uuid UUID, error_message TEXT)
RETURNS VOID

-- Generate signed URL for media access
get_time_capsule_signed_url(capsule_token UUID, expires_in INTEGER)
RETURNS TEXT
```

## Testing & Quality Assurance

### Manual Testing Checklist

**Capsule Creation**:

- [ ] Wizard step navigation works correctly
- [ ] Recipient validation (email format, required fields)
- [ ] Date picker enforces future dates only
- [ ] Recording works in Chrome, Firefox, Safari
- [ ] File upload completes successfully
- [ ] Capsule appears in list with correct information

**Visual Design**:

- [ ] Seal corner displays correctly
- [ ] Hover effects and animations work smoothly
- [ ] Responsive design on mobile and desktop
- [ ] Gradient colors match design specifications
- [ ] Unique capsule IDs display properly

**Test Preview**:

- [ ] Test preview button sends email successfully
- [ ] Email arrives with correct formatting
- [ ] Email links work and load viewing page
- [ ] Access token masking works properly
- [ ] Test banner clearly indicates preview status

**Delivery System**:

- [ ] Scheduled delivery triggers correctly
- [ ] Family Shield integration works
- [ ] Email delivery succeeds
- [ ] Viewing page loads with proper media playback
- [ ] Failed delivery retry logic functions

**Security**:

- [ ] Users cannot access other users' capsules
- [ ] Invalid access tokens return proper error
- [ ] File access requires proper authentication
- [ ] RLS policies prevent unauthorized access

### Automated Testing

**Unit Tests**: Located in `src/test/time-capsule.test.ts`

- Component rendering tests
- Form validation tests
- Utility function tests

**Integration Tests**:

- API endpoint testing
- Database function testing
- Edge Function testing

### Performance Testing

**Media Handling**:

- Recording performance across browsers
- File upload progress and error handling
- Media playback optimization
- Mobile device compatibility

## Deployment & Configuration

### Environment Variables

```bash
# Required for Edge Functions
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_api_key
SITE_URL=https://yourdomain.com

# Optional
MAX_FILE_SIZE=104857600  # 100MB
MAX_RECORDING_DURATION=300  # 5 minutes
```

### Supabase Configuration

1. **Database Setup**:

   ```bash
   cd supabase
   supabase db reset
   supabase db push
   ```

2. **Storage Bucket**:
   - Create `time-capsules` bucket in Supabase Dashboard
   - Set to private with 100MB limit
   - Configure allowed MIME types

3. **Edge Functions Deployment**:

   ```bash
   supabase functions deploy time-capsule-delivery
   supabase functions deploy time-capsule-test-preview
   ```

4. **Cron Jobs**:
   - Set up automated delivery checks (recommended: every 15 minutes)
   - Configure cleanup jobs for expired access tokens

### Frontend Build

```bash
npm run build
npm run preview  # Test production build locally
```

## Troubleshooting

### Common Issues

1. **Recording Not Working**:
   - Check browser permissions for microphone/camera
   - Ensure HTTPS in production (required for MediaRecorder)
   - Verify browser compatibility (Chrome, Firefox, Safari supported)

2. **Email Delivery Failures**:
   - Verify Resend API key is correct
   - Check email address format validation
   - Review Edge Function logs for errors

3. **File Upload Issues**:
   - Check file size limits (100MB)
   - Verify Supabase storage configuration
   - Ensure proper user authentication

4. **Viewing Page Issues**:
   - Validate access token format (UUID)
   - Check RLS policies allow public access
   - Verify media file exists and is accessible

### Monitoring & Logs

**Frontend Logs**:

- Browser console for React errors
- Network tab for API call failures
- Performance monitoring for media operations

**Backend Logs**:

- Supabase Edge Function logs
- Database query performance
- Email delivery status from Resend

### Support & Maintenance

**Regular Maintenance**:

- Monitor storage usage and costs
- Clean up expired access tokens
- Review delivery success rates
- Update browser compatibility list

**User Support**:

- Provide clear error messages in UI
- Include help links for common issues
- Monitor user feedback for UX improvements

## Future Enhancements

### Planned Features

1. **Advanced Scheduling**:
   - Recurring delivery options (birthdays, anniversaries)
   - Multiple recipient support per capsule
   - Delivery condition combinations

2. **Enhanced Media**:
   - Photo album support
   - Document attachment capability
   - Video editing tools (trim, filters)

3. **Collaboration Features**:
   - Multi-user capsule creation
   - Family collaboration on messages
   - Group Time Capsules

4. **Analytics Dashboard**:
   - Delivery success statistics
   - User engagement metrics
   - Popular delivery patterns

### Technical Improvements

1. **Performance Optimization**:
   - Video compression and optimization
   - CDN integration for global delivery
   - Lazy loading and code splitting

2. **Mobile App Integration**:
   - Native mobile recording
   - Push notification delivery
   - Offline recording capability

3. **Advanced Security**:
   - End-to-end encryption
   - Biometric authentication
   - Advanced access controls

---

*This documentation is maintained as part of the LegacyGuard project. For technical support or feature requests, please contact the development team.*
