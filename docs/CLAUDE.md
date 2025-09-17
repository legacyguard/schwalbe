# LegacyGuard - Claude Development Guide

This document provides comprehensive guidance for developing the LegacyGuard application using Claude AI.

## Project Overview

This is a React application built with Vite, TypeScript, and modern web technologies for LegacyGuard - a secure document management platform.

### Key Technologies

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **Authentication**: Clerk (OAuth Google + password auth)
- **Database**: Supabase with Row Level Security (RLS)
- **Encryption**: Client-side encryption using TweetNaCl
- **Routing**: React Router v6 with v7 future flags enabled
- **State Management**: TanStack Query for server state

## Application Structure

### Authentication Flow

- Clerk handles authentication with both Google OAuth and password strategies
- All routes except `/sign-in/*` and `/sign-up/*` are protected via `ProtectedRoute`
- Authentication state is managed through `ClerkProvider` with custom styling

### Main Application Pages

- `/` - Dashboard (Index page)
- `/onboarding` - Multi-scene onboarding flow
- `/vault` - Document storage and management
- `/guardians` - Guardian management features
- `/legacy` - Legacy planning features

### Security Architecture

- **Client-side encryption**: Files are encrypted using TweetNaCl before upload to Supabase
- **Key handling**: Never store raw keys in localStorage. Generate non-extractable keys via WebCrypto (SubtleCrypto), wrap them with a passphrase-derived key (PBKDF2/Argon2id), and persist only the wrapped bundle in IndexedDB. Keep active keys in memory; re-unlock on app launch.
- **Supabase RLS**: Row Level Security ensures users only access their own data
- **Secure file storage**: Encrypted files stored in Supabase Storage with user-based folder structure

### Component Organization

- `src/components/ui/` - shadcn/ui components with custom styling
- `src/components/features/` - Feature-specific components (DocumentUploader, DocumentList)
- `src/components/auth/` - Authentication-related components
- `src/pages/` - Route components organized by feature area
- `src/integrations/supabase/` - Supabase client and type definitions

## Key Integrations

### Supabase Setup

- Documents metadata stored in `documents` table with automatic `user_id` population via `auth.uid()`
- Private storage bucket `user_documents` with RLS policies
- See `supabase/README.md` and `supabase/QUICK_FIX.md` for setup details

### Encryption Implementation

- Each user gets unique encryption keys stored locally
- File encryption: Generate a random symmetric key per file (e.g., nacl.secretbox/XSalsa20-Poly1305).
- Key wrapping: Wrap the symmetric key with the user's public key (nacl.box). For sharing, wrap for each recipient.
- Metadata: Include nonce and the ephemeral public key only (never private keys), plus algorithm identifiers and wrapped-key blobs.
- Nonce must be unique per encryption event and 24 bytes for secretbox.
- Include versioned header to allow future algorithm migrations.

Copy `env.template` to `.env.local` and configure:

- `VITE_CLERK_PUBLISHABLE_KEY` - Clerk authentication
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

**Important**: Never commit environment files - they're blocked by `.gitignore` and pre-commit hooks.

## Code Style & Conventions

- TypeScript with strict mode enabled
- ESLint configured with React hooks and TypeScript rules
- Unused variables rule disabled (`@typescript-eslint/no-unused-vars: "off"`)
- shadcn/ui component patterns with Tailwind CSS
- Path aliases configured: `@/*` maps to `src/*`
- File naming: PascalCase for components, camelCase for utilities

## Database Migrations

Located in `supabase/migrations/`:

- `001_create_documents_table.sql` - Main documents table with RLS
- `002_disable_rls_for_dev.sql` - LOCAL DEV ONLY. Not checked into production/staging. Prefer a dev-only seed/script outside migrations. If retained, guard with environment gating and ensure CI blocks it in non-dev branches.
- `003_storage_policies.sql` - Storage bucket security policies

## UI System & Layout Architecture

### Layout Components

- `DashboardLayout.tsx` - App shell with left sidebar + main content using SidebarProvider
- `AppSidebar.tsx` - Navigation sidebar with React Router NavLink active states
- `components/ui/sidebar.tsx` - Composable sidebar primitives with context
  - Persists expanded/collapsed state to cookie ("sidebar:state")
  - Mobile: Sheet overlay, Desktop: fixed/inset/floating variants
  - Keyboard shortcut: Ctrl/Cmd + b toggles sidebar

