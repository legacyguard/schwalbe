# Quick Reference Prompts for Spec Generation

## Pre každú špecifikáciu použij tento prompt:

```
Na základe high-level-plan.md a existujúcich špecifikácií (001-005) vytvor kompletnú sadu dokumentov pre špecifikáciu XXX-YYYYY:

**Krok 1: Analýza a research**
- Analyzuj high-level-plan.md pre fázu XXX-YYYYY
- Identifikuj kľúčové komponenty a funkcie
- Nájdi relevantné implementácie v Hollywood codebase (/Users/luborfedak/Documents/Github/hollywood)
- Identifikuj závislosti a cross-links s inými špecifikáciami

**Krok 2: Vytvorenie dokumentov**
Vytvor tieto súbory v `/specs/XXX-YYYYY/`:

1. **spec.md** - Hlavná špecifikácia s:
   - Názvom a krátkym popisom
   - Goals (ciele implementácie)
   - Non-Goals (mimo rozsah)
   - Review & Acceptance (kritériá prijatia)
   - Risks & Mitigations (riziká a mitigačné opatrenia)
   - References (odkazy na dokumentáciu)
   - Cross-links (odkazy na súvisiace špecifikácie)
   - Linked design docs (odkazy na research, data-model, quickstart)

2. **plan.md** - Detailný plán implementácie s:
   - Fázami implementácie (Week 1-5)
   - Konkrétnymi komponentmi pre každú fázu
   - Acceptance signals (signály prijatia)
   - Linked docs (odkazy na súvisiace dokumenty)

3. **tasks.md** - Kompletný zoznam úloh s:
   - TXXX kódovaním úloh
   - Detailnými taskami pre každý komponent
   - Ordering & rules (pravidlá poradia)
   - Outputs (výstupy po dokončení)

4. **data-model.md** - Dátový model s:
   - Entitami a ich vlastnosťami
   - Vzťahmi medzi entitami
   - Typmi a validáciami
   - Reláciami (1—N, N—N, atď.)

5. **quickstart.md** - Testovacie scenáre s:
   - 8-10 konkrétnymi scenármi
   - Validation points pre každý scenár
   - End-to-end testovacími prípadmi
   - User acceptance testing scenármi

6. **research.md** - Výskumná analýza s:
   - Product scope a capabilities
   - Technical architecture
   - User experience research
   - Performance considerations
   - Accessibility & inclusion
   - Analytics & monitoring
   - Future enhancements
   - Open questions

7. **contracts/README.md** - API kontrakty s:
   - Zoznamom contract súborov
   - Contract standards
   - Usage guidelines
   - Validation requirements

**Krok 3: Konzistentnosť**
- Použi rovnaký formát ako existujúce špecifikácie (001-005)
- Zachovaj konzistentné kódovanie úloh (TXXX)
- Udržuj konzistentný štýl a štruktúru
- Zabezpeč správne cross-links medzi špecifikáciami

**Krok 4: Kompletnosť**
- Pokry všetky aspekty z high-level-plan.md
- Zahrň všetky relevantné komponenty z Hollywood
- Identifikuj všetky závislosti a integračné body
- Zabezpeč pokrytie testovacích scenárov

**Krok 5: Validácia**
- Skontroluj linter chyby a oprav ich
- Over konzistentnosť s existujúcimi špecifikáciami
- Zabezpeč správne formátovanie a štruktúru
- Over kompletnosť informácií
```

## Konkrétne príklady pre jednotlivé špecifikácie:

### 006-document-vault
```
Na základe high-level-plan.md Phase 8 — Vault (Encrypted Storage) vytvor kompletnú sadu dokumentov pre špecifikáciu 006-document-vault:

**Zameraj sa na:**
- Client-side encryption flow a key management
- Document upload/download/delete s RLS
- Supabase Storage integration
- Zero-knowledge encryption
- Error handling a recovery flows
- Performance optimization
- Security hardening
- User experience flows

**Kľúčové komponenty:**
- Encryption service
- Key management system
- Document storage service
- RLS policies
- Error handling
- Recovery mechanisms
```

