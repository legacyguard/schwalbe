# Data Model: Animations & Micro-interactions

## Phase 7 — Emotional Core MVP Entities

### NightSkyLandingPage

```typescript
export interface NightSkyLandingPage {
  // Visual elements
  stars: StarField[]; // Animated star field
  parallaxLayers: ParallaxLayer[]; // Depth parallax effects
  fireflyGlow: FireflyGlow[]; // Subtle firefly glow trails

  // Performance controls
  lazyMotion: boolean; // Lazy loading for low-end devices
  reducedMotion: boolean; // Respects user preferences
  performanceMode: 'high' | 'balanced' | 'low'; // Adaptive quality

  // Accessibility
  screenReaderDescription: string; // Alternative description
  highContrast: boolean; // High contrast support
}
```

### ThreeActOnboarding

```typescript
export interface ThreeActOnboarding {
  // Act structure
  actI: OnboardingAct; // Chaos → Order (gather what matters)
  actII: OnboardingAct; // Order → Clarity (vault taking shape)
  actIII: OnboardingAct; // Legacy → Ceremony (preparing with love)

  // Emotional tracking
  anxietyLevel: AnxietyLevel; // User anxiety measurement
  progressMarkers: ProgressMarker[]; // Clear progress cues
  ceremonyMoments: CeremonyMoment[]; // Meaningful moments
}

export interface OnboardingAct {
  title: string;
  description: string;
  animations: EmotionalAnimation[];
  anxietyReduction: number; // Expected anxiety reduction
  completionCelebration: CelebrationEvent;
}
```

### SofiaFireflyPresence

```typescript
export interface SofiaFireflyPresence {
  // Personality modes
  personality: PersonalityMode; // empathetic | pragmatic | adaptive
  movement: FireflyMovement; // wandering | corner | guided
  emotionalState: EmotionalState; // calm | excited | anxious | confident

  // Interaction phases
  contextPhase: ContextPhase; // welcome → orientation → action → reflection
  guidance: GuidanceScaffolding; // Conversational support
  microcopy: EmpathicMicrocopy; // Human tone messaging
}

export type ContextPhase = 'welcome' | 'orientation' | 'first_action' | 'reflection';
```

## Core Entities

### AnimationConfig

```typescript
export interface AnimationConfig {
  // Timing settings
  duration: number; // Animation duration in seconds
  delay: number; // Delay before animation starts
  ease: string; // Easing function for animation

  // Visual scaling
  scale: number; // Scale multiplier for animations
  intensity: 'subtle' | 'normal' | 'intense'; // Animation intensity level

  // Personality adaptation
  personality: PersonalityMode; // Current personality mode

  // Performance settings
  reducedMotion: boolean; // Respect reduced motion preferences
  performanceMode: 'high' | 'balanced' | 'low'; // Performance optimization level

  // Accessibility settings
  highContrast: boolean; // High contrast mode support
  screenReader: boolean; // Screen reader compatibility
}

export type PersonalityMode = 'empathetic' | 'pragmatic' | 'adaptive';
```

### FireflyState

```typescript
export interface FireflyState {
  // Visibility and positioning
  isVisible: boolean; // Whether firefly is currently visible
  position: FireflyPosition; // Current x,y coordinates
  targetElement?: string; // CSS selector for guided element

  // Celebration system
  celebrateEvent?: CelebrationEvent; // Current celebration trigger

  // Personality and behavior
  personality: PersonalityMode; // Active personality mode
  isIdle: boolean; // Whether firefly is in idle state
  trailPoints: FireflyPosition[]; // Trail effect coordinates
}

export interface FireflyPosition {
  x: number; // X coordinate
  y: number; // Y coordinate
}
```

### CelebrationEvent

```typescript
export type CelebrationEvent =
  | 'document_upload' // Document successfully uploaded
  | 'guardian_added' // New guardian added to system
  | 'milestone' // Generic milestone achievement
  | 'will_created' // Will document created
  | 'family_invited' // Family member invited
  | null; // No active celebration
```

### MicroInteraction

```typescript
export interface MicroInteraction {
  // Animation properties
  type: MicroAnimationType; // Type of micro-interaction
  children: ReactNode; // React children to animate
  className?: string; // Additional CSS classes

  // Timing controls
  delay?: number; // Animation delay in seconds
  disabled?: boolean; // Whether animation is disabled

  // Event handlers
  onAnimationComplete?: () => void; // Completion callback
}

export type MicroAnimationType =
  | 'button-press' // Button press feedback
  | 'card-flip' // Card flip interaction
  | 'error-shake' // Error state shake
  | 'fade-in-up' // Fade in from bottom
  | 'focus-ring' // Focus ring animation
  | 'hover-glow' // Hover glow effect
  | 'hover-lift' // Hover lift effect
  | 'loading-pulse' // Loading pulse animation
  | 'scale-in' // Scale in animation
  | 'slide-reveal' // Slide reveal effect
  | 'success-checkmark' // Success checkmark
  | 'tap-bounce'; // Touch bounce effect
```

