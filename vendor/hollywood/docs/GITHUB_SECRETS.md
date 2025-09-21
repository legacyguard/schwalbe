# GitHub Secrets Configuration

This document lists all required GitHub secrets for the LegacyGuard Hollywood monorepo workflows.

## Required Secrets

### Vercel Deployment
- **VERCEL_TOKEN**: Your Vercel deployment token
- **VERCEL_ORG_ID**: Your Vercel organization ID
- **VERCEL_PROJECT_ID**: Your Vercel project ID
- **VERCEL_SCOPE**: Your Vercel team scope (optional)

### Supabase Configuration
- **VITE_SUPABASE_URL**: Your Supabase project URL (e.g., https://xxx.supabase.co)
- **VITE_SUPABASE_ANON_KEY**: Your Supabase anonymous/public key
- **SUPABASE_SERVICE_ROLE_KEY**: Your Supabase service role key (for admin operations)

### Testing Environment
- **VITE_SUPABASE_TEST_URL**: Supabase URL for testing environment
- **VITE_SUPABASE_TEST_KEY**: Supabase key for testing environment

### Authentication (Clerk)
- **VITE_CLERK_PUBLISHABLE_KEY**: Your Clerk publishable key
- **CLERK_SECRET_KEY**: Your Clerk secret key
- **VITE_CLERK_TEST_KEY**: Clerk key for testing environment

### Security & Monitoring
- **SNYK_TOKEN**: Snyk security scanning token (optional)
- **SONAR_TOKEN**: SonarCloud token for code quality scanning (optional)

### Build & Performance
- **TURBO_TOKEN**: Turborepo remote cache token (optional)
- **TURBO_TEAM**: Turborepo team identifier (optional)

### Cloudflare (if used)
- **CLOUDFLARE_ZONE_ID**: Cloudflare zone ID for CDN purging
- **CLOUDFLARE_API_TOKEN**: Cloudflare API token

### Notifications
- **SLACK_WEBHOOK**: Slack webhook URL for deployment notifications (optional)

## Environment-Specific Variables

### Production
All the above variables should be configured for production environment.

### Staging
- **VITE_SUPABASE_STAGING_URL**: Staging Supabase URL
- **VITE_SUPABASE_STAGING_KEY**: Staging Supabase key
- **VITE_CLERK_STAGING_KEY**: Staging Clerk key

### Preview/Development
- **VITE_SUPABASE_PREVIEW_URL**: Preview Supabase URL
- **VITE_SUPABASE_PREVIEW_KEY**: Preview Supabase key

## How to Set Secrets

1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Click "New repository secret"
4. Add the secret name and value
5. For environment-specific secrets, use the Environments section

## Security Notes

- Never commit secrets to the repository
- Use different keys for different environments
- Regularly rotate your secrets
- Use least-privilege principle for service accounts
- Monitor secret usage in GitHub Actions logs

## Environment Files

The application uses these environment variables:
- Development: `.env.local` (not committed)
- Production: Set via GitHub Secrets and injected during build

## Testing Your Setup

After configuring secrets, workflows should run without authentication errors. Check the Actions tab for any failures related to missing secrets.
