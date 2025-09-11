# Prompt pre 028-time-capsules

Na základe high-level-plan.md a existujúcich špecifikácií (001-027) vytvor kompletnú sadu dokumentov pre špecifikáciu 028-time-capsules:

**Krok 1: Analýza a research**
- Analyzuj high-level-plan.md pre Phase 10 — Time Capsules a Phase 2G — Time Capsule Plan
- Identifikuj kľúčové komponenty: time capsule creation, scheduled delivery, video messages, legacy preservation
- Nájdi relevantné implementácie v Hollywood codebase (/Users/luborfedak/Documents/Github/hollywood) pre time capsule system
- Identifikuj závislosti na 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration, 009-professional-network, 010-emergency-access, 011-mobile-app, 012-animations-microinteractions, 013-time-capsule-legacy, 014-pricing-conversion, 015-business-journeys, 016-integration-testing, 017-production-deployment, 018-monitoring-analytics, 019-nextjs-migration, 020-auth-rls-baseline, 021-database-types, 022-billing-stripe, 023-email-resend, 024-i18n-country-rules, 025-emotional-core-mvp, 026-vault-encrypted-storage, 027-family-shield-emergency
- Zameraj sa na: video processing, scheduling system, delivery management, legacy content

**Krok 2: Vytvorenie dokumentov**
Vytvor tieto súbory v `/specs/028-time-capsules/`:

1. **spec.md** - Hlavná špecifikácia s:
   - Názvom: "Time Capsules - Legacy Messages and Scheduled Delivery"
   - Goals: time capsule creation, scheduled delivery, video messages, legacy preservation
   - Non-Goals: real-time video calls, live streaming, social media integration
   - Review & Acceptance: delivery testing, video processing, legacy preservation
   - Risks & Mitigations: delivery failures, video corruption, legacy loss
   - References: video processing, scheduling systems, legacy preservation
   - Cross-links: 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration, 009-professional-network, 010-emergency-access, 011-mobile-app, 012-animations-microinteractions, 013-time-capsule-legacy, 014-pricing-conversion, 015-business-journeys, 016-integration-testing, 017-production-deployment, 018-monitoring-analytics, 019-nextjs-migration, 020-auth-rls-baseline, 021-database-types, 022-billing-stripe, 023-email-resend, 024-i18n-country-rules, 025-emotional-core-mvp, 026-vault-encrypted-storage, 027-family-shield-emergency
   - Linked design docs: research.md, data-model.md, quickstart.md

2. **plan.md** - Detailný plán implementácie s:
   - Phase 1: Time Capsule Foundation (Week 1) - capsule creation, video recording
   - Phase 2: Scheduling System (Week 2) - delivery scheduling, trigger management
   - Phase 3: Video Processing (Week 3) - video encoding, compression, storage
   - Phase 4: Delivery System (Week 4) - delivery execution, notification system
   - Phase 5: Legacy Management (Week 5) - legacy preservation, content management
   - Acceptance signals: delivery testing, video processing, legacy preservation
   - Linked docs: research.md, data-model.md, quickstart.md

3. **tasks.md** - Kompletný zoznam úloh s:
   - T2800 Time Capsule Foundation
   - T2801 Capsule Creation
   - T2802 Video Recording
   - T2803 Scheduling System
   - T2804 Delivery Scheduling
   - T2805 Trigger Management
   - T2806 Video Processing
   - T2807 Video Encoding
   - T2808 Video Compression
   - T2809 Delivery System
   - T2810 Delivery Execution
   - T2811 Notification System
   - T2812 Legacy Management
   - T2813 Legacy Preservation
   - T2814 Content Management
   - T2815 Time Capsule Testing

4. **data-model.md** - Dátový model s:
   - TimeCapsule entity s capsule fields
   - VideoMessage pre video content
   - DeliverySchedule pre scheduling
   - DeliveryTrigger pre trigger conditions
   - LegacyContent pre legacy materials
   - TimeCapsuleLog pre capsule tracking
   - Relations medzi entitami

5. **quickstart.md** - Testovacie scenáre s:
   - 1) Time Capsule Creation - create time capsule
   - 2) Video Recording - record video message
   - 3) Scheduling Setup - configure delivery schedule
   - 4) Delivery Testing - test delivery system
   - 5) Video Processing - test video processing
   - 6) Legacy Management - test legacy features
   - 7) Performance Testing - test system performance
   - 8) Security Testing - test capsule security
   - 9) Error Handling - test error handling
   - 10) End-to-End Test - complete time capsule workflow

6. **research.md** - Výskumná analýza s:
   - Product scope: time capsule and legacy system
   - Technical architecture: video processing, scheduling system
   - User experience: time capsule user experience
   - Performance: time capsule performance optimization
   - Security: time capsule security measures
   - Accessibility: time capsule accessibility
   - Analytics: time capsule analytics and insights
   - Future enhancements: advanced time capsule features

7. **contracts/README.md** - API kontrakty s:
   - time-capsule-api.yaml
   - video-processing-api.yaml
   - delivery-scheduling-api.yaml
   - legacy-management-api.yaml
   - time-capsule-testing-api.yaml

**Krok 3: Konzistentnosť**
- Použi rovnaký formát ako 005-sofia-ai-system
- Zachovaj konzistentné kódovanie úloh (T2800+)
- Udržuj konzistentný štýl a štruktúru
- Zabezpeč správne cross-links na 001, 002, 005, 006, 007, 008, 009, 010, 011, 012, 013, 014, 015, 016, 017, 018, 019, 020, 021, 022, 023, 024, 025, 026, 027

**Krok 4: Kompletnosť**
- Pokry všetky aspekty z Phase 10 — Time Capsules a Phase 2G — Time Capsule Plan
- Zahrň time capsule system z Hollywood
- Identifikuj závislosti na video processing a scheduling
- Zabezpeč pokrytie testovacích scenárov
- Zahrň legacy preservation a content management

**Krok 5: Validácia**
- Skontroluj linter chyby a oprav ich
- Over konzistentnosť s existujúcimi špecifikáciami
- Zabezpeč správne formátovanie a štruktúru
- Over kompletnosť informácií
- Skontroluj cross-links na súvisiace špecifikácie

**Špecifické požiadavky pre 028-time-capsules:**
- Zameraj sa na time capsule creation a video recording
- Implementuj scheduling system a delivery management
- Zabezpeč video processing a compression
- Zahrň delivery execution a notification system
- Implementuj legacy preservation a content management
- Zabezpeč time capsule security a privacy
- Zahrň time capsule analytics a monitoring
- Implementuj time capsule performance optimization
- Zabezpeč time capsule accessibility a compliance
- Zahrň time capsule testing a validation
