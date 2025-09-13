# UI Contracts: Animation Components

## Component Specifications

### SofiaFirefly Component

#### Props Interface

```typescript
interface SofiaFireflyProps {
  // Visibility control
  isVisible?: boolean;

  // Personality mode
  mode?: 'empathetic' | 'pragmatic' | 'adaptive';

  // Interaction handlers
  onInteraction?: () => void;

  // Targeting system
  targetElement?: string; // CSS selector for guiding

  // Celebration system
  celebrateEvent?: CelebrationEvent;

  // Styling overrides
  className?: string;
  zIndex?: number;

  // Performance options
  performanceMode?: 'high' | 'balanced' | 'low';
}
```

#### Behavior Specifications

**Empathetic Mode:**

- Wandering movement pattern with organic curves
- Visible glow trail with fading points
- Celebration: spiral dance with trail effects
- Guiding: curved path to target with gentle circles

**Pragmatic Mode:**

- Corner positioning with subtle movement
- Minimal glow effects
- Celebration: efficient sparkle burst
- Guiding: direct linear path to target

**Adaptive Mode:**

- Balanced approach based on context
- Moderate visual effects
- Celebration: hybrid of spiral and burst
- Guiding: optimized curved path

#### Accessibility Requirements

- Respects `prefers-reduced-motion`
- Screen reader announcements for state changes
- Keyboard interaction support
- Focus management during animations

### MilestoneCelebration Component

#### MilestoneCelebration Props Interface

```typescript
interface MilestoneCelebrationProps {
  // Content
  milestone: MilestoneData;

  // Display control
  isVisible: boolean;
  autoHide?: boolean;
  duration?: number;

  // Personality adaptation
  personality?: PersonalityMode;

  // Event handlers
  onComplete?: () => void;
  onStart?: () => void;

  // Customization
  className?: string;
  theme?: CelebrationTheme;
}
```

#### MilestoneData Interface

```typescript
interface MilestoneData {
  id: string;
  title: string;
  description: string;
  category: 'completion' | 'document' | 'family' | 'guardian' | 'security';
  significance: 'minor' | 'major' | 'ultimate';
  icon: 'award' | 'crown' | 'gift' | 'heart' | 'shield' | 'star' | 'trophy';
  metadata?: Record<string, any>;
}
```

#### Visual Specifications

**Layout:**

- Full-screen overlay with backdrop blur
- Centered content with max-width constraints
- Particle system for celebration effects
- Progress indicator for multi-step celebrations

**Animation Sequence:**

1. Fade in with scale animation
2. Icon bounce with glow effects
3. Text slide-in with stagger
4. Particle burst on completion
5. Auto-hide with fade out

**Personality Themes:**

- **Empathetic**: Warm colors (emerald), organic particles, gentle animations
- **Pragmatic**: Cool colors (blue), geometric particles, efficient animations
- **Adaptive**: Mixed colors (purple), balanced effects, smooth animations

### AdaptiveProgressRing Component

#### ProgressRing Props Interface

```typescript
interface ProgressRingProps {
  // Progress data
  progress: number; // 0-100

  // Sizing
  size?: 'sm' | 'md' | 'lg';

  // Animation control
  animated?: boolean;
  animationDuration?: number;

  // Display options
  showPercentage?: boolean;
  showLabel?: boolean;
  label?: string;

  // Personality
  personality?: PersonalityMode;

  // Styling
  className?: string;
  strokeWidth?: number;
}
```

#### Size Specifications

```typescript
const PROGRESS_RING_SIZES = {
  sm: { diameter: 60, stroke: 3, fontSize: 12 },
  md: { diameter: 80, stroke: 4, fontSize: 16 },
  lg: { diameter: 120, stroke: 6, fontSize: 20 },
} as const;
```

#### Animation Variants

**Empathetic:**

- Smooth easing with bounce effect
- Glow animation on progress change
- Color transitions with warmth

**Pragmatic:**

