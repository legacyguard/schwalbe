# Prompt pre 026-vault-encrypted-storage

Na základe high-level-plan.md a existujúcich špecifikácií (001-025) vytvor kompletnú sadu dokumentov pre špecifikáciu 026-vault-encrypted-storage:

**Krok 1: Analýza a research**
- Analyzuj high-level-plan.md pre Phase 8 — Vault (Encrypted Storage)
- Identifikuj kľúčové komponenty: client-side encryption, key management, encrypted storage, zero-knowledge
- Nájdi relevantné implementácie v Hollywood codebase (/Users/luborfedak/Documents/Github/hollywood) pre vault system
- Identifikuj závislosti na 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration, 009-professional-network, 010-emergency-access, 011-mobile-app, 012-animations-microinteractions, 013-time-capsule-legacy, 014-pricing-conversion, 015-business-journeys, 016-integration-testing, 017-production-deployment, 018-monitoring-analytics, 019-nextjs-migration, 020-auth-rls-baseline, 021-database-types, 022-billing-stripe, 023-email-resend, 024-i18n-country-rules, 025-emotional-core-mvp
- Zameraj sa na: encryption algorithms, key derivation, secure storage, data protection

**Krok 2: Vytvorenie dokumentov**
Vytvor tieto súbory v `/specs/026-vault-encrypted-storage/`:

1. **spec.md** - Hlavná špecifikácia s:
   - Názvom: "Vault Encrypted Storage - Client-side Encryption and Secure Storage"
   - Goals: client-side encryption, key management, encrypted storage, zero-knowledge
   - Non-Goals: server-side encryption, complex key management, hardware security
   - Review & Acceptance: encryption validation, secure storage, zero-knowledge compliance
   - Risks & Mitigations: key loss, encryption vulnerabilities, storage breaches
   - References: encryption standards, secure storage best practices, zero-knowledge principles
   - Cross-links: 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration, 009-professional-network, 010-emergency-access, 011-mobile-app, 012-animations-microinteractions, 013-time-capsule-legacy, 014-pricing-conversion, 015-business-journeys, 016-integration-testing, 017-production-deployment, 018-monitoring-analytics, 019-nextjs-migration, 020-auth-rls-baseline, 021-database-types, 022-billing-stripe, 023-email-resend, 024-i18n-country-rules, 025-emotional-core-mvp
   - Linked design docs: research.md, data-model.md, quickstart.md

2. **plan.md** - Detailný plán implementácie s:
   - Phase 1: Encryption Foundation (Week 1) - encryption algorithms, key management
   - Phase 2: Storage System (Week 2) - encrypted storage, data protection
   - Phase 3: Zero-knowledge (Week 3) - zero-knowledge implementation, privacy
   - Phase 4: Security Hardening (Week 4) - security measures, vulnerability scanning
   - Phase 5: Testing & Validation (Week 5) - encryption testing, security validation
   - Acceptance signals: encryption validation, secure storage, zero-knowledge compliance
   - Linked docs: research.md, data-model.md, quickstart.md

3. **tasks.md** - Kompletný zoznam úloh s:
   - T2600 Encryption Foundation
   - T2601 Encryption Algorithms
   - T2602 Key Management
   - T2603 Storage System
   - T2604 Encrypted Storage
   - T2605 Data Protection
   - T2606 Zero-knowledge
   - T2607 Zero-knowledge Implementation
   - T2608 Privacy Protection
   - T2609 Security Hardening
   - T2610 Security Measures
   - T2611 Vulnerability Scanning
   - T2612 Testing & Validation
   - T2613 Encryption Testing
   - T2614 Security Validation
   - T2615 Vault Testing

4. **data-model.md** - Dátový model s:
   - VaultConfig entity s configuration fields
   - EncryptionKey pre key management
   - EncryptedData pre encrypted storage
   - ZeroKnowledgeProof pre zero-knowledge
   - SecurityScan pre security validation
   - VaultLog pre vault tracking
   - Relations medzi entitami

5. **quickstart.md** - Testovacie scenáre s:
   - 1) Vault Setup - configure vault system
   - 2) Encryption Testing - test encryption algorithms
   - 3) Storage Testing - test encrypted storage
   - 4) Zero-knowledge Testing - test zero-knowledge
   - 5) Security Testing - test security measures
   - 6) Key Management Testing - test key management
   - 7) Data Protection Testing - test data protection
   - 8) Performance Testing - test vault performance
   - 9) Vulnerability Testing - test vulnerability scanning
   - 10) End-to-End Test - complete vault workflow

6. **research.md** - Výskumná analýza s:
   - Product scope: encrypted storage and security system
   - Technical architecture: encryption framework, secure storage
   - User experience: vault user experience
   - Performance: vault performance optimization
   - Security: vault security measures
   - Accessibility: vault accessibility
   - Analytics: vault analytics and insights
   - Future enhancements: advanced security features

7. **contracts/README.md** - API kontrakty s:
   - vault-encryption-api.yaml
   - secure-storage-api.yaml
   - zero-knowledge-api.yaml
   - security-hardening-api.yaml
   - vault-testing-api.yaml

**Krok 3: Konzistentnosť**
- Použi rovnaký formát ako 005-sofia-ai-system
- Zachovaj konzistentné kódovanie úloh (T2600+)
- Udržuj konzistentný štýl a štruktúru
- Zabezpeč správne cross-links na 001, 002, 005, 006, 007, 008, 009, 010, 011, 012, 013, 014, 015, 016, 017, 018, 019, 020, 021, 022, 023, 024, 025

**Krok 4: Kompletnosť**
- Pokry všetky aspekty z Phase 8 — Vault (Encrypted Storage)
- Zahrň vault system z Hollywood
- Identifikuj závislosti na encryption algorithms a secure storage
- Zabezpeč pokrytie testovacích scenárov
- Zahrň zero-knowledge implementation a privacy protection

**Krok 5: Validácia**
- Skontroluj linter chyby a oprav ich
- Over konzistentnosť s existujúcimi špecifikáciami
- Zabezpeč správne formátovanie a štruktúru
- Over kompletnosť informácií
- Skontroluj cross-links na súvisiace špecifikácie

**Špecifické požiadavky pre 026-vault-encrypted-storage:**
- Zameraj sa na client-side encryption a key management
- Implementuj encrypted storage a data protection
- Zabezpeč zero-knowledge implementation a privacy
- Zahrň security hardening a vulnerability scanning
- Implementuj encryption testing a validation
- Zabezpeč vault security a compliance
- Zahrň vault analytics a monitoring
- Implementuj vault performance optimization
- Zabezpeč vault accessibility a compliance
- Zahrň vault backup a recovery
