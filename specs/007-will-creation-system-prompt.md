# Prompt pre 007-will-creation-system

Na základe high-level-plan.md a existujúcich špecifikácií (001-006) vytvor kompletnú sadu dokumentov pre špecifikáciu 007-will-creation-system:

**Krok 1: Analýza a research**
- Analyzuj high-level-plan.md pre Phase 11 — Will Generation Engine (Incremental)
- Identifikuj kľúčové komponenty: will generation logic v packages/logic, UI wizard, i18n clauses, legal validation
- Nájdi relevantné implementácie v Hollywood codebase (/Users/luborfedak/Documents/Github/hollywood) pre will system
- Identifikuj závislosti na 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault
- Zameraj sa na: legal templates, jurisdiction compliance, clause assembly, PDF generation, validation

**Krok 2: Vytvorenie / updatovanie dokumentov**
Vytvor alebo updatuj tieto súbory v `/specs/007-will-creation-system/`:

1. **spec.md** - Hlavná špecifikácia s:
   - Názvom: "Will Creation System - Legal Document Generation"
   - Goals: will generation engine, legal validation, jurisdiction compliance, PDF export
   - Non-Goals: legal advice, court filing, real-time legal updates
   - Review & Acceptance: clause assembly tests, i18n coverage, legal validation
   - Risks & Mitigations: legal compliance, jurisdiction changes, template updates
   - References: legal standards, jurisdiction requirements, PDF generation
   - Cross-links: 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault
   - Linked design docs: research.md, data-model.md, quickstart.md

2. **plan.md** - Detailný plán implementácie s:
   - Phase 1: Legal Foundation (Week 1) - legal templates, jurisdiction rules
   - Phase 2: Will Generation Engine (Week 2) - core logic, clause assembly
   - Phase 3: UI Wizard (Week 3) - step-by-step interface, validation
   - Phase 4: i18n Integration (Week 4) - multi-language support, localization
   - Phase 5: PDF Generation (Week 5) - document export, formatting
   - Acceptance signals: clause assembly tests, i18n coverage, legal validation
   - Linked docs: research.md, data-model.md, quickstart.md

3. **tasks.md** - Kompletný zoznam úloh s:
   - T700 Legal Foundation
   - T701 Legal Templates
   - T702 Jurisdiction Rules
   - T703 Will Generation Engine
   - T704 Clause Assembly
   - T705 Legal Validation
   - T706 UI Wizard
   - T707 Step-by-Step Interface
   - T708 Form Validation
   - T709 i18n Integration
   - T710 Multi-language Support
   - T711 PDF Generation
   - T712 Document Export
   - T713 Testing & Validation
   - T714 Documentation
   - T715 Production Readiness

4. **data-model.md** - Dátový model s:
   - Will entity s legal fields
   - LegalTemplate pre jurisdiction templates
   - Clause pre will clauses
   - Bequest pre asset distribution
   - Executor pre will execution
   - LegalValidation pre compliance
   - Relations medzi entitami

5. **quickstart.md** - Testovacie scenáre s:
   - 1) Basic Will Creation - simple will generation
   - 2) Complex Will Creation - multiple beneficiaries
   - 3) Legal Validation - compliance checking
   - 4) i18n Testing - multi-language support
   - 5) PDF Export - document generation
   - 6) Template Updates - legal template changes
   - 7) Error Handling - validation errors
   - 8) Performance Test - large wills
   - 9) Security Test - data protection
   - 10) End-to-End Test - complete workflow

6. **research.md** - Výskumná analýza s:
   - Product scope: legal will generation
   - Technical architecture: will engine, legal templates
   - User experience: guided will creation
   - Performance: generation speed, validation
   - Security: legal data protection
   - Accessibility: legal document accessibility
   - Analytics: usage tracking, completion rates
   - Future enhancements: AI legal assistance

7. **contracts/README.md** - API kontrakty s:
   - will-generation-api.yaml
   - legal-validation-api.yaml
   - template-management-api.yaml
   - pdf-generation-api.yaml
   - i18n-legal-api.yaml

**Krok 3: Konzistentnosť**
- Použi rovnaký formát ako 005-sofia-ai-system
- Zachovaj konzistentné kódovanie úloh (T700+)
- Udržuj konzistentný štýl a štruktúru
- Zabezpeč správne cross-links na 001, 002, 005, 006

**Krok 4: Kompletnosť**
- Pokry všetky aspekty z Phase 11 — Will Generation Engine
- Zahrň will system z Hollywood
- Identifikuj závislosti na legal templates a jurisdiction rules
- Zabezpeč pokrytie testovacích scenárov
- Zahrň i18n a legal compliance

**Krok 5: Validácia**
- Skontroluj linter chyby a oprav ich
- Over konzistentnosť s existujúcimi špecifikáciami
- Zabezpeč správne formátovanie a štruktúru
- Over kompletnosť informácií
- Skontroluj cross-links na súvisiace špecifikácie

**Kontrola specifickych požiadavok pre 007-will-creation-system:**
- Zameraj sa na legal compliance a jurisdiction rules
- Implementuj will generation engine v packages/logic
- Zabezpeč i18n support pre legal documents
- Zahrň clause assembly a legal validation
- Implementuj PDF generation a export
- Zabezpeč UI wizard pre guided creation
- Zahrň template management a updates
- Implementuj error handling a validation
- Zabezpeč accessibility pre legal documents
- Zahrň analytics a monitoring
