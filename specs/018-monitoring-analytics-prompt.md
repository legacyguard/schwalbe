# Prompt pre 018-monitoring-analytics

Na základe high-level-plan.md a existujúcich špecifikácií (001-017) vytvor kompletnú sadu dokumentov pre špecifikáciu 018-monitoring-analytics:

**Krok 1: Analýza a research**
- Analyzuj high-level-plan.md pre Phase 13 — Observability, Security, and Performance Hardening
- Identifikuj kľúčové komponenty: monitoring system, analytics tracking, performance metrics, error logging
- Nájdi relevantné implementácie v Hollywood codebase (/Users/luborfedak/Documents/Github/hollywood) pre monitoring system
- Identifikuj závislosti na 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration, 009-professional-network, 010-emergency-access, 011-mobile-app, 012-animations-microinteractions, 013-time-capsule-legacy, 014-pricing-conversion, 015-business-journeys, 016-integration-testing, 017-production-deployment
- Zameraj sa na: Supabase logs, DB error table, Resend alerts, performance monitoring, user analytics

**Krok 2: Vytvorenie dokumentov**
Vytvor tieto súbory v `/specs/018-monitoring-analytics/`:

1. **spec.md** - Hlavná špecifikácia s:
   - Názvom: "Monitoring & Analytics - Observability and Performance Tracking"
   - Goals: monitoring system, analytics tracking, performance metrics, error logging
   - Non-Goals: third-party monitoring, complex analytics, real-time dashboards
   - Review & Acceptance: monitoring coverage, analytics accuracy, performance tracking
   - Risks & Mitigations: monitoring gaps, data privacy, performance impact
   - References: Supabase logs, monitoring best practices, analytics standards
   - Cross-links: 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration, 009-professional-network, 010-emergency-access, 011-mobile-app, 012-animations-microinteractions, 013-time-capsule-legacy, 014-pricing-conversion, 015-business-journeys, 016-integration-testing, 017-production-deployment
   - Linked design docs: research.md, data-model.md, quickstart.md

2. **plan.md** - Detailný plán implementácie s:
   - Phase 1: Monitoring Foundation (Week 1) - monitoring setup, log collection
   - Phase 2: Analytics System (Week 2) - analytics tracking, data collection
   - Phase 3: Performance Monitoring (Week 3) - performance metrics, optimization
   - Phase 4: Error Logging (Week 4) - error tracking, alerting system
   - Phase 5: Reporting & Dashboards (Week 5) - reporting system, dashboards
   - Acceptance signals: monitoring coverage, analytics accuracy, performance tracking
   - Linked docs: research.md, data-model.md, quickstart.md

3. **tasks.md** - Kompletný zoznam úloh s:
   - T1800 Monitoring Foundation
   - T1801 Monitoring Setup
   - T1802 Log Collection
   - T1803 Analytics System
   - T1804 Analytics Tracking
   - T1805 Data Collection
   - T1806 Performance Monitoring
   - T1807 Performance Metrics
   - T1808 Performance Optimization
   - T1809 Error Logging
   - T1810 Error Tracking
   - T1811 Alerting System
   - T1812 Reporting & Dashboards
   - T1813 Reporting System
   - T1814 Dashboard Creation
   - T1815 Monitoring Testing

4. **data-model.md** - Dátový model s:
   - MonitoringMetric entity s metric fields
   - AnalyticsEvent pre analytics tracking
   - PerformanceData pre performance metrics
   - ErrorLog pre error tracking
   - AlertRule pre alerting rules
   - Dashboard pre dashboard configuration
   - Relations medzi entitami

5. **quickstart.md** - Testovacie scenáre s:
   - 1) Monitoring Setup - configure monitoring system
   - 2) Analytics Testing - test analytics tracking
   - 3) Performance Testing - test performance monitoring
   - 4) Error Testing - test error logging
   - 5) Alert Testing - test alerting system
   - 6) Dashboard Testing - test dashboard functionality
   - 7) Data Privacy Testing - test data privacy
   - 8) Performance Impact Testing - test monitoring impact
   - 9) Scalability Testing - test monitoring scalability
   - 10) End-to-End Test - complete monitoring workflow

6. **research.md** - Výskumná analýza s:
   - Product scope: monitoring and analytics system
   - Technical architecture: monitoring framework, analytics engine
   - User experience: monitoring user experience
   - Performance: monitoring performance optimization
   - Security: monitoring data protection
   - Accessibility: monitoring accessibility
   - Analytics: monitoring analytics and insights
   - Future enhancements: AI monitoring optimization

7. **contracts/README.md** - API kontrakty s:
   - monitoring-system-api.yaml
   - analytics-tracking-api.yaml
   - performance-monitoring-api.yaml
   - error-logging-api.yaml
   - reporting-dashboard-api.yaml

**Krok 3: Konzistentnosť**
- Použi rovnaký formát ako 005-sofia-ai-system
- Zachovaj konzistentné kódovanie úloh (T1800+)
- Udržuj konzistentný štýl a štruktúru
- Zabezpeč správne cross-links na 001, 002, 005, 006, 007, 008, 009, 010, 011, 012, 013, 014, 015, 016, 017

**Krok 4: Kompletnosť**
- Pokry všetky aspekty z Phase 13 — Observability, Security, and Performance Hardening
- Zahrň monitoring system z Hollywood
- Identifikuj závislosti na Supabase logs a analytics
- Zabezpeč pokrytie testovacích scenárov
- Zahrň performance monitoring a error logging

**Krok 5: Validácia**
- Skontroluj linter chyby a oprav ich
- Over konzistentnosť s existujúcimi špecifikáciami
- Zabezpeč správne formátovanie a štruktúru
- Over kompletnosť informácií
- Skontroluj cross-links na súvisiace špecifikácie

**Špecifické požiadavky pre 018-monitoring-analytics:**
- Zameraj sa na Supabase logs a DB error table
- Implementuj Resend alerts a notification system
- Zabezpeč performance monitoring a metrics
- Zahrň user analytics a behavior tracking
- Implementuj error logging a tracking
- Zabezpeč data privacy a compliance
- Zahrň reporting system a dashboards
- Implementuj alerting rules a notifications
- Zabezpeč monitoring scalability a performance
- Zahrň monitoring testing a validation
