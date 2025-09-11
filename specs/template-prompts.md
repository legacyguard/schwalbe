# Template Prompts for Spec Generation

## Master Template Prompt

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

## Specifické Template Prompty pre jednotlivé typy špecifikácií

### Pre Core Infrastructure (006-018)
```
Analyzuj a vytvor špecifikáciu pre XXX-YYYYY (napr. 006-document-vault, 007-will-creation-system):

**Zameraj sa na:**
- Database migrations a schema
- API endpoints a services
- Security a encryption
- Performance a scalability
- Integration s existujúcimi systémami
- User experience flows
- Error handling a recovery
- Testing a validation
```

### Pre Business Features (019-025)
```
Analyzuj a vytvor špecifikáciu pre XXX-YYYYY (napr. 019-nextjs-migration, 020-auth-rls-baseline):

**Zameraj sa na:**
- Business logic a workflows
- User journeys a experiences
- Integration s external services
- Data flow a state management
- UI/UX components
- Accessibility a usability
- Analytics a monitoring
- Performance optimization
```

### Pre Advanced Features (026-032)
```
Analyzuj a vytvor špecifikáciu pre XXX-YYYYY (napr. 026-vault-encrypted-storage, 027-family-shield-emergency):

**Zameraj sa na:**
- Advanced functionality
- Complex integrations
- Security hardening
- Performance optimization
- Monitoring a observability
- Production readiness
- Scalability considerations
- Maintenance a operations
```

## Checklist pre každú špecifikáciu

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
```

## Príklad použitia

Pre špecifikáciu 006-document-vault by si použil:

```
Na základe high-level-plan.md a existujúcich špecifikácií (001-005) vytvor kompletnú sadu dokumentov pre špecifikáciu 006-document-vault:

**Krok 1: Analýza a research**
- Analyzuj high-level-plan.md pre Phase 8 — Vault (Encrypted Storage)
- Identifikuj kľúčové komponenty: client-side encryption, key management, document upload/download
- Nájdi relevantné implementácie v Hollywood codebase pre document system
- Identifikuj závislosti na 001-reboot-foundation, 002-hollywood-migration

**Krok 2: Vytvorenie dokumentov**
Vytvor tieto súbory v `/specs/006-document-vault/`:
1. spec.md
2. plan.md  
3. tasks.md
4. data-model.md
5. quickstart.md
6. research.md
7. contracts/README.md

**Krok 3: Konzistentnosť**
- Použi rovnaký formát ako 005-sofia-ai-system
- Zachovaj konzistentné kódovanie úloh (T600+)
- Udržuj konzistentný štýl a štruktúru
- Zabezpeč správne cross-links na 001, 002, 005

**Krok 4: Kompletnosť**
- Pokry všetky aspekty z Phase 8
- Zahrň document system z Hollywood
- Identifikuj závislosti na encryption a storage
- Zabezpeč pokrytie testovacích scenárov

**Krok 5: Validácia**
- Skontroluj linter chyby a oprav ich
- Over konzistentnosť s existujúcimi špecifikáciami
- Zabezpeč správne formátovanie a štruktúru
- Over kompletnosť informácií
```

## Doporučenia pre lepší proces

1. **Postupnosť**: Vytváraj špecifikácie v logickom poradí (006, 007, 008...)
2. **Cross-references**: Vždy aktualizuj cross-links v existujúcich špecifikáciách
3. **Konzistentnosť**: Používaj rovnaké formátovanie a štruktúru
4. **Kompletnosť**: Zabezpeč, aby každá špecifikácia pokrývala všetky aspekty
5. **Validácia**: Vždy skontroluj linter chyby a oprav ich
6. **Dokumentácia**: Udržuj README súbory aktuálne
7. **Testing**: Zabezpeč pokrytie testovacích scenárov
8. **Maintenance**: Pravidelne aktualizuj špecifikácie podľa zmien