- Linear easing for efficiency
- Minimal visual effects
- Direct progress updates

**Adaptive:**

- Balanced easing curves
- Subtle glow effects
- Smooth color transitions

### MicroAnimation Component

#### MicroAnimation Props Interface

```typescript
interface MicroAnimationProps {
  // Animation type
  type: MicroAnimationType;

  // Content
  children: ReactNode;

  // Timing
  delay?: number;
  duration?: number;

  // Control
  disabled?: boolean;
  loop?: boolean | number;

  // Events
  onAnimationStart?: () => void;
  onAnimationComplete?: () => void;
  onAnimationRepeat?: () => void;

  // Styling
  className?: string;
}
```

#### Animation Types

```typescript
type MicroAnimationType =
  | 'button-press'      // Button press feedback
  | 'card-flip'         // Card flip interaction
  | 'error-shake'       // Error state feedback
  | 'fade-in-up'        // Entry animation
  | 'focus-ring'        // Focus indication
  | 'hover-glow'        // Hover state enhancement
  | 'hover-lift'        // Hover elevation
  | 'loading-pulse'     // Loading state
  | 'scale-in'          // Scale entry
  | 'slide-reveal'      // Slide entry
  | 'success-checkmark' // Success feedback
  | 'tap-bounce';       // Touch feedback
```

#### Animation Specifications

**Button Press:**

- Scale down to 0.95 on press
- Shadow reduction for depth
- Quick recovery (150ms)

**Hover Lift:**

- Translate Y: -2px
- Scale: 1.02
- Shadow enhancement
- Smooth transitions

**Error Shake:**

- Horizontal shake: ±10px
- 3-5 oscillations
- Red color indication
- 500ms duration

**Loading Pulse:**

- Opacity: 1 → 0.7 → 1
- Scale: 1 → 1.05 → 1
- Infinite loop
- 2s duration

### AchievementBadge Component

#### AchievementBadge Props Interface

```typescript
interface AchievementBadgeProps {
  // Badge data
  title: string;
  icon: AchievementIcon;
  earned: boolean;

  // Metadata
  date?: Date;
  description?: string;
  progress?: number; // For partial achievements

  // Interaction
  onClick?: () => void;
  clickable?: boolean;

  // Styling
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'premium';
  className?: string;
}
```

#### Visual States

**Unearned State:**

- Grayscale filter
- Reduced opacity
- Placeholder styling
- No interactions

**Earned State:**

- Full color with personality theme
- Glow effects
- Interactive hover states
- Achievement indicator

**Partial State:**

- Progress indication
- Motivational styling
- Preview of earned state

### AnimatedButton Component

#### AnimatedButton Props Interface

```typescript
interface AnimatedButtonProps extends ButtonProps {
  // Animation control
  animationType?: 'press' | 'glow' | 'lift' | 'bounce';
  animationDisabled?: boolean;

  // Loading state
  loading?: boolean;
  loadingText?: string;

  // Success state
  success?: boolean;
  successText?: string;

  // Personality
  personality?: PersonalityMode;

  // Performance
  performanceMode?: 'high' | 'balanced' | 'low';
}
```

#### AnimatedButton Animation Variants

**Press Animation:**

- Scale: 0.98 on click
- Shadow: reduced depth
- Color: slight darkening

**Glow Animation:**

- Box shadow: expanding glow
- Background: subtle brightness increase
- Border: animated focus ring

**Lift Animation:**

- Transform: translateY(-2px)
- Box shadow: enhanced elevation
- Scale: slight increase

### AnimatedCard Component

#### AnimatedCard Props Interface

```typescript
interface AnimatedCardProps extends CardProps {
  // Animation control
  hoverable?: boolean;
  flipOnClick?: boolean;
  slideIn?: boolean;

  // Content
  frontContent?: ReactNode;
  backContent?: ReactNode;

  // Timing
  animationDelay?: number;

  // Personality
  personality?: PersonalityMode;
}
```

