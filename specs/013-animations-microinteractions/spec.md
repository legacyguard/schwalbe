# Animations & Micro-interactions - Emotional Design System

- Implementation of Phase 7 — Emotional Core MVP animation requirements
- Night sky landing page with accessible performance budgets (60fps target)
- Sofia presence with firefly motion and guided dialog surface
- 3-act onboarding animations to reduce anxiety and celebrate clarity
- Comprehensive animation system migrated from Hollywood codebase
- Performance budgets, accessibility standards, and emotional design integration

## Goals

- Implement firefly animations with personality adaptation (empathetic, pragmatic, adaptive modes)
- Create celebration system for milestones and achievements with emotional impact
- Build comprehensive micro-interaction library for UI components
- Establish performance budgets and accessibility standards for animations
- Integrate emotional design principles throughout the animation system

## Non-Goals (out of scope)

- Complex 3D animations requiring heavy computation
- Video-based animations or media overlays
- Real-time rendering or game-like animation systems
- Animation systems for non-web platforms

## Review & Acceptance

- [ ] 60fps performance maintained across all animation types
- [ ] Accessibility compliance with WCAG guidelines and reduced motion support
- [ ] Emotional impact verified through user testing and qualitative feedback
- [ ] Firefly animations functional with personality adaptation
- [ ] Celebration system triggers appropriate emotional responses
- [ ] Micro-interaction library comprehensive and reusable
- [ ] Performance budgets met (<100ms animation start time)
- [ ] Cross-browser compatibility verified (Chrome, Firefox, Safari, Edge)

## Risks & Mitigations

- Performance degradation on low-end devices → Implement progressive enhancement and device detection
- Accessibility issues causing user discomfort → Mandatory accessibility reviews and user testing
- Animation fatigue reducing emotional impact → Implement animation variety and user controls
- Personality adaptation not resonating → User feedback loops and A/B testing
- Browser compatibility issues → Progressive enhancement and fallback strategies

## References

- Framer Motion documentation and performance guidelines
- CSS animation standards and best practices
- Web accessibility guidelines for motion and animations (WCAG 2.1)
- Emotional design principles and user experience research

## Cross-links

- See 001-reboot-foundation/spec.md for foundation architecture
- See 003-hollywood-migration/spec.md for animation system migration
- See 031-sofia-ai-system/spec.md for personality system integration
- See 006-document-vault/spec.md for document interaction animations
- See 023-will-creation-system/spec.md for form and wizard animations
- See 025-family-collaboration/spec.md for collaborative interaction animations
- See 026-professional-network/spec.md for network interaction animations
- See 020-emergency-access/spec.md for emergency state animations
- See 029-mobile-app/spec.md for mobile-specific animation adaptations

## Linked design docs

- See `research.md` for animation system analysis and technical research
- See `data-model.md` for animation types, configurations, and personality mappings
- See `quickstart.md` for animation implementation examples and testing scenarios
- See sections below for concrete mappings and defaults: Animation Map, Variant Catalog, Trigger/Event Catalog, and Reduced Motion Policy

## Animation Map

The table below maps core routes, components, and actions to animation behaviors, with personality adaptations, reduced-motion fallbacks, performance-mode tweaks, and telemetry keys.

| Route | Component | Action | Personality | Animation | Variant | Reduced-motion fallback | Perf-mode tweaks | Telemetry keys |
|---|---|---|---|---|---|---|---|---|
| /documents | UploadButton + List | Upload success | Empathetic | Celebration | document_upload (spiral) | Success banner + ARIA live "Upload succeeded" | Low: particleCount ↓, glow off | perf.animationStart, perf.fps, engagement.uploadCelebration |
| /guardians | AddGuardianForm | Add success | Pragmatic | Celebration | guardian_added (burst) | Checkmark icon + toast | Low: duration ↓, particleCount ↓ | perf.animationStart, perf.fps, engagement.guardianCelebration |
| /will | CompletionPanel | Will created | Adaptive | Celebration | will_created (hybrid spiral/burst) | Success card + confetti emoji | Low: particles → minimal, glow off | perf.animationStart, perf.fps, engagement.willCelebration |
| Any form | Submit button/section | Submit success | Any | Micro-interaction | success-checkmark | Static icon + ARIA success | Low: duration ↓ | perf.animationStart |
| Any form | Field group | Validation error | Any | Micro-interaction | error-shake | Error icon + color only | Low: n/a | perf.animationStart |
| Lists | ListItem | Hover | Any | Micro-interaction | hover-lift | Border + shadow only | Low: translateY ↓, shadow light | perf.animationStart |

Notes:

- Throttle celebrations to at most once per minute per event type to avoid fatigue.
- Use device capability to scale particles, duration, and glow effects.

Additional mappings:

| Route | Component | Action | Personality | Animation | Variant | Reduced-motion fallback | Perf-mode tweaks | Telemetry keys |
|---|---|---|---|---|---|---|---|---|
| / | Hero | Page load | Empathetic | Micro-interaction | fade-in-up | Instant appearance + high-contrast content | Low: duration ↓ | perf.animationStart, perf.fps |
| /onboarding | StepContainer | Step next/prev | Adaptive | Micro-interaction | slide-reveal + fade-in-up | Instant step swap + announce step | Low: distance ↓ | perf.animationStart, perf.fps |
| Modal | Modal | Open/close | Any | Micro-interaction | scale-in + fade | Instant show/hide + focus management | Low: scale ↓, duration ↓ | perf.animationStart |
| Buttons | AnimatedButton | Press | Any | Micro-interaction | button-press | Color/state only | Low: duration ↓ | perf.animationStart |

