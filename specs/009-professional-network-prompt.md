# Prompt pre 009-professional-network

Na základe high-level-plan.md a existujúcich špecifikácií (001-008) vytvor kompletnú sadu dokumentov pre špecifikáciu 009-professional-network:

**Krok 1: Analýza a research**
- Analyzuj high-level-plan.md pre Phase 12 — Sharing, Reminders, Analytics, Sofia AI Expansion
- Identifikuj kľúčové komponenty: professional verification, review system, consultation booking, commission tracking
- Nájdi relevantné implementácie v Hollywood codebase (/Users/luborfedak/Documents/Github/hollywood) pre professional system
- Identifikuj závislosti na 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration
- Zameraj sa na: professional profiles, verification system, review management, booking system, payment integration

**Krok 2: Vytvorenie dokumentov**
Vytvor tieto súbory v `/specs/009-professional-network/`:

1. **spec.md** - Hlavná špecifikácia s:
   - Názvom: "Professional Network - Legal and Financial Services Integration"
   - Goals: professional verification, review system, consultation booking, commission tracking
   - Non-Goals: real-time video calls, document collaboration, legal advice
   - Review & Acceptance: professional verification, booking system, payment integration
   - Risks & Mitigations: professional liability, payment disputes, verification fraud
   - References: professional standards, payment systems, verification protocols
   - Cross-links: 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration
   - Linked design docs: research.md, data-model.md, quickstart.md

2. **plan.md** - Detailný plán implementácie s:
   - Phase 1: Professional Foundation (Week 1) - professional profiles, verification
   - Phase 2: Review System (Week 2) - review management, rating system
   - Phase 3: Booking System (Week 3) - consultation booking, scheduling
   - Phase 4: Payment Integration (Week 4) - commission tracking, payment processing
   - Phase 5: Analytics & Monitoring (Week 5) - performance tracking, quality assurance
   - Acceptance signals: professional verification, booking system, payment integration
   - Linked docs: research.md, data-model.md, quickstart.md

3. **tasks.md** - Kompletný zoznam úloh s:
   - T900 Professional Foundation
   - T901 Professional Profiles
   - T902 Professional Verification
   - T903 Specialization Management
   - T904 Review System
   - T905 Review Management
   - T906 Rating System
   - T907 Booking System
   - T908 Consultation Booking
   - T909 Scheduling System
   - T910 Payment Integration
   - T911 Commission Tracking
   - T912 Payment Processing
   - T913 Analytics & Monitoring
   - T914 Performance Tracking
   - T915 Quality Assurance

4. **data-model.md** - Dátový model s:
   - Professional entity s verification fields
   - Review pre professional reviews
   - Consultation pre booking system
   - Commission pre payment tracking
   - Specialization pre professional areas
   - BookingRequest pre consultation requests
   - Relations medzi entitami

5. **quickstart.md** - Testovacie scenáre s:
   - 1) Professional Registration - sign up as professional
   - 2) Verification Process - complete verification
   - 3) Review Submission - submit review
   - 4) Consultation Booking - book consultation
   - 5) Payment Processing - process payment
   - 6) Commission Tracking - track commissions
   - 7) Quality Assurance - monitor quality
   - 8) Performance Analytics - view analytics
   - 9) Dispute Resolution - handle disputes
   - 10) End-to-End Test - complete workflow

6. **research.md** - Výskumná analýza s:
   - Product scope: professional services network
   - Technical architecture: professional management, booking system
   - User experience: professional-friendly interface
   - Performance: professional network scalability
   - Security: professional data protection
   - Accessibility: professional accessibility needs
   - Analytics: professional performance tracking
   - Future enhancements: AI professional matching

7. **contracts/README.md** - API kontrakty s:
   - professional-management-api.yaml
   - review-system-api.yaml
   - booking-system-api.yaml
   - payment-integration-api.yaml
   - analytics-monitoring-api.yaml

**Krok 3: Konzistentnosť**
- Použi rovnaký formát ako 005-sofia-ai-system
- Zachovaj konzistentné kódovanie úloh (T900+)
- Udržuj konzistentný štýl a štruktúru
- Zabezpeč správne cross-links na 001, 002, 005, 006, 007, 008

**Krok 4: Kompletnosť**
- Pokry všetky aspekty z Phase 12 — Professional Network
- Zahrň professional system z Hollywood
- Identifikuj závislosti na verification a payment systems
- Zabezpeč pokrytie testovacích scenárov
- Zahrň analytics a quality assurance

**Krok 5: Validácia**
- Skontroluj linter chyby a oprav ich
- Over konzistentnosť s existujúcimi špecifikáciami
- Zabezpeč správne formátovanie a štruktúru
- Over kompletnosť informácií
- Skontroluj cross-links na súvisiace špecifikácie

**Špecifické požiadavky pre 009-professional-network:**
- Zameraj sa na professional verification a credentialing
- Implementuj review system a rating management
- Zabezpeč consultation booking a scheduling
- Zahrň payment integration a commission tracking
- Implementuj quality assurance a monitoring
- Zabezpeč professional profile management
- Zahrň specialization management
- Implementuj dispute resolution mechanisms
- Zabezpeč analytics pre professional performance
- Zahrň accessibility pre professional users