### PerformanceMetrics

```typescript
export interface PerformanceMetrics {
  // Frame rate metrics
  averageFps: number; // Average frames per second
  droppedFrames: number; // Number of dropped frames

  // Memory usage
  memoryUsage: number; // Current memory usage in MB

  // Timing metrics
  animationStartTime: number; // Time to start animation in ms

  // Bundle metrics
  bundleSize: number; // Animation bundle size in KB
}
```

### AccessibilitySettings

```typescript
export interface AccessibilitySettings {
  // Motion preferences
  reducedMotion: boolean; // Respect prefers-reduced-motion
  highContrast: boolean; // High contrast mode enabled

  // Assistive technology
  screenReader: boolean; // Screen reader compatibility mode

  // Animation preferences
  animationIntensity: 'low' | 'medium' | 'high'; // User preferred intensity
  personalityMode: PersonalityMode; // Preferred personality mode

  // Notification preferences
  celebrationEnabled: boolean; // Enable celebration animations
  soundEnabled: boolean; // Enable sound effects
}
```

## Entity Relations

### AnimationConfig Relations

```text
AnimationConfig
├── personality: PersonalityMode
├── reducedMotion: boolean (links to AccessibilitySettings.reducedMotion)
├── performanceMode: string (affects PerformanceMetrics)
└── highContrast: boolean (links to AccessibilitySettings.highContrast)
```

### FireflyState Relations

```text
FireflyState
├── position: FireflyPosition
├── celebrateEvent: CelebrationEvent (triggers celebration animations)
├── personality: PersonalityMode (affects movement patterns)
├── trailPoints: FireflyPosition[] (visual effect data)
└── isIdle: boolean (affects animation state)
```

### MicroInteraction Relations

```text
MicroInteraction
├── type: MicroAnimationType (determines animation behavior)
├── delay: number (timing control)
├── disabled: boolean (respects AccessibilitySettings.reducedMotion)
└── onAnimationComplete: function (event callback)
```

### PerformanceMetrics Relations

```text
PerformanceMetrics
├── averageFps: number (monitors animation smoothness)
├── memoryUsage: number (tracks memory consumption)
├── animationStartTime: number (measures responsiveness)
└── bundleSize: number (affects loading performance)
```

### AccessibilitySettings Relations

```text
AccessibilitySettings
├── reducedMotion: boolean (affects all animations)
├── highContrast: boolean (modifies color schemes)
├── screenReader: boolean (enables announcements)
├── animationIntensity: string (scales animation effects)
├── personalityMode: PersonalityMode (sets default personality)
├── celebrationEnabled: boolean (controls celebration system)
└── soundEnabled: boolean (enables audio feedback)
```

## Data Flow

### Animation Lifecycle

1. **Configuration** → AnimationConfig loaded from user preferences
2. **Accessibility Check** → AccessibilitySettings applied to config
3. **Performance Check** → PerformanceMetrics monitored during execution
4. **Animation Execution** → MicroInteraction or FireflyState activated
5. **Celebration Trigger** → CelebrationEvent fired based on user actions
6. **Performance Update** → PerformanceMetrics updated with execution data

### State Management Flow

```text
User Action → AccessibilitySettings Check → AnimationConfig Update → Animation Execution → PerformanceMetrics Update → UI Feedback
```

### Personality Adaptation Flow

```text
Sofia AI Personality Change → PersonalityMode Update → AnimationConfig Adaptation → FireflyState Update → MicroInteraction Style Change
```

## Validation Rules

### AnimationConfig Validation

- `duration`: Must be between 0.1 and 10 seconds
- `delay`: Must be between 0 and 5 seconds
- `scale`: Must be between 0.5 and 2.0
- `personality`: Must be valid PersonalityMode
- `intensity`: Must be 'subtle', 'normal', or 'intense'

### FireflyState Validation

- `position`: x,y coordinates must be within viewport bounds
- `trailPoints`: Maximum 20 points to prevent memory issues
- `personality`: Must match current AnimationConfig personality
- `targetElement`: Must be valid CSS selector if provided

### PerformanceMetrics Validation

- `averageFps`: Must be between 0 and 120
- `memoryUsage`: Must be reasonable for animation system (< 100MB)
- `animationStartTime`: Should be < 100ms for good UX
- `bundleSize`: Should be < 200KB for web performance

## Migration & Compatibility

### Hollywood to Schwalbe Mapping