### Design System

- `src/index.css` - Design tokens with CSS variables (HSL format)
- Brand colors, sidebar palette, status/progress tokens, radii, shadows
- `tailwind.config.ts` - Maps CSS variables to Tailwind theme keys
- shadcn/ui primitives in `components/ui/*` extended for design system
- Uses class-variance-authority and cn utility from `src/lib/utils`

### Notifications System

- Dual toast system: `components/ui/toaster` + `components/ui/sonner`
- `hooks/use-toast.ts` - Lightweight in-memory toast store
- Both mounted in App.tsx for global availability

## Product & User Experience

### Guardian of Memories Narrative

**Theme**: User becomes a "Guardian of Memories" guided by a friendly "Firefly"
**Tone**: Calming, dignified, celebratory of care and love (not fear or loss)

### Unified Application Terminology

The application follows a cohesive garden metaphor with three distinct areas:

#### 1. Dashboard = "The Living Garden" (Záhrada Vášho Odkazu)

- **What it is**: The interactive heart of the application featuring the central visual element (growing tree/plant) that replaces static milestone lists
- **Purpose**:
  - Visually represent progress: Users literally see their legacy "grow" and "bloom" with each important action
  - Serve as emotional center: A place users return to see the beauty and peace they've created
  - Provide interactivity: Where "magical" moments happen - Sofia firefly arrives to "light up" new branches, new leaves appear after document uploads
- **Location**: Inside the application, post-login. Main part of the dashboard
- **Component**: `LegacyGarden` component

#### 2. Landing Page = "The Garden's Antechamber" (Predsieň Záhrady)

- **What it is**: Public introduction page serving as the "shop window"
- **Purpose**:
  - Provide a taste: Uses themes and visual elements from "The Garden" (flying firefly animation, growing tree imagery)
  - Promise experience: Communicates that inside the app awaits this living, growing "Legacy Garden"
- **Location**: Publicly accessible on main domain. First thing non-logged visitors see
- **Component**: Landing page components

#### 3. Onboarding = "The Journey to the Seed" (Cesta k Semienku)

- **What it is**: Introductory, story-driven process for new users
- **Purpose**:
  - Create the seed: At onboarding end, a symbolic "seed" is created in the "Box of Certainty"
  - Plant the seed: In final onboarding step, Sofia firefly symbolically carries and "plants" the seed, smoothly transitioning to dashboard where "The Garden" foundation awaits
- **Location**: Shows only once, after first user registration
- **Component**: Onboarding scene components

**Simple Metaphor Summary**:

- Landing Page = Beautiful, inviting gate to your garden
- Onboarding = Path from gate to where you plant the first seed  
- Dashboard = The Garden itself, cultivated and watched growing throughout life

### Onboarding Flow (Act 1)

- Scene 1 – Promise of calm: Firefly animation over night scene, CTA: "Start writing my story"
- Scene 2 – The Box of Certainty: Emotional prompt about items for loved ones, visual box animation
- Scene 3 – The Key of Trust: Name entry with key engraving update (e.g., "For Martina")
- Scene 4 – Preparing the path: Firefly light trail animation, redirect to dashboard

### Progress System (Act 2)

- First document upload: "Great! You've placed the first stone in your family's mosaic of certainty"
- Document expiry notifications: "A small reminder from your memory guardian"
- Pillar unlocks: After 5-7 TODAY items, unlock TOMORROW – Family Protection pillar

### Premium Features (Act 3)

- Time Capsule: Video messages as letter writing ("For my daughter Anna" → "On her 18th birthday")
- Annual ritual: Progress summary email with reflective nudge
- Legacy complete: Box of Certainty glow animation when all pillars ~90%+

## Implementation Guidelines

### Visual Language

- Prefer subtle motion (firefly trails) over spinners
- Use existing design tokens from CSS variables
- Dark mode friendly animations and interactions

### Progress & Gating

- Use existing pillar cards (isActive/isLocked) for unlocks
- Drive from simple heuristics (count of secured items)
- Supportive, non-intrusive notification copy

### Data Flow

