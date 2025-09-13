# API Contracts: Animation System

## Animation System API

### AnimationSystem Class

```typescript
class AnimationSystem {
  // Configuration
  static configure(config: AnimationConfig): void;
  static getConfig(personality?: PersonalityMode): AnimationConfig;

  // Performance monitoring
  static shouldReduceMotion(): boolean;
  static getPerformanceMetrics(): PerformanceMetrics;

  // Utility methods
  static setDebugMode(enabled: boolean): void;
  static getDebugInfo(): DebugInfo;
}
```

### Animation Context Provider

```typescript
interface AnimationProviderProps {
  children: ReactNode;
  config?: Partial<AnimationConfig>;
  personality?: PersonalityMode;
}

const AnimationProvider: FC<AnimationProviderProps> = ({ children, ... }) => { ... };
```

## Firefly System API

### FireflyContext

```typescript
interface FireflyContextValue {
  // State
  readonly state: FireflyState;

  // Actions
  showFirefly(): void;
  hideFirefly(): void;
  guideToElement(selector: string): void;
  celebrate(event: CelebrationEvent): void;
  setPersonality(mode: PersonalityMode): void;

  // Events
  onStateChange(callback: (state: FireflyState) => void): () => void;
}
```

### SofiaFirefly Component

```typescript
interface SofiaFireflyProps {
  // Basic props
  isVisible?: boolean;
  mode?: PersonalityMode;
  onInteraction?: () => void;

  // Targeting
  targetElement?: string; // CSS selector

  // Celebrations
  celebrateEvent?: CelebrationEvent;

  // Styling
  className?: string;
  zIndex?: number;
}

const SofiaFirefly: FC<SofiaFireflyProps> = (props) => { ... };
```

## Celebration System API

### MilestoneCelebration Component

```typescript
interface MilestoneCelebrationProps {
  milestone: MilestoneData;
  isVisible: boolean;
  onComplete?: () => void;
  autoHide?: boolean;
  duration?: number;
  personality?: PersonalityMode;
}

const MilestoneCelebration: FC<MilestoneCelebrationProps> = (props) => { ... };
```

### AdaptiveProgressRing Component

```typescript
interface ProgressRingProps {
  progress: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  showPercentage?: boolean;
  strokeWidth?: number;
  personality?: PersonalityMode;
  className?: string;
}

const AdaptiveProgressRing: FC<ProgressRingProps> = (props) => { ... };
```

## Micro-interactions API

### MicroAnimation Component

```typescript
interface MicroAnimationProps {
  type: MicroAnimationType;
  children: ReactNode;
  className?: string;
  delay?: number;
  disabled?: boolean;
  onAnimationComplete?: () => void;
}

const MicroAnimation: FC<MicroAnimationProps> = (props) => { ... };
```

### Specialized Components

```typescript
interface AnimatedButtonProps extends ButtonProps {
  animationType?: 'press' | 'glow' | 'lift';
  disabled?: boolean;
}

const AnimatedButton: FC<AnimatedButtonProps> = (props) => { ... };

interface AnimatedCardProps extends CardProps {
  hoverable?: boolean;
  flipOnClick?: boolean;
}

const AnimatedCard: FC<AnimatedCardProps> = (props) => { ... };
```

## Hook APIs

### useMicroInteraction Hook

```typescript
interface UseMicroInteractionOptions {
  type: MicroAnimationType;
  disabled?: boolean;
  delay?: number;
}

interface UseMicroInteractionReturn {
  animationProps: MotionProps;
  isAnimating: boolean;
  triggerAnimation: () => void;
}

function useMicroInteraction(options: UseMicroInteractionOptions): UseMicroInteractionReturn;
```

### useAdaptiveAnimation Hook

```typescript
interface UseAdaptiveAnimationOptions {
  personality?: PersonalityMode;
  reducedMotion?: boolean;
  performanceMode?: 'high' | 'balanced' | 'low';
}

interface UseAdaptiveAnimationReturn {
  config: AnimationConfig;
  variants: Variants;
  shouldAnimate: boolean;
}

function useAdaptiveAnimation(options?: UseAdaptiveAnimationOptions): UseAdaptiveAnimationReturn;
```

## Event System API

### Animation Events

```typescript
type AnimationEventType =
  | 'animation_start'
  | 'animation_complete'
  | 'animation_cancel'
  | 'performance_warning'
  | 'accessibility_violation';

interface AnimationEvent {
  type: AnimationEventType;
  animationId: string;
  timestamp: number;
  data?: any;
}

interface AnimationEventEmitter {
  on(event: AnimationEventType, callback: (event: AnimationEvent) => void): () => void;
  emit(event: AnimationEvent): void;
}
```

### Celebration Events

```typescript
interface CelebrationEventData {
  type: 'milestone' | 'achievement' | 'progress';
  milestoneId?: string;
  userId?: string;
  context?: Record<string, any>;
}

interface CelebrationManager {
  trigger(event: CelebrationEventData): Promise<void>;
  onComplete(callback: (event: CelebrationEventData) => void): () => void;
}
```

## Configuration API

### Animation Configuration

