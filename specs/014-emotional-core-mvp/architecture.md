# Emotional Core MVP - Architecture

## System Overview

The Emotional Core MVP architecture is designed to deliver a deeply resonant user experience that transforms legacy planning from anxiety-inducing to meaningful and celebratory. Built on Next.js and React, the system emphasizes performance, accessibility, and measurable emotional impact through carefully orchestrated visual and interactive elements.

## Core Architecture Principles

### 🎭 Emotional Design First

- **Context-Aware Interactions**: System adapts to user emotional state and progress
- **Performance with Restraint**: 60fps animations that don't compromise accessibility
- **Progressive Enhancement**: Core functionality works without animations
- **Inclusive Design**: WCAG 2.1 AA compliance with emotional sensitivity

### 🏗️ Component-Driven Architecture

- **Modular Animation System**: Reusable animation components with performance budgets
- **Emotional State Management**: Centralized emotional context tracking
- **Guided Experience Flow**: Structured 3-act onboarding with flexible navigation
- **Responsive Design**: Mobile-first with emotional design scaling

### 📊 Measurable Emotional Impact

- **Anxiety Tracking**: Pre/post emotional state measurement
- **Engagement Metrics**: Session depth and interaction quality
- **Conversion Optimization**: Emotional funnel analysis
- **A/B Testing Framework**: Emotional design variation testing

## Component Architecture

### Frontend Layer (apps/web-next)

#### NightSkyAnimation Component

```typescript
// High-performance night sky with stars and parallax
interface NightSkyAnimationProps {
  width: number;
  height: number;
  starCount?: number;
  enableParallax?: boolean;
  reducedMotion?: boolean;
  onPerformanceIssue?: (issue: PerformanceIssue) => void;
}

// Key Features:
// - Canvas/WebGL rendering with fallback
// - Performance monitoring and adaptation
// - Accessibility-compliant motion preferences
// - Lazy loading for low-end devices
```

#### SofiaFirefly Component

```typescript
// Context-aware firefly presence system
interface SofiaFireflyProps {
  behavior: FireflyBehavior;
  position: Position;
  emotionalContext: EmotionalContext;
  onInteraction?: (interaction: FireflyInteraction) => void;
}

// Key Features:
// - State-based behavior (idle, guiding, celebrating)
// - Emotional context sensing
// - Screen reader announcements
// - Performance-optimized animations
```

#### GuidedDialogSurface Component

```typescript
// Non-LLM guided conversation interface
interface GuidedDialogSurfaceProps {
  phase: OnboardingPhase;
  userProgress: UserProgress;
  emotionalState: EmotionalState;
  onGuidanceComplete: (response: UserResponse) => void;
}

// Key Features:
// - Context-aware message selection
// - Progress celebration mechanisms
// - Emotional tone adaptation
// - Accessibility-first interactions
```

### Service Layer (packages/shared)

#### EmotionalAnalyticsService Class

```typescript
class EmotionalAnalyticsService {
  // Emotional impact measurement
  async trackAnxietyLevel(userId: string, level: number, context: string): Promise<void>
  async measureEngagement(userId: string, sessionData: SessionData): Promise<EngagementMetrics>
  async analyzeConversionFunnel(userId: string, funnelData: FunnelData): Promise<ConversionAnalysis>

  // Performance monitoring
  async monitorAnimationPerformance(componentId: string, metrics: PerformanceMetrics): Promise<void>
  async trackAccessibilityCompliance(componentId: string, audit: AccessibilityAudit): Promise<void>
}
```

#### SofiaGuidanceService Class

```typescript
class SofiaGuidanceService {
  // Dialog management
  async getContextualGuidance(phase: OnboardingPhase, context: UserContext): Promise<GuidanceResponse>
  async adaptToEmotionalState(state: EmotionalState): Promise<AdaptedGuidance>

  // Progress celebration
  async generateCelebration(milestone: Milestone): Promise<CelebrationContent>
  async trackGuidanceEffectiveness(guidanceId: string, outcome: GuidanceOutcome): Promise<void>
}
```

### Business Logic Layer (packages/logic)

#### EmotionalStateTracker

