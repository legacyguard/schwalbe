# Prompt pre 012-animations-microinteractions

Na základe high-level-plan.md a existujúcich špecifikácií (001-011) vytvor kompletnú sadu dokumentov pre špecifikáciu 012-animations-microinteractions:

**Krok 1: Analýza a research**
- Analyzuj high-level-plan.md pre Phase 7 — Emotional Core MVP a Phase 2F — Animations Plan
- Identifikuj kľúčové komponenty: firefly animations, celebration system, micro-interactions, performance optimization
- Nájdi relevantné implementácie v Hollywood codebase (/Users/luborfedak/Documents/Github/hollywood) pre animation system
- Identifikuj závislosti na 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration, 009-professional-network, 010-emergency-access, 011-mobile-app
- Zameraj sa na: Framer Motion, CSS animations, performance budgets, accessibility, emotional design

**Krok 2: Vytvorenie dokumentov**
Vytvor tieto súbory v `/specs/012-animations-microinteractions/`:

1. **spec.md** - Hlavná špecifikácia s:
   - Názvom: "Animations & Micro-interactions - Emotional Design System"
   - Goals: firefly animations, celebration system, micro-interactions, performance optimization
   - Non-Goals: complex 3D animations, video animations, real-time rendering
   - Review & Acceptance: 60fps performance, accessibility compliance, emotional impact
   - Risks & Mitigations: performance degradation, accessibility issues, animation fatigue
   - References: Framer Motion docs, CSS animation guidelines, accessibility standards
   - Cross-links: 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration, 009-professional-network, 010-emergency-access, 011-mobile-app
   - Linked design docs: research.md, data-model.md, quickstart.md

2. **plan.md** - Detailný plán implementácie s:
   - Phase 1: Animation Foundation (Week 1) - Framer Motion setup, base animations
   - Phase 2: Firefly System (Week 2) - firefly animations, physics system
   - Phase 3: Celebration System (Week 3) - milestone animations, success effects
   - Phase 4: Micro-interactions (Week 4) - button animations, hover effects
   - Phase 5: Performance & Accessibility (Week 5) - optimization, accessibility
   - Acceptance signals: 60fps performance, accessibility compliance, emotional impact
   - Linked docs: research.md, data-model.md, quickstart.md

3. **tasks.md** - Kompletný zoznam úloh s:
   - T1200 Animation Foundation
   - T1201 Framer Motion Setup
   - T1202 Base Animations
   - T1203 Firefly System
   - T1204 Firefly Animations
   - T1205 Physics System
   - T1206 Celebration System
   - T1207 Milestone Animations
   - T1208 Success Effects
   - T1209 Micro-interactions
   - T1210 Button Animations
   - T1211 Hover Effects
   - T1212 Performance & Accessibility
   - T1213 Performance Optimization
   - T1214 Accessibility Compliance
   - T1215 Animation Testing

4. **data-model.md** - Dátový model s:
   - AnimationConfig pre animation settings
   - FireflyState pre firefly animations
   - CelebrationEvent pre celebration triggers
   - MicroInteraction pre micro-interactions
   - PerformanceMetrics pre performance tracking
   - AccessibilitySettings pre accessibility options
   - Relations medzi entitami

5. **quickstart.md** - Testovacie scenáre s:
   - 1) Animation Setup - configure animation system
   - 2) Firefly Testing - test firefly animations
   - 3) Celebration Testing - test celebration effects
   - 4) Micro-interaction Testing - test micro-interactions
   - 5) Performance Testing - test animation performance
   - 6) Accessibility Testing - test accessibility compliance
   - 7) Mobile Testing - test mobile animations
   - 8) Error Handling - test animation error handling
   - 9) User Experience - test emotional impact
   - 10) End-to-End Test - complete animation workflow

6. **research.md** - Výskumná analýza s:
   - Product scope: emotional design system
   - Technical architecture: animation framework, performance system
   - User experience: emotional impact, engagement
   - Performance: 60fps target, optimization strategies
   - Security: animation security considerations
   - Accessibility: animation accessibility standards
   - Analytics: animation performance tracking
   - Future enhancements: advanced animations

7. **contracts/README.md** - API kontrakty s:
   - animation-system-api.yaml
   - firefly-animation-api.yaml
   - celebration-system-api.yaml
   - micro-interaction-api.yaml
   - performance-monitoring-api.yaml

**Krok 3: Konzistentnosť**
- Použi rovnaký formát ako 005-sofia-ai-system
- Zachovaj konzistentné kódovanie úloh (T1200+)
- Udržuj konzistentný štýl a štruktúru
- Zabezpeč správne cross-links na 001, 002, 005, 006, 007, 008, 009, 010, 011

**Krok 4: Kompletnosť**
- Pokry všetky aspekty z Phase 7 — Emotional Core MVP a Phase 2F — Animations Plan
- Zahrň animation system z Hollywood
- Identifikuj závislosti na performance budgets a accessibility
- Zabezpeč pokrytie testovacích scenárov
- Zahrň emotional design a user engagement

**Krok 5: Validácia**
- Skontroluj linter chyby a oprav ich
- Over konzistentnosť s existujúcimi špecifikáciami
- Zabezpeč správne formátovanie a štruktúru
- Over kompletnosť informácií
- Skontroluj cross-links na súvisiace špecifikácie

**Špecifické požiadavky pre 012-animations-microinteractions:**
- Zameraj sa na Framer Motion animation framework
- Implementuj firefly animation system s physics
- Zabezpeč celebration system pre milestones
- Zahrň micro-interactions pre user engagement
- Implementuj performance optimization pre 60fps
- Zabezpeč accessibility compliance pre animations
- Zahrň emotional design principles
- Implementuj animation testing a validation
- Zabezpeč mobile animation performance
- Zahrň animation analytics a monitoring
