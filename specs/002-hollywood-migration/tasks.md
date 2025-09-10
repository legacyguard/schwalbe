# Tasks: 002-hollywood-migration

## Ordering & rules

- Complete 001-reboot-foundation tasks first (prerequisite).
- Migration phases must complete in order: infrastructure → packages → features.
- Each migrated component must build and test independently.
- Maintain zero breaking changes to existing schwalbe structure.

## T100 Prerequisites & Setup

- [ ] T100 Verify 001-reboot-foundation spec completed and accepted
- [ ] T101 Create backup of current schwalbe state before migration begins
- [ ] T102 Document hollywood package versions and dependency matrix

## T110 Foundation Infrastructure Migration

### T111 Monorepo Structure

- [ ] T111a Copy `turbo.json` from hollywood; adapt for schwalbe package names
- [ ] T111b Copy root `package.json` workspace config; update package references  
- [ ] T111c Copy `.nvmrc` and `engines` requirements from hollywood
- [ ] T111d Port `tsconfig.base.json` and TypeScript Project References setup

### T112 Build Configuration

- [ ] T112a Copy ESLint config with boundary rules; adapt for `@schwalbe/*` packages
- [ ] T112b Copy Prettier configuration and code formatting rules
- [ ] T112c Port PostCSS and Tailwind configurations
- [ ] T112d Copy Vite base configuration patterns

### T113 Development Tooling

- [ ] T113a Copy development scripts (build, dev, test automation)
- [ ] T113b Port debugging configurations and source maps setup
- [ ] T113c Copy performance monitoring and bundle analysis tools
- [ ] T113d Migrate `.env.example` templates with schwalbe-specific vars

## T120 Core Packages Migration

### T121 UI Package (`@schwalbe/ui`)

- [ ] T121a Create `packages/ui/` structure; copy package.json and configs
- [ ] T121b Copy shadcn/ui base components (Button, Card, Input, etc.)
- [ ] T121c Port custom component enhancements and LegacyGuard-specific variants
- [ ] T121d Copy Tailwind theme configuration and design tokens
- [ ] T121e Port Storybook setup and component documentation
- [ ] T121f Update all import paths to use `@schwalbe/ui`
- [ ] T121g Validate component library builds and renders correctly

### T122 Shared Package (`@schwalbe/shared`)

- [ ] T122a Create `packages/shared/` structure; copy package.json
- [ ] T122b Copy core utility functions and helper libraries
- [ ] T122c Port authentication service abstractions (remove Clerk coupling)
- [ ] T122d Copy encryption utilities and security patterns
- [ ] T122e Port Supabase client configuration (template secrets)
- [ ] T122f Copy monitoring and logging service patterns
- [ ] T122g Update service interfaces for schwalbe-specific needs
- [ ] T122h Validate shared package builds and exports correctly

### T123 Logic Package (`@schwalbe/logic`)

- [ ] T123a Create `packages/logic/` structure; copy package.json
- [ ] T123b Copy API definitions and data contract schemas (Zod)
- [ ] T123c Port business logic patterns and validation rules
- [ ] T123d Copy service layer implementations and abstractions
- [ ] T123e Port error handling and API response patterns
- [ ] T123f Update business logic for schwalbe domain requirements
- [ ] T123g Validate logic package builds and type checking passes

## T130 Internationalization System Migration

### T131 i18n Infrastructure

- [ ] T131a Copy i18next configuration and initialization
- [ ] T131b Port language detection and switching logic
- [ ] T131c Copy translation loading and caching mechanisms
- [ ] T131d Port localization utilities and formatting helpers

### T132 Translation Content

- [ ] T132a Copy core UI translations for EN/CS/SK languages
- [ ] T132b Port legal terminology and jurisdiction-aware content
- [ ] T132c Copy form labels, validation messages, and error text
- [ ] T132d Port system notifications and user-facing messages
- [ ] T132e Validate translation completeness and consistency

### T133 Localization Features

- [ ] T133a Copy jurisdiction detection and country-specific logic
- [ ] T133b Port legal compliance text variations by country
- [ ] T133c Copy currency formatting and date localization
- [ ] T133d Port region-specific content handling patterns

## T140 Security & Encryption Migration

### T141 Client-Side Encryption

- [ ] T141a Copy TweetNaCl integration and encryption wrapper utilities
- [ ] T141b Port key management, generation, and derivation logic
- [ ] T141c Copy secure storage patterns for browser environments
- [ ] T141d Port encryption/decryption service layer and interfaces

### T142 Security Patterns

