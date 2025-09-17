# Developer Guide - Hollywood Monorepo

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Getting Started](#getting-started)
3. [Project Structure](#project-structure)
4. [Development Workflow](#development-workflow)
5. [Package Development](#package-development)
6. [Application Development](#application-development)
7. [Testing Strategy](#testing-strategy)
8. [Deployment](#deployment)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

## Architecture Overview

Hollywood is a TypeScript monorepo using npm workspaces and Turborepo for efficient builds and development. The architecture follows a modular design with clear separation of concerns:

```
┌─────────────────────────────────────────────────┐
│                   Applications                   │
├─────────────────┬─────────────┬─────────────────┤
│   Web (React)   │   Mobile    │   Demo App      │
│                 │ (React Native)│                │
└────────┬────────┴──────┬──────┴────────┬────────┘
         │               │               │
┌────────▼────────────────▼────────────────▼────────┐
│                    Packages                        │
├─────────────┬──────────────┬──────────────────────┤
│     UI      │    Logic     │      Shared          │
│  Components │   Business   │    Services          │
│  (Tamagui)  │    Rules     │     Types            │
└─────────────┴──────────────┴──────────────────────┘
         │               │               │
┌────────▼────────────────▼────────────────▼────────┐
│                   Backend                          │
├────────────────────────────────────────────────────┤
│            Supabase (PostgreSQL + Auth)            │
│              Edge Functions (Deno)                 │
└────────────────────────────────────────────────────┘
```

### Key Technologies

- **Frontend**: React 18, TypeScript 5.3, Vite 5.4
- **Mobile**: React Native, Expo
- **UI Framework**: Tamagui (cross-platform components)
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **Build System**: Turborepo, npm workspaces
- **Testing**: Vitest, React Testing Library, Cypress
- **Styling**: Tailwind CSS, Tamagui themes

## Getting Started

### System Requirements

- Node.js 20.18+ (use `nvm` for version management)
- npm 10.8+
- Git
- VS Code with recommended extensions

### Initial Setup

1. **Clone and Install**

```bash
# Clone repository
git clone https://github.com/legacyguard/hollywood.git
cd hollywood

# Install dependencies
npm install --legacy-peer-deps

# Build packages
npm run build:packages
```

2. **Environment Setup**

Create `.env.local` files:

```bash
# Root .env.local
cp .env.example .env.local

# Web application
cp web/.env.example web/.env.local

# Mobile application
cp mobile/.env.example mobile/.env.local
```

3. **Configure Supabase**

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. **Configure Clerk Authentication**

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your-key
```

## Project Structure

### Root Level

```
hollywood/
├── apps/               # Standalone applications
│   └── demo/          # Demo app showing package usage
├── web/               # Main web application
├── mobile/            # Mobile application
├── packages/          # Shared packages
│   ├── ui/           # UI component library
│   ├── logic/        # Business logic
│   └── shared/       # Shared utilities
├── supabase/         # Database and backend
│   ├── functions/    # Edge functions
│   └── migrations/   # Database migrations
├── docs/             # Documentation
├── scripts/          # Build and utility scripts
├── locales/          # i18n translations
├── package.json      # Root package config
├── turbo.json        # Turborepo config
└── tsconfig.json     # TypeScript config
```

### Package Structure

Each package follows this structure:

```
packages/[name]/
├── src/              # Source code
│   ├── index.ts     # Main exports
│   ├── components/  # Components (ui package)
│   ├── services/    # Services (logic/shared)
│   └── types/       # TypeScript types
├── dist/            # Built output
├── package.json     # Package config
├── tsconfig.json    # TypeScript config
└── README.md        # Package documentation
```

## Development Workflow

### 1. Start Development Servers

```bash
# Start everything
npm run dev

# Start specific apps
npm run dev:web      # Web only
npm run dev:mobile   # Mobile only
npm run dev:demo     # Demo only
```

### 2. Make Changes

- **Web App**: Edit files in `web/src/`
- **Packages**: Edit files in `packages/*/src/`
- **Mobile**: Edit files in `mobile/`

### 3. Hot Module Replacement

- Web and demo apps support HMR
- Package changes require rebuild: `npm run build:packages`

### 4. Testing

```bash
# Run all tests
npm test

# Run specific package tests
npm run test --workspace=@legacyguard/logic

# Watch mode
npm run test:watch
```

### 5. Type Checking

```bash
# Check all TypeScript
npm run type-check

# Check specific package
cd packages/ui && npm run type-check
```

## Package Development

### Creating a New Package

1. **Create package directory**

```bash
mkdir -p packages/my-package/src
cd packages/my-package
```

2. **Initialize package.json**

```json
{
  "name": "@legacyguard/my-package",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "vitest"
  },
  "dependencies": {},
  "devDependencies": {
    "typescript": "^5.3.0"
  }
}
```

3. **Create tsconfig.json**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

4. **Add to root package.json workspaces**

```json
{
  "workspaces": [
    "packages/*",
    "web",
    "mobile",
    "apps/*"
  ]
}
```

### Using Packages in Applications

1. **Add dependency**

```json
// In web/package.json
{
  "dependencies": {
    "@legacyguard/my-package": "file:../packages/my-package"
  }
}
```

2. **Import and use**

```typescript
import { MyComponent } from '@legacyguard/my-package';
```

## Application Development

### Web Application

The web app is a React SPA with:

- **Routing**: React Router v6
- **State**: Zustand + React Query
- **Styling**: Tailwind CSS + Tamagui
- **Auth**: Clerk
- **Database**: Supabase

Key directories:

```
web/src/
├── pages/          # Route pages
├── components/     # UI components
├── hooks/          # Custom hooks
├── services/       # Business logic
├── lib/           # Utilities
├── i18n/          # Translations
└── styles/        # Global styles
```

### Mobile Application

React Native app with Expo:

```
mobile/
├── app/           # Expo Router pages
├── components/    # Native components
├── hooks/         # Custom hooks
├── services/      # Native services
└── assets/        # Images, fonts
```

### Demo Application

Simple Vite app demonstrating packages:

```
apps/demo/
├── src/
│   ├── App.tsx    # Main component
│   └── main.tsx   # Entry point
└── index.html     # HTML template
```

## Testing Strategy

### Unit Tests

```typescript
// packages/logic/src/utils/date.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate } from './date';

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2024-01-01');
    expect(formatDate(date)).toBe('January 1, 2024');
  });
});
```

### Integration Tests

```typescript
// web/src/services/__tests__/auth.test.ts
import { renderHook } from '@testing-library/react';
import { useAuth } from '../auth';

describe('Auth Service', () => {
  it('handles login flow', async () => {
    const { result } = renderHook(() => useAuth());
    await result.current.login('test@example.com', 'password');
    expect(result.current.isAuthenticated).toBe(true);
  });
});
```

### E2E Tests

```typescript
// cypress/e2e/login.cy.ts
describe('Login Flow', () => {
  it('allows user to login', () => {
    cy.visit('/login');
    cy.get('[data-testid="email"]').type('test@example.com');
    cy.get('[data-testid="password"]').type('password');
    cy.get('[data-testid="submit"]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

## Deployment

### Production Build

```bash
# Build everything
npm run build

# Build specific app
npm run build:web
npm run build:mobile
```

### Environment-Specific Builds

```bash
# Staging
VITE_IS_PRODUCTION=false npm run build

# Production
VITE_IS_PRODUCTION=true npm run build
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## Best Practices

### Code Organization

1. **Single Responsibility**: Each module/component does one thing
2. **DRY**: Share code through packages
3. **Type Safety**: Use TypeScript strictly
4. **Pure Functions**: Prefer functional programming

### Component Guidelines

```typescript
// Good: Typed, documented, testable
interface ButtonProps {
  /** Button label */
  label: string;
  /** Click handler */
  onClick: () => void;
  /** Visual variant */
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  variant = 'primary' 
}) => {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};
```

### Service Layer Pattern

```typescript
// services/UserService.ts
export class UserService {
  private static instance: UserService;
  
  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }
  
  async getUser(id: string): Promise<User> {
    // Implementation
  }
  
  async updateUser(id: string, data: Partial<User>): Promise<User> {
    // Implementation
  }
}
```

### Error Handling

```typescript
// Use custom error classes
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Handle errors consistently
try {
  const result = await apiCall();
  return result;
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`API Error ${error.code}: ${error.message}`);
    // Handle specific error
  } else {
    console.error('Unexpected error:', error);
    // Handle generic error
  }
}
```

## Troubleshooting

### Common Issues

#### 1. Dependency Issues

```bash
# Clear everything and reinstall
rm -rf node_modules package-lock.json
rm -rf packages/*/node_modules
rm -rf web/node_modules mobile/node_modules
npm install --legacy-peer-deps
```

#### 2. TypeScript Errors

```bash
# Rebuild packages
npm run build:packages

# Clear TypeScript cache
rm -rf packages/*/dist
rm -rf packages/*/*.tsbuildinfo
```

#### 3. Build Failures

```bash
# Clear Turbo cache
rm -rf .turbo
npx turbo run build --force
```

#### 4. Port Conflicts

```bash
# Find process using port
lsof -i :5173  # Web default
lsof -i :5174  # Demo default

# Kill process
kill -9 [PID]
```

### Debug Tools

1. **VS Code Debugger**

```json
// .vscode/launch.json
{
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Debug Web App",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/web"
    }
  ]
}
```

2. **React DevTools**

```bash
# Install extension
npm install -g react-devtools

# Launch
react-devtools
```

3. **Network Debugging**

```typescript
// Enable request logging
if (process.env.NODE_ENV === 'development') {
  window.addEventListener('fetch', (e) => {
    console.log('API Request:', e.request.url);
  });
}
```

## Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Tamagui Documentation](https://tamagui.dev/)
- [Supabase Documentation](https://supabase.com/docs)

---

For more information, see the [main README](../README.md) or contact the development team.
