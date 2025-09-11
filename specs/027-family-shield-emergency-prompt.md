# Prompt pre 027-family-shield-emergency

Na základe high-level-plan.md a existujúcich špecifikácií (001-026) vytvor kompletnú sadu dokumentov pre špecifikáciu 027-family-shield-emergency:

**Krok 1: Analýza a research**
- Analyzuj high-level-plan.md pre Phase 9 — Family Shield and Emergency Access
- Identifikuj kľúčové komponenty: family shield, emergency access, guardian system, inactivity detection
- Nájdi relevantné implementácie v Hollywood codebase (/Users/luborfedak/Documents/Github/hollywood) pre emergency system
- Identifikuj závislosti na 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration, 009-professional-network, 010-emergency-access, 011-mobile-app, 012-animations-microinteractions, 013-time-capsule-legacy, 014-pricing-conversion, 015-business-journeys, 016-integration-testing, 017-production-deployment, 018-monitoring-analytics, 019-nextjs-migration, 020-auth-rls-baseline, 021-database-types, 022-billing-stripe, 023-email-resend, 024-i18n-country-rules, 025-emotional-core-mvp, 026-vault-encrypted-storage
- Zameraj sa na: emergency protocols, guardian verification, inactivity monitoring, access control

**Krok 2: Vytvorenie dokumentov**
Vytvor tieto súbory v `/specs/027-family-shield-emergency/`:

1. **spec.md** - Hlavná špecifikácia s:
   - Názvom: "Family Shield Emergency - Crisis Response and Access Control"
   - Goals: family shield, emergency access, guardian system, inactivity detection
   - Non-Goals: real-time monitoring, automatic activation, medical alerts
   - Review & Acceptance: emergency simulation, guardian verification, access control
   - Risks & Mitigations: false activation, access abuse, guardian conflicts
   - References: emergency protocols, access control, family law
   - Cross-links: 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration, 009-professional-network, 010-emergency-access, 011-mobile-app, 012-animations-microinteractions, 013-time-capsule-legacy, 014-pricing-conversion, 015-business-journeys, 016-integration-testing, 017-production-deployment, 018-monitoring-analytics, 019-nextjs-migration, 020-auth-rls-baseline, 021-database-types, 022-billing-stripe, 023-email-resend, 024-i18n-country-rules, 025-emotional-core-mvp, 026-vault-encrypted-storage
   - Linked design docs: research.md, data-model.md, quickstart.md

2. **plan.md** - Detailný plán implementácie s:
   - Phase 1: Emergency Foundation (Week 1) - emergency protocols, activation triggers
   - Phase 2: Guardian System (Week 2) - guardian verification, role management
   - Phase 3: Inactivity Detection (Week 3) - monitoring system, detection algorithms
   - Phase 4: Access Control (Week 4) - access staging, permission management
   - Phase 5: Testing & Validation (Week 5) - emergency testing, guardian validation
   - Acceptance signals: emergency simulation, guardian verification, access control
   - Linked docs: research.md, data-model.md, quickstart.md

3. **tasks.md** - Kompletný zoznam úloh s:
   - T2700 Emergency Foundation
   - T2701 Emergency Protocols
   - T2702 Activation Triggers
   - T2703 Guardian System
   - T2704 Guardian Verification
   - T2705 Role Management
   - T2706 Inactivity Detection
   - T2707 Monitoring System
   - T2708 Detection Algorithms
   - T2709 Access Control
   - T2710 Access Staging
   - T2711 Permission Management
   - T2712 Testing & Validation
   - T2713 Emergency Testing
   - T2714 Guardian Validation
   - T2715 Emergency Testing

4. **data-model.md** - Dátový model s:
   - EmergencyProtocol entity s protocol fields
   - Guardian pre guardian management
   - InactivityTrigger pre monitoring
   - AccessStage pre access control
   - EmergencyLog pre emergency tracking
   - FamilyShield pre shield configuration
   - Relations medzi entitami

5. **quickstart.md** - Testovacie scenáre s:
   - 1) Emergency Setup - configure emergency system
   - 2) Guardian Testing - test guardian verification
   - 3) Inactivity Testing - test inactivity detection
   - 4) Access Control Testing - test access control
   - 5) Emergency Simulation - test emergency flow
   - 6) Family Shield Testing - test family shield
   - 7) Security Testing - test emergency security
   - 8) Performance Testing - test emergency performance
   - 9) Rollback Testing - test emergency rollback
   - 10) End-to-End Test - complete emergency workflow

6. **research.md** - Výskumná analýza s:
   - Product scope: family shield and emergency system
   - Technical architecture: emergency protocols, guardian system
   - User experience: emergency user experience
   - Performance: emergency response performance
   - Security: emergency security measures
   - Accessibility: emergency accessibility
   - Analytics: emergency analytics and insights
   - Future enhancements: advanced emergency features

7. **contracts/README.md** - API kontrakty s:
   - emergency-protocol-api.yaml
   - guardian-system-api.yaml
   - inactivity-detection-api.yaml
   - access-control-api.yaml
   - family-shield-api.yaml

**Krok 3: Konzistentnosť**
- Použi rovnaký formát ako 005-sofia-ai-system
- Zachovaj konzistentné kódovanie úloh (T2700+)
- Udržuj konzistentný štýl a štruktúru
- Zabezpeč správne cross-links na 001, 002, 005, 006, 007, 008, 009, 010, 011, 012, 013, 014, 015, 016, 017, 018, 019, 020, 021, 022, 023, 024, 025, 026

**Krok 4: Kompletnosť**
- Pokry všetky aspekty z Phase 9 — Family Shield and Emergency Access
- Zahrň emergency system z Hollywood
- Identifikuj závislosti na guardian system a inactivity detection
- Zabezpeč pokrytie testovacích scenárov
- Zahrň access control a emergency protocols

**Krok 5: Validácia**
- Skontroluj linter chyby a oprav ich
- Over konzistentnosť s existujúcimi špecifikáciami
- Zabezpeč správne formátovanie a štruktúru
- Over kompletnosť informácií
- Skontroluj cross-links na súvisiace špecifikácie

**Špecifické požiadavky pre 027-family-shield-emergency:**
- Zameraj sa na emergency protocols a activation triggers
- Implementuj guardian system a verification
- Zabezpeč inactivity detection a monitoring
- Zahrň access control a permission management
- Implementuj emergency testing a validation
- Zabezpeč family shield a protection
- Zahrň emergency analytics a monitoring
- Implementuj emergency performance optimization
- Zabezpeč emergency accessibility a compliance
- Zahrň emergency backup a recovery
