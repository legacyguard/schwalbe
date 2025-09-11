# Internationalization Strategy (Schwalbe)

Approach
- Domain-driven namespaces and modular JSON files with target sizes of ~100–500 lines, split/merge rules, and hierarchical keys (domain.feature.element).
Evidence: /Users/luborfedak/Documents/Github/hollywood/docs/I18N_MODULAR_STRATEGY.md:5-18,165-180

Proposed Structure
- Language folders per locale with domain-centric subfolders (auth, dashboard, documents, family, will, vault, legal, notifications, onboarding, settings).
- Jurisdiction overlays for country-specific legal terms.
Evidence: /Users/luborfedak/Documents/Github/hollywood/docs/I18N_MODULAR_STRATEGY.md:20-99

Key Practices
- Consistent key naming; pluralization; parameters via interpolation; lazy-load namespaces; automated validation in CI.
Evidence: /Users/luborfedak/Documents/Github/hollywood/docs/I18N_MODULAR_STRATEGY.md:377-387,345-375

Schwalbe-specific rules
- All code/comments in English; UI localized via language mutations.
- Language set adjustments per rules (e.g., replace Russian with Ukrainian where applicable; ensure minimum 4 languages per country; special removals in specific countries).
- Ensure redirection/i18n interactions follow environment-controlled behavior (see domain redirect strategy).

