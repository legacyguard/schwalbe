# Prompt pre 032-governance-spec-kit

Na základe high-level-plan.md a existujúcich špecifikácií (001-031) vytvor kompletnú sadu dokumentov pre špecifikáciu 032-governance-spec-kit:

**Krok 1: Analýza a research**
- Analyzuj high-level-plan.md pre Phase 0 — Bootstrap, Governance, and Hygiene
- Identifikuj kľúčové komponenty: spec-kit governance, Linear integration, PR discipline, documentation management
- Nájdi relevantné implementácie v Hollywood codebase (/Users/luborfedak/Documents/Github/hollywood) pre governance system
- Identifikuj závislosti na 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration, 009-professional-network, 010-emergency-access, 011-mobile-app, 012-animations-microinteractions, 013-time-capsule-legacy, 014-pricing-conversion, 015-business-journeys, 016-integration-testing, 017-production-deployment, 018-monitoring-analytics, 019-nextjs-migration, 020-auth-rls-baseline, 021-database-types, 022-billing-stripe, 023-email-resend, 024-i18n-country-rules, 025-emotional-core-mvp, 026-vault-encrypted-storage, 027-family-shield-emergency, 028-time-capsules, 029-will-generation-engine, 030-sharing-reminders-analytics, 031-observability-security-hardening
- Zameraj sa na: spec-kit workflow, Linear integration, PR templates, documentation standards

**Krok 2: Vytvorenie dokumentov**
Vytvor tieto súbory v `/specs/032-governance-spec-kit/`:

1. **spec.md** - Hlavná špecifikácia s:
   - Názvom: "Governance Spec Kit - Project Management and Documentation System"
   - Goals: spec-kit governance, Linear integration, PR discipline, documentation management
   - Non-Goals: complex project management, enterprise tools, real-time collaboration
   - Review & Acceptance: governance compliance, documentation standards, PR discipline
   - Risks & Mitigations: governance drift, documentation gaps, PR quality issues
   - References: spec-kit docs, Linear integration, PR best practices
   - Cross-links: 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration, 009-professional-network, 010-emergency-access, 011-mobile-app, 012-animations-microinteractions, 013-time-capsule-legacy, 014-pricing-conversion, 015-business-journeys, 016-integration-testing, 017-production-deployment, 018-monitoring-analytics, 019-nextjs-migration, 020-auth-rls-baseline, 021-database-types, 022-billing-stripe, 023-email-resend, 024-i18n-country-rules, 025-emotional-core-mvp, 026-vault-encrypted-storage, 027-family-shield-emergency, 028-time-capsules, 029-will-generation-engine, 030-sharing-reminders-analytics, 031-observability-security-hardening
   - Linked design docs: research.md, data-model.md, quickstart.md

2. **plan.md** - Detailný plán implementácie s:
   - Phase 1: Spec Kit Setup (Week 1) - spec-kit configuration, workflow setup
   - Phase 2: Linear Integration (Week 2) - Linear integration, project management
   - Phase 3: PR Discipline (Week 3) - PR templates, quality gates
   - Phase 4: Documentation Management (Week 4) - documentation standards, maintenance
   - Phase 5: Testing & Validation (Week 5) - governance testing, compliance validation
   - Acceptance signals: governance compliance, documentation standards, PR discipline
   - Linked docs: research.md, data-model.md, quickstart.md

3. **tasks.md** - Kompletný zoznam úloh s:
   - T3200 Spec Kit Setup
   - T3201 Spec Kit Configuration
   - T3202 Workflow Setup
   - T3203 Linear Integration
   - T3204 Linear Integration
   - T3205 Project Management
   - T3206 PR Discipline
   - T3207 PR Templates
   - T3208 Quality Gates
   - T3209 Documentation Management
   - T3210 Documentation Standards
   - T3211 Maintenance System
   - T3212 Testing & Validation
   - T3213 Governance Testing
   - T3214 Compliance Validation
   - T3215 Governance Testing

4. **data-model.md** - Dátový model s:
   - GovernanceConfig entity s configuration fields
   - SpecKitWorkflow pre workflow management
   - LinearProject pre project management
   - PRTemplate pre PR templates
   - DocumentationStandard pre documentation rules
   - GovernanceLog pre governance tracking
   - Relations medzi entitami

5. **quickstart.md** - Testovacie scenáre s:
   - 1) Spec Kit Setup - configure spec-kit system
   - 2) Linear Integration - test Linear integration
   - 3) PR Testing - test PR templates
   - 4) Documentation Testing - test documentation standards
   - 5) Governance Testing - test governance compliance
   - 6) Quality Gates Testing - test quality gates
   - 7) Workflow Testing - test workflow management
   - 8) Compliance Testing - test compliance validation
   - 9) Performance Testing - test governance performance
   - 10) End-to-End Test - complete governance workflow

6. **research.md** - Výskumná analýza s:
   - Product scope: governance and project management system
   - Technical architecture: spec-kit framework, Linear integration
   - User experience: governance user experience
   - Performance: governance performance optimization
   - Security: governance security measures
   - Accessibility: governance accessibility
   - Analytics: governance analytics and insights
   - Future enhancements: advanced governance features

7. **contracts/README.md** - API kontrakty s:
   - spec-kit-api.yaml
   - linear-integration-api.yaml
   - pr-discipline-api.yaml
   - documentation-management-api.yaml
   - governance-testing-api.yaml

**Krok 3: Konzistentnosť**
- Použi rovnaký formát ako 005-sofia-ai-system
- Zachovaj konzistentné kódovanie úloh (T3200+)
- Udržuj konzistentný štýl a štruktúru
- Zabezpeč správne cross-links na 001, 002, 005, 006, 007, 008, 009, 010, 011, 012, 013, 014, 015, 016, 017, 018, 019, 020, 021, 022, 023, 024, 025, 026, 027, 028, 029, 030, 031

**Krok 4: Kompletnosť**
- Pokry všetky aspekty z Phase 0 — Bootstrap, Governance, and Hygiene
- Zahrň governance system z Hollywood
- Identifikuj závislosti na spec-kit workflow a Linear integration
- Zabezpeč pokrytie testovacích scenárov
- Zahrň PR discipline a documentation management

**Krok 5: Validácia**
- Skontroluj linter chyby a oprav ich
- Over konzistentnosť s existujúcimi špecifikáciami
- Zabezpeč správne formátovanie a štruktúru
- Over kompletnosť informácií
- Skontroluj cross-links na súvisiace špecifikácie

**Špecifické požiadavky pre 032-governance-spec-kit:**
- Zameraj sa na spec-kit workflow a governance compliance
- Implementuj Linear integration a project management
- Zabezpeč PR discipline a quality gates
- Zahrň documentation standards a maintenance
- Implementuj governance testing a validation
- Zabezpeč governance security a compliance
- Zahrň governance analytics a monitoring
- Implementuj governance performance optimization
- Zabezpeč governance accessibility a compliance
- Zahrň governance backup a recovery
