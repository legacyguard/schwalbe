# Prompt pre 006-document-vault

Na základe high-level-plan.md a existujúcich špecifikácií (001-005) vytvor v anglictine kompletnú sadu dokumentov pre špecifikáciu 006-document-vault:

**Krok 1: Analýza a research**
- Analyzuj high-level-plan.md pre Phase 8 — Vault (Encrypted Storage)
- Identifikuj kľúčové komponenty: client-side encryption, key management service, encrypted blobs v Supabase Storage
- Nájdi relevantné implementácie v Hollywood codebase (/Users/luborfedak/Documents/Github/hollywood) pre document system
- Identifikuj závislosti na 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system
- Zameraj sa na: zero-knowledge encryption, RLS policies, document versioning, metadata extraction

**Krok 2: Vytvorenie / updatovanie dokumentov**
Vytvor alebo updatuj (ak už existujů) tieto súbory v `/specs/006-document-vault/`:

1. **spec.md** - Hlavná špecifikácia s:
   - Názvom: "Document Vault - Encrypted Storage System"
   - Goals: client-side encryption, zero-knowledge storage, document management, RLS security
   - Non-Goals: server-side encryption, third-party storage providers
   - Review & Acceptance: encryption validation, restore scenario, error handling
   - Risks & Mitigations: key loss, encryption performance, storage costs
   - References: Supabase Storage docs, encryption standards, RLS policies
   - Cross-links: 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system
   - Linked design docs: research.md, data-model.md, quickstart.md

2. **plan.md** - Detailný plán implementácie s:
   - Phase 1: Encryption Foundation (Week 1) - key management, encryption service
   - Phase 2: Storage Integration (Week 2) - Supabase Storage, RLS policies
   - Phase 3: Document Management (Week 3) - upload/download/delete, versioning
   - Phase 4: Metadata & Search (Week 4) - OCR, categorization, search
   - Phase 5: Error Handling & Recovery (Week 5) - backup, restore, validation
   - Acceptance signals: restore scenario validated, error handling present
   - Linked docs: research.md, data-model.md, quickstart.md

3. **tasks.md** - Kompletný zoznam úloh s:
   - T600 Encryption Foundation
   - T601 Key Management System
   - T602 Encryption Service
   - T603 Storage Integration
   - T604 RLS Policies
   - T605 Document Management
   - T606 Versioning System
   - T607 Metadata Extraction
   - T608 Search & Categorization
   - T609 Error Handling
   - T610 Recovery System
   - T611 Performance Optimization
   - T612 Security Hardening
   - T613 Testing & Validation
   - T614 Documentation
   - T615 Production Readiness

4. **data-model.md** - Dátový model s:
   - Document entity s encryption fields
   - DocumentVersion pre versioning
   - DocumentMetadata pre OCR a categorization
   - EncryptionKey pre key management
   - DocumentBundle pre grouping
   - Category pre organization
   - Relations medzi entitami

5. **quickstart.md** - Testovacie scenáre s:
   - 1) First Document Upload - encryption flow
   - 2) Document Download - decryption flow
   - 3) Document Versioning - version management
   - 4) Metadata Extraction - OCR processing
   - 5) Document Search - search functionality
   - 6) Document Sharing - secure sharing
   - 7) Error Recovery - backup/restore
   - 8) Performance Test - large files
   - 9) Security Test - RLS validation
   - 10) End-to-End Test - complete workflow

6. **research.md** - Výskumná analýza s:
   - Product scope: encrypted document storage
   - Technical architecture: client-side encryption, Supabase Storage
   - User experience: secure document management
   - Performance: encryption overhead, storage optimization
   - Security: zero-knowledge, RLS policies
   - Accessibility: screen reader support, keyboard navigation
   - Analytics: usage tracking, performance metrics
   - Future enhancements: advanced search, AI categorization

7. **contracts/README.md** - API kontrakty s:
   - document-storage-api.yaml
   - encryption-service-api.yaml
   - metadata-extraction-api.yaml
   - search-api.yaml
   - error-handling-api.yaml

**Krok 3: Konzistentnosť**
- Použi rovnaký formát ako 005-sofia-ai-system
- Zachovaj konzistentné kódovanie úloh (T600+)
- Udržuj konzistentný štýl a štruktúru
- Zabezpeč správne cross-links na 001, 002, 005

**Krok 4: Kompletnosť**
- Pokry všetky aspekty z Phase 8 — Vault (Encrypted Storage)
- Zahrň document system z Hollywood
- Identifikuj závislosti na encryption a storage
- Zabezpeč pokrytie testovacích scenárov
- Zahrň OCR a AI analysis support

**Krok 5: Validácia**
- Skontroluj linter chyby a oprav ich
- Over konzistentnosť s existujúcimi špecifikáciami
- Zabezpeč správne formátovanie a štruktúru
- Over kompletnosť informácií
- Skontroluj cross-links na súvisiace špecifikácie

***Kontrola specifickych požiadavok pre 006-document-vault:**
- Zameraj sa na zero-knowledge encryption
- Implementuj client-side key derivation
- Zabezpeč RLS policies pre security
- Zahrň document versioning a metadata
- Implementuj error handling a recovery
- Zabezpeč performance optimization
- Zahrň OCR a AI analysis capabilities
- Implementuj search a categorization
- Zabezpeč accessibility compliance
- Zahrň analytics a monitoring
