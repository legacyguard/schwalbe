# Prompt pre 014-pricing-conversion

Na základe high-level-plan.md a existujúcich špecifikácií (001-013) vytvor kompletnú sadu dokumentov pre špecifikáciu 014-pricing-conversion:

**Krok 1: Analýza a research**
- Analyzuj high-level-plan.md pre Phase 4 — Billing (Stripe) a Phase 4 — Pricing and Funnels
- Identifikuj kľúčové komponenty: pricing strategy, conversion funnels, subscription management, payment processing
- Nájdi relevantné implementácie v Hollywood codebase (/Users/luborfedak/Documents/Github/hollywood) pre pricing system
- Identifikuj závislosti na 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration, 009-professional-network, 010-emergency-access, 011-mobile-app, 012-animations-microinteractions, 013-time-capsule-legacy
- Zameraj sa na: Stripe integration, pricing psychology, conversion optimization, subscription tiers

**Krok 2: Vytvorenie dokumentov**
Vytvor tieto súbory v `/specs/014-pricing-conversion/`:

1. **spec.md** - Hlavná špecifikácia s:
   - Názvom: "Pricing & Conversion - Subscription Management and Payment Processing"
   - Goals: pricing strategy, conversion funnels, subscription management, payment processing
   - Non-Goals: cryptocurrency payments, international payment methods
   - Review & Acceptance: conversion rate optimization, payment processing, subscription management
   - Risks & Mitigations: payment failures, subscription churn, pricing sensitivity
   - References: Stripe documentation, pricing psychology, conversion optimization
   - Cross-links: 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration, 009-professional-network, 010-emergency-access, 011-mobile-app, 012-animations-microinteractions, 013-time-capsule-legacy
   - Linked design docs: research.md, data-model.md, quickstart.md

2. **plan.md** - Detailný plán implementácie s:
   - Phase 1: Pricing Foundation (Week 1) - pricing strategy, subscription tiers
   - Phase 2: Stripe Integration (Week 2) - payment processing, webhook handling
   - Phase 3: Conversion Funnels (Week 3) - funnel optimization, A/B testing
   - Phase 4: Subscription Management (Week 4) - subscription lifecycle, billing
   - Phase 5: Analytics & Optimization (Week 5) - conversion tracking, optimization
   - Acceptance signals: conversion rate optimization, payment processing, subscription management
   - Linked docs: research.md, data-model.md, quickstart.md

3. **tasks.md** - Kompletný zoznam úloh s:
   - T1400 Pricing Foundation
   - T1401 Pricing Strategy
   - T1402 Subscription Tiers
   - T1403 Stripe Integration
   - T1404 Payment Processing
   - T1405 Webhook Handling
   - T1406 Conversion Funnels
   - T1407 Funnel Optimization
   - T1408 A/B Testing
   - T1409 Subscription Management
   - T1410 Subscription Lifecycle
   - T1411 Billing Management
   - T1412 Analytics & Optimization
   - T1413 Conversion Tracking
   - T1414 Optimization Testing
   - T1415 Pricing Testing

4. **data-model.md** - Dátový model s:
   - PricingPlan entity s subscription fields
   - Subscription pre user subscriptions
   - PaymentTransaction pre payment tracking
   - ConversionFunnel pre funnel tracking
   - PricingExperiment pre A/B testing
   - BillingCycle pre billing management
   - Relations medzi entitami

5. **quickstart.md** - Testovacie scenáre s:
   - 1) Pricing Setup - configure pricing plans
   - 2) Payment Processing - test payment flow
   - 3) Subscription Management - test subscription lifecycle
   - 4) Conversion Testing - test conversion funnels
   - 5) A/B Testing - test pricing experiments
   - 6) Billing Testing - test billing cycles
   - 7) Webhook Testing - test Stripe webhooks
   - 8) Analytics Testing - test conversion tracking
   - 9) Performance Testing - test payment performance
   - 10) End-to-End Test - complete pricing workflow

6. **research.md** - Výskumná analýza s:
   - Product scope: pricing and conversion system
   - Technical architecture: Stripe integration, payment processing
   - User experience: pricing psychology, conversion optimization
   - Performance: payment processing performance
   - Security: payment security, PCI compliance
   - Accessibility: payment accessibility
   - Analytics: conversion tracking, revenue analytics
   - Future enhancements: AI pricing optimization

7. **contracts/README.md** - API kontrakty s:
   - pricing-management-api.yaml
   - stripe-integration-api.yaml
   - conversion-tracking-api.yaml
   - subscription-management-api.yaml
   - billing-management-api.yaml

**Krok 3: Konzistentnosť**
- Použi rovnaký formát ako 005-sofia-ai-system
- Zachovaj konzistentné kódovanie úloh (T1400+)
- Udržuj konzistentný štýl a štruktúru
- Zabezpeč správne cross-links na 001, 002, 005, 006, 007, 008, 009, 010, 011, 012, 013

**Krok 4: Kompletnosť**
- Pokry všetky aspekty z Phase 4 — Billing (Stripe) a Phase 4 — Pricing and Funnels
- Zahrň pricing system z Hollywood
- Identifikuj závislosti na Stripe integration a conversion optimization
- Zabezpeč pokrytie testovacích scenárov
- Zahrň pricing psychology a conversion funnels

**Krok 5: Validácia**
- Skontroluj linter chyby a oprav ich
- Over konzistentnosť s existujúcimi špecifikáciami
- Zabezpeč správne formátovanie a štruktúru
- Over kompletnosť informácií
- Skontroluj cross-links na súvisiace špecifikácie

**Špecifické požiadavky pre 014-pricing-conversion:**
- Zameraj sa na Stripe integration a payment processing
- Implementuj pricing strategy a subscription tiers
- Zabezpeč conversion funnel optimization
- Zahrň A/B testing pre pricing experiments
- Implementuj subscription lifecycle management
- Zabezpeč billing cycle management
- Zahrň conversion tracking a analytics
- Implementuj pricing psychology principles
- Zabezpeč payment security a PCI compliance
- Zahrň mobile payment optimization
