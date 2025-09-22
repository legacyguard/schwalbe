# Environment Variables Guide

This document provides comprehensive information about all environment variables used in the Schwalbe monorepo.

## Table of Contents

- [Required Variables](#required-variables)
- [Optional Variables](#optional-variables)
- [Development Setup](#development-setup)
- [Production Deployment](#production-deployment)
- [Security Considerations](#security-considerations)

## Required Variables

### Supabase Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://your-project.supabase.co` | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | ✅ |

### Stripe Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_51...` | ✅ (for payments) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | `whsec_...` | ✅ (for webhooks) |

## Optional Variables

### Authentication

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXTAUTH_URL` | NextAuth.js callback URL | `http://localhost:3001` |
| `NEXTAUTH_SECRET` | NextAuth.js secret | `your-secret-here` |
| `CLERK_SECRET_KEY` | Clerk authentication key | `sk_test_...` |

### External Services

| Variable | Description | Example |
|----------|-------------|---------|
| `RESEND_API_KEY` | Resend email service | `re_...` |
| `LINEAR_API_KEY` | Linear issue tracking | `lin_api_...` |
| `GITHUB_TOKEN` | GitHub API access | `github_pat_...` |
| `OPENAI_API_KEY` | OpenAI API access | `sk-...` |
| `ANTHROPIC_API_KEY` | Anthropic API access | `sk-ant-...` |

### Monitoring & Analytics

| Variable | Description | Example |
|----------|-------------|---------|
| `SENTRY_DSN` | Sentry error tracking | `https://...@sentry.io/...` |
| `GA_TRACKING_ID` | Google Analytics | `G-XXXXXXXXXX` |

### Database

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@localhost:5432/db` |
| `REDIS_URL` | Redis connection | `redis://localhost:6379` |

## Development Setup

### Local Development

1. Copy the example environment file:

   ```bash
   cp .env.example .env.local
   ```

2. Fill in the required variables for your development environment

3. For Supabase, create a new project at [supabase.com](https://supabase.com)

4. For Stripe, use test keys from your [Stripe dashboard](https://dashboard.stripe.com)

### Mobile Development (React Native)

For the mobile app, use the Expo-specific variables:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Production Deployment

### Vercel Deployment

For Vercel deployments, set these environment variables in your project settings:

1. Go to your Vercel dashboard
2. Navigate to your project settings
3. Go to "Environment Variables"
4. Add all required variables

### Docker Deployment

When deploying with Docker, you can:

1. Use environment files:

   ```bash
   docker run -d --env-file .env.production your-app
   ```

2. Set variables directly:

   ```bash
   docker run -d \
     -e NEXT_PUBLIC_SUPABASE_URL=https://... \
     -e SUPABASE_SERVICE_ROLE_KEY=... \
     your-app
   ```

### Kubernetes Deployment

Use ConfigMaps and Secrets:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: schwalbe-config
data:
  NEXT_PUBLIC_SUPABASE_URL: "https://your-project.supabase.co"
---
apiVersion: v1
kind: Secret
metadata:
  name: schwalbe-secrets
type: Opaque
data:
  SUPABASE_SERVICE_ROLE_KEY: <base64-encoded-key>
  STRIPE_SECRET_KEY: <base64-encoded-key>
```

## Security Considerations

### Secret Management

1. **Never commit secrets to version control**
2. **Use different keys for development and production**
3. **Rotate keys regularly**
4. **Use secret management services in production**

### Environment Variable Security

1. **Server-side only variables** (prefixed with no `NEXT_PUBLIC_`):
   - Database credentials
   - API secret keys
   - Service account keys

2. **Client-side safe variables** (prefixed with `NEXT_PUBLIC_`):
   - Public API endpoints
   - Public configuration
   - Feature flags

### Best Practices

1. **Validate environment variables** on application startup
2. **Use default values** for optional variables
3. **Log warnings** for missing optional variables
4. **Fail fast** for missing required variables
5. **Use environment-specific configurations**

## Troubleshooting

### Common Issues

1. **Build fails with missing environment variables**
   - Ensure all required variables are set
   - Check variable names match exactly

2. **Runtime errors with undefined variables**
   - Verify variables are accessible in the runtime environment
   - Check for typos in variable names

3. **Authentication issues**
   - Verify Supabase keys are correct
   - Check NextAuth.js configuration

4. **Payment processing issues**
   - Verify Stripe keys are for the correct environment
   - Check webhook endpoints are configured

### Debugging

Enable debug logging to troubleshoot environment variable issues:

```bash
DEBUG=schwalbe:* npm run dev
```

## Environment-Specific Configurations

### Development

```bash
NODE_ENV=development
DEBUG=schwalbe:*
LOG_LEVEL=debug
```

### Staging

```bash
NODE_ENV=production
VERCEL_ENV=preview
LOG_LEVEL=info
```

### Production

```bash
NODE_ENV=production
VERCEL_ENV=production
LOG_LEVEL=warn
SENTRY_DSN=https://...
```

## Migration Guide

When adding new environment variables:

1. Add to `.env.example` with documentation
2. Update this `ENVIRONMENT.md` file
3. Add validation in your application code
4. Update deployment configurations
5. Notify team members of the new requirement
