# Prompt pre 029-will-generation-engine

Na základe high-level-plan.md a existujúcich špecifikácií (001-028) vytvor kompletnú sadu dokumentov pre špecifikáciu 029-will-generation-engine:

**Krok 1: Analýza a research**
- Analyzuj high-level-plan.md pre Phase 11 — Will Generation Engine (Incremental)
- Identifikuj kľúčové komponenty: will generation logic, legal templates, clause assembly, PDF generation
- Nájdi relevantné implementácie v Hollywood codebase (/Users/luborfedak/Documents/Github/hollywood) pre will system
- Identifikuj závislosti na 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration, 009-professional-network, 010-emergency-access, 011-mobile-app, 012-animations-microinteractions, 013-time-capsule-legacy, 014-pricing-conversion, 015-business-journeys, 016-integration-testing, 017-production-deployment, 018-monitoring-analytics, 019-nextjs-migration, 020-auth-rls-baseline, 021-database-types, 022-billing-stripe, 023-email-resend, 024-i18n-country-rules, 025-emotional-core-mvp, 026-vault-encrypted-storage, 027-family-shield-emergency, 028-time-capsules
- Zameraj sa na: legal compliance, jurisdiction rules, clause management, document generation

**Krok 2: Vytvorenie dokumentov**
Vytvor tieto súbory v `/specs/029-will-generation-engine/`:

1. **spec.md** - Hlavná špecifikácia s:
   - Názvom: "Will Generation Engine - Legal Document Creation and Management"
   - Goals: will generation logic, legal templates, clause assembly, PDF generation
   - Non-Goals: legal advice, court filing, real-time legal updates
   - Review & Acceptance: clause assembly tests, legal validation, PDF generation
   - Risks & Mitigations: legal compliance, jurisdiction changes, template updates
   - References: legal standards, jurisdiction requirements, document generation
   - Cross-links: 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration, 009-professional-network, 010-emergency-access, 011-mobile-app, 012-animations-microinteractions, 013-time-capsule-legacy, 014-pricing-conversion, 015-business-journeys, 016-integration-testing, 017-production-deployment, 018-monitoring-analytics, 019-nextjs-migration, 020-auth-rls-baseline, 021-database-types, 022-billing-stripe, 023-email-resend, 024-i18n-country-rules, 025-emotional-core-mvp, 026-vault-encrypted-storage, 027-family-shield-emergency, 028-time-capsules
   - Linked design docs: research.md, data-model.md, quickstart.md

2. **plan.md** - Detailný plán implementácie s:
   - Phase 1: Legal Foundation (Week 1) - legal templates, jurisdiction rules
   - Phase 2: Will Generation (Week 2) - will logic, clause assembly
   - Phase 3: Legal Validation (Week 3) - compliance checking, validation
   - Phase 4: PDF Generation (Week 4) - document export, formatting
   - Phase 5: Testing & Validation (Week 5) - will testing, legal validation
   - Acceptance signals: clause assembly tests, legal validation, PDF generation
   - Linked docs: research.md, data-model.md, quickstart.md

3. **tasks.md** - Kompletný zoznam úloh s:
   - T2900 Legal Foundation
   - T2901 Legal Templates
   - T2902 Jurisdiction Rules
   - T2903 Will Generation
   - T2904 Will Logic
   - T2905 Clause Assembly
   - T2906 Legal Validation
   - T2907 Compliance Checking
   - T2908 Validation System
   - T2909 PDF Generation
   - T2910 Document Export
   - T2911 Formatting System
   - T2912 Testing & Validation
   - T2913 Will Testing
   - T2914 Legal Validation
   - T2915 Will Engine Testing

4. **data-model.md** - Dátový model s:
   - WillEngine entity s engine fields
   - LegalTemplate pre legal templates
   - Clause pre will clauses
   - JurisdictionRule pre jurisdiction rules
   - WillDocument pre will documents
   - LegalValidation pre validation rules
   - Relations medzi entitami

5. **quickstart.md** - Testovacie scenáre s:
   - 1) Will Engine Setup - configure will engine
   - 2) Legal Template Testing - test legal templates
   - 3) Clause Assembly Testing - test clause assembly
   - 4) Legal Validation Testing - test legal validation
   - 5) PDF Generation Testing - test PDF generation
   - 6) Jurisdiction Testing - test jurisdiction rules
   - 7) Performance Testing - test will engine performance
   - 8) Security Testing - test will engine security
   - 9) Error Handling - test error handling
   - 10) End-to-End Test - complete will generation workflow

6. **research.md** - Výskumná analýza s:
   - Product scope: will generation and legal document system
   - Technical architecture: will engine, legal templates
   - User experience: will generation user experience
   - Performance: will engine performance optimization
   - Security: will engine security measures
   - Accessibility: will engine accessibility
   - Analytics: will engine analytics and insights
   - Future enhancements: advanced will generation features

7. **contracts/README.md** - API kontrakty s:
   - will-generation-api.yaml
   - legal-template-api.yaml
   - clause-assembly-api.yaml
   - legal-validation-api.yaml
   - pdf-generation-api.yaml

**Krok 3: Konzistentnosť**
- Použi rovnaký formát ako 005-sofia-ai-system
- Zachovaj konzistentné kódovanie úloh (T2900+)
- Udržuj konzistentný štýl a štruktúru
- Zabezpeč správne cross-links na 001, 002, 005, 006, 007, 008, 009, 010, 011, 012, 013, 014, 015, 016, 017, 018, 019, 020, 021, 022, 023, 024, 025, 026, 027, 028

**Krok 4: Kompletnosť**
- Pokry všetky aspekty z Phase 11 — Will Generation Engine (Incremental)
- Zahrň will system z Hollywood
- Identifikuj závislosti na legal templates a jurisdiction rules
- Zabezpeč pokrytie testovacích scenárov
- Zahrň clause assembly a PDF generation

**Krok 5: Validácia**
- Skontroluj linter chyby a oprav ich
- Over konzistentnosť s existujúcimi špecifikáciami
- Zabezpeč správne formátovanie a štruktúru
- Over kompletnosť informácií
- Skontroluj cross-links na súvisiace špecifikácie

**Špecifické požiadavky pre 029-will-generation-engine:**
- Zameraj sa na will generation logic a legal templates
- Implementuj clause assembly a legal validation
- Zabezpeč jurisdiction rules a compliance
- Zahrň PDF generation a document export
- Implementuj will testing a validation
- Zabezpeč will engine security a compliance
- Zahrň will engine analytics a monitoring
- Implementuj will engine performance optimization
- Zabezpeč will engine accessibility a compliance
- Zahrň will engine backup a recovery
