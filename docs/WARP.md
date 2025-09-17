# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

LegacyGuard Mobile - A mobile application for the LegacyGuard platform, providing users with secure access to their legacy planning, will generation, and document management features on mobile devices.

## Technology Stack

### Setup

- **Framework**: Expo with React Native and TypeScript
- **State Management**: Redux Toolkit or Zustand
- **Authentication**: Clerk integration (matching web app)
- **Storage**: Expo SecureStore for sensitive data, AsyncStorage for general data
- **API Communication**: RESTful API or GraphQL to LegacyGuard backend
- **Navigation**: React Navigation v6

## Core Features to Implement

Based on the LegacyGuard platform:

1. **Authentication & Security** ✅ Implemented
   - Clerk authentication integration ✅
   - Biometric authentication support ✅
   - Secure local data storage with encryption (expo-secure-store) ✅
   - JWT token management for Supabase ✅

2. **Will Generator**
   - Step-by-step wizard interface
   - Integration with people and asset services
   - Offline capability with sync

3. **Document Management** 🚧 In Progress
   - Intelligent Document Scanner ✅
     - Camera integration with react-native-vision-camera
     - Document edge detection frame
     - Quality validation
     - Future: OCR and AI metadata extraction
   - Secure document vault
   - Category-based organization
   - File upload and metadata management

4. **People Management (Trusted Circle)**
   - Manage guardians, beneficiaries, executors
   - Contact information and role management

5. **Asset Management (My Possessions)**
   - Track and categorize assets
   - Asset valuation and details

## Development Setup

### Prerequisites

```bash
# Install Expo CLI globally (optional, npx can be used instead)
npm install -g expo-cli

# For iOS development
xcode-select --install
# Install Xcode from Mac App Store

# For Android development
# Install Android Studio and configure Android SDK
```

### Environment Setup

1. **Create .env file** from .env.example:

```bash
cp .env.example .env
```

1. **Add your Clerk Publishable Key** to .env:

```bash
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### Common Commands

```bash
# Install dependencies
npm install

# Start Expo development server
npm start
# or
expo start

# Run on iOS simulator
npm run ios
# or
expo start --ios

# Run on Android emulator
npm run android
# or
expo start --android

# Run on web
npm run web
# or
expo start --web

# Clear cache and start fresh
expo start -c

# Build for production
eas build --platform ios
eas build --platform android

# Type checking
npx tsc --noEmit

# Lint code (once configured)
npm run lint
```

## Project Structure Guidelines

```text
mobile/
├── src/
│   ├── components/       # Reusable UI components
│   ├── screens/          # Screen components
│   ├── navigation/       # Navigation configuration
│   ├── services/         # API and service layer
│   ├── store/           # State management
│   ├── utils/           # Utility functions
│   ├── hooks/           # Custom React hooks
│   └── constants/       # App constants
├── ios/                 # iOS specific code
├── android/             # Android specific code
└── __tests__/          # Test files
```

## Security Considerations

1. **Data Encryption**
   - All sensitive data must be encrypted at rest
   - Use platform-specific secure storage (iOS Keychain, Android Keystore)

2. **Authentication**
   - Implement biometric authentication where available
   - Ensure Clerk tokens are securely stored
   - Implement session timeout for security

3. **Network Security**
   - All API communications must use HTTPS
   - Implement certificate pinning for additional security
   - Handle offline scenarios gracefully

## UI/UX Guidelines

Based on LegacyGuard's design philosophy:

1. **Design Principles**
   - Serious, contemplative UX
   - Premium, minimalist interface
   - Empathetic and reassuring tone
   - Focus on clarity and simplicity

2. **Component Patterns**
   - Step-by-step wizards for complex tasks
   - Progressive disclosure of information
   - Clear visual hierarchy
   - Consistent navigation patterns

3. **Accessibility**
   - Support for screen readers
   - Adequate touch targets (minimum 44x44 points)
   - High contrast mode support
   - Font scaling support

## API Integration

1. **Endpoints**
   - Maintain consistency with web app API structure
   - Implement proper error handling
   - Cache responses where appropriate

2. **Offline Support**
   - Queue actions for sync when online
   - Local data caching strategy
   - Conflict resolution for data sync

## Testing Strategy

1. **Unit Tests**
   - Test business logic and utilities
   - Mock external dependencies

2. **Integration Tests**
   - Test API integrations
   - Test navigation flows

3. **E2E Tests**
   - Use Detox or Appium for end-to-end testing
   - Cover critical user journeys

## Performance Optimization

1. **App Size**
   - Minimize bundle size
   - Use code splitting where applicable
   - Optimize images and assets

2. **Runtime Performance**
   - Implement lazy loading
   - Optimize list rendering with virtualization
   - Minimize re-renders

3. **Memory Management**
   - Proper cleanup of listeners and subscriptions
   - Efficient image caching

## Release Process

1. **Version Management**
   - Follow semantic versioning
   - Maintain changelog

2. **Build Process**
   - Configure CI/CD pipelines
   - Automate build and deployment

3. **App Store Submission**
   - Prepare app store assets
   - Handle review guidelines compliance

## Platform-Specific Considerations

### iOS

- Handle iOS-specific permissions
- Implement proper background task handling
- Support for latest iOS versions

### Android

- Handle Android permissions model
- Support for different screen sizes
- Background service implementation

## Internationalization

- Prepare for multi-language support (34+ languages)
- Use modular translation structure
- RTL language support consideration

## Important Context from Web App

The mobile app should maintain feature parity with key web app features:

- Will Generator wizard flow
- MicroTaskEngine for breaking down complex tasks
- ScenarioPlanner for "what if" scenarios
- Document management with categories
- People management (Trusted Circle)
- Asset tracking (My Possessions)

Maintain consistency with the web app's:

- Privacy-first architecture
- Empathetic UX approach
- Step-by-step task philosophy
- Progressive disclosure patterns

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

### Shared Packages

1. **@legacyguard/ui**
   - Tamagui-based cross-platform components
   - Consistent design system across web and mobile
   - Theme management and responsive design

2. **@legacyguard/shared**
   - Encryption services (TweetNaCl)
   - Supabase client configuration
   - Real-time sync utilities
   - Common business logic

3. **@legacyguard/locales**
   - Centralized translation management
   - Support for 34+ languages
   - Modular structure for better performance

4. **@legacyguard/config**
   - Shared TypeScript configurations
   - ESLint and build configurations
   - Common development tooling

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

## Development Workflow

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

### Error Handling Protocol

When errors occur:

1. **Immediate Fix**: Fix error before continuing
2. **Root Cause Analysis**: Identify the cause
3. **Prevention**: Implement preventive measures
4. **Documentation**: Record in change log

### Debugging Protocol

- Console logs only in development mode
- Structured error reporting
- Performance monitoring hooks
- User-friendly error messages in production
