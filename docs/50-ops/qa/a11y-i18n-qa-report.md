# A11y & i18n QA Report (initial)

Context
- Repo: schwalbe
- Feature: A11y & i18n QA suite
- Scope: keyboard-only nav for critical flows, screen reader labels/ARIA checks, contrast checks, i18n menu validation (≥4 per domain)
- Constraints: English UI baseline; 34 languages total; low risk edits

Summary of checks done
- Inventory domains and language mapping
  - Found COUNTRY_DOMAINS in packages/shared/src/config/domains.ts (39 domains; CZ/SK enabled for MVP)
  - Found DOMAIN_LANGUAGES and SUPPORTED_LANGUAGES_34 in packages/shared/src/config/languages.ts (34 languages)
  - Verified automated tests enforcing ≥4 languages per domain and special rules (packages/shared/src/config/__tests__/languageRules.test.ts)
- Located UI implementations
  - Top bar + language switcher: apps/web/src/components/layout/TopBar.tsx
  - Country menu: apps/web/src/components/layout/CountryMenu.tsx
  - SearchBox used in top bar: apps/web/src/components/layout/SearchBox.tsx
  - Locale helpers: apps/web/src/lib/locale.ts
- Heuristic a11y scan for critical components used in header and will wizard
  - Checked for ARIA labels, menu roles, decorative graphics, and keyboard navigation patterns

Findings and fixes
1) Language label source duplication
- File: apps/web/src/components/layout/TopBar.tsx
- Issue: inline LABELS_LOCAL duplicated language names; risk of drift from authoritative mapping in shared config
- Fix: use getLanguageLabel from @schwalbe/shared/config/languages. Removed local map. Updated displayed labels accordingly.
- Risk: low; labels remain English and centralized.

2) ARIA validity for bell icon
- File: apps/web/src/components/layout/TopBar.tsx
- Issue: <span role="img" aria-hidden> lacked explicit value; set aria-hidden="true" for clarity.
- Fix applied.
- Risk: none.

3) Decorative SVG should be hidden from screen readers
- File: apps/web/src/components/LegacyGuardLogo.tsx
- Issue: Logo SVG is purely decorative in the header context; screen readers were seeing it as an unlabelled graphic.
- Fix: add aria-hidden="true" focusable="false" to the <svg>.
- Risk: none (brand name still visible as text next to logo).

4) SearchBox ARIA relationships for listbox
- File: apps/web/src/components/layout/SearchBox.tsx
- Issues:
  - Input did not reference the active option or listbox via aria-controls/aria-activedescendant.
  - Listbox lacked an id; options lacked element ids for activedescendant.
  - Minor Tailwind class typo w:[…] vs w-[…].
- Fixes:
  - Added listboxId, activeId; wired aria-controls and aria-activedescendant on input.
  - Set id on listbox container and on each option button (search-option-<id>). Corrected width class to w-[min(90vw,360px)].
- Risk: low, improves SR navigation; preserves visuals.

5) Non-English label in redirect simulation modal (outside allowed exception)
- File: apps/web/src/components/modals/RedirectSimulationModal.tsx
- Issue: Section label in Czech ("Cílové adresy pro domény:") while rule allows only the simulation message to be Czech; rest must be English.
- Fix: Changed to English: "Target URLs for domains:". Left the main simulation message sentence in Czech per rule.
- Risk: none; aligns with project rule.

i18n menu validation status
- DOMAIN_LANGUAGES covers all listed domains; ≥4 languages each per test
- Special cases satisfied by tests:
  - Germany without Russian (ru)
  - Iceland and Liechtenstein without Ukrainian (uk)
  - Baltics (EE, LV, LT) include Russian (ru)
- Language switcher in TopBar reads allowed list from getAllowedLanguagesForCurrentHost and now uses shared labels

Keyboard-only nav quick pass
- TopBar: Menu buttons are <Button> elements (render to <button>), toggling popovers with role="menu" and role="menuitem(s)".
- LanguageSwitcher uses role="menuitemradio" and aria-checked; CountryMenu uses aria-current on current item. Buttons are focusable.
- SearchBox: input is focusable; results options are buttons within a listbox. Arrow key behavior implemented; Escape closes.
- Will Wizard (partial scan): Forms in StepStart/StepTestator provide labels/aria-describedby, buttons have clear labels, and layout regions include aria-live where appropriate.

Contrast quick scan (heuristic)
- Palette: slate-900/800 backgrounds with text-slate-200/300/400; primary on dark backgrounds.
- Potential risk areas: text-slate-400 on dark backgrounds may be borderline for small text; however used mainly for secondary texts and labels. No blocking issues identified without a visual contrast tool. Recommend targeted WCAG checks later.

Open items and recommendations
- Consider adding eslint-plugin-jsx-a11y in CI with rules for images/roles/aria; would require dependency changes (not performed here).
- Expand automated i18n validation to ensure every referenced language code has at least the English fallback for essential UI bundles; script exists (scripts/validate-i18n.mjs) and can be wired into CI (already present under .github/workflows/i18n-health-check.yml).

Acceptance criteria snapshot
- No blockers found in inspected flows. Language menus look correct and enforced by tests. A11y adjustments applied.

Proposed commit messages
- chore(a11y+i18n): use shared language labels in TopBar; add aria-hidden to logo; improve SearchBox ARIA; fix modal label

Next steps
- If you approve, I will commit directly to main (per preference) with the message above and open a PR for review notes. Optionally, I can run the i18n validation script and include its output in CI.
