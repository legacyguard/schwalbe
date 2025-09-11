# Prompt pre 025-emotional-core-mvp

Na základe high-level-plan.md a existujúcich špecifikácií (001-024) vytvor kompletnú sadu dokumentov pre špecifikáciu 025-emotional-core-mvp:

**Krok 1: Analýza a research**
- Analyzuj high-level-plan.md pre Phase 7 — Emotional Core MVP
- Identifikuj kľúčové komponenty: night sky landing page, Sofia presence, 3-act onboarding, emotional design
- Nájdi relevantné implementácie v Hollywood codebase (/Users/luborfedak/Documents/Github/hollywood) pre emotional system
- Identifikuj závislosti na 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration, 009-professional-network, 010-emergency-access, 011-mobile-app, 012-animations-microinteractions, 013-time-capsule-legacy, 014-pricing-conversion, 015-business-journeys, 016-integration-testing, 017-production-deployment, 018-monitoring-analytics, 019-nextjs-migration, 020-auth-rls-baseline, 021-database-types, 022-billing-stripe, 023-email-resend, 024-i18n-country-rules
- Zameraj sa na: emotional design, user psychology, engagement metrics, conversion optimization

**Krok 2: Vytvorenie dokumentov**
Vytvor tieto súbory v `/specs/025-emotional-core-mvp/`:

1. **spec.md** - Hlavná špecifikácia s:
   - Názvom: "Emotional Core MVP - User Experience and Engagement System"
   - Goals: night sky landing page, Sofia presence, 3-act onboarding, emotional design
   - Non-Goals: complex animations, real-time features, social media integration
   - Review & Acceptance: emotional impact, user engagement, conversion improvement
   - Risks & Mitigations: emotional fatigue, user confusion, conversion drop
   - References: emotional design principles, user psychology, engagement metrics
   - Cross-links: 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration, 009-professional-network, 010-emergency-access, 011-mobile-app, 012-animations-microinteractions, 013-time-capsule-legacy, 014-pricing-conversion, 015-business-journeys, 016-integration-testing, 017-production-deployment, 018-monitoring-analytics, 019-nextjs-migration, 020-auth-rls-baseline, 021-database-types, 022-billing-stripe, 023-email-resend, 024-i18n-country-rules
   - Linked design docs: research.md, data-model.md, quickstart.md

2. **plan.md** - Detailný plán implementácie s:
   - Phase 1: Emotional Foundation (Week 1) - emotional design principles, user psychology
   - Phase 2: Landing Page (Week 2) - night sky design, Sofia presence
   - Phase 3: Onboarding Flow (Week 3) - 3-act structure, user journey
   - Phase 4: Engagement System (Week 4) - engagement metrics, conversion optimization
   - Phase 5: Testing & Validation (Week 5) - emotional testing, user validation
   - Acceptance signals: emotional impact, user engagement, conversion improvement
   - Linked docs: research.md, data-model.md, quickstart.md

3. **tasks.md** - Kompletný zoznam úloh s:
   - T2500 Emotional Foundation
   - T2501 Emotional Design Principles
   - T2502 User Psychology
   - T2503 Landing Page
   - T2504 Night Sky Design
   - T2505 Sofia Presence
   - T2506 Onboarding Flow
   - T2507 3-act Structure
   - T2508 User Journey
   - T2509 Engagement System
   - T2510 Engagement Metrics
   - T2511 Conversion Optimization
   - T2512 Testing & Validation
   - T2513 Emotional Testing
   - T2514 User Validation
   - T2515 Emotional Testing

4. **data-model.md** - Dátový model s:
   - EmotionalConfig entity s configuration fields
   - UserEmotion pre user emotional state
   - EngagementMetric pre engagement tracking
   - ConversionFunnel pre conversion tracking
   - UserJourney pre user journey data
   - EmotionalImpact pre impact measurement
   - Relations medzi entitami

5. **quickstart.md** - Testovacie scenáre s:
   - 1) Emotional Setup - configure emotional system
   - 2) Landing Page Testing - test night sky design
   - 3) Sofia Testing - test Sofia presence
   - 4) Onboarding Testing - test 3-act onboarding
   - 5) Engagement Testing - test engagement metrics
   - 6) Conversion Testing - test conversion optimization
   - 7) Emotional Impact Testing - test emotional impact
   - 8) User Journey Testing - test user journey
   - 9) Performance Testing - test emotional performance
   - 10) End-to-End Test - complete emotional workflow

6. **research.md** - Výskumná analýza s:
   - Product scope: emotional core and user experience system
   - Technical architecture: emotional design, engagement system
   - User experience: emotional user experience
   - Performance: emotional performance optimization
   - Security: emotional data protection
   - Accessibility: emotional accessibility
   - Analytics: emotional analytics and insights
   - Future enhancements: advanced emotional features

7. **contracts/README.md** - API kontrakty s:
   - emotional-core-api.yaml
   - engagement-system-api.yaml
   - conversion-optimization-api.yaml
   - user-journey-api.yaml
   - emotional-testing-api.yaml

**Krok 3: Konzistentnosť**
- Použi rovnaký formát ako 005-sofia-ai-system
- Zachovaj konzistentné kódovanie úloh (T2500+)
- Udržuj konzistentný štýl a štruktúru
- Zabezpeč správne cross-links na 001, 002, 005, 006, 007, 008, 009, 010, 011, 012, 013, 014, 015, 016, 017, 018, 019, 020, 021, 022, 023, 024

**Krok 4: Kompletnosť**
- Pokry všetky aspekty z Phase 7 — Emotional Core MVP
- Zahrň emotional system z Hollywood
- Identifikuj závislosti na emotional design a user psychology
- Zabezpeč pokrytie testovacích scenárov
- Zahrň engagement metrics a conversion optimization

**Krok 5: Validácia**
- Skontroluj linter chyby a oprav ich
- Over konzistentnosť s existujúcimi špecifikáciami
- Zabezpeč správne formátovanie a štruktúru
- Over kompletnosť informácií
- Skontroluj cross-links na súvisiace špecifikácie

**Špecifické požiadavky pre 025-emotional-core-mvp:**
- Zameraj sa na emotional design principles a user psychology
- Implementuj night sky landing page a Sofia presence
- Zabezpeč 3-act onboarding structure a user journey
- Zahrň engagement metrics a conversion optimization
- Implementuj emotional testing a validation
- Zabezpeč emotional data protection a privacy
- Zahrň emotional analytics a monitoring
- Implementuj emotional performance optimization
- Zabezpeč emotional accessibility a compliance
- Zahrň emotional impact measurement a tracking
