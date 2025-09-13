# Plan: i18n & Country Rules Implementation

## Phase 1: i18n Setup (Week 1)

### **1.1 next-intl Integration (`apps/web-next`)**

- Replace current i18next setup with next-intl in apps/web-next
- Configure middleware for language routing and detection
- Set up basic locale structure with English as source of truth
- Implement lazy loading for locale bundles
- Add TypeScript support for i18n keys
- Create i18n configuration with fallback mechanisms

### **1.2 Locale Import & Curation (`packages/shared`)**

- Import curated JSON locales from Hollywood i18n system
- Adapt Hollywood namespace structure (ui, content/wills, content/family-shield)
- Convert jurisdiction-based locales to country-specific rules
- Ensure English is the canonical source for all translations
- Implement locale validation and normalization
- Create locale management utilities

### **1.3 i18n Health Checks (`scripts/`)**

- Implement CI health check workflow for missing/extra keys
- Add locale completeness validation scripts
- Create translation key extraction and comparison tools
- Implement automated i18n testing in CI pipeline
- Add bundle size monitoring for locale impact
- Create i18n accessibility validation

## Phase 2: Country Rules (Week 2)

### **2.1 Country Rule Engine (`packages/logic`)**

- Implement country-specific language rules logic
- Create Russian→Ukrainian replacement system
- Build Ukrainian removal for Iceland and Liechtenstein
- Ensure minimum 4 languages per country compliance
- Add country detection based on IP/geolocation
- Implement rule validation and enforcement

### **2.2 Language Matrix Management (`packages/shared`)**

- Create comprehensive language matrix from Hollywood research
- Implement country→language mapping with rules
- Add closest language selection for under-served countries
- Build language availability validation
- Create matrix update and maintenance system
- Implement matrix health checks

### **2.3 Compliance Validation (`packages/logic`)**

- Build automated compliance checking system
- Implement rule violation detection and reporting
- Add compliance audit logging
- Create compliance dashboard for monitoring
- Implement compliance alerts and notifications
- Add compliance testing framework

## Phase 3: Language Detection (Week 3)

### **3.1 Language Detection System (`packages/shared`)**

- Implement browser language detection with fallbacks
- Add IP-based geolocation for country detection
- Create user preference persistence system
- Build language switching UI components
- Implement auto-language switching based on context
- Add language detection accuracy monitoring

### **3.2 Auto-switching Logic (`packages/logic`)**

- Create intelligent language switching algorithms
- Implement context-aware language selection
- Add user behavior pattern recognition for language preferences
- Build language switching performance optimization
- Create switching validation and testing
- Implement switching analytics and insights

### **3.3 Language Persistence (`packages/shared`)**

- Implement language preference storage in localStorage
- Add language preference sync with user profile
- Create cross-device language preference sharing
- Build language preference migration system
- Implement preference privacy controls
- Add preference analytics and insights

## Phase 4: Translation Management (Week 4)

### **4.1 Google Translate API Integration (`packages/shared`)**

- Implement Google Translate API client
- Add API key management and rotation
- Create translation caching system
- Build rate limiting and quota management
- Implement translation quality validation
- Add translation cost monitoring

### **4.2 Background Translation Generation (`packages/logic`)**

- Create automated translation generation pipeline
- Implement human-curated fixes application
- Build translation quality scoring system
- Add translation review and approval workflow
- Create translation update management
- Implement translation versioning system

### **4.3 Translation Management System (`apps/web-next`)**

- Build translation management UI for admins
- Implement translation editing and approval workflows
- Add translation statistics and analytics
- Create translation export/import functionality
- Build translation collaboration tools
- Implement translation security and access control

## Phase 5: Testing & Validation (Week 5)

### **5.1 i18n Testing Framework (`packages/shared`)**

- Create comprehensive i18n testing utilities
- Implement locale loading and switching tests
- Add translation key validation tests
- Build country rule compliance tests
- Create language detection accuracy tests
- Implement performance testing for i18n features

### **5.2 Integration Testing (`apps/web-next`)**

- Build end-to-end i18n testing scenarios
- Implement cross-language functionality tests
- Add country rule integration tests
- Create translation management integration tests
- Build accessibility testing for i18n
- Implement performance testing for i18n bundle

### **5.3 Production Readiness (`scripts/`)**

- Create i18n deployment validation scripts
- Implement production i18n health checks
- Add i18n monitoring and alerting setup
- Build i18n rollback and recovery procedures
- Create i18n documentation and training materials
- Implement i18n support and maintenance processes

## Acceptance Signals

- next-intl successfully integrated in apps/web-next
- All Hollywood locales imported and adapted
- Country rules compliance validated across all countries
- Language detection working with 95%+ accuracy
- Google Translate API generating high-quality translations
- i18n health checks passing in CI pipeline
- Bundle size impact within acceptable limits (< 10% increase)
- All UI text outside i18n files confirmed English-only
- Accessibility compliance for all i18n features
- Performance meets target metrics

## Linked docs

- `research.md`: i18n capabilities and user experience research
- `data-model.md`: i18n data structures and relationships
- `quickstart.md`: i18n interaction flows and testing scenarios