- Initial onboarding inputs can be ephemeral (client state)
- Use typed Supabase interactions via provided client for persistence
- TanStack Query for server state management

## Language Policy (Critical)

- **All code, comments, and UI strings must be written in English**
- Even if tasks/prompts are in Slovak/Czech, implement in English
- If localization needed, extend i18n resources but keep English defaults
- Replace any Slovak/Czech text outside i18n with English
- **Exception**: i18n translation keys and values for internationalization can be in Slovak/Czech
- All other code, variable names, function names, and comments must remain in English

## Development Workflow & Quality Control

### Quality Control Protocol

After every file creation/modification:

#### Error Checking

- [ ] Syntax validation of all modified files
- [ ] TypeScript type checking
- [ ] ESLint validation
- [ ] Import/export path verification
- [ ] Dependencies compatibility check

#### Impact Analysis

- [ ] Analysis of effects on other files
- [ ] Breaking changes detection
- [ ] Cross-platform compatibility verification
- [ ] Performance impact assessment
- [ ] Security implications review

#### Testing

- [ ] Unit tests run for affected components
- [ ] Integration tests where relevant
- [ ] Build verification for affected packages
- [ ] Hot reload testing in development

### Git Workflow

After completing each development phase:

- [ ] Stage all changes: `git add .`
- [ ] Commit with descriptive message: `git commit -m "feat: implement [feature description]"`
- [ ] Push to GitHub: `git push origin main`
- [ ] Verify successful push

### Error Handling Protocol

When errors occur:

1. **Immediate Fix**: Fix error before continuing
2. **Root Cause Analysis**: Identify the cause
3. **Prevention**: Implement preventive measures
4. **Documentation**: Record in change log

### Performance Targets

- **Mobile app**: < 50MB bundle size, < 3s cold start
- **Web app**: Maintain current performance
- **Shared components**: < 100ms render time
- **Real-time sync**: < 2s propagation delay

### Security Requirements

- Maintain existing TweetNaCl encryption
- No keys in plain text
- Client-side encryption before upload
- Preserve Supabase RLS policies

### Debugging Protocol

- Console logs only in development mode
- Structured error reporting
- Performance monitoring hooks
- User-friendly error messages in production

## Monorepo Architecture

LegacyGuard is structured as a monorepo with shared packages:

```text
LegacyGuard/
├── web/                    # 🆕 Web application (formerly hollywood/)
│   ├── src/               # React web app source
│   ├── public/            # Web public assets  
│   ├── cypress/           # E2E tests
│   ├── dist/              # Web build output
│   ├── package.json       # Web-specific dependencies
│   └── vite.config.ts     # Web bundler config
├── mobile/                # React Native mobile app
├── packages/              # Shared packages
│   ├── ui/               # Shared UI components
│   ├── logic/            # Business logic
│   └── shared/           # Utilities
├── package.json          # Root monorepo config
└── turbo.json           # Build orchestration
```

### Monorepo Commands (Working ✅)

```bash
# Development servers
npm run web:dev          # Start web development server
npm run mobile:dev       # Start mobile development server

# Building applications
npm run web:build        # Build web application  
npm run build:web        # Build web via Turbo (with dependency caching)
npm run mobile:build     # Build mobile application
npm run build:mobile     # Build mobile via Turbo

# Comprehensive builds
npm run build            # Build entire monorepo
npm run build:all        # Build all workspaces
npm run build:packages   # Build shared packages only

# Testing
npm run test:web         # Run web tests
npm run test:mobile      # Run mobile tests
npm run test             # Run all tests

# Code quality
npm run lint             # Lint all workspaces
npm run type-check       # TypeScript validation across monorepo

# Cleanup
npm run clean:cache      # Clear build caches
npm run clean:dist       # Remove build outputs
npm run clean:all        # Full cleanup including node_modules
```

### Current Development Priorities

1. **Phase 1**: Monorepo setup and Tamagui implementation ✅ COMPLETED
2. **Critical components**: Button, Card, Input with cross-platform support
3. **i18n migration**: Centralization of all translations
4. **Testing setup**: Automated validation pipeline

## Development Notes

- The application uses React Router v7 future flags for forward compatibility
- All development should follow the established patterns and conventions
- Security is paramount - never compromise on encryption or authentication standards
