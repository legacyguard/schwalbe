# Plan: Schwalbe Reboot Foundation

## Workspace manager

- Keep npm workspaces (ok) or switch to pnpm for speed/dedupe. Default: npm.
- Enforce versions via `.nvmrc` and `engines` in root `package.json`.

## Directory layout

- apps/web, apps/mobile, apps/demo
- packages/ui, packages/logic, packages/shared
- supabase/ (root; or infrastructure/supabase if we add IaC)

## Package names and boundaries

- Apps: `@schwalbe/web`, `@schwalbe/mobile`, `@schwalbe/demo` (private: true)
- Libraries: `@schwalbe/ui`, `@schwalbe/logic`, `@schwalbe/shared`
- Direction: apps → packages only; packages must not depend on apps.

## TypeScript

- Root `tsconfig.base.json`; per-package `tsconfig.json` with `composite: true` and references.
- TS Project References configured between `packages/*`.

## Build tooling

- Turborepo `turbo.json` with pipelines: build, dev, test, lint, typecheck.
- Each app/package owns its scripts; Turbo orchestrates. Avoid root scripts that cd.

## App build config

- Vite config per app (`apps/web/vite.config.ts`, etc.).
- Start with default code-splitting; only add manual chunks after profiling.
- App-local path aliases only.

## Env & secrets

- Root `.env.example` for shared vars; per-app `.env.example` for app-specific.
- Zod-based runtime env validation in each app; fail fast if missing/invalid.

## Testing

- Unit tests colocated (`src/**/__tests__`).
- E2E: Playwright under `apps/web/e2e` (and mobile when applicable).
- CI runs unit on PR; E2E optional on main/nightly or label-gated.

## CI/CD

- Keep existing Spec Guard workflow.
- Add `ci.yml`: install, lint, typecheck, unit tests; cache Turbo.
- Optional `e2e.yml` later.

## Versioning & releases

- Internal only by default. If publishing libraries, adopt Changesets.

## Code quality

- Root ESLint 9 + Prettier 3, extended per package.
- Enforce boundaries: no app→app imports; no package→app.

## UI/Storybook

- Storybook only in `@schwalbe/ui`.

## i18n

- i18n runtime helpers in `@schwalbe/shared`.
- App-specific locales live with each app; shared content in `packages/shared/locales` when truly common.

## API contracts

- Define contracts per feature under `specs/*/contracts` (OpenAPI or Zod).
- Generate clients into `@schwalbe/logic` or `@schwalbe/shared`.

## Feature flags

- Minimal typed flag service in `@schwalbe/shared` with env-driven defaults.

## React version policy

- Stay on React 18.3.x initially (Hollywood issues on 19).
- Create "React 19 readiness" research task with dependency audit.

## Acceptance signals (once implemented later)

- Turborepo builds `packages/*` then apps.
- Lint/typecheck/unit pass in CI.
- Env validation fails fast with helpful error in dev.
- Import boundary violations fail lint.

## Linked docs

- `research.md`: product scope and flows adopted from manual
- `data-model.md`: entities guiding contracts and schemas
- `quickstart.md`: E2E scenarios for validation planning
