# Test Scenarios: Animations & Micro-interactions

Note: See the spec’s Animation Map, Variant Catalog, Trigger/Event Catalog, and Reduced Motion Policy for exact mappings, defaults, and fallbacks.

## 1) Animation Setup - configure animation system

**Objective**: Verify animation system initialization and configuration

**Steps**:

1. Initialize AnimationProvider with default settings
2. Configure animation system with custom AnimationConfig
3. Verify personality mode adaptation
4. Test AccessibilitySettings integration
5. Confirm PerformanceMetrics collection

**Expected Results**:

- Animation system initializes without errors
- Configuration applied correctly
- Personality modes switch appropriately
- Accessibility settings respected
- Performance monitoring active

## 2) Firefly Testing - test firefly animations

**Objective**: Validate firefly animation behavior and personality adaptation

**Steps**:

1. Render SofiaFirefly component with empathetic mode
2. Trigger firefly movement and trail effects
3. Switch to pragmatic mode and verify behavior change
4. Test target guiding functionality
5. Activate celebration mode and observe spiral animation

**Expected Results**:

- Firefly appears and moves organically in empathetic mode
- Movement becomes direct and efficient in pragmatic mode
- Trail effects render correctly
- Target guiding works smoothly
- Celebration animation triggers appropriate emotional response

## 3) Celebration Testing - test celebration effects

**Objective**: Verify milestone celebration system functionality

**Steps**:

1. Create milestone data with different categories
2. Trigger MilestoneCelebration component
3. Test personality-adapted themes (emerald, blue, purple)
4. Verify particle effects and glow animations
5. Test auto-hide functionality and completion callbacks

**Expected Results**:

- Celebration overlay appears with appropriate theming
- Particle effects enhance emotional impact
- Personality colors applied correctly
- Animation completes and triggers callback
- Accessibility announcements work properly

## 4) Micro-interaction Testing - test micro-interactions

**Objective**: Validate micro-interaction library functionality

**Steps**:

1. Test all 12 micro-interaction types
2. Verify button-press, hover-lift, and focus-ring animations
3. Test error-shake and success-checkmark effects
4. Check slide-reveal and fade-in-up transitions
5. Validate card-flip and tap-bounce interactions

**Expected Results**:

- All animation types render and animate correctly
- Timing and easing applied appropriately
- Hover and focus states work as expected
- Error and success feedback is clear
- Transitions are smooth and performant

## 5) Performance Testing - test animation performance

**Objective**: Ensure animations meet performance budgets

**Steps**:

1. Monitor PerformanceMetrics during animation execution
2. Verify 60fps maintenance across animation types
3. Check memory usage stays under 50MB
4. Validate animation start time < 100ms
5. Test bundle size remains under 200KB

**Expected Results**:

- Frame rate stays at 60fps or above
- Memory usage within acceptable limits
- Animation start time meets budget
- Bundle size optimized
- Performance monitoring provides accurate data

## 6) Accessibility Testing - test accessibility compliance

**Objective**: Verify WCAG compliance and accessibility features

**Steps**:

1. Enable reduced motion and verify static fallbacks
2. Test screen reader announcements
3. Check keyboard navigation support
4. Validate focus management during animations
5. Test high contrast mode compatibility

**Expected Results**:

- Reduced motion disables animations appropriately
- Screen readers receive proper announcements
- Keyboard navigation works without animation dependency
- Focus indicators remain visible during animations
- High contrast mode doesn't break functionality

## 7) Mobile Testing - test mobile animations

**Objective**: Ensure animations work properly on mobile devices

**Steps**:

1. Test touch interactions and tap-bounce effects
2. Verify reduced motion on battery-saving mode
3. Check animation performance on slower devices
4. Test swipe gestures and mobile-specific interactions
5. Validate viewport adaptation and responsive behavior

**Expected Results**:

- Touch interactions feel natural and responsive
- Battery optimization reduces animation complexity
- Performance acceptable on mid-range mobile devices
- Gestures work smoothly with animations
- Responsive design maintains animation quality

## 8) Error Handling - test animation error handling

**Objective**: Verify robust error handling and fallback mechanisms

**Steps**:

1. Trigger animation errors and verify recovery
2. Test invalid configuration handling
3. Check performance budget violations
4. Validate accessibility violation detection
5. Test browser compatibility fallbacks

**Expected Results**:

- Errors handled gracefully without breaking UI
- Invalid configurations use safe defaults
- Performance issues trigger appropriate warnings
- Accessibility violations logged and addressed
- Fallback animations work in unsupported browsers

## 9) User Experience - test emotional impact

**Objective**: Validate emotional design effectiveness

**Steps**:

1. Test complete user journey with animations
2. Measure emotional response to celebration effects
3. Verify personality adaptation enhances user experience
4. Check animation timing supports emotional flow
5. Validate micro-interactions provide appropriate feedback

**Expected Results**:

- Animations enhance rather than distract from user experience
- Celebration effects create positive emotional responses
- Personality adaptation feels natural and helpful
- Timing supports emotional journey pacing
- Feedback feels immediate and satisfying

## 10) End-to-End Test - complete animation workflow

**Objective**: Test complete animation system integration

**Steps**:

1. Initialize full animation system with all providers
2. Navigate through complete user flow with animations
3. Trigger multiple celebration events
4. Test personality mode switching during use
5. Verify performance monitoring throughout session
6. Check accessibility features work end-to-end

**Expected Results**:

- All animation components work together seamlessly
- User journey enhanced by coordinated animations
- Multiple celebrations don't conflict or overwhelm
- Personality switching works across all components
- Performance remains stable throughout session
- Accessibility features work in complete workflow

## 11) Storybook Matrix Review

Objective: Validate stories across personality x reducedMotion x performanceMode for key components.

Steps:
1. Open Storybook and view SofiaFirefly stories for 3 personalities with reducedMotion on/off and performanceMode high/low.
2. Inspect MilestoneCelebration stories across categories and significance.
3. Verify AdaptiveProgressRing sizes and animated states.
4. Validate MicroAnimation stories for all 12 types.

Expected Results:
- Stories render with correct variants and fallbacks
- Reduced-motion toggles apply policy from spec
- Performance modes scale effects as defined

## 12) Event Bus Trigger Simulation

Objective: Verify Trigger/Event Catalog mapping.

Steps:
1. Simulate AppEvent: document.uploaded, guardian.added, will.created.
2. Verify celebrations trigger; throttle policy respected.
3. Simulate form.submit.success/error with form IDs; verify micro-interactions.

Expected Results:
- Celebrations/micro-interactions fire correctly
- Throttling prevents spam
- Telemetry keys recorded in logs (mock/sandbox)

## 13) Reduced Motion Policy Validation

Objective: Confirm fallbacks per interaction.

Steps:
1. Enable prefers-reduced-motion and app reducedMotion setting.
2. Trigger hover-lift, error-shake, fade-in-up, loading-pulse, celebrations.

Expected Results:
- Motion replaced with static/state-based alternatives per policy
- ARIA announcements present where specified

## 14) Performance Mode (Device Class) Validation

Objective: Validate high/balanced/low behavior.

Steps:
1. Emulate device classes and toggle performanceMode.
2. Verify particle counts, durations, glow/trail changes.

Expected Results:
- Effects scale per perf mode matrix
- FPS meets targets on mid-range devices

## Phase 7 Emotional Core Testing

### 11) Night Sky Landing Page Test

**Objective**: Validate night sky landing page animations meet Phase 7 requirements

**Steps**:

1. Load night sky landing page on various devices
2. Verify stars, parallax, and firefly glow animations
3. Test lazy motion on low-end devices
4. Check reduced motion support disables animations
5. Measure performance against 60fps target
6. Assess emotional impact through user feedback

**Expected Results**:

- Subtle depth and meaning conveyed through restrained motion
- Performance meets 60fps target with accessible budgets
- Lazy motion activates appropriately on low-end devices
- Reduced motion provides static but meaningful experience
- Emotional impact creates calm, courage, and care

### 12) 3-Act Onboarding Animation Test

**Objective**: Test 3-act onboarding flow animations for anxiety reduction

**Steps**:

1. Start 3-act onboarding flow
2. Verify Act I (Chaos) animations reduce anxiety
3. Check Act II (Order) animations celebrate clarity
4. Test Act III (Legacy) animations create meaningful moments
5. Measure user anxiety levels before/after
6. Validate progress cues and ceremony elements

**Expected Results**:

- Act I gently guides without overwhelming
- Act II provides clear progress celebration
- Act III creates meaningful legacy moments
- Anxiety reduction measurable through user feedback
- Progress cues remain coherent throughout
- Ceremony elements transform friction into meaningful experiences

### 13) Sofia Firefly Presence Test

**Objective**: Validate Sofia firefly presence and guided dialog surface

**Steps**:

1. Activate Sofia firefly on landing page
2. Test personality-based movement patterns
3. Verify context-sensing phases (welcome → orientation → action → reflection)
4. Check conversational scaffolding and empathic microcopy
5. Test guided dialog surface interactions
6. Measure user engagement and helpfulness ratings

**Expected Results**:

- Firefly provides gentle, empathic presence
- Movement adapts to personality mode appropriately
- Context-sensing creates relevant guidance phases
- Conversational tone feels human and reassuring
- Dialog surface integrates seamlessly
- User ratings show ≥70% helpfulness (Phase 7 target)
