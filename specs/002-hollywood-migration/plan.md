# Plan: Hollywood Migration to Schwalbe

## Migration Strategy

**Approach**: Selective migration with clean-room refactoring

- Copy proven architectural patterns and configurations
- Extract reusable components while removing hollywood-specific coupling
- Maintain compatibility with 001-reboot-foundation monorepo standards

## Phase 1: Foundation Infrastructure (Week 1)

### **1.1 Monorepo Structure Setup**

- Copy `apps/` and `packages/` directory structure to schwalbe
- Port `package.json` workspace configuration
- Migrate `turbo.json` with build pipelines
- Copy `.nvmrc`, `tsconfig.base.json`, root configs

### **1.2 Build Tooling**

- Do not migrate Vite configurations; target Next.js App Router in `apps/web-next` (see spec 019-nextjs-migration)
- Port TypeScript Project References setup
- Migrate ESLint configurations with boundary rules
- Copy Prettier and other code quality tools

### **1.3 Development Environment**

- Port development scripts and automation
- Copy `.env.example` templates
- Migrate debugging configurations
- Set up hot reload and development server

## Phase 2: Core Packages Migration (Week 2)

### **2.1 UI Package (`@schwalbe/ui`)**

- Copy complete shadcn/ui implementation
- Port custom components (Button, Card, forms, etc.)
- Migrate Tailwind configuration and theme system
- Copy Storybook setup and component documentation
- Update import paths and package references

#### Storybook/UI Enablement

- Configure Storybook for `@schwalbe/ui` with Vite builder
- Add core stories: Button, Card, Input, Dialog, Toast, Motion primitives
- Add MDX docs for design tokens, theming, and accessibility
- Integrate visual regression baseline (Chromatic or Playwright snapshot)

### **2.2 Shared Package (`@schwalbe/shared`)**

- Copy core service abstractions (auth, monitoring, utilities)
- Port encryption utilities and security patterns
- Migrate Supabase client configuration (without secrets)
- Copy logging and error handling patterns
- Refactor hollywood-specific service references

#### Notifications & Email foundations

- Introduce `NotificationService` interface and provider adapters (Resend/SES abstractions)
- Add templating strategy (React Email or MJML) and template registry
- Define event-to-template mapping and localization strategy
- Provide sandbox transport for local/dev and test fixtures

#### Stripe foundations

- Add `StripeClientFactory` with env-driven keys (test-only in 002)
- Define domain types: Product, Price, SubscriptionPlan, InvoiceSummary
- Provide helpers for creating payment links and invoices (no secrets checked in)
- Document environment separation and seed strategy for 003

### **2.3 Logic Package (`@schwalbe/logic`)**

- Copy API definitions and data contracts
- Port business logic patterns and validation
- Migrate service layer implementations
- Copy utility functions and helpers
- Update service interfaces for schwalbe

#### OCR/AI scaffolding

- Define `OcrService` and `AiService` interfaces with provider-agnostic implementations
- Add job/queue pattern contracts for async processing
- Provide parser pipeline interfaces for document categorization and summarization
- Include deterministic fixtures for CI without external calls

## Phase 3: Internationalization System (Week 3)

### **3.1 i18n Infrastructure**

- Copy i18next configuration and setup
- Port language detection and switching logic
- Migrate translation loading and caching
- Copy localization utilities and helpers

### **3.2 Translation Content**

- Copy core UI translations (EN/CS/SK)
- Port legal terminology and jurisdiction-aware content
- Migrate form labels, validation messages
- Copy error messages and system notifications
- Validate translation completeness

### **3.3 Localization Features**

- Copy jurisdiction detection logic
- Port country-specific content handling
- Migrate legal compliance text variations
- Copy currency and date formatting utilities

#### Notifications & Storybook localization

- Ensure notification templates support i18n placeholders
- Configure Storybook to preview components across locales and right-to-left if needed

## Phase 4: Security & Encryption (Week 4)

### **4.1 Client-Side Encryption**

- Copy TweetNaCl integration and wrapper utilities
- Port key management and derivation logic
- Migrate secure storage patterns
- Copy encryption/decryption service layer

### **4.2 Security Patterns**

