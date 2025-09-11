# Prompt pre 031-observability-security-hardening

Na základe high-level-plan.md a existujúcich špecifikácií (001-030) vytvor kompletnú sadu dokumentov pre špecifikáciu 031-observability-security-hardening:

**Krok 1: Analýza a research**
- Analyzuj high-level-plan.md pre Phase 13 — Observability, Security, and Performance Hardening
- Identifikuj kľúčové komponenty: observability system, security hardening, performance optimization, monitoring
- Nájdi relevantné implementácie v Hollywood codebase (/Users/luborfedak/Documents/Github/hollywood) pre security system
- Identifikuj závislosti na 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration, 009-professional-network, 010-emergency-access, 011-mobile-app, 012-animations-microinteractions, 013-time-capsule-legacy, 014-pricing-conversion, 015-business-journeys, 016-integration-testing, 017-production-deployment, 018-monitoring-analytics, 019-nextjs-migration, 020-auth-rls-baseline, 021-database-types, 022-billing-stripe, 023-email-resend, 024-i18n-country-rules, 025-emotional-core-mvp, 026-vault-encrypted-storage, 027-family-shield-emergency, 028-time-capsules, 029-will-generation-engine, 030-sharing-reminders-analytics
- Zameraj sa na: Supabase logs, security scanning, performance monitoring, alerting system

**Krok 2: Vytvorenie dokumentov**
Vytvor tieto súbory v `/specs/031-observability-security-hardening/`:

1. **spec.md** - Hlavná špecifikácia s:
   - Názvom: "Observability & Security Hardening - Monitoring and Security System"
   - Goals: observability system, security hardening, performance optimization, monitoring
   - Non-Goals: complex monitoring, enterprise security, real-time dashboards
   - Review & Acceptance: monitoring coverage, security validation, performance optimization
   - Risks & Mitigations: monitoring gaps, security vulnerabilities, performance degradation
   - References: Supabase logs, security best practices, monitoring standards
   - Cross-links: 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration, 009-professional-network, 010-emergency-access, 011-mobile-app, 012-animations-microinteractions, 013-time-capsule-legacy, 014-pricing-conversion, 015-business-journeys, 016-integration-testing, 017-production-deployment, 018-monitoring-analytics, 019-nextjs-migration, 020-auth-rls-baseline, 021-database-types, 022-billing-stripe, 023-email-resend, 024-i18n-country-rules, 025-emotional-core-mvp, 026-vault-encrypted-storage, 027-family-shield-emergency, 028-time-capsules, 029-will-generation-engine, 030-sharing-reminders-analytics
   - Linked design docs: research.md, data-model.md, quickstart.md

2. **plan.md** - Detailný plán implementácie s:
   - Phase 1: Observability Foundation (Week 1) - monitoring setup, log collection
   - Phase 2: Security Hardening (Week 2) - security measures, vulnerability scanning
   - Phase 3: Performance Optimization (Week 3) - performance tuning, optimization
   - Phase 4: Alerting System (Week 4) - alerting rules, notification system
   - Phase 5: Testing & Validation (Week 5) - security testing, performance validation
   - Acceptance signals: monitoring coverage, security validation, performance optimization
   - Linked docs: research.md, data-model.md, quickstart.md

3. **tasks.md** - Kompletný zoznam úloh s:
   - T3100 Observability Foundation
   - T3101 Monitoring Setup
   - T3102 Log Collection
   - T3103 Security Hardening
   - T3104 Security Measures
   - T3105 Vulnerability Scanning
   - T3106 Performance Optimization
   - T3107 Performance Tuning
   - T3108 Optimization Testing
   - T3109 Alerting System
   - T3110 Alerting Rules
   - T3111 Notification System
   - T3112 Testing & Validation
   - T3113 Security Testing
   - T3114 Performance Validation
   - T3115 Observability Testing

4. **data-model.md** - Dátový model s:
   - ObservabilityConfig entity s configuration fields
   - SecurityScan pre security validation
   - PerformanceMetric pre performance data
   - AlertRule pre alerting rules
   - MonitoringLog pre monitoring data
   - SecurityLog pre security tracking
   - Relations medzi entitami

5. **quickstart.md** - Testovacie scenáre s:
   - 1) Observability Setup - configure monitoring system
   - 2) Security Testing - test security measures
   - 3) Performance Testing - test performance optimization
   - 4) Alerting Testing - test alerting system
   - 5) Vulnerability Testing - test vulnerability scanning
   - 6) Monitoring Testing - test monitoring coverage
   - 7) Performance Validation - test performance validation
   - 8) Security Validation - test security validation
   - 9) Error Handling - test error handling
   - 10) End-to-End Test - complete observability workflow

6. **research.md** - Výskumná analýza s:
   - Product scope: observability and security system
   - Technical architecture: monitoring framework, security system
   - User experience: observability user experience
   - Performance: observability performance optimization
   - Security: observability security measures
   - Accessibility: observability accessibility
   - Analytics: observability analytics and insights
   - Future enhancements: advanced observability features

7. **contracts/README.md** - API kontrakty s:
   - observability-system-api.yaml
   - security-hardening-api.yaml
   - performance-optimization-api.yaml
   - alerting-system-api.yaml
   - observability-testing-api.yaml

**Krok 3: Konzistentnosť**
- Použi rovnaký formát ako 005-sofia-ai-system
- Zachovaj konzistentné kódovanie úloh (T3100+)
- Udržuj konzistentný štýl a štruktúru
- Zabezpeč správne cross-links na 001, 002, 005, 006, 007, 008, 009, 010, 011, 012, 013, 014, 015, 016, 017, 018, 019, 020, 021, 022, 023, 024, 025, 026, 027, 028, 029, 030

**Krok 4: Kompletnosť**
- Pokry všetky aspekty z Phase 13 — Observability, Security, and Performance Hardening
- Zahrň security system z Hollywood
- Identifikuj závislosti na monitoring a security hardening
- Zabezpeč pokrytie testovacích scenárov
- Zahrň performance optimization a alerting system

**Krok 5: Validácia**
- Skontroluj linter chyby a oprav ich
- Over konzistentnosť s existujúcimi špecifikáciami
- Zabezpeč správne formátovanie a štruktúru
- Over kompletnosť informácií
- Skontroluj cross-links na súvisiace špecifikácie

**Špecifické požiadavky pre 031-observability-security-hardening:**
- Zameraj sa na observability system a monitoring setup
- Implementuj security hardening a vulnerability scanning
- Zabezpeč performance optimization a tuning
- Zahrň alerting system a notification management
- Implementuj security testing a validation
- Zabezpeč observability security a compliance
- Zahrň observability analytics a monitoring
- Implementuj observability performance optimization
- Zabezpeč observability accessibility a compliance
- Zahrň observability backup a recovery
