# Spec Generation Workflow

## Prehľad procesu

Tento dokument popisuje systematický proces vytvárania špecifikácií pre všetky fázy LegacyGuard implementácie (006-032).

## Krok 1: Príprava

### 1.1 Analýza high-level-plan.md
- Identifikuj fázu a jej ciele
- Zistí kľúčové komponenty a funkcie
- Identifikuj závislosti na predchádzajúce fázy
- Zistí integračné body s existujúcimi systémami

### 1.2 Research v Hollywood codebase
- Nájdi relevantné implementácie
- Identifikuj komponenty na migráciu
- Zistí patterns a best practices
- Identifikuj potenciálne problémy

### 1.3 Cross-reference analýza
- Identifikuj závislosti na iné špecifikácie
- Zistí potrebné cross-links
- Identifikuj potenciálne konflikty
- Naplánuj integračné body

## Krok 2: Vytvorenie dokumentov

### 2.1 spec.md
```markdown
# XXX-YYYYY - Názov špecifikácie

- Krátky popis a účel
- Kontext a súvislosti

## Goals
- Hlavné ciele implementácie
- Konkrétne výsledky
- Kvalitatívne a kvantitatívne metriky

## Non-Goals (out of scope)
- Čo nie je súčasťou tejto fázy
- Funkcie na neskoršie fázy
- Technické obmedzenia

## Review & Acceptance
- [ ] Kritériá prijatia
- [ ] Kvalitatívne metriky
- [ ] Kvantitatívne metriky
- [ ] Performance požiadavky

## Risks & Mitigations
- Identifikované riziká
- Mitigačné opatrenia
- Contingency plány

## References
- Externé dokumenty
- Technická dokumentácia
- Best practices

## Cross-links
- Súvisiace špecifikácie
- Závislosti
- Integračné body

## Linked design docs
- research.md
- data-model.md
- quickstart.md
```

### 2.2 plan.md
```markdown
# Plan: XXX-YYYYY Implementation

## Phase 1: Foundation (Week 1)
### 1.1 Core Components
- Základné komponenty
- Database setup
- API foundations

### 1.2 Integration Setup
- External service integration
- Authentication setup
- Security baseline

## Phase 2: Core Features (Week 2)
### 2.1 Main Functionality
- Hlavné funkcie
- Business logic
- User workflows

### 2.2 UI/UX Implementation
- User interface
- User experience
- Accessibility

## Phase 3: Advanced Features (Week 3)
### 3.1 Enhanced Functionality
- Pokročilé funkcie
- Performance optimization
- Advanced integrations

### 3.2 Testing & Validation
- Unit testing
- Integration testing
- User acceptance testing

## Phase 4: Polish & Integration (Week 4)
### 4.1 Final Integration
- Cross-system integration
- Performance tuning
- Security hardening

### 4.2 Documentation & Handoff
- Documentation completion
- Knowledge transfer
- Production readiness

## Phase 5: Production Readiness (Week 5)
### 5.1 Production Setup
- Production environment
- Monitoring setup
- Alerting configuration

### 5.2 Launch Preparation
- Launch checklist
- Rollback procedures
- Success metrics

## Acceptance Signals
- Konkrétne signály prijatia
- Performance metriky
- Quality gates

## Linked docs
- research.md
- data-model.md
- quickstart.md
```

### 2.3 tasks.md
```markdown
# Tasks: XXX-YYYYY

## Ordering & rules
- Pravidlá poradia úloh
- Dependencies
- Quality gates

## T100 Foundation Tasks
### T101 Core Setup
- [ ] T101a Task description
- [ ] T101b Task description
- [ ] T101c Task description

### T102 Integration Setup
- [ ] T102a Task description
- [ ] T102b Task description
- [ ] T102c Task description

## T200 Core Features
### T201 Main Functionality
- [ ] T201a Task description
- [ ] T201b Task description
- [ ] T201c Task description

### T202 UI/UX Implementation
- [ ] T202a Task description
- [ ] T202b Task description
- [ ] T202c Task description

## T300 Advanced Features
### T301 Enhanced Functionality
- [ ] T301a Task description
- [ ] T301b Task description
- [ ] T301c Task description

### T302 Testing & Validation
- [ ] T302a Task description
- [ ] T302b Task description
- [ ] T302c Task description

## T400 Polish & Integration
### T401 Final Integration
- [ ] T401a Task description
- [ ] T401b Task description
- [ ] T401c Task description

### T402 Documentation & Handoff
- [ ] T402a Task description
- [ ] T402b Task description
- [ ] T402c Task description

## T500 Production Readiness
### T501 Production Setup
- [ ] T501a Task description
- [ ] T501b Task description
- [ ] T501c Task description

### T502 Launch Preparation
- [ ] T502a Task description
- [ ] T502b Task description
- [ ] T502c Task description

## Outputs (upon completion)
- Konkrétne výstupy
- Deliverables
- Success criteria
```

### 2.4 data-model.md
```markdown
# XXX-YYYYY - Data Model

## Core Entities

### EntityName
- `field: type` - Description
- `field: type` - Description
- `field: type` - Description

### RelatedEntity
- `field: type` - Description
- `field: type` - Description
- `field: type` - Description

## Supporting Entities

### SupportingEntity
- `field: type` - Description
- `field: type` - Description
- `field: type` - Description

## Relations
- Entity1 1—N Entity2
- Entity2 N—N Entity3
- Entity1 1—1 Entity4
```

