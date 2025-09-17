# Environment Variables Documentation

## Required Variables

These variables MUST be set for the application to function properly:

### Core Application

- `NODE_ENV` - Set to `production` for production builds
- `VITE_APP_ENV` - Application environment (development/staging/production)
- `VITE_APP_VERSION` - Application version (e.g., 1.0.0)
- `VITE_APP_URL` - Full URL where the app is hosted

### Authentication (Clerk)

- `VITE_CLERK_PUBLISHABLE_KEY` - Your Clerk publishable key (required for auth)
  - Get from: <https://dashboard.clerk.com>

### Database (Supabase)

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
  - Get both from: <https://app.supabase.com/project/_/settings/api>

## Optional Variables

### Error Tracking

- `VITE_SENTRY_DSN` - Sentry DSN for error tracking
  - Recommended for production monitoring
  - Get from: <https://sentry.io>

### Security Features

- `VITE_ENABLE_ENCRYPTION` - Enable client-side encryption (default: true)
- `VITE_ENABLE_RATE_LIMITING` - Enable rate limiting (default: true)
- `VITE_ENCRYPTION_KEY` - Encryption key for additional security layer
  - Generate with: `openssl rand -base64 32`
  - **IMPORTANT**: Keep this secret and never commit to version control

### OCR Services

- `VITE_GOOGLE_CLOUD_PROJECT_ID` - Google Cloud project ID for Vision API
- `VITE_GOOGLE_VISION_API_KEY` - Google Vision API key for OCR
- `VITE_TESSERACT_ENDPOINT` - Alternative OCR endpoint

### AI Features

- `VITE_OPENAI_API_KEY` - OpenAI API key for AI features
  - Required only if AI features are enabled

### Professional Network

- `VITE_PROFESSIONAL_NETWORK_API_KEY` - API key for professional network features

### Legal/Regional Settings

- `VITE_DEFAULT_JURISDICTION` - Default legal jurisdiction (e.g., US-General)

### API Configuration

- `VITE_API_URL` - Backend API URL if using separate backend

## Production Checklist

Before deploying to production, ensure:

1. ✅ All required variables are set
2. ✅ `NODE_ENV` is set to `production`
3. ✅ `VITE_APP_ENV` is set to `production`
4. ✅ Database URLs point to production instances
5. ✅ API keys are production keys (not development/test keys)
6. ✅ `VITE_ENCRYPTION_KEY` is generated and stored securely
7. ✅ Sentry DSN is configured for error tracking
8. ✅ All URLs use HTTPS in production

## Security Notes

- **Never commit `.env` files to version control**
- Use environment-specific files: `.env.local`, `.env.production`
- Store sensitive keys in secure secret management systems
- Rotate API keys regularly
- Use different keys for development and production

## Deployment Platforms

### Vercel (RECOMMENDED)

**⚠️ SECURITY BEST PRACTICES:**

1. **NEVER** commit production credentials to repository
2. **NEVER** use production API keys locally
3. **ALWAYS** use Vercel's Environment Variables UI

**Setup Steps:**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **Environment Variables**
4. Add each variable with:
   - **Key**: Variable name (e.g., `VITE_SUPABASE_URL`)
   - **Value**: Your production value
   - **Environment**: Select "Production" only
   - **Sensitive**: Toggle ON for secrets
5. Vercel automatically handles `NODE_ENV=production`

**Local Development:**

- Use `.env.local` with development/test credentials only
- Never use production API keys locally
- `.env.local` should be in `.gitignore`

### Netlify

- Add variables in Site Settings > Environment Variables
- Use build command: `NODE_ENV=production npm run build`

### Docker

- Use `.env` file with docker-compose
- Or pass variables with `-e` flag in docker run

### Manual Deployment

- Set variables in server environment
- Or use process manager like PM2 with ecosystem file

## Troubleshooting

### Variable not loading?

1. Check variable naming (must start with `VITE_` for Vite)
2. Restart development server after adding variables
3. Clear build cache if using CI/CD

### TypeScript errors?

Add types to `src/vite-env.d.ts`:

```typescript
interface ImportMetaEnv {
  readonly VITE_YOUR_VARIABLE: string
}
```

### Production build failing?

- Ensure all required variables are set in build environment
- Check for hardcoded development URLs
- Verify API keys have production permissions
