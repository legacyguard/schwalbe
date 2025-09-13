# i18n & Country Rules - Quickstart Scenarios

## 1) i18n Setup - Configure i18n system

### Scenario: Developer sets up i18n for new Next.js app

- Install next-intl and configure middleware
- Import Hollywood locales and adapt structure
- Set up English as source of truth
- Configure lazy loading and TypeScript support
- Run i18n health checks to validate setup

### i18n Setup Validation Points

- [ ] next-intl middleware configured correctly
- [ ] Hollywood locales imported without errors
- [ ] English locale loads as fallback
- [ ] TypeScript types generated for translation keys
- [ ] i18n health checks pass in CI
- [ ] Bundle size impact within acceptable limits

## 2) Language Testing - Test language switching

### Scenario: User switches between supported languages

- User opens app in default English
- Clicks language selector and chooses Slovak
- UI immediately switches to Slovak translations
- User navigates to different pages, language persists
- User switches back to English, all text reverts

### Language Testing Validation Points

- [ ] Language selector displays available languages
- [ ] Language switching works without page reload
- [ ] All UI text changes to selected language
- [ ] Language preference persists across navigation
- [ ] Fallback to English works for missing translations

## 3) Country Rules Testing - Test country rules

### Scenario: User from Germany accesses the app

- System detects German IP address
- Country rules engine removes Russian language from available options for Germany
- User does not see Russian as an available language option
- System ensures minimum 4 languages available
- Compliance check validates rule application

### Country Rules Validation Points

- [ ] Country detection works based on IP
- [ ] Russian removal rule for Germany applied correctly
- [ ] Minimum language count maintained
- [ ] Compliance validation passes
- [ ] Language selector shows correct options

## 4) Translation Testing - Test translation system

### Scenario: Admin adds new translation key

- Admin accesses translation management interface
- Adds new English text for "Save Document" button
- System automatically generates translations via Google Translate API
- Admin reviews and approves machine translations
- Updated translations deploy to production

### Translation Testing Validation Points

- [ ] Translation management UI accessible to admins
- [ ] Google Translate API generates translations
- [ ] Human review workflow functions correctly
- [ ] Translation updates deploy successfully
- [ ] New translations appear in user interface

## 5) Language Detection Testing - Test language detection

### Scenario: New user visits from Czech Republic

- Browser sends Czech (cs) as preferred language
- System detects Czech IP geolocation
- Language detection combines browser + geo data
- User sees Czech as default language
- Country rules ensure appropriate language set

### Language Detection Validation Points

- [ ] Browser language detection works
- [ ] IP geolocation provides country data
- [ ] Combined detection selects optimal language
- [ ] Default language displays correctly
- [ ] Detection accuracy meets 95%+ target

## 6) Compliance Testing - Test compliance validation

### Scenario: Compliance officer reviews language coverage

- Officer runs compliance check across all countries
- System validates minimum 4 languages per country
- Identifies countries missing required languages
- Generates compliance report with recommendations
- Alerts team about rule violations

### Compliance Testing Validation Points

- [ ] Compliance checks run automatically
- [ ] Minimum language requirements validated
- [ ] Rule violations detected and reported
- [ ] Compliance reports generated accurately
- [ ] Alert system notifies appropriate team members

## 7) Performance Testing - Test i18n performance

### Scenario: High-traffic load with multiple languages

- 1000 concurrent users accessing in different languages
- System serves locale bundles efficiently
- Translation caching reduces API calls
- Bundle splitting keeps initial load small
- Performance monitoring tracks metrics

### Performance Testing Validation Points

- [ ] Locale loading under 500ms
- [ ] Bundle size increase < 10% of total
- [ ] Translation cache hit rate > 80%
- [ ] Memory usage stays within limits
- [ ] No performance degradation under load

## 8) Security Testing - Test i18n security

### Scenario: Security audit of i18n system

- Penetration tester attempts injection attacks
- System validates all translation inputs
- API keys properly secured and rotated
- Access controls prevent unauthorized translation edits
- Audit logs capture all translation changes

### Security Testing Validation Points

- [ ] Input validation prevents injection attacks
- [ ] API keys secured with proper rotation
- [ ] Access controls enforce permissions
- [ ] Audit logs complete and tamper-proof
- [ ] No security vulnerabilities in i18n system

## 9) Accessibility Testing - Test i18n accessibility

### Scenario: Screen reader user navigates multilingual interface

- User with screen reader accesses language selector
- System announces language changes clearly
- RTL languages display correctly
- Keyboard navigation works in all languages
- Color contrast maintained across locales

### Accessibility Testing Validation Points

- [ ] Screen reader announces language changes
- [ ] Keyboard navigation works in all languages
- [ ] RTL language support functions correctly
- [ ] Color contrast meets WCAG standards
- [ ] Focus management works across language switches

## 10) End-to-End Test - Complete i18n workflow

### Scenario: Complete user journey with i18n

- User from Germany visits app for first time
- System detects German IP and browser language
- User sees German interface by default
- User creates document in German
- System applies country rules and translations
- User shares document, recipient sees appropriate language

### End-to-End Testing Validation Points

- [ ] Complete user journey works end-to-end
- [ ] Language detection and switching seamless
- [ ] Country rules applied correctly
- [ ] Document creation respects language preferences
- [ ] Sharing preserves language context
- [ ] Performance meets all targets
