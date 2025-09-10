# Tasks: 001-reboot-foundation (plan-only)

## Ordering & rules
- Tests before implementation where applicable.
- No app → app deps; apps depend on packages; packages never depend on apps.
- Keep changes incremental and PR-sized.

## T000 Setup & governance
- [ ] T000 Add PR template referencing `specs/001-reboot-foundation/spec.md` acceptance checklist

## T010 Directory & workspace standards
- [ ] T011 Approve final layout: `apps/{web,mobile,demo}`, `packages/{ui,logic,shared}`, `supabase/`
- [ ] T012 Approve naming: `@schwalbe/*` for all packages; apps marked `private: true`

## T020 TypeScript & build tooling
- [ ] T021 Approve `tsconfig.base.json` + TS Project References for `packages/*`
- [ ] T022 Approve `turbo.json` pipelines (build, dev, test, lint, typecheck)

## T030 App build configs
- [ ] T031 Approve per-app Vite config rule; forbid root cross-app config
- [ ] T032 Decide on npm vs pnpm; add `.nvmrc` and `engines`

## T040 Env & secrets policy
- [ ] T041 Approve root vs per-app `.env.example` split
- [ ] T042 Approve Zod runtime env validation requirement for apps

## T050 Testing & CI
- [ ] T051 Approve testing policy: colocated unit tests; Playwright E2E under `apps/web/e2e`
- [ ] T052 Approve CI `ci.yml` (install, lint, typecheck, unit) and keep Spec Guard separate

## T060 Quality gates
- [ ] T061 Approve ESLint rules for boundaries (no app→app, no package→app)
- [ ] T062 Approve Storybook in `@schwalbe/ui` only

## T070 i18n & contracts
- [ ] T071 Approve i18n location strategy (shared helpers vs app-local content)
- [ ] T072 Approve contracts-first approach in `specs/*/contracts` and client generation location

## T080 React policy
- [ ] T081 Approve React 18.3.x baseline and create React 19 readiness research task

## T090 Research tracks
- [ ] T091 Research: React 19 readiness (dependency audit, blockers, migration plan)
- [ ] T092 Decide initial jurisdictions (SK, CZ) and legal template scope; capture constraints

## Outputs (upon approval in later PRs)
- Monorepo scaffolding per plan, TS refs in place, Turbo pipelines, CI, env validation skeleton, lint rules, Storybook baseline.