- [ ] T142a Copy Content Security Policy configurations
- [ ] T142b Port XSS prevention mechanisms and Trusted Types setup
- [ ] T142c Copy authentication patterns and route guards
- [ ] T142d Port audit logging and security monitoring patterns

### T143 Zero-Knowledge Architecture

- [ ] T143a Copy client-side data processing and encryption patterns
- [ ] T143b Port server communication with encrypted payload handling
- [ ] T143c Copy key exchange mechanisms and protocols
- [ ] T143d Port privacy-preserving storage and retrieval strategies

## T150 Testing & Quality Infrastructure

### T151 Testing Setup

- [ ] T151a Copy Jest configuration and test runner setup
- [ ] T151b Port testing utilities, mocks, and fixture patterns
- [ ] T151c Copy component testing patterns and helpers
- [ ] T151d Port coverage reporting and threshold configurations

### T152 E2E Testing

- [ ] T152a Copy Playwright configuration and test structure
- [ ] T152b Port critical user journey test scenarios
- [ ] T152c Copy test data generation and management patterns
- [ ] T152d Port visual regression testing setup (if applicable)

### T153 Quality Gates

- [ ] T153a Copy linting rules and code quality standards
- [ ] T153b Port performance monitoring and Web Vitals tracking
- [ ] T153c Copy accessibility testing patterns and standards
- [ ] T153d Port security scanning and dependency checking

## T160 CI/CD & DevOps Migration

### T161 GitHub Actions

- [ ] T161a Copy workflow configurations from `.github/workflows/`
- [ ] T161b Port build, test, and quality checking pipelines
- [ ] T161c Copy security scanning and dependency audit workflows
- [ ] T161d Update environment variables and secrets references for schwalbe

### T162 Environment Management

- [ ] T162a Copy environment configuration patterns and templates
- [ ] T162b Port staging and production deployment configurations
- [ ] T162c Copy secret management strategies and documentation
- [ ] T162d Port deployment scripts and automation tools

### T163 Monitoring & Analytics

- [ ] T163a Copy performance monitoring setup and configurations
- [ ] T163b Port error tracking configurations (Sentry or similar)
- [ ] T163c Copy analytics and usage tracking patterns
- [ ] T163d Port health check and alerting configurations

## T170 Integration & Validation

### T171 Package Integration Testing

- [ ] T171a Verify all packages build successfully in isolation
- [ ] T171b Validate TypeScript strict mode passes without errors
- [ ] T171c Test ESLint boundary rules prevent invalid cross-package imports
- [ ] T171d Verify Turborepo pipelines execute correctly

### T172 Development Workflow Validation

- [ ] T172a Test development server startup and hot reload functionality
- [ ] T172b Validate Storybook renders components correctly
- [ ] T172c Test build process produces optimized bundles
- [ ] T172d Verify debugging and source map functionality

### T173 Security Validation

- [ ] T173a Test encryption/decryption functionality works correctly
- [ ] T173b Validate CSP and security headers are properly configured
- [ ] T173c Test authentication patterns and route protection
- [ ] T173d Verify audit logging captures security events

## T180 Documentation & Cleanup

### T181 Documentation Updates

- [ ] T181a Update README files for all migrated packages
- [ ] T181b Document new package dependencies and interfaces
- [ ] T181c Create migration notes and breaking changes documentation
- [ ] T181d Update CLAUDE.md with migrated technologies and commands

### T182 Code Cleanup

- [ ] T182a Remove any temporary migration scaffolding or debugging code
- [ ] T182b Standardize code formatting across all migrated files
- [ ] T182c Verify no dead code or unused dependencies remain
- [ ] T182d Update package.json versions and metadata

## T190 Acceptance & Handoff

### T191 Final Validation

- [ ] T191a Run complete test suite and verify 100% pass rate
- [ ] T191b Validate build performance matches or exceeds hollywood
- [ ] T191c Test full development workflow from clone to running app
- [ ] T191d Verify all security patterns operational and tested

### T192 Acceptance Criteria

- [ ] T192a All spec.md acceptance criteria marked complete
- [ ] T192b Migration created no breaking changes to existing schwalbe code
- [ ] T192c Development experience matches or exceeds hollywood productivity
- [ ] T192d All migrated components properly documented and tested

## Post-Migration Planning

Upon completion, assess need for:

- **003-core-features** spec: Sofia AI, document vault, emergency systems
- **004-application-features** spec: Will creation, family collaboration
- **005-mobile-integration** spec: React Native migration and synchronization
