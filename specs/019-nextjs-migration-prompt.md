# Prompt pre 019-nextjs-migration

Na základe high-level-plan.md a existujúcich špecifikácií (001-018) vytvor kompletnú sadu dokumentov pre špecifikáciu 019-nextjs-migration:

**Krok 1: Analýza a research**
- Analyzuj high-level-plan.md pre Phase 0 — Bootstrap, Governance, and Hygiene
- Identifikuj kľúčové komponenty: Next.js migration, App Router, SSR/RSC, Edge runtime
- Nájdi relevantné implementácie v Hollywood codebase (/Users/luborfedak/Documents/Github/hollywood) pre Next.js system
- Identifikuj závislosti na 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration, 009-professional-network, 010-emergency-access, 011-mobile-app, 012-animations-microinteractions, 013-time-capsule-legacy, 014-pricing-conversion, 015-business-journeys, 016-integration-testing, 017-production-deployment, 018-monitoring-analytics
- Zameraj sa na: Next.js App Router, SSR/RSC, Edge runtime, Vercel integration, performance optimization

**Krok 2: Vytvorenie dokumentov**
Vytvor tieto súbory v `/specs/019-nextjs-migration/`:

1. **spec.md** - Hlavná špecifikácia s:
   - Názvom: "Next.js Migration - App Router and SSR/RSC Implementation"
   - Goals: Next.js migration, App Router, SSR/RSC, Edge runtime, Vercel integration
   - Non-Goals: custom server, complex middleware, real-time features
   - Review & Acceptance: migration completion, performance improvement, Vercel integration
   - Risks & Mitigations: migration complexity, performance regression, compatibility issues
   - References: Next.js docs, App Router guide, Vercel integration
   - Cross-links: 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration, 009-professional-network, 010-emergency-access, 011-mobile-app, 012-animations-microinteractions, 013-time-capsule-legacy, 014-pricing-conversion, 015-business-journeys, 016-integration-testing, 017-production-deployment, 018-monitoring-analytics
   - Linked design docs: research.md, data-model.md, quickstart.md

2. **plan.md** - Detailný plán implementácie s:
   - Phase 1: Next.js Setup (Week 1) - Next.js installation, App Router setup
   - Phase 2: Migration Planning (Week 2) - migration strategy, component mapping
   - Phase 3: Component Migration (Week 3) - component migration, page migration
   - Phase 4: SSR/RSC Implementation (Week 4) - server components, data fetching
   - Phase 5: Performance Optimization (Week 5) - performance tuning, Vercel optimization
   - Acceptance signals: migration completion, performance improvement, Vercel integration
   - Linked docs: research.md, data-model.md, quickstart.md

3. **tasks.md** - Kompletný zoznam úloh s:
   - T1900 Next.js Setup
   - T1901 Next.js Installation
   - T1902 App Router Setup
   - T1903 Migration Planning
   - T1904 Migration Strategy
   - T1905 Component Mapping
   - T1906 Component Migration
   - T1907 Component Migration
   - T1908 Page Migration
   - T1909 SSR/RSC Implementation
   - T1910 Server Components
   - T1911 Data Fetching
   - T1912 Performance Optimization
   - T1913 Performance Tuning
   - T1914 Vercel Optimization
   - T1915 Migration Testing

4. **data-model.md** - Dátový model s:
   - NextJSConfig entity s configuration fields
   - AppRoute pre App Router routes
   - ServerComponent pre server components
   - ClientComponent pre client components
   - DataFetching pre data fetching
   - PerformanceMetric pre performance data
   - Relations medzi entitami

5. **quickstart.md** - Testovacie scenáre s:
   - 1) Next.js Setup - configure Next.js application
   - 2) App Router Testing - test App Router functionality
   - 3) Component Migration - test component migration
   - 4) SSR/RSC Testing - test server components
   - 5) Performance Testing - test performance optimization
   - 6) Vercel Integration - test Vercel deployment
   - 7) Data Fetching Testing - test data fetching
   - 8) Routing Testing - test routing functionality
   - 9) Compatibility Testing - test compatibility
   - 10) End-to-End Test - complete Next.js migration

6. **research.md** - Výskumná analýza s:
   - Product scope: Next.js migration system
   - Technical architecture: Next.js framework, App Router
   - User experience: migration user experience
   - Performance: Next.js performance optimization
   - Security: Next.js security measures
   - Accessibility: Next.js accessibility
   - Analytics: migration analytics and insights
   - Future enhancements: Next.js feature updates

7. **contracts/README.md** - API kontrakty s:
   - nextjs-migration-api.yaml
   - app-router-api.yaml
   - ssr-rsc-api.yaml
   - vercel-integration-api.yaml
   - performance-optimization-api.yaml

**Krok 3: Konzistentnosť**
- Použi rovnaký formát ako 005-sofia-ai-system
- Zachovaj konzistentné kódovanie úloh (T1900+)
- Udržuj konzistentný štýl a štruktúru
- Zabezpeč správne cross-links na 001, 002, 005, 006, 007, 008, 009, 010, 011, 012, 013, 014, 015, 016, 017, 018

**Krok 4: Kompletnosť**
- Pokry všetky aspekty z Phase 0 — Bootstrap, Governance, and Hygiene
- Zahrň Next.js system z Hollywood
- Identifikuj závislosti na App Router a SSR/RSC
- Zabezpeč pokrytie testovacích scenárov
- Zahrň Vercel integration a performance optimization

**Krok 5: Validácia**
- Skontroluj linter chyby a oprav ich
- Over konzistentnosť s existujúcimi špecifikáciami
- Zabezpeč správne formátovanie a štruktúru
- Over kompletnosť informácií
- Skontroluj cross-links na súvisiace špecifikácie

**Špecifické požiadavky pre 019-nextjs-migration:**
- Zameraj sa na Next.js App Router a SSR/RSC
- Implementuj server components a data fetching
- Zabezpeč Vercel integration a deployment
- Zahrň performance optimization a tuning
- Implementuj component migration strategy
- Zabezpeč routing a navigation functionality
- Zahrň data fetching a caching
- Implementuj middleware a API routes
- Zabezpeč migration testing a validation
- Zahrň Next.js best practices a patterns