```typescript
// User emotional state management and adaptation
export class EmotionalStateTracker {
  async assessEmotionalState(userId: string, interactions: UserInteraction[]): Promise<EmotionalState>
  async adaptInterface(state: EmotionalState): Promise<InterfaceAdaptation>
  async predictEmotionalJourney(userId: string, currentState: EmotionalState): Promise<JourneyPrediction>
}
```

#### OnboardingFlowEngine

```typescript
// 3-act onboarding orchestration
export class OnboardingFlowEngine {
  async initializeFlow(userId: string): Promise<FlowInitialization>
  async advanceAct(currentAct: ActNumber, completionData: CompletionData): Promise<NextAct>
  async handleEmotionalIntervention(state: EmotionalState): Promise<Intervention>
  async measureFlowEffectiveness(flowId: string): Promise<EffectivenessMetrics>
}
```

## Animation Architecture

### Performance-Optimized Animation System

```typescript
// Core animation engine with performance budgets
class AnimationEngine {
  private animations: Map<string, AnimationInstance> = new Map();
  private performanceBudget = {
    fps: 60,
    memory: 50 * 1024 * 1024, // 50MB
    cpu: 0.1 // 10% CPU budget
  };

  scheduleAnimation(id: string, config: AnimationConfig): AnimationHandle {
    // Performance checking
    if (!this.checkPerformanceBudget(config)) {
      return this.createReducedAnimation(id, config);
    }

    // WebGL vs Canvas selection
    const renderer = this.selectOptimalRenderer(config);
    return this.createAnimation(id, config, renderer);
  }

  private checkPerformanceBudget(config: AnimationConfig): boolean {
    const estimatedCost = this.estimateAnimationCost(config);
    return this.currentLoad + estimatedCost <= this.performanceBudget.cpu;
  }
}
```

### Emotional Animation Library

```typescript
// Predefined emotional animation patterns
const emotionalAnimations = {
  calmingPulse: {
    duration: 2000,
    easing: 'ease-in-out',
    scale: [1, 1.05, 1],
    emotional: 'reassuring'
  },

  celebrationBurst: {
    duration: 800,
    easing: 'ease-out',
    scale: [1, 1.2],
    particles: 12,
    emotional: 'joyful'
  },

  gentleFloat: {
    duration: 3000,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    translateY: [-2, 2, -2],
    emotional: 'peaceful'
  }
};
```

## Data Architecture

### Emotional Metrics Schema

```sql
-- User emotional journey tracking
CREATE TABLE user_emotional_journey (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  session_id TEXT NOT NULL,
  phase onboarding_phase NOT NULL,
  anxiety_level INTEGER CHECK (anxiety_level >= 1 AND anxiety_level <= 5),
  confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 5),
  engagement_score DECIMAL(3,2) CHECK (engagement_score >= 0 AND engagement_score <= 1),
  interaction_type TEXT NOT NULL,
  interaction_data JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW(),

  -- Partitioning for performance
  PARTITION BY RANGE (timestamp)
);

-- Animation performance monitoring
CREATE TABLE animation_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  component_id TEXT NOT NULL,
  fps DECIMAL(5,2),
  memory_usage INTEGER, -- bytes
  cpu_usage DECIMAL(3,2),
  device_info JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Sofia interaction tracking
CREATE TABLE sofia_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  phase onboarding_phase NOT NULL,
  guidance_type TEXT NOT NULL,
  user_response TEXT,
  helpfulness_rating INTEGER CHECK (helpfulness_rating >= 1 AND helpfulness_rating <= 5),
  emotional_impact TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security Policies

```sql
-- Emotional data is personal and sensitive
ALTER TABLE user_emotional_journey ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own emotional data" ON user_emotional_journey
  FOR ALL USING (auth.uid() = user_id);

-- Performance metrics for system optimization
ALTER TABLE animation_performance_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own performance data" ON animation_performance_metrics
  FOR SELECT USING (auth.uid() = user_id);

-- Sofia interactions for improvement
ALTER TABLE sofia_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their own Sofia interactions" ON sofia_interactions
  FOR ALL USING (auth.uid() = user_id);
```

## API Architecture

### Emotional Analytics Endpoints

```text
GET    /api/emotional/journey          - User's emotional journey data
POST   /api/emotional/track            - Track emotional state change
GET    /api/emotional/metrics          - Aggregated emotional metrics
POST   /api/emotional/feedback         - User feedback on emotional experience

