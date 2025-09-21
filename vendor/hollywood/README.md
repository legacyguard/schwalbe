# 🏰 Hollywood - LegacyGuard Document Management Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF)](https://vitejs.dev/)
[![Turbo](https://img.shields.io/badge/Turbo-2.5-EF4444)](https://turbo.build/)

## 📋 Description

Hollywood is a comprehensive monorepo for the LegacyGuard document management platform. It includes a web application, mobile application, shared packages for business logic and UI components, and a demo application showcasing the monorepo structure. The platform features end-to-end encryption, AI-powered document processing, multi-language support, and secure document storage with Supabase backend.

## 🚀 Quick Start

### Prerequisites

- **Node.js 20.18+** and **npm 10.8+**
- Git
- A code editor (VS Code recommended)

### Setup

```bash
# Clone the repository
git clone https://github.com/legacyguard/hollywood.git
cd hollywood

# Install dependencies (use legacy-peer-deps for compatibility)
npm install --legacy-peer-deps

# Copy environment variables (configure with your values)
cp .env.example .env.local
```

### Environment Configuration

Create `.env.local` in the root with:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key

# Feature Flags
VITE_IS_PRODUCTION=false  # Set to true for production
```

## 🏗️ Monorepo Structure

```
hollywood/
├── apps/                    # Applications
│   └── demo/               # Demo application showcasing packages
├── web/                    # Main web application (LegacyGuard)
├── mobile/                 # React Native mobile application
├── packages/               # Shared packages
│   ├── ui/                # UI components library (Tamagui-based)
│   ├── logic/             # Business logic and utilities
│   └── shared/            # Shared services and types
├── supabase/              # Backend configuration and migrations
├── docs/                  # Documentation
├── scripts/               # Build and utility scripts
├── locales/               # Internationalization files
└── turbo.json            # Turborepo configuration
```

### Package Descriptions

- **`@legacyguard/ui`**: Reusable UI components built with Tamagui
- **`@legacyguard/logic`**: Business logic, API definitions, and utilities
- **`@hollywood/shared`**: Shared services and type definitions
- **`@hollywood/demo`**: Demo app demonstrating package integration

## 💻 Development

### Common Commands

```bash
# Development
npm run dev              # Start all applications in dev mode
npm run dev:web         # Start web application only
npm run dev:mobile      # Start mobile application only
npm run dev:demo        # Start demo application only

# Building
npm run build           # Build all packages and applications
npm run build:packages  # Build shared packages only
npm run build:web      # Build web application
npm run build:demo     # Build demo application

# Testing
npm run test           # Run all tests
npm run test:packages  # Test packages only
npm run test:coverage  # Run tests with coverage

# Code Quality
npm run lint           # Run ESLint
npm run type-check     # Run TypeScript type checking
npm run format         # Format code with Prettier

# Performance
npm run analyze        # Analyze bundle size
npm run lighthouse     # Run Lighthouse performance tests
```

### Package Development

When developing packages, changes are automatically reflected in applications due to TypeScript path mapping:

1. **Make changes** in `packages/*/src`
2. **Build the package**: `npm run build:packages`
3. **Changes appear** in consuming applications

### Demo Application

The demo app (`apps/demo`) showcases package integration:

```bash
# Start demo app
npm run dev:demo

# Access at http://localhost:5174
```

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### E2E Tests

```bash
# Run Cypress tests
npm run test:e2e

# Open Cypress UI
npm run cypress:open
```

## 📦 Building for Production

### Web Application

```bash
# Build the web application
npm run build:web

# Preview production build
npm run preview:web
```

### Mobile Application

```bash
# Build for iOS
npm run build:ios

# Build for Android
npm run build:android
```

## 🔧 Turbo Commands

This monorepo uses Turborepo for efficient builds:

```bash
# Run specific turbo pipeline
npx turbo run build --filter=@legacyguard/ui

# Clear turbo cache
npx turbo run build --force

# Run with specific concurrency
npx turbo run test --concurrency=2

# Analyze build graph
npx turbo run build --graph
```

## 🌍 Internationalization

The platform supports 28 languages. Language files are located in:
- `locales/` - Translation files
- `web/src/i18n/` - i18n configuration

### Supported Languages

English, Czech, Slovak, German, French, Spanish, Italian, Dutch, Polish, Portuguese, Romanian, Hungarian, Bulgarian, Croatian, Serbian, Slovenian, Greek, Turkish, Ukrainian, Russian, Arabic, Chinese, Japanese, Korean, Hindi, Vietnamese, Thai, Indonesian

## 🛠️ Troubleshooting

### Common Issues

1. **Dependency conflicts**: Use `npm install --legacy-peer-deps`
2. **Build errors**: Clear cache with `rm -rf node_modules .turbo dist` and reinstall
3. **TypeScript errors**: Run `npm run build:packages` first
4. **Port conflicts**: Check if ports 5173 (web) or 5174 (demo) are in use

### Debug Mode

Enable debug logging:

```bash
DEBUG=* npm run dev
```

## 📚 Documentation

- [Developer Guide](docs/DEVELOPER_GUIDE.md) - Detailed development instructions
- [Architecture](docs/ARCHITECTURE.md) - System architecture overview
- [API Documentation](docs/API.md) - API reference
- [Environment Variables](docs/ENVIRONMENT_VARIABLES.md) - Configuration guide
- [Build Troubleshooting](docs/BUILD_TROUBLESHOOTING.md) - Build issue solutions

## 🤝 Contributing

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Maintenance tasks

### Code Style

- TypeScript for type safety
- ESLint for linting
- Prettier for formatting
- Follow existing patterns

## 📈 Performance

The monorepo includes performance optimization:

- Turbo caching for faster builds
- Code splitting in applications
- Tree shaking for smaller bundles
- Lazy loading for routes

Monitor performance:

```bash
# Run performance tests
npm run test:performance

# Analyze bundle
npm run analyze
```

## 🔐 Security

- End-to-end encryption for documents
- Secure authentication with Clerk
- Row-level security with Supabase
- Regular dependency updates

Report security issues to: security@legacyguard.app

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/legacyguard/hollywood/issues)
- **Email**: support@legacyguard.app

## 👥 Team

Built with ❤️ by the LegacyGuard team

---

**Note**: This is a monorepo managed with npm workspaces and Turborepo. All packages are interconnected and should be developed together.
