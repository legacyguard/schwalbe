# Will Wizard (CZ/SK)

This feature implements a guided will creation wizard for Czech Republic (CZ) and Slovakia (SK) jurisdictions.

Key points:
- UI in English; i18n-ready (namespace `will/wizard`), fallback to English; 34 locales can be added incrementally.
- Accessibility: labeled inputs, aria attributes, keyboard focusable controls.
- Validation: step-level checks and real-time legal validation via engine (packages/logic/src/will).
- Save/Resume: Supabase-backed drafts (`will_drafts` table) when authenticated, with localStorage fallback.

Structure:
- components/: layout and progress UI
- routes/: route integration for `/will/wizard/*`
- state/: Wizard context and persistence helpers
- steps/: individual step screens
- compliance/: mapping and UI for real-time compliance
- hooks/: `useCompliance` and engine hooks

Notes:
- Final generation uses WillEngine.generate() with CZ/SK rules.
- The database table `will_drafts` must exist per specs; otherwise, save falls back to local storage.

Real-time compliance wiring:
- `useCompliance` derives `WillInput` from wizard state and calls `WillEngine.validate()` on each change.
- Issues are mapped to wizard steps and rendered in a banner with actionable guidance.
- The step progress shows per-step error/warning counts and colors.

Testing:
- See e2e test `tests/e2e/will-compliance.spec.ts` for trigger and remediation flows.