```typescript
// Type mappings for migration
export const HollywoodToSchwalbeTypes = {
  'CommunicationStyle': 'PersonalityMode',
  'AnimationPreferences': 'AnimationConfig',
  'FireflyData': 'FireflyState',
  'CelebrationTrigger': 'CelebrationEvent',
  'InteractionConfig': 'MicroInteraction',
  'PerfStats': 'PerformanceMetrics',
  'A11yPrefs': 'AccessibilitySettings',
} as const;
```

### Backward Compatibility

- Legacy Hollywood components can be wrapped with compatibility layers
- Animation preferences automatically migrate to new format
- Performance metrics collected from both systems during transition
- Accessibility settings preserved across migration

## Firefly System

### Firefly State

```typescript
export interface FireflyState {
  isVisible: boolean;
  position: FireflyPosition;
  targetElement?: string;
  celebrateEvent?: CelebrationEvent;
  personality: PersonalityMode;
  isIdle: boolean;
  trailPoints: FireflyPosition[];
}

export interface FireflyPosition {
  x: number;
  y: number;
}

export type CelebrationEvent =
  | 'document_upload'
  | 'guardian_added'
  | 'milestone'
  | 'will_created'
  | 'family_invited'
  | null;
```

### Firefly Configuration

```typescript
export interface FireflyConfig {
  // Movement
  idleMovement: 'wandering' | 'corner' | 'guided';
  celebrationStyle: 'spiral' | 'burst' | 'subtle';

  // Appearance
  glowIntensity: number;
  trailLength: number;
  wingFlutter: boolean;

  // Personality adaptations
  empathetic: FireflyPersonalityConfig;
  pragmatic: FireflyPersonalityConfig;
  adaptive: FireflyPersonalityConfig;
}

export interface FireflyPersonalityConfig {
  movementSpeed: number;
  glowColor: string;
  trailOpacity: number;
  celebrationDuration: number;
}
```

## Celebration System

### Milestone Data

```typescript
export interface MilestoneData {
  id: string;
  title: string;
  description: string;
  category: MilestoneCategory;
  significance: MilestoneSignificance;
  icon: AchievementIcon;
  metadata?: Record<string, any>;
}

export type MilestoneCategory =
  | 'completion'
  | 'document'
  | 'family'
  | 'guardian'
  | 'security';

export type MilestoneSignificance =
  | 'minor'
  | 'major'
  | 'ultimate';

export type AchievementIcon =
  | 'award'
  | 'crown'
  | 'gift'
  | 'heart'
  | 'shield'
  | 'star'
  | 'trophy';
```

### Celebration Configuration

```typescript
export interface CelebrationConfig {
  autoHide: boolean;
  duration: number;
  personality: PersonalityMode;
  particleCount: number;
  soundEnabled: boolean;
  hapticFeedback: boolean;
}
```

## Progress Indicators

### Progress Ring Configuration

```typescript
export interface ProgressRingConfig {
  progress: number; // 0-100
  size: 'sm' | 'md' | 'lg';
  animated: boolean;
  showPercentage: boolean;
  strokeWidth?: number;
  personality: PersonalityMode;
}

export interface ProgressRingTheme {
  strokeColor: string;
  backgroundColor: string;
  textColor: string;
  glowEffect: boolean;
}
```

### Achievement Badge Data

```typescript
export interface AchievementBadgeData {
  title: string;
  icon: AchievementIcon;
  earned: boolean;
  date?: Date;
  description?: string;
  progress?: number; // for partial achievements
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}
```

## Animation System

### Global Animation State

```typescript
export interface AnimationSystemState {
  globalConfig: AnimationConfig;
  activeAnimations: Set<string>;
  performanceMetrics: PerformanceMetrics;
  userPreferences: UserAnimationPreferences;
}

export interface UserAnimationPreferences {
  reducedMotion: boolean;
  animationIntensity: 'low' | 'medium' | 'high';
  personalityMode: PersonalityMode;
  celebrationEnabled: boolean;
  soundEnabled: boolean;
}
```

### Performance Metrics

```typescript
export interface PerformanceMetrics {
  averageFps: number;
  droppedFrames: number;
  memoryUsage: number;
  animationStartTime: number;
  bundleSize: number;
}
```

## Context Providers

### Animation Context

```typescript
export interface AnimationContextValue {
  config: AnimationConfig;
  personality: PersonalityMode;
  shouldReduceMotion: boolean;
  updateConfig: (updates: Partial<AnimationConfig>) => void;
  setPersonality: (mode: PersonalityMode) => void;
}
```

### Firefly Context

```typescript
export interface FireflyContextValue {
  state: FireflyState;
  showFirefly: () => void;
  hideFirefly: () => void;
  guideToElement: (selector: string) => void;
  celebrate: (event: CelebrationEvent) => void;
  setPersonality: (mode: PersonalityMode) => void;
}
```

