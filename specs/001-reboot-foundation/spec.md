# Schwalbe: Reboot Foundation (Monorepo Standardization)

- Reboot of Hollywood under Spec-Driven Development using GitHub Spec Kit.
- Establish clean, standard monorepo architecture and governance before any app code.

## Goals

- Consolidate layout to `apps/*` and `packages/*` with clear boundaries.
- Adopt consistent package naming (`@schwalbe/*`) and dependency direction (apps → packages only).
- Per-app build configs; no root cross-app leakage.
- Baseline CI (Spec Guard + CI lint/typecheck/unit) and runtime env validation policy.
- Keep React 18.3.x initially; create React 19 readiness research task.

## Non-Goals (out of scope)

- Implementing application features or UI.
- Publishing packages to a registry.
- Backend refactors beyond layout and contracts location.

## Review & Acceptance

- [ ] Spec, plan, and tasks authored under `specs/001-reboot-foundation/`
- [ ] Directory conventions approved: `apps/web`, `apps/mobile`, `apps/demo`, `packages/ui`, `packages/logic`, `packages/shared`
- [ ] Package naming rules approved: `@schwalbe/web`, `@schwalbe/ui`, etc.; apps are `private: true`
- [ ] Dependency direction enforced (lint rules defined; no app → app)
- [ ] Per-app build config rule approved (Vite config lives in each app)
- [ ] Env policy approved: root vs per-app `.env.example` and zod-validated at runtime
- [ ] CI policy approved: Spec Guard workflow + simple CI for lint/typecheck/unit
- [ ] TS Project References mandated for `packages/*`
- [ ] React 18 policy approved; React 19 readiness tracked as research task

## Risks & Mitigations

- Drift from standards over time → Mitigate with ESLint boundary rules and CI checks.
- Over-optimizing build splitting early → Start with default Vite; add chunks only after profiling.
- Cross-app coupling → Keep app-local aliases; forbid packages depending on apps.

## References

- Spec Kit workflow and templates (`https://github.com/github/spec-kit`).

## Cross-links

- See 004-dead-man-switch/spec.md for emergency system scope depending on this foundation.

## Linked design docs

- See `research.md` for concise scope and feature mapping.
- See `data-model.md` for entity outline and relations.
- See `quickstart.md` for primary E2E flows to validate.
