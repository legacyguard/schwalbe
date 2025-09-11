# Prompt pre 016-integration-testing

Na základe high-level-plan.md a existujúcich špecifikácií (001-015) vytvor kompletnú sadu dokumentov pre špecifikáciu 016-integration-testing:

**Krok 1: Analýza a research**
- Analyzuj high-level-plan.md pre testing requirements a quality gates
- Identifikuj kľúčové komponenty: end-to-end testing, integration testing, performance testing, security testing
- Nájdi relevantné implementácie v Hollywood codebase (/Users/luborfedak/Documents/Github/hollywood) pre testing system
- Identifikuj závislosti na 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration, 009-professional-network, 010-emergency-access, 011-mobile-app, 012-animations-microinteractions, 013-time-capsule-legacy, 014-pricing-conversion, 015-business-journeys
- Zameraj sa na: Playwright testing, API testing, performance testing, security testing, accessibility testing

**Krok 2: Vytvorenie dokumentov**
Vytvor tieto súbory v `/specs/016-integration-testing/`:

1. **spec.md** - Hlavná špecifikácia s:
   - Názvom: "Integration Testing - End-to-End Testing and Quality Assurance"
   - Goals: end-to-end testing, integration testing, performance testing, security testing
   - Non-Goals: manual testing only, unit testing, component testing
   - Review & Acceptance: test coverage, performance benchmarks, security validation
   - Risks & Mitigations: test flakiness, performance degradation, security vulnerabilities
   - References: Playwright docs, testing best practices, performance standards
   - Cross-links: 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration, 009-professional-network, 010-emergency-access, 011-mobile-app, 012-animations-microinteractions, 013-time-capsule-legacy, 014-pricing-conversion, 015-business-journeys
   - Linked design docs: research.md, data-model.md, quickstart.md

2. **plan.md** - Detailný plán implementácie s:
   - Phase 1: Testing Foundation (Week 1) - testing framework, test infrastructure
   - Phase 2: End-to-End Testing (Week 2) - user journey testing, workflow testing
   - Phase 3: Integration Testing (Week 3) - API testing, service integration
   - Phase 4: Performance Testing (Week 4) - load testing, performance benchmarks
   - Phase 5: Security Testing (Week 5) - security validation, vulnerability testing
   - Acceptance signals: test coverage, performance benchmarks, security validation
   - Linked docs: research.md, data-model.md, quickstart.md

3. **tasks.md** - Kompletný zoznam úloh s:
   - T1600 Testing Foundation
   - T1601 Testing Framework
   - T1602 Test Infrastructure
   - T1603 End-to-End Testing
   - T1604 User Journey Testing
   - T1605 Workflow Testing
   - T1606 Integration Testing
   - T1607 API Testing
   - T1608 Service Integration
   - T1609 Performance Testing
   - T1610 Load Testing
   - T1611 Performance Benchmarks
   - T1612 Security Testing
   - T1613 Security Validation
   - T1614 Vulnerability Testing
   - T1615 Testing Automation

4. **data-model.md** - Dátový model s:
   - TestSuite entity s test fields
   - TestCase pre individual tests
   - TestResult pre test results
   - PerformanceMetric pre performance data
   - SecurityTest pre security tests
   - TestCoverage pre coverage tracking
   - Relations medzi entitami

5. **quickstart.md** - Testovacie scenáre s:
   - 1) Testing Setup - configure testing environment
   - 2) End-to-End Testing - test complete workflows
   - 3) Integration Testing - test service integrations
   - 4) Performance Testing - test system performance
   - 5) Security Testing - test security measures
   - 6) Accessibility Testing - test accessibility compliance
   - 7) Mobile Testing - test mobile functionality
   - 8) API Testing - test API endpoints
   - 9) Load Testing - test system under load
   - 10) End-to-End Test - complete testing workflow

6. **research.md** - Výskumná analýza s:
   - Product scope: comprehensive testing system
   - Technical architecture: testing framework, automation
   - User experience: testing user experience
   - Performance: testing performance optimization
   - Security: testing security validation
   - Accessibility: testing accessibility compliance
   - Analytics: testing analytics and insights
   - Future enhancements: AI testing optimization

7. **contracts/README.md** - API kontrakty s:
   - testing-framework-api.yaml
   - end-to-end-testing-api.yaml
   - integration-testing-api.yaml
   - performance-testing-api.yaml
   - security-testing-api.yaml

**Krok 3: Konzistentnosť**
- Použi rovnaký formát ako 005-sofia-ai-system
- Zachovaj konzistentné kódovanie úloh (T1600+)
- Udržuj konzistentný štýl a štruktúru
- Zabezpeč správne cross-links na 001, 002, 005, 006, 007, 008, 009, 010, 011, 012, 013, 014, 015

**Krok 4: Kompletnosť**
- Pokry všetky aspekty z testing requirements a quality gates
- Zahrň testing system z Hollywood
- Identifikuj závislosti na testing framework a automation
- Zabezpeč pokrytie testovacích scenárov
- Zahrň performance testing a security validation

**Krok 5: Validácia**
- Skontroluj linter chyby a oprav ich
- Over konzistentnosť s existujúcimi špecifikáciami
- Zabezpeč správne formátovanie a štruktúru
- Over kompletnosť informácií
- Skontroluj cross-links na súvisiace špecifikácie

**Špecifické požiadavky pre 016-integration-testing:**
- Zameraj sa na Playwright end-to-end testing
- Implementuj comprehensive test coverage
- Zabezpeč performance testing a benchmarks
- Zahrň security testing a validation
- Implementuj accessibility testing
- Zabezpeč mobile testing coverage
- Zahrň API testing a integration testing
- Implementuj test automation a CI/CD
- Zabezpeč test reporting a analytics
- Zahrň test maintenance a updates
