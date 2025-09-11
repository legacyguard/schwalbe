# Prompt pre 020-auth-rls-baseline

Na základe high-level-plan.md a existujúcich špecifikácií (001-019) vytvor kompletnú sadu dokumentov pre špecifikáciu 020-auth-rls-baseline:

**Krok 1: Analýza a research**
- Analyzuj high-level-plan.md pre Phase 2 — Auth + RLS Baseline (Clerk + Supabase)
- Identifikuj kľúčové komponenty: Clerk authentication, Supabase RLS, session management, access control
- Nájdi relevantné implementácie v Hollywood codebase (/Users/luborfedak/Documents/Github/hollywood) pre auth system
- Identifikuj závislosti na 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration, 009-professional-network, 010-emergency-access, 011-mobile-app, 012-animations-microinteractions, 013-time-capsule-legacy, 014-pricing-conversion, 015-business-journeys, 016-integration-testing, 017-production-deployment, 018-monitoring-analytics, 019-nextjs-migration
- Zameraj sa na: Clerk integration, RLS policies, session management, access control, security

**Krok 2: Vytvorenie dokumentov**
Vytvor tieto súbory v `/specs/020-auth-rls-baseline/`:

1. **spec.md** - Hlavná špecifikácia s:
   - Názvom: "Auth & RLS Baseline - Clerk Authentication and Supabase RLS"
   - Goals: Clerk authentication, Supabase RLS, session management, access control
   - Non-Goals: custom authentication, complex RBAC, enterprise SSO
   - Review & Acceptance: auth integration, RLS enforcement, session management
   - Risks & Mitigations: auth failures, RLS bypass, session hijacking
   - References: Clerk docs, Supabase RLS guide, auth best practices
   - Cross-links: 001-reboot-foundation, 002-hollywood-migration, 005-sofia-ai-system, 006-document-vault, 007-will-creation-system, 008-family-collaboration, 009-professional-network, 010-emergency-access, 011-mobile-app, 012-animations-microinteractions, 013-time-capsule-legacy, 014-pricing-conversion, 015-business-journeys, 016-integration-testing, 017-production-deployment, 018-monitoring-analytics, 019-nextjs-migration
   - Linked design docs: research.md, data-model.md, quickstart.md

2. **plan.md** - Detailný plán implementácie s:
   - Phase 1: Auth Setup (Week 1) - Clerk integration, auth configuration
   - Phase 2: RLS Implementation (Week 2) - RLS policies, access control
   - Phase 3: Session Management (Week 3) - session handling, token management
   - Phase 4: Access Control (Week 4) - permission system, role management
   - Phase 5: Security Hardening (Week 5) - security measures, vulnerability scanning
   - Acceptance signals: auth integration, RLS enforcement, session management
   - Linked docs: research.md, data-model.md, quickstart.md

3. **tasks.md** - Kompletný zoznam úloh s:
   - T2000 Auth Setup
   - T2001 Clerk Integration
   - T2002 Auth Configuration
   - T2003 RLS Implementation
   - T2004 RLS Policies
   - T2005 Access Control
   - T2006 Session Management
   - T2007 Session Handling
   - T2008 Token Management
   - T2009 Access Control
   - T2010 Permission System
   - T2011 Role Management
   - T2012 Security Hardening
   - T2013 Security Measures
   - T2014 Vulnerability Scanning
   - T2015 Auth Testing

4. **data-model.md** - Dátový model s:
   - UserAuth entity s auth fields
   - RLSPolicy pre RLS policies
   - SessionData pre session management
   - AccessPermission pre access control
   - UserRole pre role management
   - SecurityLog pre security tracking
   - Relations medzi entitami

5. **quickstart.md** - Testovacie scenáre s:
   - 1) Auth Setup - configure authentication system
   - 2) RLS Testing - test RLS policies
   - 3) Session Testing - test session management
   - 4) Access Control Testing - test access control
   - 5) Security Testing - test security measures
   - 6) Role Testing - test role management
   - 7) Permission Testing - test permission system
   - 8) Token Testing - test token management
   - 9) Vulnerability Testing - test vulnerability scanning
   - 10) End-to-End Test - complete auth workflow

6. **research.md** - Výskumná analýza s:
   - Product scope: authentication and authorization system
   - Technical architecture: Clerk auth, Supabase RLS
   - User experience: auth user experience
   - Performance: auth performance optimization
   - Security: auth security measures
   - Accessibility: auth accessibility
   - Analytics: auth analytics and insights
   - Future enhancements: advanced auth features

7. **contracts/README.md** - API kontrakty s:
   - clerk-auth-api.yaml
   - supabase-rls-api.yaml
   - session-management-api.yaml
   - access-control-api.yaml
   - security-hardening-api.yaml

**Krok 3: Konzistentnosť**
- Použi rovnaký formát ako 005-sofia-ai-system
- Zachovaj konzistentné kódovanie úloh (T2000+)
- Udržuj konzistentný štýl a štruktúru
- Zabezpeč správne cross-links na 001, 002, 005, 006, 007, 008, 009, 010, 011, 012, 013, 014, 015, 016, 017, 018, 019

**Krok 4: Kompletnosť**
- Pokry všetky aspekty z Phase 2 — Auth + RLS Baseline (Clerk + Supabase)
- Zahrň auth system z Hollywood
- Identifikuj závislosti na Clerk integration a Supabase RLS
- Zabezpeč pokrytie testovacích scenárov
- Zahrň session management a access control

**Krok 5: Validácia**
- Skontroluj linter chyby a oprav ich
- Over konzistentnosť s existujúcimi špecifikáciami
- Zabezpeč správne formátovanie a štruktúru
- Over kompletnosť informácií
- Skontroluj cross-links na súvisiace špecifikácie

**Špecifické požiadavky pre 020-auth-rls-baseline:**
- Zameraj sa na Clerk authentication integration
- Implementuj Supabase RLS policies a enforcement
- Zabezpeč session management a token handling
- Zahrň access control a permission system
- Implementuj role management a user roles
- Zabezpeč security hardening a vulnerability scanning
- Zahrň auth testing a validation
- Implementuj auth analytics a monitoring
- Zabezpeč auth performance optimization
- Zahrň auth accessibility a compliance
