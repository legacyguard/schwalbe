# Prompt pre 023-email-resend

Na základe high-level-plan.md a existujúcich špecifikácií (001-022) vytvor kompletnú sadu dokumentov pre špecifikáciu 023-email-resend:

**Krok 1: Analýza a research**
- Analyzuj high-level-plan.md pre Phase 5 — Email (Resend)
- Identifikuj kľúčové komponenty: Resend integration, email templates, delivery system, notification management
- Nájdi relevantné implementácie v Hollywood codebase (/Users/luborfedak/Documents/Github/hollywood) pre email system
- Identifikuj závislosti na 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration, 009-professional-network, 010-emergency-access, 011-mobile-app, 012-animations-microinteractions, 013-time-capsule-legacy, 014-pricing-conversion, 015-business-journeys, 016-integration-testing, 017-production-deployment, 018-monitoring-analytics, 019-nextjs-migration, 020-auth-rls-baseline, 021-database-types, 022-billing-stripe
- Zameraj sa na: Resend API, email templates, delivery tracking, notification system

**Krok 2: Vytvorenie dokumentov**
Vytvor tieto súbory v `/specs/023-email-resend/`:

1. **spec.md** - Hlavná špecifikácia s:
   - Názvom: "Email Resend - Email Delivery and Notification System"
   - Goals: Resend integration, email templates, delivery system, notification management
   - Non-Goals: custom email server, complex email automation, marketing campaigns
   - Review & Acceptance: email delivery, template rendering, notification system
   - Risks & Mitigations: delivery failures, template errors, notification spam
   - References: Resend docs, email best practices, notification standards
   - Cross-links: 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration, 009-professional-network, 010-emergency-access, 011-mobile-app, 012-animations-microinteractions, 013-time-capsule-legacy, 014-pricing-conversion, 015-business-journeys, 016-integration-testing, 017-production-deployment, 018-monitoring-analytics, 019-nextjs-migration, 020-auth-rls-baseline, 021-database-types, 022-billing-stripe
   - Linked design docs: research.md, data-model.md, quickstart.md

2. **plan.md** - Detailný plán implementácie s:
   - Phase 1: Resend Setup (Week 1) - Resend integration, API configuration
   - Phase 2: Email Templates (Week 2) - template system, rendering engine
   - Phase 3: Delivery System (Week 3) - delivery tracking, error handling
   - Phase 4: Notification Management (Week 4) - notification system, user preferences
   - Phase 5: Testing & Validation (Week 5) - email testing, delivery validation
   - Acceptance signals: email delivery, template rendering, notification system
   - Linked docs: research.md, data-model.md, quickstart.md

3. **tasks.md** - Kompletný zoznam úloh s:
   - T2300 Resend Setup
   - T2301 Resend Integration
   - T2302 API Configuration
   - T2303 Email Templates
   - T2304 Template System
   - T2305 Rendering Engine
   - T2306 Delivery System
   - T2307 Delivery Tracking
   - T2308 Error Handling
   - T2309 Notification Management
   - T2310 Notification System
   - T2311 User Preferences
   - T2312 Testing & Validation
   - T2313 Email Testing
   - T2314 Delivery Validation
   - T2315 Email Testing

4. **data-model.md** - Dátový model s:
   - EmailConfig entity s configuration fields
   - EmailTemplate pre email templates
   - EmailDelivery pre delivery tracking
   - NotificationRule pre notification rules
   - UserPreference pre user preferences
   - EmailLog pre email logging
   - Relations medzi entitami

5. **quickstart.md** - Testovacie scenáre s:
   - 1) Resend Setup - configure Resend integration
   - 2) Template Testing - test email templates
   - 3) Delivery Testing - test email delivery
   - 4) Notification Testing - test notification system
   - 5) Error Handling - test email errors
   - 6) Performance Testing - test email performance
   - 7) Security Testing - test email security
   - 8) User Preference Testing - test user preferences
   - 9) Template Rendering - test template rendering
   - 10) End-to-End Test - complete email workflow

6. **research.md** - Výskumná analýza s:
   - Product scope: email delivery and notification system
   - Technical architecture: Resend integration, email processing
   - User experience: email user experience
   - Performance: email delivery performance
   - Security: email security measures
   - Accessibility: email accessibility
   - Analytics: email analytics and insights
   - Future enhancements: advanced email features

7. **contracts/README.md** - API kontrakty s:
   - resend-integration-api.yaml
   - email-template-api.yaml
   - delivery-tracking-api.yaml
   - notification-management-api.yaml
   - email-testing-api.yaml

**Krok 3: Konzistentnosť**
- Použi rovnaký formát ako 005-sofia-ai-system
- Zachovaj konzistentné kódovanie úloh (T2300+)
- Udržuj konzistentný štýl a štruktúru
- Zabezpeč správne cross-links na 001, 002, 005, 006, 007, 008, 009, 010, 011, 012, 013, 014, 015, 016, 017, 018, 019, 020, 021, 022

**Krok 4: Kompletnosť**
- Pokry všetky aspekty z Phase 5 — Email (Resend)
- Zahrň email system z Hollywood
- Identifikuj závislosti na Resend integration a email templates
- Zabezpeč pokrytie testovacích scenárov
- Zahrň notification management a delivery tracking

**Krok 5: Validácia**
- Skontroluj linter chyby a oprav ich
- Over konzistentnosť s existujúcimi špecifikáciami
- Zabezpeč správne formátovanie a štruktúru
- Over kompletnosť informácií
- Skontroluj cross-links na súvisiace špecifikácie

**Špecifické požiadavky pre 023-email-resend:**
- Zameraj sa na Resend API integration a email delivery
- Implementuj email template system a rendering
- Zabezpeč delivery tracking a error handling
- Zahrň notification system a user preferences
- Implementuj email testing a validation
- Zabezpeč email security a compliance
- Zahrň email analytics a monitoring
- Implementuj email performance optimization
- Zabezpeč email accessibility a compliance
- Zahrň email template management