## Event System

### Animation Events

```typescript
export interface AnimationEvent {
  type: AnimationEventType;
  animationId: string;
  timestamp: number;
  data?: any;
}

export type AnimationEventType =
  | 'animation_start'
  | 'animation_complete'
  | 'animation_cancel'
  | 'performance_issue'
  | 'accessibility_violation';
```

### Celebration Events

```typescript
export interface CelebrationEventData {
  type: CelebrationEventType;
  milestone?: MilestoneData;
  context?: string;
  userId?: string;
}

export type CelebrationEventType =
  | 'milestone_achieved'
  | 'celebration_start'
  | 'celebration_complete'
  | 'celebration_skip';
```

## Configuration Files

### Animation Themes

```typescript
export interface AnimationTheme {
  name: string;
  personality: PersonalityMode;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
  };
  timing: {
    fast: number;
    normal: number;
    slow: number;
  };
  easing: {
    default: string;
    bounce: string;
    smooth: string;
  };
}
```

### Performance Budgets

```typescript
export interface PerformanceBudget {
  maxBundleSize: number; // in KB
  maxMemoryUsage: number; // in MB
  minFps: number;
  maxStartTime: number; // in ms
  maxDroppedFrames: number;
}
```

## Integration Contracts

### With Sofia AI

```typescript
export interface SofiaAnimationIntegration {
  getCurrentPersonality: () => PersonalityMode;
  onPersonalityChange: (callback: (mode: PersonalityMode) => void) => () => void;
  triggerCelebration: (event: CelebrationEvent) => void;
  getEmotionalState: () => EmotionalState;
}

export type EmotionalState =
  | 'calm'
  | 'excited'
  | 'anxious'
  | 'confident'
  | 'overwhelmed';
```

### With UI Components

```typescript
export interface AnimatedComponentProps {
  animationType?: MicroAnimationType;
  animationDisabled?: boolean;
  animationDelay?: number;
  onAnimationStart?: () => void;
  onAnimationComplete?: () => void;
}
```

## Validation Schemas

### Animation Configuration Schema

```typescript
import { z } from 'zod';

export const AnimationConfigSchema = z.object({
  duration: z.number().min(0).max(10),
  delay: z.number().min(0).max(5),
  ease: z.string(),
  scale: z.number().min(0.5).max(2),
  intensity: z.enum(['subtle', 'normal', 'intense']),
  personality: z.enum(['empathetic', 'pragmatic', 'adaptive']),
  reducedMotion: z.boolean(),
  performanceMode: z.enum(['high', 'balanced', 'low']),
  highContrast: z.boolean(),
  screenReader: z.boolean(),
});
```

### Milestone Data Schema

```typescript
export const MilestoneDataSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(['completion', 'document', 'family', 'guardian', 'security']),
  significance: z.enum(['minor', 'major', 'ultimate']),
  icon: z.enum(['award', 'crown', 'gift', 'heart', 'shield', 'star', 'trophy']),
  metadata: z.record(z.any()).optional(),
});
```

## Migration Mappings

### Hollywood to Schwalbe

```typescript
export const ComponentMapping = {
  'SofiaFirefly': '@schwalbe/ui/components/animations/SofiaFirefly',
  'MilestoneCelebration': '@schwalbe/ui/components/celebrations/MilestoneCelebration',
  'MicroInteractionSystem': '@schwalbe/ui/components/animations/MicroAnimation',
  'AdaptiveProgressRing': '@schwalbe/ui/components/animations/AdaptiveProgressRing',
  'AchievementBadge': '@schwalbe/ui/components/celebrations/AchievementBadge',
} as const;

export const TypeMapping = {
  'CommunicationStyle': 'PersonalityMode',
  'UserPreferences': 'UserAnimationPreferences',
  'AnimationType': 'MicroAnimationType',
} as const;
```

## Error Handling

### Animation Errors

```typescript
export class AnimationError extends Error {
  constructor(
    message: string,
    public code: AnimationErrorCode,
    public context?: any
  ) {
    super(message);
    this.name = 'AnimationError';
  }
}

export type AnimationErrorCode =
  | 'PERFORMANCE_BUDGET_EXCEEDED'
  | 'ANIMATION_NOT_FOUND'
  | 'INVALID_CONFIGURATION'
  | 'ACCESSIBILITY_VIOLATION'
  | 'BROWSER_NOT_SUPPORTED';
```

### Recovery Strategies

```typescript
export interface ErrorRecoveryStrategy {
  errorCode: AnimationErrorCode;
  fallback: () => void;
  retry: () => Promise<void>;
  report: boolean;
}
