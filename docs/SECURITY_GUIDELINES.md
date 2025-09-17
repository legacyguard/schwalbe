# 🔒 Security Guidelines

## Environment Variables & Credentials

### ❌ NEVER DO THIS

```bash
# NEVER commit production credentials
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.real_production_key

# NEVER hardcode credentials in code
const API_KEY = "sk-proj-real-production-key"; // SECURITY BREACH!

# NEVER use production keys locally
# .env.local should ONLY have test/development credentials
```

### ✅ ALWAYS DO THIS

```bash
# .env.example (commit this)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_key_here

# .env.local (NEVER commit, local development only)
VITE_SUPABASE_URL=https://test-project.supabase.co
VITE_SUPABASE_ANON_KEY=test_key_only

# Production (set in Vercel Dashboard ONLY)
# Never write production values in any file
```

## Vercel Deployment

### Correct Setup Process

1. **Local Development**
   - Create `.env.local` with TEST credentials
   - Verify `.env.local` is in `.gitignore`
   - Use development Supabase project
   - Use test Clerk application

2. **Production Setup**

   ```text
   Vercel Dashboard
   └── Your Project
       └── Settings
           └── Environment Variables
               ├── Add Variable
               ├── Set to "Production" environment
               ├── Mark as "Sensitive"
               └── Save
   ```

3. **CI/CD Validation**
   - `check-env.js` runs in Vercel build
   - Validates variables are present (not values)
   - Build fails if required variables missing

## Different Environments

### Development (.env.local)

```env
VITE_APP_ENV=development
VITE_SUPABASE_URL=https://test-project.supabase.co
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### Staging (Vercel Preview)

```env
# Set in Vercel with Environment = "Preview"
VITE_APP_ENV=staging
VITE_SUPABASE_URL=https://staging-project.supabase.co
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### Production (Vercel Production)

```env
# Set in Vercel with Environment = "Production"
VITE_APP_ENV=production
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
```

## Git Security

### Pre-commit Checks

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/sh
# Check for API keys
if git diff --cached --name-only | xargs grep -E "sk-[a-zA-Z0-9]{48}|pk_live_[a-zA-Z0-9]+|eyJhbGciOiJ" 2>/dev/null; then
  echo "❌ Possible API key detected in commit!"
  echo "Remove sensitive data before committing."
  exit 1
fi
```

### .gitignore Must Include

```gitignore
# Environment variables
.env
.env.local
.env.production
.env.*.local

# IDE
.idea/
.vscode/settings.json

# OS
.DS_Store
Thumbs.db
```

## API Key Rotation

### When to Rotate

- Every 90 days (scheduled)
- After employee leaves
- If key exposed in logs
- If suspicious activity detected

### How to Rotate Safely

1. Generate new key in service dashboard
2. Update in Vercel Environment Variables
3. Trigger redeploy
4. Verify new key works
5. Revoke old key in service dashboard

## Security Checklist

Before each deployment:

- [ ] No credentials in repository
- [ ] `.env.local` not in git history
- [ ] Production variables set in Vercel only
- [ ] All variables marked as "Sensitive" in Vercel
- [ ] Different API keys for dev/staging/prod
- [ ] API keys have minimal required permissions
- [ ] Rate limiting enabled on all APIs
- [ ] CORS properly configured
- [ ] CSP headers set

## Emergency Response

If credentials are exposed:

1. **Immediately revoke** exposed keys
2. **Generate new keys** in service dashboards
3. **Update in Vercel** environment variables
4. **Redeploy application**
5. **Check logs** for unauthorized access
6. **Notify team** and users if needed
7. **Document incident** for future prevention

## Resources

- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [12 Factor App - Config](https://12factor.net/config)

---

**Remember**: Security is everyone's responsibility. When in doubt, ask!
