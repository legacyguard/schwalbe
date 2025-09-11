# Prompt pre 010-emergency-access

Na základe high-level-plan.md a existujúcich špecifikácií (001-009) vytvor kompletnú sadu dokumentov pre špecifikáciu 010-emergency-access:

**Krok 1: Analýza a research**
- Analyzuj high-level-plan.md pre Phase 9 — Family Shield and Emergency Access
- Identifikuj kľúčové komponenty: emergency activation, inactivity detection, staged access control, document release
- Nájdi relevantné implementácie v Hollywood codebase (/Users/luborfedak/Documents/Github/hollywood) pre emergency system
- Identifikuj závislosti na 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration, 009-professional-network
- Zameraj sa na: emergency protocols, inactivity monitoring, access staging, document release, guardian verification

**Krok 2: Vytvorenie dokumentov**
Vytvor tieto súbory v `/specs/010-emergency-access/`:

1. **spec.md** - Hlavná špecifikácia s:
   - Názvom: "Emergency Access - Crisis Response and Document Release System"
   - Goals: emergency activation, inactivity detection, staged access, document release
   - Non-Goals: real-time monitoring, automatic activation, medical alerts
   - Review & Acceptance: emergency simulation, access staging, document release
   - Risks & Mitigations: false activation, access abuse, guardian conflicts
   - References: emergency protocols, access control, document security
   - Cross-links: 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration, 009-professional-network
   - Linked design docs: research.md, data-model.md, quickstart.md

2. **plan.md** - Detailný plán implementácie s:
   - Phase 1: Emergency Foundation (Week 1) - emergency protocols, activation triggers
   - Phase 2: Inactivity Detection (Week 2) - monitoring system, detection algorithms
   - Phase 3: Access Staging (Week 3) - staged access control, permission levels
   - Phase 4: Document Release (Week 4) - document access, release protocols
   - Phase 5: Guardian Verification (Week 5) - guardian authentication, verification
   - Acceptance signals: emergency simulation, access staging, document release
   - Linked docs: research.md, data-model.md, quickstart.md

3. **tasks.md** - Kompletný zoznam úloh s:
   - T1000 Emergency Foundation
   - T1001 Emergency Protocols
   - T1002 Activation Triggers
   - T1003 Inactivity Detection
   - T1004 Monitoring System
   - T1005 Detection Algorithms
   - T1006 Access Staging
   - T1007 Staged Access Control
   - T1008 Permission Levels
   - T1009 Document Release
   - T1010 Document Access
   - T1011 Release Protocols
   - T1012 Guardian Verification
   - T1013 Guardian Authentication
   - T1014 Verification System
   - T1015 Emergency Simulation

4. **data-model.md** - Dátový model s:
   - EmergencyProtocol entity s activation fields
   - InactivityTrigger pre monitoring
   - AccessStage pre staged access
   - DocumentRelease pre document access
   - GuardianVerification pre guardian auth
   - EmergencyLog pre audit tracking
   - Relations medzi entitami

5. **quickstart.md** - Testovacie scenáre s:
   - 1) Emergency Setup - configure emergency protocols
   - 2) Inactivity Detection - test monitoring system
   - 3) Access Staging - test staged access
   - 4) Document Release - test document access
   - 5) Guardian Verification - test guardian auth
   - 6) Emergency Simulation - test full emergency flow
   - 7) False Activation - test false positive handling
   - 8) Access Abuse - test security measures
   - 9) Performance Test - test system performance
   - 10) End-to-End Test - complete emergency workflow

6. **research.md** - Výskumná analýza s:
   - Product scope: emergency access system
   - Technical architecture: emergency protocols, access control
   - User experience: emergency-friendly interface
   - Performance: emergency response time
   - Security: emergency data protection
   - Accessibility: emergency accessibility needs
   - Analytics: emergency system monitoring
   - Future enhancements: AI emergency detection

7. **contracts/README.md** - API kontrakty s:
   - emergency-protocol-api.yaml
   - inactivity-detection-api.yaml
   - access-staging-api.yaml
   - document-release-api.yaml
   - guardian-verification-api.yaml

**Krok 3: Konzistentnosť**
- Použi rovnaký formát ako 005-sofia-ai-system
- Zachovaj konzistentné kódovanie úloh (T1000+)
- Udržuj konzistentný štýl a štruktúru
- Zabezpeč správne cross-links na 001, 002, 005, 006, 007, 008, 009

**Krok 4: Kompletnosť**
- Pokry všetky aspekty z Phase 9 — Family Shield and Emergency Access
- Zahrň emergency system z Hollywood
- Identifikuj závislosti na inactivity detection a access control
- Zabezpeč pokrytie testovacích scenárov
- Zahrň guardian verification a document release

**Krok 5: Validácia**
- Skontroluj linter chyby a oprav ich
- Over konzistentnosť s existujúcimi špecifikáciami
- Zabezpeč správne formátovanie a štruktúru
- Over kompletnosť informácií
- Skontroluj cross-links na súvisiace špecifikácie

**Špecifické požiadavky pre 010-emergency-access:**
- Zameraj sa na emergency activation a crisis response
- Implementuj inactivity detection a monitoring
- Zabezpeč staged access control a permission levels
- Zahrň document release a access protocols
- Implementuj guardian verification a authentication
- Zabezpeč emergency simulation a testing
- Zahrň false activation prevention
- Implementuj access abuse protection
- Zabezpeč emergency response performance
- Zahrň emergency system monitoring
