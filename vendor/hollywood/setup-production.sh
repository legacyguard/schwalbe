#!/bin/bash

# Production Setup Script
# This script automates all production preparation tasks

echo "🚀 Starting Production Setup..."

# 1. Install Sentry
echo "📦 Installing Sentry..."
npm install @sentry/react

# 2. Remove console.log from index.html
echo "🧹 Cleaning console.log from index.html..."
sed -i '' '/console\.log/d' index.html
sed -i '' '/console\.error/d' index.html

# 3. Create Sentry initialization file
echo "🔧 Setting up Sentry..."
cat > src/lib/sentry.ts << 'EOF'
import * as Sentry from "@sentry/react";

export function initSentry() {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.VITE_APP_ENV || 'production',
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          maskAllInputs: true,
        }),
      ],
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      beforeSend(event) {
        // Don't send events in development
        if (import.meta.env.DEV) {
          return null;
        }
        // Filter out sensitive data
        if (event.request?.cookies) {
          delete event.request.cookies;
        }
        return event;
      },
    });
  }
}
EOF

# 4. Update main.tsx to include Sentry
echo "📝 Updating main.tsx..."
# Add Sentry import at the beginning of main.tsx
sed -i '' '1i\
import { initSentry } from "@/lib/sentry";\
initSentry();\
' src/main.tsx

# 5. Create vercel.json with security headers
echo "🔒 Creating vercel.json with security headers..."
cat > vercel.json << 'EOF'
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=(), interest-cohort=()"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.com https://*.clerk.accounts.dev; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co https://*.clerk.com https://*.clerk.accounts.dev wss://*.supabase.co https://api.sentry.io"
        }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, no-cache, must-revalidate, proxy-revalidate"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
EOF

# 6. Create manifest.json for PWA
echo "📱 Creating manifest.json..."
cat > public/manifest.json << 'EOF'
{
  "name": "LegacyGuard",
  "short_name": "LegacyGuard",
  "description": "Organize your life to protect your family",
  "theme_color": "#3b82f6",
  "background_color": "#ffffff",
  "display": "standalone",
  "orientation": "portrait",
  "scope": "/",
  "start_url": "/",
  "icons": [
    {
      "src": "/shield-icon.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    }
  ],
  "categories": ["finance", "lifestyle", "productivity"],
  "screenshots": [],
  "shortcuts": [
    {
      "name": "Upload Document",
      "url": "/vault",
      "description": "Upload a new document"
    },
    {
      "name": "Create Will",
      "url": "/legacy",
      "description": "Start creating your will"
    }
  ]
}
EOF

# 7. Add Web Vitals monitoring
echo "📊 Installing Web Vitals..."
npm install web-vitals

# 8. Create Web Vitals setup
cat > src/lib/web-vitals.ts << 'EOF'
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

export function initWebVitals() {
  const sendToAnalytics = (metric: any) => {
    // Send to Sentry
    if (window.Sentry) {
      window.Sentry.captureMessage(`Web Vital: ${metric.name}`, {
        level: 'info',
        extra: {
          value: metric.value,
          delta: metric.delta,
          id: metric.id,
        },
      });
    }
    
    // Send to Google Analytics if available
    if ((window as any).gtag) {
      (window as any).gtag('event', metric.name, {
        value: Math.round(metric.value),
        metric_id: metric.id,
        metric_value: metric.value,
        metric_delta: metric.delta,
      });
    }
  };

  onCLS(sendToAnalytics);
  onFID(sendToAnalytics);
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}
EOF

# 9. Update main.tsx to include Web Vitals
echo "📝 Adding Web Vitals to main.tsx..."
sed -i '' '2i\
import { initWebVitals } from "@/lib/web-vitals";\
initWebVitals();\
' src/main.tsx

# 10. Create robots.txt
echo "🤖 Creating robots.txt..."
cat > public/robots.txt << 'EOF'
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Sitemap: https://legacyguard.eu/sitemap.xml
EOF

# 11. Create simple sitemap.xml
echo "🗺️ Creating sitemap.xml..."
cat > public/sitemap.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://legacyguard.eu/</loc>
    <lastmod>2025-08-30</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://legacyguard.eu/vault</loc>
    <lastmod>2025-08-30</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://legacyguard.eu/legacy</loc>
    <lastmod>2025-08-30</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://legacyguard.eu/family</loc>
    <lastmod>2025-08-30</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://legacyguard.eu/guardians</loc>
    <lastmod>2025-08-30</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>
EOF

# 12. Run build to verify everything works
echo "🔨 Running production build..."
NODE_ENV=production npm run build

# 13. Check build output
if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
  
  # Show bundle sizes
  echo ""
  echo "📦 Bundle sizes:"
  du -sh dist/assets/js/*.js | sort -h | tail -5
  
  echo ""
  echo "✅ Production setup complete!"
  echo ""
  echo "⚠️  IMPORTANT MANUAL STEPS:"
  echo "1. Go to Vercel Dashboard and add these environment variables:"
  echo "   - VITE_CLERK_PUBLISHABLE_KEY"
  echo "   - VITE_SUPABASE_URL"
  echo "   - VITE_SUPABASE_ANON_KEY"
  echo "   - VITE_SENTRY_DSN (optional but recommended)"
  echo "   - VITE_APP_ENV=production"
  echo "   - VITE_APP_VERSION=1.0.0"
  echo ""
  echo "2. Deploy to Vercel:"
  echo "   vercel --prod"
  echo ""
  echo "3. After deployment, test:"
  echo "   - Error tracking in Sentry"
  echo "   - All critical user flows"
  echo "   - Mobile responsiveness"
else
  echo "❌ Build failed! Please check the errors above."
  exit 1
fi