### 007-will-creation-system
```
Na základe high-level-plan.md Phase 11 — Will Generation Engine vytvor kompletnú sadu dokumentov pre špecifikáciu 007-will-creation-system:

**Zameraj sa na:**
- Will generation logic v packages/logic
- UI wizard powered by domain logic
- i18n clauses a legal requirements
- Country rules compliance
- Legal validation
- Clause assembly
- PDF generation
- User workflows

**Kľúčové komponenty:**
- Will generation engine
- Legal template system
- Clause assembly logic
- Validation system
- PDF generation
- i18n integration
```

### 008-family-collaboration
```
Na základe high-level-plan.md Phase 9 — Family Shield and Emergency Access vytvor kompletnú sadu dokumentov pre špecifikáciu 008-family-collaboration:

**Zameraj sa na:**
- Guardian invitation system
- Emergency access protocols
- Family member management
- Role assignments
- Access control
- Notification system
- Audit logging
- Security policies

**Kľúčové komponenty:**
- Guardian management
- Emergency access system
- Family member roles
- Access policies
- Notification service
- Audit system
```

### 009-professional-network
```
Na základe high-level-plan.md Phase 12 — Sharing, Reminders, Analytics vytvor kompletnú sadu dokumentov pre špecifikáciu 009-professional-network:

**Zameraj sa na:**
- Professional verification system
- Review request system
- Consultation booking
- Commission tracking
- Professional profiles
- Specialization management
- Quality assurance
- Payment integration

**Kľúčové komponenty:**
- Professional profiles
- Review system
- Booking system
- Commission tracking
- Verification system
- Payment integration
```

### 010-emergency-access
```
Na základe high-level-plan.md Phase 9 — Family Shield and Emergency Access vytvor kompletnú sadu dokumentov pre špecifikáciu 010-emergency-access:

**Zameraj sa na:**
- Emergency activation protocols
- Inactivity detection
- Staged access control
- Document release system
- Guardian verification
- Audit logging
- Security policies
- Recovery procedures

**Kľúčové komponenty:**
- Emergency activation
- Inactivity monitoring
- Access staging
- Document release
- Guardian verification
- Audit system
```

## Checklist pre každú špecifikáciu:

### Pred vytvorením:
- [ ] Prečítaj high-level-plan.md pre danú fázu
- [ ] Identifikuj relevantné komponenty z Hollywood
- [ ] Identifikuj závislosti na iné špecifikácie
- [ ] Naplánuj fázovanie implementácie

### Po vytvorení:
- [ ] Skontroluj linter chyby
- [ ] Over konzistentnosť s existujúcimi špecifikáciami
- [ ] Skontroluj cross-links
- [ ] Over kompletnosť informácií
- [ ] Skontroluj formátovanie a štruktúru

### Validácia:
- [ ] Všetky súbory sú vytvorené
- [ ] Všetky sekcie sú vyplnené
- [ ] Cross-links sú správne
- [ ] Task kódovanie je konzistentné
- [ ] Linter chyby sú opravené

## Tipy pre lepší proces:

1. **Začni s analýzou**: Vždy najprv analyzuj high-level-plan.md a Hollywood codebase
2. **Identifikuj závislosti**: Zabezpeč, aby si identifikoval všetky závislosti
3. **Použi konzistentný formát**: Vždy používaj rovnaký formát ako existujúce špecifikácie
4. **Skontroluj kvalitu**: Vždy skontroluj linter chyby a oprav ich
5. **Over kompletnosť**: Zabezpeč, aby každá špecifikácia pokrývala všetky aspekty
6. **Udržuj cross-links**: Vždy aktualizuj cross-links v existujúcich špecifikáciách
7. **Testuj scenáre**: Zabezpeč pokrytie testovacích scenárov
8. **Dokumentuj všetko**: Udržuj dokumentáciu aktuálnu a kompletnú
