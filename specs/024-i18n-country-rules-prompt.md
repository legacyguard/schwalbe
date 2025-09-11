# Prompt pre 024-i18n-country-rules

Na základe high-level-plan.md a existujúcich špecifikácií (001-023) vytvor kompletnú sadu dokumentov pre špecifikáciu 024-i18n-country-rules:

**Krok 1: Analýza a research**
- Analyzuj high-level-plan.md pre Phase 6 — i18n + Country Rules
- Identifikuj kľúčové komponenty: i18n system, country rules, language detection, Google Translate API
- Nájdi relevantné implementácie v Hollywood codebase (/Users/luborfedak/Documents/Github/hollywood) pre i18n system
- Identifikuj závislosti na 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration, 009-professional-network, 010-emergency-access, 011-mobile-app, 012-animations-microinteractions, 013-time-capsule-legacy, 014-pricing-conversion, 015-business-journeys, 016-integration-testing, 017-production-deployment, 018-monitoring-analytics, 019-nextjs-migration, 020-auth-rls-baseline, 021-database-types, 022-billing-stripe, 023-email-resend
- Zameraj sa na: next-intl, country-specific rules, language detection, translation management

**Krok 2: Vytvorenie dokumentov**
Vytvor tieto súbory v `/specs/024-i18n-country-rules/`:

1. **spec.md** - Hlavná špecifikácia s:
   - Názvom: "i18n & Country Rules - Internationalization and Localization System"
   - Goals: i18n system, country rules, language detection, Google Translate API
   - Non-Goals: complex translation management, real-time translation, custom language packs
   - Review & Acceptance: i18n coverage, country rules compliance, translation accuracy
   - Risks & Mitigations: translation errors, country rule violations, language detection failures
   - References: next-intl docs, i18n best practices, country rules standards
   - Cross-links: 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration, 009-professional-network, 010-emergency-access, 011-mobile-app, 012-animations-microinteractions, 013-time-capsule-legacy, 014-pricing-conversion, 015-business-journeys, 016-integration-testing, 017-production-deployment, 018-monitoring-analytics, 019-nextjs-migration, 020-auth-rls-baseline, 021-database-types, 022-billing-stripe, 023-email-resend
   - Linked design docs: research.md, data-model.md, quickstart.md

2. **plan.md** - Detailný plán implementácie s:
   - Phase 1: i18n Setup (Week 1) - next-intl integration, language configuration
   - Phase 2: Country Rules (Week 2) - country-specific rules, compliance system
   - Phase 3: Language Detection (Week 3) - language detection, auto-switching
   - Phase 4: Translation Management (Week 4) - Google Translate API, translation system
   - Phase 5: Testing & Validation (Week 5) - i18n testing, country rules validation
   - Acceptance signals: i18n coverage, country rules compliance, translation accuracy
   - Linked docs: research.md, data-model.md, quickstart.md

3. **tasks.md** - Kompletný zoznam úloh s:
   - T2400 i18n Setup
   - T2401 next-intl Integration
   - T2402 Language Configuration
   - T2403 Country Rules
   - T2404 Country-specific Rules
   - T2405 Compliance System
   - T2406 Language Detection
   - T2407 Language Detection
   - T2408 Auto-switching
   - T2409 Translation Management
   - T2410 Google Translate API
   - T2411 Translation System
   - T2412 Testing & Validation
   - T2413 i18n Testing
   - T2414 Country Rules Validation
   - T2415 i18n Testing

4. **data-model.md** - Dátový model s:
   - i18nConfig entity s configuration fields
   - Language pre language definitions
   - CountryRule pre country rules
   - Translation pre translation data
   - LanguageDetection pre detection rules
   - ComplianceCheck pre compliance validation
   - Relations medzi entitami

5. **quickstart.md** - Testovacie scenáre s:
   - 1) i18n Setup - configure i18n system
   - 2) Language Testing - test language switching
   - 3) Country Rules Testing - test country rules
   - 4) Translation Testing - test translation system
   - 5) Language Detection Testing - test language detection
   - 6) Compliance Testing - test compliance validation
   - 7) Performance Testing - test i18n performance
   - 8) Security Testing - test i18n security
   - 9) Accessibility Testing - test i18n accessibility
   - 10) End-to-End Test - complete i18n workflow

6. **research.md** - Výskumná analýza s:
   - Product scope: internationalization and localization system
   - Technical architecture: next-intl, Google Translate API
   - User experience: i18n user experience
   - Performance: i18n performance optimization
   - Security: i18n security measures
   - Accessibility: i18n accessibility
   - Analytics: i18n analytics and insights
   - Future enhancements: advanced i18n features

7. **contracts/README.md** - API kontrakty s:
   - i18n-system-api.yaml
   - country-rules-api.yaml
   - language-detection-api.yaml
   - translation-management-api.yaml
   - i18n-testing-api.yaml

**Krok 3: Konzistentnosť**
- Použi rovnaký formát ako 005-sofia-ai-system
- Zachovaj konzistentné kódovanie úloh (T2400+)
- Udržuj konzistentný štýl a štruktúru
- Zabezpeč správne cross-links na 001, 002, 005, 006, 007, 008, 009, 010, 011, 012, 013, 014, 015, 016, 017, 018, 019, 020, 021, 022, 023

**Krok 4: Kompletnosť**
- Pokry všetky aspekty z Phase 6 — i18n + Country Rules
- Zahrň i18n system z Hollywood
- Identifikuj závislosti na next-intl a Google Translate API
- Zabezpeč pokrytie testovacích scenárov
- Zahrň country rules compliance a language detection

**Krok 5: Validácia**
- Skontroluj linter chyby a oprav ich
- Over konzistentnosť s existujúcimi špecifikáciami
- Zabezpeč správne formátovanie a štruktúru
- Over kompletnosť informácií
- Skontroluj cross-links na súvisiace špecifikácie

**Špecifické požiadavky pre 024-i18n-country-rules:**
- Zameraj sa na next-intl integration a language management
- Implementuj country-specific rules a compliance system
- Zabezpeč language detection a auto-switching
- Zahrň Google Translate API a translation system
- Implementuj i18n testing a validation
- Zabezpeč i18n security a compliance
- Zahrň i18n analytics a monitoring
- Implementuj i18n performance optimization
- Zabezpeč i18n accessibility a compliance
- Zahrň translation management a updates
