# Prompt pre 021-database-types

Na základe high-level-plan.md a existujúcich špecifikácií (001-020) vytvor kompletnú sadu dokumentov pre špecifikáciu 021-database-types:

**Krok 1: Analýza a research**
- Analyzuj high-level-plan.md pre Phase 3 — Database and Types
- Identifikuj kľúčové komponenty: database migrations, type generation, schema management, data validation
- Nájdi relevantné implementácie v Hollywood codebase (/Users/luborfedak/Documents/Github/hollywood) pre database system
- Identifikuj závislosti na 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration, 009-professional-network, 010-emergency-access, 011-mobile-app, 012-animations-microinteractions, 013-time-capsule-legacy, 014-pricing-conversion, 015-business-journeys, 016-integration-testing, 017-production-deployment, 018-monitoring-analytics, 019-nextjs-migration, 020-auth-rls-baseline
- Zameraj sa na: Supabase migrations, TypeScript types, schema validation, data integrity

**Krok 2: Vytvorenie dokumentov**
Vytvor tieto súbory v `/specs/021-database-types/`:

1. **spec.md** - Hlavná špecifikácia s:
   - Názvom: "Database Types - Schema Management and Type Generation"
   - Goals: database migrations, type generation, schema management, data validation
   - Non-Goals: complex ORM, custom database, real-time sync
   - Review & Acceptance: migration success, type accuracy, schema validation
   - Risks & Mitigations: migration failures, type mismatches, data corruption
   - References: Supabase docs, TypeScript types, migration best practices
   - Cross-links: 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration, 009-professional-network, 010-emergency-access, 011-mobile-app, 012-animations-microinteractions, 013-time-capsule-legacy, 014-pricing-conversion, 015-business-journeys, 016-integration-testing, 017-production-deployment, 018-monitoring-analytics, 019-nextjs-migration, 020-auth-rls-baseline
   - Linked design docs: research.md, data-model.md, quickstart.md

2. **plan.md** - Detailný plán implementácie s:
   - Phase 1: Migration Setup (Week 1) - migration system, schema management
   - Phase 2: Type Generation (Week 2) - TypeScript types, type validation
   - Phase 3: Schema Validation (Week 3) - schema validation, data integrity
   - Phase 4: Data Migration (Week 4) - data migration, data transformation
   - Phase 5: Testing & Validation (Week 5) - migration testing, type validation
   - Acceptance signals: migration success, type accuracy, schema validation
   - Linked docs: research.md, data-model.md, quickstart.md

3. **tasks.md** - Kompletný zoznam úloh s:
   - T2100 Migration Setup
   - T2101 Migration System
   - T2102 Schema Management
   - T2103 Type Generation
   - T2104 TypeScript Types
   - T2105 Type Validation
   - T2106 Schema Validation
   - T2107 Schema Validation
   - T2108 Data Integrity
   - T2109 Data Migration
   - T2110 Data Migration
   - T2111 Data Transformation
   - T2112 Testing & Validation
   - T2113 Migration Testing
   - T2114 Type Validation
   - T2115 Database Testing

4. **data-model.md** - Dátový model s:
   - DatabaseSchema entity s schema fields
   - MigrationFile pre migration files
   - TypeDefinition pre type definitions
   - SchemaValidation pre validation rules
   - DataIntegrity pre integrity checks
   - MigrationLog pre migration tracking
   - Relations medzi entitami

5. **quickstart.md** - Testovacie scenáre s:
   - 1) Migration Setup - configure migration system
   - 2) Type Generation - test type generation
   - 3) Schema Validation - test schema validation
   - 4) Data Migration - test data migration
   - 5) Type Validation - test type validation
   - 6) Data Integrity - test data integrity
   - 7) Migration Testing - test migration process
   - 8) Rollback Testing - test rollback procedures
   - 9) Performance Testing - test migration performance
   - 10) End-to-End Test - complete database workflow

6. **research.md** - Výskumná analýza s:
   - Product scope: database management system
   - Technical architecture: Supabase migrations, TypeScript types
   - User experience: database user experience
   - Performance: database performance optimization
   - Security: database security measures
   - Accessibility: database accessibility
   - Analytics: database analytics and insights
   - Future enhancements: advanced database features

7. **contracts/README.md** - API kontrakty s:
   - database-migration-api.yaml
   - type-generation-api.yaml
   - schema-validation-api.yaml
   - data-migration-api.yaml
   - database-testing-api.yaml

**Krok 3: Konzistentnosť**
- Použi rovnaký formát ako 005-sofia-ai-system
- Zachovaj konzistentné kódovanie úloh (T2100+)
- Udržuj konzistentný štýl a štruktúru
- Zabezpeč správne cross-links na 001, 002, 005, 006, 007, 008, 009, 010, 011, 012, 013, 014, 015, 016, 017, 018, 019, 020

**Krok 4: Kompletnosť**
- Pokry všetky aspekty z Phase 3 — Database and Types
- Zahrň database system z Hollywood
- Identifikuj závislosti na Supabase migrations a TypeScript types
- Zabezpeč pokrytie testovacích scenárov
- Zahrň schema validation a data integrity

**Krok 5: Validácia**
- Skontroluj linter chyby a oprav ich
- Over konzistentnosť s existujúcimi špecifikáciami
- Zabezpeč správne formátovanie a štruktúru
- Over kompletnosť informácií
- Skontroluj cross-links na súvisiace špecifikácie

**Špecifické požiadavky pre 021-database-types:**
- Zameraj sa na Supabase migrations a schema management
- Implementuj TypeScript type generation a validation
- Zabezpeč schema validation a data integrity
- Zahrň data migration a transformation
- Implementuj migration testing a validation
- Zabezpeč rollback procedures a disaster recovery
- Zahrň database performance optimization
- Implementuj database security measures
- Zabezpeč database analytics a monitoring
- Zahrň database accessibility a compliance
