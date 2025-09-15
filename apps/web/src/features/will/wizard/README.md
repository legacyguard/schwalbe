# Will Wizard (CZ/SK)

This feature implements a guided will creation wizard for Czech Republic (CZ) and Slovakia (SK) jurisdictions.

Key points:
- UI in English; i18n-ready (namespace `will/wizard`), fallback to English; 34 locales can be added incrementally.
- Accessibility: labeled inputs, aria attributes, keyboard focusable controls.
- Validation: step-level checks and final legal validation via engine (packages/logic/src/will).
- Save/Resume: Supabase-backed drafts (`will_drafts` table) when authenticated, with localStorage fallback.

Structure:
- components/: layout and progress UI
- routes/: route integration for `/will/wizard/*`
- state/: Wizard context and persistence helpers
- steps/: individual step screens

Notes:
- Final generation uses WillEngine.generate() with CZ/SK rules.
- The database table `will_drafts` must exist per specs; otherwise, save falls back to local storage.