```typescript
interface AnimationConfig {
  // Timing
  duration: number;
  delay: number;
  ease: string;

  // Visual
  scale: number;
  intensity: 'subtle' | 'normal' | 'intense';

  // Behavior
  personality: PersonalityMode;
  reducedMotion: boolean;
  performanceMode: 'high' | 'balanced' | 'low';

  // Accessibility
  highContrast: boolean;
  screenReader: boolean;
}

interface ConfigManager {
  get(): AnimationConfig;
  update(config: Partial<AnimationConfig>): void;
  reset(): void;
  onChange(callback: (config: AnimationConfig) => void): () => void;
}
```

## Performance API

### Telemetry API (Monitoring Integration)

```typescript
interface PerfEvent {
  name: 'perf.animationStart' | 'perf.fps' | 'perf.memoryDelta';
  animationId?: string;
  value: number;
  meta?: Record<string, any>;
  timestamp: number;
}

interface TelemetryReporter {
  emit(event: PerfEvent): void;
  flush(): Promise<void>;
}
```

### Performance Monitoring

```typescript
interface PerformanceMetrics {
  averageFps: number;
  droppedFrames: number;
  memoryUsage: number;
  animationStartTime: number;
  bundleSize: number;
}

interface PerformanceMonitor {
  startTracking(animationId: string): void;
  stopTracking(animationId: string): PerformanceMetrics;
  getAverageMetrics(): PerformanceMetrics;
  onPerformanceIssue(callback: (issue: PerformanceIssue) => void): () => void;
}

interface PerformanceIssue {
  type: 'low_fps' | 'high_memory' | 'slow_start';
  animationId: string;
  metrics: PerformanceMetrics;
  threshold: number;
}
```

## Accessibility API

### Accessibility Manager

```typescript
interface AccessibilityManager {
  shouldReduceMotion(): boolean;
  isHighContrast(): boolean;
  isScreenReaderActive(): boolean;
  announce(message: string, priority?: 'polite' | 'assertive'): void;
  focus(element: HTMLElement): void;
}

interface AccessibilityConfig {
  reducedMotion: boolean;
  highContrast: boolean;
  screenReader: boolean;
  animationDuration: number;
  focusRing: boolean;
}
```

## Integration APIs

### Sofia AI Integration

```typescript
interface SofiaAnimationIntegration {
  getCurrentPersonality(): PersonalityMode;
  onPersonalityChange(callback: (mode: PersonalityMode) => void): () => void;
  triggerCelebration(event: CelebrationEvent): void;
  getEmotionalState(): EmotionalState;
}

type EmotionalState = 'calm' | 'excited' | 'anxious' | 'confident' | 'overwhelmed';
```

### UI Component Integration

```typescript
interface AnimatedComponentProps {
  // Animation control
  animationType?: MicroAnimationType | MicroAnimationType[];
  animationDisabled?: boolean;
  animationDelay?: number;

  // Callbacks
  onAnimationStart?: () => void;
  onAnimationComplete?: () => void;
  onAnimationCancel?: () => void;

  // Performance
  performanceBudget?: {
    maxDuration?: number;
    maxMemory?: number;
  };
}
```

## Error Handling API

### Animation Errors

```typescript
class AnimationError extends Error {
  constructor(
    message: string,
    public code: AnimationErrorCode,
    public context?: any
  ) {
    super(message);
    this.name = 'AnimationError';
  }
}

type AnimationErrorCode =
  | 'CONFIGURATION_INVALID'
  | 'PERFORMANCE_BUDGET_EXCEEDED'
  | 'ANIMATION_NOT_SUPPORTED'
  | 'ACCESSIBILITY_VIOLATION'
  | 'DEPENDENCY_MISSING';
```

### Error Recovery

```typescript
interface ErrorRecoveryStrategy {
  canRecover(error: AnimationError): boolean;
  recover(error: AnimationError): Promise<void>;
  getFallback(): ReactNode;
}

interface ErrorHandler {
  handle(error: AnimationError): Promise<void>;
  registerStrategy(code: AnimationErrorCode, strategy: ErrorRecoveryStrategy): void;
}

interface AnimationAnalytics {
  trackPerformance(metric: PerformanceMetric): void;
  trackUserInteraction(interaction: AnimationInteraction): void;
  trackEmotionalImpact(impact: EmotionalImpactData): void;
  generateReport(timeRange: TimeRange): AnalyticsReport;
}

interface AnimationMonitoring {
  startFPSMonitoring(): FPSMonitor;
  startMemoryMonitoring(): MemoryMonitor;
  startErrorTracking(): ErrorTracker;
  getPerformanceAlerts(): PerformanceAlert[];
  getHealthStatus(): SystemHealth;
}
```

## Testing APIs

### Animation Testing Utilities

```typescript
interface AnimationTestUtils {
  // Rendering
  renderWithAnimationProvider(component: ReactElement): RenderResult;

  // Time control
  advanceTime(ms: number): Promise<void>;
  waitForAnimation(animationId?: string): Promise<void>;

  // Performance testing
  measurePerformance(operation: () => void): Promise<PerformanceMetrics>;

  // Accessibility testing
  checkAccessibility(component: ReactElement): Promise<AccessibilityReport>;
}

interface AccessibilityReport {
  violations: AccessibilityViolation[];
  score: number;
  recommendations: string[];
}
