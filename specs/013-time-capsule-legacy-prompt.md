# Prompt pre 013-time-capsule-legacy

Na základe high-level-plan.md a existujúcich špecifikácií (001-012) vytvor kompletnú sadu dokumentov pre špecifikáciu 013-time-capsule-legacy:

**Krok 1: Analýza a research**
- Analyzuj high-level-plan.md pre Phase 10 — Time Capsules a Phase 2G — Time Capsule Plan
- Identifikuj kľúčové komponenty: time capsule creation, scheduled delivery, video messages, legacy preservation
- Nájdi relevantné implementácie v Hollywood codebase (/Users/luborfedak/Documents/Github/hollywood) pre time capsule system
- Identifikuj závislosti na 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration, 009-professional-network, 010-emergency-access, 011-mobile-app, 012-animations-microinteractions
- Zameraj sa na: video recording, scheduled delivery, encryption, legacy messages, emotional impact

**Krok 2: Vytvorenie dokumentov**
Vytvor tieto súbory v `/specs/013-time-capsule-legacy/`:

1. **spec.md** - Hlavná špecifikácia s:
   - Názvom: "Time Capsule Legacy - Video Messages and Scheduled Delivery"
   - Goals: time capsule creation, scheduled delivery, video messages, legacy preservation
   - Non-Goals: real-time video calls, live streaming, social media integration
   - Review & Acceptance: delivery testing, encryption validation, emotional impact
   - Risks & Mitigations: delivery failures, encryption issues, emotional distress
   - References: video processing, scheduling systems, encryption standards
   - Cross-links: 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration, 009-professional-network, 010-emergency-access, 011-mobile-app, 012-animations-microinteractions
   - Linked design docs: research.md, data-model.md, quickstart.md

2. **plan.md** - Detailný plán implementácie s:
   - Phase 1: Time Capsule Foundation (Week 1) - capsule creation, video recording
   - Phase 2: Scheduling System (Week 2) - delivery scheduling, trigger management
   - Phase 3: Video Processing (Week 3) - video encoding, compression, storage
   - Phase 4: Delivery System (Week 4) - delivery execution, notification system
   - Phase 5: Legacy Management (Week 5) - legacy preservation, emotional support
   - Acceptance signals: delivery testing, encryption validation, emotional impact
   - Linked docs: research.md, data-model.md, quickstart.md

3. **tasks.md** - Kompletný zoznam úloh s:
   - T1300 Time Capsule Foundation
   - T1301 Capsule Creation
   - T1302 Video Recording
   - T1303 Scheduling System
   - T1304 Delivery Scheduling
   - T1305 Trigger Management
   - T1306 Video Processing
   - T1307 Video Encoding
   - T1308 Video Compression
   - T1309 Delivery System
   - T1310 Delivery Execution
   - T1311 Notification System
   - T1312 Legacy Management
   - T1313 Legacy Preservation
   - T1314 Emotional Support
   - T1315 Time Capsule Testing

4. **data-model.md** - Dátový model s:
   - TimeCapsule entity s delivery fields
   - VideoMessage pre video content
   - DeliverySchedule pre scheduling
   - DeliveryTrigger pre trigger conditions
   - LegacyContent pre legacy materials
   - EmotionalSupport pre support resources
   - Relations medzi entitami

5. **quickstart.md** - Testovacie scenáre s:
   - 1) Time Capsule Creation - create time capsule
   - 2) Video Recording - record video message
   - 3) Scheduling Setup - configure delivery schedule
   - 4) Delivery Testing - test delivery system
   - 5) Video Processing - test video processing
   - 6) Encryption Testing - test video encryption
   - 7) Legacy Management - test legacy features
   - 8) Emotional Support - test support features
   - 9) Performance Testing - test system performance
   - 10) End-to-End Test - complete time capsule workflow

6. **research.md** - Výskumná analýza s:
   - Product scope: legacy preservation system
   - Technical architecture: video processing, scheduling system
   - User experience: emotional impact, legacy creation
   - Performance: video processing performance
   - Security: video encryption, privacy protection
   - Accessibility: video accessibility, legacy access
   - Analytics: legacy engagement tracking
   - Future enhancements: AI legacy assistance

7. **contracts/README.md** - API kontrakty s:
   - time-capsule-api.yaml
   - video-processing-api.yaml
   - delivery-scheduling-api.yaml
   - legacy-management-api.yaml
   - emotional-support-api.yaml

**Krok 3: Konzistentnosť**
- Použi rovnaký formát ako 005-sofia-ai-system
- Zachovaj konzistentné kódovanie úloh (T1300+)
- Udržuj konzistentný štýl a štruktúru
- Zabezpeč správne cross-links na 001, 002, 005, 006, 007, 008, 009, 010, 011, 012

**Krok 4: Kompletnosť**
- Pokry všetky aspekty z Phase 10 — Time Capsules a Phase 2G — Time Capsule Plan
- Zahrň time capsule system z Hollywood
- Identifikuj závislosti na video processing a scheduling
- Zabezpeč pokrytie testovacích scenárov
- Zahrň legacy preservation a emotional support

**Krok 5: Validácia**
- Skontroluj linter chyby a oprav ich
- Over konzistentnosť s existujúcimi špecifikáciami
- Zabezpeč správne formátovanie a štruktúru
- Over kompletnosť informácií
- Skontroluj cross-links na súvisiace špecifikácie

**Špecifické požiadavky pre 013-time-capsule-legacy:**
- Zameraj sa na video recording a processing
- Implementuj scheduled delivery system
- Zabezpeč video encryption a privacy
- Zahrň legacy preservation features
- Implementuj emotional support system
- Zabezpeč delivery testing a validation
- Zahrň video accessibility features
- Implementuj legacy analytics a monitoring
- Zabezpeč mobile video recording
- Zahrň legacy content management
