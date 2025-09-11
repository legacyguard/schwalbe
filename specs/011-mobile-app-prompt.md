# Prompt pre 011-mobile-app

Na základe high-level-plan.md a existujúcich špecifikácií (001-010) vytvor kompletnú sadu dokumentov pre špecifikáciu 011-mobile-app:

**Krok 1: Analýza a research**
- Analyzuj high-level-plan.md pre mobile app requirements
- Identifikuj kľúčové komponenty: mobile UI, offline functionality, push notifications, biometric auth
- Nájdi relevantné implementácie v Hollywood codebase (/Users/luborfedak/Documents/Github/hollywood) pre mobile system
- Identifikuj závislosti na 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration, 009-professional-network, 010-emergency-access
- Zameraj sa na: React Native, mobile UX, offline sync, push notifications, biometric security

**Krok 2: Vytvorenie dokumentov**
Vytvor tieto súbory v `/specs/011-mobile-app/`:

1. **spec.md** - Hlavná špecifikácia s:
   - Názvom: "Mobile App - Cross-Platform LegacyGuard Application"
   - Goals: mobile UI, offline functionality, push notifications, biometric auth
   - Non-Goals: native iOS/Android development, real-time collaboration
   - Review & Acceptance: mobile UX, offline sync, push notifications
   - Risks & Mitigations: platform differences, offline sync conflicts, notification delivery
   - References: React Native docs, mobile UX guidelines, push notification services
   - Cross-links: 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration, 009-professional-network, 010-emergency-access
   - Linked design docs: research.md, data-model.md, quickstart.md

2. **plan.md** - Detailný plán implementácie s:
   - Phase 1: Mobile Foundation (Week 1) - React Native setup, navigation
   - Phase 2: Core Features (Week 2) - document access, will creation
   - Phase 3: Offline Functionality (Week 3) - offline sync, data persistence
   - Phase 4: Push Notifications (Week 4) - notification system, alerts
   - Phase 5: Biometric Security (Week 5) - fingerprint, face ID, security
   - Acceptance signals: mobile UX, offline sync, push notifications
   - Linked docs: research.md, data-model.md, quickstart.md

3. **tasks.md** - Kompletný zoznam úloh s:
   - T1100 Mobile Foundation
   - T1101 React Native Setup
   - T1102 Mobile Navigation
   - T1103 Core Features
   - T1104 Document Access
   - T1105 Will Creation
   - T1106 Offline Functionality
   - T1107 Offline Sync
   - T1108 Data Persistence
   - T1109 Push Notifications
   - T1110 Notification System
   - T1111 Alert Management
   - T1112 Biometric Security
   - T1113 Fingerprint Auth
   - T1114 Face ID Auth
   - T1115 Mobile Security

4. **data-model.md** - Dátový model s:
   - MobileSession pre mobile sessions
   - OfflineData pre offline storage
   - PushNotification pre notifications
   - BiometricAuth pre biometric data
   - MobileSettings pre mobile preferences
   - SyncStatus pre sync tracking
   - Relations medzi entitami

5. **quickstart.md** - Testovacie scenáre s:
   - 1) Mobile Setup - install and configure app
   - 2) Document Access - access documents on mobile
   - 3) Will Creation - create will on mobile
   - 4) Offline Functionality - test offline features
   - 5) Push Notifications - test notifications
   - 6) Biometric Auth - test biometric security
   - 7) Sync Testing - test data synchronization
   - 8) Performance Test - test mobile performance
   - 9) Security Test - test mobile security
   - 10) End-to-End Test - complete mobile workflow

6. **research.md** - Výskumná analýza s:
   - Product scope: mobile legacy management
   - Technical architecture: React Native, mobile services
   - User experience: mobile-first design
   - Performance: mobile performance optimization
   - Security: mobile data protection
   - Accessibility: mobile accessibility
   - Analytics: mobile usage tracking
   - Future enhancements: native features

7. **contracts/README.md** - API kontrakty s:
   - mobile-app-api.yaml
   - offline-sync-api.yaml
   - push-notification-api.yaml
   - biometric-auth-api.yaml
   - mobile-security-api.yaml

**Krok 3: Konzistentnosť**
- Použi rovnaký formát ako 005-sofia-ai-system
- Zachovaj konzistentné kódovanie úloh (T1100+)
- Udržuj konzistentný štýl a štruktúru
- Zabezpeč správne cross-links na 001, 002, 005, 006, 007, 008, 009, 010

**Krok 4: Kompletnosť**
- Pokry všetky aspekty z mobile app requirements
- Zahrň mobile system z Hollywood
- Identifikuj závislosti na offline functionality a push notifications
- Zabezpeč pokrytie testovacích scenárov
- Zahrň biometric security a mobile UX

**Krok 5: Validácia**
- Skontroluj linter chyby a oprav ich
- Over konzistentnosť s existujúcimi špecifikáciami
- Zabezpeč správne formátovanie a štruktúru
- Over kompletnosť informácií
- Skontroluj cross-links na súvisiace špecifikácie

**Špecifické požiadavky pre 011-mobile-app:**
- Zameraj sa na React Native cross-platform development
- Implementuj mobile-first UI/UX design
- Zabezpeč offline functionality a data sync
- Zahrň push notifications a alert system
- Implementuj biometric authentication
- Zabezpeč mobile security a data protection
- Zahrň mobile performance optimization
- Implementuj mobile accessibility features
- Zabezpeč mobile analytics a monitoring
- Zahrň mobile testing a validation
