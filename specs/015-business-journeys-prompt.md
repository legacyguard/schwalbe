# Prompt pre 015-business-journeys

Na základe high-level-plan.md a existujúcich špecifikácií (001-014) vytvor kompletnú sadu dokumentov pre špecifikáciu 015-business-journeys:

**Krok 1: Analýza a research**
- Analyzuj high-level-plan.md pre Phase 3 — Business and Journeys a Phase 2E.4 — Professional Adoption Plan
- Identifikuj kľúčové komponenty: customer journey mapping, business process optimization, user experience flows, conversion optimization
- Nájdi relevantné implementácie v Hollywood codebase (/Users/luborfedak/Documents/Github/hollywood) pre business system
- Identifikuj závislosti na 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration, 009-professional-network, 010-emergency-access, 011-mobile-app, 012-animations-microinteractions, 013-time-capsule-legacy, 014-pricing-conversion
- Zameraj sa na: customer experience, business process automation, user journey optimization, conversion funnels

**Krok 2: Vytvorenie dokumentov**
Vytvor tieto súbory v `/specs/015-business-journeys/`:

1. **spec.md** - Hlavná špecifikácia s:
   - Názvom: "Business Journeys - Customer Experience and Process Optimization"
   - Goals: customer journey mapping, business process optimization, user experience flows, conversion optimization
   - Non-Goals: complex workflow automation, enterprise integration
   - Review & Acceptance: journey optimization, conversion improvement, user satisfaction
   - Risks & Mitigations: journey complexity, user confusion, conversion drop
   - References: customer experience design, business process optimization
   - Cross-links: 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration, 009-professional-network, 010-emergency-access, 011-mobile-app, 012-animations-microinteractions, 013-time-capsule-legacy, 014-pricing-conversion
   - Linked design docs: research.md, data-model.md, quickstart.md

2. **plan.md** - Detailný plán implementácie s:
   - Phase 1: Journey Mapping (Week 1) - customer journey analysis, touchpoint mapping
   - Phase 2: Process Optimization (Week 2) - business process automation, workflow optimization
   - Phase 3: Experience Design (Week 3) - user experience flows, interface optimization
   - Phase 4: Conversion Optimization (Week 4) - conversion funnel optimization, A/B testing
   - Phase 5: Analytics & Monitoring (Week 5) - journey analytics, performance monitoring
   - Acceptance signals: journey optimization, conversion improvement, user satisfaction
   - Linked docs: research.md, data-model.md, quickstart.md

3. **tasks.md** - Kompletný zoznam úloh s:
   - T1500 Journey Mapping
   - T1501 Customer Journey Analysis
   - T1502 Touchpoint Mapping
   - T1503 Process Optimization
   - T1504 Business Process Automation
   - T1505 Workflow Optimization
   - T1506 Experience Design
   - T1507 User Experience Flows
   - T1508 Interface Optimization
   - T1509 Conversion Optimization
   - T1510 Conversion Funnel Optimization
   - T1511 A/B Testing
   - T1512 Analytics & Monitoring
   - T1513 Journey Analytics
   - T1514 Performance Monitoring
   - T1515 Business Journey Testing

4. **data-model.md** - Dátový model s:
   - CustomerJourney entity s journey fields
   - Touchpoint pre user touchpoints
   - BusinessProcess pre process automation
   - ConversionFunnel pre conversion tracking
   - UserExperience pre experience flows
   - JourneyAnalytics pre analytics tracking
   - Relations medzi entitami

5. **quickstart.md** - Testovacie scenáre s:
   - 1) Journey Mapping - map customer journeys
   - 2) Process Optimization - optimize business processes
   - 3) Experience Design - design user experiences
   - 4) Conversion Testing - test conversion funnels
   - 5) A/B Testing - test journey variations
   - 6) Analytics Testing - test journey analytics
   - 7) Performance Testing - test journey performance
   - 8) User Satisfaction - test user satisfaction
   - 9) Mobile Journey - test mobile journeys
   - 10) End-to-End Test - complete business journey

6. **research.md** - Výskumná analýza s:
   - Product scope: business journey optimization
   - Technical architecture: journey management, process automation
   - User experience: customer experience design
   - Performance: journey performance optimization
   - Security: journey data protection
   - Accessibility: journey accessibility
   - Analytics: journey analytics and insights
   - Future enhancements: AI journey optimization

7. **contracts/README.md** - API kontrakty s:
   - journey-mapping-api.yaml
   - process-optimization-api.yaml
   - experience-design-api.yaml
   - conversion-optimization-api.yaml
   - journey-analytics-api.yaml

**Krok 3: Konzistentnosť**
- Použi rovnaký formát ako 005-sofia-ai-system
- Zachovaj konzistentné kódovanie úloh (T1500+)
- Udržuj konzistentný štýl a štruktúru
- Zabezpeč správne cross-links na 001, 002, 005, 006, 007, 008, 009, 010, 011, 012, 013, 014

**Krok 4: Kompletnosť**
- Pokry všetky aspekty z Phase 3 — Business and Journeys a Phase 2E.4 — Professional Adoption Plan
- Zahrň business system z Hollywood
- Identifikuj závislosti na customer experience a process optimization
- Zabezpeč pokrytie testovacích scenárov
- Zahrň conversion optimization a user satisfaction

**Krok 5: Validácia**
- Skontroluj linter chyby a oprav ich
- Over konzistentnosť s existujúcimi špecifikáciami
- Zabezpeč správne formátovanie a štruktúru
- Over kompletnosť informácií
- Skontroluj cross-links na súvisiace špecifikácie

**Špecifické požiadavky pre 015-business-journeys:**
- Zameraj sa na customer journey mapping a optimization
- Implementuj business process automation
- Zabezpeč user experience flow optimization
- Zahrň conversion funnel optimization
- Implementuj journey analytics a monitoring
- Zabezpeč A/B testing pre journey optimization
- Zahrň mobile journey optimization
- Implementuj user satisfaction tracking
- Zabezpeč journey performance optimization
- Zahrň business intelligence a insights