## Variant Catalog

Standardized tokens and variants to ensure consistent motion across the app.

```ts path=null start=null
export const MotionTokens = {
  durations: { xfast: 0.12, fast: 0.2, base: 0.3, slow: 0.5, xslow: 0.8 },
  easings: {
    default: 'easeOut',
    smooth: [0.22, 1, 0.36, 1],
    bounce: [0.34, 1.56, 0.64, 1],
    linear: 'linear'
  },
  distances: { sm: 4, md: 8, lg: 16 },
  scales: { press: 0.98, lift: 1.02, pulse: 1.05 }
} as const;

export const Variants = {
  fadeInUp: (d = MotionTokens.distances.md) => ({
    hidden: { opacity: 0, y: d },
    visible: { opacity: 1, y: 0, transition: { duration: MotionTokens.durations.base, ease: MotionTokens.easings.smooth } }
  }),
  buttonPress: {
    tap: { scale: MotionTokens.scales.press, transition: { duration: MotionTokens.durations.xfast } }
  },
  hoverLift: {
    rest: { y: 0, boxShadow: 'var(--shadow-sm)' },
    hover: { y: -MotionTokens.distances.sm, scale: MotionTokens.scales.lift, boxShadow: 'var(--shadow-md)', transition: { duration: MotionTokens.durations.fast, ease: MotionTokens.easings.smooth } }
  },
  errorShake: {
    animate: { x: [0, -10, 10, -6, 6, -3, 3, 0], transition: { duration: 0.5, ease: MotionTokens.easings.linear } }
  },
  loadingPulse: {
    animate: { opacity: [1, 0.7, 1], scale: [1, MotionTokens.scales.pulse, 1], transition: { duration: 2, repeat: Infinity, ease: MotionTokens.easings.smooth } }
  }
} as const;
```

Personality adaptations (example):

- Empathetic: prefer smooth easing, slightly longer durations, warm glow.
- Pragmatic: linear/shorter durations, minimal effects.
- Adaptive: choose based on context phase (orientation → empathetic, first_action → pragmatic).

## Trigger/Event Catalog

Canonical app events and how they map to celebrations and interactions.

```ts path=null start=null
type AppEvent =
  | { type: 'document.uploaded'; docId: string }
  | { type: 'guardian.added'; guardianId: string }
  | { type: 'will.created'; willId: string }
  | { type: 'form.submit.success'; formId: string }
  | { type: 'form.submit.error'; formId: string; errors: string[] };

export function onAppEvent(evt: AppEvent) {
  switch (evt.type) {
    case 'document.uploaded':
      celebrationManager.trigger({ type: 'milestone', milestoneId: 'document_upload' });
      break;
    case 'guardian.added':
      celebrationManager.trigger({ type: 'milestone', milestoneId: 'guardian_added' });
      break;
    case 'will.created':
      celebrationManager.trigger({ type: 'milestone', milestoneId: 'will_created' });
      break;
    case 'form.submit.success':
      animationBus.emit({ type: 'animation_start', animationId: `success-${evt.formId}`, timestamp: Date.now() });
      break;
    case 'form.submit.error':
      animationBus.emit({ type: 'animation_start', animationId: `error-${evt.formId}`, timestamp: Date.now(), data: { errors: evt.errors } });
      break;
  }
}
```

Guidance:

- Emit events in submit handlers, after API success/failure, and after domain writes.
- Throttle celebration triggers to at most 1/min per event type and per user.
- Attach telemetry: perf.animationStart, perf.fps, memory deltas during celebrations.

## Reduced Motion Policy

Per-interaction fallbacks when `prefers-reduced-motion` is on or user disables animations:

- success-checkmark: replace with static success icon + ARIA live region message.
- error-shake: replace with error icon/color and inline helper text; no shake.
- hover-lift: replace with border highlight and shadow change; no translate/scale.
- fade-in-up/slide-reveal: replace with instant appearance; no motion.
- loading-pulse: replace with static skeleton/placeholder.
- celebrations: replace with success banner/toast; optional subtle glow only if permitted.
- firefly presence: hide firefly and retain text guidance/microcopy.

Performance modes (high/balanced/low) additionally scale:

- particleCount, glow effects, durations, and trail length (lower on low).

## Acceptance Criteria by Mapped Action

- Upload success (documents):
  - Celebration starts < 150ms after success; duration ≤ 3s; FPS ≥ 55 on mid-range; if reduced motion, show success banner within 150ms.
- Guardian add success:
  - Burst celebration ≤ 2s; FPS ≥ 55; fallback checkmark + toast within 150ms.
- Will created:
  - Hybrid celebration ≤ 3s; FPS ≥ 55; fallback success card within 200ms.
- Form submit success:
  - success-checkmark anim duration ≤ 300ms; reduced motion = static icon with ARIA live announcement.
- Form error:
  - error-shake duration 500ms; reduced motion = error icon + helper text only; ARIA “There are errors”.
- List hover:
  - hover-lift translateY ≤ 2–4px; duration ≤ 200ms; reduced motion = shadow/border only.
- Modal open/close:
  - open/close ≤ 200ms; focus managed; reduced motion = instant show/hide with focus.
