# External Services Configuration Guide

This document provides detailed setup instructions for all external services and dependencies used by the Schwalbe application.

## Table of Contents

- [Supabase Setup](#supabase-setup)
- [Stripe Configuration](#stripe-configuration)
- [Email Services](#email-services)
- [Authentication Providers](#authentication-providers)
- [AI/ML Services](#aiml-services)
- [Monitoring & Analytics](#monitoring--analytics)
- [File Storage](#file-storage)
- [Caching & Performance](#caching--performance)
- [Development Tools](#development-tools)

## Supabase Setup

### Project Creation

1. **Create Supabase Project**

   ```bash
   # Visit https://supabase.com and create a new project
   # Choose your organization and project name
   # Select your database password (save this securely)
   # Choose your region (consider latency and compliance requirements)
   ```

2. **Environment Variables**

   ```bash
   # Add to your .env.local file
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

### Database Configuration

1. **Run Migrations**

   ```bash
   # From your Supabase dashboard, go to SQL Editor
   # Run all migration files in order from supabase/migrations/
   ```

2. **Enable Extensions**

   ```sql
   -- Enable required PostgreSQL extensions
   CREATE EXTENSION IF NOT EXISTS pgcrypto;
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
   ```

3. **Configure Authentication**
   - Go to Authentication > Settings
   - Configure site URL: `http://localhost:3001` (development)
   - Configure redirect URLs for production domains
   - Enable email confirmation if required

4. **Storage Setup**
   - Go to Storage > Settings
   - Create buckets for user uploads
   - Configure CORS policies for web access

### API Keys

1. **Project API Keys**
   - **anon/public**: Safe to use in client-side code
   - **service_role**: Keep secret, only for server-side operations

2. **Security Best Practices**
   - Rotate keys regularly
   - Use different keys for development/production
   - Never commit keys to version control

## Stripe Configuration

### Account Setup

1. **Create Stripe Account**

   ```bash
   # Visit https://stripe.com and create an account
   # Complete business verification process
   # Enable required payment methods
   ```

2. **API Keys**

   ```bash
   # Get keys from Stripe Dashboard > Developers > API Keys
   STRIPE_SECRET_KEY=sk_test_...    # Test mode
   STRIPE_SECRET_KEY=sk_live_...    # Live mode
   ```

3. **Webhook Configuration**

   ```bash
   # Create webhook endpoint in Stripe Dashboard
   # URL: https://your-domain.com/api/webhooks/stripe
   # Events: checkout.session.completed, invoice.payment_succeeded, etc.
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### Product Setup

1. **Create Products**

   ```bash
   # In Stripe Dashboard > Products
   # Create subscription products for different plans
   # Set up pricing tiers
   ```

2. **Configure Webhooks**

   ```javascript
   // Webhook events to handle
   const events = [
     'checkout.session.completed',
     'invoice.payment_succeeded',
     'invoice.payment_failed',
     'customer.subscription.created',
     'customer.subscription.updated',
     'customer.subscription.deleted'
   ];
   ```

## Email Services

### Resend Setup

1. **Create Account**

   ```bash
   # Visit https://resend.com and create an account
   # Verify your domain for sending emails
   ```

2. **API Configuration**

   ```bash
   RESEND_API_KEY=re_...
   ```

3. **Domain Verification**

   ```bash
   # Add DNS records to your domain
   # TXT record: _resend._domainkey.yourdomain.com
   # CNAME record: resend._domainkey.yourdomain.com
   ```

### Alternative: SMTP Configuration

```bash
# For Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# For SendGrid
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

## Authentication Providers

### Clerk Setup (Alternative to Supabase Auth)

1. **Create Clerk Application**

   ```bash
   # Visit https://clerk.com and create an application
   # Choose authentication methods (email, social logins)
   ```

2. **Configuration**

   ```bash
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   ```

3. **Social Login Setup**
   - Configure OAuth providers (Google, GitHub, etc.)
   - Set up redirect URLs
   - Configure user metadata fields

### NextAuth.js Configuration

```javascript
// next-auth configuration
export default NextAuth({
  providers: [
    // Configure your providers
  ],
  callbacks: {
    // Custom callbacks for user session management
  }
});
```

## AI/ML Services

### OpenAI Setup

1. **Create Account**

   ```bash
   # Visit https://platform.openai.com and create an account
   # Add billing information
   # Generate API key
   ```

2. **Configuration**

   ```bash
   OPENAI_API_KEY=sk-...
   ```

3. **Usage Limits**
   - Monitor API usage in OpenAI dashboard
   - Set up billing alerts
   - Implement rate limiting in your application

### Anthropic Claude (Alternative)

1. **Create Account**

   ```bash
   # Visit https://console.anthropic.com and create an account
   ```

2. **Configuration**

   ```bash
   ANTHROPIC_API_KEY=sk-ant-...
   ```

## Monitoring & Analytics

### Sentry Setup

1. **Create Project**

   ```bash
   # Visit https://sentry.io and create a project
   # Choose platform: Next.js
   ```

2. **Configuration**

   ```bash
   SENTRY_DSN=https://...@sentry.io/...
   ```

3. **Error Tracking**

   ```javascript
   // In your application
   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV,
     tracesSampleRate: 1.0,
   });
   ```

### Google Analytics

1. **Create Property**

   ```bash
   # Visit https://analytics.google.com
   # Create a new GA4 property
   ```

2. **Configuration**

   ```bash
   GA_TRACKING_ID=G-XXXXXXXXXX
   ```

## File Storage

### AWS S3 Setup

1. **Create S3 Bucket**

   ```bash
   # AWS Console > S3 > Create bucket
   # Configure bucket name and region
   # Set up permissions and CORS
   ```

2. **IAM User Configuration**

   ```bash
   # Create IAM user with S3 permissions
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_S3_BUCKET=your-bucket-name
   AWS_REGION=us-east-1
   ```

3. **Bucket Policy**

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::your-bucket/*",
         "Condition": {
           "StringEquals": {
             "aws:Referer": "https://your-domain.com"
           }
         }
       }
     ]
   }
   ```

## Caching & Performance

### Redis Setup

1. **Local Development**

   ```bash
   # Install Redis locally
   brew install redis    # macOS
   sudo apt install redis-server  # Ubuntu

   # Start Redis
   redis-server
   ```

2. **Cloud Redis (Redis Cloud/Upstash)**

   ```bash
   REDIS_URL=redis://username:password@host:port
   ```

3. **Configuration**

   ```javascript
   // Redis client configuration
   const redis = new Redis(process.env.REDIS_URL, {
     retryStrategy: (times) => Math.min(times * 50, 2000),
   });
   ```

### CDN Setup

1. **Vercel Edge Network**
   - Automatic CDN configuration with Vercel deployment
   - No additional setup required

2. **Cloudflare**

   ```bash
   # Configure DNS to point to Cloudflare
   # Set up page rules and caching policies
   ```

## Development Tools

### Linear (Issue Tracking)

1. **Create Workspace**

   ```bash
   # Visit https://linear.app and create a workspace
   ```

2. **API Configuration**

   ```bash
   LINEAR_API_KEY=lin_api_...
   ```

3. **Webhook Setup**

   ```bash
   # Configure webhooks for issue updates
   # URL: https://your-domain.com/api/webhooks/linear
   ```

### GitHub Integration

1. **Create Personal Access Token**

   ```bash
   # GitHub Settings > Developer settings > Personal access tokens
   # Select scopes: repo, workflow, etc.
   ```

2. **Configuration**

   ```bash
   GITHUB_TOKEN=github_pat_...
   ```

## Deployment Configuration

### Vercel Setup

1. **Connect Repository**

   ```bash
   # Import project from GitHub
   # Configure build settings
   ```

2. **Environment Variables**

   ```bash
   # Add all environment variables in Vercel dashboard
   # Configure different variables for preview/production
   ```

3. **Domain Configuration**

   ```bash
   # Add custom domain
   # Configure SSL certificates
   ```

### Docker Configuration

```dockerfile
# Dockerfile example
FROM node:18-alpine

# Install dependencies
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

## Security Configuration

### HTTPS Setup

1. **SSL Certificate**

   ```bash
   # Use Let's Encrypt for free certificates
   certbot certonly --webroot -w /var/www/html -d yourdomain.com
   ```

2. **Force HTTPS**

   ```javascript
   // next.config.js
   module.exports = {
     async redirects() {
       return [
         {
           source: '/(.*)',
           destination: 'https://yourdomain.com/:1',
           permanent: true,
           has: [{ type: 'host', value: 'yourdomain.com' }],
         },
       ];
     },
   };
   ```

### CORS Configuration

```javascript
// Configure CORS for API routes
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://yourdomain.com']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
};
```

## Monitoring & Alerting

### Health Checks

```javascript
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
```

### Error Monitoring

```javascript
// Global error handler
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Send to monitoring service
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Send to monitoring service
});
```

## Backup & Recovery

### Database Backups

1. **Supabase Backups**
   - Automatic daily backups
   - Point-in-time recovery available
   - Manual backup export option

2. **File Storage Backups**

   ```bash
   # AWS S3 backup script
   aws s3 sync s3://your-bucket s3://your-backup-bucket --delete
   ```

## Performance Optimization

### Database Optimization

1. **Connection Pooling**

   ```javascript
   // Supabase connection configuration
   const supabase = createClient(url, key, {
     db: {
       schema: 'public',
     },
     global: {
       headers: {
         'x-my-custom-header': 'my-app-name',
       },
     },
   });
   ```

2. **Query Optimization**
   - Use appropriate indexes
   - Implement pagination
   - Cache frequently accessed data

### CDN Configuration

1. **Static Asset Optimization**

   ```javascript
   // next.config.js
   module.exports = {
     images: {
       domains: ['your-cdn-domain.com'],
       formats: ['image/webp', 'image/avif'],
     },
   };
   ```

2. **Cache Headers**

   ```javascript
   // API routes
   export default function handler(req, res) {
     res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
     res.status(200).json({ data: 'cached for 24 hours' });
   }
   ```

## Troubleshooting

### Common Issues

1. **Environment Variable Not Found**

   ```bash
   # Check if variable is set
   echo $VARIABLE_NAME

   # Check .env file syntax
   # Ensure no spaces around =
   # Ensure no quotes unless needed
   ```

2. **Service Connection Issues**

   ```bash
   # Test Supabase connection
   curl -H "apikey: $SUPABASE_ANON_KEY" $SUPABASE_URL/rest/v1/

   # Test Stripe connection
   curl -H "Authorization: Bearer $STRIPE_SECRET_KEY" https://api.stripe.com/v1/customers
   ```

3. **Build Failures**

   ```bash
   # Clear build cache
   rm -rf .next node_modules/.cache

   # Reinstall dependencies
   npm ci

   # Check for TypeScript errors
   npm run typecheck
   ```

### Support Resources

- **Supabase**: <https://supabase.com/docs>
- **Stripe**: <https://stripe.com/docs>
- **Next.js**: <https://nextjs.org/docs>
- **Vercel**: <https://vercel.com/docs>
- **Sentry**: <https://docs.sentry.io>
- **Resend**: <https://resend.com/docs>
