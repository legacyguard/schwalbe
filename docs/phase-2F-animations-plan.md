# Phase 2F – Animation System and Micro-interactions Migration Plan

Goals
- Bring in Hollywood’s animation utilities and micro-interactions.
- Keep accessibility first (reduced-motion), and minimize new cross-package type noise.

Plan
1) Inventory and selection
   - Identify reusable primitives (motion wrappers, entrance/exit, hover/focus, parallax) and decide the canonical lib (prefer Framer Motion if already present in web; otherwise minimal CSS/WAAPI wrappers).
2) Platform alignment
   - If Tamagui is used in UI package, isolate web-only animation wrappers in apps/web/src/animations to avoid UI package type friction.
3) Reduced-motion guard
   - Provide a useReducedMotion hook fallback and condition animations on it.
4) Tokens and durations
   - Define animation tokens (durations, easings) in a single config and reuse.
5) Progressive adoption
   - Add to Professional Directory cards (hover lift/fade), Application form success state (confetti-lite or subtle pulse), and demo nav transitions.
6) QA and performance
   - Test on low-end devices; ensure no blocking main thread.

Risks
- Type mismatches between UI package and web app (mitigate via web-local wrappers).
- User preference for reduced motion (guard it globally).

