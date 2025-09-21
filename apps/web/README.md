# LegacyGuard Web Application

A comprehensive family legacy protection platform built with React, TypeScript, and modern web technologies.

## 🚀 Deployment to Vercel

### Prerequisites

- GitHub repository with the codebase
- Vercel account connected to GitHub
- Supabase project (optional for landing page)

### Quick Deployment Steps

1. **Connect Repository to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the `apps/web` directory as the root directory

2. **Configure Build Settings**
   - **Framework Preset**: `Vite`
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Environment Variables** (for full functionality)

   ```bash
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_ENABLE_HOLLYWOOD_LANDING=true
   VITE_ENABLE_ASSISTANT=true
   VITE_ENABLE_ONBOARDING=true
   ```

4. **Deploy**
   - Click "Deploy"
   - The landing page will be immediately accessible
   - Full React application will be available once build issues are resolved

### Current Status

✅ **Landing Page**: Ready and deployable
✅ **Vercel Configuration**: Configured
✅ **Static Assets**: Optimized
⚠️ **Full React App**: Build issues with React Router (working on fix)

### Features Available on Landing Page

- **Hero Section**: Compelling value proposition
- **Feature Showcase**: Key benefits and capabilities
- **Security Highlights**: Military-grade encryption messaging
- **AI Integration**: Sofia assistant introduction
- **Cross-Platform**: Mobile and web compatibility
- **Family Focus**: Legacy protection emphasis

### Troubleshooting

### Build Fails on Vercel

- The static landing page in `public/index.html` will serve as fallback
- Check Vercel build logs for specific errors
- Ensure all dependencies are properly listed in `package.json`

### Environment Variables Not Working

- Use Vercel's dashboard to set environment variables
- Variables must be prefixed with `VITE_` for client-side access
- Redeploy after adding environment variables

### Landing Page Not Loading

- Check that `vercel.json` is in the `apps/web` directory
- Ensure the build output directory is set to `dist`
- Verify the static HTML file is in `public/index.html`

## 🛠 Development

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Project Structure

```text
apps/web/
├── public/           # Static assets and fallback HTML
├── src/
│   ├── components/   # Reusable UI components
│   ├── features/     # Feature-specific modules
│   ├── lib/          # Utilities and configurations
│   └── stores/       # State management
├── vercel.json       # Vercel deployment configuration
└── package.json      # Dependencies and scripts
```

## 🔒 Security Features

- **AES-256 Encryption**: All documents encrypted at rest
- **Biometric Authentication**: Face ID and fingerprint support
- **Row Level Security**: Database-level access control
- **Secure Storage**: Expo Secure Store integration
- **API Security**: Protected endpoints with authentication

## 🤖 AI Integration

- **Sofia AI Assistant**: Intelligent guidance and support
- **Document Analysis**: Automatic categorization and tagging
- **Smart Suggestions**: Context-aware recommendations
- **Natural Language Processing**: Conversational interactions

## 📱 Cross-Platform

- **Web Application**: Responsive design for all devices
- **Mobile App**: Native iOS and Android applications
- **Progressive Web App**: Installable web experience
- **Offline Support**: Core functionality without internet

## 🎯 Key Features

- **Document Management**: Secure storage and organization
- **Family Protection**: Multi-user access control
- **Legal Workflows**: Guided will and estate planning
- **Emergency Access**: Designated family member access
- **Progress Tracking**: Gamified milestone system
- **Backup & Recovery**: Automatic data protection

## 📈 Performance

- **Fast Loading**: Optimized bundle sizes
- **Efficient Caching**: Smart asset management
- **Mobile Optimized**: Touch-friendly interactions
- **Accessibility**: WCAG 2.1 AA compliance

## 🔄 Continuous Integration

- **Automated Testing**: Jest and Playwright integration
- **Code Quality**: ESLint and Prettier configuration
- **Type Safety**: Full TypeScript coverage
- **Build Optimization**: Turbo-powered monorepo builds

---

**LegacyGuard** - Protecting families, preserving legacies.