#### Interaction States

**Hover State:**

- Elevation increase
- Subtle rotation (1-2 degrees)
- Shadow enhancement

**Click State:**

- Scale reduction
- Shadow minimization
- Quick feedback

**Flip State:**

- 3D rotation on Y-axis
- Content swap animation
- Backface visibility hidden

## Theme System

### Personality Themes

```typescript
interface AnimationTheme {
  name: string;
  personality: PersonalityMode;

  colors: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
    success: string;
    error: string;
  };

  timing: {
    fast: number;    // 150ms
    normal: number;  // 300ms
    slow: number;    // 500ms
  };

  easing: {
    default: string;  // 'easeOut'
    bounce: string;   // 'easeOutBack'
    smooth: string;   // 'easeInOut'
  };

  shadows: {
    subtle: string;
    normal: string;
    strong: string;
    glow: string;
  };
}
```

### Theme Application

```typescript
const EMPATHETIC_THEME: AnimationTheme = {
  name: 'empathetic',
  personality: 'empathetic',
  colors: {
    primary: '#10b981',    // emerald-500
    secondary: '#ecfdf5',  // emerald-50
    accent: '#065f46',     // emerald-800
    glow: 'rgba(16, 185, 129, 0.3)',
    success: '#22c55e',
    error: '#ef4444',
  },
  timing: { fast: 0.15, normal: 0.3, slow: 0.5 },
  easing: {
    default: 'easeOut',
    bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    smooth: 'easeInOut',
  },
  shadows: {
    subtle: '0 1px 2px rgba(0, 0, 0, 0.05)',
    normal: '0 4px 6px rgba(0, 0, 0, 0.1)',
    strong: '0 10px 15px rgba(0, 0, 0, 0.2)',
    glow: '0 0 20px rgba(16, 185, 129, 0.3)',
  },
};
```

## Responsive Design

### Breakpoint Adaptations

```typescript
interface ResponsiveAnimationConfig {
  mobile: {
    scale: number;
    duration: number;
    disabled: boolean;
  };
  tablet: {
    scale: number;
    duration: number;
    disabled: boolean;
  };
  desktop: {
    scale: number;
    duration: number;
    disabled: boolean;
  };
}
```

### Touch Interactions

- Increased touch targets for mobile
- Haptic feedback integration
- Swipe gesture support
- Touch-specific animation variants

## Performance Contracts

### Animation Budgets

```typescript
interface AnimationBudget {
  maxDuration: number;      // Maximum animation duration in ms
  maxMemory: number;        // Maximum memory usage in MB
  maxBundleSize: number;    // Maximum bundle size in KB
  minFps: number;           // Minimum acceptable FPS
  maxDroppedFrames: number; // Maximum dropped frames per minute
}
```

### Performance Monitoring

```typescript
interface ComponentPerformanceMetrics {
  componentName: string;
  renderTime: number;
  animationStartTime: number;
  memoryUsage: number;
  fps: number;
  droppedFrames: number;
}
```

## Accessibility Contracts

### ARIA Support

- `aria-live` regions for dynamic content
- `aria-atomic` for partial updates
- `role` attributes for custom components
- `aria-label` and `aria-describedby` for context

### Keyboard Navigation

- Tab order preservation
- Focus indicators with animation
- Keyboard event handling
- Skip links for complex animations

### Screen Reader Support

- Announcement of animation state changes
- Description of visual animations
- Alternative text for icon animations
- Progress announcements for loading states

## Error Boundaries

### AnimationErrorBoundary Component

```typescript
interface AnimationErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: AnimationError, errorInfo: any) => void;
  showErrorDetails?: boolean;
}

class AnimationErrorBoundary extends Component<AnimationErrorBoundaryProps> {
  // Error handling implementation
}
```

### Error Recovery Strategies

- Fallback to static content
- Reduced animation complexity
- CSS-only animation fallbacks
- Graceful degradation messaging