### 2.5 quickstart.md
```markdown
# XXX-YYYYY - Quickstart Scenarios

## 1) Basic Functionality Test
### Scenario: Description
- Step 1
- Step 2
- Step 3

### Validation Points:
- [ ] Validation point 1
- [ ] Validation point 2
- [ ] Validation point 3

## 2) Integration Test
### Scenario: Description
- Step 1
- Step 2
- Step 3

### Validation Points:
- [ ] Validation point 1
- [ ] Validation point 2
- [ ] Validation point 3

## 3) Error Handling Test
### Scenario: Description
- Step 1
- Step 2
- Step 3

### Validation Points:
- [ ] Validation point 1
- [ ] Validation point 2
- [ ] Validation point 3

## 4) Performance Test
### Scenario: Description
- Step 1
- Step 2
- Step 3

### Validation Points:
- [ ] Validation point 1
- [ ] Validation point 2
- [ ] Validation point 3

## 5) Security Test
### Scenario: Description
- Step 1
- Step 2
- Step 3

### Validation Points:
- [ ] Validation point 1
- [ ] Validation point 2
- [ ] Validation point 3

## 6) User Experience Test
### Scenario: Description
- Step 1
- Step 2
- Step 3

### Validation Points:
- [ ] Validation point 1
- [ ] Validation point 2
- [ ] Validation point 3

## 7) End-to-End Test
### Scenario: Description
- Step 1
- Step 2
- Step 3

### Validation Points:
- [ ] Validation point 1
- [ ] Validation point 2
- [ ] Validation point 3

## 8) Production Readiness Test
### Scenario: Description
- Step 1
- Step 2
- Step 3

### Validation Points:
- [ ] Validation point 1
- [ ] Validation point 2
- [ ] Validation point 3
```

### 2.6 research.md
```markdown
# XXX-YYYYY - Research Summary

## Product Scope
- Popis produktu
- Kľúčové funkcie
- Business value

## Technical Architecture
- System architecture
- Key components
- Integration points
- Technology stack

## User Experience Research
- User personas
- User journeys
- Pain points
- Success metrics

## Performance Considerations
- Performance requirements
- Scalability considerations
- Optimization strategies
- Monitoring needs

## Security Considerations
- Security requirements
- Threat model
- Mitigation strategies
- Compliance needs

## Accessibility & Inclusion
- Accessibility requirements
- Inclusive design
- Testing strategies
- Compliance standards

## Analytics & Monitoring
- Key metrics
- Monitoring strategy
- Alerting requirements
- Reporting needs

## Future Enhancements
- Planned improvements
- Scalability roadmap
- Technology evolution
- Feature roadmap

## Open Questions
- Unresolved questions
- Research needs
- Decision points
- Risk areas
```

### 2.7 contracts/README.md
```markdown
# XXX-YYYYY - API Contracts

This directory contains API contracts and specifications for the XXX-YYYYY system components.

## Contract Files

### Core Service Contracts
- `core-service-api.yaml` - Core service API contracts
- `integration-api.yaml` - Integration API contracts
- `data-api.yaml` - Data API contracts

### Supporting Contracts
- `auth-api.yaml` - Authentication API contracts
- `monitoring-api.yaml` - Monitoring API contracts
- `error-handling-api.yaml` - Error handling contracts

## Contract Standards

All contracts follow OpenAPI 3.0 specification and include:
- Request/response schemas
- Error handling specifications
- Authentication requirements
- Rate limiting information
- Performance requirements
- Accessibility considerations

## Usage

These contracts are used to:
- Generate TypeScript types
- Validate API responses
- Document system capabilities
- Ensure consistency
- Support testing

## Validation

All contracts are validated against:
- OpenAPI 3.0 specification
- System requirements
- Performance standards
- Security requirements
```

## Krok 3: Validácia a kontrola kvality

### 3.1 Linter kontrola
- Spusti linter na všetkých súboroch
- Oprav všetky chyby
- Zabezpeč konzistentné formátovanie

### 3.2 Konzistentnosť
- Skontroluj formátovanie s existujúcimi špecifikáciami
- Over kódovanie úloh (TXXX)
- Skontroluj cross-links
- Over štruktúru dokumentov

### 3.3 Kompletnosť
- Skontroluj, či sú všetky sekcie vyplnené
- Over, či sú všetky súbory vytvorené
- Skontroluj, či sú všetky cross-links správne
- Over, či sú všetky tasky definované

### 3.4 Integrácia
- Skontroluj závislosti na iné špecifikácie
- Over integračné body
- Skontroluj konzistentnosť s high-level-plan.md
- Over, či sú všetky požiadavky pokryté

## Krok 4: Finalizácia

### 4.1 Dokumentácia
- Aktualizuj README súbory
- Zabezpeč správne cross-links
- Over kompletnosť informácií

### 4.2 Testovanie
- Spusti testovacie scenáre
- Over validáciu
- Skontroluj performance požiadavky

### 4.3 Handoff
- Priprav handoff dokumentáciu
- Zabezpeč knowledge transfer
- Over production readiness

## Best Practices

1. **Konzistentnosť**: Vždy používaj rovnaký formát a štýl
2. **Kompletnosť**: Zabezpeč, aby každá špecifikácia pokrývala všetky aspekty
3. **Validácia**: Vždy skontroluj linter chyby a oprav ich
4. **Dokumentácia**: Udržuj dokumentáciu aktuálnu a kompletnú
5. **Testing**: Zabezpeč pokrytie testovacích scenárov
6. **Maintenance**: Pravidelne aktualizuj špecifikácie
7. **Collaboration**: Zabezpeč, aby všetci tímu rozumeli špecifikáciám
8. **Quality**: Vždy zabezpeč vysokú kvalitu dokumentácie
