# Prompt pre 030-sharing-reminders-analytics

Na základe high-level-plan.md a existujúcich špecifikácií (001-029) vytvor kompletnú sadu dokumentov pre špecifikáciu 030-sharing-reminders-analytics:

**Krok 1: Analýza a research**
- Analyzuj high-level-plan.md pre Phase 12 — Sharing, Reminders, Analytics, Sofia AI Expansion
- Identifikuj kľúčové komponenty: sharing system, reminder management, analytics tracking, Sofia AI expansion
- Nájdi relevantné implementácie v Hollywood codebase (/Users/luborfedak/Documents/Github/hollywood) pre sharing system
- Identifikuj závislosti na 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration, 009-professional-network, 010-emergency-access, 011-mobile-app, 012-animations-microinteractions, 013-time-capsule-legacy, 014-pricing-conversion, 015-business-journeys, 016-integration-testing, 017-production-deployment, 018-monitoring-analytics, 019-nextjs-migration, 020-auth-rls-baseline, 021-database-types, 022-billing-stripe, 023-email-resend, 024-i18n-country-rules, 025-emotional-core-mvp, 026-vault-encrypted-storage, 027-family-shield-emergency, 028-time-capsules, 029-will-generation-engine
- Zameraj sa na: secure sharing, reminder scheduling, analytics dashboard, Sofia AI enhancement

**Krok 2: Vytvorenie dokumentov**
Vytvor tieto súbory v `/specs/030-sharing-reminders-analytics/`:

1. **spec.md** - Hlavná špecifikácia s:
   - Názvom: "Sharing, Reminders & Analytics - Content Sharing and User Insights"
   - Goals: sharing system, reminder management, analytics tracking, Sofia AI expansion
   - Non-Goals: social media integration, complex analytics, real-time collaboration
   - Review & Acceptance: sharing security, reminder delivery, analytics accuracy
   - Risks & Mitigations: sharing abuse, reminder spam, data privacy
   - References: sharing security, reminder systems, analytics best practices
   - Cross-links: 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration, 009-professional-network, 010-emergency-access, 011-mobile-app, 012-animations-microinteractions, 013-time-capsule-legacy, 014-pricing-conversion, 015-business-journeys, 016-integration-testing, 017-production-deployment, 018-monitoring-analytics, 019-nextjs-migration, 020-auth-rls-baseline, 021-database-types, 022-billing-stripe, 023-email-resend, 024-i18n-country-rules, 025-emotional-core-mvp, 026-vault-encrypted-storage, 027-family-shield-emergency, 028-time-capsules, 029-will-generation-engine
   - Linked design docs: research.md, data-model.md, quickstart.md

2. **plan.md** - Detailný plán implementácie s:
   - Phase 1: Sharing Foundation (Week 1) - sharing system, security measures
   - Phase 2: Reminder System (Week 2) - reminder scheduling, delivery management
   - Phase 3: Analytics System (Week 3) - analytics tracking, dashboard creation
   - Phase 4: Sofia AI Expansion (Week 4) - AI enhancement, context awareness
   - Phase 5: Testing & Validation (Week 5) - sharing testing, analytics validation
   - Acceptance signals: sharing security, reminder delivery, analytics accuracy
   - Linked docs: research.md, data-model.md, quickstart.md

3. **tasks.md** - Kompletný zoznam úloh s:
   - T3000 Sharing Foundation
   - T3001 Sharing System
   - T3002 Security Measures
   - T3003 Reminder System
   - T3004 Reminder Scheduling
   - T3005 Delivery Management
   - T3006 Analytics System
   - T3007 Analytics Tracking
   - T3008 Dashboard Creation
   - T3009 Sofia AI Expansion
   - T3010 AI Enhancement
   - T3011 Context Awareness
   - T3012 Testing & Validation
   - T3013 Sharing Testing
   - T3014 Analytics Validation
   - T3015 Sharing Analytics Testing

4. **data-model.md** - Dátový model s:
   - SharingConfig entity s sharing fields
   - ReminderRule pre reminder management
   - AnalyticsEvent pre analytics tracking
   - SofiaAIExpansion pre AI enhancement
   - SharingLog pre sharing tracking
   - AnalyticsDashboard pre dashboard data
   - Relations medzi entitami

5. **quickstart.md** - Testovacie scenáre s:
   - 1) Sharing Setup - configure sharing system
   - 2) Reminder Testing - test reminder system
   - 3) Analytics Testing - test analytics system
   - 4) Sofia AI Testing - test AI expansion
   - 5) Security Testing - test sharing security
   - 6) Performance Testing - test system performance
   - 7) Privacy Testing - test data privacy
   - 8) Error Handling - test error handling
   - 9) User Experience - test user experience
   - 10) End-to-End Test - complete sharing workflow

6. **research.md** - Výskumná analýza s:
   - Product scope: sharing, reminders, and analytics system
   - Technical architecture: sharing framework, analytics engine
   - User experience: sharing user experience
   - Performance: sharing performance optimization
   - Security: sharing security measures
   - Accessibility: sharing accessibility
   - Analytics: sharing analytics and insights
   - Future enhancements: advanced sharing features

7. **contracts/README.md** - API kontrakty s:
   - sharing-system-api.yaml
   - reminder-management-api.yaml
   - analytics-tracking-api.yaml
   - sofia-ai-expansion-api.yaml
   - sharing-analytics-api.yaml

**Krok 3: Konzistentnosť**
- Použi rovnaký formát ako 005-sofia-ai-system
- Zachovaj konzistentné kódovanie úloh (T3000+)
- Udržuj konzistentný štýl a štruktúru
- Zabezpeč správne cross-links na 001, 002, 005, 006, 007, 008, 009, 010, 011, 012, 013, 014, 015, 016, 017, 018, 019, 020, 021, 022, 023, 024, 025, 026, 027, 028, 029

**Krok 4: Kompletnosť**
- Pokry všetky aspekty z Phase 12 — Sharing, Reminders, Analytics, Sofia AI Expansion
- Zahrň sharing system z Hollywood
- Identifikuj závislosti na reminder management a analytics tracking
- Zabezpeč pokrytie testovacích scenárov
- Zahrň Sofia AI expansion a context awareness

**Krok 5: Validácia**
- Skontroluj linter chyby a oprav ich
- Over konzistentnosť s existujúcimi špecifikáciami
- Zabezpeč správne formátovanie a štruktúru
- Over kompletnosť informácií
- Skontroluj cross-links na súvisiace špecifikácie

**Špecifické požiadavky pre 030-sharing-reminders-analytics:**
- Zameraj sa na secure sharing system a security measures
- Implementuj reminder scheduling a delivery management
- Zabezpeč analytics tracking a dashboard creation
- Zahrň Sofia AI expansion a context awareness
- Implementuj sharing testing a validation
- Zabezpeč sharing security a privacy protection
- Zahrň sharing analytics a monitoring
- Implementuj sharing performance optimization
- Zabezpeč sharing accessibility a compliance
- Zahrň sharing backup a recovery
