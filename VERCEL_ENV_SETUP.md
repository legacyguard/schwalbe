# Vercel Environment Variables Setup for LegacyGuard

## Required Environment Variables for Production Deployment

### 🚀 **Immediate Fix - Add these to Vercel Environment Variables:**

```bash
# Feature Flags (Enable Full UI)
VITE_ENABLE_LANDING=true
VITE_ENABLE_ASSISTANT=true
VITE_ENABLE_ONBOARDING=true

# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Authentication (if using Supabase Auth)
VITE_AUTH_PROVIDER=supabase

# Production Mode
VITE_IS_PRODUCTION=true
```

### 🔧 **To Configure in Vercel:**

1. Go to your Vercel project: https://vercel.com/legacyguards-projects/schwalbe
2. Navigate to Settings → Environment Variables
3. Add each variable above for Production, Preview, and Development
4. Redeploy the application

### 📋 **Current Application Structure:**

- **Landing Page**: LandingV2 component with night sky theme
- **Authentication**: Supabase Auth with custom UI
- **Features Available**:
  - Will Wizard (`/will/wizard/start`)
  - Asset Dashboard (`/assets`)
  - Documents Management (`/documents`)
  - Subscriptions (`/subscriptions`)
  - Support Pages (`/support`)

### 🎯 **Expected Result After Fix:**

Instead of the basic placeholder, users will see:
- ✅ Professional LegacyGuard landing page with gradient design
- ✅ Hero section with "Secure your family's future" messaging
- ✅ Feature highlights and call-to-action buttons
- ✅ Proper navigation to core application features
- ✅ Authentication flows for sign-in/sign-up

### 🚨 **Architecture Note:**

According to the documentation, this Vite app is temporary. The production system should migrate to:
- **apps/web-next** (Next.js with App Router)
- Enhanced security, SSR, and performance optimizations
- Full emotional design system with Sofia AI assistant

But for immediate deployment, enabling the feature flags will show the complete LegacyGuard experience.