- Copy Content Security Policy configurations
- Port XSS prevention mechanisms (Trusted Types)
- Migrate authentication patterns and guards
- Copy audit logging and security monitoring

### **4.3 Zero-Knowledge Architecture**

- Copy client-side data processing patterns
- Port server communication with encrypted payloads
- Migrate key exchange and management
- Copy privacy-preserving storage strategies

#### Security improvements for new foundations

- Harden Content Security Policy for Storybook and app parity
- Validate Trusted Types in Storybook preview environment
- Ensure Stripe scripts and endpoints are whitelisted only in app contexts

## Phase 5: Testing & Quality (Week 5)

### **5.1 Testing Infrastructure**

- Copy Jest configuration and test utilities
- Port testing helpers, mocks, and fixtures
- Migrate component testing patterns
- Copy coverage reporting setup

#### New foundations test coverage

- Add unit tests for NotificationService adapters (sandbox)
- Add pure-function tests for OCR/AI parsing pipeline with fixtures
- Add Stripe helper tests using mocked SDK

### **5.2 E2E Testing**

- Copy Playwright configuration and test structure
- Port critical user journey tests
- Migrate test data and scenarios
- Copy visual regression test setup

#### Key journeys to cover (scaffold)

- Language switching reflected in Storybook examples
- Demo page sends test notification via sandbox transport
- Demo flow creates mock payment link (no network) and displays URL

### **5.3 Quality Assurance**

- Copy linting rules and code quality gates
- Port performance monitoring setup
- Migrate accessibility testing patterns
- Copy security scanning configurations

## Phase 6: CI/CD & DevOps (Week 6)

### **6.1 GitHub Actions**

- Copy workflow configurations (.github/workflows/)
- Port build, test, and deployment pipelines
- Migrate environment-specific configurations
- Copy security scanning and dependency checks

### **6.2 Environment Management**

- Copy environment configuration patterns
- Port staging and production setup templates
- Migrate secret management strategies
- Copy deployment scripts and automation

### **6.3 Monitoring & Analytics**

- Copy performance monitoring setup
- Port error logging to Supabase logs + DB error table; set up Resend alerts (no Sentry)
- Migrate analytics and usage tracking
- Copy health check and alerting patterns

#### Funnel & events instrumentation scaffolding

- Define common event schema (view, click, conversion) in `@schwalbe/shared`
- Add analytics interface with no-op implementation for 002; real provider added in 003

## Implementation Guidelines

### **Code Migration Rules**

1. **Clean imports**: Update all package references to `@schwalbe/*`
2. **Remove coupling**: Extract hollywood-specific dependencies
3. **Preserve patterns**: Maintain architectural decisions and abstractions
4. **Update documentation**: Reflect schwalbe-specific setup and usage
5. **Test thoroughly**: Validate each migrated component works independently

### **Quality Gates**

- [ ] All packages build successfully in isolation
- [ ] TypeScript strict mode passes without errors
- [ ] ESLint boundary rules prevent invalid imports
- [ ] Unit tests pass for migrated components
- [ ] Storybook renders components correctly
- [ ] Development server starts without errors

### **Risk Management**

- **Dependency conflicts**: Pin versions; use exact semver matches from hollywood
- **Path references**: Use workspace: protocol; avoid relative imports across packages  
- **Service coupling**: Extract interfaces; use dependency injection patterns
- **Environment variables**: Template all configs; document required secrets
- **Build performance**: Monitor bundle sizes; maintain hollywood optimization levels

## Success Criteria

### **Technical Validation**

- Monorepo builds and tests pass
- Development workflow matches hollywood productivity
- Package boundaries properly enforced
- Security patterns operational
- i18n system fully functional

### **Development Experience**

- Hot reload and debugging work seamlessly  
- Storybook provides component documentation
- Type checking provides helpful developer feedback
- Build times comparable to or better than hollywood
- Testing suite provides good coverage and fast feedback

## Next Phase Planning

Upon completion of Phase 6, recommend creating:

- **003-core-features**: Sofia AI system, document vault, emergency access
- **004-application-features**: Will creation, family collaboration, professional network
- **005-mobile-integration**: React Native app migration and sync