GET    /api/animation/performance      - Animation performance data
POST   /api/animation/report           - Report performance issue

GET    /api/sofia/guidance             - Get contextual guidance
POST   /api/sofia/interaction          - Record Sofia interaction
```

### Onboarding Flow Endpoints

```text
GET    /api/onboarding/status           - Current onboarding status
POST   /api/onboarding/advance          - Advance to next act/scene
POST   /api/onboarding/emotion          - Report emotional state
GET    /api/onboarding/personalization  - Get personalized content
```

## Integration Architecture

### Authentication Integration (Supabase Auth)

```typescript
// Emotional context in auth session
interface EmotionalAuthSession {
  emotionalState?: EmotionalState;
  onboardingProgress?: OnboardingProgress;
  personalizationFlags?: PersonalizationFlags;
}
```

### i18n Integration

```typescript
// Emotional content translation with cultural adaptation
interface EmotionalTranslation {
  key: string;
  baseEmotion: EmotionType;
  culturalAdaptations: Record<Locale, CulturalAdaptation>;
  accessibility: AccessibilityTranslation;
}
```

### Monitoring Integration

```typescript
// Emotional metrics in monitoring dashboard
interface EmotionalMonitoringDashboard {
  anxietyReduction: TrendData;
  completionRates: FunnelData;
  engagementHeatmap: HeatmapData;
  accessibilityCompliance: ComplianceData;
  performanceBudgets: BudgetData;
}
```

## Security Architecture

### Privacy-First Design

- **Anonymous Tracking**: Emotional data collected without PII
- **User Control**: Opt-in emotional tracking with clear consent
- **Data Minimization**: Only essential emotional metrics stored
- **Retention Limits**: Emotional data automatically purged after analysis

### Performance Security

- **Animation Sandboxing**: Animations run in isolated contexts
- **Resource Limits**: CPU/memory budgets prevent abuse
- **Audit Logging**: All emotional interactions logged for analysis
- **Rate Limiting**: Protection against automated testing abuse

## Performance Architecture

### Animation Optimization

- **WebGL Fallback**: Canvas fallback for WebGL-unavailable devices
- **Lazy Loading**: Animations load only when visible
- **Reduced Motion**: Respects user accessibility preferences
- **Performance Budgets**: Automatic complexity reduction on low-end devices

### Caching Strategy

- **Animation Assets**: CDN-cached animation resources
- **Emotional Content**: Personalized content cached with invalidation
- **Guidance Responses**: Frequently used guidance cached
- **Metrics Aggregation**: Pre-computed emotional analytics

### Monitoring & Observability

- **Real-time Metrics**: Animation performance and emotional engagement
- **Error Tracking**: Animation failures and emotional state errors
- **User Experience**: Session replay for emotional journey analysis
- **A/B Testing**: Emotional design variation performance tracking

## Deployment Architecture

### Environment Strategy

- **Development**: Full emotional features with debug overlays
- **Staging**: Performance testing and qualitative user sessions
- **Production**: Optimized emotional experience with monitoring

### CI/CD Integration

- **Performance Gates**: Animation performance tests in CI
- **Accessibility Checks**: Automated WCAG compliance testing
- **Emotional Testing**: Automated emotional journey validation
- **Bundle Analysis**: Emotional component size monitoring

### Scaling Strategy

- **Edge Deployment**: Global CDN for animation assets
- **Stateless Services**: Emotional services scale horizontally
- **Caching Layers**: Redis for emotional personalization
- **Analytics Pipeline**: Scalable emotional metrics processing

## Migration & Compatibility

### Hollywood Migration

- **Animation System**: Port existing firefly and night sky implementations
- **Emotional Components**: Migrate calming interactions and guidance systems
- **Performance Optimizations**: Carry forward Hollywood's performance lessons
- **Accessibility Features**: Preserve and enhance existing accessibility work

### Backward Compatibility

- **Graceful Degradation**: Emotional features work without JavaScript
- **Progressive Enhancement**: Layered emotional experience building
- **Feature Flags**: Controlled rollout of emotional enhancements
- **Fallback Content**: Non-emotional experience for unsupported browsers

This architecture provides a solid foundation for delivering Schwalbe's Emotional Core MVP, balancing technical excellence with deep emotional resonance and measurable user impact.
