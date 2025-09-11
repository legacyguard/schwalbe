# Prompt pre 008-family-collaboration

Na základe high-level-plan.md a existujúcich špecifikácií (001-007) vytvor kompletnú sadu dokumentov v anglictine pre špecifikáciu 008-family-collaboration:

**Krok 1: Analýza a research**
- Analyzuj high-level-plan.md pre Phase 9 — Family Shield and Emergency Access
- Identifikuj kľúčové komponenty: guardian invitation, family member management, role assignments, access control
- Nájdi relevantné implementácie v Hollywood codebase (/Users/luborfedak/Documents/Github/hollywood) pre family system
- Identifikuj závislosti na 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system
- Zameraj sa na: family tree, guardian roles, emergency protocols, notification system, audit logging

**Krok 2: Vytvorenie / updatovanie dokumentov**
Vytvor alebo updatuj tieto súbory v `/specs/008-family-collaboration/`:

1. **spec.md** - Hlavná špecifikácia s:
   - Názvom: "Family Collaboration - Guardian Network and Emergency Access"
   - Goals: family member management, guardian invitation, role assignments, emergency protocols
   - Non-Goals: social media integration, real-time chat, video calls
   - Review & Acceptance: guardian verification, emergency simulation, audit logging
   - Risks & Mitigations: family conflicts, access abuse, notification fatigue
   - References: family law, emergency protocols, notification systems
   - Cross-links: 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system
   - Linked design docs: research.md, data-model.md, quickstart.md

2. **plan.md** - Detailný plán implementácie s:
   - Phase 1: Family Foundation (Week 1) - family member management, relationships
   - Phase 2: Guardian System (Week 2) - guardian invitation, verification, roles
   - Phase 3: Emergency Protocols (Week 3) - emergency access, activation triggers
   - Phase 4: Notification System (Week 4) - alerts, reminders, updates
   - Phase 5: Audit & Security (Week 5) - logging, access control, monitoring
   - Acceptance signals: guardian verification, emergency simulation, audit logging
   - Linked docs: research.md, data-model.md, quickstart.md

3. **tasks.md** - Kompletný zoznam úloh s:
   - T800 Family Foundation
   - T801 Family Member Management
   - T802 Relationship Mapping
   - T803 Guardian System
   - T804 Guardian Invitation
   - T805 Guardian Verification
   - T806 Role Assignments
   - T807 Emergency Protocols
   - T808 Emergency Access
   - T809 Activation Triggers
   - T810 Notification System
   - T811 Alert Management
   - T812 Reminder System
   - T813 Audit & Security
   - T814 Access Control
   - T815 Monitoring & Logging

4. **data-model.md** - Dátový model s:
   - FamilyMember entity s relationship fields
   - Guardian pre guardian roles
   - EmergencyProtocol pre emergency procedures
   - Notification pre alerts a reminders
   - AuditLog pre access tracking
   - RoleAssignment pre family roles
   - Relations medzi entitami

5. **quickstart.md** - Testovacie scenáre s:
   - 1) Family Setup - add family members
   - 2) Guardian Invitation - invite guardians
   - 3) Role Assignment - assign family roles
   - 4) Emergency Simulation - test emergency access
   - 5) Notification Testing - test alerts
   - 6) Access Control - test permissions
   - 7) Audit Logging - verify logging
   - 8) Conflict Resolution - handle family conflicts
   - 9) Performance Test - large families
   - 10) End-to-End Test - complete workflow

6. **research.md** - Výskumná analýza s:
   - Product scope: family collaboration system
   - Technical architecture: family management, guardian system
   - User experience: family-friendly interface
   - Performance: family size scalability
   - Security: family data protection
   - Accessibility: family accessibility needs
   - Analytics: family engagement tracking
   - Future enhancements: family communication tools

7. **contracts/README.md** - API kontrakty s:
   - family-management-api.yaml
   - guardian-system-api.yaml
   - emergency-protocol-api.yaml
   - notification-system-api.yaml
   - audit-logging-api.yaml

**Krok 3: Konzistentnosť**
- Použi rovnaký formát ako 005-sofia-ai-system
- Zachovaj konzistentné kódovanie úloh (T800+)
- Udržuj konzistentný štýl a štruktúru
- Zabezpeč správne cross-links na 001, 002, 005, 006, 007

**Krok 4: Kompletnosť**
- Pokry všetky aspekty z Phase 9 — Family Shield and Emergency Access
- Zahrň family system z Hollywood
- Identifikuj závislosti na guardian roles a emergency protocols
- Zabezpeč pokrytie testovacích scenárov
- Zahrň notification system a audit logging

**Krok 5: Validácia**
- Skontroluj linter chyby a oprav ich
- Over konzistentnosť s existujúcimi špecifikáciami
- Zabezpeč správne formátovanie a štruktúru
- Over kompletnosť informácií
- Skontroluj cross-links na súvisiace špecifikácie

**Špecifické požiadavky pre 008-family-collaboration:**
- Zameraj sa na family member management a relationships
- Implementuj guardian invitation a verification system
- Zabezpeč role assignments a access control
- Zahrň emergency protocols a activation triggers
- Implementuj notification system pre alerts
- Zabezpeč audit logging a monitoring
- Zahrň conflict resolution mechanisms
- Implementuj family-friendly UI/UX
- Zabezpeč accessibility pre family members
- Zahrň analytics pre family engagement
