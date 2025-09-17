# LegacyGuard Notification System

## Overview

The LegacyGuard notification system provides proactive, empathetic reminders to users about expiring documents. This transforms LegacyGuard from a passive storage solution into an active guardian that works for users even when the application is closed.

## System Architecture

### Components

1. **Vercel Cron Job** - Scheduled daily execution at 9:00 AM UTC
2. **Document Expiration API** (`/api/check-expirations`) - Serverless function that checks for expiring documents
3. **Resend Email Service** - Professional email delivery with beautiful HTML templates
4. **Supabase Integration** - Secure database queries using service role key

### Flow Diagram

```
Daily 9:00 AM UTC
        ↓
Vercel Cron Trigger
        ↓
/api/check-expirations
        ↓
Query Supabase for expiring documents
        ↓
Generate personalized email templates
        ↓
Send via Resend API
        ↓
User receives empathetic reminder
```

## Implementation Details

### 1. Cron Job Configuration (`vercel.json`)

```json
{
  "crons": [
    {
      "path": "/api/check-expirations",
      "schedule": "0 9 * * *"
    }
  ]
}
```

- **Schedule**: Daily at 9:00 AM UTC
- **Path**: Points to our notification function
- **Security**: Protected by `VERCEL_CRON_SECRET`

### 2. Notification Triggers

The system sends notifications at three key thresholds with intelligent date range matching:

- **30 days before expiration** (±1 day tolerance: 29-31 days) - Early gentle reminder
- **7 days before expiration** (±1 day tolerance: 6-8 days) - More urgent reminder  
- **1 day before expiration** (±1 day tolerance: 0-2 days) - Final urgent alert

**Key Improvements:**
- **Smart Range Queries**: Uses `.gte()` and `.lte()` instead of exact date matching
- **Duplicate Prevention**: Tracks `last_notification_sent_at` with 20-day cooldown
- **Flexible Matching**: ±1 day tolerance accounts for timing variations

### 3. Email Templates

Our email templates feature:

- **Professional Design** - Gradient headers, proper spacing, mobile-responsive
- **Brand Consistency** - LegacyGuard colors and Sofia persona
- **Contextual Urgency** - Different styling based on days until expiration
- **Clear CTAs** - Direct links to the user's vault
- **Empathetic Tone** - Caring, supportive language that matches our brand

### 4. Security Features

- **Cron Secret Protection** - Prevents unauthorized API calls
- **Service Role Authentication** - Secure database access
- **Email Validation** - Proper input sanitization
- **Error Handling** - Graceful failure handling with logging

## Environment Variables

### Required (Server-only)

```bash
# Supabase Service Role Key - NEVER expose to client
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Resend API Key for email delivery
RESEND_API_KEY=re_2FUyGxRt_FaigMrn98K7rTRetwZkNkL41

# Vercel Cron Security Secret
VERCEL_CRON_SECRET=FyL2aHeixtNh3m8YcC6++46n2XOUF4V2wv8DucwLqmM=

# Application URL for email links
VITE_APP_URL=https://legacyguard.vercel.app
```

### Configuration in Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable with appropriate scope (Production, Preview, Development)
4. Redeploy to activate the cron job

## Testing the System

### 1. Test Email Endpoint

Visit `/test-notifications` in your deployed application to:
- Send test emails to any email address
- Verify email templates with different urgency levels
- Test with custom document names and expiration periods

### 2. Manual Testing

```bash
# Test the notification endpoint (will return 401 - expected)
curl -X POST https://your-app.vercel.app/api/check-expirations

# Send a test email
curl -X POST https://your-app.vercel.app/api/test-notification \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","documentName":"Test.pdf","daysUntil":7}'
```

### 3. Monitoring

- Check Vercel Function logs for cron job execution
- Monitor Resend dashboard for email delivery status
- Review Supabase logs for database queries

## Database Schema Requirements

The notification system expects the following database structure:

### Documents Table (Updated)

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  document_type TEXT,
  expires_at DATE,
  last_notification_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX idx_documents_notification_date ON documents(last_notification_sent_at);
CREATE INDEX idx_documents_expires_at ON documents(expires_at) WHERE expires_at IS NOT NULL;
```

### Profiles Table (for user emails)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Email Content Strategy

### Tone & Voice

- **Empathetic**: "I noticed..." instead of "Your document expires"
- **Caring**: Position Sofia as a helpful assistant, not a system
- **Non-alarming**: Use gentle language, avoid panic-inducing words
- **Actionable**: Clear next steps without being pushy

### Personalization

- Use user's name when available
- Reference specific document names and types  
- Adjust urgency based on days remaining
- Maintain consistency with in-app Sofia persona

### Brand Alignment

- Matches LegacyGuard's "Guardian of Memories" narrative
- Uses Sofia as the sender to maintain personal connection
- Professional design that reinforces premium positioning
- Consistent with the calm, dignified tone of the application

## Error Handling

The system includes comprehensive error handling:

1. **Database Connection Failures** - Graceful degradation with logging
2. **Email Service Outages** - Retry logic and fallback notifications
3. **Invalid User Data** - Skip problematic records, continue processing
4. **Rate Limiting** - Respect email service limits
5. **Security Violations** - Proper authentication error responses

## Future Enhancements

### Potential Improvements

1. **Smart Scheduling** - Send emails at optimal times per user timezone
2. **Frequency Preferences** - Allow users to customize notification timing
3. **Multi-channel Notifications** - SMS, push notifications, in-app alerts
4. **Batch Optimization** - More efficient processing for large user bases
5. **Advanced Personalization** - ML-driven content optimization

### Integration Opportunities

1. **Calendar Integration** - Add expiration dates to user calendars
2. **Document Renewal Services** - Partner with renewal services
3. **Analytics Dashboard** - Track notification effectiveness
4. **A/B Testing** - Optimize email templates and timing

## Monitoring & Analytics

### Key Metrics

- **Email Delivery Rate** - Track successful deliveries
- **Open Rates** - Monitor user engagement
- **Click-through Rates** - Measure action taken
- **Document Updates** - Track if notifications lead to renewals
- **User Satisfaction** - Feedback on notification usefulness

### Logging Strategy

- All notification attempts logged with outcomes
- Error tracking for failed deliveries
- Performance metrics for database queries
- Security event logging for unauthorized access attempts

## Compliance & Privacy

### Data Protection

- Minimal data exposure in email content
- Secure transmission using TLS
- No sensitive document content in emails
- User consent for notification preferences

### Regulations

- GDPR compliance for EU users
- CAN-SPAM compliance for US users
- Unsubscribe mechanisms
- Data retention policies

This notification system represents a significant value-add that transforms LegacyGuard from a simple document storage solution into an intelligent, caring guardian that actively helps users manage their important documents and deadlines.