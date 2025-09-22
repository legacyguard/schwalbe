# Real-time compliance checks

This document describes the developer wiring for real-time legal compliance checks in the Will Wizard.

Scope
- Trigger validations on field changes within wizard
- Aggregate step-level and overall compliance
- Show actionable remediation guidance

Key pieces
- Engine: packages/logic/src/will (validateCZ/validateSK via WillEngine.validate)
- Hook: apps/web/src/features/will/wizard/hooks/useCompliance.ts
- UI: apps/web/src/features/will/wizard/components/compliance/ComplianceBanner.tsx
- Progress: apps/web/src/features/will/wizard/components/progress/Progress.tsx (per-step counts)

How it works
1) WizardContext exposes toEngineInput() which maps WizardState -> WillInput.
2) useCompliance() calls useEngineValidation(toEngineInput()) which runs WillEngine.validate on every state change.
3) Issues are mapped to steps and enriched with human guidance (English-only) for remediation.
4) WizardLayout renders a ComplianceBanner and passes per-step issue counts to Progress.

Acceptance criteria coverage
- Immediate feedback: useCompliance() recomputes as state changes, no explicit submit needed.
- Accurate: leverages existing engine rules for CZ/SK only; no cross-border logic.
- Actionable: banner displays remediation text and "Fix now" buttons to navigate to the relevant step.

Testing
- End-to-end flows added under apps/web/tests/e2e/will-compliance.spec.ts
- These verify trigger visibility and resolution once fields are corrected.

Notes
- UI text is in English in compliance with project rules.
- Guidance strings are minimal and non-legal; they reference which field(s)/step(s) to fix.
